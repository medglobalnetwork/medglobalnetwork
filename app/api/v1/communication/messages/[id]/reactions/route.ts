// ============================================================
// MGN Communication Engine — Message Reactions API
// app/api/v1/communication/messages/[id]/reactions/route.ts
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
    const { reaction } = await request.json();
    if (!reaction) {
      return Response.json({ error: "reaction is required" }, { status: 400 });
    }

    await CommunicationService.reactToMessage(session.user.id, id, reaction);
    return Response.json({ success: true });
  } catch (err: any) {
    console.error("POST reaction error:", err);
    return Response.json({ error: err.message || "Failed to update reaction" }, { status: 500 });
  }
}
