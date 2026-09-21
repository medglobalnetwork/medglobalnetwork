// app/api/network/recommendations/route.ts
import { auth } from "@/lib/auth";
import { networkDb } from "@/modules/network/lib/network-db";
import { headers } from "next/headers";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "10", 10), 20);

  try {
    // Get current user's profile for matching
    const myProfile = await networkDb
      .selectFrom("professional_profiles")
      .where("user_id", "=", session.user.id)
      .select(["profession", "specialization", "city", "organization"])
      .executeTakeFirst();

    // Get IDs to exclude (self + already connected + pending)
    const [connections, sentRequests, receivedRequests] = await Promise.all([
      networkDb
        .selectFrom("connections")
        .where((eb) =>
          eb.or([
            eb("user_a_id", "=", session.user.id),
            eb("user_b_id", "=", session.user.id),
          ])
        )
        .select(["user_a_id", "user_b_id"])
        .execute(),
      networkDb
        .selectFrom("connection_requests")
        .where("sender_id", "=", session.user.id)
        .where("status", "=", "pending")
        .select("receiver_id")
        .execute(),
      networkDb
        .selectFrom("connection_requests")
        .where("receiver_id", "=", session.user.id)
        .where("status", "=", "pending")
        .select("sender_id")
        .execute(),
    ]);

    const excludeIds = new Set<string>([session.user.id]);
    connections.forEach((c) => {
      excludeIds.add(c.user_a_id);
      excludeIds.add(c.user_b_id);
    });
    sentRequests.forEach((r) => excludeIds.add(r.receiver_id));
    receivedRequests.forEach((r) => excludeIds.add(r.sender_id));

    // Rule-based recommendation: same profession/specialization/city
    let q = networkDb
      .selectFrom("user as u")
      .leftJoin("professional_profiles as pp", "pp.user_id", "u.id")
      .select([
        "u.id as user_id",
        "u.name",
        "u.image",
        "pp.profession",
        "pp.specialization",
        "pp.organization",
        "pp.city",
        "pp.state",
        "pp.identity_verified",
        "pp.education_verified",
        "pp.registration_verified",
        "pp.experience_verified",
        "pp.experience_years",
      ])
      .where((eb) =>
        eb.or([
          eb("pp.profile_visibility", "is", null),
          eb("pp.profile_visibility", "<>", "private"),
        ])
      );

    // Exclude already connected / pending / self
    if (excludeIds.size > 0) {
      q = q.where("u.id", "not in", [...excludeIds]);
    }

    // Prioritize matches
    if (myProfile?.profession) {
      q = q.where("pp.profession", "=", myProfile.profession);
    }

    const recommendations = await q.limit(limit).execute();

    return Response.json({
      data: recommendations.map((r) => ({
        ...r,
        connection_status: "none",
        follow_status: "not_following",
      })),
    });
  } catch (err) {
    console.error("GET /api/network/recommendations error:", err);
    return Response.json({ error: "Failed to fetch recommendations" }, { status: 500 });
  }
}
