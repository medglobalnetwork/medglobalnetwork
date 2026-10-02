// ============================================================
// MGN Placement Officer Dashboard
// modules/organizations/components/dashboards/PlacementDashboard.tsx
// ============================================================

"use client";

import React from "react";
import Link from "next/link";
import {
  Target,
  Users,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Plus,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { OrganizationRecord, OrgDashboardMetrics } from "../../types";

interface PlacementDashboardProps {
  organization: OrganizationRecord;
  metrics: OrgDashboardMetrics;
}

export function PlacementDashboard({ organization, metrics }: PlacementDashboardProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Placement Cell Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 border border-slate-800 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
              Campus Placements &amp; Career Development
            </span>
            <h1 className="text-2xl font-bold text-white mt-2">
              Placement Cell &bull; {organization.name}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Connect graduating students with hospitals, healthcare clinics, and pharmaceutical recruiters. Manage hiring drives, shortlisting, and job offers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/org/${organization.id}/placements`}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all"
            >
              <Plus className="size-3.5 inline mr-1" />
              Post Placement Drive
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400">Active Drives</span>
          <p className="text-2xl font-bold text-white mt-1">{metrics.activePlacementsCount ?? 0}</p>
          <span className="text-[11px] text-slate-500">Recruitment listings</span>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400">Eligible Students</span>
          <p className="text-2xl font-bold text-white mt-1">{metrics.studentsCount ?? 0}</p>
          <span className="text-[11px] text-slate-500">Final year candidates</span>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400">Applications</span>
          <p className="text-2xl font-bold text-white mt-1">{metrics.totalApplicationsCount}</p>
          <span className="text-[11px] text-slate-500">Submitted profiles</span>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400">Offers Extended</span>
          <p className="text-2xl font-bold text-white mt-1">{metrics.offersCount}</p>
          <span className="text-[11px] text-emerald-400">Confirmed placements</span>
        </div>
      </div>

      {/* Recruitment Pipelines & Drives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="size-4 text-rose-400" />
              Partner Hospitals &amp; Corporate Recruiters
            </h3>
            <Link href={`/org/${organization.id}/placements`} className="text-xs text-rose-400 hover:underline">
              View All
            </Link>
          </div>
          <p className="text-xs text-slate-400">
            Invite verified healthcare organizations and medical groups to conduct on-campus and virtual hiring drives for your students.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="size-4 text-emerald-400" />
              Placement Analytics &amp; Package Insights
            </h3>
            <Link href={`/org/${organization.id}/analytics`} className="text-xs text-emerald-400 hover:underline">
              Analytics
            </Link>
          </div>
          <p className="text-xs text-slate-400">
            Track highest CTC packages, placement conversion ratios across departments (BPT, MBBS, Nursing), and recruiter feedback.
          </p>
        </div>
      </div>
    </div>
  );
}
