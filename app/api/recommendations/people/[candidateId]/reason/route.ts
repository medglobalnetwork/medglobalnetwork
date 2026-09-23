// ============================================================
// MGN Recommendation Engine — "Why Suggested?" Reason API
// app/api/recommendations/people/[candidateId]/reason/route.ts
// ============================================================

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { networkDb, ensureNetworkingTables } from "@/modules/network/lib/network-db";
import { getUserInterestProfile } from "@/modules/recommendations/lib/interest-profile";
import { extractFeatures } from "@/modules/recommendations/lib/feature-extractor";
import { generateRecommendationReasons } from "@/modules/recommendations/lib/explainability";

export async function GET(
  request: Request,
  props: { params: Promise<{ candidateId: string }> }
) {
  try {
    const params = await props.params;
    const candidateId = params.candidateId;
    const session = await auth.api.getSession({ headers: await headers() });

    await ensureNetworkingTables();

    // Fetch candidate profile
    const candidateRow = await networkDb
      .selectFrom("user as u")
      .leftJoin("professional_profiles as pp", "pp.user_id", "u.id")
      .select([
        "u.id as user_id",
        "u.name",
        "u.image",
        "pp.profession",
        "pp.specialization",
        "pp.sub_specialization",
        "pp.designation",
        "pp.organization",
        "pp.primary_degree",
        "pp.additional_degrees",
        "pp.city",
        "pp.state",
        "pp.country",
        "pp.skills",
        "pp.identity_verified",
        "pp.education_verified",
        "pp.registration_verified",
        "pp.experience_verified",
        "pp.experience_years",
        "pp.profile_visibility",
        "pp.cover_image_url",
        "pp.username",
        "pp.member_id",
        "pp.membership_tier",
        "pp.is_founding_member",
      ])
      .where("u.id", "=", candidateId)
      .executeTakeFirst();

    if (!candidateRow) {
      return Response.json({ error: "Candidate not found" }, { status: 404 });
    }

    let currentUserProfile: any = null;
    let interestProfile: any = { interests: {}, topSpecializations: [], topSkills: [] };

    if (session?.user?.id) {
      currentUserProfile = await networkDb
        .selectFrom("professional_profiles")
        .selectAll()
        .where("user_id", "=", session.user.id)
        .executeTakeFirst();

      interestProfile = await getUserInterestProfile(session.user.id);
    }

    const candidate = {
      ...candidateRow,
      name: candidateRow.name || "Healthcare Professional",
      experience_years: Number(candidateRow.experience_years) || 0,
      identity_verified: Boolean(candidateRow.identity_verified),
      education_verified: Boolean(candidateRow.education_verified),
      registration_verified: Boolean(candidateRow.registration_verified),
      experience_verified: Boolean(candidateRow.experience_verified),
      is_founding_member: Boolean(candidateRow.is_founding_member),
    };

    const features = extractFeatures(candidate as any, {
      currentUserProfile,
      interestProfile,
    });

    const candidateWithFeatures = { ...candidate, features };
    const { reasons, primaryReason } = generateRecommendationReasons(
      candidateWithFeatures as any,
      currentUserProfile
    );

    return Response.json({
      candidateId,
      primaryReason,
      reasons,
      features,
    });
  } catch (err) {
    console.error("GET /api/recommendations/people/[candidateId]/reason error:", err);
    return Response.json({ error: "Failed to generate recommendation reason" }, { status: 500 });
  }
}
