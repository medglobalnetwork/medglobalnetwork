// app/api/network/notifications/route.ts
import { auth } from "@/lib/auth";
import { networkDb } from "@/modules/network/lib/network-db";
import { headers } from "next/headers";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get("unread") === "true";

  try {
    let q = networkDb
      .selectFrom("network_notifications as nn")
      .leftJoin("user as u", "u.id", "nn.actor_id")
      .leftJoin("professional_profiles as pp", "pp.user_id", "nn.actor_id")
      .select([
        "nn.id",
        "nn.type",
        "nn.entity_type",
        "nn.entity_id",
        "nn.message",
        "nn.is_read",
        "nn.created_at",
        "nn.actor_id",
        "u.name as actor_name",
        "u.image as actor_image",
        "pp.profession as actor_profession",
      ])
      .where("nn.user_id", "=", session.user.id);

    if (unreadOnly) {
      q = q.where("nn.is_read", "=", false);
    }

    const notifications = await q
      .orderBy("nn.created_at", "desc")
      .limit(50)
      .execute();

    const unreadCount = await networkDb
      .selectFrom("network_notifications")
      .where("user_id", "=", session.user.id)
      .where("is_read", "=", false)
      .select((eb) => eb.fn.countAll<string>().as("total"))
      .executeTakeFirst();

    return Response.json({
      data: notifications,
      unreadCount: parseInt(unreadCount?.total ?? "0", 10),
    });
  } catch (err) {
    console.error("GET /api/network/notifications error:", err);
    return Response.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const { ids } = (await request.json().catch(() => ({}))) as { ids?: string[] };

    if (ids && ids.length > 0) {
      await networkDb
        .updateTable("network_notifications")
        .set({ is_read: true })
        .where("user_id", "=", session.user.id)
        .where("id", "in", ids)
        .execute();
    } else {
      // Mark all read
      await networkDb
        .updateTable("network_notifications")
        .set({ is_read: true })
        .where("user_id", "=", session.user.id)
        .execute();
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/network/notifications error:", err);
    return Response.json({ error: "Failed to mark notifications" }, { status: 500 });
  }
}
