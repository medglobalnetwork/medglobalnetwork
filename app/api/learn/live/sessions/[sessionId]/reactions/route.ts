// app/api/learn/live/sessions/[sessionId]/reactions/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { LiveClassroomRepository } from "@/modules/learn/lib/live-classroom-db";

const ALLOWED_EMOJIS = ["❤️", "👍", "👏", "😂", "🔥", "😮"];

export async function GET(
  request: Request,
  props: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await props.params;
  try {
    const reactions = await LiveClassroomRepository.getRecentReactions(sessionId, 5);
    return Response.json({ reactions });
  } catch (err: any) {
    console.error(`GET /api/learn/live/sessions/${sessionId}/reactions error:`, err);
    return Response.json({ error: "Failed to fetch reactions" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  props: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { emoji } = body;

    if (!emoji || !ALLOWED_EMOJIS.includes(emoji)) {
      return Response.json({ error: "Invalid emoji reaction" }, { status: 400 });
    }

    await LiveClassroomRepository.recordReaction(sessionId, session.user.id, emoji);
    return Response.json({ success: true, emoji });
  } catch (err: any) {
    console.error(`POST /api/learn/live/sessions/${sessionId}/reactions error:`, err);
    return Response.json({ error: "Failed to record reaction" }, { status: 500 });
  }
}
