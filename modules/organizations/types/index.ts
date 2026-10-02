// ============================================================
// MGN Organisation Types & Domain Definitions
// modules/organizations/types/index.ts
// ============================================================

export type OrganizationType =
  | "Hospital"
  | "Clinic"
  | "Diagnostic Centre"
  | "Medical College"
  | "University"
  | "Research Institute"
  | "Pharmaceutical Company"
  | "Medical Device Company"
  | "Healthcare Technology Company"
  | "NGO"
  | "Healthcare Startup"
  | "Professional Association"
  | "Training Institute"
  | "Government Healthcare Organisation"
  | "Other verified healthcare organisation";

export const ALL_ORGANIZATION_TYPES: OrganizationType[] = [
  "Hospital",
  "Clinic",
  "Diagnostic Centre",
  "Medical College",
  "University",
  "Research Institute",
  "Pharmaceutical Company",
  "Medical Device Company",
  "Healthcare Technology Company",
  "NGO",
  "Healthcare Startup",
  "Professional Association",
  "Training Institute",
  "Government Healthcare Organisation",
  "Other verified healthcare organisation",
];

export type OrgRole =
  | "OWNER"
  | "ADMIN"
  | "HR_RECRUITER"
  | "EVENT_MANAGER"
  | "CAMP_MANAGER"
  | "LEARNING_MANAGER"
  | "RESEARCH_MANAGER"
  | "MARKETING_MANAGER"
  | "FINANCE_MANAGER"
  | "MODERATOR"
  | "VIEWER"
  | "CUSTOM";

export type OrgPermission =
  // Workspace Core
  | "ORG_VIEW"
  | "ORG_EDIT"
  | "ORG_DELETE"
  | "ORG_SETTINGS"
  | "ORG_VERIFICATION"
  | "AUDIT_LOGS_VIEW"
  // Team & Members
  | "MEMBERS_VIEW"
  | "MEMBERS_INVITE"
  | "MEMBERS_MANAGE"
  | "ROLES_MANAGE"
  | "DEPARTMENTS_MANAGE"
  // Recruitment & Jobs
  | "JOBS_VIEW"
  | "JOBS_CREATE"
  | "JOBS_EDIT"
  | "JOBS_DELETE"
  | "APPLICATIONS_VIEW"
  | "APPLICATIONS_MANAGE"
  | "INTERVIEWS_MANAGE"
  | "CANDIDATES_MESSAGE"
  // Events & Conferences
  | "EVENTS_VIEW"
  | "EVENTS_CREATE"
  | "EVENTS_EDIT"
  | "EVENTS_DELETE"
  | "CONFERENCES_MANAGE"
  | "ATTENDANCE_MANAGE"
  | "CERTIFICATES_ISSUE"
  // Health Camps
  | "CAMPS_VIEW"
  | "CAMPS_CREATE"
  | "CAMPS_EDIT"
  | "CAMPS_DELETE"
  | "VOLUNTEERS_MANAGE"
  | "CAMP_REPORTS_MANAGE"
  // Learning & LMS
  | "LEARNING_VIEW"
  | "LEARNING_CREATE"
  | "LEARNING_EDIT"
  | "LEARNING_DELETE"
  | "LIVE_CLASSES_MANAGE"
  | "STUDENTS_MANAGE"
  // Research
  | "RESEARCH_VIEW"
  | "RESEARCH_CREATE"
  | "RESEARCH_EDIT"
  | "RESEARCH_DELETE"
  | "COLLABORATORS_MANAGE"
  // Groups & Community
  | "GROUPS_VIEW"
  | "GROUPS_CREATE"
  | "GROUPS_MANAGE"
  // Marketing & Content
  | "CONTENT_VIEW"
  | "CONTENT_CREATE"
  | "CONTENT_MANAGE"
  // Finance & Billing
  | "BILLING_VIEW"
  | "BILLING_MANAGE"
  // Moderation
  | "MODERATION_VIEW"
  | "MODERATION_MANAGE"
  // Communication
  | "COMMUNICATION_VIEW"
  | "COMMUNICATION_SEND"
  // Analytics
  | "ANALYTICS_VIEW"
  | "ANALYTICS_EXPORT";

export type SubscriptionPlan = "Basic" | "Professional" | "Business" | "Enterprise";
export type SubscriptionStatus = "ACTIVE" | "GRACE_PERIOD" | "EXPIRED" | "CANCELLED";

export interface PlanLimits {
  name: SubscriptionPlan;
  maxMembers: number;
  maxActiveJobs: number;
  maxEventsPerMonth: number;
  maxCampsPerMonth: number;
  maxConferencesPerYear: number;
  maxCourses: number;
  maxLiveClassesPerMonth: number;
  maxGroups: number;
  customRolesAllowed: boolean;
  advancedAnalytics: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  Basic: {
    name: "Basic",
    maxMembers: 5,
    maxActiveJobs: 2,
    maxEventsPerMonth: 2,
    maxCampsPerMonth: 1,
    maxConferencesPerYear: 0,
    maxCourses: 1,
    maxLiveClassesPerMonth: 2,
    maxGroups: 2,
    customRolesAllowed: false,
    advancedAnalytics: false,
    apiAccess: false,
    prioritySupport: false,
  },
  Professional: {
    name: "Professional",
    maxMembers: 25,
    maxActiveJobs: 15,
    maxEventsPerMonth: 10,
    maxCampsPerMonth: 5,
    maxConferencesPerYear: 2,
    maxCourses: 10,
    maxLiveClassesPerMonth: 20,
    maxGroups: 10,
    customRolesAllowed: true,
    advancedAnalytics: true,
    apiAccess: false,
    prioritySupport: false,
  },
  Business: {
    name: "Business",
    maxMembers: 100,
    maxActiveJobs: 50,
    maxEventsPerMonth: 50,
    maxCampsPerMonth: 20,
    maxConferencesPerYear: 10,
    maxCourses: 50,
    maxLiveClassesPerMonth: 100,
    maxGroups: 50,
    customRolesAllowed: true,
    advancedAnalytics: true,
    apiAccess: true,
    prioritySupport: true,
  },
  Enterprise: {
    name: "Enterprise",
    maxMembers: 10000,
    maxActiveJobs: 1000,
    maxEventsPerMonth: 1000,
    maxCampsPerMonth: 500,
    maxConferencesPerYear: 100,
    maxCourses: 1000,
    maxLiveClassesPerMonth: 1000,
    maxGroups: 500,
    customRolesAllowed: true,
    advancedAnalytics: true,
    apiAccess: true,
    prioritySupport: true,
  },
};

export interface OrganizationRecord {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  cover_url: string | null;
  description: string | null;
  about: string | null;
  organization_type: OrganizationType;
  website: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code?: string | null;
  specialties: string[];
  verification_status: "unverified" | "pending" | "verified" | "rejected";
  license_number?: string | null;
  accreditations?: string[];
  gst_number?: string | null;
  authorized_rep_name?: string | null;
  authorized_rep_designation?: string | null;
  official_domain?: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Computed fields
  my_role?: OrgRole;
  my_permissions?: OrgPermission[];
  member_count?: number;
  plan?: SubscriptionPlan;
  subscription_status?: SubscriptionStatus;
}

export interface OrganizationMemberRecord {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrgRole;
  custom_role_id?: string | null;
  custom_role_name?: string | null;
  department?: string | null;
  designation?: string | null;
  status: "active" | "invited" | "suspended";
  invited_by?: string | null;
  created_at: string;
  updated_at: string;
  // Joined user fields
  name?: string;
  email?: string;
  image?: string | null;
  profession?: string | null;
  specialization?: string | null;
  last_active?: string | null;
}

export interface OrganizationCustomRoleRecord {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  permissions: OrgPermission[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationDepartmentRecord {
  id: string;
  organization_id: string;
  name: string;
  code?: string | null;
  head_user_id?: string | null;
  head_name?: string | null;
  description?: string | null;
  member_count?: number;
  created_at: string;
}

export interface OrganizationInvitationRecord {
  id: string;
  organization_id: string;
  email: string;
  role: OrgRole;
  custom_role_id?: string | null;
  department?: string | null;
  invited_by: string;
  status: "pending" | "accepted" | "expired" | "revoked";
  token: string;
  expires_at: string;
  created_at: string;
}

export interface OrganizationAuditLogRecord {
  id: string;
  organization_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details?: Record<string, any>;
  ip_address?: string | null;
  created_at: string;
}

export interface OrganizationSubscriptionRecord {
  id: string;
  organization_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  billing_cycle: "monthly" | "yearly";
  current_period_start: string;
  current_period_end: string;
  grace_period_end?: string | null;
  auto_renew: boolean;
  price_amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationInvoiceRecord {
  id: string;
  organization_id: string;
  subscription_id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed" | "refunded";
  plan_name: string;
  billing_period: string;
  payment_method?: string | null;
  paid_at?: string | null;
  created_at: string;
}

export interface OrganizationGroupRecord {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  description?: string | null;
  cover_url?: string | null;
  category: string;
  group_type: "public" | "private" | "org_only" | "approval_required";
  created_by: string;
  member_count: number;
  post_count: number;
  created_at: string;
  updated_at: string;
}

export interface OrganizationConferenceRecord {
  id: string;
  organization_id: string;
  event_id?: string | null;
  title: string;
  theme?: string | null;
  start_date: string;
  end_date: string;
  venue_type: "online" | "in_person" | "hybrid";
  venue_name?: string | null;
  address?: string | null;
  tracks: Array<{ id: string; name: string; description?: string }>;
  sessions: Array<{
    id: string;
    track_id?: string;
    title: string;
    start_time: string;
    end_time: string;
    speaker_name?: string;
    session_type: "keynote" | "panel" | "workshop" | "presentation" | "break";
  }>;
  speakers: Array<{
    id: string;
    name: string;
    title?: string;
    affiliation?: string;
    is_keynote: boolean;
    avatar_url?: string;
  }>;
  sponsors: Array<{
    id: string;
    name: string;
    tier: "platinum" | "gold" | "silver" | "bronze";
    logo_url?: string;
  }>;
  abstract_submission_open: boolean;
  created_at: string;
}

export interface OrganizationCampVolunteerRecord {
  id: string;
  camp_id: string;
  organization_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_profession: string;
  user_specialization?: string;
  assigned_role: string;
  status: "applied" | "approved" | "rejected" | "attended";
  notes?: string | null;
  created_at: string;
}

export interface OrgDashboardMetrics {
  // Recruitment
  activeJobsCount: number;
  totalApplicationsCount: number;
  shortlistedCount: number;
  interviewsScheduledCount: number;
  offersCount: number;
  hiresCount: number;
  // Events & Conferences
  upcomingEventsCount: number;
  eventRegistrationsCount: number;
  upcomingConferencesCount: number;
  certificatesIssuedCount: number;
  // Health Camps
  activeCampsCount: number;
  campVolunteersCount: number;
  campRegistrationsCount: number;
  campsCompletedCount: number;
  // Learning
  coursesCount: number;
  enrolledStudentsCount: number;
  liveClassesUpcomingCount: number;
  courseCompletionsCount: number;
  // Community & Groups
  groupsCount: number;
  groupMembersCount: number;
  groupPostsCount: number;
  // Research
  activeProjectsCount: number;
  researchCollaboratorsCount: number;
  publicationsCount: number;
  // Members
  totalMembersCount: number;
  departmentsCount: number;
  // Subscription
  planName: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  renewalDate: string;
}
