import sharp from "sharp";
import { randomUUID } from "crypto";
import * as pdfjsLib from "pdfjs-dist";

// Configure pdfjs worker
if (typeof pdfjsLib.GlobalWorkerOptions !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "";
}

export interface ExtractedImage {
  page: number;
  url: string;
  width: number;
  height: number;
  format: string;
  alt?: string;
}

// Minimum dimensions to filter out icons and small graphics
const MIN_IMAGE_WIDTH = 100;
const MIN_IMAGE_HEIGHT = 100;
const MIN_IMAGE_AREA = 20000; // 100x200 or similar

// Maximum images to extract per PDF to avoid memory issues
const MAX_IMAGES_PER_PDF = 50;

// Image quality settings for optimization
const JPEG_QUALITY = 85;
const MAX_DIMENSION = 2000;

/**
 * Check if Cloudflare R2 storage is configured
 */
function isR2StorageConfigured(): boolean {
  return !!(
    process.env.CLOUDFLARE_ACCOUNT_ID &&
    process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
    process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY &&
    process.env.CLOUDFLARE_R2_BUCKET_NAME
  );
}

/**
 * Upload image buffer to Cloudflare R2 storage
 * Returns the public URL or a data URL if storage is not configured
 */
async function uploadImageToStorage(
  imageBuffer: Buffer,
  filename: string,
  prospectId: string
): Promise<string> {
  try {
    // Try to use Cloudflare R2 if configured
    if (isR2StorageConfigured()) {
      const { getR2Service } = await import("./cloudflare-r2");
      const r2 = getR2Service();
      const result = await r2.uploadFile({
        buffer: imageBuffer,
        fileName: filename,
        contentType: "image/jpeg",
        folder: `prospects/extracted/${prospectId}`,
      });
      return result.publicUrl;
    }

    console.warn(
      "[PDF Image Extractor] Cloudflare R2 not configured. Using base64 data URLs."
    );
    const base64 = imageBuffer.toString("base64");
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error("[PDF Image Extractor] Failed to upload image:", error);
    // Return data URL as fallback
    const base64 = imageBuffer.toString("base64");
    return `data:image/jpeg;base64,${base64}`;
  }
}

/**
 * Process and optimize an image buffer
 */
async function processImage(
  imageData: Uint8Array | Uint8ClampedArray,
  width: number,
  height: number,
  channels: number
): Promise<Buffer | null> {
  try {
    // Skip if image is too small
    if (width < MIN_IMAGE_WIDTH || height < MIN_IMAGE_HEIGHT) {
      return null;
    }

    if (width * height < MIN_IMAGE_AREA) {
      return null;
    }

    // Determine input format based on channels
    const inputFormat = channels === 4 ? "rgba" : channels === 3 ? "rgb" : null;
    if (!inputFormat) {
      console.warn(`[PDF Image Extractor] Unsupported channel count: ${channels}`);
      return null;
    }

    // Create sharp instance from raw pixel data
    let image = sharp(Buffer.from(imageData), {
      raw: {
        width,
        height,
        channels: channels as 3 | 4,
      },
    });

    // Resize if too large while maintaining aspect ratio
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      image = image.resize(MAX_DIMENSION, MAX_DIMENSION, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    // Convert to JPEG with optimization
    const optimized = await image
      .jpeg({
        quality: JPEG_QUALITY,
        progressive: true,
      })
      .toBuffer();

    return optimized;
  } catch (error) {
    console.error("[PDF Image Extractor] Failed to process image:", error);
    return null;
  }
}

/**
 * Extract images from PDF using pdfjs-dist
 */
export async function extractImagesFromPdf(
  pdfBuffer: Buffer,
  prospectId: string
): Promise<ExtractedImage[]> {
  console.log(`[PDF Image Extractor] Starting image extraction for prospect ${prospectId}`);

  const images: ExtractedImage[] = [];

  try {
    // Load PDF document
    const data = new Uint8Array(pdfBuffer);
    const loadingTask = pdfjsLib.getDocument({
      data,
      useSystemFonts: true,
      disableFontFace: true,
    });

    const pdf = await loadingTask.promise;
    console.log(`[PDF Image Extractor] PDF loaded: ${pdf.numPages} pages`);

    // Process each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      if (images.length >= MAX_IMAGES_PER_PDF) {
        console.log(`[PDF Image Extractor] Reached max images limit (${MAX_IMAGES_PER_PDF})`);
        break;
      }

      try {
        const page = await pdf.getPage(pageNum);
        const operatorList = await page.getOperatorList();
        const commonObjs = page.commonObjs;
        const objs = page.objs;

        // Look for image objects in the operator list
        for (let i = 0; i < operatorList.fnArray.length; i++) {
          if (images.length >= MAX_IMAGES_PER_PDF) break;

          const fn = operatorList.fnArray[i];
          const args = operatorList.argsArray[i];

          // OPS.paintImageXObject = 85, OPS.paintInlineImageXObject = 86
          if (fn === 85 || fn === 86) {
            const imageName = args[0];

            try {
              // Get image object
              let imageObj: any;
              if (fn === 85) {
                // XObject image
                try {
                  imageObj = objs.get(imageName);
                } catch {
                  imageObj = commonObjs.get(imageName);
                }
              } else {
                // Inline image
                imageObj = args[0];
              }

              if (!imageObj || !imageObj.data) {
                continue;
              }

              const width = imageObj.width;
              const height = imageObj.height;

              // Skip small images
              if (width < MIN_IMAGE_WIDTH || height < MIN_IMAGE_HEIGHT) {
                continue;
              }

              // Process the image
              const channels = imageObj.data.length / (width * height);
              const processedBuffer = await processImage(
                imageObj.data,
                width,
                height,
                Math.round(channels)
              );

              if (!processedBuffer) {
                continue;
              }

              // Get final dimensions
              const metadata = await sharp(processedBuffer).metadata();

              // Upload to storage
              const filename = `page${pageNum}_img${images.length + 1}_${randomUUID().slice(0, 8)}.jpg`;
              const url = await uploadImageToStorage(processedBuffer, filename, prospectId);

              images.push({
                page: pageNum,
                url,
                width: metadata.width || width,
                height: metadata.height || height,
                format: "jpeg",
                alt: `Image from page ${pageNum}`,
              });

              console.log(
                `[PDF Image Extractor] Extracted image from page ${pageNum}: ${metadata.width}x${metadata.height}`
              );
            } catch (imgError) {
              // Skip problematic images
              console.warn(
                `[PDF Image Extractor] Failed to extract image on page ${pageNum}:`,
                imgError instanceof Error ? imgError.message : imgError
              );
            }
          }
        }
      } catch (pageError) {
        console.warn(
          `[PDF Image Extractor] Failed to process page ${pageNum}:`,
          pageError instanceof Error ? pageError.message : pageError
        );
      }
    }

    console.log(`[PDF Image Extractor] Extraction complete: ${images.length} images extracted`);
    return images;
  } catch (error) {
    console.error("[PDF Image Extractor] Failed to extract images:", error);
    // Return empty array instead of failing completely
    return [];
  }
}
