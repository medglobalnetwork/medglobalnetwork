// app/api/learn/live-sessions/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getLiveSessions, registerForLiveSession } from "@/modules/learn/lib/learn-db";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  try {
    const sessions = await getLiveSessions(session?.user?.id);
    return Response.json({ sessions });
  } catch (err: any) {
    console.error("GET /api/learn/live-sessions error:", err);
    return Response.json({ error: "Failed to fetch live sessions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { sessionId } = body;
    if (!sessionId) {
      return Response.json({ error: "sessionId is required" }, { status: 400 });
    }

    const success = await registerForLiveSession(session.user.id, sessionId);
    return Response.json({ success, message: "Successfully registered for live session" });
  } catch (err: any) {
    console.error("POST /api/learn/live-sessions error:", err);
    return Response.json({ error: "Failed to register for live session" }, { status: 500 });
  }
}
