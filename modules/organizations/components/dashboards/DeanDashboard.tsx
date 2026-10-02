// ============================================================
// MGN Principal / Dean Dashboard
// modules/organizations/components/dashboards/DeanDashboard.tsx
// ============================================================

"use client";

import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  FlaskConical,
  UserCheck,
  ClipboardList,
  Target,
  ArrowUpRight,
  ShieldCheck,
  Award,
} from "lucide-react";
import { OrganizationRecord, OrgDashboardMetrics } from "../../types";

interface DeanDashboardProps {
  organization: OrganizationRecord;
  metrics: OrgDashboardMetrics;
}

export function DeanDashboard({ organization, metrics }: DeanDashboardProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="rounded-2xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-slate-800 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
              Academic Dean & Principal Oversight
            </span>
            <h1 className="text-2xl font-bold text-white mt-2">
              Academic Operations Portal &bull; {organization.name}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Monitor academic programs, faculty teaching load, student cohorts, exams, assessments, and research output across all departments.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/org/${organization.id}/programs`}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all"
            >
              Academic Programs
            </Link>
            <Link
              href={`/org/${organization.id}/assessments`}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
            >
              Assessments Hub
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400">Total Enrolled</span>
          <p className="text-2xl font-bold text-white mt-1">{metrics.studentsCount ?? 0}</p>
          <span className="text-[11px] text-slate-500">Students</span>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400">Faculty Staff</span>
          <p className="text-2xl font-bold text-white mt-1">{metrics.facultyCount ?? metrics.totalMembersCount}</p>
          <span className="text-[11px] text-slate-500">Instructors</span>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400">Programs</span>
          <p className="text-2xl font-bold text-white mt-1">{metrics.academicProgramsCount ?? 0}</p>
          <span className="text-[11px] text-slate-500">Curriculums</span>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400">Research Projects</span>
          <p className="text-2xl font-bold text-white mt-1">{metrics.activeProjectsCount}</p>
          <span className="text-[11px] text-slate-500">Active studies</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="size-4 text-purple-400" />
              Academic Departments &amp; Head Oversight
            </h3>
            <Link href={`/org/${organization.id}/departments`} className="text-xs text-purple-400 hover:underline">
              View All
            </Link>
          </div>
          <p className="text-xs text-slate-400">
            Review department chair assignments, teaching allocations, curriculum progress, and student satisfaction.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ClipboardList className="size-4 text-cyan-400" />
              Examinations &amp; Quality Control
            </h3>
            <Link href={`/org/${organization.id}/assessments`} className="text-xs text-cyan-400 hover:underline">
              Review
            </Link>
          </div>
          <p className="text-xs text-slate-400">
            Oversee question bank standards, midterm and final examination schedules, and student performance metrics.
          </p>
        </div>
      </div>
    </div>
  );
}
