"use client";

import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Video,
  Award,
  Plus,
  ArrowUpRight,
  Users,
} from "lucide-react";
import { OrganizationRecord, OrgDashboardMetrics } from "../../types";

interface Props {
  organization: OrganizationRecord;
  metrics: OrgDashboardMetrics;
}

export function LearningManagerDashboard({ organization, metrics }: Props) {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-2">
            <GraduationCap className="size-3.5" />
            <span>Learning Management & LMS</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Curriculum & CME Programs</h1>
          <p className="text-xs text-slate-400 mt-1">
            Build accredited medical courses, host live classes, and manage student assessments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/org/${organization.id}/learning?action=create`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
          >
            <Plus className="size-4" />
            <span>Create Course</span>
          </Link>
          <Link
            href={`/org/${organization.id}/learning/live-classes`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
          >
            <Video className="size-4 text-indigo-400" />
            <span>Schedule Live Class</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-semibold text-slate-400">Total Courses</span>
          <p className="text-2xl font-bold text-white mt-2">{metrics.coursesCount}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-semibold text-slate-400">Enrolled Students</span>
          <p className="text-2xl font-bold text-indigo-400 mt-2">{metrics.enrolledStudentsCount}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-semibold text-slate-400">Upcoming Live Classes</span>
          <p className="text-2xl font-bold text-blue-400 mt-2">{metrics.liveClassesUpcomingCount}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-semibold text-slate-400">Certificates Awarded</span>
          <p className="text-2xl font-bold text-emerald-400 mt-2">{metrics.courseCompletionsCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-2">Course Catalogue</h3>
          <p className="text-xs text-slate-400 mb-4">
            Manage modules, interactive quizzes, clinical cases, and video lectures.
          </p>
          <Link
            href={`/org/${organization.id}/learning`}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
          >
            <span>Manage Courses</span> <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-2">Live Virtual Classrooms</h3>
          <p className="text-xs text-slate-400 mb-4">
            Host real-time interactive lectures with multi-camera live video and group chats.
          </p>
          <Link
            href={`/org/${organization.id}/learning/live-classes`}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
          >
            <span>Live Classrooms</span> <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-2">Students & CME Grading</h3>
          <p className="text-xs text-slate-400 mb-4">
            Track student progress, grading rubric results, and issue digital certificates.
          </p>
          <Link
            href={`/org/${organization.id}/learning/students`}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
          >
            <span>Student Management</span> <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
