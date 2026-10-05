"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Users,
  ShieldAlert,
  PhoneCall,
  Calendar,
  Tent,
  Briefcase,
  FlaskConical,
  RefreshCw,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  FileText,
  Lock,
  Loader2,
  ShieldCheck,
  Search,
} from "lucide-react";

export default function AdminCommunicationPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>({
    total_conversations: 0,
    direct_conversations: 0,
    group_conversations: 0,
    context_conversations: 0,
    total_messages: 0,
    total_calls: 0,
    pending_reports: 0,
    total_blocks: 0,
  });
  const [reports, setReports] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"moderation" | "context" | "audit">("moderation");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/communication");
      if (res.ok) {
        const json = await res.json();
        setMetrics(json.metrics || {});
        setReports(json.reports || []);
        setAuditLogs(json.auditLogs || []);
      }
    } catch (err) {
      console.error("Error loading admin communication data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleModerationAction = async (reportId: string, action: string) => {
    setActionLoading(reportId);
    try {
      const res = await fetch("/api/admin/communication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, action }),
      });
      if (res.ok) {
        await fetchAdminData();
      }
    } catch (e) {
      console.error("Moderation action error:", e);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              Communication Engine Control Plane
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Central governance, contextual chat channels, call infrastructure, and medical moderation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchAdminData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition shadow-2xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-blue-600" : "text-slate-500"}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Conversations
            </span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{metrics.total_conversations}</p>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
            <span>Direct: {metrics.direct_conversations}</span>
            <span>·</span>
            <span>Groups: {metrics.group_conversations}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Contextual Chats
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{metrics.context_conversations}</p>
          <p className="text-[11px] text-slate-500 mt-1">Events, Camps, Jobs & Studies</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Messages Processed
            </span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{metrics.total_messages}</p>
          <p className="text-[11px] text-slate-500 mt-1">Sequential & Idempotent</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Abuse & Moderation
            </span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{metrics.pending_reports}</p>
          <p className="text-[11px] text-slate-500 mt-1">Pending Investigation</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("moderation")}
          className={`px-3.5 py-1.5 rounded-xl transition ${
            activeTab === "moderation"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Moderation Queue ({reports.filter((r) => r.status === "PENDING").length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          className={`px-3.5 py-1.5 rounded-xl transition ${
            activeTab === "audit"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Audit Trail Logs
        </button>
      </div>

      {/* Tab: Moderation Queue */}
      {activeTab === "moderation" && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Lock className="h-4 w-4 text-amber-600" />
              <span>Medical Privacy Protected — Content Masked by Default</span>
            </div>
          </div>

          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600 mb-2" />
              <p className="text-xs font-semibold text-slate-700">Loading moderation queue...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="p-16 text-center text-slate-500">
              <ShieldCheck className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">All Clear</p>
              <p className="text-xs text-slate-500 mt-1">
                No flagged messages or pending misconduct reports.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {reports.map((rep) => {
                const isPending = rep.status === "PENDING";
                const isProcessing = actionLoading === rep.id;

                return (
                  <div key={rep.id} className="p-5 space-y-3 hover:bg-slate-50/80 transition">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">
                          {rep.reason}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          Reported by: {rep.reporter_name || "Clinician"} ({rep.reporter_email || "N/A"})
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(rep.created_at).toLocaleString()}
                      </span>
                    </div>

                    {rep.reported_user_name && (
                      <p className="text-xs text-slate-700">
                        <span className="text-slate-400 font-medium">Target User: </span>
                        <span className="font-bold text-slate-900">{rep.reported_user_name}</span>
                        {rep.reported_user_email && ` (${rep.reported_user_email})`}
                      </p>
                    )}

                    {rep.details && (
                      <p className="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-xl border border-slate-200">
                        &quot;{rep.details}&quot;
                      </p>
                    )}

                    {rep.message_snippet && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                          Flagged Message Content
                        </span>
                        <p>{rep.message_snippet}</p>
                      </div>
                    )}

                    {isPending && (
                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleModerationAction(rep.id, "DISMISS")}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition shadow-2xs"
                        >
                          Dismiss
                        </button>
                        {rep.message_id && (
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleModerationAction(rep.id, "DELETE_MESSAGE")}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition shadow-2xs"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete Message</span>
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleModerationAction(rep.id, "RESOLVE")}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Resolve Report</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Audit Trail Logs */}
      {activeTab === "audit" && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 bg-slate-50/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Immutable Action History
            </h3>
          </div>
          {auditLogs.length === 0 ? (
            <p className="p-12 text-center text-xs text-slate-500">No audit events logged yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50">
                  <div>
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-slate-500 ml-2">
                      by {log.actor_name || log.actor_id}
                    </span>
                    {log.reason && (
                      <p className="text-[11px] text-slate-500 mt-0.5">{log.reason}</p>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
