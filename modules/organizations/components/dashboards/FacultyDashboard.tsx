// ============================================================
// MGN Faculty & Instructor Dashboard
// modules/organizations/components/dashboards/FacultyDashboard.tsx
// ============================================================

"use client";

import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  Calendar,
  ClipboardList,
  Video,
  Award,
  ArrowUpRight,
  BookOpen,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { OrganizationRecord, OrgDashboardMetrics } from "../../types";

interface FacultyDashboardProps {
  organization: OrganizationRecord;
  metrics: OrgDashboardMetrics;
}

export function FacultyDashboard({ organization, metrics }: FacultyDashboardProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Instructor Studio Header */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-slate-800 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Instructor Studio &bull; Faculty Workspace
            </span>
            <h1 className="text-2xl font-bold text-white mt-2">
              Teaching Studio &bull; {organization.name}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Manage your assigned academic courses, lesson plans, live clinical lectures, assessments, student grading, and attendance tracking.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/org/${organization.id}/learning`}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
            >
              Course Builder
            </Link>
            <Link
              href={`/org/${organization.id}/assessments`}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
            >
              Create Assessment
            </Link>
          </div>
        </div>
      </div>

      {/* Teaching Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400">Assigned Courses</span>
          <p className="text-2xl font-bold text-white mt-1">{metrics.coursesCount}</p>
          <span className="text-[11px] text-slate-500">Active subjects</span>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400">Enrolled Students</span>
          <p className="text-2xl font-bold text-white mt-1">{metrics.studentsCount ?? metrics.enrolledStudentsCount}</p>
          <span className="text-[11px] text-slate-500">In your classes</span>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400">Exams &amp; Quizzes</span>
          <p className="text-2xl font-bold text-white mt-1">{metrics.pendingAssessmentsCount ?? 0}</p>
          <span className="text-[11px] text-slate-500">Active assessments</span>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400">Live Lectures</span>
          <p className="text-2xl font-bold text-white mt-1">{metrics.liveClassesUpcomingCount}</p>
          <span className="text-[11px] text-slate-500">Scheduled sessions</span>
        </div>
      </div>

      {/* Quick Access Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="size-4 text-emerald-400" />
              My Courses &amp; Lessons
            </h3>
            <Link href={`/org/${organization.id}/learning`} className="text-xs text-emerald-400 hover:underline">
              Open
            </Link>
          </div>
          <p className="text-xs text-slate-400">
            Upload video lessons, clinical case studies, PDFs, and slide decks for your semester subjects.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ClipboardList className="size-4 text-cyan-400" />
              Assessments &amp; Grading
            </h3>
            <Link href={`/org/${organization.id}/assessments`} className="text-xs text-cyan-400 hover:underline">
              Evaluate
            </Link>
          </div>
          <p className="text-xs text-slate-400">
            Create MCQ tests, practical evaluations, and case-based assessments with automatic score tabulation.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Video className="size-4 text-indigo-400" />
              Live Virtual Classes
            </h3>
            <Link href={`/org/${organization.id}/learning/live-classes`} className="text-xs text-indigo-400 hover:underline">
              Schedule
            </Link>
          </div>
          <p className="text-xs text-slate-400">
            Host live interactive classroom lectures and record automatic student attendance logs.
          </p>
        </div>
      </div>
    </div>
  );
}
