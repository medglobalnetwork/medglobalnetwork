"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  TrendingUp,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Activity,
  RefreshCw,
  Calendar,
  Layers,
  Users,
  MapPin,
  Stethoscope,
  Clock,
  Sparkles,
  CheckCircle2,
  Share2,
} from "lucide-react";
import { AdminMetricCard } from "@/modules/admin/components/AdminMetricCard";

interface AnalyticsData {
  periodDays: number;
  kpis: {
    totalUsers: number;
    totalProfessionals: number;
    verifiedDoctors: number;
    pendingVerification: number;
    userConversionRate: number;
    userGrowthTrend: number;
    newUsersPeriod: number;
    doctorVerificationRate: number;
    avgVerificationHours: number;
    totalCourses: number;
    publishedCourses: number;
    totalEnrollments: number;
    completedEnrollments: number;
    courseCompletionRate: number;
    avgCourseProgress: number;
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    opportunityApplyRate: number;
  };
  funnel: {
    registeredUsers: number;
    profilesCreated: number;
    profileConversionPct: number;
    verifiedDoctors: number;
    verificationOfProfilesPct: number;
    verificationOfUsersPct: number;
    pendingVerification: number;
  };
  ecosystem: {
    networking: { volume: number; percentage: number };
    learn: { volume: number; percentage: number };
    opportunities: { volume: number; percentage: number };
    clinicalPrograms: { volume: number; percentage: number };
    totalActivity: number;
  };
  activityCounts: {
    totalPosts: number;
    totalConnections: number;
    totalStories: number;
    totalCamps: number;
    totalEvents: number;
    totalResearch: number;
    totalMessages: number;
  };
  dailySignups: { date: string; count: number }[];
  topSpecialties: { specialty: string; count: number }[];
  topLocations: { state: string; count: number }[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState<number>(30);

  const fetchAnalytics = useCallback(async (timeframe: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/analytics?days=${timeframe}`);
      if (!res.ok) {
        throw new Error(`Failed to load analytics (${res.status})`);
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error("Error fetching analytics:", err);
      setError(err.message || "Failed to load platform analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(days);
  }, [days, fetchAnalytics]);

  const kpis = data?.kpis;
  const funnel = data?.funnel;
  const ecosystem = data?.ecosystem;

  // Format verification velocity
  const getVelocityDisplay = () => {
    if (!kpis) return "...";
    if (kpis.avgVerificationHours > 0) {
      if (kpis.avgVerificationHours < 1) return "< 1 hr";
      return `${kpis.avgVerificationHours.toFixed(1)} hrs`;
    }
    return kpis.verifiedDoctors > 0 ? "Fast (<24h)" : "Awaiting data";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Header with Live Status & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live PostgreSQL Metrics
            </span>
            <span className="text-xs text-slate-500">• Zero Simulated Data</span>
          </div>
          <h1 className="mt-2 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
            Platform Analytics & Growth Intelligence
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Real-time conversion funnels, doctor registration rates, and engagement distribution computed from the database.
          </p>
        </div>

        {/* Timeframe Selector & Refresh */}
        <div className="flex items-center gap-2.5">
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
            {[7, 30, 90, 365].map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setDays(period)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                  days === period
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {period === 365 ? "1Y" : `${period}d`}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => fetchAnalytics(days)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-blue-600" : "text-slate-500"}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-700">
          {error}
        </div>
      )}

      {/* KPI Cards (Real Computed Database Metrics) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminMetricCard
          title="User Conversion"
          value={loading ? "..." : `${kpis?.userConversionRate ?? 0}%`}
          subtitle={`${kpis?.totalProfessionals ?? 0} of ${kpis?.totalUsers ?? 0} registered users`}
          trend={
            kpis && kpis.userGrowthTrend !== 0
              ? {
                  value: `${Math.abs(kpis.userGrowthTrend)}%`,
                  isPositive: kpis.userGrowthTrend >= 0,
                }
              : undefined
          }
          icon={<TrendingUp className="h-5 w-5" />}
          badge={
            (kpis?.userConversionRate ?? 0) >= 70
              ? "High"
              : (kpis?.userConversionRate ?? 0) >= 40
              ? "Healthy"
              : "Growing"
          }
          badgeColor="emerald"
        />

        <AdminMetricCard
          title="Verification Velocity"
          value={loading ? "..." : getVelocityDisplay()}
          subtitle={`${kpis?.verifiedDoctors ?? 0} authenticated clinicians`}
          icon={<ShieldCheck className="h-5 w-5" />}
          badge={`${kpis?.doctorVerificationRate ?? 0}% Verified`}
          badgeColor="blue"
        />

        <AdminMetricCard
          title="Course Completion"
          value={loading ? "..." : `${kpis?.courseCompletionRate ?? 0}%`}
          subtitle={`${kpis?.completedEnrollments ?? 0} completed of ${kpis?.totalEnrollments ?? 0} enrolled`}
          icon={<GraduationCap className="h-5 w-5" />}
          badgeColor="purple"
        />

        <AdminMetricCard
          title="Opportunity Apply Rate"
          value={loading ? "..." : `${kpis?.opportunityApplyRate ?? 0} per job`}
          subtitle={`${kpis?.totalApplications ?? 0} applications across ${kpis?.activeJobs ?? 0} active jobs`}
          icon={<Briefcase className="h-5 w-5" />}
          badgeColor="amber"
        />
      </div>

      {/* Funnels & Distribution Panels */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Doctor Verification Funnel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Doctor Verification Funnel
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Conversion from initial signup to authenticated council registration
              </p>
            </div>
            {funnel && funnel.pendingVerification > 0 && (
              <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                {funnel.pendingVerification} in queue
              </span>
            )}
          </div>

          <div className="mt-6 space-y-5">
            {/* Step 1 */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-700 font-semibold">1. Account Registered</span>
                <span className="font-bold text-slate-900">
                  100% ({funnel?.registeredUsers ?? 0} clinicians)
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: (funnel?.registeredUsers ?? 0) > 0 ? "100%" : "0%" }}
                />
              </div>
            </div>

            {/* Step 2 */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-700 font-semibold">2. Profile & Council Details Added</span>
                <span className="font-bold text-slate-900">
                  {funnel?.profileConversionPct ?? 0}% ({funnel?.profilesCreated ?? 0} profiles)
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, funnel?.profileConversionPct ?? 0)}%` }}
                />
              </div>
            </div>

            {/* Step 3 */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-700 font-semibold">3. Council Registry Verified</span>
                <span className="font-bold text-emerald-600">
                  {funnel?.verificationOfProfilesPct ?? 0}% of profiles ({funnel?.verifiedDoctors ?? 0} verified)
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, funnel?.verificationOfProfilesPct ?? 0)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Overall Registration-to-Verification:</span>
            <span className="font-bold text-slate-900">
              {funnel?.verificationOfUsersPct ?? 0}% of all registered users
            </span>
          </div>
        </div>

        {/* Ecosystem Distribution */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Ecosystem Engagement Split
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Activity volume distribution across core platform ecosystems
              </p>
            </div>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 rounded-lg px-2 py-0.5">
              {ecosystem?.totalActivity ?? 0} total events
            </span>
          </div>

          {/* Combined Progress Bar */}
          <div className="mt-6">
            <div className="h-3 rounded-full bg-slate-100 overflow-hidden flex">
              <div
                className="bg-emerald-500 transition-all duration-500"
                style={{ width: `${ecosystem?.networking.percentage ?? 0}%` }}
                title={`Networking: ${ecosystem?.networking.percentage ?? 0}%`}
              />
              <div
                className="bg-blue-500 transition-all duration-500"
                style={{ width: `${ecosystem?.learn.percentage ?? 0}%` }}
                title={`Learn: ${ecosystem?.learn.percentage ?? 0}%`}
              />
              <div
                className="bg-purple-500 transition-all duration-500"
                style={{ width: `${ecosystem?.opportunities.percentage ?? 0}%` }}
                title={`Opportunities: ${ecosystem?.opportunities.percentage ?? 0}%`}
              />
              <div
                className="bg-amber-500 transition-all duration-500"
                style={{ width: `${ecosystem?.clinicalPrograms.percentage ?? 0}%` }}
                title={`Programs: ${ecosystem?.clinicalPrograms.percentage ?? 0}%`}
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 shadow-2xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-slate-500 font-semibold">Networking & Feed</span>
              </div>
              <p className="mt-1 text-2xl font-black text-slate-900">
                {ecosystem?.networking.percentage ?? 0}%
              </p>
              <span className="text-[10px] font-bold text-slate-500">
                {ecosystem?.networking.volume ?? 0} posts & connects
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 shadow-2xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-xs text-slate-500 font-semibold">Learn & LMS</span>
              </div>
              <p className="mt-1 text-2xl font-black text-slate-900">
                {ecosystem?.learn.percentage ?? 0}%
              </p>
              <span className="text-[10px] font-bold text-slate-500">
                {ecosystem?.learn.volume ?? 0} courses & enrollments
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 shadow-2xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-purple-500" />
                <span className="text-xs text-slate-500 font-semibold">Opportunities & Jobs</span>
              </div>
              <p className="mt-1 text-2xl font-black text-slate-900">
                {ecosystem?.opportunities.percentage ?? 0}%
              </p>
              <span className="text-[10px] font-bold text-slate-500">
                {ecosystem?.opportunities.volume ?? 0} jobs & applications
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 shadow-2xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-xs text-slate-500 font-semibold">Camps, Events & Trials</span>
              </div>
              <p className="mt-1 text-2xl font-black text-slate-900">
                {ecosystem?.clinicalPrograms.percentage ?? 0}%
              </p>
              <span className="text-[10px] font-bold text-slate-500">
                {ecosystem?.clinicalPrograms.volume ?? 0} programs & stories
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Deep Insights: Top Specialties & Regional Clusters */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Specialties */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Top Clinical Specialties in Directory
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">Real Registered Doctors</span>
          </div>

          <div className="mt-4">
            {data?.topSpecialties && data.topSpecialties.length > 0 ? (
              <div className="space-y-3">
                {data.topSpecialties.map((item, idx) => {
                  const maxCount = data.topSpecialties[0]?.count || 1;
                  const pct = Math.round((item.count / maxCount) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-800">{item.specialty}</span>
                        <span className="font-bold text-blue-600">{item.count} clinicians</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No specialty data recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Regional Clinician Clusters
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">By State / Region</span>
          </div>

          <div className="mt-4">
            {data?.topLocations && data.topLocations.length > 0 ? (
              <div className="space-y-3">
                {data.topLocations.map((item, idx) => {
                  const maxCount = data.topLocations[0]?.count || 1;
                  const pct = Math.round((item.count / maxCount) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-800">{item.state}</span>
                        <span className="font-bold text-emerald-600">{item.count} doctors</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No geographical region data recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Aggregation Details */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Raw Platform Counts & Records
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real counts directly mapped to database tables across all modules
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Posts</span>
            <p className="mt-1 text-xl font-black text-slate-900">{data?.activityCounts.totalPosts ?? 0}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Connections</span>
            <p className="mt-1 text-xl font-black text-slate-900">{data?.activityCounts.totalConnections ?? 0}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Courses</span>
            <p className="mt-1 text-xl font-black text-slate-900">{data?.kpis.totalCourses ?? 0}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jobs</span>
            <p className="mt-1 text-xl font-black text-slate-900">{data?.kpis.totalJobs ?? 0}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Camps</span>
            <p className="mt-1 text-xl font-black text-slate-900">{data?.activityCounts.totalCamps ?? 0}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Events</span>
            <p className="mt-1 text-xl font-black text-slate-900">{data?.activityCounts.totalEvents ?? 0}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Trials</span>
            <p className="mt-1 text-xl font-black text-slate-900">{data?.activityCounts.totalResearch ?? 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
