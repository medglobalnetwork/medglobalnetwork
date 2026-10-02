// ============================================================
// MGN College & University Academic Dashboard
// modules/organizations/components/dashboards/CollegeDashboard.tsx
// ============================================================

"use client";

import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  Tent,
  FlaskConical,
  CreditCard,
  Plus,
  ShieldCheck,
  ArrowUpRight,
  UserCheck,
  ClipboardList,
  Target,
  AlertCircle,
  MessageSquare,
  Sparkles,
  School,
  FileSpreadsheet,
} from "lucide-react";
import { OrganizationRecord, OrgDashboardMetrics } from "../../types";

interface CollegeDashboardProps {
  organization: OrganizationRecord;
  metrics: OrgDashboardMetrics;
}

export function CollegeDashboard({ organization, metrics }: CollegeDashboardProps) {
  const isVerified = organization.verification_status === "verified";

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* College Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 via-indigo-950 to-purple-950 border border-slate-800 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 flex items-center gap-1.5">
                <School className="size-3.5 text-indigo-400" />
                Academic Institution Workspace
              </span>
              {isVerified ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <ShieldCheck className="size-3.5" /> Verified Institution
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  <AlertCircle className="size-3.5" /> Verification Pending
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Good Morning, {organization.name}
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              {organization.description ||
                "Manage academic programs, student directory, faculty assignments, courses, exams & question banks, campus placements, and research projects."}
            </p>
          </div>

          {/* Quick Academic Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href={`/org/${organization.id}/students`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-900/30 transition-all hover:scale-105"
            >
              <UserCheck className="size-3.5" />
              <span>Add Student</span>
            </Link>
            <Link
              href={`/org/${organization.id}/programs`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all hover:scale-105"
            >
              <BookOpen className="size-3.5 text-purple-400" />
              <span>Create Program</span>
            </Link>
            <Link
              href={`/org/${organization.id}/learning`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all hover:scale-105"
            >
              <GraduationCap className="size-3.5 text-indigo-400" />
              <span>Create Course</span>
            </Link>
            <Link
              href={`/org/${organization.id}/assessments`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all hover:scale-105"
            >
              <ClipboardList className="size-3.5 text-cyan-400" />
              <span>Create Assessment</span>
            </Link>
            <Link
              href={`/org/${organization.id}/placements`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all hover:scale-105"
            >
              <Target className="size-3.5 text-rose-400" />
              <span>Post Placement Drive</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Enrolled Students</span>
            <UserCheck className="size-4 text-blue-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white">{metrics.studentsCount ?? metrics.enrolledStudentsCount}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Across all batches
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Faculty Members</span>
            <Users className="size-4 text-purple-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white">{metrics.facultyCount ?? metrics.totalMembersCount}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              {metrics.departmentsCount} departments
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Academic Programs</span>
            <BookOpen className="size-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white">{metrics.academicProgramsCount ?? 0}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">BPT, MBBS, Nursing, etc.</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Courses & Modules</span>
            <GraduationCap className="size-4 text-indigo-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white">{metrics.coursesCount}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">LMS curriculum</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Placement Drives</span>
            <Target className="size-4 text-rose-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white">{metrics.activePlacementsCount ?? 0}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Active hiring drives</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Student Research</span>
            <FlaskConical className="size-4 text-cyan-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white">{metrics.activeProjectsCount}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Projects active</span>
          </div>
        </div>
      </div>

      {/* Primary Academic Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Students & Batches Overview */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <UserCheck className="size-4.5 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Students & Batches</h3>
            </div>
            <Link
              href={`/org/${organization.id}/students`}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>Directory</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
              <span className="text-xs text-slate-400">Total Enrolled</span>
              <p className="text-xl font-bold text-white mt-1">{metrics.studentsCount ?? 0}</p>
            </div>
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
              <span className="text-xs text-slate-400">Academic Batches</span>
              <p className="text-xl font-bold text-white mt-1">{metrics.academicProgramsCount ?? 0}</p>
            </div>
          </div>

          {(metrics.studentsCount ?? 0) === 0 && (
            <div className="text-center py-4 bg-slate-950/30 rounded-xl border border-dashed border-slate-800">
              <p className="text-xs text-slate-400">No students enrolled yet</p>
              <Link
                href={`/org/${organization.id}/students`}
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:underline"
              >
                <Plus className="size-3" /> Enroll first student batch
              </Link>
            </div>
          )}
        </div>

        {/* 2. Exams & Assessments */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ClipboardList className="size-4.5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Exams & Question Banks</h3>
            </div>
            <Link
              href={`/org/${organization.id}/assessments`}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/50 border border-slate-800">
              <div>
                <p className="font-semibold text-white">MCQ & Case Assessments</p>
                <p className="text-[10px] text-slate-400">Automated grading & analytics</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Exam Ready
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/50 border border-slate-800">
              <div>
                <p className="font-semibold text-white">Question Bank Bank Repository</p>
                <p className="text-[10px] text-slate-400">Department & Institution scoped</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Active
              </span>
            </div>
          </div>

          <Link
            href={`/org/${organization.id}/assessments`}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition-colors"
          >
            <Plus className="size-3.5" /> Create Assessment or Exam
          </Link>
        </div>

        {/* 3. Campus Placements & Career Cell */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Target className="size-4.5 text-rose-400" />
              <h3 className="text-sm font-bold text-white">Placements & Career Cell</h3>
            </div>
            <Link
              href={`/org/${organization.id}/placements`}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <span>Portal</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
              <span className="text-xs text-slate-400">Active Drives</span>
              <p className="text-xl font-bold text-white mt-1">{metrics.activePlacementsCount ?? 0}</p>
            </div>
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
              <span className="text-xs text-slate-400">Offers Issued</span>
              <p className="text-xl font-bold text-white mt-1">{metrics.offersCount ?? 0}</p>
            </div>
          </div>

          {(metrics.activePlacementsCount ?? 0) === 0 && (
            <div className="text-center py-4 bg-slate-950/30 rounded-xl border border-dashed border-slate-800">
              <p className="text-xs text-slate-400">No active placement drives currently</p>
              <Link
                href={`/org/${organization.id}/placements`}
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-rose-400 hover:underline"
              >
                <Plus className="size-3" /> Post placement opening
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Academic Programs & Research Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic Programs */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <BookOpen className="size-4.5 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Academic Programs</h3>
            </div>
            <Link
              href={`/org/${organization.id}/programs`}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <span>Curriculum</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span>BPT / MPT (Physiotherapy)</span>
              <span className="font-semibold text-white">4 Years + Internship</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>MBBS / BDS (Medical & Dental)</span>
              <span className="font-semibold text-white">Clinical Programs</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>B.Sc / M.Sc Nursing</span>
              <span className="font-semibold text-white">Healthcare Programs</span>
            </div>
          </div>
        </div>

        {/* Faculty & Student Research */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FlaskConical className="size-4.5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Faculty & Student Research</h3>
            </div>
            <Link
              href={`/org/${organization.id}/research`}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Research Hub</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
              <span className="text-xs text-slate-400">Active Projects</span>
              <p className="text-xl font-bold text-white mt-1">{metrics.activeProjectsCount}</p>
            </div>
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
              <span className="text-xs text-slate-400">Publications</span>
              <p className="text-xl font-bold text-white mt-1">{metrics.publicationsCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Footer */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <CreditCard className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">
                Current Plan: {metrics.planName}
              </h4>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {metrics.subscriptionStatus}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Renews on {new Date(metrics.renewalDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <Link
          href={`/org/${organization.id}/billing`}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors"
        >
          Manage Entitlements & Billing
        </Link>
      </div>
    </div>
  );
}
