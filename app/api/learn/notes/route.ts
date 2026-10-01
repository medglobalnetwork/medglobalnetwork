// app/api/learn/notes/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  getLessonNotes,
  getUserNotes,
  saveLessonNote,
  deleteLessonNote,
} from "@/modules/learn/lib/learn-db";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const lessonId = searchParams.get("lessonId");

  try {
    if (lessonId) {
      const notes = await getLessonNotes(session.user.id, lessonId);
      return Response.json({ notes });
    }
    const notes = await getUserNotes(session.user.id);
    return Response.json({ notes });
  } catch (err: any) {
    console.error("GET /api/learn/notes error:", err);
    return Response.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { courseId, lessonId, noteText, timestampSeconds, tags } = body;

    if (!courseId || !lessonId || !noteText?.trim()) {
      return Response.json(
        { error: "courseId, lessonId, and noteText are required" },
        { status: 400 }
      );
    }

    const note = await saveLessonNote({
      userId: session.user.id,
      courseId,
      lessonId,
      noteText,
      timestampSeconds: Number(timestampSeconds) || undefined,
      tags: Array.isArray(tags) ? tags : [],
    });

    return Response.json({ note });
  } catch (err: any) {
    console.error("POST /api/learn/notes error:", err);
    return Response.json({ error: "Failed to save note" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const noteId = searchParams.get("id");

  if (!noteId) {
    return Response.json({ error: "Note ID is required" }, { status: 400 });
  }

  try {
    await deleteLessonNote(session.user.id, noteId);
    return Response.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/learn/notes error:", err);
    return Response.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
