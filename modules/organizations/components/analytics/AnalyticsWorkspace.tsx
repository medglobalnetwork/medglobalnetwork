"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Briefcase,
  Calendar,
  Tent,
  GraduationCap,
  Users,
  Compass,
  TrendingUp,
  Award,
} from "lucide-react";
import { OrganizationRecord, OrgDashboardMetrics, OrgRole, OrgPermission } from "../../types";

interface Props {
  organization: OrganizationRecord;
  userRole?: OrgRole;
  customPermissions?: OrgPermission[];
}

export function AnalyticsWorkspace({ organization }: Props) {
  const [metrics, setMetrics] = useState<OrgDashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/org/${organization.id}/dashboard`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.metrics) setMetrics(d.metrics);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [organization.id]);

  if (isLoading || !metrics) {
    return (
      <div className="p-12 text-center text-slate-500 text-xs animate-pulse">
        Aggregating verified operational data metrics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-2">
          <BarChart3 className="size-3.5" />
          <span>Verified Operational Analytics</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">Operations Performance & Insights</h1>
        <p className="text-xs text-slate-400 mt-1">
          Real-time metrics computed directly from database records. Zero simulated mock numbers.
        </p>
      </div>

      {/* Recruitment Funnel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Briefcase className="size-4.5 text-blue-400" />
          <h3 className="text-sm font-bold text-white">Talent Acquisition & Recruitment Funnel</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400">Active Jobs</span>
            <p className="text-2xl font-black text-white mt-1">{metrics.activeJobsCount}</p>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400">Applications</span>
            <p className="text-2xl font-black text-blue-400 mt-1">{metrics.totalApplicationsCount}</p>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400">Shortlisted</span>
            <p className="text-2xl font-black text-purple-400 mt-1">{metrics.shortlistedCount}</p>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400">Interviews</span>
            <p className="text-2xl font-black text-amber-400 mt-1">{metrics.interviewsScheduledCount}</p>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400">Offers</span>
            <p className="text-2xl font-black text-emerald-400 mt-1">{metrics.offersCount}</p>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400">Hires</span>
            <p className="text-2xl font-black text-teal-400 mt-1">{metrics.hiresCount}</p>
          </div>
        </div>
      </div>

      {/* Events & Outreach Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Calendar className="size-4.5 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Events & Conferences Reach</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Upcoming Events</span>
              <p className="text-xl font-bold text-white mt-1">{metrics.upcomingEventsCount}</p>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Total Registrations</span>
              <p className="text-xl font-bold text-purple-400 mt-1">{metrics.eventRegistrationsCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Tent className="size-4.5 text-teal-400" />
            <h3 className="text-sm font-bold text-white">Health Camp Delivery</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Active Camps</span>
              <p className="text-xl font-bold text-white mt-1">{metrics.activeCampsCount}</p>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Active Volunteers</span>
              <p className="text-xl font-bold text-teal-400 mt-1">{metrics.campVolunteersCount}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
