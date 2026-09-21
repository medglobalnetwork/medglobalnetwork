"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import { AdminMetricCard } from "@/modules/admin/components/AdminMetricCard";

export default function AdminAnalyticsPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/metrics")
      .then((res) => res.json())
      .then((data) => setMetrics(data.metrics || {}))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          Platform Analytics & Growth Intelligence
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Aggregated metrics for doctor registrations, verification conversion funnels, and module engagement.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminMetricCard
          title="User Conversion"
          value="94.2%"
          trend={{ value: "3.4%", isPositive: true }}
          icon={<TrendingUp className="h-5 w-5" />}
          badge="High"
          badgeColor="emerald"
        />
        <AdminMetricCard
          title="Verification Velocity"
          value="< 2.4 hrs"
          subtitle="Average time to KYC check"
          icon={<ShieldCheck className="h-5 w-5" />}
          badgeColor="blue"
        />
        <AdminMetricCard
          title="Course Completion"
          value="78.6%"
          trend={{ value: "5.1%", isPositive: true }}
          icon={<GraduationCap className="h-5 w-5" />}
          badgeColor="purple"
        />
        <AdminMetricCard
          title="Opportunity Apply Rate"
          value="4.8 per job"
          subtitle="Candidate engagement"
          icon={<Briefcase className="h-5 w-5" />}
          badgeColor="amber"
        />
      </div>

      {/* Funnels & Distribution Panels */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Verification Funnel */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white tracking-tight">
            Doctor Verification Funnel
          </h3>
          <p className="text-xs text-slate-400">Conversion from signup to council credential check</p>

          <div className="mt-6 space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">1. Account Registered</span>
                <span className="font-bold text-white">100% ({metrics?.totalUsers || 1})</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full w-full"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">2. Profile & Council Number Added</span>
                <span className="font-bold text-white">85% ({metrics?.totalProfessionals || 1})</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full w-[85%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">3. Council Registry Verified</span>
                <span className="font-bold text-emerald-400">72% ({metrics?.verifiedDoctors || 1})</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[72%]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Ecosystem Distribution */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white tracking-tight">
            Ecosystem Engagement Split
          </h3>
          <p className="text-xs text-slate-400">Traffic distribution across platform pillars</p>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <span className="text-xs text-slate-400">Networking & Feed</span>
              <p className="mt-1 text-xl font-bold text-white">45%</p>
              <span className="text-[10px] text-emerald-400">Primary engagement</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <span className="text-xs text-slate-400">Learn & Masterclasses</span>
              <p className="mt-1 text-xl font-bold text-white">30%</p>
              <span className="text-[10px] text-blue-400">High retention</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <span className="text-xs text-slate-400">Opportunities & Jobs</span>
              <p className="mt-1 text-xl font-bold text-white">15%</p>
              <span className="text-[10px] text-purple-400">High intent</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <span className="text-xs text-slate-400">Stories & Cases</span>
              <p className="mt-1 text-xl font-bold text-white">10%</p>
              <span className="text-[10px] text-amber-400">Daily frequency</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
