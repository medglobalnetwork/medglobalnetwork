"use client";

import React from "react";
import Link from "next/link";
import {
  Tent,
  Users,
  ShieldCheck,
  FileCheck,
  Plus,
  ArrowUpRight,
  MapPin,
} from "lucide-react";
import { OrganizationRecord, OrgDashboardMetrics } from "../../types";

interface Props {
  organization: OrganizationRecord;
  metrics: OrgDashboardMetrics;
}

export function CampManagerDashboard({ organization, metrics }: Props) {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold mb-2">
            <Tent className="size-3.5" />
            <span>Health & Medical Camps Portal</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Community & Clinical Outreach</h1>
          <p className="text-xs text-slate-400 mt-1">
            Conduct screening camps, manage medical volunteer slots, and publish camp reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/org/${organization.id}/camps/create`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all"
          >
            <Plus className="size-4" />
            <span>Plan Health Camp</span>
          </Link>
          <Link
            href={`/org/${organization.id}/camps/volunteers`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
          >
            <Users className="size-4 text-teal-400" />
            <span>Volunteer Applications</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-semibold text-slate-400">Active / Planned Camps</span>
          <p className="text-2xl font-bold text-white mt-2">{metrics.activeCampsCount}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-semibold text-slate-400">Assigned Volunteers</span>
          <p className="text-2xl font-bold text-teal-400 mt-2">{metrics.campVolunteersCount}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-semibold text-slate-400">Beneficiaries Screened</span>
          <p className="text-2xl font-bold text-blue-400 mt-2">{metrics.campRegistrationsCount}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-semibold text-slate-400">Completed Camps</span>
          <p className="text-2xl font-bold text-emerald-400 mt-2">{metrics.campsCompletedCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-2">Operational Camps</h3>
          <p className="text-xs text-slate-400 mb-4">
            Manage screening locations, dates, target demographic requirements, and equipment.
          </p>
          <Link
            href={`/org/${organization.id}/camps`}
            className="text-xs font-bold text-teal-400 hover:text-teal-300 inline-flex items-center gap-1"
          >
            <span>View All Camps</span> <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-2">Volunteer Professional Roster</h3>
          <p className="text-xs text-slate-400 mb-4">
            Verify doctor & nursing qualifications, approve clinical volunteer slots, and assign roles.
          </p>
          <Link
            href={`/org/${organization.id}/camps/volunteers`}
            className="text-xs font-bold text-teal-400 hover:text-teal-300 inline-flex items-center gap-1"
          >
            <span>Manage Volunteers</span> <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-2">Outreach & Clinical Reports</h3>
          <p className="text-xs text-slate-400 mb-4">
            Generate post-camp diagnostics reports, medicine distribution tallies, and certificates.
          </p>
          <Link
            href={`/org/${organization.id}/camps/reports`}
            className="text-xs font-bold text-teal-400 hover:text-teal-300 inline-flex items-center gap-1"
          >
            <span>View Camp Reports</span> <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
