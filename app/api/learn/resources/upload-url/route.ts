// app/api/learn/resources/upload-url/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { generatePresignedUploadUrl, slugifyFileName } from "@/lib/r2";
import { generateId } from "@/modules/network/lib/network-db";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const { filename, contentType, courseId } = await request.json();
    if (!filename || !contentType) {
      return Response.json(
        { error: "filename and contentType are required" },
        { status: 400 }
      );
    }

    const safeFilename = slugifyFileName(filename);
    const uniqueId = generateId();
    const storageKey = courseId
      ? `learn/courses/${courseId}/resources/${uniqueId}-${safeFilename}`
      : `learn/resources/${uniqueId}-${safeFilename}`;

    const presigned = await generatePresignedUploadUrl({
      key: storageKey,
      contentType,
      expiresInSeconds: 300, // 5 minutes
    });

    return Response.json({
      uploadUrl: presigned.uploadUrl,
      publicUrl: presigned.publicUrl,
      storageKey: presigned.key,
      uniqueId,
    });
  } catch (err: any) {
    console.error("POST /api/learn/resources/upload-url error:", err);
    return Response.json(
      { error: err.message || "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
