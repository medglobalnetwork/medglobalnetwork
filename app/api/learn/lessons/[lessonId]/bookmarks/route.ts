// app/api/learn/lessons/[lessonId]/bookmarks/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  getVideoBookmarks,
  createVideoBookmark,
  deleteVideoBookmark,
} from "@/modules/learn/lib/video-service";
import { learnDb } from "@/modules/learn/lib/learn-db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { lessonId } = await params;
  try {
    const bookmarks = await getVideoBookmarks(session.user.id, lessonId);
    return Response.json({ bookmarks });
  } catch (err: any) {
    console.error("GET /api/learn/lessons/[lessonId]/bookmarks error:", err);
    return Response.json({ error: "Failed to fetch bookmarks" }, { status: 500 });
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
  try {
    const body = await request.json();
    const { timestampSeconds = 0, title, note } = body;

    const lesson = await learnDb
      .selectFrom("course_lessons")
      .select(["course_id"])
      .where("id", "=", lessonId)
      .executeTakeFirst();

    if (!lesson) {
      return Response.json({ error: "Lesson not found" }, { status: 404 });
    }

    const bookmark = await createVideoBookmark({
      userId: session.user.id,
      lessonId,
      courseId: lesson.course_id,
      timestampSeconds: Number(timestampSeconds),
      title,
      note,
    });

    return Response.json({ bookmark });
  } catch (err: any) {
    console.error("POST /api/learn/lessons/[lessonId]/bookmarks error:", err);
    return Response.json({ error: "Failed to save bookmark" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const bookmarkId = searchParams.get("id");

  if (!bookmarkId) {
    return Response.json({ error: "Bookmark id is required" }, { status: 400 });
  }

  try {
    await deleteVideoBookmark(session.user.id, bookmarkId);
    return Response.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/learn/lessons/[lessonId]/bookmarks error:", err);
    return Response.json({ error: "Failed to delete bookmark" }, { status: 500 });
  }
}
