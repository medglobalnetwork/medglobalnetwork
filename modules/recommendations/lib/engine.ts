// ============================================================
// MGN Recommendation Engine — Master Recommendation Engine Orchestrator
// modules/recommendations/lib/engine.ts
// ============================================================

import { networkDb, ensureNetworkingTables } from "@/modules/network/lib/network-db";
import { ensureRecommendationTables } from "./recommendations-db";
import { getRecommendationConfig } from "./admin-config";
import { getUserInterestProfile } from "./interest-profile";
import { getIneligibleUserIds, isCandidateDiscoverable } from "./eligibility-filter";
import { generateCandidates } from "./candidate-generators";
import { extractFeatures } from "./feature-extractor";
import { defaultRankingModel } from "./ranking-engine";
import { applyDiversityAndExploration } from "./diversity-engine";
import { generateRecommendationReasons } from "./explainability";
import { trackRecommendationImpressions } from "./event-pipeline";
import type {
  RecommendationQueryOptions,
  RecommendationResult,
  RecommendedUser,
  UserInterestProfile,
  RecommendationRuleConfig,
} from "../types";

/**
 * Master entry point for all recommendation requests across MGN:
 * Network, Home, Profile, Communities, Research, Jobs, Learn.
 */
export async function getPersonalizedRecommendations(
  options: RecommendationQueryOptions
): Promise<RecommendationResult> {
  const startTime = Date.now();
  await ensureNetworkingTables();
  await ensureRecommendationTables();

  const userId = options.userId;
  const category = options.category || "people-you-may-know";
  const limit = Math.min(Math.max(1, options.limit || 10), 50);
  const offset = Math.max(0, options.offset || 0);
  const source = options.source || "network_page";

  // 1. Fetch Active Recommendation Configuration
  const config = await getRecommendationConfig();

  // 2. A/B Experimentation Routing (if active)
  let activeVariant: "A" | "B" = options.forcedVariant || "A";
  let activeWeights = config.feature_weights;
  if (options.experimentId) {
    activeVariant = getExperimentVariant(userId || "guest", options.experimentId);
    // Variant B may test modified weights or diversity settings
    if (activeVariant === "B") {
      activeWeights = {
        ...activeWeights,
        same_specialization: activeWeights.same_specialization * 1.25,
        mutual_connections: activeWeights.mutual_connections * 1.3,
      };
    }
  }

  // 3. User Context & Interest Profile
  let currentUserProfile: any = null;
  let interestProfile: UserInterestProfile = {
    userId: userId || "guest",
    interests: {},
    topSpecializations: [],
    topSkills: [],
    lastActiveAt: new Date(),
    updatedAt: new Date(),
  };

  let ineligibleResult = {
    excludedUserIds: new Set<string>(options.excludeUserIds || []),
    blockedUserIds: new Set<string>(),
    connectedUserIds: new Set<string>(),
    pendingRequestUserIds: new Set<string>(),
    dismissedUserIds: new Set<string>(),
  };

  if (userId) {
    const [profile, interests, ineligibles] = await Promise.all([
      networkDb
        .selectFrom("professional_profiles")
        .selectAll()
        .where("user_id", "=", userId)
        .executeTakeFirst()
        .catch(() => null),
      getUserInterestProfile(userId).catch(() => interestProfile),
      getIneligibleUserIds(userId, options.excludeUserIds || []),
    ]);

    currentUserProfile = profile;
    interestProfile = interests;
    ineligibleResult = ineligibles;
  }

  // 4. Candidate Generation
  const rawCandidates = await generateCandidates({
    userId: userId || "guest",
    userProfile: currentUserProfile,
    interestProfile,
    excludedUserIds: ineligibleResult.excludedUserIds,
    category,
    sourceConfig: config.candidate_sources,
    limit: limit * 4, // Fetch larger candidate pool for ranking & diversity
  });

  // 5. Eligibility & Privacy Filter
  const eligibleCandidates = rawCandidates.filter((c) => {
    if (!c.user_id) return false;
    if (ineligibleResult.excludedUserIds.has(c.user_id)) return false;
    if (!isCandidateDiscoverable(c)) return false;
    return true;
  });

  // 6. Feature Extraction
  const candidatesWithFeatures = eligibleCandidates.map((candidate) => {
    const features = extractFeatures(candidate, {
      currentUserProfile,
      interestProfile,
      seenCandidateIds: new Set(),
      notInterestedIds: ineligibleResult.dismissedUserIds,
    });
    return { candidate, features };
  });

  // 7. Weighted Ranking Model
  const rankedItems = defaultRankingModel.rankCandidates(
    candidatesWithFeatures,
    activeWeights
  );

  const rankedCandidates = rankedItems.map((r) => ({
    ...r.candidate,
    score: r.score,
    features: r.features,
  }));

  // 8. Diversity & Exploration Re-ranking
  const diversifiedCandidates = applyDiversityAndExploration(rankedCandidates, {
    diversityConfig: config.diversity,
    explorationConfig: config.exploration,
    targetLimit: offset + limit + 10,
  });

  // 9. Pagination slice
  const paginatedCandidates = diversifiedCandidates.slice(offset, offset + limit);
  const hasMore = diversifiedCandidates.length > offset + limit;

  // 10. Generate "Why Suggested?" Explanations & Build Final Output
  const finalUsers: RecommendedUser[] = paginatedCandidates.map((c) => {
    const { reasons, primaryReason } = generateRecommendationReasons(c, currentUserProfile);

    return {
      id: c.user_id,
      user_id: c.user_id,
      username: c.username || undefined,
      member_id: c.member_id || undefined,
      is_founding_member: c.is_founding_member,
      membership_tier: c.membership_tier || "MEMBER",
      name: c.name,
      email: "",
      image: c.image,
      profession: c.profession || undefined,
      specialization: c.specialization || undefined,
      sub_specialization: c.sub_specialization || undefined,
      designation: c.designation || undefined,
      organization: c.organization || undefined,
      primary_degree: c.primary_degree || undefined,
      additional_degrees: c.additional_degrees || undefined,
      city: c.city || undefined,
      state: c.state || undefined,
      country: c.country || "India",
      experience_years: c.experience_years,
      skills: c.skills || undefined,
      identity_verified: c.identity_verified,
      education_verified: c.education_verified,
      registration_verified: c.registration_verified,
      experience_verified: c.experience_verified,
      cover_image_url: c.cover_image_url || undefined,
      mutual_connections: c.mutual_connection_count,
      connection_status: "none",
      follow_status: "not_following",
      recommendation_score: c.score || 0,
      recommendation_reasons: reasons,
      primary_reason: primaryReason,
      candidate_source: c.candidate_source || "general",
      is_exploration: Boolean(c.is_exploration),
      features: c.features,
    };
  });

  // 11. Asynchronously log recommendation impressions
  if (userId && finalUsers.length > 0) {
    trackRecommendationImpressions(
      userId,
      finalUsers.map((u, idx) => ({
        candidateId: u.user_id,
        recommendationType: category,
        source,
        score: u.recommendation_score,
        reasons: u.recommendation_reasons,
        position: offset + idx + 1,
        experimentId: options.experimentId,
        variant: activeVariant,
      }))
    ).catch((err) => console.warn("Impression logging error:", err));
  }

  const durationMs = Date.now() - startTime;

  return {
    data: finalUsers,
    total: diversifiedCandidates.length,
    hasMore,
    category,
    experiment: options.experimentId
      ? { id: options.experimentId, variant: activeVariant }
      : undefined,
    metadata: {
      candidateCount: rawCandidates.length,
      filteredCount: eligibleCandidates.length,
      rankedCount: rankedCandidates.length,
      durationMs,
    },
  };
}

/**
 * Deterministic hash for A/B experiment variant assignment (50/50 split).
 */
function getExperimentVariant(userId: string, experimentId: string): "A" | "B" {
  let hash = 0;
  const str = `${userId}:${experimentId}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 100 < 50 ? "A" : "B";
}
