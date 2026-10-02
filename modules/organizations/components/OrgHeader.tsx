// ============================================================
// MGN Organisation Dynamic Header
// modules/organizations/components/OrgHeader.tsx
// ============================================================

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Bell,
  Search,
  Plus,
  Building2,
  Briefcase,
  Calendar,
  Layers,
  Tent,
  Compass,
  FileText,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Check,
  LogOut,
  ExternalLink,
  UserCheck,
  ClipboardList,
  Target,
  Award,
  BookOpen,
} from "lucide-react";
import {
  OrganizationRecord,
  OrgRole,
  OrgPermission,
  isHospitalWorkspace,
  isCollegeWorkspace,
} from "../types";
import { authClient } from "@/lib/auth-client";
import { getUserAvatarUrl } from "@/lib/avatar";
import { hasOrgPermission } from "../lib/org-permissions";

interface OrgHeaderProps {
  organization: OrganizationRecord;
  userOrganizations?: OrganizationRecord[];
  userRole?: OrgRole;
  customPermissions?: OrgPermission[];
  onToggleSidebar: () => void;
}

export function OrgHeader({
  organization,
  userOrganizations = [],
  userRole = "VIEWER",
  customPermissions = [],
  onToggleSidebar,
}: OrgHeaderProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  const isHospital = isHospitalWorkspace(organization.organization_type);
  const isCollege = isCollegeWorkspace(organization.organization_type);

  const canCreateJob = hasOrgPermission(userRole, customPermissions, "JOBS_CREATE");
  const canCreateEvent = hasOrgPermission(userRole, customPermissions, "EVENTS_CREATE");
  const canCreateCamp = hasOrgPermission(userRole, customPermissions, "CAMPS_CREATE");
  const canCreateGroup = hasOrgPermission(userRole, customPermissions, "GROUPS_CREATE");
  const canCreateContent = hasOrgPermission(userRole, customPermissions, "CONTENT_CREATE");
  const canCreateTraining = hasOrgPermission(userRole, customPermissions, "TRAINING_MANAGE");
  const canCreateStudent = hasOrgPermission(userRole, customPermissions, "STUDENTS_MANAGE");
  const canCreateAssessment = hasOrgPermission(userRole, customPermissions, "ASSESSMENTS_MANAGE");
  const canCreatePlacement = hasOrgPermission(userRole, customPermissions, "PLACEMENTS_MANAGE");

  const avatarUrl = getUserAvatarUrl(session?.user?.id, session?.user?.image);

  return (
    <header className="sticky top-0 z-20 h-16 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between">
      {/* Left section: Mobile menu & Org Name */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Toggle Navigation"
        >
          <Menu className="size-5" />
        </button>

        {/* Workspace Switcher Trigger */}
        <div className="relative">
          <button
            onClick={() => setIsOrgDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800/80 transition-colors text-left"
          >
            <div className="size-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              {organization.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-white truncate max-w-[180px]">
                  {organization.name}
                </span>
                {organization.verification_status === "verified" && (
                  <ShieldCheck className="size-3.5 text-emerald-400 shrink-0" />
                )}
              </div>
              <span className="text-[11px] text-slate-400 block -mt-0.5">
                {isHospital ? "Hospital Panel" : isCollege ? "College Panel" : "Workspace"}
              </span>
            </div>
            <ChevronDown className="size-4 text-slate-400" />
          </button>

          {/* Org Switcher Dropdown */}
          {isOrgDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsOrgDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-2 text-slate-200">
                <div className="px-3 py-2 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Your Workspaces
                </div>
                <div className="max-h-60 overflow-y-auto py-1 space-y-1">
                  {userOrganizations.map((org) => {
                    const isCurrent = org.id === organization.id;
                    return (
                      <button
                        key={org.id}
                        onClick={() => {
                          setIsOrgDropdownOpen(false);
                          router.push(`/org/${org.id}`);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                          isCurrent
                            ? "bg-blue-600/20 text-blue-400 font-semibold"
                            : "hover:bg-slate-800 text-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="size-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                            {org.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="truncate">{org.name}</span>
                        </div>
                        {isCurrent && <Check className="size-4 text-blue-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <Link
                    href="/organizations"
                    onClick={() => setIsOrgDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Plus className="size-3.5" />
                    <span>Create or Join Organisation</span>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right section: Quick actions, notifications, profile */}
      <div className="flex items-center gap-2.5">
        {/* Quick Action Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsQuickActionOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Quick Create</span>
            <ChevronDown className="size-3.5 opacity-80" />
          </button>

          {isQuickActionOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsQuickActionOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-60 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-1.5 text-slate-200 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {isHospital ? "Hospital Operations" : isCollege ? "Academic Operations" : "Quick Actions"}
                </div>

                {isCollege ? (
                  <>
                    <Link
                      href={`/org/${organization.id}/students`}
                      onClick={() => setIsQuickActionOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      <UserCheck className="size-4 text-blue-400" />
                      <span>Add Student</span>
                    </Link>
                    <Link
                      href={`/org/${organization.id}/assessments`}
                      onClick={() => setIsQuickActionOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      <ClipboardList className="size-4 text-cyan-400" />
                      <span>Create Assessment / Exam</span>
                    </Link>
                    <Link
                      href={`/org/${organization.id}/placements`}
                      onClick={() => setIsQuickActionOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      <Target className="size-4 text-rose-400" />
                      <span>Post Placement Drive</span>
                    </Link>
                    <Link
                      href={`/org/${organization.id}/programs`}
                      onClick={() => setIsQuickActionOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      <BookOpen className="size-4 text-purple-400" />
                      <span>Create Academic Program</span>
                    </Link>
                  </>
                ) : (
                  <>
                    {canCreateJob && (
                      <Link
                        href={`/org/${organization.id}/jobs/create`}
                        onClick={() => setIsQuickActionOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                      >
                        <Briefcase className="size-4 text-blue-400" />
                        <span>Create Job Opening</span>
                      </Link>
                    )}

                    {canCreateCamp && (
                      <Link
                        href={`/org/${organization.id}/camps/create`}
                        onClick={() => setIsQuickActionOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                      >
                        <Tent className="size-4 text-teal-400" />
                        <span>Create Health Camp</span>
                      </Link>
                    )}

                    {isHospital && (
                      <Link
                        href={`/org/${organization.id}/training`}
                        onClick={() => setIsQuickActionOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                      >
                        <Award className="size-4 text-indigo-400" />
                        <span>Create SOP Training</span>
                      </Link>
                    )}
                  </>
                )}

                {canCreateEvent && (
                  <Link
                    href={`/org/${organization.id}/events/create`}
                    onClick={() => setIsQuickActionOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <Calendar className="size-4 text-purple-400" />
                    <span>Host CME / Event</span>
                  </Link>
                )}

                <Link
                  href={`/org/${organization.id}/communication`}
                  onClick={() => setIsQuickActionOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <FileText className="size-4 text-rose-400" />
                  <span>Post Announcement</span>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Notifications */}
        <Link
          href={`/org/${organization.id}/notifications`}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors relative"
          aria-label="Org Notifications"
        >
          <Bell className="size-4.5" />
        </Link>

        {/* User profile avatar */}
        <div className="flex items-center pl-2 border-l border-slate-800">
          <Link
            href="/profile"
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-800 transition-colors"
            title={session?.user?.name || "User Profile"}
          >
            <div className="size-7 rounded-full bg-slate-800 border border-slate-700 overflow-hidden shrink-0">
              <img
                src={avatarUrl}
                alt={session?.user?.name || "User"}
                className="size-full object-cover"
              />
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
