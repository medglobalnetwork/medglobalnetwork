// ============================================================
// Cloudflare R2 Client & Storage Utility
// lib/r2.ts
//
// S3-compatible client for Cloudflare R2 object storage.
// Supports secure pre-signed PUT URLs for direct client-to-R2 uploads.
// ============================================================

import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || "";
const accessKeyId = process.env.R2_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "";
const bucketName = process.env.R2_BUCKET_NAME || "";
const mediaDomain = process.env.NEXT_PUBLIC_R2_MEDIA_DOMAIN || "https://media.mgn.life";

/**
 * Singleton S3 Client configured for Cloudflare R2
 */
export const r2Client = new S3Client({
  region: "auto",
  endpoint: accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

/**
 * Constructs the canonical public CDN URL for an R2 object key
 */
export function getR2PublicUrl(key: string): string {
  const cleanDomain = mediaDomain.replace(/\/$/, "");
  const cleanKey = key.replace(/^\//, "");
  return `${cleanDomain}/${cleanKey}`;
}

/**
 * Slugifies a filename to ensure safe S3 object keys
 */
export function slugifyFileName(fileName: string): string {
  const parts = fileName.split(".");
  const ext = parts.length > 1 ? `.${parts.pop()}` : "";
  const name = parts.join(".");
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `${cleanName || "file"}${ext.toLowerCase()}`;
}

export interface GeneratePresignedUrlOptions {
  key: string;
  contentType: string;
  expiresInSeconds?: number;
  bucket?: string;
}

/**
 * Generates a short-lived pre-signed PUT URL for direct client-to-R2 upload
 */
export async function generatePresignedUploadUrl({
  key,
  contentType,
  expiresInSeconds = 60,
  bucket = bucketName,
}: GeneratePresignedUrlOptions) {
  if (!bucket) {
    throw new Error("R2_BUCKET_NAME is not configured in environment variables.");
  }

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(r2Client, command, {
    expiresIn: expiresInSeconds,
  });

  const publicUrl = getR2PublicUrl(key);

  return {
    uploadUrl,
    publicUrl,
    key,
  };
}

/**
 * Deletes an object from Cloudflare R2
 */
export async function deleteR2Object(key: string, bucket = bucketName) {
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  return r2Client.send(command);
}
