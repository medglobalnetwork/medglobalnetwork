// ============================================================
// Legacy Network Conversations Route — Powered by MGN Communication Engine
// app/api/network/messages/conversations/route.ts
// ============================================================

import { auth, database } from "@/lib/auth";
import { headers } from "next/headers";
import { sql } from "kysely";
import { CommunicationService } from "@/modules/communication/lib/communication-service";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const currentUserId = session.user.id;

  try {
    // 1. Fetch conversations from central communication engine
    const conversations = await CommunicationService.listConversations(currentUserId);

    // Map to legacy format expected by existing consumers
    const messageConversations = conversations
      .filter((c) => c.type === "DIRECT" && c.peerIdentity)
      .map((c) => ({
        conversation_id: c.id,
        peer_id: c.peerIdentity!.userId,
        peer_name: c.peerIdentity!.name,
        peer_image: c.peerIdentity!.image,
        peer_profession: c.peerIdentity!.profession,
        peer_specialization: c.peerIdentity!.specialization,
        peer_designation: c.peerIdentity!.designation,
        peer_member_id: c.peerIdentity!.memberId,
        peer_is_founding: c.peerIdentity!.isFoundingMember,
        last_message: c.lastMessageContent,
        last_message_at: c.lastMessageAt,
        last_sender_id: c.lastSenderId,
        unread_count: c.unreadCount,
        is_connection_only: false,
      }));

    const existingPeerIds = new Set(messageConversations.map((c) => c.peer_id));

    // 2. Fetch connections so users can start chatting directly with their connections
    const connectionsRes: any = await sql`
      SELECT 
        CASE WHEN c.user_a_id = ${currentUserId} THEN c.user_b_id ELSE c.user_a_id END AS peer_id,
        u.name AS peer_name,
        u.image AS peer_image,
        prof.profession AS peer_profession,
        prof.specialization AS peer_specialization,
        prof.designation AS peer_designation,
        prof.member_id AS peer_member_id,
        prof.is_founding_member AS peer_is_founding,
        c.connected_at AS last_message_at
      FROM connections c
      JOIN "user" u ON u.id = (CASE WHEN c.user_a_id = ${currentUserId} THEN c.user_b_id ELSE c.user_a_id END)
      LEFT JOIN professional_profiles prof ON prof.user_id = u.id
      WHERE c.user_a_id = ${currentUserId} OR c.user_b_id = ${currentUserId}
    `.execute(database);

    const connectionPeers = (connectionsRes.rows || [])
      .filter((c: any) => !existingPeerIds.has(c.peer_id))
      .map((c: any) => ({
        conversation_id: null,
        peer_id: c.peer_id,
        peer_name: c.peer_name,
        peer_image: c.peer_image,
        peer_profession: c.peer_profession,
        peer_specialization: c.peer_specialization,
        peer_designation: c.peer_designation,
        peer_member_id: c.peer_member_id,
        peer_is_founding: Boolean(c.peer_is_founding),
        last_message: null,
        last_message_at: c.last_message_at,
        last_sender_id: null,
        unread_count: 0,
        is_connection_only: true,
      }));

    return Response.json({
      data: [...messageConversations, ...connectionPeers],
    });
  } catch (err: any) {
    console.error("GET /api/network/messages/conversations error:", err);
    return Response.json({ error: err.message || "Failed to fetch conversations", data: [] }, { status: 500 });
  }
}
