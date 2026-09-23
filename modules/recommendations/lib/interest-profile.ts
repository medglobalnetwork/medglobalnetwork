// ============================================================
// MGN Recommendation Engine — Dynamic Interest Profile & Time Decay
// modules/recommendations/lib/interest-profile.ts
// ============================================================

import { recDb, ensureRecommendationTables, generateRecId } from "./recommendations-db";
import { getRecommendationConfig } from "./admin-config";
import { networkDb, ensureNetworkingTables } from "@/modules/network/lib/network-db";
import type { UserInterestProfile } from "../types";

/**
 * Calculates exponential time decay factor.
 * lambda = ln(2) / half_life_days
 * decay = exp(-lambda * delta_days)
 */
export function calculateTimeDecay(eventDate: Date, halfLifeDays = 14, now = new Date()): number {
  const deltaMs = Math.max(0, now.getTime() - eventDate.getTime());
  const deltaDays = deltaMs / (1000 * 60 * 60 * 24);
  const lambda = Math.LN2 / Math.max(1, halfLifeDays);
  return Math.exp(-lambda * deltaDays);
}

/**
 * Retrieves the dynamic interest profile for a user.
 * If not present or stale (> 1 hour old), recomputes it from profile + recent behavior events.
 */
export async function getUserInterestProfile(userId: string): Promise<UserInterestProfile> {
  await ensureRecommendationTables();

  const existing = await recDb
    .selectFrom("user_interest_profiles")
    .selectAll()
    .where("user_id", "=", userId)
    .executeTakeFirst();

  const now = new Date();
  const ONE_HOUR = 60 * 60 * 1000;

  if (existing && existing.updated_at && now.getTime() - new Date(existing.updated_at).getTime() < ONE_HOUR) {
    const interests = typeof existing.interests === "string"
      ? JSON.parse(existing.interests)
      : (existing.interests || {});

    return {
      userId: existing.user_id,
      interests,
      topSpecializations: existing.top_specializations || [],
      topSkills: existing.top_skills || [],
      lastActiveAt: new Date(existing.last_active_at),
      updatedAt: new Date(existing.updated_at),
    };
  }

  // Otherwise recompute dynamic profile
  return await refreshUserInterestProfile(userId);
}

/**
 * Recomputes the user's interest vector from explicit profile data + behavioral event stream.
 */
export async function refreshUserInterestProfile(userId: string): Promise<UserInterestProfile> {
  await ensureNetworkingTables();
  await ensureRecommendationTables();

  const config = await getRecommendationConfig();
  const halfLifeDays = config.time_decay.half_life_days || 14;
  const now = new Date();

  // 1. Fetch user profile
  const profile = await networkDb
    .selectFrom("professional_profiles")
    .selectAll()
    .where("user_id", "=", userId)
    .executeTakeFirst();

  const interestScores: Record<string, number> = {};

  const addInterest = (topic: string | null | undefined, baseWeight: number) => {
    if (!topic || !topic.trim()) return;
    const cleanTopic = topic.trim();
    interestScores[cleanTopic] = (interestScores[cleanTopic] || 0) + baseWeight;
  };

  // 2. Explicit Profile Signals (High baseline affinity)
  if (profile) {
    addInterest(profile.profession, 1.0);
    addInterest(profile.specialization, 1.2);
    addInterest(profile.sub_specialization, 1.0);
    if (Array.isArray(profile.skills)) {
      profile.skills.forEach((s) => addInterest(s, 0.6));
    }
  }

  // 3. Behavioral Signals from last 90 days
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const events = await recDb
    .selectFrom("user_behavior_events")
    .selectAll()
    .where("user_id", "=", userId)
    .where("created_at", ">=", ninetyDaysAgo)
    .orderBy("created_at", "desc")
    .limit(300)
    .execute()
    .catch(() => []);

  // Event weight scale
  const EVENT_WEIGHTS: Record<string, number> = {
    search: 0.5,
    profile_view: 0.7,
    post_view: 0.3,
    post_like: 0.6,
    post_save: 0.9,
    post_share: 1.0,
    follow: 1.2,
    connect_request: 1.5,
    connect_accept: 1.5,
    course_view: 0.6,
    course_enroll: 1.4,
    course_complete: 2.0,
    job_view: 0.5,
    job_apply: 1.8,
    community_join: 1.3,
    research_view: 0.8,
  };

  for (const ev of events) {
    const decay = calculateTimeDecay(new Date(ev.created_at), halfLifeDays, now);
    const baseWeight = EVENT_WEIGHTS[ev.event_type] || 0.4;
    const effectiveWeight = baseWeight * decay;

    const meta = typeof ev.metadata === "string" ? JSON.parse(ev.metadata) : (ev.metadata || {});

    if (meta.topic) addInterest(meta.topic, effectiveWeight);
    if (meta.specialization) addInterest(meta.specialization, effectiveWeight);
    if (meta.profession) addInterest(meta.profession, effectiveWeight * 0.8);
    if (meta.searchQuery) addInterest(meta.searchQuery, effectiveWeight * 0.7);
    if (meta.skill) addInterest(meta.skill, effectiveWeight * 0.6);
  }

  // 4. Normalize interest scores between 0.05 and 1.0
  const maxScore = Math.max(...Object.values(interestScores), 1.0);
  const normalizedInterests: Record<string, number> = {};

  for (const [topic, rawScore] of Object.entries(interestScores)) {
    const normalized = Math.min(1.0, Math.round((rawScore / maxScore) * 100) / 100);
    if (normalized >= 0.05) {
      normalizedInterests[topic] = normalized;
    }
  }

  // 5. Derive Top Specializations & Skills
  const sortedTopics = Object.entries(normalizedInterests)
    .sort((a, b) => b[1] - a[1])
    .map(([topic]) => topic);

  const topSpecializations = sortedTopics.slice(0, 5);
  const topSkills = (profile?.skills || []).slice(0, 8);

  const result: UserInterestProfile = {
    userId,
    interests: normalizedInterests,
    topSpecializations,
    topSkills,
    lastActiveAt: now,
    updatedAt: now,
  };

  // 6. Upsert into user_interest_profiles
  await recDb
    .insertInto("user_interest_profiles")
    .values({
      id: generateRecId(),
      user_id: userId,
      interests: JSON.stringify(normalizedInterests),
      top_specializations: topSpecializations,
      top_skills: topSkills,
      last_active_at: now,
      created_at: now,
      updated_at: now,
    })
    .onConflict((oc) =>
      oc.column("user_id").doUpdateSet({
        interests: JSON.stringify(normalizedInterests),
        top_specializations: topSpecializations,
        top_skills: topSkills,
        last_active_at: now,
        updated_at: now,
      })
    )
    .execute()
    .catch((err) => console.warn("Failed to upsert user_interest_profiles:", err));

  return result;
}
