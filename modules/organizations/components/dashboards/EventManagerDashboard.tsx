"use client";

import React from "react";
import Link from "next/link";
import {
  Calendar,
  Layers,
  Users,
  Award,
  Plus,
  ArrowUpRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { OrganizationRecord, OrgDashboardMetrics } from "../../types";

interface Props {
  organization: OrganizationRecord;
  metrics: OrgDashboardMetrics;
}

export function EventManagerDashboard({ organization, metrics }: Props) {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold mb-2">
            <Calendar className="size-3.5" />
            <span>Events & Conferences Workspace</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Clinical & Academic Events</h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize webinars, CME workshops, symposia, and multi-track medical conferences.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/org/${organization.id}/events/create`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all"
          >
            <Plus className="size-4" />
            <span>Create Event / CME</span>
          </Link>
          <Link
            href={`/org/${organization.id}/events/conferences?action=create`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
          >
            <Layers className="size-4 text-purple-400" />
            <span>Build Conference</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-semibold text-slate-400">Upcoming Events</span>
          <p className="text-2xl font-bold text-white mt-2">{metrics.upcomingEventsCount}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-semibold text-slate-400">Conferences</span>
          <p className="text-2xl font-bold text-purple-400 mt-2">{metrics.upcomingConferencesCount}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-semibold text-slate-400">Registrations</span>
          <p className="text-2xl font-bold text-blue-400 mt-2">{metrics.eventRegistrationsCount}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-semibold text-slate-400">Certificates Issued</span>
          <p className="text-2xl font-bold text-emerald-400 mt-2">{metrics.certificatesIssuedCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-2">Webinars & Workshops</h3>
          <p className="text-xs text-slate-400 mb-4">
            Manage live broadcast sessions, CME accreditations, and speaker invitations.
          </p>
          <Link
            href={`/org/${organization.id}/events`}
            className="text-xs font-bold text-purple-400 hover:text-purple-300 inline-flex items-center gap-1"
          >
            <span>View Events</span> <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-2">Conference Multi-Tracks</h3>
          <p className="text-xs text-slate-400 mb-4">
            Setup multi-track tracks (Clinical, Research, Tech), keynotes, and abstract reviews.
          </p>
          <Link
            href={`/org/${organization.id}/events/conferences`}
            className="text-xs font-bold text-purple-400 hover:text-purple-300 inline-flex items-center gap-1"
          >
            <span>Manage Conferences</span> <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-2">Attendance & CME</h3>
          <p className="text-xs text-slate-400 mb-4">
            Verify attendee check-ins and issue verified cryptographic CME certificates.
          </p>
          <Link
            href={`/org/${organization.id}/events/attendance`}
            className="text-xs font-bold text-purple-400 hover:text-purple-300 inline-flex items-center gap-1"
          >
            <span>Manage Attendance</span> <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
