// ============================================================
// MGN Communication Engine — Schedule Meeting API
// app/api/v1/communication/meetings/route.ts
// ============================================================

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CommunicationService } from "@/modules/communication/lib/communication-service";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { conversationId, title, description, startTime, endTime, timezone, meetingLink, reminderMinutes } = body;

    if (!conversationId || !title || !startTime || !endTime) {
      return Response.json(
        { error: "conversationId, title, startTime, and endTime are required" },
        { status: 400 }
      );
    }

    const meetingMessage = await CommunicationService.scheduleMeeting(session.user.id, {
      conversationId,
      title,
      description,
      startTime,
      endTime,
      timezone,
      meetingLink,
      reminderMinutes,
    });

    return Response.json({ success: true, data: meetingMessage });
  } catch (err: any) {
    console.error("POST schedule meeting error:", err);
    return Response.json({ error: err.message || "Failed to schedule meeting" }, { status: 500 });
  }
}
