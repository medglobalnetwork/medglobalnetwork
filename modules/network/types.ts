// ============================================================
// MGN Networking System — TypeScript Types
// modules/network/types.ts
// All shared types for the networking module
// ============================================================

// ─────────────────────────────────────────────
// PROFESSIONAL PROFILE
// ─────────────────────────────────────────────

export type Profession =
  | "Doctor"
  | "Nurse"
  | "Physiotherapist"
  | "Pharmacist"
  | "Lab Technician"
  | "Radiographer"
  | "Occupational Therapist"
  | "Speech Therapist"
  | "Dietitian"
  | "Paramedic"
  | "Researcher"
  | "Student"
  | "Educator"
  | "Other";

export const PROFESSIONS: Profession[] = [
  "Doctor",
  "Nurse",
  "Physiotherapist",
  "Pharmacist",
  "Lab Technician",
  "Radiographer",
  "Occupational Therapist",
  "Speech Therapist",
  "Dietitian",
  "Paramedic",
  "Researcher",
  "Student",
  "Educator",
  "Other",
];

export interface VerificationStatus {
  identity_verified: boolean;
  education_verified: boolean;
  registration_verified: boolean;
  experience_verified: boolean;
}

export interface ProfessionalProfile {
  id: string;
  user_id: string;
  username?: string;
  member_id?: string;
  is_founding_member?: boolean;
  membership_tier?: "FOUNDING_MEMBER" | "MEMBER" | "PRO_MEMBER" | string;
  // User fields (joined)
  name: string;
  email: string;
  image?: string | null;
  // Professional
  profession?: string;
  specialization?: string;
  sub_specialization?: string;
  designation?: string;
  primary_degree?: string;
  additional_degrees?: string[];
  medical_council?: string;
  registration_number?: string;
  organization?: string;
  city?: string;
  state?: string;
  country?: string;
  experience_years?: number;
  bio?: string;
  skills?: string[];
  languages?: string[];
  // Verification
  identity_verified: boolean;
  education_verified: boolean;
  registration_verified: boolean;
  experience_verified: boolean;
  // Visibility
  profile_visibility?: string;
  cover_image_url?: string;
  // Computed (from joins)
  connection_count?: number;
  follower_count?: number;
  following_count?: number;
  mutual_connections?: number;
  connection_status?: ConnectionStatus;
  follow_status?: FollowStatus;
  created_at?: string;
  updated_at?: string;
}

// ─────────────────────────────────────────────
// CONNECTIONS
// ─────────────────────────────────────────────

export type ConnectionStatus =
  | "none"        // no relationship
  | "pending"     // current user sent request
  | "received"    // current user received request
  | "connected"   // accepted
  | "blocked";

export type FollowStatus = "following" | "not_following";

export interface ConnectionRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  message?: string;
  status: "pending" | "accepted" | "ignored" | "withdrawn";
  created_at: string;
  updated_at: string;
  // Joined user data
  sender?: ProfessionalProfile;
  receiver?: ProfessionalProfile;
}

export interface Connection {
  id: string;
  user_a_id: string;
  user_b_id: string;
  connected_at: string;
  // Joined — the "other" user
  profile?: ProfessionalProfile;
}

// ─────────────────────────────────────────────
// FOLLOWS
// ─────────────────────────────────────────────

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  // Joined profile of the followed user
  profile?: ProfessionalProfile;
}

// ─────────────────────────────────────────────
// POSTS / FEED
// ─────────────────────────────────────────────

export type PostType =
  | "text"
  | "image"
  | "video"
  | "document"
  | "poll"
  | "research"
  | "achievement"
  | "question"
  | "job"
  | "event";

export const POST_TYPES: { value: PostType; label: string; emoji: string }[] = [
  { value: "text",        label: "Post",        emoji: "📝" },
  { value: "image",       label: "Photo",       emoji: "📷" },
  { value: "research",    label: "Research",    emoji: "🔬" },
  { value: "achievement", label: "Achievement", emoji: "🏆" },
  { value: "question",    label: "Question",    emoji: "❓" },
  { value: "event",       label: "Event",       emoji: "📅" },
  { value: "job",         label: "Job",         emoji: "💼" },
  { value: "poll",        label: "Poll",        emoji: "📊" },
];

export interface PollOption {
  option: string;
  votes: number;
}

export interface NetworkPost {
  id: string;
  author_id: string;
  post_type: PostType;
  content: string;
  media_urls?: string[];
  poll_options?: PollOption[];
  poll_ends_at?: string;
  community_id?: string;
  visibility: string;
  reaction_count: number;
  comment_count: number;
  share_count: number;
  created_at: string;
  updated_at: string;
  // Joined
  author?: ProfessionalProfile;
  user_reacted?: boolean;
  user_saved?: boolean;
}

export interface PostComment {
  id: string;
  post_id: string;
  author_id: string;
  parent_id?: string;
  content: string;
  created_at: string;
  updated_at: string;
  author?: ProfessionalProfile;
}

// ─────────────────────────────────────────────
// COMMUNITIES
// ─────────────────────────────────────────────

export interface Community {
  id: string;
  slug: string;
  name: string;
  description?: string;
  specialty?: string;
  cover_url?: string;
  icon_url?: string;
  visibility: string;
  join_mode: string;
  created_by?: string;
  member_count: number;
  post_count: number;
  created_at: string;
  updated_at: string;
  // Computed
  is_member?: boolean;
  user_role?: "admin" | "moderator" | "member";
}

export interface CommunityMember {
  id: string;
  community_id: string;
  user_id: string;
  role: "admin" | "moderator" | "member";
  joined_at: string;
  profile?: ProfessionalProfile;
}

// ─────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────

export type NotificationType =
  | "connection_request"
  | "connection_accepted"
  | "new_follower"
  | "post_like"
  | "post_comment"
  | "post_mention"
  | "community_invite";

export interface NetworkNotification {
  id: string;
  user_id: string;
  actor_id?: string;
  type: NotificationType;
  entity_type?: string;
  entity_id?: string;
  message?: string;
  is_read: boolean;
  created_at: string;
  // Joined
  actor?: ProfessionalProfile;
}

// ─────────────────────────────────────────────
// FILTER OPTIONS
// ─────────────────────────────────────────────

export interface NetworkFilters {
  profession?: string;
  specialization?: string;
  city?: string;
  state?: string;
  experience_min?: number;
  experience_max?: number;
  organization?: string;
  verified_only?: boolean;
  query?: string;
}

// ─────────────────────────────────────────────
// API RESPONSE WRAPPERS
// ─────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
