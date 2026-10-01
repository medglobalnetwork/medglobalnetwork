// app/api/learn/live/sessions/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { LiveClassroomRepository } from "@/modules/learn/lib/live-classroom-db";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || undefined;

  try {
    const sessions = await LiveClassroomRepository.getSessions(session?.user?.id, status);
    return Response.json({ sessions });
  } catch (err: any) {
    console.error("GET /api/learn/live/sessions error:", err);
    return Response.json({ error: "Failed to fetch live sessions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required to create a live classroom" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      description,
      category,
      specialty,
      scheduled_at,
      duration_minutes,
      thumbnail,
      course_id,
      settings,
    } = body;

    if (!title || !category || !scheduled_at) {
      return Response.json(
        { error: "Title, category, and scheduled_at are required fields" },
        { status: 400 }
      );
    }

    const sessionId = await LiveClassroomRepository.createSession({
      instructor_id: session.user.id,
      title,
      description,
      category,
      specialty,
      scheduled_at,
      duration_minutes: Number(duration_minutes || 60),
      thumbnail,
      course_id,
      settings,
    });

    return Response.json({
      success: true,
      sessionId,
      message: "Live classroom session created successfully",
    });
  } catch (err: any) {
    console.error("POST /api/learn/live/sessions error:", err);
    return Response.json({ error: "Failed to create live session" }, { status: 500 });
  }
}
