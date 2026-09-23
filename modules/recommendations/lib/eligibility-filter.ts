// ============================================================
// MGN Recommendation Engine — Eligibility & Privacy Filter
// modules/recommendations/lib/eligibility-filter.ts
// ============================================================

import { networkDb, ensureNetworkingTables } from "@/modules/network/lib/network-db";
import { recDb, ensureRecommendationTables } from "./recommendations-db";

export interface EligibilityFilterResult {
  excludedUserIds: Set<string>;
  blockedUserIds: Set<string>;
  connectedUserIds: Set<string>;
  pendingRequestUserIds: Set<string>;
  dismissedUserIds: Set<string>;
}

/**
 * Builds the comprehensive set of ineligible candidate user IDs for a given user.
 * Runs queries concurrently in a single batch to minimize latency.
 */
export async function getIneligibleUserIds(
  currentUserId: string,
  extraExcludes: string[] = []
): Promise<EligibilityFilterResult> {
  await ensureNetworkingTables();
  await ensureRecommendationTables();

  const excluded = new Set<string>([currentUserId, ...extraExcludes]);
  const blocked = new Set<string>();
  const connected = new Set<string>();
  const pending = new Set<string>();
  const dismissed = new Set<string>();

  try {
    const [
      connections,
      sentRequests,
      receivedRequests,
      blocksOut,
      blocksIn,
      negativeFeedback,
    ] = await Promise.all([
      // 1. Existing Connections
      networkDb
        .selectFrom("connections")
        .select(["user_a_id", "user_b_id"])
        .where((eb) =>
          eb.or([
            eb("user_a_id", "=", currentUserId),
            eb("user_b_id", "=", currentUserId),
          ])
        )
        .execute()
        .catch(() => []),

      // 2. Sent pending requests
      networkDb
        .selectFrom("connection_requests")
        .select("receiver_id")
        .where("sender_id", "=", currentUserId)
        .where("status", "=", "pending")
        .execute()
        .catch(() => []),

      // 3. Received pending requests
      networkDb
        .selectFrom("connection_requests")
        .select("sender_id")
        .where("receiver_id", "=", currentUserId)
        .where("status", "=", "pending")
        .execute()
        .catch(() => []),

      // 4. Blocks created by current user
      recDb
        .selectFrom("user_blocks")
        .select("blocked_id")
        .where("blocker_id", "=", currentUserId)
        .execute()
        .catch(() => []),

      // 5. Blocks targeting current user
      recDb
        .selectFrom("user_blocks")
        .select("blocker_id")
        .where("blocked_id", "=", currentUserId)
        .execute()
        .catch(() => []),

      // 6. Negative feedback ('not_interested', 'dont_suggest', 'block', 'report')
      recDb
        .selectFrom("recommendation_feedback")
        .select(["candidate_id", "feedback_type"])
        .where("user_id", "=", currentUserId)
        .where("feedback_type", "in", ["not_interested", "dont_suggest", "block", "report"])
        .execute()
        .catch(() => []),
    ]);

    // Process connections
    for (const c of connections) {
      const otherId = c.user_a_id === currentUserId ? c.user_b_id : c.user_a_id;
      if (otherId) {
        connected.add(otherId);
        excluded.add(otherId);
      }
    }

    // Process pending requests
    for (const r of sentRequests) {
      pending.add(r.receiver_id);
      excluded.add(r.receiver_id);
    }
    for (const r of receivedRequests) {
      pending.add(r.sender_id);
      excluded.add(r.sender_id);
    }

    // Process blocks (mutual exclusion)
    for (const b of blocksOut) {
      blocked.add(b.blocked_id);
      excluded.add(b.blocked_id);
    }
    for (const b of blocksIn) {
      blocked.add(b.blocker_id);
      excluded.add(b.blocker_id);
    }

    // Process negative feedback
    for (const fb of negativeFeedback) {
      dismissed.add(fb.candidate_id);
      excluded.add(fb.candidate_id);
    }
  } catch (err) {
    console.error("Error building ineligible user set:", err);
  }

  return {
    excludedUserIds: excluded,
    blockedUserIds: blocked,
    connectedUserIds: connected,
    pendingRequestUserIds: pending,
    dismissedUserIds: dismissed,
  };
}

/**
 * Checks if a candidate is discoverable based on privacy settings.
 */
export function isCandidateDiscoverable(
  profile: {
    profile_visibility?: string | null;
  }
): boolean {
  if (!profile.profile_visibility) return true;
  const visibility = profile.profile_visibility.toLowerCase().trim();
  if (visibility === "private" || visibility === "hidden" || visibility === "none") {
    return false;
  }
  return true;
}
