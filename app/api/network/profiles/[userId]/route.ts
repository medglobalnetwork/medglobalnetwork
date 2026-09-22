// app/api/network/profiles/[userId]/route.ts
import { auth } from "@/lib/auth";
import { networkDb } from "@/modules/network/lib/network-db";
import { headers } from "next/headers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { userId } = await params;

  try {
    const profile = await networkDb
      .selectFrom("professional_profiles as pp")
      .innerJoin("user as u", "u.id", "pp.user_id")
      .select([
        "pp.id",
        "pp.user_id",
        "u.name",
        "u.image",
        "pp.profession",
        "pp.specialization",
        "pp.sub_specialization",
        "pp.designation",
        "pp.primary_degree",
        "pp.additional_degrees",
        "pp.medical_council",
        "pp.registration_number",
        "pp.organization",
        "pp.city",
        "pp.state",
        "pp.country",
        "pp.experience_years",
        "pp.bio",
        "pp.skills",
        "pp.languages",
        "pp.identity_verified",
        "pp.education_verified",
        "pp.registration_verified",
        "pp.experience_verified",
        "pp.cover_image_url",
        "pp.profile_visibility",
        "pp.created_at",
      ])
      .where("pp.user_id", "=", userId)
      .executeTakeFirst();

    if (!profile) {
      // Return basic user info if no professional profile exists
      const user = await networkDb
        .selectFrom("user")
        .select(["id", "name", "image"])
        .where("id", "=", userId)
        .executeTakeFirst();

      if (!user) {
        return Response.json({ error: "User not found" }, { status: 404 });
      }

      return Response.json({
        data: {
          user_id: user.id,
          name: user.name,
          image: user.image,
          identity_verified: false,
          education_verified: false,
          registration_verified: false,
          experience_verified: false,
        },
      });
    }

    // Count connections and followers
    const [connCount, followerCount, followingCount] = await Promise.all([
      networkDb
        .selectFrom("connections")
        .where((eb) =>
          eb.or([eb("user_a_id", "=", userId), eb("user_b_id", "=", userId)])
        )
        .select((eb) => eb.fn.countAll<string>().as("total"))
        .executeTakeFirst(),
      networkDb
        .selectFrom("follows")
        .where("following_id", "=", userId)
        .select((eb) => eb.fn.countAll<string>().as("total"))
        .executeTakeFirst(),
      networkDb
        .selectFrom("follows")
        .where("follower_id", "=", userId)
        .select((eb) => eb.fn.countAll<string>().as("total"))
        .executeTakeFirst(),
    ]);

    // Check current user's relationship with this profile
    const [conn, req, follow] = await Promise.all([
      networkDb
        .selectFrom("connections")
        .where((eb) =>
          eb.or([
            eb.and([eb("user_a_id", "=", session.user.id), eb("user_b_id", "=", userId)]),
            eb.and([eb("user_b_id", "=", session.user.id), eb("user_a_id", "=", userId)]),
          ])
        )
        .selectAll()
        .executeTakeFirst(),
      networkDb
        .selectFrom("connection_requests")
        .where((eb) =>
          eb.or([
            eb.and([eb("sender_id", "=", session.user.id), eb("receiver_id", "=", userId)]),
            eb.and([eb("receiver_id", "=", session.user.id), eb("sender_id", "=", userId)]),
          ])
        )
        .where("status", "=", "pending")
        .selectAll()
        .executeTakeFirst(),
      networkDb
        .selectFrom("follows")
        .where("follower_id", "=", session.user.id)
        .where("following_id", "=", userId)
        .selectAll()
        .executeTakeFirst(),
    ]);

    let connection_status = "none";
    if (conn) connection_status = "connected";
    else if (req?.sender_id === session.user.id) connection_status = "pending";
    else if (req?.receiver_id === session.user.id) connection_status = "received";

    return Response.json({
      data: {
        ...profile,
        connection_count: parseInt(connCount?.total ?? "0", 10),
        follower_count: parseInt(followerCount?.total ?? "0", 10),
        following_count: parseInt(followingCount?.total ?? "0", 10),
        connection_status,
        connection_request_id: req?.id,
        follow_status: follow ? "following" : "not_following",
        is_own_profile: session.user.id === userId,
      },
    });
  } catch (err) {
    console.error(`GET /api/network/profiles/${userId} error:`, err);
    return Response.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export { POST as PATCH, POST as PUT } from "../route";

