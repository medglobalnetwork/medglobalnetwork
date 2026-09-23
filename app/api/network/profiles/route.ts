// app/api/network/profiles/route.ts
import { auth } from "@/lib/auth";
import { networkDb, generateId, ensureNetworkingTables, slugifyUsername } from "@/modules/network/lib/network-db";
import { generateRegularMemberId, generateFoundingMemberId, isDesignatedFounderEmail } from "@/modules/network/lib/member-id";
import { headers } from "next/headers";
import { sql } from "kysely";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const profession = searchParams.get("profession");
  const specialization = searchParams.get("specialization");
  const city = searchParams.get("city");
  const organization = searchParams.get("organization");
  const expMin = searchParams.get("expMin");
  const expMax = searchParams.get("expMax");
  const verifiedOnly = searchParams.get("verified") === "true";
  const query = searchParams.get("q");
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const pageSize = Math.min(parseInt(searchParams.get("pageSize") ?? "20", 10), 50);
  const offset = (page - 1) * pageSize;

  try {
    await ensureNetworkingTables();
    let base = networkDb
      .selectFrom("user as u")
      .leftJoin("professional_profiles as pp", "pp.user_id", "u.id")
      .leftJoin("mgn_identities as mi", "mi.user_id", "u.id")
      .where("u.id", "<>", session.user.id)
      .where((eb) =>
        eb.or([
          eb("pp.profile_visibility", "is", null),
          eb("pp.profile_visibility", "<>", "private"),
        ])
      );

    if (profession) base = base.where("pp.profession", "=", profession);
    if (specialization) base = base.where("pp.specialization", "=", specialization);
    if (city) base = base.where("pp.city", "ilike", `%${city}%`);
    if (organization) base = base.where("pp.organization", "ilike", `%${organization}%`);
    if (expMin !== null && expMin !== undefined) {
      base = base.where("pp.experience_years", ">=", parseInt(expMin, 10));
    }
    if (expMax !== null && expMax !== undefined && parseInt(expMax, 10) < 90) {
      base = base.where("pp.experience_years", "<=", parseInt(expMax, 10));
    }
    if (verifiedOnly) {
      base = base.where((eb) =>
        eb.or([
          eb("pp.identity_verified", "=", true),
          eb("pp.education_verified", "=", true),
          eb("pp.registration_verified", "=", true),
        ])
      );
    }
    if (query) {
      base = base.where((eb) =>
        eb.or([
          eb("u.name", "ilike", `%${query}%`),
          eb("u.email", "ilike", `%${query}%`),
          eb("pp.username", "ilike", `%${query}%`),
          eb("pp.member_id", "ilike", `%${query}%`),
          eb("pp.profession", "ilike", `%${query}%`),
          eb("pp.specialization", "ilike", `%${query}%`),
          eb("pp.organization", "ilike", `%${query}%`),
          eb("pp.city", "ilike", `%${query}%`),
        ])
      );
    }

    const [profiles, countResult] = await Promise.all([
      base
        .select([
          sql<string>`COALESCE(pp.id, u.id)`.as("id"),
          "u.id as user_id",
          "u.name",
          sql<string | null>`COALESCE(u.image, mi.profile_photo_url)`.as("image"),
          "pp.username",
          "pp.member_id",
          "pp.is_founding_member",
          "pp.membership_tier",
          "pp.profession",
          "pp.specialization",
          "pp.designation",
          "pp.primary_degree",
          "pp.additional_degrees",
          "pp.organization",
          "pp.city",
          "pp.state",
          "pp.experience_years",
          "pp.bio",
          "pp.skills",
          "pp.identity_verified",
          "pp.education_verified",
          "pp.registration_verified",
          "pp.experience_verified",
        ])
        .limit(pageSize)
        .offset(offset)
        .execute(),
      base
        .select((eb) => eb.fn.countAll<string>().as("total"))
        .executeTakeFirst(),
    ]);

    const total = parseInt(countResult?.total ?? "0", 10);

    // Enrich with connection status for each profile
    const enriched = await Promise.all(
      profiles.map(async (p) => {
        const [conn, req] = await Promise.all([
          networkDb
            .selectFrom("connections")
            .where((eb) =>
              eb.or([
                eb.and([eb("user_a_id", "=", session.user.id), eb("user_b_id", "=", p.user_id)]),
                eb.and([eb("user_b_id", "=", session.user.id), eb("user_a_id", "=", p.user_id)]),
              ])
            )
            .selectAll()
            .executeTakeFirst(),
          networkDb
            .selectFrom("connection_requests")
            .where((eb) =>
              eb.or([
                eb.and([eb("sender_id", "=", session.user.id), eb("receiver_id", "=", p.user_id)]),
                eb.and([eb("receiver_id", "=", session.user.id), eb("sender_id", "=", p.user_id)]),
              ])
            )
            .where("status", "=", "pending")
            .selectAll()
            .executeTakeFirst(),
        ]);

        let connection_status = "none";
        if (conn) connection_status = "connected";
        else if (req?.sender_id === session.user.id) connection_status = "pending";
        else if (req?.receiver_id === session.user.id) connection_status = "received";

        const follow = await networkDb
          .selectFrom("follows")
          .where("follower_id", "=", session.user.id)
          .where("following_id", "=", p.user_id)
          .selectAll()
          .executeTakeFirst();

        return {
          ...p,
          connection_status,
          connection_request_id: req?.id,
          follow_status: follow ? "following" : "not_following",
        };
      })
    );

    return Response.json({
      data: enriched,
      total,
      page,
      pageSize,
      hasMore: offset + pageSize < total,
    });
  } catch (err) {
    console.error("GET /api/network/profiles error:", err);
    return Response.json({ data: [], total: 0, page: 1, pageSize, hasMore: false, error: "Failed to fetch profiles" });
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const now = new Date();

    // 1. Update User Table if name or image is supplied
    if (body.name || body.image !== undefined) {
      const userUpdates: Record<string, any> = { updatedAt: now };
      if (body.name) userUpdates.name = body.name.trim();
      if (body.image !== undefined) userUpdates.image = body.image;

      await networkDb
        .updateTable("user")
        .set(userUpdates)
        .where("id", "=", session.user.id)
        .execute();

      if (body.image) {
        try {
          await networkDb
            .updateTable("mgn_identities" as any)
            .set({ profile_photo_url: body.image, updated_at: now })
            .where("user_id", "=", session.user.id)
            .execute();
        } catch {}
      }
    }

    // 2. Validate and format username if supplied
    let sanitizedUsername: string | undefined = undefined;
    if (body.username !== undefined && body.username !== null) {
      const candidate = slugifyUsername(body.username);
      if (candidate) {
        // Check uniqueness
        const collision = await networkDb
          .selectFrom("professional_profiles")
          .selectAll()
          .where("username", "=", candidate)
          .where("user_id", "<>", session.user.id)
          .executeTakeFirst();

        if (collision) {
          return Response.json({ error: "This username is already taken. Please choose another." }, { status: 400 });
        }
        sanitizedUsername = candidate;
      }
    }

    // 3. Update/Insert Professional Profile
    const existing = await networkDb
      .selectFrom("professional_profiles")
      .where("user_id", "=", session.user.id)
      .selectAll()
      .executeTakeFirst();

    const parsedSkills = Array.isArray(body.skills)
      ? body.skills
      : typeof body.skills === "string"
      ? body.skills.split(",").map((s: string) => s.trim()).filter(Boolean)
      : existing?.skills ?? null;

    const parsedAdditionalDegrees = Array.isArray(body.additionalDegrees || body.additional_degrees)
      ? body.additionalDegrees || body.additional_degrees
      : typeof (body.additionalDegrees || body.additional_degrees) === "string"
      ? (body.additionalDegrees || body.additional_degrees).split(",").map((s: string) => s.trim()).filter(Boolean)
      : existing?.additional_degrees ?? null;

    if (existing) {
      const isFounder = existing.is_founding_member || isDesignatedFounderEmail(session.user.email);
      const memberId = existing.member_id || (isFounder ? generateFoundingMemberId(1) : generateRegularMemberId());

      await networkDb
        .updateTable("professional_profiles")
        .set({
          username: sanitizedUsername !== undefined ? sanitizedUsername : existing.username,
          member_id: memberId,
          is_founding_member: isFounder,
          membership_tier: isFounder ? "FOUNDING_MEMBER" : (existing.membership_tier || "MEMBER"),
          profession: body.profession ?? existing.profession,
          specialization: body.specialization ?? existing.specialization,
          sub_specialization: body.subSpecialization ?? body.sub_specialization ?? existing.sub_specialization,
          designation: body.designation ?? existing.designation,
          primary_degree: body.primaryDegree ?? body.primary_degree ?? existing.primary_degree,
          additional_degrees: parsedAdditionalDegrees,
          medical_council: body.medicalCouncil ?? body.medical_council ?? existing.medical_council,
          registration_number: body.registrationNumber ?? body.registration_number ?? existing.registration_number,
          organization: body.organization ?? existing.organization,
          city: body.city ?? existing.city,
          state: body.state ?? existing.state,
          country: body.country ?? existing.country ?? "India",
          bio: body.bio ?? existing.bio,
          skills: parsedSkills,
          languages: body.languages ?? existing.languages,
          experience_years: body.experienceYears !== undefined 
            ? (body.experienceYears ? Number(body.experienceYears) : null)
            : body.experience_years !== undefined
            ? (body.experience_years ? Number(body.experience_years) : null)
            : existing.experience_years,
          cover_image_url: body.coverImageUrl !== undefined ? body.coverImageUrl : body.cover_image_url !== undefined ? body.cover_image_url : existing.cover_image_url,
          profile_visibility: body.profileVisibility ?? body.profile_visibility ?? existing.profile_visibility,
          updated_at: now,
        })
        .where("user_id", "=", session.user.id)
        .execute();
    } else {
      const isFounder = isDesignatedFounderEmail(session.user.email);
      const memberId = isFounder ? generateFoundingMemberId(1) : generateRegularMemberId();

      await networkDb
        .insertInto("professional_profiles")
        .values({
          id: generateId(),
          user_id: session.user.id,
          username: sanitizedUsername ?? slugifyUsername(body.name || session.user.name || "user"),
          member_id: memberId,
          is_founding_member: isFounder,
          membership_tier: isFounder ? "FOUNDING_MEMBER" : "MEMBER",
          profession: body.profession ?? null,
          specialization: body.specialization ?? null,
          sub_specialization: body.subSpecialization ?? body.sub_specialization ?? null,
          designation: body.designation ?? null,
          primary_degree: body.primaryDegree ?? body.primary_degree ?? null,
          additional_degrees: parsedAdditionalDegrees,
          medical_council: body.medicalCouncil ?? body.medical_council ?? null,
          registration_number: body.registrationNumber ?? body.registration_number ?? null,
          organization: body.organization ?? null,
          city: body.city ?? null,
          state: body.state ?? null,
          country: body.country ?? "India",
          experience_years: body.experienceYears ? Number(body.experienceYears) : body.experience_years ? Number(body.experience_years) : null,
          bio: body.bio ?? null,
          skills: parsedSkills,
          languages: body.languages ?? null,
          identity_verified: false,
          education_verified: false,
          registration_verified: false,
          experience_verified: false,
          profile_visibility: body.profileVisibility ?? body.profile_visibility ?? "public",
          cover_image_url: body.coverImageUrl ?? body.cover_image_url ?? null,
          created_at: now,
          updated_at: now,
        })
        .execute();
    }

    // 3. Update mgn_identities display_name if exists
    try {
      if (body.name || body.city || body.state || body.country || body.organization) {
        await networkDb
          .updateTable("mgn_identities" as any)
          .set({
            ...(body.name ? { display_name: body.name.trim() } : {}),
            ...(body.city ? { city: body.city } : {}),
            ...(body.state ? { state: body.state } : {}),
            ...(body.country ? { country: body.country } : {}),
            ...(body.organization ? { current_organization: body.organization } : {}),
            updated_at: now,
          })
          .where("user_id", "=", session.user.id)
          .execute();
      }
    } catch {
      // Non-blocking if table doesn't exist or column differs
    }

    // Return the updated combined profile
    const updatedUser = await networkDb
      .selectFrom("user")
      .select(["id", "name", "email", "image"])
      .where("id", "=", session.user.id)
      .executeTakeFirst();

    const updatedProfile = await networkDb
      .selectFrom("professional_profiles")
      .selectAll()
      .where("user_id", "=", session.user.id)
      .executeTakeFirst();

    return Response.json({
      success: true,
      data: {
        ...updatedProfile,
        name: updatedUser?.name,
        email: updatedUser?.email,
        image: updatedUser?.image,
        user_id: session.user.id,
      },
    });
  } catch (err: any) {
    console.error("POST /api/network/profiles error:", err);
    return Response.json({ error: err.message || "Failed to save profile" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  return POST(request);
}
