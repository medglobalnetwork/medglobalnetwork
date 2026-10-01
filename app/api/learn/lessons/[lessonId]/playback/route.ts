// app/api/learn/lessons/[lessonId]/playback/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { authorizeLessonPlayback } from "@/modules/learn/lib/video-service";

export async function GET(
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
    const playbackSession = await authorizeLessonPlayback({
      userId: session.user.id,
      lessonId,
      ipAddress: (await headers()).get("x-forwarded-for") || undefined,
      userAgent: (await headers()).get("user-agent") || undefined,
    });

    return Response.json(playbackSession);
  } catch (err: any) {
    console.error("GET /api/learn/lessons/[lessonId]/playback error:", err);
    return Response.json({ error: err.message || "Playback authorization failed" }, { status: 403 });
  }
}
