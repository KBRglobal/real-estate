import { Router, Request, Response } from "express";
import { isR2Configured, getR2Service } from "../services/cloudflare-r2";
import { requireAuth } from "../auth";

const router = Router();

/**
 * Check if R2 is configured
 * GET /api/r2/status
 */
router.get("/status", (req: Request, res: Response) => {
  res.json({
    configured: isR2Configured(),
    provider: "cloudflare-r2",
  });
});

/**
 * Request a presigned upload URL
 * POST /api/r2/upload-url
 * Body: { name: string, contentType: string, size?: number }
 */
router.post("/upload-url", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isR2Configured()) {
      return res.status(503).json({
        error: "Cloudflare R2 not configured",
        message: "Cloudflare R2 environment variables are not set",
      });
    }

    const { name, contentType, size, folder, category } = req.body;

    if (!name || !contentType) {
      return res.status(400).json({
        error: "Missing required fields: name and contentType",
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

    // Determine folder path based on category
    // Categories: hero, gallery, floor-plans, documents, site
    const validCategories = ["hero", "gallery", "floor-plans", "documents", "site", "extracted", "classified"];
    const baseFolder = folder || "projects";
    const subFolder = category && validCategories.includes(category) ? category : null;
    const fullFolder = subFolder ? `${baseFolder}/${subFolder}` : baseFolder;

    const r2 = getR2Service();
    const result = await r2.getUploadUrl({
      fileName: name,
      contentType,
      folder: fullFolder,
    });

    res.json({
      uploadURL: result.uploadUrl,
      objectPath: result.publicUrl,
      objectKey: result.objectKey,
    });
  } catch (error) {
    console.error("R2 upload URL error:", error);
    res.status(500).json({
      error: "Failed to generate upload URL",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Delete a file
 * DELETE /api/r2/file/:objectKey
 */
router.delete("/file/*", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isR2Configured()) {
      return res.status(503).json({ error: "Cloudflare R2 not configured" });
    }

    const objectKey = req.params[0];
    if (!objectKey) {
      return res.status(400).json({ error: "Object key required" });
    }

    const r2 = getR2Service();
    await r2.deleteFile(objectKey);

    res.json({ success: true });
  } catch (error) {
    console.error("R2 delete error:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

export default router;
