// app/api/learn/live/sessions/[sessionId]/notes/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { LiveClassroomRepository } from "@/modules/learn/lib/live-classroom-db";

export async function GET(
  request: Request,
  props: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const notes = await LiveClassroomRepository.getNotes(sessionId, session.user.id);
    return Response.json({ notes });
  } catch (err: any) {
    console.error(`GET /api/learn/live/sessions/${sessionId}/notes error:`, err);
    return Response.json({ error: "Failed to fetch student notes" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  props: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required to save notes" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { timestamp_seconds, formatted_time, note_text, tags } = body;

    if (!note_text || !note_text.trim()) {
      return Response.json({ error: "Note text cannot be empty" }, { status: 400 });
    }

    const note = await LiveClassroomRepository.saveNote({
      session_id: sessionId,
      user_id: session.user.id,
      timestamp_seconds: Number(timestamp_seconds || 0),
      formatted_time: formatted_time || "00:00",
      note_text,
      tags,
    });

    return Response.json({ success: true, note });
  } catch (err: any) {
    console.error(`POST /api/learn/live/sessions/${sessionId}/notes error:`, err);
    return Response.json({ error: "Failed to save note" }, { status: 500 });
  }
}
