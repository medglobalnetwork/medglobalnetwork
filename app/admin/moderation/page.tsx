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
              action: "resolve",
              reportId: report.id,
              targetType: report.target_type,
              targetId: report.target_id,
              resolutionAction: "dismiss",
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
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
            Content Moderation & Trust & Safety
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Review user-reported cases, abusive interactions, and enforce clinical community standards.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchReports}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-2xs w-fit"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-blue-600" : "text-slate-500"}`} />
          <span>Refresh Reports</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-3">
        {[
          { id: "pending", label: "Open Reports" },
          { id: "resolved_action_taken", label: "Action Taken" },
          { id: "all", label: "All Incidents" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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
            <div key={n} className="h-32 rounded-2xl border border-slate-200 bg-white p-5 animate-pulse shadow-xs" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center shadow-xs">
          <CheckCircle className="mx-auto h-12 w-12 text-emerald-500 mb-3" />
          <h3 className="text-sm font-bold text-slate-800">All Reports Resolved</h3>
          <p className="mt-1 text-xs text-slate-500">
            There are currently no open moderation reports requiring triage.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-700">
                      {report.reason.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs text-slate-500">• Target: <strong className="text-slate-700">{report.target_type}</strong> ({report.target_id})</span>
                    <span className="text-[11px] text-slate-400">{new Date(report.created_at).toLocaleString()}</span>
                  </div>

                  {report.target_content_preview && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 font-mono">
                      &quot;{report.target_content_preview}&quot;
                    </div>
                  )}

                  {report.description && (
                    <p className="text-xs text-slate-600">
                      <strong className="text-slate-800">Reporter comment:</strong> {report.description}
                    </p>
                  )}
                </div>

                {/* Actions */}
                {report.status === "pending" && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleTakeAction(report, "dismiss")}
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
                    >
                      Dismiss
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTakeAction(report, "delete_content")}
                      className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700"
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
