// ============================================================
// MGN Organisation Role-Based Access Control (RBAC) Engine
// modules/organizations/lib/org-permissions.ts
// ============================================================

import { OrgPermission, OrgRole } from "../types";

export const ROLE_DEFAULT_PERMISSIONS: Record<OrgRole, OrgPermission[]> = {
  OWNER: [
    // Owner has ALL permissions
    "ORG_VIEW", "ORG_EDIT", "ORG_DELETE", "ORG_SETTINGS", "ORG_VERIFICATION", "AUDIT_LOGS_VIEW",
    "MEMBERS_VIEW", "MEMBERS_INVITE", "MEMBERS_MANAGE", "ROLES_MANAGE", "DEPARTMENTS_MANAGE",
    "JOBS_VIEW", "JOBS_CREATE", "JOBS_EDIT", "JOBS_DELETE", "APPLICATIONS_VIEW", "APPLICATIONS_MANAGE", "INTERVIEWS_MANAGE", "CANDIDATES_MESSAGE",
    "EVENTS_VIEW", "EVENTS_CREATE", "EVENTS_EDIT", "EVENTS_DELETE", "CONFERENCES_MANAGE", "ATTENDANCE_MANAGE", "CERTIFICATES_ISSUE",
    "CAMPS_VIEW", "CAMPS_CREATE", "CAMPS_EDIT", "CAMPS_DELETE", "VOLUNTEERS_MANAGE", "CAMP_REPORTS_MANAGE",
    "LEARNING_VIEW", "LEARNING_CREATE", "LEARNING_EDIT", "LEARNING_DELETE", "LIVE_CLASSES_MANAGE", "STUDENTS_MANAGE",
    "RESEARCH_VIEW", "RESEARCH_CREATE", "RESEARCH_EDIT", "RESEARCH_DELETE", "COLLABORATORS_MANAGE",
    "GROUPS_VIEW", "GROUPS_CREATE", "GROUPS_MANAGE",
    "CONTENT_VIEW", "CONTENT_CREATE", "CONTENT_MANAGE",
    "BILLING_VIEW", "BILLING_MANAGE",
    "MODERATION_VIEW", "MODERATION_MANAGE",
    "COMMUNICATION_VIEW", "COMMUNICATION_SEND",
    "ANALYTICS_VIEW", "ANALYTICS_EXPORT",
  ],

  ADMIN: [
    // Operational management (Billing/settings sensitive permissions remain owner-controlled)
    "ORG_VIEW", "ORG_EDIT",
    "MEMBERS_VIEW", "MEMBERS_INVITE", "MEMBERS_MANAGE", "DEPARTMENTS_MANAGE",
    "JOBS_VIEW", "JOBS_CREATE", "JOBS_EDIT", "JOBS_DELETE", "APPLICATIONS_VIEW", "APPLICATIONS_MANAGE", "INTERVIEWS_MANAGE", "CANDIDATES_MESSAGE",
    "EVENTS_VIEW", "EVENTS_CREATE", "EVENTS_EDIT", "EVENTS_DELETE", "CONFERENCES_MANAGE", "ATTENDANCE_MANAGE", "CERTIFICATES_ISSUE",
    "CAMPS_VIEW", "CAMPS_CREATE", "CAMPS_EDIT", "CAMPS_DELETE", "VOLUNTEERS_MANAGE", "CAMP_REPORTS_MANAGE",
    "LEARNING_VIEW", "LEARNING_CREATE", "LEARNING_EDIT", "LIVE_CLASSES_MANAGE", "STUDENTS_MANAGE",
    "RESEARCH_VIEW", "RESEARCH_CREATE", "RESEARCH_EDIT", "COLLABORATORS_MANAGE",
    "GROUPS_VIEW", "GROUPS_CREATE", "GROUPS_MANAGE",
    "CONTENT_VIEW", "CONTENT_CREATE", "CONTENT_MANAGE",
    "MODERATION_VIEW", "MODERATION_MANAGE",
    "COMMUNICATION_VIEW", "COMMUNICATION_SEND",
    "ANALYTICS_VIEW",
  ],

  HR_RECRUITER: [
    "ORG_VIEW",
    "MEMBERS_VIEW",
    "JOBS_VIEW", "JOBS_CREATE", "JOBS_EDIT",
    "APPLICATIONS_VIEW", "APPLICATIONS_MANAGE", "INTERVIEWS_MANAGE", "CANDIDATES_MESSAGE",
    "COMMUNICATION_VIEW", "COMMUNICATION_SEND",
    "ANALYTICS_VIEW",
  ],

  EVENT_MANAGER: [
    "ORG_VIEW",
    "EVENTS_VIEW", "EVENTS_CREATE", "EVENTS_EDIT", "CONFERENCES_MANAGE", "ATTENDANCE_MANAGE", "CERTIFICATES_ISSUE",
    "COMMUNICATION_VIEW", "COMMUNICATION_SEND",
    "ANALYTICS_VIEW",
  ],

  CAMP_MANAGER: [
    "ORG_VIEW",
    "CAMPS_VIEW", "CAMPS_CREATE", "CAMPS_EDIT", "VOLUNTEERS_MANAGE", "CAMP_REPORTS_MANAGE",
    "COMMUNICATION_VIEW", "COMMUNICATION_SEND",
    "ANALYTICS_VIEW",
  ],

  LEARNING_MANAGER: [
    "ORG_VIEW",
    "LEARNING_VIEW", "LEARNING_CREATE", "LEARNING_EDIT", "LIVE_CLASSES_MANAGE", "STUDENTS_MANAGE",
    "COMMUNICATION_VIEW", "COMMUNICATION_SEND",
    "ANALYTICS_VIEW",
  ],

  RESEARCH_MANAGER: [
    "ORG_VIEW",
    "RESEARCH_VIEW", "RESEARCH_CREATE", "RESEARCH_EDIT", "COLLABORATORS_MANAGE",
    "COMMUNICATION_VIEW", "COMMUNICATION_SEND",
    "ANALYTICS_VIEW",
  ],

  MARKETING_MANAGER: [
    "ORG_VIEW",
    "CONTENT_VIEW", "CONTENT_CREATE", "CONTENT_MANAGE",
    "GROUPS_VIEW", "GROUPS_CREATE",
    "COMMUNICATION_VIEW", "COMMUNICATION_SEND",
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
    "JOBS_VIEW",
    "EVENTS_VIEW",
    "CAMPS_VIEW",
    "LEARNING_VIEW",
    "RESEARCH_VIEW",
    "GROUPS_VIEW",
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
  departments: "DEPARTMENTS_MANAGE",
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

export function getRoleDisplayName(role?: string | null): string {
  switch (role?.toUpperCase()) {
    case "OWNER":
      return "Owner";
    case "ADMIN":
      return "Organisation Admin";
    case "HR_RECRUITER":
      return "HR / Recruiter";
    case "EVENT_MANAGER":
      return "Event Manager";
    case "CAMP_MANAGER":
      return "Camp Manager";
    case "LEARNING_MANAGER":
      return "Learning Manager";
    case "RESEARCH_MANAGER":
      return "Research Manager";
    case "MARKETING_MANAGER":
      return "Marketing Manager";
    case "FINANCE_MANAGER":
      return "Finance Manager";
    case "MODERATOR":
      return "Moderator";
    case "VIEWER":
      return "Viewer";
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
    case "HR_RECRUITER":
      return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
    case "EVENT_MANAGER":
      return "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30";
    case "CAMP_MANAGER":
      return "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30";
    case "LEARNING_MANAGER":
      return "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30";
    case "RESEARCH_MANAGER":
      return "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30";
    case "MARKETING_MANAGER":
      return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30";
    case "FINANCE_MANAGER":
      return "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30";
    case "MODERATOR":
      return "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30";
    default:
      return "bg-stone-500/15 text-stone-600 dark:text-stone-400 border-stone-500/30";
  }
}
