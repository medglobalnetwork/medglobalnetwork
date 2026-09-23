// app/api/media/upload/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { isR2Configured, uploadR2Buffer, getR2PublicUrl, slugifyFileName } from "@/lib/r2";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const ALLOWED_MIME_TYPES = [
  // Images
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  // Videos
  "video/mp4",
  "video/webm",
  "video/quicktime",
  // Documents
  "application/pdf",
];

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "posts";

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return Response.json(
        { error: `Unsupported file type (${file.type}). Allowed: images, videos (mp4/webm/mov), and PDF.` },
        { status: 400 }
      );
    }

    const sanitizedFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "");
    const safeFileName = slugifyFileName(file.name || "upload");
    const key = `${sanitizedFolder}/${session.user.id}/${Date.now()}-${safeFileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. If Cloudflare R2 is configured, upload directly server-side (bypasses browser CORS completely)
    if (isR2Configured) {
      try {
        await uploadR2Buffer({
          key,
          buffer,
          contentType: file.type,
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
    // For images < 8MB, return data URL or local public path
    if (file.type.startsWith("image/") && buffer.length <= 8 * 1024 * 1024) {
      const base64 = buffer.toString("base64");
      const dataUrl = `data:${file.type};base64,${base64}`;

      // Optionally save to public/uploads in dev if writeable
      if (process.env.NODE_ENV !== "production") {
        try {
          const uploadsDir = path.join(process.cwd(), "public", "uploads", sanitizedFolder);
          await mkdir(uploadsDir, { recursive: true });
          const localPath = path.join(uploadsDir, `${Date.now()}-${safeFileName}`);
          await writeFile(localPath, buffer);
          const localPublicUrl = `/uploads/${sanitizedFolder}/${path.basename(localPath)}`;
          return Response.json({
            success: true,
            publicUrl: localPublicUrl,
            key,
            fileName: file.name,
            fileSize: file.size,
            contentType: file.type,
          });
        } catch {
          // Fallback to dataUrl
        }
      }

      return Response.json({
        success: true,
        publicUrl: dataUrl,
        key,
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type,
      });
    }

    // For larger files or PDFs when R2 isn't configured
    return Response.json({
      success: true,
      publicUrl: `data:${file.type};base64,${buffer.toString("base64")}`,
      key,
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type,
    });
  } catch (err: any) {
    console.error("POST /api/media/upload error:", err);
    return Response.json(
      { error: err.message || "Failed to process file upload" },
      { status: 500 }
    );
  }
}
