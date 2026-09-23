// app/api/network/messages/route.ts
import { auth } from "@/lib/auth";
import { database } from "@/lib/auth";
import { networkDb, ensureNetworkingTables, generateId, createNotification } from "@/modules/network/lib/network-db";
import { headers } from "next/headers";
import { sql } from "kysely";

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
    await ensureNetworkingTables();

    // Fetch message history between session.user.id and recipientId
    const messagesRes: any = await sql`
      SELECT 
        m.id,
        m.sender_id,
        m.receiver_id,
        m.content,
        m.media_urls,
        m.is_read,
        m.created_at,
        u.name as sender_name,
        u.image as sender_image
      FROM direct_messages m
      JOIN "user" u ON u.id = m.sender_id
      WHERE (m.sender_id = ${session.user.id} AND m.receiver_id = ${recipientId})
         OR (m.sender_id = ${recipientId} AND m.receiver_id = ${session.user.id})
      ORDER BY m.created_at ASC
      LIMIT 100
    `.execute(database);

    // Mark unread received messages as read
    await sql`
      UPDATE direct_messages
      SET is_read = true
      WHERE sender_id = ${recipientId} AND receiver_id = ${session.user.id} AND is_read = false
    `.execute(database);

    return Response.json({
      data: messagesRes.rows || [],
    });
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
    await ensureNetworkingTables();
    const body = await request.json();
    const { recipientId, content, mediaUrls } = body;

    if (!recipientId) {
      return Response.json({ error: "recipientId is required" }, { status: 400 });
    }

    if (!content?.trim() && (!mediaUrls || mediaUrls.length === 0)) {
      return Response.json({ error: "Message content or media is required" }, { status: 400 });
    }

    const messageId = generateId();
    const now = new Date();

    await sql`
      INSERT INTO direct_messages (
        id, sender_id, receiver_id, content, media_urls, is_read, created_at
      ) VALUES (
        ${messageId},
        ${session.user.id},
        ${recipientId},
        ${(content || "").trim()},
        ${mediaUrls && mediaUrls.length > 0 ? mediaUrls : null},
        false,
        ${now}
      )
    `.execute(database);

    // Notify recipient
    await createNotification({
      userId: recipientId,
      actorId: session.user.id,
      type: "new_message",
      entityType: "message",
      entityId: messageId,
      message: `${session.user.name || "A connection"} sent you a message: "${(content || "Attachment").slice(0, 50)}"`,
    });

    return Response.json({
      success: true,
      data: {
        id: messageId,
        sender_id: session.user.id,
        receiver_id: recipientId,
        content: (content || "").trim(),
        media_urls: mediaUrls || null,
        is_read: false,
        created_at: now,
      },
    });
  } catch (err: any) {
    console.error("POST /api/network/messages error:", err);
    return Response.json({ error: err.message || "Failed to send message" }, { status: 500 });
  }
}
