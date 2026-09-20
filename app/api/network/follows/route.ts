// app/api/network/follows/route.ts
import { auth } from "@/lib/auth";
import { networkDb, generateId, createNotification } from "@/modules/network/lib/network-db";
import { headers } from "next/headers";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "following"; // 'following' | 'followers'
  const userId = searchParams.get("userId") ?? session.user.id;

  try {
    if (type === "followers") {
      const followers = await networkDb
        .selectFrom("follows as f")
        .innerJoin("user as u", "u.id", "f.follower_id")
        .leftJoin("professional_profiles as pp", "pp.user_id", "f.follower_id")
        .select([
          "f.id",
          "f.created_at",
          "u.id as user_id",
          "u.name",
          "u.image",
          "pp.profession",
          "pp.specialization",
          "pp.organization",
          "pp.city",
        ])
        .where("f.following_id", "=", userId)
        .orderBy("f.created_at", "desc")
        .execute();

      return Response.json({ data: followers });
    }

    // Following list
    const following = await networkDb
      .selectFrom("follows as f")
      .innerJoin("user as u", "u.id", "f.following_id")
      .leftJoin("professional_profiles as pp", "pp.user_id", "f.following_id")
      .select([
        "f.id",
        "f.created_at",
        "u.id as user_id",
        "u.name",
        "u.image",
        "pp.profession",
        "pp.specialization",
        "pp.organization",
        "pp.city",
      ])
      .where("f.follower_id", "=", userId)
      .orderBy("f.created_at", "desc")
      .execute();

    return Response.json({ data: following });
  } catch (err) {
    console.error("GET /api/network/follows error:", err);
    return Response.json({ error: "Failed to fetch follows" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const { followingId } = await request.json() as { followingId: string };

    if (!followingId) {
      return Response.json({ error: "followingId is required" }, { status: 400 });
    }

    if (followingId === session.user.id) {
      return Response.json({ error: "Cannot follow yourself" }, { status: 400 });
    }

    const existing = await networkDb
      .selectFrom("follows")
      .where("follower_id", "=", session.user.id)
      .where("following_id", "=", followingId)
      .selectAll()
      .executeTakeFirst();

    if (existing) {
      return Response.json({ error: "Already following" }, { status: 409 });
    }

    await networkDb
      .insertInto("follows")
      .values({
        id: generateId(),
        follower_id: session.user.id,
        following_id: followingId,
        created_at: new Date(),
      })
      .execute();

    await createNotification({
      userId: followingId,
      actorId: session.user.id,
      type: "new_follower",
      entityType: "user",
      entityId: session.user.id,
      message: `${session.user.name ?? "Someone"} started following you`,
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("POST /api/network/follows error:", err);
    return Response.json({ error: "Failed to follow" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const followingId = searchParams.get("followingId");

  if (!followingId) {
    return Response.json({ error: "followingId is required" }, { status: 400 });
  }

  try {
    await networkDb
      .deleteFrom("follows")
      .where("follower_id", "=", session.user.id)
      .where("following_id", "=", followingId)
      .execute();

    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/network/follows error:", err);
    return Response.json({ error: "Failed to unfollow" }, { status: 500 });
  }
}
