// ============================================================
// MGN Hospital Operations Dashboard
// modules/organizations/components/dashboards/HospitalDashboard.tsx
// ============================================================

"use client";

import React from "react";
import Link from "next/link";
import {
  Briefcase,
  Calendar,
  Tent,
  GraduationCap,
  FlaskConical,
  Users,
  CreditCard,
  Plus,
  ShieldCheck,
  ArrowUpRight,
  Stethoscope,
  Award,
  AlertCircle,
  Sparkles,
  Layers,
  MessageSquare,
  Activity,
  HeartPulse,
} from "lucide-react";
import { OrganizationRecord, OrgDashboardMetrics } from "../../types";

interface HospitalDashboardProps {
  organization: OrganizationRecord;
  metrics: OrgDashboardMetrics;
}

export function HospitalDashboard({ organization, metrics }: HospitalDashboardProps) {
  const isVerified = organization.verification_status === "verified";

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hospital Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-teal-950 border border-slate-800 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20 flex items-center gap-1.5">
                <HeartPulse className="size-3.5 text-teal-400" />
                Hospital Operations Workspace
              </span>
              {isVerified ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <ShieldCheck className="size-3.5" /> Verified Hospital
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  <AlertCircle className="size-3.5" /> Verification Pending
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Good Morning, {organization.name}
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              {organization.description ||
                "Manage clinical workforce recruitment, hospital SOP training, medical camps, CME conferences, and clinical research from your central hospital workspace."}
            </p>
          </div>

          {/* Quick Operational Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href={`/org/${organization.id}/jobs/create`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-900/30 transition-all hover:scale-105"
            >
              <Plus className="size-3.5" />
              <span>Create Job</span>
            </Link>
            <Link
              href={`/org/${organization.id}/events/create`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all hover:scale-105"
            >
              <Calendar className="size-3.5 text-purple-400" />
              <span>Host CME / Event</span>
            </Link>
            <Link
              href={`/org/${organization.id}/camps/create`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all hover:scale-105"
            >
              <Tent className="size-3.5 text-teal-400" />
              <span>Launch Camp</span>
            </Link>
            <Link
              href={`/org/${organization.id}/training`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all hover:scale-105"
            >
              <Award className="size-3.5 text-indigo-400" />
              <span>Create Training</span>
            </Link>
            <Link
              href={`/org/${organization.id}/communication`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all hover:scale-105"
            >
              <MessageSquare className="size-3.5 text-rose-400" />
              <span>Post Announcement</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Active Jobs</span>
            <Briefcase className="size-4 text-blue-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white">{metrics.activeJobsCount}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              {metrics.totalApplicationsCount} applications
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Staff & Team</span>
            <Users className="size-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white">{metrics.totalMembersCount}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              {metrics.departmentsCount} departments
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Health Camps</span>
            <Tent className="size-4 text-teal-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white">{metrics.activeCampsCount}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              {metrics.campVolunteersCount} volunteers
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">CME & Events</span>
            <Calendar className="size-4 text-purple-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white">{metrics.upcomingEventsCount}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              {metrics.upcomingConferencesCount} conferences
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">SOP Training</span>
            <Award className="size-4 text-indigo-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white">{metrics.internalTrainingsCount ?? metrics.coursesCount}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Modules active</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Clinical Trials</span>
            <FlaskConical className="size-4 text-cyan-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white">{metrics.activeProjectsCount}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Active projects</span>
          </div>
        </div>
      </div>

      {/* Main Operational Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Clinical Recruitment & Pipeline */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Briefcase className="size-4.5 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Recruitment & Hiring</h3>
            </div>
            <Link
              href={`/org/${organization.id}/jobs`}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
              <span className="text-xs text-slate-400">Active Jobs</span>
              <p className="text-xl font-bold text-white mt-1">{metrics.activeJobsCount}</p>
            </div>
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
              <span className="text-xs text-slate-400">Applications</span>
              <p className="text-xl font-bold text-white mt-1">{metrics.totalApplicationsCount}</p>
            </div>
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
              <span className="text-xs text-slate-400">Shortlisted</span>
              <p className="text-xl font-bold text-white mt-1">{metrics.shortlistedCount}</p>
            </div>
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
              <span className="text-xs text-slate-400">Interviews</span>
              <p className="text-xl font-bold text-white mt-1">{metrics.interviewsScheduledCount}</p>
            </div>
          </div>

          {metrics.activeJobsCount === 0 && (
            <div className="text-center py-4 bg-slate-950/30 rounded-xl border border-dashed border-slate-800">
              <p className="text-xs text-slate-400">No active job listings currently</p>
              <Link
                href={`/org/${organization.id}/jobs/create`}
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:underline"
              >
                <Plus className="size-3" /> Create clinical job opening
              </Link>
            </div>
          )}
        </div>

        {/* 2. Clinical Workforce & Departments */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Stethoscope className="size-4.5 text-teal-400" />
              <h3 className="text-sm font-bold text-white">Clinical Workforce</h3>
            </div>
            <Link
              href={`/org/${organization.id}/clinical`}
              className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1"
            >
              <span>View Roster</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
              <span className="text-xs text-slate-400">Total Staff</span>
              <p className="text-xl font-bold text-white mt-1">{metrics.totalMembersCount}</p>
            </div>
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
              <span className="text-xs text-slate-400">Departments</span>
              <p className="text-xl font-bold text-white mt-1">{metrics.departmentsCount}</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span>Cardiology / Ortho / Surgery</span>
              <span className="font-semibold text-white">Clinical</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Nursing & Patient Care</span>
              <span className="font-semibold text-white">Ward Staff</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Physiotherapy & Rehab</span>
              <span className="font-semibold text-white">Allied</span>
            </div>
          </div>
        </div>

        {/* 3. Internal Hospital Training & SOPs */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Award className="size-4.5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Internal Hospital Training</h3>
            </div>
            <Link
              href={`/org/${organization.id}/training`}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/50 border border-slate-800">
              <div>
                <p className="text-xs font-semibold text-white">Infection Control & Safety</p>
                <p className="text-[10px] text-slate-400">Mandatory annual hospital compliance</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Active
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/50 border border-slate-800">
              <div>
                <p className="text-xs font-semibold text-white">Emergency Clinical Protocols</p>
                <p className="text-[10px] text-slate-400">ICU & Emergency triage procedures</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Active
              </span>
            </div>
          </div>

          <Link
            href={`/org/${organization.id}/training`}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-colors"
          >
            <Plus className="size-3.5" /> Add Hospital SOP Training
          </Link>
        </div>
      </div>

      {/* Health Camps & Clinical Research Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Health Camps */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Tent className="size-4.5 text-teal-400" />
              <h3 className="text-sm font-bold text-white">Medical Health Camps</h3>
            </div>
            <Link
              href={`/org/${organization.id}/camps`}
              className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
              <span className="text-xs text-slate-400">Active Camps</span>
              <p className="text-xl font-bold text-white mt-1">{metrics.activeCampsCount}</p>
            </div>
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
              <span className="text-xs text-slate-400">Volunteers</span>
              <p className="text-xl font-bold text-white mt-1">{metrics.campVolunteersCount}</p>
            </div>
          </div>

          {metrics.activeCampsCount === 0 && (
            <div className="text-center py-4 bg-slate-950/30 rounded-xl border border-dashed border-slate-800">
              <p className="text-xs text-slate-400">No active health camps</p>
              <Link
                href={`/org/${organization.id}/camps/create`}
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-teal-400 hover:underline"
              >
                <Plus className="size-3" /> Schedule a medical outreach camp
              </Link>
            </div>
          )}
        </div>

        {/* Clinical Research & Trials */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FlaskConical className="size-4.5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Clinical Research & Trials</h3>
            </div>
            <Link
              href={`/org/${organization.id}/research`}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Research Hub</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
              <span className="text-xs text-slate-400">Active Projects</span>
              <p className="text-xl font-bold text-white mt-1">{metrics.activeProjectsCount}</p>
            </div>
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
              <span className="text-xs text-slate-400">Publications</span>
              <p className="text-xl font-bold text-white mt-1">{metrics.publicationsCount}</p>
            </div>
          </div>

          {metrics.activeProjectsCount === 0 && (
            <div className="text-center py-4 bg-slate-950/30 rounded-xl border border-dashed border-slate-800">
              <p className="text-xs text-slate-400">No ongoing clinical studies or trials</p>
              <Link
                href={`/org/${organization.id}/research`}
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:underline"
              >
                <Plus className="size-3" /> Register a research project
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Subscription Footer */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <CreditCard className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">
                Current Plan: {metrics.planName}
              </h4>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {metrics.subscriptionStatus}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Renews on {new Date(metrics.renewalDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <Link
          href={`/org/${organization.id}/billing`}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors"
        >
          Manage Entitlements & Billing
        </Link>
      </div>
    </div>
  );
}
