// ============================================================
// MGN Medical Education & Hospital Training Manager Dashboard
// modules/organizations/components/dashboards/HospitalTrainingDashboard.tsx
// ============================================================

"use client";

import React from "react";
import Link from "next/link";
import {
  Award,
  GraduationCap,
  Users,
  Video,
  ClipboardList,
  CheckCircle2,
  Plus,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { OrganizationRecord, OrgDashboardMetrics } from "../../types";

interface HospitalTrainingDashboardProps {
  organization: OrganizationRecord;
  metrics: OrgDashboardMetrics;
}

export function HospitalTrainingDashboard({ organization, metrics }: HospitalTrainingDashboardProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-teal-950 border border-slate-800 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
              Medical Education &bull; Staff Training Management
            </span>
            <h1 className="text-2xl font-bold text-white mt-2">
              Clinical Training &amp; SOP Portal &bull; {organization.name}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Conduct mandatory infection control training, emergency triage SOPs, clinical skill refreshers, quizzes, and issue verified completion certificates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/org/${organization.id}/training`}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
            >
              <Plus className="size-3.5 inline mr-1" />
              Create Training SOP
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400">Training Modules</span>
          <p className="text-2xl font-bold text-white mt-1">{metrics.internalTrainingsCount ?? metrics.coursesCount}</p>
          <span className="text-[11px] text-slate-500">SOP programs</span>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400">Clinical Staff</span>
          <p className="text-2xl font-bold text-white mt-1">{metrics.totalMembersCount}</p>
          <span className="text-[11px] text-slate-500">Eligible staff</span>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400">Live Demonstrations</span>
          <p className="text-2xl font-bold text-white mt-1">{metrics.liveClassesUpcomingCount}</p>
          <span className="text-[11px] text-slate-500">Upcoming sessions</span>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400">Certificates Issued</span>
          <p className="text-2xl font-bold text-white mt-1">{metrics.certificatesIssuedCount}</p>
          <span className="text-[11px] text-emerald-400">Verified credentials</span>
        </div>
      </div>

      {/* Training Programs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="size-4 text-indigo-400" />
              Hospital SOPs &amp; Clinical Protocols
            </h3>
            <Link href={`/org/${organization.id}/training`} className="text-xs text-indigo-400 hover:underline">
              View All
            </Link>
          </div>
          <p className="text-xs text-slate-400">
            Publish internal SOP modules for OT, ICU, Emergency, and infection control with mandatory staff quizzes.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400" />
              Compliance &amp; NABH / JCI Readiness
            </h3>
            <Link href={`/org/${organization.id}/analytics`} className="text-xs text-emerald-400 hover:underline">
              Audit Status
            </Link>
          </div>
          <p className="text-xs text-slate-400">
            Ensure all doctors, nurses, and allied healthcare staff complete their mandatory accredited training courses.
          </p>
        </div>
      </div>
    </div>
  );
}
