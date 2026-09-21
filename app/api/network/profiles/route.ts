// app/api/network/profiles/route.ts
import { auth } from "@/lib/auth";
import { networkDb, generateId } from "@/modules/network/lib/network-db";
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
    let base = networkDb
      .selectFrom("user as u")
      .leftJoin("professional_profiles as pp", "pp.user_id", "u.id")
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
          "u.image",
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
    return Response.json({ error: "Failed to fetch profiles" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const existing = await networkDb
      .selectFrom("professional_profiles")
      .where("user_id", "=", session.user.id)
      .selectAll()
      .executeTakeFirst();

    const now = new Date();

    if (existing) {
      await networkDb
        .updateTable("professional_profiles")
        .set({
          profession: body.profession ?? existing.profession,
          specialization: body.specialization ?? existing.specialization,
          designation: body.designation ?? existing.designation,
          primary_degree: body.primaryDegree ?? existing.primary_degree,
          additional_degrees: body.additionalDegrees ?? existing.additional_degrees,
          organization: body.organization ?? existing.organization,
          city: body.city ?? existing.city,
          state: body.state ?? existing.state,
          bio: body.bio ?? existing.bio,
          skills: body.skills ?? existing.skills,
          experience_years: body.experienceYears ?? existing.experience_years,
          profile_visibility: body.profileVisibility ?? existing.profile_visibility,
          updated_at: now,
        })
        .where("user_id", "=", session.user.id)
        .execute();

      return Response.json({ success: true, action: "updated" });
    } else {
      await networkDb
        .insertInto("professional_profiles")
        .values({
          id: generateId(),
          user_id: session.user.id,
          profession: body.profession ?? null,
          specialization: body.specialization ?? null,
          designation: body.designation ?? null,
          primary_degree: body.primaryDegree ?? null,
          additional_degrees: body.additionalDegrees ?? null,
          medical_council: body.medicalCouncil ?? null,
          registration_number: body.registrationNumber ?? null,
          organization: body.organization ?? null,
          city: body.city ?? null,
          state: body.state ?? null,
          country: body.country ?? "India",
          experience_years: body.experienceYears ?? null,
          bio: body.bio ?? null,
          skills: body.skills ?? null,
          languages: body.languages ?? null,
          identity_verified: false,
          education_verified: false,
          registration_verified: false,
          experience_verified: false,
          profile_visibility: body.profileVisibility ?? "public",
          cover_image_url: null,
          created_at: now,
          updated_at: now,
        })
        .execute();

      return Response.json({ success: true, action: "created" });
    }
  } catch (err) {
    console.error("POST /api/network/profiles error:", err);
    return Response.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
