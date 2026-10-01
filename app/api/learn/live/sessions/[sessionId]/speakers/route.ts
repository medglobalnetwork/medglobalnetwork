// app/api/learn/live/sessions/[sessionId]/speakers/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { LiveClassroomRepository } from "@/modules/learn/lib/live-classroom-db";

export async function GET(
  request: Request,
  props: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await props.params;
  try {
    const speakers = await LiveClassroomRepository.getStageSpeakers(sessionId);
    return Response.json({ speakers });
  } catch (err: any) {
    console.error(`GET /api/learn/live/sessions/${sessionId}/speakers error:`, err);
    return Response.json({ error: "Failed to fetch speakers" }, { status: 500 });
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
    const { userId, is_mic_on, is_camera_on, is_screen_sharing } = body;
    const targetUserId = userId || session.user.id;

    await LiveClassroomRepository.updateSpeakerMedia(sessionId, targetUserId, {
      is_mic_on,
      is_camera_on,
      is_screen_sharing,
    });

    return Response.json({ success: true, message: "Speaker media state updated" });
  } catch (err: any) {
    console.error(`PATCH /api/learn/live/sessions/${sessionId}/speakers error:`, err);
    return Response.json({ error: "Failed to update speaker media" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("userId") || session.user.id;

    await LiveClassroomRepository.removeSpeaker(sessionId, targetUserId);
    return Response.json({ success: true, message: "Speaker removed from stage" });
  } catch (err: any) {
    console.error(`DELETE /api/learn/live/sessions/${sessionId}/speakers error:`, err);
    return Response.json({ error: "Failed to remove speaker" }, { status: 500 });
  }
}
