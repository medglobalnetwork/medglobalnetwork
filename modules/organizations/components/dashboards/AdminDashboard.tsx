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
  Compass,
  CreditCard,
  BarChart3,
  Plus,
  ShieldCheck,
  ArrowUpRight,
  Clock,
  Sparkles,
  Layers,
  FileText,
  AlertCircle,
  Settings,
} from "lucide-react";
import { OrganizationRecord, OrgDashboardMetrics } from "../../types";

interface Props {
  organization: OrganizationRecord;
  metrics: OrgDashboardMetrics;
}

export function AdminDashboard({ organization, metrics }: Props) {
  const isVerified = organization.verification_status === "verified";

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 border border-slate-800 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                Organisation Admin Operations
              </span>
              {isVerified ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <ShieldCheck className="size-3.5" /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  <AlertCircle className="size-3.5" /> Verification Pending
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Operations Control • {organization.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Oversee cross-functional healthcare operations, team permissions, event agendas, patient camps, and recruitment.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href={`/org/${organization.id}/members`}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Users className="size-4" />
              <span>Manage Team</span>
            </Link>
            <Link
              href={`/org/${organization.id}/jobs/create`}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
            >
              <Briefcase className="size-4 text-blue-400" />
              <span>Post Job</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-semibold">Active Jobs</span>
          <p className="text-2xl font-bold text-white mt-2">{metrics.activeJobsCount}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-semibold">Events</span>
          <p className="text-2xl font-bold text-purple-400 mt-2">{metrics.upcomingEventsCount}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-semibold">Health Camps</span>
          <p className="text-2xl font-bold text-teal-400 mt-2">{metrics.activeCampsCount}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-semibold">LMS Courses</span>
          <p className="text-2xl font-bold text-indigo-400 mt-2">{metrics.coursesCount}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-semibold">Projects</span>
          <p className="text-2xl font-bold text-cyan-400 mt-2">{metrics.activeProjectsCount}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-semibold">Members</span>
          <p className="text-2xl font-bold text-emerald-400 mt-2">{metrics.totalMembersCount}</p>
        </div>
      </div>

      {/* Operational modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="size-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
              <Briefcase className="size-5" />
            </div>
            <h3 className="text-base font-bold text-white">Recruitment</h3>
            <p className="text-xs text-slate-400 mt-1">
              Track open requisitions, applications, and interview appointments.
            </p>
          </div>
          <Link
            href={`/org/${organization.id}/jobs`}
            className="mt-4 text-xs font-bold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
          >
            <span>Go to Recruitment</span> <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="size-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
              <Calendar className="size-5" />
            </div>
            <h3 className="text-base font-bold text-white">Events & Conferences</h3>
            <p className="text-xs text-slate-400 mt-1">
              Manage clinical seminars, speaker agendas, and CME certifications.
            </p>
          </div>
          <Link
            href={`/org/${organization.id}/events`}
            className="mt-4 text-xs font-bold text-purple-400 hover:text-purple-300 inline-flex items-center gap-1"
          >
            <span>Go to Events</span> <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="size-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3">
              <Tent className="size-5" />
            </div>
            <h3 className="text-base font-bold text-white">Health Camps</h3>
            <p className="text-xs text-slate-400 mt-1">
              Mobilize doctors, assign screening slots, and publish clinical outcome reports.
            </p>
          </div>
          <Link
            href={`/org/${organization.id}/camps`}
            className="mt-4 text-xs font-bold text-teal-400 hover:text-teal-300 inline-flex items-center gap-1"
          >
            <span>Go to Health Camps</span> <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
