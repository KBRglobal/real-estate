import sharp from "sharp";

// Image size presets by category
const SIZE_PRESETS = {
  hero: { width: 1920, height: 1080, quality: 85 },
  gallery: { width: 1200, height: 800, quality: 80 },
  "floor-plans": { width: 1600, height: 1200, quality: 90 },
  documents: null, // Don't process documents (PDFs, etc.)
  extracted: { width: 800, height: 600, quality: 75 },
  classified: { width: 800, height: 600, quality: 75 },
  thumbnail: { width: 400, height: 300, quality: 70 },
} as const;

type ImageCategory = keyof typeof SIZE_PRESETS;

export interface OptimizedImage {
  buffer: Buffer;
  width: number;
  height: number;
  format: "webp";
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
}

/**
 * Check if the content type is an optimizable image
 */
export function isOptimizableImage(contentType: string): boolean {
  const optimizableTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/tiff",
    "image/avif",
  ];
  return optimizableTypes.includes(contentType.toLowerCase());
}

/**
 * Optimize an image: resize and convert to WebP
 */
export async function optimizeImage(
  inputBuffer: Buffer,
  category: string,
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  }
): Promise<OptimizedImage> {
  const originalSize = inputBuffer.length;

  // Get preset for category or use custom options
  const preset = SIZE_PRESETS[category as ImageCategory];

  // If no preset (like documents), return original
  if (preset === null) {
    throw new Error(`Category "${category}" does not support image optimization`);
  }

  const maxWidth = options?.maxWidth || preset?.width || 1200;
  const maxHeight = options?.maxHeight || preset?.height || 800;
  const quality = options?.quality || preset?.quality || 80;

  // Get original image metadata
  const metadata = await sharp(inputBuffer).metadata();

  // Calculate dimensions maintaining aspect ratio
  let targetWidth = metadata.width || maxWidth;
  let targetHeight = metadata.height || maxHeight;

  // Only resize if image is larger than max dimensions
  if (targetWidth > maxWidth || targetHeight > maxHeight) {
    const aspectRatio = targetWidth / targetHeight;

    if (targetWidth > maxWidth) {
      targetWidth = maxWidth;
      targetHeight = Math.round(maxWidth / aspectRatio);
    }

    if (targetHeight > maxHeight) {
      targetHeight = maxHeight;
      targetWidth = Math.round(maxHeight * aspectRatio);
    }
  }

  // Process image
  const optimizedBuffer = await sharp(inputBuffer)
    .resize(targetWidth, targetHeight, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality,
      effort: 4, // Balance between speed and compression (0-6)
      smartSubsample: true,
    })
    .toBuffer();

  // Get final dimensions
  const finalMetadata = await sharp(optimizedBuffer).metadata();

  return {
    buffer: optimizedBuffer,
    width: finalMetadata.width || targetWidth,
    height: finalMetadata.height || targetHeight,
    format: "webp",
    originalSize,
    optimizedSize: optimizedBuffer.length,
    compressionRatio: Number((originalSize / optimizedBuffer.length).toFixed(2)),
  };
}

/**
 * Generate a thumbnail from an image
 */
export async function generateThumbnail(
  inputBuffer: Buffer,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
  }
): Promise<OptimizedImage> {
  const originalSize = inputBuffer.length;
  const width = options?.width || 400;
  const height = options?.height || 300;
  const quality = options?.quality || 70;

  const thumbnailBuffer = await sharp(inputBuffer)
    .resize(width, height, {
      fit: "cover",
      position: "center",
    })
    .webp({
      quality,
      effort: 4,
    })
    .toBuffer();

  const metadata = await sharp(thumbnailBuffer).metadata();

  return {
    buffer: thumbnailBuffer,
    width: metadata.width || width,
    height: metadata.height || height,
    format: "webp",
    originalSize,
    optimizedSize: thumbnailBuffer.length,
    compressionRatio: Number((originalSize / thumbnailBuffer.length).toFixed(2)),
  };
}

/**
 * Get image dimensions without processing
 */
export async function getImageDimensions(
  inputBuffer: Buffer
): Promise<{ width: number; height: number }> {
  const metadata = await sharp(inputBuffer).metadata();
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
  };
}
