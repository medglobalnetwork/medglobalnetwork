// ============================================================
// MGN Department Head (HOD) Dashboard
// modules/organizations/components/dashboards/HODDashboard.tsx
// ============================================================

"use client";

import React from "react";
import Link from "next/link";
import {
  Network,
  Users,
  Briefcase,
  GraduationCap,
  Calendar,
  MessageSquare,
  Award,
  ArrowUpRight,
  Shield,
  BookOpen,
} from "lucide-react";
import { OrganizationRecord, OrgDashboardMetrics, isHospitalWorkspace, isCollegeWorkspace } from "../../types";

interface HODDashboardProps {
  organization: OrganizationRecord;
  metrics: OrgDashboardMetrics;
}

export function HODDashboard({ organization, metrics }: HODDashboardProps) {
  const isHospital = isHospitalWorkspace(organization.organization_type);
  const isCollege = isCollegeWorkspace(organization.organization_type);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* HOD Scoped Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 border border-slate-800 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20 flex items-center gap-1">
                <Shield className="size-3 text-cyan-400" />
                Department-Scoped Workspace
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-2">
              My Department Dashboard &bull; {organization.name}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              {isHospital
                ? "Manage your clinical department staff, clinical postings, department-level SOP trainings, and localized announcements."
                : isCollege
                ? "Manage your academic department courses, enrolled students, faculty teaching load, exams, and departmental research."
                : "Manage your departmental operations, team members, tasks, and communications."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/org/${organization.id}/departments`}
              className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all"
            >
              My Department Staff
            </Link>
            <Link
              href={isHospital ? `/org/${organization.id}/training` : `/org/${organization.id}/assessments`}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
            >
              {isHospital ? "Department SOPs" : "Department Exams"}
            </Link>
          </div>
        </div>
      </div>

      {/* Department Scoped Data Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400">Department Staff</span>
          <p className="text-2xl font-bold text-white mt-1">{Math.max(1, Math.round(metrics.totalMembersCount / Math.max(1, metrics.departmentsCount)))}</p>
          <span className="text-[11px] text-slate-500">Assigned members</span>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400">{isHospital ? "Department Openings" : "Students in Dept"}</span>
          <p className="text-2xl font-bold text-white mt-1">
            {isHospital ? metrics.activeJobsCount : (metrics.studentsCount ? Math.round(metrics.studentsCount / Math.max(1, metrics.departmentsCount)) : 0)}
          </p>
          <span className="text-[11px] text-slate-500">{isHospital ? "Active clinical jobs" : "Enrolled"}</span>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400">{isHospital ? "Internal Trainings" : "Courses & Exams"}</span>
          <p className="text-2xl font-bold text-white mt-1">{isHospital ? (metrics.internalTrainingsCount ?? 0) : metrics.coursesCount}</p>
          <span className="text-[11px] text-slate-500">Department scoped</span>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400">Research &amp; Studies</span>
          <p className="text-2xl font-bold text-white mt-1">{metrics.activeProjectsCount}</p>
          <span className="text-[11px] text-slate-500">Department projects</span>
        </div>
      </div>

      {/* Operational Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="size-4 text-cyan-400" />
              Department Roster &amp; Schedules
            </h3>
            <Link href={`/org/${organization.id}/departments`} className="text-xs text-cyan-400 hover:underline">
              Manage
            </Link>
          </div>
          <p className="text-xs text-slate-400">
            View allocated staff, assigned faculty, rota duties, and clinical/academic assignments within your department.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="size-4 text-blue-400" />
              Department Announcements
            </h3>
            <Link href={`/org/${organization.id}/communication`} className="text-xs text-blue-400 hover:underline">
              Post Update
            </Link>
          </div>
          <p className="text-xs text-slate-400">
            Publish targeted circulars and updates exclusively for members or students of your department.
          </p>
        </div>
      </div>
    </div>
  );
}
