"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { AdminMetricCard } from "@/modules/admin/components/AdminMetricCard";
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  GraduationCap,
  Briefcase,
  Layers,
  ArrowRight,
  ShieldAlert,
  Clock,
  Sparkles,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [metrics, setMetrics] = useState<any>(null);
  const [recentAudits, setRecentAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/metrics");
      if (res.status === 403) {
        setError("ACCESS_DENIED");
        return;
      }
      if (!res.ok) {
        throw new Error("Failed to load metrics");
      }
      const data = await res.json();
      setMetrics(data.metrics);
      setRecentAudits(data.recentAudits || []);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        router.replace("/");
      } else {
        fetchMetrics();
      }
    }
  }, [isPending, session, router]);

  if (isPending || (!session && !error)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span className="text-xs font-bold text-slate-700">Authenticating Admin Session...</span>
        </div>
      </div>
    );
  }

  if (error === "ACCESS_DENIED") {
    router.replace("/home");
    return null;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Page Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-r from-white via-slate-50 to-blue-50/40 p-6 sm:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                Live Control Plane
              </span>
              <span className="text-xs font-medium text-slate-500">• MGN.life Platform v2.0</span>
            </div>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Platform Command Center
            </h1>
            <p className="mt-1.5 text-xs text-slate-600 max-w-xl leading-relaxed">
              Real-time operational overview of registered clinicians, medical council verification queues, course catalogues, and moderation events.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchMetrics}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-blue-600" : "text-slate-500"}`} />
              <span>Refresh KPIs</span>
            </button>

            <Link
              href="/admin/verification"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>KYC Queue ({metrics?.pendingVerification || 0})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminMetricCard
          title="Total Clinicians & Users"
          value={metrics?.totalUsers ?? (loading ? "..." : 0)}
          subtitle={`${metrics?.totalProfessionals ?? 0} healthcare professionals`}
          icon={<Users className="h-5 w-5" />}
          href="/admin/users"
          badge="Directory"
          badgeColor="blue"
        />

        <AdminMetricCard
          title="Verified Doctors"
          value={metrics?.verifiedDoctors ?? (loading ? "..." : 0)}
          subtitle="Council credential authenticated"
          icon={<ShieldCheck className="h-5 w-5" />}
          href="/admin/verification"
          badge="Verified ✓"
          badgeColor="emerald"
        />

        <AdminMetricCard
          title="Pending Verifications"
          value={metrics?.pendingVerification ?? (loading ? "..." : 0)}
          subtitle="Requires officer inspection"
          icon={<Clock className="h-5 w-5" />}
          href="/admin/verification"
          badge={metrics?.pendingVerification > 0 ? "Action Required" : "Cleared"}
          badgeColor={metrics?.pendingVerification > 0 ? "amber" : "slate"}
        />

        <AdminMetricCard
          title="Safety & Content Alerts"
          value={metrics?.openReports ?? (loading ? "..." : 0)}
          subtitle="Flagged posts & abuse reports"
          icon={<AlertTriangle className="h-5 w-5" />}
          href="/admin/moderation"
          badge={metrics?.openReports > 0 ? "Review Needed" : "All Good"}
          badgeColor={metrics?.openReports > 0 ? "rose" : "slate"}
        />
      </div>

      {/* Secondary Metrics & Quick Links */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Module Health & Statistics */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Module Activity & Throughput
              </h2>
              <p className="text-xs text-slate-500">Live operational counts across MGN ecosystems</p>
            </div>
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Link
              href="/admin/learn"
              className="group rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition-all hover:border-blue-300 hover:bg-white hover:shadow-xs"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 group-hover:text-blue-600">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <span>Learn / LMS</span>
              </div>
              <p className="mt-3 text-2xl font-black text-slate-900">{metrics?.totalCourses ?? 0}</p>
              <p className="text-[11px] text-slate-500">{metrics?.totalEnrollments ?? 0} active enrollments</p>
            </Link>

            <Link
              href="/admin/opportunities"
              className="group rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition-all hover:border-blue-300 hover:bg-white hover:shadow-xs"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 group-hover:text-blue-600">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Briefcase className="h-4 w-4" />
                </div>
                <span>Opportunities</span>
              </div>
              <p className="mt-3 text-2xl font-black text-slate-900">{metrics?.totalJobs ?? 0}</p>
              <p className="text-[11px] text-slate-500">{metrics?.totalApplications ?? 0} applications submitted</p>
            </Link>

            <Link
              href="/admin/network"
              className="group rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition-all hover:border-blue-300 hover:bg-white hover:shadow-xs"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 group-hover:text-blue-600">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Layers className="h-4 w-4" />
                </div>
                <span>Network & Feed</span>
              </div>
              <p className="mt-3 text-2xl font-black text-slate-900">{metrics?.totalPosts ?? 0}</p>
              <p className="text-[11px] text-slate-500">Discussions & Case Posts</p>
            </Link>
          </div>

          {/* Quick Operations Strip */}
          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">Need to verify a medical doctor immediately?</p>
                <p className="text-[11px] text-slate-600">Access the National Medical Council KYC queue.</p>
              </div>
              <Link
                href="/admin/verification"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-2xs"
              >
                <span>Open Verification Queue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Live Immutable Audit Feed */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">Audit Stream</h2>
                <p className="text-xs text-slate-500">Immutable admin actions</p>
              </div>
              <Link
                href="/admin/audit-logs"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                View All
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {recentAudits.length === 0 ? (
                <div className="py-8 text-center text-slate-500">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                  <p className="text-xs font-bold text-slate-700">Audit ledger initialized</p>
                  <p className="text-[11px] text-slate-500">Administrative changes will appear here.</p>
                </div>
              ) : (
                recentAudits.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs"
                  >
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate">
                        {item.action}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        By {item.admin_email} • {item.entity_type}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-4">
            <Link
              href="/admin/audit-logs"
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
            >
              <span>Inspect Full Audit Trail</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
