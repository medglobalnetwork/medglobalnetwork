"use client";

import React from "react";
import Link from "next/link";
import {
  CreditCard,
  CheckCircle2,
  FileText,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { OrganizationRecord, OrgDashboardMetrics } from "../../types";

interface Props {
  organization: OrganizationRecord;
  metrics: OrgDashboardMetrics;
}

export function FinanceDashboard({ organization, metrics }: Props) {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold mb-2">
            <CreditCard className="size-3.5" />
            <span>Finance & Billing Operations</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Subscription & Financial Invoices</h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor organizational plan usage, billing cycles, invoice history, and tax compliance.
          </p>
        </div>

        <Link
          href={`/org/${organization.id}/billing`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-bold transition-all shrink-0"
        >
          <CreditCard className="size-4" />
          <span>Billing Overview</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <span className="text-xs text-slate-400 font-semibold">Active Plan</span>
          <p className="text-2xl font-bold text-white mt-2">{metrics.planName} Plan</p>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 mt-1">
            <CheckCircle2 className="size-3" /> {metrics.subscriptionStatus}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <span className="text-xs text-slate-400 font-semibold">Renewal Date</span>
          <p className="text-lg font-bold text-slate-200 mt-2">
            {new Date(metrics.renewalDate).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <span className="text-[11px] text-slate-500 block mt-1">Auto-renew active</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <span className="text-xs text-slate-400 font-semibold">Tax Compliance & GST</span>
          <p className="text-base font-bold text-slate-200 mt-2">
            {organization.gst_number || "Not Registered"}
          </p>
          <span className="text-[11px] text-slate-500 block mt-1">
            {organization.country || "India"}
          </span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white">Recent Invoices</h3>
          <Link
            href={`/org/${organization.id}/billing`}
            className="text-xs font-bold text-green-400 hover:text-green-300 flex items-center gap-1"
          >
            <span>All Invoices</span> <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        <div className="text-center py-6 text-slate-500 text-xs bg-slate-950/40 rounded-xl border border-slate-800/80">
          No pending invoices. All workspace entitlements are up to date.
        </div>
      </div>
    </div>
  );
}
