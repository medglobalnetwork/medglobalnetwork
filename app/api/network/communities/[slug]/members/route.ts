// app/api/network/communities/[slug]/members/route.ts
import { auth } from "@/lib/auth";
import { networkDb, generateId } from "@/modules/network/lib/network-db";
import { headers } from "next/headers";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { slug } = await params;

  try {
    const community = await networkDb
      .selectFrom("communities")
      .where("slug", "=", slug)
      .select(["id", "member_count"])
      .executeTakeFirst();

    if (!community) {
      return Response.json({ error: "Community not found" }, { status: 404 });
    }

    await networkDb
      .insertInto("community_members")
      .values({
        id: generateId(),
        community_id: community.id,
        user_id: session.user.id,
        role: "member",
        joined_at: new Date(),
      })
      .onConflict((oc) => oc.doNothing())
      .execute();

    await networkDb
      .updateTable("communities")
      .set((eb) => ({ member_count: eb("member_count", "+", 1) }))
      .where("id", "=", community.id)
      .execute();

    return Response.json({ success: true });
  } catch (err) {
    console.error("POST community join error:", err);
    return Response.json({ error: "Failed to join community" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { slug } = await params;

  try {
    const community = await networkDb
      .selectFrom("communities")
      .where("slug", "=", slug)
      .select(["id"])
      .executeTakeFirst();

    if (!community) {
      return Response.json({ error: "Community not found" }, { status: 404 });
    }

    const deleted = await networkDb
      .deleteFrom("community_members")
      .where("community_id", "=", community.id)
      .where("user_id", "=", session.user.id)
      .executeTakeFirst();

    if (Number(deleted.numDeletedRows) > 0) {
      await networkDb
        .updateTable("communities")
        .set((eb) => ({ member_count: eb("member_count", "-", 1) }))
        .where("id", "=", community.id)
        .execute();
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE community leave error:", err);
    return Response.json({ error: "Failed to leave community" }, { status: 500 });
  }
}
