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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Communication Engine Control Plane
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Central governance, contextual chat channels, call infrastructure, and medical moderation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchAdminData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Conversations
            </span>
            <MessageSquare className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{metrics.total_conversations}</p>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
            <span>Direct: {metrics.direct_conversations}</span>
            <span>·</span>
            <span>Groups: {metrics.group_conversations}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Contextual Chats
            </span>
            <Users className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{metrics.context_conversations}</p>
          <p className="text-[11px] text-slate-400 mt-1">Events, Camps, Jobs & Studies</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Messages Processed
            </span>
            <FileText className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{metrics.total_messages}</p>
          <p className="text-[11px] text-slate-400 mt-1">Sequential & Idempotent</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Abuse & Moderation
            </span>
            <ShieldAlert className="h-4 w-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{metrics.pending_reports}</p>
          <p className="text-[11px] text-slate-400 mt-1">Pending Investigation</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("moderation")}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeTab === "moderation"
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          Moderation Queue ({reports.filter((r) => r.status === "PENDING").length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeTab === "audit"
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          Audit Trail Logs
        </button>
      </div>

      {/* Tab: Moderation Queue */}
      {activeTab === "moderation" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <Lock className="h-4 w-4 text-amber-400" />
              <span>Medical Privacy Protected — Content Masked by Default</span>
            </div>
          </div>

          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin text-blue-400 mb-2" />
              <p className="text-xs">Loading moderation queue...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <ShieldCheck className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-white">All Clear</p>
              <p className="text-xs text-slate-400 mt-1">
                No flagged messages or pending misconduct reports.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {reports.map((rep) => {
                const isPending = rep.status === "PENDING";
                const isProcessing = actionLoading === rep.id;

                return (
                  <div key={rep.id} className="p-4 space-y-3 hover:bg-slate-900/60 transition">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          {rep.reason}
                        </span>
                        <span className="text-xs font-bold text-white">
                          Reported by: {rep.reporter_name || "Clinician"} ({rep.reporter_email || "N/A"})
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(rep.created_at).toLocaleString()}
                      </span>
                    </div>

                    {rep.reported_user_name && (
                      <p className="text-xs text-slate-300">
                        <span className="text-slate-400">Target User: </span>
                        <span className="font-semibold text-white">{rep.reported_user_name}</span>
                        {rep.reported_user_email && ` (${rep.reported_user_email})`}
                      </p>
                    )}

                    {rep.details && (
                      <p className="text-xs text-slate-400 italic bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        "{rep.details}"
                      </p>
                    )}

                    {rep.message_snippet && (
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
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
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
                        >
                          Dismiss
                        </button>
                        {rep.message_id && (
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleModerationAction(rep.id, "DELETE_MESSAGE")}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-900/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-bold transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete Message
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleModerationAction(rep.id, "RESOLVE")}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Resolve Report
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
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-900/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Immutable Action History
            </h3>
          </div>
          {auditLogs.length === 0 ? (
            <p className="p-8 text-center text-xs text-slate-400">No audit events logged yet.</p>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white">{log.action}</span>
                    <span className="text-slate-400 ml-2">
                      by {log.actor_name || log.actor_id}
                    </span>
                    {log.reason && (
                      <p className="text-[11px] text-slate-400 mt-0.5">{log.reason}</p>
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
