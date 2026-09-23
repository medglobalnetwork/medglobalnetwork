// ============================================================
// MGN Recommendation Engine — Explainability & "Why Suggested?" System
// modules/recommendations/lib/explainability.ts
// ============================================================

import type {
  RecommendationCandidate,
  RecommendationReason,
} from "../types";

export function generateRecommendationReasons(
  candidate: RecommendationCandidate,
  currentUserProfile: any | null
): { reasons: RecommendationReason[]; primaryReason: string } {
  const reasons: RecommendationReason[] = [];

  const my = currentUserProfile;
  const feat = candidate.features;

  // 1. Mutual Connections (Strongest social proof)
  if (candidate.mutual_connection_count && candidate.mutual_connection_count > 0) {
    const count = candidate.mutual_connection_count;
    reasons.push({
      type: "mutual_connections",
      label: count === 1 ? "1 mutual connection" : `${count} mutual connections`,
      detail: candidate.mutual_connection_names?.length
        ? `Including ${candidate.mutual_connection_names[0]}`
        : undefined,
      count,
      isPrivateSafe: true,
    });
  }

  // 2. Same Organization (Colleagues)
  if (feat?.same_organization && feat.same_organization >= 0.8 && candidate.organization) {
    reasons.push({
      type: "organization",
      label: `Colleague at ${candidate.organization}`,
      detail: candidate.organization,
      isPrivateSafe: true,
    });
  }

  // 3. Same Specialization
  if (feat?.same_specialization && feat.same_specialization >= 0.7 && candidate.specialization) {
    reasons.push({
      type: "specialization",
      label: `Both specialize in ${candidate.specialization}`,
      detail: candidate.specialization,
      isPrivateSafe: true,
    });
  } else if (candidate.specialization && my?.profession && candidate.profession === my.profession) {
    reasons.push({
      type: "specialization",
      label: `Fellow ${candidate.profession} · ${candidate.specialization}`,
      detail: candidate.specialization,
      isPrivateSafe: true,
    });
  }

  // 4. Same College / University (Alumni)
  if (feat?.same_education && feat.same_education >= 0.8 && candidate.primary_degree) {
    reasons.push({
      type: "university",
      label: `Alumni of ${candidate.primary_degree}`,
      detail: candidate.primary_degree,
      isPrivateSafe: true,
    });
  }

  // 5. Shared Community
  if (candidate.shared_community_names && candidate.shared_community_names.length > 0) {
    reasons.push({
      type: "community",
      label: `Member of ${candidate.shared_community_names[0]}`,
      detail: candidate.shared_community_names[0],
      isPrivateSafe: true,
    });
  } else if (candidate.candidate_source === "community") {
    reasons.push({
      type: "community",
      label: "Shared clinical community",
      isPrivateSafe: true,
    });
  }

  // 6. Shared Learning / Courses
  if (feat?.learning_similarity && feat.learning_similarity > 0.5) {
    reasons.push({
      type: "course",
      label: "Taking similar clinical courses",
      isPrivateSafe: true,
    });
  }

  // 7. Research / Behavioral Similarity
  if (feat?.research_similarity && feat.research_similarity > 0.6) {
    reasons.push({
      type: "research",
      label: "Similar clinical research interests",
      isPrivateSafe: true,
    });
  }

  // 8. Location Relevance
  if (feat?.location_relevance && feat.location_relevance >= 0.8 && candidate.city) {
    reasons.push({
      type: "location",
      label: `Practicing in ${candidate.city}`,
      detail: candidate.city,
      isPrivateSafe: true,
    });
  }

  // 9. Exploration / Discovery
  if (candidate.is_exploration) {
    reasons.push({
      type: "exploration",
      label: "Discover related healthcare specialty",
      isPrivateSafe: true,
    });
  }

  // 10. Fallback / Cold Start
  if (reasons.length === 0) {
    if (candidate.identity_verified || candidate.registration_verified) {
      reasons.push({
        type: "popular",
        label: `Verified ${candidate.profession || "Clinician"} on MGN`,
        isPrivateSafe: true,
      });
    } else if (candidate.profession) {
      reasons.push({
        type: "popular",
        label: `Healthcare professional in ${candidate.city || "India"}`,
        isPrivateSafe: true,
      });
    } else {
      reasons.push({
        type: "popular",
        label: "Healthcare professional you may know",
        isPrivateSafe: true,
      });
    }
  }

  const primaryReason = reasons[0]?.label || "Healthcare professional you may know";

  return {
    reasons,
    primaryReason,
  };
}
