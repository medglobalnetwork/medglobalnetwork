"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  Briefcase,
  Calendar,
  Tent,
  GraduationCap,
  Users,
  Compass,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { OrganizationRecord, OrgDashboardMetrics } from "../../types";

interface Props {
  organization: OrganizationRecord;
  metrics: OrgDashboardMetrics;
}

export function ViewerDashboard({ organization, metrics }: Props) {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
            {organization.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white">{organization.name}</h1>
              {organization.verification_status === "verified" && (
                <ShieldCheck className="size-4 text-emerald-400" />
              )}
            </div>
            <p className="text-xs text-slate-400">
              {organization.organization_type} • Read-Only Member Directory
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-semibold text-slate-400">Open Jobs</span>
          <p className="text-2xl font-bold text-white mt-2">{metrics.activeJobsCount}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-semibold text-slate-400">Events</span>
          <p className="text-2xl font-bold text-purple-400 mt-2">{metrics.upcomingEventsCount}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-semibold text-slate-400">Health Camps</span>
          <p className="text-2xl font-bold text-teal-400 mt-2">{metrics.activeCampsCount}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-semibold text-slate-400">Team Members</span>
          <p className="text-2xl font-bold text-emerald-400 mt-2">{metrics.totalMembersCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-2">Public Organisation Profile</h3>
          <p className="text-xs text-slate-400 mb-4">
            Browse verified hospital departments, accreditation certificates, and official contacts.
          </p>
          <Link
            href={`/org/${organization.id}/profile`}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
          >
            <span>View Profile</span> <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-2">Team & Directory</h3>
          <p className="text-xs text-slate-400 mb-4">
            View clinicians, department heads, researchers, and staff affiliated with this workspace.
          </p>
          <Link
            href={`/org/${organization.id}/members`}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
          >
            <span>Browse Team</span> <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
