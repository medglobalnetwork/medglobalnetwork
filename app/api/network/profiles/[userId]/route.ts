// app/api/network/profiles/[userId]/route.ts
import { auth } from "@/lib/auth";
import { networkDb, ensureNetworkingTables, slugifyUsername, generateId } from "@/modules/network/lib/network-db";
import { generateRegularMemberId, generateFoundingMemberId, isDesignatedFounderEmail } from "@/modules/network/lib/member-id";
import { headers } from "next/headers";
import { sql } from "kysely";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { userId } = await params;
  const normalizedId = userId.toLowerCase().trim();
  const strippedId = normalizedId.replace(/[^a-z0-9]/g, "");

  const isSelf =
    userId === "me" ||
    userId === "self" ||
    userId === session.user.id ||
    normalizedId === (session.user.name || "").toLowerCase().trim() ||
    strippedId === (session.user.name || "").toLowerCase().replace(/[^a-z0-9]/g, "") ||
    normalizedId === (session.user.email || "").split("@")[0].toLowerCase().trim() ||
    strippedId === (session.user.email || "").split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");

  try {
    await ensureNetworkingTables();

    let profile = await networkDb
      .selectFrom("professional_profiles as pp")
      .innerJoin("user as u", "u.id", "pp.user_id")
      .leftJoin("mgn_identities as mi", "mi.user_id", "u.id")
      .select([
        "pp.id",
        "pp.user_id",
        "pp.username",
        "pp.member_id",
        "pp.is_founding_member",
        "pp.membership_tier",
        "u.name",
        "u.email",
        sql<string | null>`COALESCE(
          NULLIF(mi.profile_photo_url, ''),
          CASE WHEN u.image NOT LIKE '%googleusercontent%' AND u.image NOT LIKE '%ggpht.com%' THEN u.image ELSE NULL END,
          mi.profile_photo_url,
          u.image
        )`.as("image"),
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
      .where((eb) => {
        const conditions = [
          eb("pp.user_id", "=", userId),
          eb("pp.username", "=", normalizedId),
          eb("pp.member_id", "ilike", normalizedId),
          eb("pp.id", "=", userId),
          eb("u.id", "=", userId),
          eb("u.email", "ilike", normalizedId),
          eb("u.email", "ilike", `${normalizedId}@%`),
          eb("u.name", "ilike", normalizedId),
        ];
        if (isSelf && session.user.id) {
          conditions.push(eb("pp.user_id", "=", session.user.id));
        }
        return eb.or(conditions);
      })
      .executeTakeFirst();

    // If no professional profile exists, find the user and auto-create professional profile with username & member_id
    if (!profile) {
      let user = null;

      if (isSelf && session.user.id) {
        user = await networkDb
          .selectFrom("user")
          .select(["id", "name", "email", "image"])
          .where("id", "=", session.user.id)
          .executeTakeFirst();
      }

      if (!user) {
        user = await networkDb
          .selectFrom("user")
          .select(["id", "name", "email", "image"])
          .where((eb) =>
            eb.or([
              eb("id", "=", userId),
              eb("email", "ilike", normalizedId),
              eb("email", "ilike", `${normalizedId}@%`),
              eb("name", "ilike", normalizedId),
              eb("name", "ilike", `%${normalizedId}%`),
            ])
          )
          .executeTakeFirst();
      }

      if (!user) {
        return Response.json({ error: "User not found" }, { status: 404 });
      }

      // Generate clean username from name or email
      const baseUsername = slugifyUsername(user.name || user.email.split("@")[0] || "user");
      let usernameCandidate = baseUsername;

      // Check collision
      const collision = await networkDb
        .selectFrom("professional_profiles")
        .select(["user_id"])
        .where("username", "=", usernameCandidate)
        .executeTakeFirst();

      if (collision && collision.user_id !== user.id) {
        usernameCandidate = `${baseUsername}-${user.id.slice(0, 5).toLowerCase()}`;
      }

      const isFounder = isDesignatedFounderEmail(user.email);
      const memberId = isFounder ? generateFoundingMemberId(1) : generateRegularMemberId();

      const now = new Date();
      await networkDb
        .insertInto("professional_profiles")
        .values({
          id: generateId(),
          user_id: user.id,
          username: usernameCandidate,
          member_id: memberId,
          is_founding_member: isFounder,
          membership_tier: isFounder ? "FOUNDING_MEMBER" : "MEMBER",
          profession: "Physiotherapy",
          specialization: null,
          sub_specialization: null,
          designation: null,
          primary_degree: null,
          additional_degrees: null,
          medical_council: null,
          registration_number: null,
          organization: null,
          city: null,
          state: null,
          country: "India",
          experience_years: 0,
          bio: null,
          skills: null,
          languages: null,
          identity_verified: false,
          education_verified: false,
          registration_verified: false,
          experience_verified: false,
          profile_visibility: "public",
          cover_image_url: null,
          created_at: now,
          updated_at: now,
        })
        .execute();

      profile = {
        id: user.id,
        user_id: user.id,
        username: usernameCandidate,
        member_id: memberId,
        is_founding_member: isFounder,
        membership_tier: isFounder ? "FOUNDING_MEMBER" : "MEMBER",
        name: user.name,
        email: user.email,
        image: user.image,
        profession: "Physiotherapy",
        specialization: null,
        sub_specialization: null,
        designation: null,
        primary_degree: null,
        additional_degrees: null,
        medical_council: null,
        registration_number: null,
        organization: null,
        city: null,
        state: null,
        country: "India",
        experience_years: 0,
        bio: null,
        skills: null,
        languages: null,
        identity_verified: false,
        education_verified: false,
        registration_verified: false,
        experience_verified: false,
        cover_image_url: null,
        profile_visibility: "public",
        created_at: now,
      };
    }

    // Auto-generate username if missing in existing profile
    if (!profile.username) {
      const generated = slugifyUsername(profile.name || profile.email.split("@")[0] || "user");
      let cleanUsername = generated;

      const collision = await networkDb
        .selectFrom("professional_profiles")
        .where("username", "=", cleanUsername)
        .where("user_id", "<>", profile.user_id)
        .executeTakeFirst();

      if (collision) {
        cleanUsername = `${generated}-${profile.user_id.slice(0, 5).toLowerCase()}`;
      }

      await networkDb
        .updateTable("professional_profiles")
        .set({ username: cleanUsername, updated_at: new Date() })
        .where("user_id", "=", profile.user_id)
        .execute();

      profile.username = cleanUsername;
    }

    // Auto-assign member_id if missing in existing profile
    if (!profile.member_id) {
      const isFounder = isDesignatedFounderEmail(profile.email) || Boolean(profile.is_founding_member);
      const generatedMemberId = isFounder ? generateFoundingMemberId(1) : generateRegularMemberId();

      await networkDb
        .updateTable("professional_profiles")
        .set({
          member_id: generatedMemberId,
          is_founding_member: isFounder,
          membership_tier: isFounder ? "FOUNDING_MEMBER" : (profile.membership_tier || "MEMBER"),
          updated_at: new Date(),
        })
        .where("user_id", "=", profile.user_id)
        .execute();

      profile.member_id = generatedMemberId;
      profile.is_founding_member = isFounder;
      profile.membership_tier = isFounder ? "FOUNDING_MEMBER" : (profile.membership_tier || "MEMBER");
    }

    const targetUserId = profile.user_id;

    // Count connections, followers, and posts
    const [connCount, followerCount, followingCount, postCount] = await Promise.all([
      networkDb
        .selectFrom("connections")
        .where((eb) =>
          eb.or([eb("user_a_id", "=", targetUserId), eb("user_b_id", "=", targetUserId)])
        )
        .select((eb) => eb.fn.countAll<string>().as("total"))
        .executeTakeFirst(),
      networkDb
        .selectFrom("follows")
        .where("following_id", "=", targetUserId)
        .select((eb) => eb.fn.countAll<string>().as("total"))
        .executeTakeFirst(),
      networkDb
        .selectFrom("follows")
        .where("follower_id", "=", targetUserId)
        .select((eb) => eb.fn.countAll<string>().as("total"))
        .executeTakeFirst(),
      networkDb
        .selectFrom("network_posts")
        .where("author_id", "=", targetUserId)
        .select((eb) => eb.fn.countAll<string>().as("total"))
        .executeTakeFirst()
        .catch(() => ({ total: "0" })),
    ]);

    // Check relationship with session user
    const [conn, req, follow] = await Promise.all([
      networkDb
        .selectFrom("connections")
        .where((eb) =>
          eb.or([
            eb.and([eb("user_a_id", "=", session.user.id), eb("user_b_id", "=", targetUserId)]),
            eb.and([eb("user_b_id", "=", session.user.id), eb("user_a_id", "=", targetUserId)]),
          ])
        )
        .selectAll()
        .executeTakeFirst(),
      networkDb
        .selectFrom("connection_requests")
        .where((eb) =>
          eb.or([
            eb.and([eb("sender_id", "=", session.user.id), eb("receiver_id", "=", targetUserId)]),
            eb.and([eb("receiver_id", "=", session.user.id), eb("sender_id", "=", targetUserId)]),
          ])
        )
        .where("status", "=", "pending")
        .selectAll()
        .executeTakeFirst(),
      networkDb
        .selectFrom("follows")
        .where("follower_id", "=", session.user.id)
        .where("following_id", "=", targetUserId)
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
        post_count: parseInt(postCount?.total ?? "0", 10),
        connection_status,
        connection_request_id: req?.id,
        follow_status: follow ? "following" : "not_following",
        is_own_profile: session.user.id === targetUserId,
      },
    });
  } catch (err: any) {
    console.error(`GET /api/network/profiles/${userId} error:`, err);
    return Response.json({ error: err.message || "Failed to fetch profile" }, { status: 500 });
  }
}

export { POST as PATCH, POST as PUT } from "../route";
