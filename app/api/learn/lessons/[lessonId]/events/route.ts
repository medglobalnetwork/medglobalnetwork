// app/api/learn/lessons/[lessonId]/events/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { processVideoHeartbeat } from "@/modules/learn/lib/video-service";

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
    const { eventType = "PROGRESS", positionSeconds = 0, bufferedSeconds, playbackRate, sessionId } = body;

    const result = await processVideoHeartbeat({
      userId: session.user.id,
      lessonId,
      eventType,
      positionSeconds: Number(positionSeconds),
      bufferedSeconds: bufferedSeconds !== undefined ? Number(bufferedSeconds) : undefined,
      playbackRate: playbackRate !== undefined ? Number(playbackRate) : undefined,
      sessionId,
    });

    return Response.json(result);
  } catch (err: any) {
    console.error("POST /api/learn/lessons/[lessonId]/events error:", err);
    return Response.json({ error: err.message || "Failed to process heartbeat" }, { status: 500 });
  }
}
