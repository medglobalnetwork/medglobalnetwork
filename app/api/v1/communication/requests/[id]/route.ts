// ============================================================
// MGN Communication Engine — Message Request Action API
// app/api/v1/communication/requests/[id]/route.ts
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
    const { action } = await request.json();
    if (!["ACCEPT", "DECLINE", "BLOCK"].includes(action)) {
      return Response.json({ error: "Action must be ACCEPT, DECLINE, or BLOCK" }, { status: 400 });
    }

    const result = await CommunicationService.respondToMessageRequest(
      id,
      session.user.id,
      action
    );

    return Response.json(result);
  } catch (err: any) {
    console.error("POST respond to message request error:", err);
    return Response.json({ error: err.message || "Failed to process request" }, { status: 500 });
  }
}
