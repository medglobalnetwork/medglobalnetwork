// ============================================================
// MGN Recommendation Engine — Multi-Source Candidate Generation
// modules/recommendations/lib/candidate-generators.ts
// ============================================================

import { networkDb, ensureNetworkingTables } from "@/modules/network/lib/network-db";
import { recDb, ensureRecommendationTables } from "./recommendations-db";
import { sql } from "kysely";
import type {
  RecommendationCandidate,
  RecommendationCategory,
  UserInterestProfile,
  CandidateSourceConfig,
} from "../types";

export interface CandidateGenerationContext {
  userId: string;
  userProfile: any | null;
  interestProfile: UserInterestProfile;
  excludedUserIds: Set<string>;
  category?: RecommendationCategory;
  sourceConfig: CandidateSourceConfig;
  limit?: number;
}

/**
 * Master multi-source candidate generator.
 * Runs multiple parallel generator queries, aggregates unique candidates, and tags their candidate sources.
 */
export async function generateCandidates(
  ctx: CandidateGenerationContext
): Promise<RecommendationCandidate[]> {
  await ensureNetworkingTables();
  await ensureRecommendationTables();

  const {
    userId,
    userProfile,
    interestProfile,
    excludedUserIds,
    category,
    sourceConfig,
  } = ctx;

  const candidateMap = new Map<string, RecommendationCandidate>();

  const addCandidate = (
    c: RecommendationCandidate,
    source: string,
    extraData?: Partial<RecommendationCandidate>
  ) => {
    if (!c.user_id || excludedUserIds.has(c.user_id)) return;

    if (!candidateMap.has(c.user_id)) {
      candidateMap.set(c.user_id, {
        ...c,
        candidate_source: source,
        ...extraData,
      });
    } else {
      const existing = candidateMap.get(c.user_id)!;
      // Merge mutual connection details or shared tags if found
      if (
        extraData?.mutual_connection_count &&
        (!existing.mutual_connection_count ||
          extraData.mutual_connection_count > existing.mutual_connection_count)
      ) {
        existing.mutual_connection_count = extraData.mutual_connection_count;
        existing.mutual_connection_names = extraData.mutual_connection_names;
      }
      if (extraData?.shared_community_names) {
        existing.shared_community_names = Array.from(
          new Set([
            ...(existing.shared_community_names || []),
            ...extraData.shared_community_names,
          ])
        );
      }
    }
  };

  // ─────────────────────────────────────────────
  // 1. Dedicated Category-Specific Candidate Generators
  // ─────────────────────────────────────────────

  if (category === "similar-professionals") {
    const similarCandidates = await getSimilarProfessionalsCandidates(
      userId,
      userProfile,
      interestProfile,
      excludedUserIds
    );
    similarCandidates.forEach((c) => addCandidate(c, "specialization"));
    if (candidateMap.size >= 10) return Array.from(candidateMap.values());
  }

  if (category === "same-organization" && userProfile?.organization) {
    const orgCandidates = await getSameOrganizationCandidates(
      userId,
      userProfile.organization,
      excludedUserIds
    );
    orgCandidates.forEach((c) => addCandidate(c, "organization"));
    if (candidateMap.size >= 10) return Array.from(candidateMap.values());
  }

  if (
    category === "alumni" &&
    (userProfile?.primary_degree || (userProfile?.additional_degrees && userProfile.additional_degrees.length > 0))
  ) {
    const alumniCandidates = await getAlumniCandidates(userId, userProfile, excludedUserIds);
    alumniCandidates.forEach((c) => addCandidate(c, "alumni"));
    if (candidateMap.size >= 10) return Array.from(candidateMap.values());
  }

  if (category === "research-connections") {
    const researchCandidates = await getResearchCandidates(
      userId,
      userProfile,
      interestProfile,
      excludedUserIds
    );
    researchCandidates.forEach((c) => addCandidate(c, "research"));
    if (candidateMap.size >= 10) return Array.from(candidateMap.values());
  }

  if (category === "community-connections") {
    const commCandidates = await getCommunityCandidates(userId, excludedUserIds);
    commCandidates.forEach((c) => addCandidate(c, "community"));
    if (candidateMap.size >= 10) return Array.from(candidateMap.values());
  }

  if (category === "event-connections") {
    const eventCandidates = await getEventCandidates(userId, userProfile, excludedUserIds);
    eventCandidates.forEach((c) => addCandidate(c, "event"));
    if (candidateMap.size >= 10) return Array.from(candidateMap.values());
  }

  if (category === "career-connections") {
    const careerCandidates = await getCareerCandidates(userId, userProfile, excludedUserIds);
    careerCandidates.forEach((c) => addCandidate(c, "career"));
    if (candidateMap.size >= 10) return Array.from(candidateMap.values());
  }

  if (category === "learning-connections") {
    const learningCandidates = await getSharedLearningCandidates(userId, excludedUserIds);
    learningCandidates.forEach((c) => addCandidate(c, "learning"));
    if (candidateMap.size >= 10) return Array.from(candidateMap.values());
  }

  if (category === "location-based" && (userProfile?.city || userProfile?.state)) {
    const locCandidates = await getLocationCandidates(userId, userProfile, excludedUserIds);
    locCandidates.forEach((c) => addCandidate(c, "location"));
    if (candidateMap.size >= 10) return Array.from(candidateMap.values());
  }

  // ─────────────────────────────────────────────
  // 2. Global Multi-Source Candidate Retrieval
  // ─────────────────────────────────────────────
  const tasks: Promise<any>[] = [];

  // Source A: 2nd Degree Graph Mutual Connections
  if (sourceConfig.enable_mutual_connections && userId !== "guest") {
    tasks.push(
      getMutualConnectionCandidates(userId, excludedUserIds)
        .then((list) => {
          list.forEach(({ candidate, mutualCount, mutualNames }) => {
            addCandidate(candidate, "mutual_connections", {
              mutual_connection_count: mutualCount,
              mutual_connection_names: mutualNames,
            });
          });
        })
        .catch((err) => console.warn("Mutual connection generator error:", err))
    );
  }

  // Source B: Same Organization & Colleagues
  if (sourceConfig.enable_same_organization && userProfile?.organization) {
    tasks.push(
      getSameOrganizationCandidates(userId, userProfile.organization, excludedUserIds)
        .then((list) => {
          list.forEach((c) => addCandidate(c, "organization"));
        })
        .catch((err) => console.warn("Organization generator error:", err))
    );
  }

  // Source C: Same Profession & Specialization
  if (sourceConfig.enable_same_specialization && userProfile?.specialization) {
    tasks.push(
      getSameSpecializationCandidates(
        userId,
        userProfile.profession,
        userProfile.specialization,
        excludedUserIds
      )
        .then((list) => {
          list.forEach((c) => addCandidate(c, "specialization"));
        })
        .catch((err) => console.warn("Specialization generator error:", err))
    );
  }

  // Source D: Shared Communities
  if (sourceConfig.enable_shared_communities && userId !== "guest") {
    tasks.push(
      getCommunityCandidates(userId, excludedUserIds)
        .then((list) => {
          list.forEach((c) => addCandidate(c, "community"));
        })
        .catch((err) => console.warn("Community generator error:", err))
    );
  }

  // Source E: Shared Learning & Courses
  if (sourceConfig.enable_shared_learning && userId !== "guest") {
    tasks.push(
      getSharedLearningCandidates(userId, excludedUserIds)
        .then((list) => {
          list.forEach((c) => addCandidate(c, "learning"));
        })
        .catch((err) => console.warn("Learning generator error:", err))
    );
  }

  // Source F: Shared Research & Clinical Interests
  if (sourceConfig.enable_shared_research) {
    tasks.push(
      getResearchCandidates(userId, userProfile, interestProfile, excludedUserIds)
        .then((list) => {
          list.forEach((c) => addCandidate(c, "research"));
        })
        .catch((err) => console.warn("Research generator error:", err))
    );
  }

  // Source G: Location & Regional Relevance
  if (sourceConfig.enable_location && (userProfile?.city || userProfile?.state)) {
    tasks.push(
      getLocationCandidates(userId, userProfile, excludedUserIds)
        .then((list) => {
          list.forEach((c) => addCandidate(c, "location"));
        })
        .catch((err) => console.warn("Location generator error:", err))
    );
  }

  // Source H: Behavioral & Interest Profile Match
  if (
    sourceConfig.enable_behavioral &&
    interestProfile &&
    Object.keys(interestProfile.interests).length > 0
  ) {
    tasks.push(
      getInterestBasedCandidates(userId, interestProfile, excludedUserIds)
        .then((list) => {
          list.forEach((c) => addCandidate(c, "behavioral"));
        })
        .catch((err) => console.warn("Interest generator error:", err))
    );
  }

  await Promise.all(tasks);

  // ─────────────────────────────────────────────
  // 3. Cold Start Fallback if insufficient candidates found (< 15)
  // ─────────────────────────────────────────────
  if (candidateMap.size < 15 && sourceConfig.enable_cold_start) {
    const needed = Math.max(15, 25 - candidateMap.size);
    const coldStartCandidates = await getColdStartCandidates(
      userId,
      userProfile,
      excludedUserIds,
      needed
    );
    coldStartCandidates.forEach((c) => addCandidate(c, "cold_start"));
  }

  return Array.from(candidateMap.values());
}

// ─────────────────────────────────────────────
// 1. MUTUAL CONNECTIONS (2ND DEGREE GRAPH)
// ─────────────────────────────────────────────
async function getMutualConnectionCandidates(
  userId: string,
  excludedIds: Set<string>
): Promise<Array<{ candidate: RecommendationCandidate; mutualCount: number; mutualNames: string[] }>> {
  if (!userId || userId === "guest") return [];

  const raw: any = await sql`
    WITH my_connections AS (
      SELECT CASE WHEN user_a_id = ${userId} THEN user_b_id ELSE user_a_id END AS friend_id
      FROM connections
      WHERE user_a_id = ${userId} OR user_b_id = ${userId}
    ),
    second_degree AS (
      SELECT 
        CASE WHEN c.user_a_id = mc.friend_id THEN c.user_b_id ELSE c.user_a_id END AS candidate_id,
        mc.friend_id
      FROM connections c
      JOIN my_connections mc ON (c.user_a_id = mc.friend_id OR c.user_b_id = mc.friend_id)
      WHERE c.user_a_id <> ${userId} AND c.user_b_id <> ${userId}
    ),
    aggregated AS (
      SELECT 
        candidate_id, 
        COUNT(DISTINCT friend_id) AS mutual_count,
        ARRAY_AGG(DISTINCT friend_id) AS mutual_friend_ids
      FROM second_degree
      GROUP BY candidate_id
      HAVING COUNT(DISTINCT friend_id) >= 1
      ORDER BY mutual_count DESC
      LIMIT 40
    )
    SELECT 
      agg.candidate_id,
      agg.mutual_count,
      u.id AS user_id,
      u.name,
      u.image,
      pp.profession,
      pp.specialization,
      pp.sub_specialization,
      pp.designation,
      pp.organization,
      pp.primary_degree,
      pp.additional_degrees,
      pp.city,
      pp.state,
      pp.country,
      pp.skills,
      pp.identity_verified,
      pp.education_verified,
      pp.registration_verified,
      pp.experience_verified,
      pp.experience_years,
      pp.cover_image_url,
      pp.username,
      pp.member_id,
      pp.membership_tier,
      pp.is_founding_member
    FROM aggregated agg
    JOIN "user" u ON u.id = agg.candidate_id
    LEFT JOIN professional_profiles pp ON pp.user_id = u.id
    WHERE (pp.profile_visibility IS NULL OR pp.profile_visibility <> 'private')
    LIMIT 30;
  `.execute(networkDb);

  if (!raw?.rows) return [];

  const results: Array<{ candidate: RecommendationCandidate; mutualCount: number; mutualNames: string[] }> = [];

  for (const row of raw.rows) {
    if (!row.user_id || excludedIds.has(row.user_id)) continue;
    results.push({
      candidate: mapRowToCandidate(row),
      mutualCount: parseInt(row.mutual_count, 10) || 1,
      mutualNames: [],
    });
  }

  return results;
}

// ─────────────────────────────────────────────
// 2. SAME ORGANIZATION CANDIDATES
// ─────────────────────────────────────────────
async function getSameOrganizationCandidates(
  userId: string,
  organization: string,
  excludedIds: Set<string>
): Promise<RecommendationCandidate[]> {
  if (!organization || organization.trim().length < 2) return [];

  const raw: any = await sql`
    SELECT 
      u.id AS user_id,
      u.name,
      u.image,
      pp.profession,
      pp.specialization,
      pp.sub_specialization,
      pp.designation,
      pp.organization,
      pp.primary_degree,
      pp.additional_degrees,
      pp.city,
      pp.state,
      pp.country,
      pp.skills,
      pp.identity_verified,
      pp.education_verified,
      pp.registration_verified,
      pp.experience_verified,
      pp.experience_years,
      pp.cover_image_url,
      pp.username,
      pp.member_id,
      pp.membership_tier,
      pp.is_founding_member
    FROM professional_profiles pp
    JOIN "user" u ON u.id = pp.user_id
    WHERE pp.user_id <> ${userId}
      AND pp.organization ILIKE ${organization.trim()}
      AND (pp.profile_visibility IS NULL OR pp.profile_visibility <> 'private')
    ORDER BY pp.identity_verified DESC, pp.experience_years DESC
    LIMIT 30;
  `.execute(networkDb);

  if (!raw?.rows) return [];
  return raw.rows
    .filter((r: any) => r.user_id && !excludedIds.has(r.user_id))
    .map(mapRowToCandidate);
}

// ─────────────────────────────────────────────
// 3. ALUMNI CANDIDATES (SAME COLLEGE/DEGREE)
// ─────────────────────────────────────────────
async function getAlumniCandidates(
  userId: string,
  userProfile: any,
  excludedIds: Set<string>
): Promise<RecommendationCandidate[]> {
  const degree = userProfile.primary_degree;
  if (!degree || degree.trim().length < 2) return [];

  const raw: any = await sql`
    SELECT 
      u.id AS user_id,
      u.name,
      u.image,
      pp.profession,
      pp.specialization,
      pp.sub_specialization,
      pp.designation,
      pp.organization,
      pp.primary_degree,
      pp.additional_degrees,
      pp.city,
      pp.state,
      pp.country,
      pp.skills,
      pp.identity_verified,
      pp.education_verified,
      pp.registration_verified,
      pp.experience_verified,
      pp.experience_years,
      pp.cover_image_url,
      pp.username,
      pp.member_id,
      pp.membership_tier,
      pp.is_founding_member
    FROM professional_profiles pp
    JOIN "user" u ON u.id = pp.user_id
    WHERE pp.user_id <> ${userId}
      AND (
        pp.primary_degree ILIKE ${'%' + degree.trim() + '%'}
        OR (pp.additional_degrees IS NOT NULL AND ${degree.trim()} = ANY(pp.additional_degrees))
      )
      AND (pp.profile_visibility IS NULL OR pp.profile_visibility <> 'private')
    ORDER BY pp.identity_verified DESC, pp.created_at DESC
    LIMIT 30;
  `.execute(networkDb);

  if (!raw?.rows) return [];
  return raw.rows
    .filter((r: any) => r.user_id && !excludedIds.has(r.user_id))
    .map(mapRowToCandidate);
}

// ─────────────────────────────────────────────
// 4. SAME PROFESSION & SPECIALIZATION
// ─────────────────────────────────────────────
async function getSameSpecializationCandidates(
  userId: string,
  profession: string | null,
  specialization: string,
  excludedIds: Set<string>
): Promise<RecommendationCandidate[]> {
  if (!specialization || specialization.trim().length === 0) return [];

  const raw: any = await sql`
    SELECT 
      u.id AS user_id,
      u.name,
      u.image,
      pp.profession,
      pp.specialization,
      pp.sub_specialization,
      pp.designation,
      pp.organization,
      pp.primary_degree,
      pp.additional_degrees,
      pp.city,
      pp.state,
      pp.country,
      pp.skills,
      pp.identity_verified,
      pp.education_verified,
      pp.registration_verified,
      pp.experience_verified,
      pp.experience_years,
      pp.cover_image_url,
      pp.username,
      pp.member_id,
      pp.membership_tier,
      pp.is_founding_member
    FROM professional_profiles pp
    JOIN "user" u ON u.id = pp.user_id
    WHERE pp.user_id <> ${userId}
      AND (
        pp.specialization = ${specialization}
        OR pp.sub_specialization ILIKE ${'%' + specialization + '%'}
      )
      AND (pp.profile_visibility IS NULL OR pp.profile_visibility <> 'private')
    ORDER BY pp.identity_verified DESC, pp.experience_years DESC
    LIMIT 40;
  `.execute(networkDb);

  if (!raw?.rows) return [];
  return raw.rows
    .filter((r: any) => r.user_id && !excludedIds.has(r.user_id))
    .map(mapRowToCandidate);
}

// ─────────────────────────────────────────────
// 5. SIMILAR PROFESSIONALS (COMPREHENSIVE MATCH)
// ─────────────────────────────────────────────
async function getSimilarProfessionalsCandidates(
  userId: string,
  userProfile: any | null,
  interestProfile: UserInterestProfile,
  excludedIds: Set<string>
): Promise<RecommendationCandidate[]> {
  const prof = userProfile?.profession || null;
  const spec = userProfile?.specialization || null;

  const raw: any = await sql`
    SELECT 
      u.id AS user_id,
      u.name,
      u.image,
      pp.profession,
      pp.specialization,
      pp.sub_specialization,
      pp.designation,
      pp.organization,
      pp.primary_degree,
      pp.additional_degrees,
      pp.city,
      pp.state,
      pp.country,
      pp.skills,
      pp.identity_verified,
      pp.education_verified,
      pp.registration_verified,
      pp.experience_verified,
      pp.experience_years,
      pp.cover_image_url,
      pp.username,
      pp.member_id,
      pp.membership_tier,
      pp.is_founding_member
    FROM professional_profiles pp
    JOIN "user" u ON u.id = pp.user_id
    WHERE pp.user_id <> ${userId}
      AND (
        (${prof} IS NOT NULL AND pp.profession = ${prof})
        OR (${spec} IS NOT NULL AND (pp.specialization = ${spec} OR pp.sub_specialization ILIKE ${'%' + (spec || '') + '%'}))
      )
      AND (pp.profile_visibility IS NULL OR pp.profile_visibility <> 'private')
    ORDER BY 
      CASE WHEN ${spec} IS NOT NULL AND pp.specialization = ${spec} THEN 0 ELSE 1 END,
      pp.identity_verified DESC,
      pp.experience_years DESC
    LIMIT 40;
  `.execute(networkDb);

  if (!raw?.rows) return [];
  return raw.rows
    .filter((r: any) => r.user_id && !excludedIds.has(r.user_id))
    .map(mapRowToCandidate);
}

// ─────────────────────────────────────────────
// 6. RESEARCH CANDIDATES
// ─────────────────────────────────────────────
async function getResearchCandidates(
  userId: string,
  userProfile: any | null,
  interestProfile: UserInterestProfile,
  excludedIds: Set<string>
): Promise<RecommendationCandidate[]> {
  const spec = userProfile?.specialization || userProfile?.profession || "Research";
  const researchKeywords = ["Research", "Clinical", "Trials", "Publication", "Evidence", "Study", "Specialist"];

  const raw: any = await sql`
    SELECT 
      u.id AS user_id,
      u.name,
      u.image,
      pp.profession,
      pp.specialization,
      pp.sub_specialization,
      pp.designation,
      pp.organization,
      pp.primary_degree,
      pp.additional_degrees,
      pp.city,
      pp.state,
      pp.country,
      pp.skills,
      pp.identity_verified,
      pp.education_verified,
      pp.registration_verified,
      pp.experience_verified,
      pp.experience_years,
      pp.cover_image_url,
      pp.username,
      pp.member_id,
      pp.membership_tier,
      pp.is_founding_member
    FROM professional_profiles pp
    JOIN "user" u ON u.id = pp.user_id
    WHERE pp.user_id <> ${userId}
      AND (
        pp.specialization ILIKE ${'%' + spec + '%'}
        OR pp.sub_specialization ILIKE ${'%' + spec + '%'}
        OR pp.designation ILIKE '%Researcher%'
        OR pp.designation ILIKE '%Scientist%'
        OR pp.designation ILIKE '%Fellow%'
        OR pp.skills && ARRAY['Clinical Research', 'Biostatistics', 'Research Methodology', 'Data Analysis']::text[]
      )
      AND (pp.profile_visibility IS NULL OR pp.profile_visibility <> 'private')
    ORDER BY pp.identity_verified DESC, pp.experience_years DESC
    LIMIT 30;
  `.execute(networkDb);

  if (!raw?.rows) return [];
  return raw.rows
    .filter((r: any) => r.user_id && !excludedIds.has(r.user_id))
    .map(mapRowToCandidate);
}

// ─────────────────────────────────────────────
// 7. COMMUNITY CANDIDATES
// ─────────────────────────────────────────────
async function getCommunityCandidates(
  userId: string,
  excludedIds: Set<string>
): Promise<RecommendationCandidate[]> {
  if (!userId || userId === "guest") return [];

  const raw: any = await sql`
    WITH my_comms AS (
      SELECT community_id FROM community_members WHERE user_id = ${userId}
    ),
    peers AS (
      SELECT DISTINCT cm.user_id, c.name AS comm_name
      FROM community_members cm
      JOIN my_comms mc ON mc.community_id = cm.community_id
      JOIN communities c ON c.id = cm.community_id
      WHERE cm.user_id <> ${userId}
      LIMIT 50
    )
    SELECT 
      u.id AS user_id,
      u.name,
      u.image,
      pp.profession,
      pp.specialization,
      pp.sub_specialization,
      pp.designation,
      pp.organization,
      pp.primary_degree,
      pp.additional_degrees,
      pp.city,
      pp.state,
      pp.country,
      pp.skills,
      pp.identity_verified,
      pp.education_verified,
      pp.registration_verified,
      pp.experience_verified,
      pp.experience_years,
      pp.cover_image_url,
      pp.username,
      pp.member_id,
      pp.membership_tier,
      pp.is_founding_member
    FROM peers p
    JOIN "user" u ON u.id = p.user_id
    LEFT JOIN professional_profiles pp ON pp.user_id = u.id
    WHERE (pp.profile_visibility IS NULL OR pp.profile_visibility <> 'private')
    LIMIT 30;
  `.execute(networkDb);

  if (!raw?.rows) return [];
  return raw.rows
    .filter((r: any) => r.user_id && !excludedIds.has(r.user_id))
    .map(mapRowToCandidate);
}

// ─────────────────────────────────────────────
// 8. EVENT CANDIDATES
// ─────────────────────────────────────────────
async function getEventCandidates(
  userId: string,
  userProfile: any | null,
  excludedIds: Set<string>
): Promise<RecommendationCandidate[]> {
  const spec = userProfile?.specialization || "Clinical";

  const raw: any = await sql`
    SELECT 
      u.id AS user_id,
      u.name,
      u.image,
      pp.profession,
      pp.specialization,
      pp.sub_specialization,
      pp.designation,
      pp.organization,
      pp.primary_degree,
      pp.additional_degrees,
      pp.city,
      pp.state,
      pp.country,
      pp.skills,
      pp.identity_verified,
      pp.education_verified,
      pp.registration_verified,
      pp.experience_verified,
      pp.experience_years,
      pp.cover_image_url,
      pp.username,
      pp.member_id,
      pp.membership_tier,
      pp.is_founding_member
    FROM professional_profiles pp
    JOIN "user" u ON u.id = pp.user_id
    WHERE pp.user_id <> ${userId}
      AND (pp.specialization ILIKE ${'%' + spec + '%'} OR pp.profession = ${userProfile?.profession || null})
      AND (pp.profile_visibility IS NULL OR pp.profile_visibility <> 'private')
    ORDER BY pp.identity_verified DESC, pp.created_at DESC
    LIMIT 25;
  `.execute(networkDb);

  if (!raw?.rows) return [];
  return raw.rows
    .filter((r: any) => r.user_id && !excludedIds.has(r.user_id))
    .map(mapRowToCandidate);
}

// ─────────────────────────────────────────────
// 9. CAREER CANDIDATES
// ─────────────────────────────────────────────
async function getCareerCandidates(
  userId: string,
  userProfile: any | null,
  excludedIds: Set<string>
): Promise<RecommendationCandidate[]> {
  const prof = userProfile?.profession || null;

  const raw: any = await sql`
    SELECT 
      u.id AS user_id,
      u.name,
      u.image,
      pp.profession,
      pp.specialization,
      pp.sub_specialization,
      pp.designation,
      pp.organization,
      pp.primary_degree,
      pp.additional_degrees,
      pp.city,
      pp.state,
      pp.country,
      pp.skills,
      pp.identity_verified,
      pp.education_verified,
      pp.registration_verified,
      pp.experience_verified,
      pp.experience_years,
      pp.cover_image_url,
      pp.username,
      pp.member_id,
      pp.membership_tier,
      pp.is_founding_member
    FROM professional_profiles pp
    JOIN "user" u ON u.id = pp.user_id
    WHERE pp.user_id <> ${userId}
      AND (
        (${prof} IS NOT NULL AND pp.profession = ${prof})
        OR pp.experience_years >= 8
        OR pp.designation ILIKE '%Head%'
        OR pp.designation ILIKE '%Director%'
        OR pp.designation ILIKE '%Senior%'
      )
      AND (pp.profile_visibility IS NULL OR pp.profile_visibility <> 'private')
    ORDER BY pp.experience_years DESC, pp.identity_verified DESC
    LIMIT 30;
  `.execute(networkDb);

  if (!raw?.rows) return [];
  return raw.rows
    .filter((r: any) => r.user_id && !excludedIds.has(r.user_id))
    .map(mapRowToCandidate);
}

// ─────────────────────────────────────────────
// 10. SHARED LEARNING CANDIDATES
// ─────────────────────────────────────────────
async function getSharedLearningCandidates(
  userId: string,
  excludedIds: Set<string>
): Promise<RecommendationCandidate[]> {
  if (!userId || userId === "guest") return [];

  const raw: any = await sql`
    WITH my_courses AS (
      SELECT course_id FROM course_enrollments WHERE user_id = ${userId}
    ),
    peers AS (
      SELECT DISTINCT ce.user_id
      FROM course_enrollments ce
      JOIN my_courses mc ON mc.course_id = ce.course_id
      WHERE ce.user_id <> ${userId}
      LIMIT 40
    )
    SELECT 
      u.id AS user_id,
      u.name,
      u.image,
      pp.profession,
      pp.specialization,
      pp.sub_specialization,
      pp.designation,
      pp.organization,
      pp.primary_degree,
      pp.additional_degrees,
      pp.city,
      pp.state,
      pp.country,
      pp.skills,
      pp.identity_verified,
      pp.education_verified,
      pp.registration_verified,
      pp.experience_verified,
      pp.experience_years,
      pp.cover_image_url,
      pp.username,
      pp.member_id,
      pp.membership_tier,
      pp.is_founding_member
    FROM peers p
    JOIN "user" u ON u.id = p.user_id
    LEFT JOIN professional_profiles pp ON pp.user_id = u.id
    WHERE (pp.profile_visibility IS NULL OR pp.profile_visibility <> 'private')
    LIMIT 25;
  `.execute(networkDb);

  if (!raw?.rows) return [];
  return raw.rows
    .filter((r: any) => r.user_id && !excludedIds.has(r.user_id))
    .map(mapRowToCandidate);
}

// ─────────────────────────────────────────────
// 11. LOCATION CANDIDATES (REGIONAL)
// ─────────────────────────────────────────────
async function getLocationCandidates(
  userId: string,
  userProfile: any,
  excludedIds: Set<string>
): Promise<RecommendationCandidate[]> {
  const city = userProfile?.city || null;
  const state = userProfile?.state || null;
  if (!city && !state) return [];

  const raw: any = await sql`
    SELECT 
      u.id AS user_id,
      u.name,
      u.image,
      pp.profession,
      pp.specialization,
      pp.sub_specialization,
      pp.designation,
      pp.organization,
      pp.primary_degree,
      pp.additional_degrees,
      pp.city,
      pp.state,
      pp.country,
      pp.skills,
      pp.identity_verified,
      pp.education_verified,
      pp.registration_verified,
      pp.experience_verified,
      pp.experience_years,
      pp.cover_image_url,
      pp.username,
      pp.member_id,
      pp.membership_tier,
      pp.is_founding_member
    FROM professional_profiles pp
    JOIN "user" u ON u.id = pp.user_id
    WHERE pp.user_id <> ${userId}
      AND (
        (${city} IS NOT NULL AND pp.city ILIKE ${city})
        OR (${state} IS NOT NULL AND pp.state ILIKE ${state})
      )
      AND (pp.profile_visibility IS NULL OR pp.profile_visibility <> 'private')
    ORDER BY pp.identity_verified DESC, pp.created_at DESC
    LIMIT 30;
  `.execute(networkDb);

  if (!raw?.rows) return [];
  return raw.rows
    .filter((r: any) => r.user_id && !excludedIds.has(r.user_id))
    .map(mapRowToCandidate);
}

// ─────────────────────────────────────────────
// 12. INTEREST & BEHAVIORAL CANDIDATES
// ─────────────────────────────────────────────
async function getInterestBasedCandidates(
  userId: string,
  interestProfile: UserInterestProfile,
  excludedIds: Set<string>
): Promise<RecommendationCandidate[]> {
  const topTopics = (interestProfile.topSpecializations || []).slice(0, 3);
  if (topTopics.length === 0) {
    const keys = Object.keys(interestProfile.interests || {});
    if (keys.length > 0) topTopics.push(...keys.slice(0, 3));
    else return [];
  }

  const topic1 = topTopics[0];
  const topic2 = topTopics[1] || topic1;

  const raw: any = await sql`
    SELECT 
      u.id AS user_id,
      u.name,
      u.image,
      pp.profession,
      pp.specialization,
      pp.sub_specialization,
      pp.designation,
      pp.organization,
      pp.primary_degree,
      pp.additional_degrees,
      pp.city,
      pp.state,
      pp.country,
      pp.skills,
      pp.identity_verified,
      pp.education_verified,
      pp.registration_verified,
      pp.experience_verified,
      pp.experience_years,
      pp.cover_image_url,
      pp.username,
      pp.member_id,
      pp.membership_tier,
      pp.is_founding_member
    FROM professional_profiles pp
    JOIN "user" u ON u.id = pp.user_id
    WHERE pp.user_id <> ${userId}
      AND (
        pp.specialization ILIKE ${'%' + topic1 + '%'}
        OR pp.sub_specialization ILIKE ${'%' + topic1 + '%'}
        OR pp.profession ILIKE ${'%' + topic1 + '%'}
        OR (pp.skills IS NOT NULL AND ${topic1} = ANY(pp.skills))
        OR pp.specialization ILIKE ${'%' + topic2 + '%'}
      )
      AND (pp.profile_visibility IS NULL OR pp.profile_visibility <> 'private')
    LIMIT 35;
  `.execute(networkDb);

  if (!raw?.rows) return [];
  return raw.rows
    .filter((r: any) => r.user_id && !excludedIds.has(r.user_id))
    .map(mapRowToCandidate);
}

// ─────────────────────────────────────────────
// 13. COLD START FALLBACK CANDIDATES
// ─────────────────────────────────────────────
async function getColdStartCandidates(
  userId: string,
  userProfile: any | null,
  excludedIds: Set<string>,
  limit = 20
): Promise<RecommendationCandidate[]> {
  const userProfession = userProfile?.profession || null;

  const raw: any = await sql`
    SELECT 
      u.id AS user_id,
      u.name,
      u.image,
      pp.profession,
      pp.specialization,
      pp.sub_specialization,
      pp.designation,
      pp.organization,
      pp.primary_degree,
      pp.additional_degrees,
      pp.city,
      pp.state,
      pp.country,
      pp.skills,
      pp.identity_verified,
      pp.education_verified,
      pp.registration_verified,
      pp.experience_verified,
      pp.experience_years,
      pp.cover_image_url,
      pp.username,
      pp.member_id,
      pp.membership_tier,
      pp.is_founding_member
    FROM professional_profiles pp
    JOIN "user" u ON u.id = pp.user_id
    WHERE pp.user_id <> ${userId}
      AND (pp.profile_visibility IS NULL OR pp.profile_visibility <> 'private')
    ORDER BY 
      CASE WHEN ${userProfession} IS NOT NULL AND pp.profession = ${userProfession} THEN 0 ELSE 1 END,
      pp.identity_verified DESC,
      pp.registration_verified DESC,
      pp.experience_years DESC
    LIMIT ${limit};
  `.execute(networkDb);

  if (!raw?.rows) return [];
  return raw.rows
    .filter((r: any) => r.user_id && !excludedIds.has(r.user_id))
    .map(mapRowToCandidate);
}

function mapRowToCandidate(r: any): RecommendationCandidate {
  return {
    user_id: r.user_id,
    name: r.name || "Healthcare Professional",
    image: r.image || null,
    profession: r.profession || null,
    specialization: r.specialization || null,
    sub_specialization: r.sub_specialization || null,
    designation: r.designation || null,
    organization: r.organization || null,
    primary_degree: r.primary_degree || null,
    additional_degrees: Array.isArray(r.additional_degrees) ? r.additional_degrees : null,
    city: r.city || null,
    state: r.state || null,
    country: r.country || "India",
    skills: Array.isArray(r.skills) ? r.skills : null,
    identity_verified: Boolean(r.identity_verified),
    education_verified: Boolean(r.education_verified),
    registration_verified: Boolean(r.registration_verified),
    experience_verified: Boolean(r.experience_verified),
    experience_years: Number(r.experience_years) || 0,
    profile_visibility: r.profile_visibility || null,
    cover_image_url: r.cover_image_url || null,
    username: r.username || null,
    member_id: r.member_id || null,
    membership_tier: r.membership_tier || null,
    is_founding_member: Boolean(r.is_founding_member),
  };
}
