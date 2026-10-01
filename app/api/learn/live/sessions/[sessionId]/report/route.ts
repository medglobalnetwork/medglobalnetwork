// app/api/learn/live/sessions/[sessionId]/report/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { database } from "@/lib/auth";
import { generateId } from "@/modules/network/lib/network-db";
import { ensureLiveClassroomTables } from "@/modules/learn/lib/live-classroom-db";

const db = database as any;

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
    await ensureLiveClassroomTables();
    const body = await request.json();
    const { reported_user_id, message_id, reason, details } = body;

    if (!reason) {
      return Response.json({ error: "Reason is required for submitting a report" }, { status: 400 });
    }

    const id = generateId();
    await db
      .insertInto("live_reports")
      .values({
        id,
        session_id: sessionId,
        reporter_id: session.user.id,
        reported_user_id: reported_user_id || null,
        message_id: message_id || null,
        reason,
        details: details || null,
        status: "pending",
        created_at: new Date(),
      })
      .execute();

    return Response.json({ success: true, message: "Report submitted to central moderation" });
  } catch (err: any) {
    console.error(`POST /api/learn/live/sessions/${sessionId}/report error:`, err);
    return Response.json({ error: "Failed to submit report" }, { status: 500 });
  }
}
