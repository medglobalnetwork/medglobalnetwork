// app/api/learn/lessons/[lessonId]/chapters/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getVideoChapters, saveVideoChapter } from "@/modules/learn/lib/video-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params;
  if (!lessonId) {
    return Response.json({ error: "lessonId is required" }, { status: 400 });
  }

  try {
    const chapters = await getVideoChapters(lessonId);
    return Response.json({ chapters });
  } catch (err: any) {
    console.error("GET /api/learn/lessons/[lessonId]/chapters error:", err);
    return Response.json({ error: "Failed to fetch chapters" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { lessonId } = await params;
  if (!lessonId) {
    return Response.json({ error: "lessonId is required" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { title, startSeconds, endSeconds, orderIndex, videoAssetId } = body;

    if (!title || startSeconds === undefined) {
      return Response.json({ error: "title and startSeconds are required" }, { status: 400 });
    }

    const chapter = await saveVideoChapter({
      lessonId,
      videoAssetId,
      title,
      startSeconds: Number(startSeconds),
      endSeconds: endSeconds !== undefined ? Number(endSeconds) : undefined,
      orderIndex: orderIndex !== undefined ? Number(orderIndex) : undefined,
    });

    return Response.json({ chapter });
  } catch (err: any) {
    console.error("POST /api/learn/lessons/[lessonId]/chapters error:", err);
    return Response.json({ error: "Failed to save chapter" }, { status: 500 });
  }
}
