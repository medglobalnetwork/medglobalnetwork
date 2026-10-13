"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  AlertTriangle,
  Users,
  CheckCircle2,
  XCircle,
  RefreshCw,
  TrendingUp,
  Activity,
  ShieldAlert,
  Calendar,
  Briefcase,
  FlaskConical,
  Megaphone,
  Filter,
  Check,
  Stethoscope,
  ExternalLink,
} from "lucide-react";

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"abuse" | "operations" | "commercial" | "export">("abuse");

  const [reportsData, setReportsData] = useState<{
    summary: any;
    abuseReports: any[];
    specialtyDistribution: any[];
  }>({
    summary: {
      totalUsers: 0,
      verifiedDoctors: 0,
      pendingVerifications: 0,
      totalCamps: 0,
      totalEvents: 0,
      totalJobs: 0,
      totalResearchStudies: 0,
      ads: { activeCampaigns: 0, totalImpressions: 0, totalClicks: 0 },
    },
    abuseReports: [],
    specialtyDistribution: [],
  });

  const [selectedReportFilter, setSelectedReportFilter] = useState<"all" | "pending" | "resolved">("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/reports");
      if (res.ok) {
        const data = await res.json();
        setReportsData(data);
      }
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolveAbuseReport = async (reportId: string, action: "warn_user" | "suspend" | "dismiss") => {
    setActionLoading(reportId);
    try {
      const res = await fetch("/api/admin/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, action, notes: `Resolved via Admin Reports with action: ${action}` }),
      });
      if (res.ok) {
        await fetchReports();
      }
    } catch (e) {
      console.error("Error updating report:", e);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredAbuseReports = reportsData.abuseReports.filter((r) => {
    if (selectedReportFilter === "pending") return r.status === "pending" || !r.status;
    if (selectedReportFilter === "resolved") return r.status?.startsWith("resolved");
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
              <FileText className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              Platform Reports & Intelligence
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Consolidated user abuse reports, healthcare operations analytics, and regulatory audit exports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchReports}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-blue-600" : "text-slate-500"}`} />
            <span>Refresh</span>
          </button>
          <a
            href="/api/admin/reports?export=csv"
            download
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Clinicians</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Stethoscope className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{reportsData.summary.verifiedDoctors}</p>
          <p className="text-[11px] text-slate-500 mt-1">Verified Medical Council members</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending KYC</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{reportsData.summary.pendingVerifications}</p>
          <p className="text-[11px] text-slate-500 mt-1">Doctor verification requests</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Medical Camps</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{reportsData.summary.totalCamps}</p>
          <p className="text-[11px] text-slate-500 mt-1">Screening camps organised</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Abuse Reports</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {reportsData.abuseReports.filter((r) => r.status === "pending" || !r.status).length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Pending admin investigation</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("abuse")}
          className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
            activeTab === "abuse"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          User & Abuse Reports ({reportsData.abuseReports.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("operations")}
          className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
            activeTab === "operations"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Clinical Operations Breakdown
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("commercial")}
          className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
            activeTab === "commercial"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Commercial & Sponsored Ads
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("export")}
          className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
            activeTab === "export"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Regulatory CSV Exports
        </button>
      </div>

      {/* TAB 1: ABUSE REPORTS */}
      {activeTab === "abuse" && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs space-y-0">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <ShieldAlert className="h-4 w-4 text-rose-600" />
              <span>Incident Investigation Queue</span>
            </div>

            <div className="flex items-center gap-1.5">
              {(["pending", "resolved", "all"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setSelectedReportFilter(f)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize cursor-pointer transition ${
                    selectedReportFilter === f
                      ? "bg-white text-slate-900 border border-slate-300 shadow-2xs"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {filteredAbuseReports.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No abuse or user misconduct reports in this category.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                    <th className="py-3 px-4">Incident Reason</th>
                    <th className="py-3 px-4">Target Type</th>
                    <th className="py-3 px-4">Reporter</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAbuseReports.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-bold text-slate-900">{r.reason || "User Misconduct"}</p>
                        {r.target_content_preview && (
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 italic">
                            "{r.target_content_preview}"
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] capitalize text-slate-700">
                        {r.target_type || "user"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {r.reporter_email || r.reporter_id || "Anonymous"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            r.severity === "critical" || r.severity === "high"
                              ? "bg-rose-100 text-rose-700 border border-rose-200"
                              : "bg-amber-100 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {r.severity || "medium"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                            r.status?.startsWith("resolved")
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {r.status || "pending"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {r.status !== "resolved_action_taken" && r.status !== "resolved_dismissed" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleResolveAbuseReport(r.id, "warn_user")}
                              disabled={actionLoading === r.id}
                              className="px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 text-[11px] font-semibold hover:bg-amber-100 transition cursor-pointer"
                            >
                              Warn User
                            </button>
                            <button
                              type="button"
                              onClick={() => handleResolveAbuseReport(r.id, "suspend")}
                              disabled={actionLoading === r.id}
                              className="px-2.5 py-1 rounded-lg border border-rose-300 bg-rose-50 text-rose-800 text-[11px] font-semibold hover:bg-rose-100 transition cursor-pointer"
                            >
                              Suspend
                            </button>
                            <button
                              type="button"
                              onClick={() => handleResolveAbuseReport(r.id, "dismiss")}
                              disabled={actionLoading === r.id}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 text-[11px] font-semibold hover:bg-slate-50 transition cursor-pointer"
                            >
                              Dismiss
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-semibold">Resolved</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CLINICAL OPERATIONS */}
      {activeTab === "operations" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Specialty Distribution */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Physician Specialty Distribution</h3>
            <p className="text-xs text-slate-500">
              Top specialties represented across verified doctors on Med Global Network.
            </p>

            <div className="space-y-3 pt-2">
              {reportsData.specialtyDistribution.length === 0 ? (
                <p className="text-xs text-slate-400">No specialty data recorded yet.</p>
              ) : (
                reportsData.specialtyDistribution.map((spec) => (
                  <div key={spec.specialization} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-800">{spec.specialization}</span>
                      <span className="text-slate-500">{spec.count} doctors</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            (spec.count / (reportsData.summary.verifiedDoctors || 1)) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Module Health Statistics */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Healthcare Operations Volume</h3>
            <p className="text-xs text-slate-500">Aggregate capacity and outreach milestones.</p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                <span className="text-xs text-slate-500 font-bold uppercase">Health Camps</span>
                <p className="text-xl font-black text-slate-900 mt-1">{reportsData.summary.totalCamps}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Community outreach clinics</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                <span className="text-xs text-slate-500 font-bold uppercase">CME Conferences</span>
                <p className="text-xl font-black text-slate-900 mt-1">{reportsData.summary.totalEvents}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Accredited medical seminars</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                <span className="text-xs text-slate-500 font-bold uppercase">Active Job Postings</span>
                <p className="text-xl font-black text-slate-900 mt-1">{reportsData.summary.totalJobs}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Hospital recruitment openings</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                <span className="text-xs text-slate-500 font-bold uppercase">Clinical Trials</span>
                <p className="text-xl font-black text-slate-900 mt-1">{reportsData.summary.totalResearchStudies}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Research collaborations</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COMMERCIAL & ADS */}
      {activeTab === "commercial" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Commercial & Sponsored Campaigns</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Impression tracking and click-through performance for healthcare brand sponsorships.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-xs text-slate-500 font-bold uppercase">Active Campaigns</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{reportsData.summary.ads.activeCampaigns}</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-xs text-slate-500 font-bold uppercase">Total Impressions</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{reportsData.summary.ads.totalImpressions}</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-xs text-slate-500 font-bold uppercase">Total Clicks</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{reportsData.summary.ads.totalClicks}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EXPORT ENGINE */}
      {activeTab === "export" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Regulatory & Compliance Export Engine</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Download complete, timestamped CSV records for healthcare council auditing and governance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Platform Master Audit Report</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Aggregated user metrics, KYC counts & volume</p>
              </div>
              <a
                href="/api/admin/reports?export=csv"
                download
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
              >
                <Download className="h-3.5 w-3.5" />
                <span>CSV</span>
              </a>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Safety & Moderation Incident Log</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">All reported misconduct and resolution actions</p>
              </div>
              <a
                href="/api/admin/reports?export=csv"
                download
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
              >
                <Download className="h-3.5 w-3.5" />
                <span>CSV</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
