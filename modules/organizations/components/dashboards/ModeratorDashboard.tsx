"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  MessageSquare,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import { OrganizationRecord, OrgDashboardMetrics } from "../../types";

interface Props {
  organization: OrganizationRecord;
  metrics: OrgDashboardMetrics;
}

export function ModeratorDashboard({ organization }: Props) {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold mb-2">
          <ShieldAlert className="size-3.5" />
          <span>Content Moderation & Compliance</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">Trust, Safety & Moderation</h1>
        <p className="text-xs text-slate-400 mt-1">
          Review reported user posts, community discussions, and comments according to medical ethics standards.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <span className="text-xs text-slate-400 font-semibold">Pending Reports</span>
          <p className="text-2xl font-bold text-white mt-2">0</p>
          <span className="text-[11px] text-emerald-400 block mt-1">Queue clear</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <span className="text-xs text-slate-400 font-semibold">Resolved Appeals</span>
          <p className="text-2xl font-bold text-blue-400 mt-2">0</p>
          <span className="text-[11px] text-slate-500 block mt-1">Last 30 days</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <span className="text-xs text-slate-400 font-semibold">Moderation Status</span>
          <p className="text-base font-bold text-emerald-400 mt-2">Good Standing</p>
          <span className="text-[11px] text-slate-500 block mt-1">Zero clinical violations</span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center py-10">
        <CheckCircle2 className="size-8 text-emerald-400 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-white">All Clear</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
          There are currently no flagged posts, abusive comments, or unresolved appeals in this organization's channels.
        </p>
      </div>
    </div>
  );
}
