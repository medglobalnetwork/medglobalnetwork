// ============================================================
// MGN Communication Engine — Safety Report API
// app/api/v1/communication/safety/report/route.ts
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
    const { reportedUserId, conversationId, messageId, reason, details } = body;

    if (!reason) {
      return Response.json({ error: "Reason for report is required" }, { status: 400 });
    }

    const reportId = await CommunicationService.submitReport(session.user.id, {
      reportedUserId,
      conversationId,
      messageId,
      reason,
      details,
    });

    return Response.json({ success: true, reportId, message: "Report submitted to moderation team" });
  } catch (err: any) {
    console.error("POST report error:", err);
    return Response.json({ error: err.message || "Failed to submit report" }, { status: 500 });
  }
}
