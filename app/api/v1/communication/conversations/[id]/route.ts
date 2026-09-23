// ============================================================
// MGN Communication Engine — Conversation Detail API
// app/api/v1/communication/conversations/[id]/route.ts
// ============================================================

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CommunicationService } from "@/modules/communication/lib/communication-service";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { id } = await props.params;

  try {
    const details = await CommunicationService.getConversationDetails(session.user.id, id);
    return Response.json({ success: true, data: details });
  } catch (err: any) {
    console.error("GET /api/v1/communication/conversations/[id] error:", err);
    return Response.json({ error: err.message || "Failed to load conversation" }, { status: 500 });
  }
}
