import { Router, Request, Response } from "express";
import { randomUUID } from "crypto";
import multer from "multer";
import { storage } from "../storage";
import { isR2Configured, getR2Service } from "../services/cloudflare-r2";
import { optimizeImage, isOptimizableImage, generateThumbnail } from "../services/image-optimizer";
import type { InsertMedia } from "@shared/schema";
import { requireAuth } from "../auth";

const router = Router();

// Configure multer for memory storage (files stay in memory for processing)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
});

// Valid folders for file organization
const VALID_FOLDERS = ["hero", "gallery", "floor-plans", "documents", "extracted", "classified"] as const;
type MediaFolder = typeof VALID_FOLDERS[number];

/**
 * Check media service status
 * GET /api/media/status
 */
router.get("/status", (req: Request, res: Response) => {
  res.json({
    r2Configured: isR2Configured(),
    databaseConnected: true,
  });
});

/**
 * Get presigned upload URL and create media record
 * POST /api/media/upload
 * Body: { filename, contentType, size?, folder?, altText? }
 */
router.post("/upload", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isR2Configured()) {
      return res.status(503).json({
        error: "Cloudflare R2 not configured",
        message: "Cloudflare R2 environment variables are not set",
      });
    }

    const { filename, contentType, size, folder: folderName, altText } = req.body;

    // Validate required fields
    if (!filename || !contentType) {
      return res.status(400).json({
        error: "Missing required fields: filename, contentType",
      });
    }

    // Validate file size (max 50MB)
    if (size && size > 50 * 1024 * 1024) {
      return res.status(400).json({
        error: "File too large. Maximum size is 50MB",
      });
    }

    // Validate content type (SVG excluded due to XSS risk)
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
    ];
    if (!allowedTypes.includes(contentType)) {
      return res.status(400).json({
        error: "Invalid file type. Allowed: JPEG, PNG, GIF, WebP, PDF",
      });
    }

    // Get presigned URL from R2
    const r2 = getR2Service();
    const result = await r2.getUploadUrl({
      fileName: filename,
      contentType,
      folder: folderName || "general",
    });

    // Create media record in database
    const mediaData: InsertMedia = {
      name: filename,
      type: contentType,
      url: result.publicUrl,
      size: size || 0,
      altText: altText || filename.split(".")[0],
      folder: folderName || "general",
    };

    const mediaRecord = await storage.createMedia(mediaData);

    res.json({
      uploadURL: result.uploadUrl,
      url: result.publicUrl,
      mediaId: mediaRecord.id,
    });
  } catch (error) {
    console.error("Media upload URL error:", error);
    res.status(500).json({
      error: "Failed to generate upload URL",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Upload and optimize image (server-side processing)
 * POST /api/media/upload-optimized
 * FormData: file, folder?, altText?
 *
 * This endpoint:
 * 1. Receives the file
 * 2. Converts images to WebP format
 * 3. Resizes based on category presets
 * 4. Uploads optimized image to R2
 * 5. Creates database record
 */
router.post("/upload-optimized", requireAuth, upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!isR2Configured()) {
      return res.status(503).json({
        error: "Cloudflare R2 not configured",
        message: "Cloudflare R2 environment variables are not set",
      });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const { folder: folderName, altText } = req.body;

    const r2 = getR2Service();
    const folder = folderName || "general";
    let finalBuffer = file.buffer;
    let finalMimeType = file.mimetype;
    let finalFilename = file.originalname;
    let width: number | undefined;
    let height: number | undefined;
    let optimizationInfo: Record<string, unknown> | undefined;

    // Optimize if it's an optimizable image (not PDF, not SVG)
    if (isOptimizableImage(file.mimetype) && folder !== "documents") {
      try {
        const optimized = await optimizeImage(file.buffer, folder);
        finalBuffer = optimized.buffer;
        finalMimeType = "image/webp";
        finalFilename = file.originalname.replace(/\.[^.]+$/, ".webp");
        width = optimized.width;
        height = optimized.height;
        optimizationInfo = {
          originalSize: optimized.originalSize,
          optimizedSize: optimized.optimizedSize,
          compressionRatio: optimized.compressionRatio,
          format: optimized.format,
        };
      } catch (optimizeError) {
        console.error("Image optimization failed, using original:", optimizeError);
        // Fall back to original file
      }
    }

    // Upload to R2
    const uploadResult = await r2.uploadFile({
      buffer: finalBuffer,
      fileName: finalFilename,
      contentType: finalMimeType,
      folder,
    });

    // Create database record
    const mediaData: InsertMedia = {
      name: file.originalname,
      type: finalMimeType,
      url: uploadResult.publicUrl,
      size: finalBuffer.length,
      altText: altText || file.originalname.split(".")[0],
      folder: folderName || "general",
    };

    const mediaRecord = await storage.createMedia(mediaData);

    res.json({
      success: true,
      media: mediaRecord,
      optimization: optimizationInfo,
    });
  } catch (error) {
    console.error("Optimized upload error:", error);
    res.status(500).json({
      error: "Failed to upload and optimize file",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Confirm upload completed (optional - update metadata)
 * POST /api/media/:id/confirm
 * Body: { width?: number, height?: number, metadata?: object }
 */
router.post("/:id/confirm", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const mediaItem = await storage.getMediaById(id);

    if (!mediaItem) {
      return res.status(404).json({ error: "Media not found" });
    }

    res.json(mediaItem);
  } catch (error) {
    console.error("Media confirm error:", error);
    res.status(500).json({ error: "Failed to confirm upload" });
  }
});

/**
 * Get media by folder
 * GET /api/media/folder/:folder
 */
router.get("/folder/:folder", async (req: Request, res: Response) => {
  try {
    const { folder } = req.params;
    const mediaItems = await storage.getMediaByFolder(folder);
    res.json(mediaItems);
  } catch (error) {
    console.error("Get media error:", error);
    res.status(500).json({ error: "Failed to get media" });
  }
});

/**
 * Sync media from R2 storage
 * POST /api/media/sync-r2
 * Scans all files in R2 and creates DB records for any that don't exist yet.
 */
router.post("/sync-r2", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isR2Configured()) {
      return res.status(503).json({
        error: "Cloudflare R2 not configured",
        message: "Cloudflare R2 environment variables are not set",
      });
    }

    const r2 = getR2Service();

    // List all files in R2 (up to 10,000)
    const { files } = await r2.listFiles("", 10000);

    // Get all existing media from DB
    const existingMedia = await storage.getAllMedia();

    // Clean up any empty/invalid records in DB first
    let cleaned = 0;
    for (const item of existingMedia) {
      if (!item.name || item.name.trim() === "" || (item.size === 0 && item.url.endsWith("/"))) {
        try {
          await storage.deleteMedia(item.id);
          cleaned++;
        } catch (e) { /* ignore */ }
      }
    }

    // Rebuild valid list after cleanup
    const validMedia = existingMedia.filter(
      (m) => m.name && m.name.trim() !== "" && !(m.size === 0 && m.url.endsWith("/"))
    );
    const existingUrls = new Set(validMedia.map((m) => m.url));

    // Find files in R2 that are not in the DB
    let synced = 0;
    const newMedia: any[] = [];
    let skipped = 0;

    for (const file of files) {
      // Skip folder entries (keys ending with "/" or empty file name)
      if (file.key.endsWith("/")) { skipped++; continue; }
      const parts = file.key.split("/");
      const fileName = parts[parts.length - 1];
      if (!fileName || fileName.trim() === "") { skipped++; continue; }

      // Skip files with size 0 (likely folder markers)
      if (file.size === 0) { skipped++; continue; }

      if (existingUrls.has(file.publicUrl)) continue;

      // Determine type from file extension
      const ext = fileName.split(".").pop()?.toLowerCase() || "";
      let mimeType = "application/octet-stream";
      if (["jpg", "jpeg"].includes(ext)) mimeType = "image/jpeg";
      else if (ext === "png") mimeType = "image/png";
      else if (ext === "webp") mimeType = "image/webp";
      else if (ext === "gif") mimeType = "image/gif";
      else if (ext === "svg") mimeType = "image/svg+xml";
      else if (ext === "pdf") mimeType = "application/pdf";
      else if (ext === "mp4") mimeType = "video/mp4";
      else if (ext === "mov") mimeType = "video/quicktime";
      else if (ext === "avif") mimeType = "image/avif";

      // Extract folder from key (e.g., "hero/uuid.webp" -> "hero")
      const folder = parts.length > 1 ? parts[0] : "general";

      const mediaData: InsertMedia = {
        name: fileName,
        type: mimeType,
        url: file.publicUrl,
        size: file.size,
        altText: fileName.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
        folder,
      };

      try {
        const record = await storage.createMedia(mediaData);
        newMedia.push(record);
        synced++;
      } catch (createErr) {
        console.error(`Failed to create media record for ${file.key}:`, createErr);
      }
    }

    res.json({
      success: true,
      totalR2Files: files.length,
      skippedFolders: skipped,
      existingInDb: validMedia.length,
      cleanedInvalid: cleaned,
      newlySynced: synced,
      media: newMedia,
    });
  } catch (error) {
    console.error("R2 sync error:", error);
    res.status(500).json({
      error: "Failed to sync from R2",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Update media order (for gallery reordering)
 * PUT /api/media/reorder
 * Body: { updates: [{ id: string, displayOrder: number }] }
 */
/**
 * Update media metadata
 * PATCH /api/media/:id
 * Body: { altText?: string }
 */
router.patch("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { altText } = req.body;

    const updated = await storage.updateMedia(id, {
      altText,
    });

    if (!updated) {
      return res.status(404).json({ error: "Media not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Update media error:", error);
    res.status(500).json({ error: "Failed to update media" });
  }
});

/**
 * Delete media (from R2 and database)
 * DELETE /api/media/:id
 */
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get media record
    const mediaItem = await storage.getMediaById(id);
    if (!mediaItem) {
      return res.status(404).json({ error: "Media not found" });
    }

    // Delete from R2 if configured and URL is from R2
    if (isR2Configured() && mediaItem.url) {
      try {
        const r2 = getR2Service();
        // Extract object key from URL
        const urlObj = new URL(mediaItem.url);
        const objectKey = urlObj.pathname.slice(1); // Remove leading /
        if (objectKey) {
          await r2.deleteFile(objectKey);
        }
      } catch (r2Error) {
        console.error("R2 delete error:", r2Error);
        // Continue with database deletion even if R2 fails
      }
    }

    // Delete from database
    const deleted = await storage.deleteMedia(id);

    if (!deleted) {
      return res.status(500).json({ error: "Failed to delete from database" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Delete media error:", error);
    res.status(500).json({ error: "Failed to delete media" });
  }
});

export default router;
