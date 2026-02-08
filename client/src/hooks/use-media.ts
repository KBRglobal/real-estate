import { useState, useCallback } from "react";
import { csrfFetch } from "@/lib/queryClient";

export type MediaCategory = "hero" | "gallery" | "floor-plans" | "documents" | "extracted" | "classified";
export type EntityType = "project" | "prospect";

export interface MediaItem {
  id: string;
  name: string;
  type: string;
  url: string;
  thumbnailUrl: string | null;
  size: number | null;
  altText: string | null;
  folder: string | null;
  createdAt: string;
}

interface UploadResponse {
  uploadURL?: string;
  url: string;
  mediaId: string;
}

interface OptimizedUploadResponse {
  success: boolean;
  media: MediaItem;
  optimization?: {
    originalSize: number;
    optimizedSize: number;
    compressionRatio: number;
    format: string;
  };
}

// Image types that should be optimized
const OPTIMIZABLE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/tiff",
];

function isOptimizableImage(contentType: string): boolean {
  return OPTIMIZABLE_TYPES.includes(contentType.toLowerCase());
}

interface UseMediaOptions {
  onUploadSuccess?: (media: UploadResponse) => void;
  onUploadError?: (error: Error) => void;
  onDeleteSuccess?: () => void;
  onDeleteError?: (error: Error) => void;
}

/**
 * React hook for unified media management (R2 + Database)
 */
export function useMedia(options: UseMediaOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Upload a file with full tracking
   * Images are automatically optimized and converted to WebP
   */
  const uploadFile = useCallback(
    async (
      file: File,
      params: {
        entityType: EntityType;
        entityId?: string;
        category: MediaCategory;
        altText?: string;
      }
    ): Promise<UploadResponse | null> => {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      try {
        const contentType = file.type || "application/octet-stream";

        // Use optimized upload for images (except documents category)
        if (isOptimizableImage(contentType) && params.category !== "documents") {
          return await uploadOptimized(file, params);
        }

        // Use presigned URL flow for PDFs, SVGs, and other files
        return await uploadDirect(file, params);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Upload failed");
        setError(error);
        options.onUploadError?.(error);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [options]
  );

  /**
   * Upload with server-side optimization (WebP conversion + resize)
   */
  const uploadOptimized = async (
    file: File,
    params: {
      entityType: EntityType;
      entityId?: string;
      category: MediaCategory;
      altText?: string;
    },
  ): Promise<UploadResponse | null> => {
    setUploadProgress(10);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("entityType", params.entityType);
    if (params.entityId) formData.append("entityId", params.entityId);
    formData.append("category", params.category);
    if (params.altText) formData.append("altText", params.altText);

    setUploadProgress(30);

    const response = await csrfFetch("/api/media/upload-optimized", {
      method: "POST",
      body: formData,
    });

    setUploadProgress(80);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to upload optimized file");
    }

    const result: OptimizedUploadResponse = await response.json();
    setUploadProgress(100);

    const uploadData: UploadResponse = {
      url: result.media.url,
      mediaId: result.media.id,
    };

    options.onUploadSuccess?.(uploadData);
    return uploadData;
  };

  /**
   * Upload directly to R2 using presigned URL (for PDFs, SVGs, etc.)
   */
  const uploadDirect = async (
    file: File,
    params: {
      entityType: EntityType;
      entityId?: string;
      category: MediaCategory;
      altText?: string;
    },
  ): Promise<UploadResponse | null> => {
    // Step 1: Get presigned URL and create DB record
    setUploadProgress(10);
    const response = await csrfFetch("/api/media/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type || "application/octet-stream",
        size: file.size,
        entityType: params.entityType,
        entityId: params.entityId,
        category: params.category,
        altText: params.altText,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to get upload URL");
    }

    const uploadData: UploadResponse = await response.json();
    setUploadProgress(30);

    // Step 2: Upload file to R2
    if (!uploadData.uploadURL) {
      throw new Error("No upload URL provided");
    }

    const uploadResponse = await fetch(uploadData.uploadURL, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
    });

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload file to storage");
    }

    setUploadProgress(90);

    // Step 3: Confirm upload with image dimensions (for images)
    if (file.type.startsWith("image/")) {
      try {
        const dimensions = await getImageDimensions(file);
        await csrfFetch(`/api/media/${uploadData.mediaId}/confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dimensions),
        });
      } catch {
        // Non-critical, continue
      }
    }

    setUploadProgress(100);
    options.onUploadSuccess?.(uploadData);
    return uploadData;
  };

  /**
   * Upload multiple files
   */
  const uploadFiles = useCallback(
    async (
      files: File[],
      params: {
        entityType: EntityType;
        entityId?: string;
        category: MediaCategory;
      }
    ): Promise<UploadResponse[]> => {
      const results: UploadResponse[] = [];

      for (const file of files) {
        const result = await uploadFile(file, params);
        if (result) {
          results.push(result);
        }
      }

      return results;
    },
    [uploadFile]
  );

  /**
   * Get media for an entity
   */
  const getMedia = useCallback(
    async (
      entityType: EntityType,
      entityId: string,
      category?: MediaCategory
    ): Promise<MediaItem[]> => {
      const url = category
        ? `/api/media/${entityType}/${entityId}?category=${category}`
        : `/api/media/${entityType}/${entityId}`;

      const response = await fetch(url, { credentials: "include" });

      if (!response.ok) {
        throw new Error("Failed to fetch media");
      }

      return response.json();
    },
    []
  );

  /**
   * Update media order
   */
  const reorderMedia = useCallback(
    async (updates: Array<{ id: string; displayOrder: number }>): Promise<boolean> => {
      const response = await csrfFetch("/api/media/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });

      return response.ok;
    },
    []
  );

  /**
   * Delete media
   */
  const deleteMedia = useCallback(
    async (mediaId: string): Promise<boolean> => {
      try {
        const response = await csrfFetch(`/api/media/${mediaId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete media");
        }

        options.onDeleteSuccess?.();
        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Delete failed");
        options.onDeleteError?.(error);
        return false;
      }
    },
    [options]
  );

  /**
   * Update media metadata
   */
  const updateMedia = useCallback(
    async (
      mediaId: string,
      data: { altText?: string; metadata?: Record<string, unknown> }
    ): Promise<MediaItem | null> => {
      const response = await csrfFetch(`/api/media/${mediaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        return null;
      }

      return response.json();
    },
    []
  );

  return {
    uploadFile,
    uploadFiles,
    getMedia,
    reorderMedia,
    deleteMedia,
    updateMedia,
    isUploading,
    uploadProgress,
    error,
  };
}

/**
 * Get image dimensions from File
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
