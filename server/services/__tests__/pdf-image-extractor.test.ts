import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock pdfjs-dist before importing the module
vi.mock("pdfjs-dist", () => ({
  GlobalWorkerOptions: { workerSrc: "" },
  getDocument: vi.fn(),
}));

// Mock sharp
vi.mock("sharp", () => {
  const mockSharp = vi.fn(() => ({
    resize: vi.fn().mockReturnThis(),
    jpeg: vi.fn().mockReturnThis(),
    toBuffer: vi.fn().mockResolvedValue(Buffer.from("mock-jpeg-data")),
    metadata: vi.fn().mockResolvedValue({ width: 800, height: 600 }),
  }));
  return { default: mockSharp };
});

// Mock Cloudflare R2 service
vi.mock("../cloudflare-r2", () => ({
  isR2Configured: () => false,
  getR2Service: () => ({
    uploadFile: vi.fn().mockResolvedValue({ publicUrl: "https://cdn.ddl-uae.com/test.jpg" }),
  }),
}));

import { extractImagesFromPdf, type ExtractedImage } from "../pdf-image-extractor";
import * as pdfjsLib from "pdfjs-dist";
import sharp from "sharp";

describe("PDF Image Extractor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("extractImagesFromPdf", () => {
    it("should return empty array for empty PDF buffer", async () => {
      const mockPdf = {
        numPages: 0,
      };

      vi.mocked(pdfjsLib.getDocument).mockReturnValue({
        promise: Promise.resolve(mockPdf),
      } as any);

      const result = await extractImagesFromPdf(Buffer.from("fake-pdf"), "test-prospect-id");

      expect(result).toEqual([]);
    });

    it("should extract images from a PDF page", async () => {
      const mockImageData = new Uint8Array(800 * 600 * 3); // RGB image data

      const mockPage = {
        getOperatorList: vi.fn().mockResolvedValue({
          fnArray: [85], // OPS.paintImageXObject
          argsArray: [["img1"]],
        }),
        commonObjs: {
          get: vi.fn(),
        },
        objs: {
          get: vi.fn().mockReturnValue({
            data: mockImageData,
            width: 800,
            height: 600,
          }),
        },
      };

      const mockPdf = {
        numPages: 1,
        getPage: vi.fn().mockResolvedValue(mockPage),
      };

      vi.mocked(pdfjsLib.getDocument).mockReturnValue({
        promise: Promise.resolve(mockPdf),
      } as any);

      // Set up object storage to be configured
      process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID = "test-bucket";

      const result = await extractImagesFromPdf(Buffer.from("fake-pdf"), "test-prospect-id");

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        page: 1,
        format: "jpeg",
        width: 800,
        height: 600,
      });
      expect(result[0].url).toContain("https://storage.example.com");
    });

    it("should skip images that are too small", async () => {
      const mockSmallImageData = new Uint8Array(50 * 50 * 3); // Small 50x50 RGB image

      const mockPage = {
        getOperatorList: vi.fn().mockResolvedValue({
          fnArray: [85],
          argsArray: [["img1"]],
        }),
        commonObjs: {
          get: vi.fn(),
        },
        objs: {
          get: vi.fn().mockReturnValue({
            data: mockSmallImageData,
            width: 50,
            height: 50,
          }),
        },
      };

      const mockPdf = {
        numPages: 1,
        getPage: vi.fn().mockResolvedValue(mockPage),
      };

      vi.mocked(pdfjsLib.getDocument).mockReturnValue({
        promise: Promise.resolve(mockPdf),
      } as any);

      const result = await extractImagesFromPdf(Buffer.from("fake-pdf"), "test-prospect-id");

      expect(result).toHaveLength(0);
    });

    it("should limit images to MAX_IMAGES_PER_PDF (50)", async () => {
      // Create 60 images worth of operator list entries
      const fnArray = new Array(60).fill(85);
      const argsArray = new Array(60).fill(0).map((_, i) => [`img${i}`]);

      const mockImageData = new Uint8Array(800 * 600 * 3);

      const mockPage = {
        getOperatorList: vi.fn().mockResolvedValue({
          fnArray,
          argsArray,
        }),
        commonObjs: {
          get: vi.fn(),
        },
        objs: {
          get: vi.fn().mockReturnValue({
            data: mockImageData,
            width: 800,
            height: 600,
          }),
        },
      };

      const mockPdf = {
        numPages: 1,
        getPage: vi.fn().mockResolvedValue(mockPage),
      };

      vi.mocked(pdfjsLib.getDocument).mockReturnValue({
        promise: Promise.resolve(mockPdf),
      } as any);

      process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID = "test-bucket";

      const result = await extractImagesFromPdf(Buffer.from("fake-pdf"), "test-prospect-id");

      expect(result.length).toBeLessThanOrEqual(50);
    });

    it("should handle PDF loading errors gracefully", async () => {
      vi.mocked(pdfjsLib.getDocument).mockReturnValue({
        promise: Promise.reject(new Error("PDF parsing failed")),
      } as any);

      const result = await extractImagesFromPdf(Buffer.from("invalid-pdf"), "test-prospect-id");

      expect(result).toEqual([]);
    });

    it("should handle page processing errors gracefully", async () => {
      const mockPdf = {
        numPages: 2,
        getPage: vi.fn()
          .mockRejectedValueOnce(new Error("Page 1 error"))
          .mockResolvedValueOnce({
            getOperatorList: vi.fn().mockResolvedValue({
              fnArray: [],
              argsArray: [],
            }),
            commonObjs: { get: vi.fn() },
            objs: { get: vi.fn() },
          }),
      };

      vi.mocked(pdfjsLib.getDocument).mockReturnValue({
        promise: Promise.resolve(mockPdf),
      } as any);

      // Should not throw and should continue processing other pages
      const result = await extractImagesFromPdf(Buffer.from("fake-pdf"), "test-prospect-id");

      expect(result).toEqual([]);
      expect(mockPdf.getPage).toHaveBeenCalledTimes(2);
    });

    it("should fall back to data URL when object storage is not configured", async () => {
      const mockImageData = new Uint8Array(800 * 600 * 3);

      const mockPage = {
        getOperatorList: vi.fn().mockResolvedValue({
          fnArray: [85],
          argsArray: [["img1"]],
        }),
        commonObjs: {
          get: vi.fn(),
        },
        objs: {
          get: vi.fn().mockReturnValue({
            data: mockImageData,
            width: 800,
            height: 600,
          }),
        },
      };

      const mockPdf = {
        numPages: 1,
        getPage: vi.fn().mockResolvedValue(mockPage),
      };

      vi.mocked(pdfjsLib.getDocument).mockReturnValue({
        promise: Promise.resolve(mockPdf),
      } as any);

      // No object storage configured
      delete process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
      delete process.env.GOOGLE_CLOUD_STORAGE_BUCKET;

      const result = await extractImagesFromPdf(Buffer.from("fake-pdf"), "test-prospect-id");

      expect(result).toHaveLength(1);
      expect(result[0].url).toMatch(/^data:image\/jpeg;base64,/);
    });

    it("should process inline images (OPS code 86)", async () => {
      const mockInlineImageData = {
        data: new Uint8Array(800 * 600 * 3),
        width: 800,
        height: 600,
      };

      const mockPage = {
        getOperatorList: vi.fn().mockResolvedValue({
          fnArray: [86], // OPS.paintInlineImageXObject
          argsArray: [[mockInlineImageData]],
        }),
        commonObjs: {
          get: vi.fn(),
        },
        objs: {
          get: vi.fn(),
        },
      };

      const mockPdf = {
        numPages: 1,
        getPage: vi.fn().mockResolvedValue(mockPage),
      };

      vi.mocked(pdfjsLib.getDocument).mockReturnValue({
        promise: Promise.resolve(mockPdf),
      } as any);

      process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID = "test-bucket";

      const result = await extractImagesFromPdf(Buffer.from("fake-pdf"), "test-prospect-id");

      expect(result).toHaveLength(1);
    });
  });
});
