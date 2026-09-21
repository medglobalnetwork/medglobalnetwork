"use client";

import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  RefreshCw,
  Search,
  Filter,
} from "lucide-react";
import { AdminConfirmDialog } from "@/modules/admin/components/AdminConfirmDialog";

interface ModerationReport {
  id: string;
  reporter_id: string;
  reporter_email?: string;
  target_type: "post" | "comment" | "story" | "user";
  target_id: string;
  target_content_preview?: string;
  reason: string;
  description?: string;
  status: "pending" | "resolved_action_taken" | "resolved_dismissed";
  severity: "low" | "medium" | "high" | "critical";
  created_at: string;
}

export default function AdminModerationPage() {
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "resolved" | "all">("pending");
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: (notes: string) => void;
    variant: "danger" | "warning" | "success";
  }>({
    isOpen: false,
    title: "",
    description: "",
    action: () => {},
    variant: "danger",
  });

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/moderation?status=${activeTab}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [activeTab]);

  const handleTakeAction = (report: ModerationReport, actionType: "delete_content" | "dismiss") => {
    if (actionType === "delete_content") {
      setConfirmDialog({
        isOpen: true,
        title: `Remove Flagged ${report.target_type.toUpperCase()}`,
        description: `This will permanently delete the ${report.target_type} from the platform and record a moderation strike.`,
        variant: "danger",
        action: async (notes) => {
          const res = await fetch("/api/admin/moderation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "resolve",
              reportId: report.id,
              targetType: report.target_type,
              targetId: report.target_id,
              resolutionAction: "delete_content",
              resolutionNotes: notes,
            }),
          });
          if (res.ok) {
            fetchReports();
            setConfirmDialog((p) => ({ ...p, isOpen: false }));
          }
        },
      });
    } else {
      setConfirmDialog({
        isOpen: true,
        title: "Dismiss Report",
        description: "Mark this report as reviewed with no platform policy violation found.",
        variant: "warning",
        action: async (notes) => {
          const res = await fetch("/api/admin/moderation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "dismiss",
              reportId: report.id,
              resolutionNotes: notes,
            }),
          });
          if (res.ok) {
            fetchReports();
            setConfirmDialog((p) => ({ ...p, isOpen: false }));
          }
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Moderation & Safety Center
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Review reported posts, medical misinformation flags, and user safety incidents.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchReports}
          className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-slate-700 hover:text-white transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-blue-400" : ""}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-3">
        {[
          { id: "pending", label: "Open Reports" },
          { id: "resolved_action_taken", label: "Action Taken" },
          { id: "all", label: "All Incidents" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reports Listing */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 animate-pulse" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-emerald-500 mb-3" />
          <h3 className="text-sm font-bold text-white">All Reports Resolved</h3>
          <p className="mt-1 text-xs text-slate-400">
            There are currently no open moderation reports requiring triage.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl transition-all hover:border-slate-700"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-300">
                      {report.reason.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs text-slate-400">• Target: {report.target_type} ({report.target_id})</span>
                    <span className="text-[11px] text-slate-500">{new Date(report.created_at).toLocaleString()}</span>
                  </div>

                  {report.target_content_preview && (
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-300 font-mono">
                      "{report.target_content_preview}"
                    </div>
                  )}

                  {report.description && (
                    <p className="text-xs text-slate-400">
                      <strong className="text-slate-300">Reporter comment:</strong> {report.description}
                    </p>
                  )}
                </div>

                {/* Actions */}
                {report.status === "pending" && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleTakeAction(report, "dismiss")}
                      className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
                    >
                      Dismiss
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTakeAction(report, "delete_content")}
                      className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md hover:bg-rose-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Take Down</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <AdminConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((p) => ({ ...p, isOpen: false }))}
        onConfirm={(notes) => confirmDialog.action(notes)}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        requireReason={true}
      />
    </div>
  );
}
