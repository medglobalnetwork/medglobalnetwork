// ============================================================
// MGN Recommendation Engine — Diversity & Exploration Layer
// modules/recommendations/lib/diversity-engine.ts
// ============================================================

import type {
  RecommendationCandidate,
  DiversityConfig,
  ExplorationConfig,
} from "../types";

export interface DiversityContext {
  diversityConfig: DiversityConfig;
  explorationConfig: ExplorationConfig;
  targetLimit?: number;
}

/**
 * Applies Diversity & Exploration Re-ranking.
 * 1. Partitions ranked candidates into Exploitation (familiar/high-affinity) and Exploration (adjacent/discovery) pools.
 * 2. Interleaves Exploration candidates based on `exploration_ratio` (e.g. 1 discovery candidate every 5 items for 20%).
 * 3. Enforces diversity constraints: limits consecutive professionals with identical specialization or organization.
 */
export function applyDiversityAndExploration(
  rankedCandidates: RecommendationCandidate[],
  ctx: DiversityContext
): RecommendationCandidate[] {
  if (rankedCandidates.length === 0) return [];

  const { diversityConfig, explorationConfig, targetLimit } = ctx;
  const maxConsecutiveSpec = diversityConfig.max_consecutive_specialization || 2;
  const maxConsecutiveOrg = diversityConfig.max_consecutive_organization || 2;
  const explorationRatio = Math.max(0, Math.min(0.5, explorationConfig.exploration_ratio || 0.20));

  // 1. Separate candidates into Exploitation vs Exploration
  const exploitationPool: RecommendationCandidate[] = [];
  const explorationPool: RecommendationCandidate[] = [];

  for (const c of rankedCandidates) {
    const isAdjacentOrDiscovery =
      c.candidate_source === "cold_start" ||
      (c.features && c.features.same_specialization < 0.5 && (c.features.behavioral_similarity > 0.1 || c.features.shared_community > 0));

    if (isAdjacentOrDiscovery) {
      explorationPool.push({ ...c, is_exploration: true });
    } else {
      exploitationPool.push({ ...c, is_exploration: false });
    }
  }

  // 2. Interleave Exploration items according to exploration ratio
  const combinedCandidates: RecommendationCandidate[] = [];
  let expIndex = 0;
  let explIndex = 0;
  const explorationInterval = explorationRatio > 0 ? Math.round(1 / explorationRatio) : 999;

  let count = 0;
  while (combinedCandidates.length < rankedCandidates.length) {
    count++;
    // Every N items, pick from exploration pool if available
    if (count % explorationInterval === 0 && expIndex < explorationPool.length) {
      combinedCandidates.push(explorationPool[expIndex++]);
    } else if (explIndex < exploitationPool.length) {
      combinedCandidates.push(exploitationPool[explIndex++]);
    } else if (expIndex < explorationPool.length) {
      combinedCandidates.push(explorationPool[expIndex++]);
    } else {
      break;
    }
  }

  // 3. Apply Consecutive Similarity Constraints
  const finalResults: RecommendationCandidate[] = [];
  const delayedBuffer: RecommendationCandidate[] = [];

  let lastSpecialization: string | null = null;
  let consecutiveSpecCount = 0;
  let lastOrg: string | null = null;
  let consecutiveOrgCount = 0;

  for (const candidate of combinedCandidates) {
    const spec = candidate.specialization?.toLowerCase() || null;
    const org = candidate.organization?.toLowerCase() || null;

    let violatesSpec = false;
    if (spec && lastSpecialization === spec) {
      if (consecutiveSpecCount >= maxConsecutiveSpec) violatesSpec = true;
    }

    let violatesOrg = false;
    if (org && lastOrg === org) {
      if (consecutiveOrgCount >= maxConsecutiveOrg) violatesOrg = true;
    }

    if (violatesSpec || violatesOrg) {
      // Hold in buffer to insert later when context switches
      delayedBuffer.push(candidate);
    } else {
      finalResults.push(candidate);

      if (spec && lastSpecialization === spec) {
        consecutiveSpecCount++;
      } else {
        lastSpecialization = spec;
        consecutiveSpecCount = 1;
      }

      if (org && lastOrg === org) {
        consecutiveOrgCount++;
      } else {
        lastOrg = org;
        consecutiveOrgCount = 1;
      }

      // Check if we can drain an item from the delayed buffer
      if (delayedBuffer.length > 0) {
        const buffered = delayedBuffer[0];
        const bSpec = buffered.specialization?.toLowerCase() || null;
        const bOrg = buffered.organization?.toLowerCase() || null;

        if ((!bSpec || bSpec !== lastSpecialization) && (!bOrg || bOrg !== lastOrg)) {
          finalResults.push(delayedBuffer.shift()!);
          lastSpecialization = bSpec;
          lastOrg = bOrg;
          consecutiveSpecCount = 1;
          consecutiveOrgCount = 1;
        }
      }
    }
  }

  // Append any remaining items from buffer at the end
  for (const remaining of delayedBuffer) {
    finalResults.push(remaining);
  }

  if (targetLimit && targetLimit > 0) {
    return finalResults.slice(0, targetLimit);
  }

  return finalResults;
}
