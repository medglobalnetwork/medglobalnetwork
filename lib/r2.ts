// ============================================================
// Cloudflare R2 Client & Storage Utility
// lib/r2.ts
//
// S3-compatible client for Cloudflare R2 object storage.
// Supports secure pre-signed PUT URLs for direct client-to-R2 uploads
// and direct buffer streaming for server-side KYC document storage.
// ============================================================

import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { serverConfig } from "./env";

const accountId = serverConfig.r2.accountId;
const accessKeyId = serverConfig.r2.accessKeyId;
const secretAccessKey = serverConfig.r2.secretAccessKey;
const bucketName = serverConfig.r2.bucketName;
const mediaDomain = serverConfig.r2.mediaDomain;

export const isR2Configured = serverConfig.r2.isConfigured;

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
 * Uploads a Buffer directly to Cloudflare R2 from server-side handlers
 */
export async function uploadR2Buffer({
  key,
  buffer,
  contentType,
  bucket = bucketName,
}: {
  key: string;
  buffer: Buffer;
  contentType: string;
  bucket?: string;
}) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });
  return r2Client.send(command);
}

/**
 * Retrieves an object buffer from Cloudflare R2
 */
export async function getR2ObjectBuffer(key: string, bucket = bucketName): Promise<{ buffer: Buffer; contentType: string } | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    const response = await r2Client.send(command);
    if (!response.Body) return null;

    const byteArray = await response.Body.transformToByteArray();
    return {
      buffer: Buffer.from(byteArray),
      contentType: response.ContentType || "application/octet-stream",
    };
  } catch (err) {
    console.error("Error fetching object from R2:", err);
    return null;
  }
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
