// ============================================================
// MGN College Student Coordinator Dashboard
// modules/organizations/components/dashboards/StudentCoordinatorDashboard.tsx
// ============================================================

"use client";

import React from "react";
import Link from "next/link";
import {
  Compass,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Users,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { OrganizationRecord, OrgDashboardMetrics } from "../../types";

interface StudentCoordinatorDashboardProps {
  organization: OrganizationRecord;
  metrics: OrgDashboardMetrics;
}

export function StudentCoordinatorDashboard({
  organization,
  metrics,
}: StudentCoordinatorDashboardProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Coordinator Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-lime-950 via-slate-900 to-emerald-950 border border-slate-800 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-lime-400 bg-lime-500/10 px-2.5 py-1 rounded-full border border-lime-500/20 flex items-center gap-1.5">
                <Compass className="size-3.5 text-lime-400" />
                Student Activities &amp; Community Coordination
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Student Activities Dashboard &bull; {organization.name}
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Coordinate student batch communities, club events, announcements, and peer moderation across academic groups.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href={`/org/${organization.id}/groups`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-lime-600 hover:bg-lime-500 text-white text-xs font-bold shadow-lg shadow-lime-900/30 transition-all hover:scale-105"
            >
              <Compass className="size-3.5" />
              <span>Manage Student Groups</span>
            </Link>
            <Link
              href={`/org/${organization.id}/events`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all hover:scale-105"
            >
              <Calendar className="size-3.5 text-lime-400" />
              <span>Campus Events</span>
            </Link>
            <Link
              href={`/org/${organization.id}/communication`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all hover:scale-105"
            >
              <MessageSquare className="size-3.5 text-blue-400" />
              <span>Post Announcement</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-semibold">Active Groups</span>
          <p className="text-2xl font-bold text-white mt-1">{metrics.groupsCount}</p>
          <span className="text-[11px] text-slate-500">Batches &amp; societies</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-semibold">Campus Events</span>
          <p className="text-2xl font-bold text-white mt-1">{metrics.upcomingEventsCount}</p>
          <span className="text-[11px] text-slate-500">Scheduled activities</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-semibold">Community Outreach</span>
          <p className="text-2xl font-bold text-white mt-1">{metrics.activeCampsCount}</p>
          <span className="text-[11px] text-slate-500">Volunteer camps</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-semibold">Content Moderation</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">Healthy</p>
          <span className="text-[11px] text-slate-500">Community status</span>
        </div>
      </div>

      {/* Scope Notice */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-4 flex items-start gap-3">
        <ShieldCheck className="size-5 text-lime-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-white">Role Compliance Boundary</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Student Coordinators manage student clubs, batch groups, and peer announcements. Sensitive student academic transcripts, grades, and private records remain strictly restricted to authorized Deans and Faculty.
          </p>
        </div>
      </div>
    </div>
  );
}
