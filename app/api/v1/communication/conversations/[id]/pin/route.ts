// ============================================================
// MGN Communication Engine — Toggle Pin Message API
// app/api/v1/communication/conversations/[id]/pin/route.ts
// ============================================================

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CommunicationService } from "@/modules/communication/lib/communication-service";

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { id } = await props.params;

  try {
    const { messageId } = await request.json();
    if (!messageId) {
      return Response.json({ error: "messageId is required" }, { status: 400 });
    }

    const isPinned = await CommunicationService.togglePinMessage(session.user.id, id, messageId);
    return Response.json({ success: true, isPinned });
  } catch (err: any) {
    console.error("POST toggle pin error:", err);
    return Response.json({ error: err.message || "Failed to pin message" }, { status: 500 });
  }
}
