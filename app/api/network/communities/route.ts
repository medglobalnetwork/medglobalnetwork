import { auth } from "@/lib/auth";
import { networkDb, ensureNetworkingTables } from "@/modules/network/lib/network-db";
import { headers } from "next/headers";
import { sql } from "kysely";

const DUMMY_SLUGS = [
  "physiotherapy-india",
  "cardiology-network",
  "medical-students-forum",
  "clinical-research-hub",
  "nursing-excellence",
  "sports-medicine-rehab",
  "radiology-imaging",
  "pediatrics-india",
];

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required", communities: [], data: [] }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const specialty = searchParams.get("specialty");
  const joined = searchParams.get("joined") === "true";

  try {
    await ensureNetworkingTables();

    // Auto-purge any seed dummy communities from database
    try {
      await sql`
        DELETE FROM communities 
        WHERE slug = ANY(${DUMMY_SLUGS}) OR created_by IS NULL
      `.execute(networkDb);
    } catch {
      // Ignore if table or constraints prevent immediate deletion
    }

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
      .where("c.visibility", "<>", "private")
      .where("c.slug", "not in", DUMMY_SLUGS)
      .where("c.created_by", "is not", null);

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

    const enriched = (communities || []).map((c) => ({
      ...c,
      is_member: memberSet.has(c.id),
    }));

    return Response.json({ communities: enriched, data: enriched });
  } catch (err) {
    console.error("GET /api/network/communities error:", err);
    return Response.json({ communities: [], data: [], error: "Failed to fetch communities" });
  }
}
