// app/api/network/messages/conversations/route.ts
import { auth } from "@/lib/auth";
import { database } from "@/lib/auth";
import { ensureNetworkingTables } from "@/modules/network/lib/network-db";
import { headers } from "next/headers";
import { sql } from "kysely";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const currentUserId = session.user.id;

  try {
    await ensureNetworkingTables();

    // 1. Get peers with message history
    const conversationPeersRes: any = await sql`
      WITH user_peers AS (
        SELECT 
          CASE WHEN sender_id = ${currentUserId} THEN receiver_id ELSE sender_id END AS peer_id,
          id AS message_id,
          content,
          created_at,
          sender_id,
          receiver_id,
          is_read,
          ROW_NUMBER() OVER (
            PARTITION BY (CASE WHEN sender_id = ${currentUserId} THEN receiver_id ELSE sender_id END)
            ORDER BY created_at DESC
          ) as rn
        FROM direct_messages
        WHERE sender_id = ${currentUserId} OR receiver_id = ${currentUserId}
      )
      SELECT 
        p.peer_id,
        p.content AS last_message,
        p.created_at AS last_message_at,
        p.sender_id AS last_sender_id,
        u.name AS peer_name,
        u.image AS peer_image,
        prof.profession AS peer_profession,
        prof.specialization AS peer_specialization,
        prof.designation AS peer_designation,
        prof.member_id AS peer_member_id,
        prof.is_founding_member AS peer_is_founding,
        (
          SELECT COUNT(*)::INT 
          FROM direct_messages 
          WHERE sender_id = p.peer_id 
            AND receiver_id = ${currentUserId} 
            AND is_read = false
        ) AS unread_count
      FROM user_peers p
      JOIN "user" u ON u.id = p.peer_id
      LEFT JOIN professional_profiles prof ON prof.user_id = p.peer_id
      WHERE p.rn = 1
      ORDER BY p.created_at DESC
    `.execute(database);

    const messageConversations = conversationPeersRes.rows || [];
    const existingPeerIds = new Set(messageConversations.map((c: any) => c.peer_id));

    // 2. Also fetch active connections so users can start chatting with connections seamlessly
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
        ...c,
        last_message: null,
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
