// app/api/media/upload/route.ts
import { getSafeSession } from "@/lib/auth";
import { isR2Configured, uploadR2Buffer, getR2PublicUrl, slugifyFileName } from "@/lib/r2";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { checkRateLimit } from "@/lib/security";

const ALLOWED_MIME_TYPES = [
  // Images
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
  // Videos
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
  "video/avi",
  "video/mpeg",
  // Audio
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/aac",
  "audio/webm",
  "audio/x-m4a",
  "audio/flac",
  // Documents & Books
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/epub+zip",
  "application/json",
  "application/rtf",
  "text/plain",
  "text/csv",
  "text/markdown",
  "application/zip",
  "application/x-zip-compressed",
];

const ALLOWED_EXTENSIONS = [
  ".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".avif",
  ".mp4", ".webm", ".mov", ".mkv", ".avi",
  ".mp3", ".wav", ".ogg", ".aac", ".m4a", ".flac",
  ".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx",
  ".epub", ".json", ".rtf", ".txt", ".csv", ".md", ".zip"
];

function isFileTypeAllowed(file: File): boolean {
  if (file.type && ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return true;
  }
  const name = file.name ? file.name.toLowerCase() : "";
  return ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB maximum

export async function POST(request: Request) {
  try {
    const session = await getSafeSession();
    if (!session?.user) {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }

    // Rate limit per user: max 120 uploads per minute
    const rateLimit = checkRateLimit(`upload:${session.user.id}`, 120, 60000);
    if (!rateLimit.allowed) {
      return Response.json(
        { error: "Upload rate limit exceeded. Please wait a moment." },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "posts";

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        { error: `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 100MB limit.` },
        { status: 400 }
      );
    }

    if (!isFileTypeAllowed(file)) {
      return Response.json(
        { error: `Unsupported file type (${file.type || "unknown"}). Allowed: PDF, Word, PPT, Excel, Images, Audio, Video, and Books.` },
        { status: 400 }
      );
    }

    const sanitizedFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "");
    const safeFolder = sanitizedFolder || "posts";
    const safeFileName = slugifyFileName(file.name || "upload");
    const key = `${safeFolder}/${session.user.id}/${Date.now()}-${safeFileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. If Cloudflare R2 is configured, upload directly server-side (bypasses browser CORS completely)
    if (isR2Configured) {
      try {
        await uploadR2Buffer({
          key,
          buffer,
          contentType: file.type || "application/octet-stream",
        });

        const publicUrl = getR2PublicUrl(key);
        return Response.json({
          success: true,
          publicUrl,
          key,
          fileName: file.name,
          fileSize: file.size,
          contentType: file.type,
        });
      } catch (r2Err) {
        console.error("R2 server upload failed, falling back to local/data storage:", r2Err);
      }
    }

    // 2. Fallback: For local development or when R2 is unavailable
    // Save to public/uploads/resources if writable
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads", safeFolder);
      await mkdir(uploadsDir, { recursive: true });
      const localFileName = `${Date.now()}-${safeFileName}`;
      const localPath = path.join(uploadsDir, localFileName);
      await writeFile(localPath, buffer);
      const localPublicUrl = `/uploads/${safeFolder}/${localFileName}`;
      return Response.json({
        success: true,
        publicUrl: localPublicUrl,
        key,
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type,
      });
    } catch {
      // Data URL fallback for standalone environments
      const base64 = buffer.toString("base64");
      const dataUrl = `data:${file.type || "application/pdf"};base64,${base64}`;
      return Response.json({
        success: true,
        publicUrl: dataUrl,
        key,
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type,
      });
    }
  } catch (err: any) {
    console.error("POST /api/media/upload error:", err);
    return Response.json(
      { error: err.message || "Failed to process file upload" },
      { status: 500 }
    );
  }
}
