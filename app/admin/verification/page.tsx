"use client";

import React, { useEffect, useState, useTransition } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle,
  XCircle,
  Award,
  Building,
  FileCheck,
  RefreshCw,
  Search,
  FileText,
  ExternalLink,
  Eye,
  AlertTriangle,
  UserCheck,
  Calendar,
  MapPin,
  ChevronRight,
  Info,
  X,
  Lock,
  Folder,
  FolderCheck,
} from "lucide-react";
import { AdminConfirmDialog } from "@/modules/admin/components/AdminConfirmDialog";

interface QueueItem {
  id: string;
  user_id: string;
  account_type: "INDIVIDUAL" | "ORGANISATION";
  category: string;
  profession_or_type: string;
  legal_first_name: string;
  legal_last_name: string;
  display_name: string;
  city?: string;
  state?: string;
  country?: string;
  verification_status: string;
  verification_deadline?: string;
  enrolled_at?: string;
  submitted_at?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  correction_reason?: string;
  rejection_reason?: string;
  user_name?: string;
  user_email?: string;
  user_image?: string | null;
}

interface DossierData {
  identity: any;
  documents: Array<{
    id: string;
    document_type: string;
    original_filename: string;
    file_size_bytes: number;
    mime_type: string;
    is_verified: boolean;
    created_at: string;
  }>;
  titles: Array<{
    title_prefix?: string;
    title_suffix?: string;
    is_verified: boolean;
  }>;
  qualifications: Array<{
    degree_name: string;
    institution: string;
    year_of_completion?: number;
    is_verified: boolean;
  }>;
  registrations: Array<{
    council_name: string;
    registration_number: string;
    state?: string;
    is_verified: boolean;
  }>;
  auditLogs: Array<{
    id: string;
    action: string;
    from_status?: string;
    to_status: string;
    reason?: string;
    created_at: string;
  }>;
}

const STATUS_TABS = [
  { id: "UNDER_REVIEW", label: "Under Review" },
  { id: "CORRECTION_REQUIRED", label: "Correction Required" },
  { id: "APPROVED", label: "Approved" },
  { id: "REJECTED", label: "Rejected" },
  { id: "ENROLLED", label: "Enrolled (Pending Submission)" },
  { id: "VERIFICATION_INCOMPLETE", label: "Incomplete (Expired)" },
  { id: "ALL", label: "All Applicants" },
];

export default function AdminVerificationPage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("UNDER_REVIEW");
  const [search, setSearch] = useState("");

  // Dossier Modal State
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [dossier, setDossier] = useState<DossierData | null>(null);
  const [loadingDossier, setLoadingDossier] = useState(false);

  // Review Action Dialog
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    variant: "success" | "danger" | "warning" | "primary";
    requireReason: boolean;
    reasonPlaceholder?: string;
    action: (reason: string) => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    description: "",
    confirmLabel: "Confirm",
    variant: "success",
    requireReason: false,
    action: async () => {},
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/verification/queue?status=${activeTab}&q=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setQueue(data.items || []);
        setCounts(data.counts || {});
      }
    } catch (err) {
      console.error("Error fetching queue:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [activeTab, search]);

  const loadDossier = async (userId: string) => {
    setSelectedUserId(userId);
    setLoadingDossier(true);
    try {
      const res = await fetch(`/api/admin/verification/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setDossier(data);
      }
    } catch (err) {
      console.error("Failed to load applicant dossier:", err);
    } finally {
      setLoadingDossier(false);
    }
  };

  const handleApprove = (userId: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: `Approve Identity & Credentials for ${name}`,
      description: `This will mark the applicant's credentials as verified, enable claimed title prefixes (e.g. Dr., PT, RN), unlock full MGN platform access, and notify the user.`,
      confirmLabel: "Approve & Grant Access",
      variant: "success",
      requireReason: false,
      action: async (reason) => {
        setIsSubmitting(true);
        try {
          const res = await fetch("/api/admin/verification/review", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              targetUserId: userId,
              action: "APPROVE",
              reason: reason || "All identity and regulatory registration documents verified successfully.",
            }),
          });
          if (res.ok) {
            setConfirmModal((p) => ({ ...p, isOpen: false }));
            setSelectedUserId(null);
            fetchQueue();
          }
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  };

  const handleRequestCorrection = (userId: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: `Request Correction from ${name}`,
      description: `Please provide specific instructions on what needs correction (e.g. blurry registration certificate, mismatched name, missing qualification degree). The user will be notified to re-upload.`,
      confirmLabel: "Send Correction Request",
      variant: "warning",
      requireReason: true,
      reasonPlaceholder: "Specify exact documents or details requiring correction...",
      action: async (reason) => {
        setIsSubmitting(true);
        try {
          const res = await fetch("/api/admin/verification/review", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              targetUserId: userId,
              action: "REQUEST_CORRECTION",
              reason,
            }),
          });
          if (res.ok) {
            setConfirmModal((p) => ({ ...p, isOpen: false }));
            setSelectedUserId(null);
            fetchQueue();
          }
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  };

  const handleReject = (userId: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: `Reject Application for ${name}`,
      description: `Provide an administrative reason for rejecting this verification application. The user's claimed titles will not be verified and access remains restricted.`,
      confirmLabel: "Reject Application",
      variant: "danger",
      requireReason: true,
      reasonPlaceholder: "Provide administrative reason for rejection (e.g. Invalid council credentials, duplicate identity)...",
      action: async (reason) => {
        setIsSubmitting(true);
        try {
          const res = await fetch("/api/admin/verification/review", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              targetUserId: userId,
              action: "REJECT",
              reason,
            }),
          });
          if (res.ok) {
            setConfirmModal((p) => ({ ...p, isOpen: false }));
            setSelectedUserId(null);
            fetchQueue();
          }
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl flex items-center gap-2.5">
            <ShieldCheck className="h-6 w-6 text-blue-400" />
            MGN Identity & KYC Verification Center
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Review professional council registrations, degrees, and identity documents to protect platform integrity.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchQueue}
          className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-slate-700 hover:text-white transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-blue-400" : ""}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
            {STATUS_TABS.map((tab) => {
              const count = counts[tab.id] ?? (tab.id === "ALL" ? counts.TOTAL : 0);
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <span>{tab.label}</span>
                  {count !== undefined && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isActive ? "bg-white/20 text-white" : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, profession..."
              className="h-9 w-full rounded-xl border border-slate-800 bg-slate-900 pl-9 pr-3 text-xs text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Queue Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-48 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 animate-pulse" />
          ))}
        </div>
      ) : queue.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center">
          <FileCheck className="mx-auto h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-sm font-bold text-white">Queue Empty</h3>
          <p className="mt-1 text-xs text-slate-400">
            No applicants found matching this status filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {queue.map((item) => {
            const fullName = `${item.legal_first_name || ""} ${item.legal_last_name || ""}`.trim() || item.display_name || item.user_name || "Applicant";
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl transition-all hover:border-slate-700 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold text-base">
                        {fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-white">{fullName}</h3>
                          {item.verification_status === "APPROVED" && (
                            <ShieldCheck className="h-4 w-4 text-emerald-400" />
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{item.user_email}</p>
                        <p className="text-[11px] font-semibold text-blue-400 mt-0.5">
                          {item.account_type === "ORGANISATION" ? "🏢 Organisation" : "👤 Individual"} • {item.profession_or_type?.replace(/_/g, " ")}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        item.verification_status === "APPROVED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : item.verification_status === "UNDER_REVIEW"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : item.verification_status === "CORRECTION_REQUIRED"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : item.verification_status === "REJECTED"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {item.verification_status.replace(/_/g, " ")}
                    </span>
                  </div>

                  {/* Summary Details */}
                  <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs space-y-1.5">
                    {(item.city || item.state) && (
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                        <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                        <span>{[item.city, item.state, item.country].filter(Boolean).join(", ")}</span>
                      </div>
                    )}
                    {item.submitted_at && (
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                        <Calendar className="h-3 w-3 text-slate-500 shrink-0" />
                        <span>Submitted: {new Date(item.submitted_at).toLocaleDateString()} at {new Date(item.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    )}
                    {item.verification_deadline && item.verification_status === "ENROLLED" && (
                      <div className="flex items-center gap-1.5 text-amber-400 text-[11px] font-medium">
                        <Clock className="h-3 w-3 text-amber-400 shrink-0" />
                        <span>72h Deadline: {new Date(item.verification_deadline).toLocaleString()}</span>
                      </div>
                    )}
                    {item.correction_reason && (
                      <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2 text-amber-300 text-[11px]">
                        <strong>Requested Correction:</strong> {item.correction_reason}
                      </div>
                    )}
                    {item.rejection_reason && (
                      <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-2 text-rose-300 text-[11px]">
                        <strong>Rejection Reason:</strong> {item.rejection_reason}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Review CTA */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">ID: {item.user_id.slice(0, 8)}...</span>
                  <button
                    type="button"
                    onClick={() => loadDossier(item.user_id)}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md hover:bg-blue-500 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Review KYC Dossier</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* KYC Dossier Modal */}
      {selectedUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-4xl max-h-[90vh] rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold">
                  {dossier?.identity?.legal_first_name?.[0]?.toUpperCase() || "A"}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    {dossier?.identity?.legal_first_name} {dossier?.identity?.legal_last_name}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {dossier?.identity?.user_email} • {dossier?.identity?.profession_or_type?.replace(/_/g, " ")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    dossier?.identity?.verification_status === "APPROVED"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  }`}
                >
                  {dossier?.identity?.verification_status?.replace(/_/g, " ")}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedUserId(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingDossier ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  Loading applicant dossier...
                </div>
              ) : dossier ? (
                <>
                  {/* Identity & Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                      <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Basic Identity</h4>
                      <div className="text-xs space-y-1 text-slate-300">
                        <div><span className="text-slate-500">Legal Name:</span> {dossier.identity?.legal_first_name} {dossier.identity?.legal_last_name}</div>
                        <div><span className="text-slate-500">Display Name:</span> {dossier.identity?.display_name || "—"}</div>
                        <div><span className="text-slate-500">Gender:</span> {dossier.identity?.gender || "—"}</div>
                        <div><span className="text-slate-500">Date of Birth:</span> {dossier.identity?.date_of_birth ? new Date(dossier.identity.date_of_birth).toLocaleDateString() : "—"}</div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                      <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Location & Contact</h4>
                      <div className="text-xs space-y-1 text-slate-300">
                        <div><span className="text-slate-500">City:</span> {dossier.identity?.city || "—"}</div>
                        <div><span className="text-slate-500">State / Province:</span> {dossier.identity?.state || "—"}</div>
                        <div><span className="text-slate-500">Country:</span> {dossier.identity?.country || "India"}</div>
                        <div><span className="text-slate-500">Postal Code:</span> {dossier.identity?.postal_code || "—"}</div>
                      </div>
                    </div>
                  </div>

                  {/* Professional Titles & Registrations */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                      Medical & Regulatory Council Registrations
                    </h4>
                    {dossier.registrations && dossier.registrations.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {dossier.registrations.map((reg, i) => (
                          <div key={i} className="rounded-lg border border-slate-800 bg-slate-900 p-3 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400 font-medium">Council Name:</span>
                              <span className="font-semibold text-white">{reg.council_name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400 font-medium">Registration Number:</span>
                              <span className="font-mono font-bold text-blue-300">{reg.registration_number}</span>
                            </div>
                            {reg.state && (
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400 font-medium">State:</span>
                                <span className="text-slate-200">{reg.state}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">No regulatory registrations recorded for this category.</p>
                    )}
                  </div>

                  {/* Qualifications */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                      Educational Qualifications & Degrees
                    </h4>
                    {dossier.qualifications && dossier.qualifications.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {dossier.qualifications.map((q, i) => (
                          <div key={i} className="rounded-lg border border-slate-800 bg-slate-900 p-3 text-xs space-y-1">
                            <div className="font-bold text-white text-sm">{q.degree_name}</div>
                            <div className="text-slate-400">{q.institution}</div>
                            {q.year_of_completion && (
                              <div className="text-slate-500 text-[11px]">Year: {q.year_of_completion}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">No qualification records added.</p>
                    )}
                  </div>

                  {/* Uploaded Documents */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5" />
                      Uploaded KYC Documents ({dossier.documents?.length || 0})
                    </h4>
                    {dossier.documents && dossier.documents.length > 0 ? (
                      <div className="space-y-2">
                        {dossier.documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400">
                                <FileText className="h-5 w-5" />
                              </div>
                              <div>
                                <span className="font-bold text-white text-xs block">
                                  {doc.document_type.replace(/_/g, " ")}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  {doc.original_filename} • {(doc.file_size_bytes / 1024 / 1024).toFixed(2)} MB
                                </span>
                              </div>
                            </div>

                            <a
                              href={`/api/onboarding/documents/${doc.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-blue-500 hover:text-white transition-colors"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              <span>View Document</span>
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">No KYC documents uploaded yet.</p>
                    )}
                  </div>

                  {/* User Storage Workspace */}
                  <div className="rounded-xl border border-blue-500/20 bg-blue-950/20 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-blue-400">
                      <Folder className="h-4 w-4" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">Dedicated User Storage Workspace</h4>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      All files and full JSON / summary dossiers are automatically isolated in the user&apos;s personal server directory:
                    </p>
                    <div className="rounded-lg bg-slate-950 border border-slate-800 p-2.5 font-mono text-[11px] text-blue-300 space-y-1">
                      <div>📁 <span className="text-slate-400">User Root:</span> private_storage/users/{dossier.identity?.user_id}/</div>
                      <div>├── 📁 documents/ <span className="text-slate-500">({dossier.documents?.length || 0} KYC files)</span></div>
                      <div>├── 📄 metadata.json <span className="text-slate-500">(auto-synced dossier)</span></div>
                      <div>└── 📄 summary.txt <span className="text-slate-500">(human-readable profile)</span></div>
                    </div>
                  </div>

                  {/* Audit Logs */}
                  {dossier.auditLogs && dossier.auditLogs.length > 0 && (
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Audit Log History</h4>
                      <div className="space-y-2 text-xs">
                        {dossier.auditLogs.map((log) => (
                          <div key={log.id} className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-2.5">
                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                              <span className="font-semibold text-slate-200">{log.action} → {log.to_status}</span>
                              <span>{new Date(log.created_at).toLocaleString()}</span>
                            </div>
                            {log.reason && <p className="mt-1 text-slate-300 text-[11px]">{log.reason}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {/* Modal Actions Footer */}
            {dossier && (
              <div className="flex items-center justify-between border-t border-slate-800 px-6 py-4 bg-slate-950/80">
                <button
                  type="button"
                  onClick={() => setSelectedUserId(null)}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Close
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleReject(dossier.identity?.user_id, `${dossier.identity?.legal_first_name} ${dossier.identity?.legal_last_name}`)}
                    className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition-colors"
                  >
                    Reject Application
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRequestCorrection(dossier.identity?.user_id, `${dossier.identity?.legal_first_name} ${dossier.identity?.legal_last_name}`)}
                    className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition-colors"
                  >
                    Request Correction
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(dossier.identity?.user_id, `${dossier.identity?.legal_first_name} ${dossier.identity?.legal_last_name}`)}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-500 transition-colors"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Approve & Verify</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AdminConfirmDialog
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((p) => ({ ...p, isOpen: false }))}
        onConfirm={(reason) => confirmModal.action(reason)}
        title={confirmModal.title}
        description={confirmModal.description}
        confirmLabel={confirmModal.confirmLabel}
        variant={confirmModal.variant}
        requireReason={confirmModal.requireReason}
        reasonPlaceholder={confirmModal.reasonPlaceholder}
        isLoading={isSubmitting}
      />
    </div>
  );
}
