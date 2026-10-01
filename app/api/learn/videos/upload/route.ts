// app/api/learn/videos/upload/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createVideoAsset } from "@/modules/learn/lib/video-service";
import { isR2Configured, generatePresignedUploadUrl } from "@/lib/r2";
import { generateId } from "@/modules/network/lib/network-db";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      courseId,
      lessonId,
      filename = "lecture.mp4",
      fileSizeBytes = 50000000,
      mimeType = "video/mp4",
      durationSeconds = 1800,
    } = body;

    if (!title?.trim()) {
      return Response.json({ error: "Video title is required" }, { status: 400 });
    }

    // Supported formats: MP4, MOV, WebM
    const validMimes = ["video/mp4", "video/quicktime", "video/webm", "video/x-matroska"];
    if (mimeType && !validMimes.some((m) => mimeType.toLowerCase().includes(m.split("/")[1]))) {
      return Response.json(
        { error: "Unsupported video format. Please upload MP4, MOV, or WebM." },
        { status: 400 }
      );
    }

    const videoId = generateId();
    const storageKey = `videos/raw/${videoId}/${filename}`;

    let uploadUrl: string | null = null;
    if (isR2Configured) {
      try {
        const presigned = await generatePresignedUploadUrl({
          key: storageKey,
          contentType: mimeType,
          expiresInSeconds: 3600,
        });
        uploadUrl = presigned.uploadUrl;
      } catch (e) {
        console.warn("R2 presigned URL generation failed, falling back to direct stream key:", e);
      }
    }

    const asset = await createVideoAsset({
      instructorId: session.user.id,
      title: title.trim(),
      courseId,
      lessonId,
      originalFilename: filename,
      fileSizeBytes: Number(fileSizeBytes),
      mimeType,
      storageKey,
      durationSeconds: Number(durationSeconds),
    });

    return Response.json({
      success: true,
      videoAsset: asset,
      uploadUrl,
      storageKey,
      processingState: "READY",
    });
  } catch (err: any) {
    console.error("POST /api/learn/videos/upload error:", err);
    return Response.json({ error: err.message || "Failed to initiate video upload" }, { status: 500 });
  }
}
