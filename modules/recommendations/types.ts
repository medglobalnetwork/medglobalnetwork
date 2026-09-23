// ============================================================
// MGN Recommendation Engine — TypeScript Types
// modules/recommendations/types.ts
// ============================================================

import type { ProfessionalProfile } from "@/modules/network/types";

export type RecommendationCategory =
  | "people-you-may-know"
  | "similar-professionals"
  | "same-organization"
  | "alumni"
  | "research-connections"
  | "community-connections"
  | "event-connections"
  | "career-connections"
  | "learning-connections"
  | "location-based";

export type RecommendationSource =
  | "home_feed"
  | "home_sidebar"
  | "network_page"
  | "network_sidebar"
  | "profile_page"
  | "community_page"
  | "learn_page"
  | "jobs_page"
  | "research_page"
  | "api";

export type RecommendationEventType =
  | "impression"
  | "profile_open"
  | "follow"
  | "connect_request"
  | "connect_accept"
  | "message"
  | "dismiss"
  | "not_interested"
  | "dont_suggest"
  | "report"
  | "block"
  | "post_view"
  | "post_like"
  | "post_save"
  | "post_share"
  | "search"
  | "course_view"
  | "course_enroll"
  | "course_complete"
  | "job_view"
  | "job_apply"
  | "community_join"
  | "event_view"
  | "event_register"
  | "research_view";

export interface RecommendationFeedbackInput {
  userId: string;
  candidateId: string;
  feedbackType: "not_interested" | "dismiss" | "dont_suggest" | "report" | "block";
  category?: string;
  reason?: string;
}

export interface RecommendationEventInput {
  userId: string;
  eventType: RecommendationEventType;
  targetId?: string;
  targetType?: "user" | "post" | "course" | "job" | "community" | "event" | "research" | "recommendation";
  metadata?: Record<string, any>;
}

export interface RecommendationFeatureVector {
  same_profession: number;          // 0 to 1
  same_specialization: number;      // 0 to 1
  shared_skills: number;            // 0 to 1
  same_organization: number;        // 0 to 1
  same_education: number;           // 0 to 1
  mutual_connections: number;       // normalized count 0 to 1
  shared_community: number;         // normalized count 0 to 1
  research_similarity: number;      // 0 to 1
  shared_event: number;             // 0 to 1
  learning_similarity: number;      // 0 to 1
  location_relevance: number;       // 0 to 1
  behavioral_similarity: number;    // 0 to 1
  profile_interaction: number;      // 0 to 1
  follow_relationship: number;      // 0 to 1
  verification_signal: number;      // 0 to 1
  profile_quality: number;          // 0 to 1
  // Negative features
  already_seen: number;             // 0 to 1
  not_interested: number;           // 0 or 1
}

export interface RecommendationFeatureWeights {
  same_profession: number;
  same_specialization: number;
  shared_skills: number;
  same_organization: number;
  same_education: number;
  mutual_connections: number;
  shared_community: number;
  research_similarity: number;
  shared_event: number;
  learning_similarity: number;
  location_relevance: number;
  behavioral_similarity: number;
  profile_interaction: number;
  follow_relationship: number;
  verification_signal: number;
  profile_quality: number;
  // Penalties
  already_seen: number;
  not_interested: number;
}

export interface DiversityConfig {
  max_consecutive_specialization: number;
  max_consecutive_organization: number;
  max_same_profession_ratio: number;
}

export interface ExplorationConfig {
  exploration_ratio: number; // e.g. 0.20 for 20% exploration
  discovery_temperature: number; // softness of adjacent exploration
}

export interface TimeDecayConfig {
  half_life_days: number; // e.g. 14 days
}

export interface CandidateSourceConfig {
  enable_mutual_connections: boolean;
  enable_same_organization: boolean;
  enable_same_university: boolean;
  enable_same_specialization: boolean;
  enable_shared_communities: boolean;
  enable_shared_learning: boolean;
  enable_shared_research: boolean;
  enable_location: boolean;
  enable_behavioral: boolean;
  enable_cold_start: boolean;
}

export interface RecommendationRuleConfig {
  feature_weights: RecommendationFeatureWeights;
  diversity: DiversityConfig;
  exploration: ExplorationConfig;
  time_decay: TimeDecayConfig;
  candidate_sources: CandidateSourceConfig;
}

export interface RecommendationReason {
  type:
    | "specialization"
    | "mutual_connections"
    | "organization"
    | "university"
    | "community"
    | "research"
    | "event"
    | "course"
    | "location"
    | "popular"
    | "exploration";
  label: string;
  detail?: string;
  count?: number;
  isPrivateSafe: boolean;
}

export interface RecommendationCandidate {
  user_id: string;
  name: string;
  image: string | null;
  profession: string | null;
  specialization: string | null;
  sub_specialization: string | null;
  designation: string | null;
  organization: string | null;
  primary_degree: string | null;
  additional_degrees: string[] | null;
  city: string | null;
  state: string | null;
  country: string | null;
  skills: string[] | null;
  identity_verified: boolean;
  education_verified: boolean;
  registration_verified: boolean;
  experience_verified: boolean;
  experience_years: number;
  profile_visibility?: string | null;
  cover_image_url: string | null;
  username: string | null;
  member_id: string | null;
  membership_tier: string | null;
  is_founding_member: boolean;
  // Computed recommendation data
  score?: number;
  features?: RecommendationFeatureVector;
  reasons?: RecommendationReason[];
  primary_reason?: string;
  candidate_source?: string;
  is_exploration?: boolean;
  mutual_connection_count?: number;
  mutual_connection_names?: string[];
  shared_community_names?: string[];
  shared_course_names?: string[];
}

export interface RecommendedUser extends ProfessionalProfile {
  recommendation_score: number;
  recommendation_reasons: RecommendationReason[];
  primary_reason: string;
  candidate_source: string;
  is_exploration: boolean;
  features?: RecommendationFeatureVector;
}

export interface RecommendationQueryOptions {
  userId?: string;
  category?: RecommendationCategory;
  limit?: number;
  offset?: number;
  source?: RecommendationSource;
  experimentId?: string;
  forcedVariant?: "A" | "B";
  excludeUserIds?: string[];
  enableExploration?: boolean;
}

export interface RecommendationResult {
  data: RecommendedUser[];
  total: number;
  hasMore: boolean;
  category: RecommendationCategory;
  experiment?: {
    id: string;
    variant: "A" | "B";
  };
  metadata?: {
    candidateCount: number;
    filteredCount: number;
    rankedCount: number;
    durationMs: number;
  };
}

export interface UserInterestProfile {
  userId: string;
  interests: Record<string, number>; // topic -> affinity score 0..1
  topSpecializations: string[];
  topSkills: string[];
  lastActiveAt: Date;
  updatedAt: Date;
}

export interface RecommendationAnalyticsMetrics {
  totalImpressions: number;
  totalProfileOpens: number;
  totalConnectRequests: number;
  totalConnectAccepts: number;
  totalFollows: number;
  totalDismissals: number;
  totalNotInterested: number;
  ctr: number;                       // profile opens / impressions
  connectRequestRate: number;        // connect requests / impressions
  connectAcceptRate: number;         // connect accepts / requests
  followRate: number;                // follows / impressions
  dismissRate: number;               // dismissals / impressions
  notInterestedRate: number;         // not interested / impressions
  categoryBreakdown: Record<string, { impressions: number; conversions: number; rate: number }>;
  sourceBreakdown: Record<string, { impressions: number; conversions: number; rate: number }>;
  coldStartMetrics: { impressions: number; conversions: number; rate: number };
}
