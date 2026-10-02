"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  Compass,
  Megaphone,
  Sparkles,
  Plus,
  ArrowUpRight,
  BarChart2,
} from "lucide-react";
import { OrganizationRecord, OrgDashboardMetrics } from "../../types";

interface Props {
  organization: OrganizationRecord;
  metrics: OrgDashboardMetrics;
}

export function MarketingDashboard({ organization, metrics }: Props) {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold mb-2">
            <Megaphone className="size-3.5" />
            <span>Marketing, Content & Brand</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Public Engagement & Communities</h1>
          <p className="text-xs text-slate-400 mt-1">
            Publish clinical updates, run awareness campaigns, and moderate public brand channels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/org/${organization.id}/content?action=post`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all"
          >
            <Plus className="size-4" />
            <span>Publish Post / Update</span>
          </Link>
          <Link
            href={`/org/${organization.id}/groups?action=create`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
          >
            <Compass className="size-4 text-rose-400" />
            <span>Create Community</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-semibold text-slate-400">Total Groups</span>
          <p className="text-2xl font-bold text-white mt-2">{metrics.groupsCount}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-semibold text-slate-400">Community Members</span>
          <p className="text-2xl font-bold text-rose-400 mt-2">{metrics.groupMembersCount}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-semibold text-slate-400">Total Discussions</span>
          <p className="text-2xl font-bold text-blue-400 mt-2">{metrics.groupPostsCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-2">Announcements & Feeds</h3>
          <p className="text-xs text-slate-400 mb-4">
            Broadcast official hospital announcements, research breakthroughs, and accolades.
          </p>
          <Link
            href={`/org/${organization.id}/content`}
            className="text-xs font-bold text-rose-400 hover:text-rose-300 inline-flex items-center gap-1"
          >
            <span>Manage Content</span> <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-2">Professional Specialty Groups</h3>
          <p className="text-xs text-slate-400 mb-4">
            Host clinical case discussion groups, alumni networks, and inter-department boards.
          </p>
          <Link
            href={`/org/${organization.id}/groups`}
            className="text-xs font-bold text-rose-400 hover:text-rose-300 inline-flex items-center gap-1"
          >
            <span>Explore Groups</span> <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
