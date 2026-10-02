// ============================================================
// MGN Organisation Dynamic Sidebar Navigation
// modules/organizations/components/OrgSidebar.tsx
// ============================================================

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  Network,
  Briefcase,
  Calendar,
  Tent,
  GraduationCap,
  FlaskConical,
  MessageSquare,
  FileText,
  CreditCard,
  BarChart3,
  Bell,
  Settings,
  ShieldCheck,
  X,
  Compass,
  ArrowLeft,
  Sparkles,
  BookOpen,
  UserCheck,
  Award,
  Stethoscope,
  ClipboardList,
  Target,
  FileSpreadsheet,
} from "lucide-react";
import {
  OrganizationRecord,
  OrgRole,
  OrgPermission,
  isHospitalWorkspace,
  isCollegeWorkspace,
} from "../types";
import {
  isModuleAllowed,
  OrgModuleId,
  getRoleBadgeClass,
  getRoleDisplayName,
} from "../lib/org-permissions";

interface OrgSidebarProps {
  organization: OrganizationRecord;
  userRole?: OrgRole;
  customPermissions?: OrgPermission[];
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItemConfig {
  id: OrgModuleId;
  label: string;
  href: (orgId: string) => string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export function OrgSidebar({
  organization,
  userRole = "VIEWER",
  customPermissions = [],
  isMobileOpen,
  onCloseMobile,
}: OrgSidebarProps) {
  const pathname = usePathname();
  const orgId = organization.id;

  const isHospital = isHospitalWorkspace(organization.organization_type);
  const isCollege = isCollegeWorkspace(organization.organization_type);

  // 1. HOSPITAL SPECIALIZED NAVIGATION
  const hospitalNavSections: { section?: string; items: NavItemConfig[] }[] = [
    {
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          href: (id) => `/org/${id}`,
          icon: LayoutDashboard,
        },
        {
          id: "profile",
          label: "Hospital Profile",
          href: (id) => `/org/${id}/profile`,
          icon: Building2,
        },
      ],
    },
    {
      section: "STAFF & CLINICAL WORKFORCE",
      items: [
        {
          id: "jobs",
          label: "Recruitment Pipeline",
          href: (id) => `/org/${id}/jobs`,
          icon: Briefcase,
        },
        {
          id: "clinical",
          label: "Clinical Workforce",
          href: (id) => `/org/${id}/clinical`,
          icon: Stethoscope,
        },
        {
          id: "members",
          label: "All Staff & Members",
          href: (id) => `/org/${id}/members`,
          icon: Users,
        },
        {
          id: "departments",
          label: "Clinical Departments",
          href: (id) => `/org/${id}/departments`,
          icon: Network,
        },
      ],
    },
    {
      section: "EVENTS & MEDICAL OUTREACH",
      items: [
        {
          id: "events",
          label: "Conferences & CME",
          href: (id) => `/org/${id}/events`,
          icon: Calendar,
        },
        {
          id: "camps",
          label: "Medical Health Camps",
          href: (id) => `/org/${id}/camps`,
          icon: Tent,
        },
      ],
    },
    {
      section: "LEARNING & HOSPITAL TRAINING",
      items: [
        {
          id: "training",
          label: "Internal SOP Training",
          href: (id) => `/org/${id}/training`,
          icon: Award,
        },
        {
          id: "learning",
          label: "Courses & Live Classes",
          href: (id) => `/org/${id}/learning`,
          icon: GraduationCap,
        },
      ],
    },
    {
      section: "RESEARCH & CLINICAL TRIALS",
      items: [
        {
          id: "research",
          label: "Clinical Research Projects",
          href: (id) => `/org/${id}/research`,
          icon: FlaskConical,
        },
      ],
    },
    {
      section: "COLLABORATION & OPERATIONS",
      items: [
        {
          id: "groups",
          label: "Clinical Groups",
          href: (id) => `/org/${id}/groups`,
          icon: Compass,
        },
        {
          id: "communication",
          label: "Announcements & Comms",
          href: (id) => `/org/${id}/communication`,
          icon: MessageSquare,
        },
        {
          id: "calendar",
          label: "Hospital Calendar",
          href: (id) => `/org/${id}/calendar`,
          icon: Calendar,
        },
        {
          id: "analytics",
          label: "Operational Analytics",
          href: (id) => `/org/${id}/analytics`,
          icon: BarChart3,
        },
        {
          id: "billing",
          label: "Subscription & Billing",
          href: (id) => `/org/${id}/billing`,
          icon: CreditCard,
        },
        {
          id: "notifications",
          label: "Notifications",
          href: (id) => `/org/${id}/notifications`,
          icon: Bell,
        },
      ],
    },
    {
      section: "GOVERNANCE",
      items: [
        {
          id: "settings",
          label: "Settings & Audit Logs",
          href: (id) => `/org/${id}/settings`,
          icon: Settings,
        },
      ],
    },
  ];

  // 2. COLLEGE / UNIVERSITY SPECIALIZED NAVIGATION
  const collegeNavSections: { section?: string; items: NavItemConfig[] }[] = [
    {
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          href: (id) => `/org/${id}`,
          icon: LayoutDashboard,
        },
        {
          id: "profile",
          label: "Institution Profile",
          href: (id) => `/org/${id}/profile`,
          icon: Building2,
        },
      ],
    },
    {
      section: "ACADEMICS & STUDENTS",
      items: [
        {
          id: "students",
          label: "Students Directory",
          href: (id) => `/org/${id}/students`,
          icon: UserCheck,
        },
        {
          id: "faculty",
          label: "Faculty & Staff",
          href: (id) => `/org/${id}/faculty`,
          icon: Users,
        },
        {
          id: "programs",
          label: "Academic Programs",
          href: (id) => `/org/${id}/programs`,
          icon: BookOpen,
        },
        {
          id: "departments",
          label: "Academic Departments",
          href: (id) => `/org/${id}/departments`,
          icon: Network,
        },
      ],
    },
    {
      section: "LEARNING & EXAMS",
      items: [
        {
          id: "learning",
          label: "Courses & Modules",
          href: (id) => `/org/${id}/learning`,
          icon: GraduationCap,
        },
        {
          id: "assessments",
          label: "Exams & Assessments",
          href: (id) => `/org/${id}/assessments`,
          icon: ClipboardList,
        },
      ],
    },
    {
      section: "CAREERS & PLACEMENTS",
      items: [
        {
          id: "placements",
          label: "Placements & Drives",
          href: (id) => `/org/${id}/placements`,
          icon: Target,
        },
      ],
    },
    {
      section: "EVENTS & OUTREACH",
      items: [
        {
          id: "events",
          label: "Academic Events & CME",
          href: (id) => `/org/${id}/events`,
          icon: Calendar,
        },
        {
          id: "camps",
          label: "Community Outreach / Camps",
          href: (id) => `/org/${id}/camps`,
          icon: Tent,
        },
      ],
    },
    {
      section: "RESEARCH & PUBLICATIONS",
      items: [
        {
          id: "research",
          label: "Student & Faculty Research",
          href: (id) => `/org/${id}/research`,
          icon: FlaskConical,
        },
      ],
    },
    {
      section: "COMMUNITY & OPS",
      items: [
        {
          id: "groups",
          label: "Batches & Communities",
          href: (id) => `/org/${id}/groups`,
          icon: Compass,
        },
        {
          id: "communication",
          label: "Announcements & Comms",
          href: (id) => `/org/${id}/communication`,
          icon: MessageSquare,
        },
        {
          id: "calendar",
          label: "Academic Calendar",
          href: (id) => `/org/${id}/calendar`,
          icon: Calendar,
        },
        {
          id: "analytics",
          label: "Institutional Analytics",
          href: (id) => `/org/${id}/analytics`,
          icon: BarChart3,
        },
        {
          id: "billing",
          label: "Subscription & Billing",
          href: (id) => `/org/${id}/billing`,
          icon: CreditCard,
        },
        {
          id: "notifications",
          label: "Notifications",
          href: (id) => `/org/${id}/notifications`,
          icon: Bell,
        },
      ],
    },
    {
      section: "GOVERNANCE",
      items: [
        {
          id: "settings",
          label: "Settings & Audit Logs",
          href: (id) => `/org/${id}/settings`,
          icon: Settings,
        },
      ],
    },
  ];

  // 3. GENERIC / CORPORATE WORKSPACE NAVIGATION
  const genericNavSections: { section?: string; items: NavItemConfig[] }[] = [
    {
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          href: (id) => `/org/${id}`,
          icon: LayoutDashboard,
        },
        {
          id: "profile",
          label: "Organisation Profile",
          href: (id) => `/org/${id}/profile`,
          icon: Building2,
        },
        {
          id: "members",
          label: "Team & Members",
          href: (id) => `/org/${id}/members`,
          icon: Users,
        },
        {
          id: "departments",
          label: "Departments",
          href: (id) => `/org/${id}/departments`,
          icon: Network,
        },
      ],
    },
    {
      section: "OPERATIONS",
      items: [
        {
          id: "jobs",
          label: "Jobs & Recruitment",
          href: (id) => `/org/${id}/jobs`,
          icon: Briefcase,
        },
        {
          id: "events",
          label: "Events & Conferences",
          href: (id) => `/org/${id}/events`,
          icon: Calendar,
        },
        {
          id: "camps",
          label: "Health Camps",
          href: (id) => `/org/${id}/camps`,
          icon: Tent,
        },
        {
          id: "learning",
          label: "Courses & Learning",
          href: (id) => `/org/${id}/learning`,
          icon: GraduationCap,
        },
        {
          id: "research",
          label: "Research & Trials",
          href: (id) => `/org/${id}/research`,
          icon: FlaskConical,
        },
        {
          id: "groups",
          label: "Groups & Community",
          href: (id) => `/org/${id}/groups`,
          icon: Compass,
        },
      ],
    },
    {
      section: "INSIGHTS & GOVERNANCE",
      items: [
        {
          id: "communication",
          label: "Contextual Messages",
          href: (id) => `/org/${id}/communication`,
          icon: MessageSquare,
        },
        {
          id: "calendar",
          label: "Org Calendar",
          href: (id) => `/org/${id}/calendar`,
          icon: Calendar,
        },
        {
          id: "analytics",
          label: "Analytics & Reports",
          href: (id) => `/org/${id}/analytics`,
          icon: BarChart3,
        },
        {
          id: "billing",
          label: "Subscription & Billing",
          href: (id) => `/org/${id}/billing`,
          icon: CreditCard,
        },
        {
          id: "notifications",
          label: "Notifications",
          href: (id) => `/org/${id}/notifications`,
          icon: Bell,
        },
        {
          id: "settings",
          label: "Settings & Audit",
          href: (id) => `/org/${id}/settings`,
          icon: Settings,
        },
      ],
    },
  ];

  const activeRawSections = isHospital
    ? hospitalNavSections
    : isCollege
    ? collegeNavSections
    : genericNavSections;

  // Filter sections by role permissions
  const visibleSections = activeRawSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        isModuleAllowed(item.id, userRole, customPermissions)
      ),
    }))
    .filter((section) => section.items.length > 0);

  const isLinkActive = (targetHref: string) => {
    if (targetHref === `/org/${orgId}`) {
      return pathname === `/org/${orgId}`;
    }
    return pathname.startsWith(targetHref);
  };

  const roleLabel = getRoleDisplayName(userRole, organization.organization_type);
  const roleBadgeClass = getRoleBadgeClass(userRole);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-200 select-none">
      {/* Top Organization Header */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
        <Link
          href="/organizations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-3 group"
        >
          <ArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Switch Workspace</span>
        </Link>

        <div className="flex items-start gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0 overflow-hidden border border-white/10">
            {organization.logo_url ? (
              <img
                src={organization.logo_url}
                alt={organization.name}
                className="size-full object-cover"
              />
            ) : (
              <span>{organization.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <h2 className="text-sm font-bold text-white truncate">
                {organization.name}
              </h2>
              {organization.verification_status === "verified" && (
                <span title="Verified Organisation" className="inline-flex items-center">
                  <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] font-semibold text-blue-400 truncate">
                {isHospital
                  ? "🏥 Hospital Panel"
                  : isCollege
                  ? "🎓 College Panel"
                  : organization.organization_type}
              </span>
            </div>
          </div>
        </div>

        {/* Role & Plan Pill */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${roleBadgeClass}`}
          >
            {roleLabel}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
            {organization.plan || "Basic"}
          </span>
        </div>
      </div>

      {/* Navigation Modules */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 custom-scrollbar">
        {visibleSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {section.section && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                {section.section}
              </p>
            )}
            {section.items.map((item) => {
              const href = item.href(orgId);
              const active = isLinkActive(href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.id}
                  href={href}
                  onClick={onCloseMobile}
                  className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "bg-blue-600 text-white font-semibold shadow-sm"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`size-4 shrink-0 transition-colors ${
                        active
                          ? "text-white"
                          : "text-slate-400 group-hover:text-slate-200"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-700 text-slate-200">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer / MGN Ecosystem Link */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/30">
        <Link
          href="/home"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          <div className="size-5 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">
            M
          </div>
          <span>Return to Personal MGN Feed</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-slate-900 shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <button
              onClick={onCloseMobile}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/80"
              aria-label="Close menu"
            >
              <X className="size-4" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
