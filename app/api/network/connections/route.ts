import { auth } from "@/lib/auth";
import { networkDb, generateId, createNotification, ensureNetworkingTables } from "@/modules/network/lib/network-db";
import { headers } from "next/headers";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required", data: [] }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "connections"; // 'connections' | 'sent' | 'received'

  try {
    await ensureNetworkingTables();
    if (type === "sent") {
      const requests = await networkDb
        .selectFrom("connection_requests as cr")
        .innerJoin("user as u", "u.id", "cr.receiver_id")
        .leftJoin("professional_profiles as pp", "pp.user_id", "cr.receiver_id")
        .select([
          "cr.id",
          "cr.receiver_id",
          "cr.message",
          "cr.status",
          "cr.created_at",
          "u.name",
          "u.image",
          "pp.profession",
          "pp.specialization",
          "pp.organization",
          "pp.city",
          "pp.state",
        ])
        .where("cr.sender_id", "=", session.user.id)
        .where("cr.status", "=", "pending")
        .orderBy("cr.created_at", "desc")
        .execute();

      return Response.json({ data: requests });
    }

    if (type === "received") {
      const requests = await networkDb
        .selectFrom("connection_requests as cr")
        .innerJoin("user as u", "u.id", "cr.sender_id")
        .leftJoin("professional_profiles as pp", "pp.user_id", "cr.sender_id")
        .select([
          "cr.id",
          "cr.sender_id",
          "cr.message",
          "cr.status",
          "cr.created_at",
          "u.name",
          "u.image",
          "pp.profession",
          "pp.specialization",
          "pp.organization",
          "pp.city",
          "pp.state",
        ])
        .where("cr.receiver_id", "=", session.user.id)
        .where("cr.status", "=", "pending")
        .orderBy("cr.created_at", "desc")
        .execute();

      return Response.json({ data: requests });
    }

    // Default: active connections
    const connections = await networkDb
      .selectFrom("connections as c")
      .innerJoin("user as u", (join) =>
        join.on((eb) =>
          eb.or([
            eb.and([
              eb("c.user_a_id", "=", session.user.id),
              eb("u.id", "=", eb.ref("c.user_b_id")),
            ]),
            eb.and([
              eb("c.user_b_id", "=", session.user.id),
              eb("u.id", "=", eb.ref("c.user_a_id")),
            ]),
          ])
        )
      )
      .leftJoin("professional_profiles as pp", "pp.user_id", "u.id")
      .select([
        "c.id",
        "c.connected_at",
        "u.id as user_id",
        "u.name",
        "u.image",
        "pp.profession",
        "pp.specialization",
        "pp.organization",
        "pp.city",
        "pp.state",
      ])
      .where((eb) =>
        eb.or([
          eb("c.user_a_id", "=", session.user.id),
          eb("c.user_b_id", "=", session.user.id),
        ])
      )
      .orderBy("c.connected_at", "desc")
      .execute();

    return Response.json({ data: connections });
  } catch (err) {
    console.error("GET /api/network/connections error:", err);
    return Response.json({ data: [], error: "Failed to fetch connections" });
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const { receiverId, message } = await request.json() as {
      receiverId: string;
      message?: string;
    };

    if (!receiverId) {
      return Response.json({ error: "receiverId is required" }, { status: 400 });
    }

    // Prevent self-connection
    if (receiverId === session.user.id) {
      return Response.json({ error: "Cannot connect with yourself" }, { status: 400 });
    }

    // Check if already connected
    const existingConn = await networkDb
      .selectFrom("connections")
      .where((eb) =>
        eb.or([
          eb.and([eb("user_a_id", "=", session.user.id), eb("user_b_id", "=", receiverId)]),
          eb.and([eb("user_b_id", "=", session.user.id), eb("user_a_id", "=", receiverId)]),
        ])
      )
      .selectAll()
      .executeTakeFirst();

    if (existingConn) {
      return Response.json({ error: "Already connected" }, { status: 409 });
    }

    // Check for duplicate pending request
    const existingReq = await networkDb
      .selectFrom("connection_requests")
      .where((eb) =>
        eb.or([
          eb.and([eb("sender_id", "=", session.user.id), eb("receiver_id", "=", receiverId)]),
          eb.and([eb("sender_id", "=", receiverId), eb("receiver_id", "=", session.user.id)]),
        ])
      )
      .where("status", "=", "pending")
      .selectAll()
      .executeTakeFirst();

    if (existingReq) {
      return Response.json({ error: "Connection request already exists" }, { status: 409 });
    }

    const now = new Date();
    const id = generateId();

    await networkDb
      .insertInto("connection_requests")
      .values({
        id,
        sender_id: session.user.id,
        receiver_id: receiverId,
        message: message?.trim().slice(0, 300) ?? null,
        status: "pending",
        created_at: now,
        updated_at: now,
      })
      .execute();

    // Notify the receiver
    await createNotification({
      userId: receiverId,
      actorId: session.user.id,
      type: "connection_request",
      entityType: "connection_request",
      entityId: id,
      message: `${session.user.name ?? "Someone"} sent you a connection request`,
    });

    return Response.json({ success: true, requestId: id });
  } catch (err) {
    console.error("POST /api/network/connections error:", err);
    return Response.json({ error: "Failed to send connection request" }, { status: 500 });
  }
}
