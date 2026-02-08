import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const DEFAULT_PUBLIC_URL = "https://cdn.ddl-uae.com";

function resolveR2Config() {
  const raw = {
    secretKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "",
    bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME || "",
    publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL || "",
  };

  let secretKey = raw.secretKey;
  let bucketName = raw.bucketName;
  let publicUrl = raw.publicUrl;

  const looksLikeUrl = (v: string) => v.startsWith("http") || v.includes(".");
  const looksLikeHexKey = (v: string) => /^[0-9a-f]{32,}$/i.test(v);
  const looksLikeBucketName = (v: string) => /^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/.test(v);

  if (looksLikeUrl(raw.secretKey) && looksLikeHexKey(raw.bucketName) && looksLikeBucketName(raw.publicUrl)) {
    console.warn("[R2] Detected swapped env vars — auto-correcting. Please update your secrets to use the correct variable names.");
    secretKey = raw.bucketName;
    bucketName = raw.publicUrl;
    publicUrl = raw.secretKey;
  }

  if (!publicUrl || !looksLikeUrl(publicUrl)) {
    publicUrl = DEFAULT_PUBLIC_URL;
  }

  return {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || "",
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "",
    secretAccessKey: secretKey,
    bucketName: bucketName,
    publicUrl: publicUrl.replace(/\/$/, ""),
  };
}

const config = resolveR2Config();

export function isR2Configured(): boolean {
  return !!(config.accountId && config.accessKeyId && config.secretAccessKey && config.bucketName);
}

function getR2Client(): S3Client {
  if (!isR2Configured()) {
    throw new Error(
      "Cloudflare R2 not configured. Set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY, and CLOUDFLARE_R2_BUCKET_NAME"
    );
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

export class CloudflareR2Service {
  private client: S3Client;
  private bucketName: string;

  constructor() {
    this.client = getR2Client();
    this.bucketName = config.bucketName;
  }

  async getUploadUrl(options: {
    fileName: string;
    contentType: string;
    folder?: string;
    expiresIn?: number;
  }): Promise<{ uploadUrl: string; objectKey: string; publicUrl: string }> {
    const { fileName, contentType, folder = "uploads", expiresIn = 900 } = options;

    const fileExtension = fileName.split(".").pop() || "";
    const uniqueId = randomUUID();
    const objectKey = `${folder}/${uniqueId}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: objectKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn });
    const publicUrl = `${config.publicUrl}/${objectKey}`;

    return { uploadUrl, objectKey, publicUrl };
  }

  async getDownloadUrl(objectKey: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: objectKey,
    });

    return getSignedUrl(this.client, command, { expiresIn });
  }

  async uploadFile(options: {
    buffer: Buffer;
    fileName: string;
    contentType: string;
    folder?: string;
  }): Promise<{ objectKey: string; publicUrl: string }> {
    const { buffer, fileName, contentType, folder = "uploads" } = options;

    const fileExtension = fileName.split(".").pop() || "";
    const uniqueId = randomUUID();
    const objectKey = `${folder}/${uniqueId}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: objectKey,
      Body: buffer,
      ContentType: contentType,
    });

    await this.client.send(command);
    const publicUrl = `${config.publicUrl}/${objectKey}`;

    return { objectKey, publicUrl };
  }

  async deleteFile(objectKey: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: objectKey,
    });

    await this.client.send(command);
  }

  async fileExists(objectKey: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: objectKey,
      });

      await this.client.send(command);
      return true;
    } catch (error) {
      return false;
    }
  }

  async getFileMetadata(objectKey: string): Promise<{
    contentType: string;
    contentLength: number;
    lastModified: Date;
  } | null> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: objectKey,
      });

      const response = await this.client.send(command);
      return {
        contentType: response.ContentType || "application/octet-stream",
        contentLength: response.ContentLength || 0,
        lastModified: response.LastModified || new Date(),
      };
    } catch (error) {
      return null;
    }
  }

  async listFiles(prefix: string, maxKeys: number = 1000): Promise<{
    files: Array<{ key: string; size: number; lastModified: Date; publicUrl: string }>;
    folders: string[];
  }> {
    const allFiles: Array<{ key: string; size: number; lastModified: Date; publicUrl: string }> = [];
    const allFolders = new Set<string>();
    let continuationToken: string | undefined;

    do {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
        MaxKeys: Math.min(maxKeys - allFiles.length, 1000),
        ContinuationToken: continuationToken,
      });

      const response = await this.client.send(command);

      if (response.Contents) {
        for (const item of response.Contents) {
          if (!item.Key) continue;
          allFiles.push({
            key: item.Key,
            size: item.Size || 0,
            lastModified: item.LastModified || new Date(),
            publicUrl: `${config.publicUrl}/${item.Key}`,
          });
        }
      }

      if (response.CommonPrefixes) {
        for (const p of response.CommonPrefixes) {
          if (p.Prefix) allFolders.add(p.Prefix);
        }
      }

      continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
    } while (continuationToken && allFiles.length < maxKeys);

    return { files: allFiles, folders: Array.from(allFolders) };
  }

  getPublicUrl(objectKey: string): string {
    return `${config.publicUrl}/${objectKey}`;
  }
}

let r2Service: CloudflareR2Service | null = null;

export function getR2Service(): CloudflareR2Service {
  if (!r2Service) {
    r2Service = new CloudflareR2Service();
  }
  return r2Service;
}
