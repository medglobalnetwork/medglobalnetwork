"use client";

import React from "react";
import Link from "next/link";
import {
  Briefcase,
  Users,
  UserCheck,
  Calendar,
  Plus,
  ArrowUpRight,
  Clock,
  Sparkles,
  Search,
  MessageSquare,
} from "lucide-react";
import { OrganizationRecord, OrgDashboardMetrics } from "../../types";

interface RecruiterDashboardProps {
  organization: OrganizationRecord;
  metrics: OrgDashboardMetrics;
}

export function RecruiterDashboard({ organization, metrics }: RecruiterDashboardProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
            <Briefcase className="size-3.5" />
            <span>HR & Recruitment Portal</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Talent Acquisition & Hiring</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage open positions, review candidate applications, and schedule clinical interviews.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/org/${organization.id}/jobs/create`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="size-4" />
            <span>Post New Job</span>
          </Link>
          <Link
            href={`/org/${organization.id}/jobs/candidates`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
          >
            <Users className="size-4 text-slate-400" />
            <span>Talent Pool</span>
          </Link>
        </div>
      </div>

      {/* Recruitment Funnel Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-semibold text-slate-400">Active Jobs</span>
          <p className="text-2xl font-bold text-white mt-2">{metrics.activeJobsCount}</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-semibold text-slate-400">Total Applications</span>
          <p className="text-2xl font-bold text-blue-400 mt-2">{metrics.totalApplicationsCount}</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-semibold text-slate-400">Shortlisted</span>
          <p className="text-2xl font-bold text-purple-400 mt-2">{metrics.shortlistedCount}</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-semibold text-slate-400">Interviews</span>
          <p className="text-2xl font-bold text-amber-400 mt-2">{metrics.interviewsScheduledCount}</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-semibold text-slate-400">Offers Extended</span>
          <p className="text-2xl font-bold text-emerald-400 mt-2">{metrics.offersCount}</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-semibold text-slate-400">Hired</span>
          <p className="text-2xl font-bold text-teal-400 mt-2">{metrics.hiresCount}</p>
        </div>
      </div>

      {/* Pipeline Navigation cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="size-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
              <Briefcase className="size-5" />
            </div>
            <h3 className="text-base font-bold text-white">Job Openings</h3>
            <p className="text-xs text-slate-400 mt-1">
              Create, review, publish, and close medical & clinical job requisitions.
            </p>
          </div>
          <Link
            href={`/org/${organization.id}/jobs`}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300"
          >
            <span>View All Jobs</span>
            <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="size-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
              <Users className="size-5" />
            </div>
            <h3 className="text-base font-bold text-white">Applications Pipeline</h3>
            <p className="text-xs text-slate-400 mt-1">
              Move candidates through screening, clinical review, and background verification.
            </p>
          </div>
          <Link
            href={`/org/${organization.id}/jobs/applications`}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:text-purple-300"
          >
            <span>Review Applications</span>
            <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="size-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
              <Calendar className="size-5" />
            </div>
            <h3 className="text-base font-bold text-white">Interview Schedule</h3>
            <p className="text-xs text-slate-400 mt-1">
              Coordinate technical rounds, clinical panel interviews, and video discussions.
            </p>
          </div>
          <Link
            href={`/org/${organization.id}/jobs/interviews`}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300"
          >
            <span>Manage Interviews</span>
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
