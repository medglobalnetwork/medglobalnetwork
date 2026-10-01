// app/api/learn/live/sessions/[sessionId]/voice-doubts/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { LiveClassroomRepository, VoiceDoubtStatus } from "@/modules/learn/lib/live-classroom-db";

export async function GET(
  request: Request,
  props: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await props.params;
  try {
    const doubts = await LiveClassroomRepository.getVoiceDoubts(sessionId);
    return Response.json({ doubts });
  } catch (err: any) {
    console.error(`GET /api/learn/live/sessions/${sessionId}/voice-doubts error:`, err);
    return Response.json({ error: "Failed to fetch voice doubts" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  props: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required to submit voice doubt" }, { status: 401 });
  }

  try {
    const liveSession = await LiveClassroomRepository.getSessionById(sessionId, session.user.id);
    if (!liveSession) {
      return Response.json({ error: "Live session not found" }, { status: 404 });
    }

    if (liveSession.settings && !liveSession.settings.enable_voice_doubts) {
      return Response.json({ error: "Voice doubts are currently disabled by instructor" }, { status: 403 });
    }

    const body = await request.json();
    const { audio_url, duration_seconds, transcript } = body;

    if (!audio_url) {
      return Response.json({ error: "Audio URL / data is required" }, { status: 400 });
    }

    const doubt = await LiveClassroomRepository.submitVoiceDoubt({
      session_id: sessionId,
      user_id: session.user.id,
      user_name: session.user.name || "Student",
      user_image: session.user.image,
      audio_url,
      duration_seconds: Number(duration_seconds || 10),
      transcript,
    });

    return Response.json({ success: true, doubt });
  } catch (err: any) {
    console.error(`POST /api/learn/live/sessions/${sessionId}/voice-doubts error:`, err);
    return Response.json({ error: "Failed to submit voice doubt" }, { status: 500 });
  }
}

export async function PATCH(
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
    const { doubtId, status } = body as { doubtId: string; status: VoiceDoubtStatus };

    if (!doubtId || !status) {
      return Response.json({ error: "doubtId and status are required" }, { status: 400 });
    }

    await LiveClassroomRepository.updateVoiceDoubtStatus(doubtId, sessionId, status);
    return Response.json({ success: true, message: `Voice doubt updated to ${status}` });
  } catch (err: any) {
    console.error(`PATCH /api/learn/live/sessions/${sessionId}/voice-doubts error:`, err);
    return Response.json({ error: "Failed to update voice doubt status" }, { status: 500 });
  }
}
