// ============================================================
// MGN Communication Engine — Message Requests API
// app/api/v1/communication/requests/route.ts
// ============================================================

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CommunicationService } from "@/modules/communication/lib/communication-service";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const requests = await CommunicationService.listMessageRequests(session.user.id);
    return Response.json({ success: true, data: requests });
  } catch (err: any) {
    console.error("GET message requests error:", err);
    return Response.json({ success: false, data: [], error: err.message || "Failed to load requests" }, { status: 200 });
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const { receiverId, initialMessage } = await request.json();
    if (!receiverId) {
      return Response.json({ error: "receiverId is required" }, { status: 400 });
    }

    const result = await CommunicationService.createMessageRequest(
      session.user.id,
      receiverId,
      initialMessage
    );

    return Response.json({ success: true, ...result });
  } catch (err: any) {
    console.error("POST message request error:", err);
    return Response.json({ error: err.message || "Failed to create message request" }, { status: 400 });
  }
}
