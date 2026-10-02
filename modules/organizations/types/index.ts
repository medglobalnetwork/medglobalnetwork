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

export function isHospitalWorkspace(type?: string | null): boolean {
  if (!type) return true; // Default to Hospital if unspecified
  const lower = type.toLowerCase();
  return (
    lower.includes("hospital") ||
    lower.includes("clinic") ||
    lower.includes("diagnostic") ||
    lower.includes("government healthcare")
  );
}

export function isCollegeWorkspace(type?: string | null): boolean {
  if (!type) return false;
  const lower = type.toLowerCase();
  return (
    lower.includes("college") ||
    lower.includes("university") ||
    lower.includes("training institute") ||
    lower.includes("academic")
  );
}

export type OrgRole =
  // Universal / Core Roles
  | "OWNER"
  | "ADMIN"
  | "VIEWER"
  | "CUSTOM"
  | "FINANCE_MANAGER"
  | "MODERATOR"
  // Hospital-Centric Roles
  | "HR_MANAGER"
  | "HR_RECRUITER"
  | "TRAINING_MANAGER"
  | "LEARNING_MANAGER"
  | "CAMP_MANAGER"
  | "EVENT_MANAGER"
  | "RESEARCH_MANAGER"
  | "MARKETING_MANAGER"
  // College-Centric Roles
  | "DEAN"
  | "HOD"
  | "FACULTY"
  | "PLACEMENT_OFFICER"
  | "STUDENT_COORDINATOR"
  | "RESEARCH_COORDINATOR"
  | "EVENT_COORDINATOR";

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
  // Recruitment & Jobs (Hospital & Corporate)
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
  // Health Camps & Community Outreach
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
  // Hospital Specific: Clinical Workforce & Internal SOP Training
  | "CLINICAL_WORKFORCE_VIEW"
  | "CLINICAL_WORKFORCE_MANAGE"
  | "TRAINING_VIEW"
  | "TRAINING_MANAGE"
  // College Specific: Students, Faculty, Academic Programs, Assessments, Placements
  | "STUDENTS_VIEW"
  | "PROGRAMS_VIEW"
  | "PROGRAMS_MANAGE"
  | "FACULTY_VIEW"
  | "FACULTY_MANAGE"
  | "ASSESSMENTS_VIEW"
  | "ASSESSMENTS_MANAGE"
  | "ASSESSMENTS_GRADE"
  | "PLACEMENTS_VIEW"
  | "PLACEMENTS_MANAGE"
  // Research & Clinical Trials
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
  // Communication & Announcements
  | "COMMUNICATION_VIEW"
  | "COMMUNICATION_SEND"
  | "ANNOUNCEMENTS_VIEW"
  | "ANNOUNCEMENTS_MANAGE"
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

// ------------------------------------------------------------
// College / University Domain Records
// ------------------------------------------------------------
export interface StudentRecord {
  id: string;
  organization_id: string;
  user_id?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  program: string; // e.g., "BPT", "MBBS", "BDS", "B.Sc Nursing", "MPT"
  year: number;
  semester: number;
  department?: string | null;
  enrollment_number: string;
  batch?: string | null;
  status: "active" | "graduated" | "suspended" | "dropped";
  academic_standing?: "good" | "probation" | "honor";
  created_at: string;
  updated_at: string;
}

export interface AcademicProgramRecord {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  degree_level: "Undergraduate" | "Postgraduate" | "Diploma" | "Doctorate";
  duration_years: number;
  department?: string | null;
  description?: string | null;
  curriculum?: Array<{
    year: number;
    semester: number;
    subjects: Array<{ code: string; title: string; credits: number }>;
  }>;
  student_count?: number;
  created_at: string;
}

export interface AssessmentRecord {
  id: string;
  organization_id: string;
  department?: string | null;
  program_id?: string | null;
  course_id?: string | null;
  title: string;
  assessment_type: "mcq" | "case_based" | "assignment" | "quiz" | "practical" | "internal" | "mock";
  total_marks: number;
  pass_percentage: number;
  duration_minutes: number;
  due_date?: string | null;
  status: "draft" | "published" | "closed" | "graded";
  question_bank?: Array<{
    id: string;
    question: string;
    options?: string[];
    correct_answer?: string;
    points: number;
    case_scenario?: string;
  }>;
  scope: "private" | "department" | "institution" | "mgn_published";
  created_by: string;
  created_at: string;
  submissions_count?: number;
}

export interface AssessmentSubmissionRecord {
  id: string;
  assessment_id: string;
  organization_id: string;
  student_id: string;
  student_name: string;
  student_enrollment?: string | null;
  submitted_at: string;
  score?: number | null;
  max_score: number;
  status: "submitted" | "graded" | "evaluated";
  feedback?: string | null;
}

export interface PlacementRecord {
  id: string;
  organization_id: string;
  company_name: string;
  job_title: string;
  job_type: "full_time" | "internship" | "clinical_residency";
  eligible_programs: string[];
  min_cgpa?: number | null;
  package_ctc?: string | null;
  location?: string | null;
  deadline?: string | null;
  status: "active" | "closed" | "completed";
  description?: string | null;
  applications_count: number;
  offers_count: number;
  created_at: string;
}

export interface PlacementApplicationRecord {
  id: string;
  placement_id: string;
  organization_id: string;
  student_id: string;
  student_name: string;
  student_program: string;
  status: "applied" | "shortlisted" | "interview" | "offered" | "placed" | "rejected";
  interview_date?: string | null;
  notes?: string | null;
  created_at: string;
}

// ------------------------------------------------------------
// Hospital Domain Records
// ------------------------------------------------------------
export type ClinicalProfession =
  | "Doctor"
  | "Nurse"
  | "Physiotherapist"
  | "Pharmacist"
  | "Lab Professional"
  | "Radiology"
  | "OT Staff"
  | "Administration"
  | "Other Healthcare";

export interface HospitalInternalTrainingRecord {
  id: string;
  organization_id: string;
  title: string;
  category: "Infection Control" | "Emergency Protocol" | "Patient Safety" | "Clinical Skills" | "Hospital SOP Training" | "Department Training";
  department?: string | null;
  access_scope: "public" | "org_only" | "department_only" | "selected_staff";
  content_type: "video" | "pdf" | "notes" | "quiz" | "assignment" | "live_class";
  duration_hours: number;
  has_certificate: boolean;
  description?: string | null;
  mandatory: boolean;
  enrolled_count?: number;
  completed_count?: number;
  created_by: string;
  created_at: string;
}

export interface OrganizationAnnouncementRecord {
  id: string;
  organization_id: string;
  title: string;
  message: string;
  target_audience: "all" | "students" | "faculty" | "staff" | "department" | "program" | "semester" | "selected_group";
  target_department?: string | null;
  target_program?: string | null;
  attachment_url?: string | null;
  publish_date: string;
  expiry_date?: string | null;
  pinned: boolean;
  created_by: string;
  created_at: string;
}

export interface OrgDashboardMetrics {
  // Recruitment (Hospital / Standard)
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
  // Learning & LMS
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
  // Members & Teams
  totalMembersCount: number;
  departmentsCount: number;
  // Hospital-Specific Metrics
  clinicalDoctorsCount?: number;
  clinicalNursesCount?: number;
  clinicalPhysiosCount?: number;
  clinicalAlliedCount?: number;
  internalTrainingsCount?: number;
  // College-Specific Metrics
  studentsCount?: number;
  facultyCount?: number;
  academicProgramsCount?: number;
  activePlacementsCount?: number;
  pendingAssessmentsCount?: number;
  // Subscription
  planName: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  renewalDate: string;
}
