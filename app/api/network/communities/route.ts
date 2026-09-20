// app/api/network/communities/route.ts
import { auth } from "@/lib/auth";
import { networkDb } from "@/modules/network/lib/network-db";
import { headers } from "next/headers";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const specialty = searchParams.get("specialty");
  const joined = searchParams.get("joined") === "true";

  try {
    let q = networkDb
      .selectFrom("communities as c")
      .select([
        "c.id",
        "c.slug",
        "c.name",
        "c.description",
        "c.specialty",
        "c.cover_url",
        "c.visibility",
        "c.join_mode",
        "c.member_count",
        "c.post_count",
        "c.created_at",
      ])
      .where("c.visibility", "<>", "private");

    if (query) {
      q = q.where((eb) =>
        eb.or([
          eb("c.name", "ilike", `%${query}%`),
          eb("c.specialty", "ilike", `%${query}%`),
          eb("c.description", "ilike", `%${query}%`),
        ])
      );
    }

    if (specialty) {
      q = q.where("c.specialty", "=", specialty);
    }

    if (joined) {
      q = q
        .innerJoin("community_members as cm", "cm.community_id", "c.id")
        .where("cm.user_id", "=", session.user.id);
    }

    const communities = await q.orderBy("c.member_count", "desc").limit(50).execute();

    // Enrich with membership status
    const memberCommunityIds = await networkDb
      .selectFrom("community_members")
      .where("user_id", "=", session.user.id)
      .select("community_id")
      .execute();
    const memberSet = new Set(memberCommunityIds.map((m) => m.community_id));

    const enriched = communities.map((c) => ({
      ...c,
      is_member: memberSet.has(c.id),
    }));

    return Response.json({ data: enriched });
  } catch (err) {
    console.error("GET /api/network/communities error:", err);
    return Response.json({ error: "Failed to fetch communities" }, { status: 500 });
  }
}
