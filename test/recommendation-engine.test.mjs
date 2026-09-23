// ============================================================
// MGN Recommendation Engine — Unit & Functional Verification Tests
// test/recommendation-engine.test.mjs
// ============================================================

import { test, describe } from "node:test";
import assert from "node:assert/strict";

// ─────────────────────────────────────────────
// 1. Time Decay Math
// ─────────────────────────────────────────────
function calculateTimeDecay(eventDate, halfLifeDays = 14, now = new Date()) {
  const deltaMs = Math.max(0, now.getTime() - eventDate.getTime());
  const deltaDays = deltaMs / (1000 * 60 * 60 * 24);
  const lambda = Math.LN2 / Math.max(1, halfLifeDays);
  return Math.exp(-lambda * deltaDays);
}

// ─────────────────────────────────────────────
// 2. Feature Extraction Logic
// ─────────────────────────────────────────────
function extractFeatures(candidate, ctx) {
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

  // 3. Shared Skills
  const mySkills = Array.isArray(my?.skills) ? my.skills : [];
  const candSkills = Array.isArray(candidate.skills) ? candidate.skills : [];
  let sharedSkills = 0.0;
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

  // 5. Same Education
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

  // 6. Mutual Connections
  const mutualCount = candidate.mutual_connection_count || 0;
  const mutualConnections = Math.min(1.0, mutualCount / 5.0);

  // 7. Shared Community
  const commCount = (candidate.shared_community_names || []).length;
  const sharedCommunity = Math.min(1.0, commCount > 0 ? (commCount / 3.0) : (candidate.candidate_source === "community" ? 0.7 : 0.0));

  // 8. Research Similarity
  let researchSim = 0.0;
  if (candidate.specialization && interests[candidate.specialization]) {
    researchSim = interests[candidate.specialization];
  } else if (candidate.profession && interests[candidate.profession]) {
    researchSim = interests[candidate.profession] * 0.7;
  }

  // 9. Shared Event / Learning
  const learningSim = candidate.candidate_source === "learning" ? 1.0 : (candidate.shared_course_names?.length ? 0.8 : 0.0);
  const sharedEvent = candidate.candidate_source === "event" ? 1.0 : 0.0;

  // 10. Location Relevance
  let locationRel = 0.0;
  if (my?.city && candidate.city && my.city.trim().toLowerCase() === candidate.city.trim().toLowerCase()) {
    locationRel = 1.0;
  } else if (my?.state && candidate.state && my.state.trim().toLowerCase() === candidate.state.trim().toLowerCase()) {
    locationRel = 0.5;
  }

  // 11. Behavioral Similarity
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

  // 12. Verification Signal
  let verifSignal = 0.0;
  if (candidate.identity_verified) verifSignal += 0.4;
  if (candidate.registration_verified) verifSignal += 0.3;
  if (candidate.education_verified) verifSignal += 0.2;
  if (candidate.experience_verified) verifSignal += 0.1;
  verifSignal = Math.min(1.0, verifSignal);

  // 13. Profile Quality
  let quality = 0.2;
  if (candidate.image) quality += 0.2;
  if (candidate.designation) quality += 0.15;
  if (candidate.organization) quality += 0.15;
  if (candSkills.length > 0) quality += 0.15;
  if (candidate.experience_years > 0) quality += 0.15;
  quality = Math.min(1.0, quality);

  // Negative features
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
    verification_signal: verifSignal,
    profile_quality: quality,
    already_seen: alreadySeen,
    not_interested: notInterested,
  };
}

// ─────────────────────────────────────────────
// 3. Weighted Ranking
// ─────────────────────────────────────────────
function rankCandidates(items, weights) {
  return items.map(({ candidate, features }) => {
    let score = 0;
    score += (features.same_profession || 0) * (weights.same_profession ?? 25);
    score += (features.same_specialization || 0) * (weights.same_specialization ?? 30);
    score += (features.shared_skills || 0) * (weights.shared_skills ?? 15);
    score += (features.same_organization || 0) * (weights.same_organization ?? 25);
    score += (features.same_education || 0) * (weights.same_education ?? 18);
    score += (features.mutual_connections || 0) * (weights.mutual_connections ?? 12);
    score += (features.shared_community || 0) * (weights.shared_community ?? 15);
    score += (features.research_similarity || 0) * (weights.research_similarity ?? 25);
    score += (features.shared_event || 0) * (weights.shared_event ?? 12);
    score += (features.learning_similarity || 0) * (weights.learning_similarity ?? 10);
    score += (features.location_relevance || 0) * (weights.location_relevance ?? 8);
    score += (features.behavioral_similarity || 0) * (weights.behavioral_similarity ?? 15);
    score += (features.verification_signal || 0) * (weights.verification_signal ?? 5);
    score += (features.profile_quality || 0) * (weights.profile_quality ?? 10);

    if (features.already_seen > 0) score += features.already_seen * (weights.already_seen ?? -15);
    if (features.not_interested > 0) score += features.not_interested * (weights.not_interested ?? -60);

    if (candidate.is_founding_member) score += 3;

    return { candidate, score: Math.round(score * 100) / 100, features };
  }).sort((a, b) => b.score - a.score);
}

// ─────────────────────────────────────────────
// 4. Diversity Re-ranking
// ─────────────────────────────────────────────
function applyDiversity(candidates, maxConsecutive = 2) {
  const finalResults = [];
  const buffer = [];
  let lastSpec = null;
  let count = 0;

  for (const c of candidates) {
    const spec = c.specialization?.toLowerCase() || null;
    if (spec && spec === lastSpec && count >= maxConsecutive) {
      buffer.push(c);
    } else {
      finalResults.push(c);
      if (spec && spec === lastSpec) {
        count++;
      } else {
        lastSpec = spec;
        count = 1;
      }
      if (buffer.length > 0) {
        const next = buffer[0];
        if (!next.specialization || next.specialization.toLowerCase() !== lastSpec) {
          finalResults.push(buffer.shift());
          lastSpec = next.specialization?.toLowerCase() || null;
          count = 1;
        }
      }
    }
  }
  for (const b of buffer) finalResults.push(b);
  return finalResults;
}

// ─────────────────────────────────────────────
// 5. Reasons Generator
// ─────────────────────────────────────────────
function generateReasons(candidate, my) {
  const reasons = [];
  if (candidate.mutual_connection_count > 0) {
    reasons.push(`${candidate.mutual_connection_count} mutual connections`);
  }
  if (my?.specialization && candidate.specialization === my.specialization) {
    reasons.push(`Both specialize in ${candidate.specialization}`);
  }
  if (my?.organization && candidate.organization === my.organization) {
    reasons.push(`Colleague at ${candidate.organization}`);
  }
  if (my?.primary_degree && candidate.primary_degree === my.primary_degree) {
    reasons.push(`Alumni of ${candidate.primary_degree}`);
  }
  return reasons.length > 0 ? reasons : ["Healthcare professional you may know"];
}

// ─────────────────────────────────────────────
// 6. Eligibility Filter Simulation
// ─────────────────────────────────────────────
function filterEligible(candidates, excludedUserIds) {
  return candidates.filter((c) => {
    if (!c.user_id) return false;
    if (excludedUserIds.has(c.user_id)) return false;
    if (c.profile_visibility === "private" || c.profile_visibility === "hidden") return false;
    return true;
  });
}

// ============================================================
// TEST SUITE
// ============================================================

describe("MGN Recommendation Engine Comprehensive Verification", () => {
  test("Time Decay Calculation matches exponential half-life curve", () => {
    const now = new Date("2026-09-23T12:00:00Z");
    const todayEvent = new Date("2026-09-23T12:00:00Z");
    const fourteenDaysAgo = new Date("2026-09-09T12:00:00Z");
    const twentyEightDaysAgo = new Date("2026-08-26T12:00:00Z");

    const decayToday = calculateTimeDecay(todayEvent, 14, now);
    assert.equal(Math.round(decayToday * 100) / 100, 1.0, "Today event decay should be 1.0");

    const decay14d = calculateTimeDecay(fourteenDaysAgo, 14, now);
    assert.equal(Math.round(decay14d * 100) / 100, 0.5, "14 days ago decay should be 0.5 at half-life 14d");

    const decay28d = calculateTimeDecay(twentyEightDaysAgo, 14, now);
    assert.equal(Math.round(decay28d * 100) / 100, 0.25, "28 days ago decay should be 0.25 (2 half-lives)");
  });

  test("Feature Extractor correctly identifies graph & credential attributes", () => {
    const userA = {
      profession: "Physiotherapist",
      specialization: "Sports Rehabilitation",
      organization: "Apollo Hospital",
      primary_degree: "BPT - AIIMS Delhi",
      city: "Indore",
      skills: ["Manual Therapy", "Kinesiology", "Exercise Physiology"],
    };

    const candidateSameSpec = {
      user_id: "u-1",
      profession: "Physiotherapist",
      specialization: "Sports Rehabilitation",
      organization: "Apollo Hospital",
      primary_degree: "BPT - AIIMS Delhi",
      city: "Indore",
      skills: ["Manual Therapy", "Rehab"],
      mutual_connection_count: 5,
      identity_verified: true,
      registration_verified: true,
      experience_years: 6,
    };

    const ctx = {
      currentUserProfile: userA,
      interestProfile: { interests: { "Sports Rehabilitation": 0.95 } },
      seenCandidateIds: new Set(),
      notInterestedIds: new Set(),
    };

    const features = extractFeatures(candidateSameSpec, ctx);

    assert.equal(features.same_profession, 1.0);
    assert.equal(features.same_specialization, 1.0);
    assert.equal(features.same_organization, 1.0);
    assert.equal(features.same_education, 1.0);
    assert.equal(features.mutual_connections, 1.0);
    assert.equal(features.location_relevance, 1.0);
    assert.equal(features.research_similarity, 0.95);
    assert.ok(features.verification_signal >= 0.7, "Verified candidate should have high verification signal");
    assert.equal(features.not_interested, 0.0);
  });

  test("Weighted Ranker applies configurable weights, bonuses, and negative signals", () => {
    const weights = {
      same_profession: 25,
      same_specialization: 30,
      shared_skills: 15,
      same_organization: 25,
      same_education: 18,
      mutual_connections: 12,
      shared_community: 15,
      research_similarity: 25,
      location_relevance: 8,
      behavioral_similarity: 15,
      verification_signal: 5,
      profile_quality: 10,
      already_seen: -15,
      not_interested: -60,
    };

    const candHighAffinity = {
      candidate: { user_id: "u-high", name: "Dr. High Affinity", is_founding_member: true },
      features: {
        same_profession: 1.0,      // +25
        same_specialization: 1.0,  // +30
        same_organization: 1.0,    // +25
        mutual_connections: 1.0,   // +12
        already_seen: 0.0,
        not_interested: 0.0,
      },
    };

    const candNegative = {
      candidate: { user_id: "u-neg", name: "Dr. Dismissed" },
      features: {
        same_profession: 1.0,      // +25
        same_specialization: 1.0,  // +30
        already_seen: 1.0,         // -15
        not_interested: 1.0,       // -60
      },
    };

    const ranked = rankCandidates([candNegative, candHighAffinity], weights);

    assert.equal(ranked[0].candidate.user_id, "u-high");
    assert.equal(ranked[0].score, 95); // 25 + 30 + 25 + 12 + 3 (founding) = 95
    assert.equal(ranked[1].candidate.user_id, "u-neg");
    assert.equal(ranked[1].score, -20); // 25 + 30 - 15 - 60 = -20
  });

  test("Diversity Engine enforces max consecutive same specialization", () => {
    const rawList = [
      { user_id: "1", specialization: "Cardiology" },
      { user_id: "2", specialization: "Cardiology" },
      { user_id: "3", specialization: "Cardiology" },
      { user_id: "4", specialization: "Neurology" },
      { user_id: "5", specialization: "Cardiology" },
    ];

    const diversified = applyDiversity(rawList, 2);

    assert.equal(diversified[0].specialization, "Cardiology");
    assert.equal(diversified[1].specialization, "Cardiology");
    assert.equal(diversified[2].specialization, "Neurology", "Third item should be diversified to Neurology");
    assert.equal(diversified[3].specialization, "Cardiology");
    assert.equal(diversified[4].specialization, "Cardiology");
  });

  test("Eligibility Filter excludes self, blocks, and private profiles", () => {
    const currentUserId = "u-self";
    const excluded = new Set([currentUserId, "u-blocked", "u-friend"]);

    const pool = [
      { user_id: "u-self", name: "Me", profile_visibility: "public" },
      { user_id: "u-blocked", name: "Blocked User", profile_visibility: "public" },
      { user_id: "u-friend", name: "Existing Connection", profile_visibility: "public" },
      { user_id: "u-private", name: "Private User", profile_visibility: "private" },
      { user_id: "u-valid", name: "Valid Candidate", profile_visibility: "public" },
    ];

    const eligible = filterEligible(pool, excluded);

    assert.equal(eligible.length, 1);
    assert.equal(eligible[0].user_id, "u-valid");
  });

  test("Explainability reasons are properly generated and privacy-safe", () => {
    const userA = {
      profession: "Physiotherapist",
      specialization: "Sports Rehabilitation",
      organization: "AIIMS",
      primary_degree: "MPT Sports",
    };

    const candidate = {
      user_id: "u-99",
      profession: "Physiotherapist",
      specialization: "Sports Rehabilitation",
      organization: "AIIMS",
      primary_degree: "MPT Sports",
      mutual_connection_count: 3,
    };

    const reasons = generateReasons(candidate, userA);

    assert.ok(reasons.includes("3 mutual connections"));
    assert.ok(reasons.includes("Both specialize in Sports Rehabilitation"));
    assert.ok(reasons.includes("Colleague at AIIMS"));
    assert.ok(reasons.includes("Alumni of MPT Sports"));
  });
});
