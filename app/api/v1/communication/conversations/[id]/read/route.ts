// ============================================================
// MGN Communication Engine — Mark Conversation Read API
// app/api/v1/communication/conversations/[id]/read/route.ts
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
    await CommunicationService.markConversationRead(session.user.id, id);
    return Response.json({ success: true });
  } catch (err: any) {
    console.error("POST mark read error:", err);
    return Response.json({ error: err.message || "Failed to mark as read" }, { status: 500 });
  }
}
