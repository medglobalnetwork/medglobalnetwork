// ============================================================
// MGN Communication Engine — Conversation Messages API
// app/api/v1/communication/conversations/[id]/messages/route.ts
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
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const beforeSequence = searchParams.get("beforeSequence")
    ? parseInt(searchParams.get("beforeSequence")!, 10)
    : undefined;

  try {
    const messages = await CommunicationService.getMessages(session.user.id, id, {
      limit,
      beforeSequence,
    });

    return Response.json({ success: true, data: messages });
  } catch (err: any) {
    console.error("GET messages error:", err);
    return Response.json({ error: err.message || "Failed to load messages", data: [] }, { status: 500 });
  }
}

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
    const body = await request.json();
    const { content, type, clientMessageId, replyToId, mediaUrls, metadata } = body;

    const message = await CommunicationService.sendMessage(session.user.id, id, {
      content,
      type,
      clientMessageId,
      replyToId,
      mediaUrls,
      metadata,
    });

    return Response.json({ success: true, data: message });
  } catch (err: any) {
    console.error("POST message error:", err);
    return Response.json({ error: err.message || "Failed to send message" }, { status: 500 });
  }
}
