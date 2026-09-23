// ============================================================
// MGN Recommendation Engine — Feature Extraction Engine
// modules/recommendations/lib/feature-extractor.ts
// ============================================================

import type {
  RecommendationCandidate,
  RecommendationFeatureVector,
  UserInterestProfile,
} from "../types";

export interface FeatureExtractionContext {
  currentUserProfile: any | null;
  interestProfile: UserInterestProfile;
  seenCandidateIds?: Set<string>;
  notInterestedIds?: Set<string>;
  followingIds?: Set<string>;
  interactedUserIds?: Set<string>;
}

/**
 * Computes a normalized feature vector for a candidate relative to the current user.
 * Each feature value is bounded in [0.0, 1.0].
 */
export function extractFeatures(
  candidate: RecommendationCandidate,
  ctx: FeatureExtractionContext
): RecommendationFeatureVector {
  const my = ctx.currentUserProfile;
  const interests = ctx.interestProfile?.interests || {};

  // 1. Same Profession
  const sameProfession = (my?.profession && candidate.profession &&
    my.profession.trim().toLowerCase() === candidate.profession.trim().toLowerCase()) ? 1.0 : 0.0;

  // 2. Same Specialization
  let sameSpecialization = 0.0;
  if (my?.specialization && candidate.specialization) {
    const mySpec = my.specialization.trim().toLowerCase();
    const candSpec = candidate.specialization.trim().toLowerCase();
    if (mySpec === candSpec) {
      sameSpecialization = 1.0;
    } else if (mySpec.includes(candSpec) || candSpec.includes(mySpec)) {
      sameSpecialization = 0.7;
    }
  }
  if (sameSpecialization === 0 && my?.sub_specialization && candidate.sub_specialization) {
    if (my.sub_specialization.trim().toLowerCase() === candidate.sub_specialization.trim().toLowerCase()) {
      sameSpecialization = 0.8;
    }
  }

  // 3. Shared Skills (Jaccard-like overlap)
  let sharedSkills = 0.0;
  const mySkills: string[] = Array.isArray(my?.skills) ? my.skills : [];
  const candSkills: string[] = Array.isArray(candidate.skills) ? candidate.skills : [];
  if (mySkills.length > 0 && candSkills.length > 0) {
    const mySkillSet = new Set(mySkills.map((s) => s.trim().toLowerCase()));
    let overlap = 0;
    for (const cs of candSkills) {
      if (mySkillSet.has(cs.trim().toLowerCase())) overlap++;
    }
    sharedSkills = Math.min(1.0, overlap / Math.max(1, Math.min(mySkills.length, candSkills.length)));
  }

  // 4. Same Organization
  let sameOrg = 0.0;
  if (my?.organization && candidate.organization) {
    const myOrg = my.organization.trim().toLowerCase();
    const candOrg = candidate.organization.trim().toLowerCase();
    if (myOrg === candOrg) {
      sameOrg = 1.0;
    } else if (myOrg.length > 4 && (myOrg.includes(candOrg) || candOrg.includes(myOrg))) {
      sameOrg = 0.8;
    }
  }

  // 5. Same Education / College
  let sameEdu = 0.0;
  if (my?.primary_degree && candidate.primary_degree) {
    const myDegree = my.primary_degree.trim().toLowerCase();
    const candDegree = candidate.primary_degree.trim().toLowerCase();
    if (myDegree === candDegree) {
      sameEdu = 1.0;
    } else if (myDegree.length > 5 && (myDegree.includes(candDegree) || candDegree.includes(myDegree))) {
      sameEdu = 0.8;
    }
  }

  // 6. Mutual Connections (normalized 0 to 1, saturation at 5 connections)
  const mutualCount = candidate.mutual_connection_count || 0;
  const mutualConnections = Math.min(1.0, mutualCount / 5.0);

  // 7. Shared Community
  const commCount = (candidate.shared_community_names || []).length;
  const sharedCommunity = Math.min(1.0, commCount > 0 ? (commCount / 3.0) : (candidate.candidate_source === "community" ? 0.7 : 0.0));

  // 8. Research Similarity (Specialty & research interests overlap)
  let researchSim = 0.0;
  if (candidate.specialization && interests[candidate.specialization]) {
    researchSim = interests[candidate.specialization];
  } else if (candidate.profession && interests[candidate.profession]) {
    researchSim = interests[candidate.profession] * 0.7;
  }

  // 9. Shared Event / Learning
  const learningSim = candidate.candidate_source === "learning" ? 1.0 : (candidate.shared_course_names?.length ? 0.8 : 0.0);
  const sharedEvent = candidate.candidate_source === "event" ? 1.0 : 0.0;

  // 10. Location Relevance (City / State)
  let locationRel = 0.0;
  if (my?.city && candidate.city && my.city.trim().toLowerCase() === candidate.city.trim().toLowerCase()) {
    locationRel = 1.0;
  } else if (my?.state && candidate.state && my.state.trim().toLowerCase() === candidate.state.trim().toLowerCase()) {
    locationRel = 0.5;
  }

  // 11. Behavioral Similarity (Dynamic interest vector overlap)
  let behavioralSim = 0.0;
  let totalMatch = 0;
  let matchCount = 0;
  for (const [topic, weight] of Object.entries(interests)) {
    if (
      (candidate.specialization && candidate.specialization.toLowerCase().includes(topic.toLowerCase())) ||
      (candidate.profession && candidate.profession.toLowerCase().includes(topic.toLowerCase())) ||
      (candSkills.some((s) => s.toLowerCase().includes(topic.toLowerCase())))
    ) {
      totalMatch += weight;
      matchCount++;
    }
  }
  if (matchCount > 0) {
    behavioralSim = Math.min(1.0, totalMatch / matchCount);
  }

  // 12. Profile Interaction (Viewed / Liked before)
  const profileInteraction = ctx.interactedUserIds?.has(candidate.user_id) ? 1.0 : 0.0;

  // 13. Follow Relationship
  const followRel = ctx.followingIds?.has(candidate.user_id) ? 1.0 : 0.0;

  // 14. Verification Signal
  let verifSignal = 0.0;
  if (candidate.identity_verified) verifSignal += 0.4;
  if (candidate.registration_verified) verifSignal += 0.3;
  if (candidate.education_verified) verifSignal += 0.2;
  if (candidate.experience_verified) verifSignal += 0.1;
  verifSignal = Math.min(1.0, verifSignal);

  // 15. Profile Quality (Completeness score)
  let quality = 0.2;
  if (candidate.image) quality += 0.2;
  if (candidate.designation) quality += 0.15;
  if (candidate.organization) quality += 0.15;
  if (candSkills.length > 0) quality += 0.15;
  if (candidate.experience_years > 0) quality += 0.15;
  quality = Math.min(1.0, quality);

  // 16. Negative features
  const alreadySeen = ctx.seenCandidateIds?.has(candidate.user_id) ? 1.0 : 0.0;
  const notInterested = ctx.notInterestedIds?.has(candidate.user_id) ? 1.0 : 0.0;

  return {
    same_profession: sameProfession,
    same_specialization: sameSpecialization,
    shared_skills: sharedSkills,
    same_organization: sameOrg,
    same_education: sameEdu,
    mutual_connections: mutualConnections,
    shared_community: sharedCommunity,
    research_similarity: researchSim,
    shared_event: sharedEvent,
    learning_similarity: learningSim,
    location_relevance: locationRel,
    behavioral_similarity: behavioralSim,
    profile_interaction: profileInteraction,
    follow_relationship: followRel,
    verification_signal: verifSignal,
    profile_quality: quality,
    already_seen: alreadySeen,
    not_interested: notInterested,
  };
}
