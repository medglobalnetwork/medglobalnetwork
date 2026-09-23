// ============================================================
// Legacy Network Messages Route — Powered by MGN Communication Engine
// app/api/network/messages/route.ts
// ============================================================

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CommunicationService } from "@/modules/communication/lib/communication-service";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const recipientId = searchParams.get("recipientId");

  if (!recipientId) {
    return Response.json({ error: "recipientId is required" }, { status: 400 });
  }

  try {
    const convId = await CommunicationService.getOrCreateDirectConversation(session.user.id, recipientId);
    const messages = await CommunicationService.getMessages(session.user.id, convId, { limit: 100 });

    // Mark as read
    await CommunicationService.markConversationRead(session.user.id, convId);

    // Map to backward-compatible format
    const legacyMessages = messages.map((m) => ({
      id: m.id,
      sender_id: m.senderId,
      receiver_id: m.senderId === session.user.id ? recipientId : session.user.id,
      content: m.content,
      media_urls: m.mediaUrls,
      is_read: m.status === "READ",
      created_at: m.createdAt,
      sender_name: m.senderIdentity?.name,
      sender_image: m.senderIdentity?.image,
      type: m.type,
      metadata: m.metadata,
      reactions: m.reactions,
      reply_to: m.replyToSnippet,
      is_pinned: m.isPinned,
    }));

    return Response.json({ data: legacyMessages, conversationId: convId });
  } catch (err: any) {
    console.error("GET /api/network/messages error:", err);
    return Response.json({ error: err.message || "Failed to fetch messages", data: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { recipientId, content, mediaUrls, type, metadata, clientMessageId } = body;

    if (!recipientId) {
      return Response.json({ error: "recipientId is required" }, { status: 400 });
    }

    if (!content?.trim() && (!mediaUrls || mediaUrls.length === 0) && !metadata) {
      return Response.json({ error: "Message content or media is required" }, { status: 400 });
    }

    const convId = await CommunicationService.getOrCreateDirectConversation(session.user.id, recipientId);
    const msg = await CommunicationService.sendMessage(session.user.id, convId, {
      content,
      type: type || "TEXT",
      clientMessageId,
      mediaUrls,
      metadata,
    });

    return Response.json({
      success: true,
      data: {
        id: msg.id,
        sender_id: session.user.id,
        receiver_id: recipientId,
        content: msg.content,
        media_urls: msg.mediaUrls,
        is_read: false,
        created_at: msg.createdAt,
        conversationId: convId,
      },
    });
  } catch (err: any) {
    console.error("POST /api/network/messages error:", err);
    return Response.json({ error: err.message || "Failed to send message" }, { status: 500 });
  }
}
