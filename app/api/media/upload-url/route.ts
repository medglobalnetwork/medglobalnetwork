// app/api/media/upload-url/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { generatePresignedUploadUrl, slugifyFileName } from "@/lib/r2";

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

    const body = await request.json();
    const { fileName, contentType, folder = "posts" } = body;

    if (!fileName || !contentType) {
      return Response.json(
        { error: "fileName and contentType are required parameters." },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(contentType)) {
      return Response.json(
        { error: `Unsupported file type (${contentType}). Allowed: images, videos (mp4/webm/mov), and PDF.` },
        { status: 400 }
      );
    }

    const sanitizedFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "");
    const safeFileName = slugifyFileName(fileName);
    const key = `${sanitizedFolder}/${session.user.id}/${Date.now()}-${safeFileName}`;

    const presignedData = await generatePresignedUploadUrl({
      key,
      contentType,
      expiresInSeconds: 60, // 60s short-lived pre-signed URL
    });

    return Response.json({
      success: true,
      uploadUrl: presignedData.uploadUrl,
      publicUrl: presignedData.publicUrl,
      key: presignedData.key,
      expiresIn: 60,
    });
  } catch (err: any) {
    console.error("POST /api/media/upload-url error:", err);
    return Response.json(
      { error: err.message || "Failed to generate pre-signed upload URL" },
      { status: 500 }
    );
  }
}
