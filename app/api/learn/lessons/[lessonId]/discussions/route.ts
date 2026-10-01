// app/api/learn/lessons/[lessonId]/discussions/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getVideoDiscussions, createVideoDiscussion } from "@/modules/learn/lib/video-service";
import { learnDb } from "@/modules/learn/lib/learn-db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params;
  if (!lessonId) {
    return Response.json({ error: "lessonId is required" }, { status: 400 });
  }

  try {
    const discussions = await getVideoDiscussions(lessonId);
    return Response.json({ discussions });
  } catch (err: any) {
    console.error("GET /api/learn/lessons/[lessonId]/discussions error:", err);
    return Response.json({ error: "Failed to fetch discussions" }, { status: 500 });
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
    const { message, parentId, timestampSeconds } = body;

    if (!message?.trim()) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    const lesson = await learnDb
      .selectFrom("course_lessons")
      .select(["course_id"])
      .where("id", "=", lessonId)
      .executeTakeFirst();

    if (!lesson) {
      return Response.json({ error: "Lesson not found" }, { status: 404 });
    }

    const discussion = await createVideoDiscussion({
      userId: session.user.id,
      lessonId,
      courseId: lesson.course_id,
      message,
      parentId,
      timestampSeconds: timestampSeconds !== undefined ? Number(timestampSeconds) : undefined,
    });

    return Response.json({ discussion });
  } catch (err: any) {
    console.error("POST /api/learn/lessons/[lessonId]/discussions error:", err);
    return Response.json({ error: "Failed to post discussion" }, { status: 500 });
  }
}
