// ============================================================
// MGN Communication Engine — Conversations API
// app/api/v1/communication/conversations/route.ts
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
  const type = searchParams.get("type") as any;
  const search = searchParams.get("search") || undefined;
  const unreadOnly = searchParams.get("unread") === "true";

  try {
    const list = await CommunicationService.listConversations(session.user.id, {
      type: type || undefined,
      search,
      unreadOnly,
    });

    return Response.json({ success: true, data: list });
  } catch (err: any) {
    console.error("GET /api/v1/communication/conversations error:", err);
    return Response.json({ error: err.message || "Failed to load conversations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, peerId, name, description, avatarUrl, memberIds, contextId } = body;

    let conversationId: string;

    if (type === "DIRECT") {
      if (!peerId) {
        return Response.json({ error: "peerId is required for DIRECT conversation" }, { status: 400 });
      }
      conversationId = await CommunicationService.getOrCreateDirectConversation(session.user.id, peerId);
    } else if (type === "GROUP") {
      if (!name?.trim()) {
        return Response.json({ error: "Group name is required" }, { status: 400 });
      }
      conversationId = await CommunicationService.createGroupConversation(session.user.id, {
        name: name.trim(),
        description,
        avatarUrl,
        memberIds: Array.isArray(memberIds) ? memberIds : [],
      });
    } else if (["EVENT", "CAMP", "RESEARCH", "JOB", "ORGANIZATION", "COMMUNITY"].includes(type)) {
      if (!contextId) {
        return Response.json({ error: "contextId is required for contextual conversations" }, { status: 400 });
      }
      conversationId = await CommunicationService.getOrCreateContextConversation(session.user.id, {
        type,
        contextId,
        name,
        memberIds,
      });
    } else {
      return Response.json({ error: "Invalid conversation type" }, { status: 400 });
    }

    const details = await CommunicationService.getConversationDetails(session.user.id, conversationId);
    return Response.json({ success: true, conversationId, data: details });
  } catch (err: any) {
    console.error("POST /api/v1/communication/conversations error:", err);
    return Response.json({ error: err.message || "Failed to create conversation" }, { status: 500 });
  }
}
