// app/api/network/connections/[connectionId]/route.ts
import { auth } from "@/lib/auth";
import { networkDb, generateId, createNotification } from "@/modules/network/lib/network-db";
import { headers } from "next/headers";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ connectionId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { connectionId } = await params;
  const { action } = await request.json() as { action: string };

  try {
    const req = await networkDb
      .selectFrom("connection_requests")
      .where("id", "=", connectionId)
      .selectAll()
      .executeTakeFirst();

    if (!req) {
      return Response.json({ error: "Request not found" }, { status: 404 });
    }

    const now = new Date();

    if (action === "accept") {
      // Only receiver can accept
      if (req.receiver_id !== session.user.id) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }

      await networkDb
        .updateTable("connection_requests")
        .set({ status: "accepted", updated_at: now })
        .where("id", "=", connectionId)
        .execute();

      // Create connection record
      await networkDb
        .insertInto("connections")
        .values({
          id: generateId(),
          user_a_id: req.sender_id,
          user_b_id: req.receiver_id,
          connected_at: now,
        })
        .onConflict((oc) => oc.doNothing())
        .execute();

      // Notify the sender
      await createNotification({
        userId: req.sender_id,
        actorId: session.user.id,
        type: "connection_accepted",
        entityType: "connection_request",
        entityId: connectionId,
        message: `${session.user.name ?? "Someone"} accepted your connection request`,
      });

      return Response.json({ success: true, action: "accepted" });
    }

    if (action === "ignore") {
      if (req.receiver_id !== session.user.id) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }

      await networkDb
        .updateTable("connection_requests")
        .set({ status: "ignored", updated_at: now })
        .where("id", "=", connectionId)
        .execute();

      return Response.json({ success: true, action: "ignored" });
    }

    if (action === "withdraw") {
      if (req.sender_id !== session.user.id) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }

      await networkDb
        .updateTable("connection_requests")
        .set({ status: "withdrawn", updated_at: now })
        .where("id", "=", connectionId)
        .execute();

      return Response.json({ success: true, action: "withdrawn" });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error(`PATCH /api/network/connections/${connectionId} error:`, err);
    return Response.json({ error: "Failed to update connection" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ connectionId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { connectionId } = await params;

  try {
    // Can be a connection ID or a connection request ID
    // Try connections table first
    const conn = await networkDb
      .selectFrom("connections")
      .where("id", "=", connectionId)
      .where((eb) =>
        eb.or([
          eb("user_a_id", "=", session.user.id),
          eb("user_b_id", "=", session.user.id),
        ])
      )
      .selectAll()
      .executeTakeFirst();

    if (conn) {
      await networkDb
        .deleteFrom("connections")
        .where("id", "=", connectionId)
        .execute();
      return Response.json({ success: true });
    }

    // Try connection_requests table
    const req = await networkDb
      .selectFrom("connection_requests")
      .where("id", "=", connectionId)
      .where((eb) =>
        eb.or([
          eb("sender_id", "=", session.user.id),
          eb("receiver_id", "=", session.user.id),
        ])
      )
      .selectAll()
      .executeTakeFirst();

    if (req) {
      await networkDb
        .deleteFrom("connection_requests")
        .where("id", "=", connectionId)
        .execute();
      return Response.json({ success: true });
    }

    return Response.json({ error: "Not found" }, { status: 404 });
  } catch (err) {
    console.error(`DELETE /api/network/connections/${connectionId} error:`, err);
    return Response.json({ error: "Failed to remove connection" }, { status: 500 });
  }
}
