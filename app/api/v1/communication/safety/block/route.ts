// ============================================================
// MGN Communication Engine — Safety Block API
// app/api/v1/communication/safety/block/route.ts
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
    const { targetUserId } = await request.json();
    if (!targetUserId) {
      return Response.json({ error: "targetUserId is required" }, { status: 400 });
    }

    await CommunicationService.blockUser(session.user.id, targetUserId);
    return Response.json({ success: true, message: "User blocked successfully" });
  } catch (err: any) {
    console.error("POST block error:", err);
    return Response.json({ error: err.message || "Failed to block user" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const { targetUserId } = await request.json();
    if (!targetUserId) {
      return Response.json({ error: "targetUserId is required" }, { status: 400 });
    }

    await CommunicationService.unblockUser(session.user.id, targetUserId);
    return Response.json({ success: true, message: "User unblocked successfully" });
  } catch (err: any) {
    console.error("DELETE unblock error:", err);
    return Response.json({ error: err.message || "Failed to unblock user" }, { status: 500 });
  }
}
