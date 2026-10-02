// ============================================================
// MGN Organisation Role-Based Access Control (RBAC) Engine
// modules/organizations/lib/org-permissions.ts
// ============================================================

import { OrgPermission, OrgRole, OrganizationType, isHospitalWorkspace, isCollegeWorkspace } from "../types";

export const ROLE_DEFAULT_PERMISSIONS: Record<OrgRole, OrgPermission[]> = {
  OWNER: [
    // Owner has ALL permissions across Hospital, College, and Corporate workspaces
    "ORG_VIEW", "ORG_EDIT", "ORG_DELETE", "ORG_SETTINGS", "ORG_VERIFICATION", "AUDIT_LOGS_VIEW",
    "MEMBERS_VIEW", "MEMBERS_INVITE", "MEMBERS_MANAGE", "ROLES_MANAGE", "DEPARTMENTS_VIEW", "DEPARTMENTS_MANAGE",
    "JOBS_VIEW", "JOBS_CREATE", "JOBS_EDIT", "JOBS_DELETE", "APPLICATIONS_VIEW", "APPLICATIONS_MANAGE", "INTERVIEWS_MANAGE", "CANDIDATES_MESSAGE",
    "EVENTS_VIEW", "EVENTS_CREATE", "EVENTS_EDIT", "EVENTS_DELETE", "CONFERENCES_MANAGE", "ATTENDANCE_MANAGE", "CERTIFICATES_ISSUE",
    "CAMPS_VIEW", "CAMPS_CREATE", "CAMPS_EDIT", "CAMPS_DELETE", "VOLUNTEERS_MANAGE", "CAMP_REPORTS_MANAGE",
    "LEARNING_VIEW", "LEARNING_CREATE", "LEARNING_EDIT", "LEARNING_DELETE", "LIVE_CLASSES_MANAGE", "STUDENTS_MANAGE",
    "CLINICAL_WORKFORCE_VIEW", "CLINICAL_WORKFORCE_MANAGE", "TRAINING_VIEW", "TRAINING_MANAGE",
    "STUDENTS_VIEW", "PROGRAMS_VIEW", "PROGRAMS_MANAGE", "FACULTY_VIEW", "FACULTY_MANAGE",
    "ASSESSMENTS_VIEW", "ASSESSMENTS_MANAGE", "ASSESSMENTS_GRADE",
    "PLACEMENTS_VIEW", "PLACEMENTS_MANAGE",
    "RESEARCH_VIEW", "RESEARCH_CREATE", "RESEARCH_EDIT", "RESEARCH_DELETE", "COLLABORATORS_MANAGE",
    "GROUPS_VIEW", "GROUPS_CREATE", "GROUPS_MANAGE",
    "CONTENT_VIEW", "CONTENT_CREATE", "CONTENT_MANAGE",
    "BILLING_VIEW", "BILLING_MANAGE",
    "MODERATION_VIEW", "MODERATION_MANAGE",
    "COMMUNICATION_VIEW", "COMMUNICATION_SEND", "ANNOUNCEMENTS_VIEW", "ANNOUNCEMENTS_MANAGE",
    "ANALYTICS_VIEW", "ANALYTICS_EXPORT",
  ],

  ADMIN: [
    // Operational management (Sensitive billing / org delete remains owner-controlled)
    "ORG_VIEW", "ORG_EDIT", "ORG_SETTINGS", "AUDIT_LOGS_VIEW",
    "MEMBERS_VIEW", "MEMBERS_INVITE", "MEMBERS_MANAGE", "DEPARTMENTS_VIEW", "DEPARTMENTS_MANAGE",
    "JOBS_VIEW", "JOBS_CREATE", "JOBS_EDIT", "JOBS_DELETE", "APPLICATIONS_VIEW", "APPLICATIONS_MANAGE", "INTERVIEWS_MANAGE", "CANDIDATES_MESSAGE",
    "EVENTS_VIEW", "EVENTS_CREATE", "EVENTS_EDIT", "EVENTS_DELETE", "CONFERENCES_MANAGE", "ATTENDANCE_MANAGE", "CERTIFICATES_ISSUE",
    "CAMPS_VIEW", "CAMPS_CREATE", "CAMPS_EDIT", "CAMPS_DELETE", "VOLUNTEERS_MANAGE", "CAMP_REPORTS_MANAGE",
    "LEARNING_VIEW", "LEARNING_CREATE", "LEARNING_EDIT", "LIVE_CLASSES_MANAGE", "STUDENTS_MANAGE",
    "CLINICAL_WORKFORCE_VIEW", "CLINICAL_WORKFORCE_MANAGE", "TRAINING_VIEW", "TRAINING_MANAGE",
    "STUDENTS_VIEW", "PROGRAMS_VIEW", "PROGRAMS_MANAGE", "FACULTY_VIEW", "FACULTY_MANAGE",
    "ASSESSMENTS_VIEW", "ASSESSMENTS_MANAGE", "ASSESSMENTS_GRADE",
    "PLACEMENTS_VIEW", "PLACEMENTS_MANAGE",
    "RESEARCH_VIEW", "RESEARCH_CREATE", "RESEARCH_EDIT", "COLLABORATORS_MANAGE",
    "GROUPS_VIEW", "GROUPS_CREATE", "GROUPS_MANAGE",
    "CONTENT_VIEW", "CONTENT_CREATE", "CONTENT_MANAGE",
    "MODERATION_VIEW", "MODERATION_MANAGE",
    "COMMUNICATION_VIEW", "COMMUNICATION_SEND", "ANNOUNCEMENTS_VIEW", "ANNOUNCEMENTS_MANAGE",
    "ANALYTICS_VIEW",
  ],

  DEAN: [
    // Principal / Dean: Academic oversight across programs, faculty, students, assessments & research
    "ORG_VIEW",
    "MEMBERS_VIEW", "DEPARTMENTS_VIEW", "DEPARTMENTS_MANAGE",
    "STUDENTS_VIEW", "STUDENTS_MANAGE",
    "FACULTY_VIEW", "FACULTY_MANAGE",
    "PROGRAMS_VIEW", "PROGRAMS_MANAGE",
    "LEARNING_VIEW", "LEARNING_CREATE", "LEARNING_EDIT", "LIVE_CLASSES_MANAGE",
    "ASSESSMENTS_VIEW", "ASSESSMENTS_MANAGE", "ASSESSMENTS_GRADE",
    "PLACEMENTS_VIEW",
    "EVENTS_VIEW", "EVENTS_CREATE", "EVENTS_EDIT",
    "RESEARCH_VIEW", "RESEARCH_CREATE", "RESEARCH_EDIT", "COLLABORATORS_MANAGE",
    "GROUPS_VIEW", "GROUPS_CREATE",
    "COMMUNICATION_VIEW", "COMMUNICATION_SEND", "ANNOUNCEMENTS_VIEW", "ANNOUNCEMENTS_MANAGE",
    "ANALYTICS_VIEW",
  ],

  HOD: [
    // Department Head: Scoped to their clinical or academic department
    "ORG_VIEW",
    "MEMBERS_VIEW", "DEPARTMENTS_VIEW",
    "STUDENTS_VIEW",
    "FACULTY_VIEW",
    "CLINICAL_WORKFORCE_VIEW",
    "JOBS_VIEW", "JOBS_CREATE", "APPLICATIONS_VIEW",
    "LEARNING_VIEW", "LEARNING_CREATE", "LEARNING_EDIT", "LIVE_CLASSES_MANAGE",
    "TRAINING_VIEW", "TRAINING_MANAGE",
    "ASSESSMENTS_VIEW", "ASSESSMENTS_MANAGE", "ASSESSMENTS_GRADE",
    "PROGRAMS_VIEW",
    "EVENTS_VIEW", "EVENTS_CREATE",
    "RESEARCH_VIEW", "RESEARCH_CREATE",
    "GROUPS_VIEW", "GROUPS_CREATE",
    "COMMUNICATION_VIEW", "COMMUNICATION_SEND", "ANNOUNCEMENTS_VIEW", "ANNOUNCEMENTS_MANAGE",
    "ANALYTICS_VIEW",
  ],

  FACULTY: [
    // Faculty / Instructor Studio: Course builder, lessons, live classes, assessments, grading
    "ORG_VIEW",
    "DEPARTMENTS_VIEW",
    "STUDENTS_VIEW",
    "PROGRAMS_VIEW",
    "LEARNING_VIEW", "LEARNING_CREATE", "LEARNING_EDIT", "LIVE_CLASSES_MANAGE",
    "ASSESSMENTS_VIEW", "ASSESSMENTS_MANAGE", "ASSESSMENTS_GRADE",
    "EVENTS_VIEW",
    "RESEARCH_VIEW", "RESEARCH_CREATE",
    "GROUPS_VIEW", "GROUPS_CREATE",
    "COMMUNICATION_VIEW", "COMMUNICATION_SEND", "ANNOUNCEMENTS_VIEW",
  ],

  PLACEMENT_OFFICER: [
    // College Placement Officer: Companies, recruiters, jobs, internships, eligible students, offers
    "ORG_VIEW",
    "DEPARTMENTS_VIEW",
    "STUDENTS_VIEW",
    "PROGRAMS_VIEW",
    "PLACEMENTS_VIEW", "PLACEMENTS_MANAGE",
    "JOBS_VIEW", "JOBS_CREATE", "JOBS_EDIT",
    "APPLICATIONS_VIEW", "APPLICATIONS_MANAGE", "INTERVIEWS_MANAGE", "CANDIDATES_MESSAGE",
    "COMMUNICATION_VIEW", "COMMUNICATION_SEND", "ANNOUNCEMENTS_VIEW",
    "ANALYTICS_VIEW",
  ],

  HR_MANAGER: [
    // Hospital HR Manager / Recruiter
    "ORG_VIEW",
    "MEMBERS_VIEW", "MEMBERS_INVITE", "MEMBERS_MANAGE", "DEPARTMENTS_VIEW",
    "CLINICAL_WORKFORCE_VIEW", "CLINICAL_WORKFORCE_MANAGE",
    "JOBS_VIEW", "JOBS_CREATE", "JOBS_EDIT", "JOBS_DELETE",
    "APPLICATIONS_VIEW", "APPLICATIONS_MANAGE", "INTERVIEWS_MANAGE", "CANDIDATES_MESSAGE",
    "COMMUNICATION_VIEW", "COMMUNICATION_SEND", "ANNOUNCEMENTS_VIEW", "ANNOUNCEMENTS_MANAGE",
    "ANALYTICS_VIEW",
  ],

  HR_RECRUITER: [
    // Standard HR Recruiter
    "ORG_VIEW",
    "MEMBERS_VIEW", "DEPARTMENTS_VIEW",
    "CLINICAL_WORKFORCE_VIEW",
    "JOBS_VIEW", "JOBS_CREATE", "JOBS_EDIT",
    "APPLICATIONS_VIEW", "APPLICATIONS_MANAGE", "INTERVIEWS_MANAGE", "CANDIDATES_MESSAGE",
    "COMMUNICATION_VIEW", "COMMUNICATION_SEND", "ANNOUNCEMENTS_VIEW",
    "ANALYTICS_VIEW",
  ],

  TRAINING_MANAGER: [
    // Medical Education / Hospital Training Manager
    "ORG_VIEW",
    "MEMBERS_VIEW", "DEPARTMENTS_VIEW",
    "CLINICAL_WORKFORCE_VIEW",
    "TRAINING_VIEW", "TRAINING_MANAGE",
    "LEARNING_VIEW", "LEARNING_CREATE", "LEARNING_EDIT", "LIVE_CLASSES_MANAGE", "STUDENTS_MANAGE",
    "ATTENDANCE_MANAGE", "CERTIFICATES_ISSUE",
    "COMMUNICATION_VIEW", "COMMUNICATION_SEND", "ANNOUNCEMENTS_VIEW",
    "ANALYTICS_VIEW",
  ],

  LEARNING_MANAGER: [
    // Learning / LMS Manager
    "ORG_VIEW",
    "DEPARTMENTS_VIEW",
    "LEARNING_VIEW", "LEARNING_CREATE", "LEARNING_EDIT", "LIVE_CLASSES_MANAGE", "STUDENTS_MANAGE",
    "TRAINING_VIEW", "TRAINING_MANAGE",
    "CERTIFICATES_ISSUE",
    "COMMUNICATION_VIEW", "COMMUNICATION_SEND", "ANNOUNCEMENTS_VIEW",
    "ANALYTICS_VIEW",
  ],

  EVENT_MANAGER: [
    "ORG_VIEW",
    "EVENTS_VIEW", "EVENTS_CREATE", "EVENTS_EDIT", "CONFERENCES_MANAGE", "ATTENDANCE_MANAGE", "CERTIFICATES_ISSUE",
    "COMMUNICATION_VIEW", "COMMUNICATION_SEND", "ANNOUNCEMENTS_VIEW",
    "ANALYTICS_VIEW",
  ],

  EVENT_COORDINATOR: [
    "ORG_VIEW",
    "EVENTS_VIEW", "EVENTS_CREATE", "EVENTS_EDIT", "CONFERENCES_MANAGE", "ATTENDANCE_MANAGE", "CERTIFICATES_ISSUE",
    "COMMUNICATION_VIEW", "COMMUNICATION_SEND", "ANNOUNCEMENTS_VIEW",
    "ANALYTICS_VIEW",
  ],

  CAMP_MANAGER: [
    "ORG_VIEW",
    "CAMPS_VIEW", "CAMPS_CREATE", "CAMPS_EDIT", "VOLUNTEERS_MANAGE", "CAMP_REPORTS_MANAGE",
    "CLINICAL_WORKFORCE_VIEW",
    "COMMUNICATION_VIEW", "COMMUNICATION_SEND", "ANNOUNCEMENTS_VIEW",
    "ANALYTICS_VIEW",
  ],

  RESEARCH_MANAGER: [
    "ORG_VIEW",
    "DEPARTMENTS_VIEW",
    "RESEARCH_VIEW", "RESEARCH_CREATE", "RESEARCH_EDIT", "COLLABORATORS_MANAGE",
    "COMMUNICATION_VIEW", "COMMUNICATION_SEND", "ANNOUNCEMENTS_VIEW",
    "ANALYTICS_VIEW",
  ],

  RESEARCH_COORDINATOR: [
    "ORG_VIEW",
    "DEPARTMENTS_VIEW",
    "STUDENTS_VIEW", "FACULTY_VIEW",
    "RESEARCH_VIEW", "RESEARCH_CREATE", "RESEARCH_EDIT", "COLLABORATORS_MANAGE",
    "COMMUNICATION_VIEW", "COMMUNICATION_SEND", "ANNOUNCEMENTS_VIEW",
    "ANALYTICS_VIEW",
  ],

  STUDENT_COORDINATOR: [
    "ORG_VIEW",
    "DEPARTMENTS_VIEW",
    "STUDENTS_VIEW",
    "GROUPS_VIEW", "GROUPS_CREATE", "GROUPS_MANAGE",
    "EVENTS_VIEW",
    "COMMUNICATION_VIEW", "COMMUNICATION_SEND", "ANNOUNCEMENTS_VIEW",
    "MODERATION_VIEW", "MODERATION_MANAGE",
  ],

  MARKETING_MANAGER: [
    "ORG_VIEW",
    "CONTENT_VIEW", "CONTENT_CREATE", "CONTENT_MANAGE",
    "GROUPS_VIEW", "GROUPS_CREATE",
    "COMMUNICATION_VIEW", "COMMUNICATION_SEND", "ANNOUNCEMENTS_VIEW", "ANNOUNCEMENTS_MANAGE",
    "ANALYTICS_VIEW",
  ],

  FINANCE_MANAGER: [
    "ORG_VIEW",
    "BILLING_VIEW", "BILLING_MANAGE",
    "ANALYTICS_VIEW",
  ],

  MODERATOR: [
    "ORG_VIEW",
    "MODERATION_VIEW", "MODERATION_MANAGE",
    "GROUPS_VIEW", "GROUPS_MANAGE",
    "CONTENT_VIEW",
  ],

  VIEWER: [
    "ORG_VIEW",
    "MEMBERS_VIEW",
    "DEPARTMENTS_VIEW",
    "STUDENTS_VIEW",
    "PROGRAMS_VIEW",
    "JOBS_VIEW",
    "EVENTS_VIEW",
    "CAMPS_VIEW",
    "LEARNING_VIEW",
    "RESEARCH_VIEW",
    "GROUPS_VIEW",
    "ANNOUNCEMENTS_VIEW",
  ],

  CUSTOM: [
    "ORG_VIEW",
  ],
};

export function hasOrgPermission(
  userRole?: string | null,
  customPermissions?: OrgPermission[] | null,
  requiredPermission?: OrgPermission
): boolean {
  if (!userRole) return false;
  const normalizedRole = userRole.toUpperCase() as OrgRole;

  if (normalizedRole === "OWNER") return true;

  if (normalizedRole === "CUSTOM" && customPermissions && Array.isArray(customPermissions)) {
    if (!requiredPermission) return true;
    return customPermissions.includes(requiredPermission);
  }

  const rolePerms = ROLE_DEFAULT_PERMISSIONS[normalizedRole] || [];
  if (!requiredPermission) return true;
  return rolePerms.includes(requiredPermission);
}

export type OrgModuleId =
  | "dashboard"
  | "profile"
  | "members"
  | "departments"
  | "clinical"
  | "training"
  | "students"
  | "faculty"
  | "programs"
  | "assessments"
  | "placements"
  | "jobs"
  | "events"
  | "camps"
  | "learning"
  | "research"
  | "groups"
  | "communication"
  | "content"
  | "calendar"
  | "analytics"
  | "billing"
  | "moderation"
  | "notifications"
  | "settings";

export const MODULE_PERMISSION_REQUIREMENTS: Record<OrgModuleId, OrgPermission> = {
  dashboard: "ORG_VIEW",
  profile: "ORG_VIEW",
  members: "MEMBERS_VIEW",
  departments: "DEPARTMENTS_VIEW",
  clinical: "CLINICAL_WORKFORCE_VIEW",
  training: "TRAINING_VIEW",
  students: "STUDENTS_VIEW",
  faculty: "FACULTY_VIEW",
  programs: "PROGRAMS_VIEW",
  assessments: "ASSESSMENTS_VIEW",
  placements: "PLACEMENTS_VIEW",
  jobs: "JOBS_VIEW",
  events: "EVENTS_VIEW",
  camps: "CAMPS_VIEW",
  learning: "LEARNING_VIEW",
  research: "RESEARCH_VIEW",
  groups: "GROUPS_VIEW",
  communication: "COMMUNICATION_VIEW",
  content: "CONTENT_VIEW",
  calendar: "ORG_VIEW",
  analytics: "ANALYTICS_VIEW",
  billing: "BILLING_VIEW",
  moderation: "MODERATION_VIEW",
  notifications: "ORG_VIEW",
  settings: "ORG_SETTINGS",
};

export function isModuleAllowed(
  moduleId: OrgModuleId,
  userRole?: string | null,
  customPermissions?: OrgPermission[] | null
): boolean {
  if (!userRole) return false;
  const req = MODULE_PERMISSION_REQUIREMENTS[moduleId];
  if (!req) return true;
  return hasOrgPermission(userRole, customPermissions, req);
}

export function getRoleDisplayName(role?: string | null, orgType?: OrganizationType): string {
  const isHospital = isHospitalWorkspace(orgType);
  const isCollege = isCollegeWorkspace(orgType);
  const r = role?.toUpperCase();

  switch (r) {
    case "OWNER":
      if (isHospital) return "Hospital Director / Owner";
      if (isCollege) return "Chancellor / Director / Owner";
      return "Owner / Director";
    case "ADMIN":
      if (isHospital) return "Hospital Administrator";
      if (isCollege) return "College Administrator";
      return "Organisation Admin";
    case "DEAN":
      return "Principal / Dean";
    case "HOD":
      if (isHospital) return "Clinical Department Head";
      if (isCollege) return "Academic HOD";
      return "Department Head";
    case "FACULTY":
      return "Faculty / Instructor";
    case "PLACEMENT_OFFICER":
      return "Placement Officer";
    case "HR_MANAGER":
    case "HR_RECRUITER":
      return "HR Manager / Recruiter";
    case "TRAINING_MANAGER":
      return "Medical Education / Training Manager";
    case "LEARNING_MANAGER":
      return "Learning Manager";
    case "EVENT_MANAGER":
      return "Event Manager";
    case "EVENT_COORDINATOR":
      return "Event Coordinator";
    case "CAMP_MANAGER":
      return "Camp Manager";
    case "RESEARCH_MANAGER":
      return "Research Manager";
    case "RESEARCH_COORDINATOR":
      return "Research Coordinator";
    case "STUDENT_COORDINATOR":
      return "Student Coordinator";
    case "MARKETING_MANAGER":
      return "Marketing Manager";
    case "FINANCE_MANAGER":
      return "Finance Manager";
    case "MODERATOR":
      return "Moderator";
    case "VIEWER":
      return isCollege ? "Student / Member" : "Staff Member";
    case "CUSTOM":
      return "Custom Role";
    default:
      return role || "Member";
  }
}

export function getRoleBadgeClass(role?: string | null): string {
  switch (role?.toUpperCase()) {
    case "OWNER":
      return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
    case "ADMIN":
      return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30";
    case "DEAN":
      return "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30";
    case "HOD":
      return "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30";
    case "FACULTY":
      return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
    case "PLACEMENT_OFFICER":
      return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30";
    case "HR_MANAGER":
    case "HR_RECRUITER":
      return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
    case "TRAINING_MANAGER":
    case "LEARNING_MANAGER":
      return "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30";
    case "EVENT_MANAGER":
    case "EVENT_COORDINATOR":
      return "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30";
    case "CAMP_MANAGER":
      return "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30";
    case "RESEARCH_MANAGER":
    case "RESEARCH_COORDINATOR":
      return "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30";
    case "STUDENT_COORDINATOR":
      return "bg-lime-500/15 text-lime-600 dark:text-lime-400 border-lime-500/30";
    case "FINANCE_MANAGER":
      return "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30";
    case "MODERATOR":
      return "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30";
    default:
      return "bg-slate-500/15 text-slate-400 border-slate-500/30";
  }
}
