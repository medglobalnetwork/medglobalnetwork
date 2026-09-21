"use client";

import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import { AdminConfirmDialog } from "@/modules/admin/components/AdminConfirmDialog";

interface VerificationItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  image: string | null;
  profession: string;
  specialization: string;
  primaryDegree: string;
  medicalCouncil: string;
  registrationNumber: string;
  organization?: string;
  city?: string;
  state?: string;
  experienceYears: number;
  identityVerified: boolean;
  registrationVerified: boolean;
  educationVerified: boolean;
  status: "pending" | "verified";
  submittedAt: string;
}

export default function AdminVerificationPage() {
  const [queue, setQueue] = useState<VerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "verified" | "all">("pending");
  const [search, setSearch] = useState("");
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: (reason: string) => void;
    variant: "success" | "danger";
  }>({
    isOpen: false,
    title: "",
    description: "",
    action: () => {},
    variant: "success",
  });

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/verification?filter=${activeTab}`);
      if (res.ok) {
        const data = await res.json();
        setQueue(data.queue || []);
      }
    } catch (err) {
      console.error("Error fetching verification queue:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [activeTab]);

  const handleApprove = (item: VerificationItem) => {
    setConfirmModal({
      isOpen: true,
      title: `Approve Verification for ${item.name}`,
      description: `Confirm that medical council registration (${item.registrationNumber} - ${item.medicalCouncil}) has been validated against official registry records.`,
      variant: "success",
      action: async (reason) => {
        const res = await fetch("/api/admin/verification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "approve",
            userId: item.userId,
            reason,
          }),
        });
        if (res.ok) {
          fetchQueue();
          setConfirmModal((p) => ({ ...p, isOpen: false }));
        }
      },
    });
  };

  const handleReject = (item: VerificationItem) => {
    setConfirmModal({
      isOpen: true,
      title: `Reject Verification for ${item.name}`,
      description: `Provide a clear administrative reason for rejecting this doctor's council credentials.`,
      variant: "danger",
      action: async (reason) => {
        const res = await fetch("/api/admin/verification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "reject",
            userId: item.userId,
            reason,
          }),
        });
        if (res.ok) {
          fetchQueue();
          setConfirmModal((p) => ({ ...p, isOpen: false }));
        }
      },
    });
  };

  const filteredQueue = queue.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.registrationNumber.toLowerCase().includes(search.toLowerCase()) ||
      item.medicalCouncil.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Doctor & Medical Council Verification
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Review state council credentials, degree certificates, and grant the official verified clinician badge.
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
        <div className="flex gap-2">
          {[
            { id: "pending", label: "Pending KYC Review", count: queue.filter((i) => !i.registrationVerified).length },
            { id: "verified", label: "Verified Clinicians", count: queue.filter((i) => i.registrationVerified).length },
            { id: "all", label: "All Records", count: queue.length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter council number, doctor name..."
            className="h-9 w-full rounded-xl border border-slate-800 bg-slate-900 pl-9 pr-3 text-xs text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Verification Queue Cards */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-56 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 animate-pulse" />
          ))}
        </div>
      ) : filteredQueue.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center">
          <FileCheck className="mx-auto h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-sm font-bold text-white">Verification Queue Cleared</h3>
          <p className="mt-1 text-xs text-slate-400">
            No pending medical registrations in this filter category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {filteredQueue.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl transition-all hover:border-slate-700 flex flex-col justify-between"
            >
              <div>
                {/* Doctor Identity Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-12 w-12 rounded-2xl object-cover border border-slate-700 ring-2 ring-blue-500/20"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 font-bold text-white text-base">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-white">{item.name}</h3>
                        {item.registrationVerified && (
                          <ShieldCheck className="h-4 w-4 text-blue-400" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{item.email}</p>
                      <p className="text-xs font-semibold text-blue-400 mt-0.5">
                        {item.profession} • {item.specialization}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      item.registrationVerified
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {item.registrationVerified ? "Verified ✓" : "Pending Review"}
                  </span>
                </div>

                {/* Medical Council Credentials Box */}
                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">State / National Council:</span>
                    <span className="font-semibold text-white">{item.medicalCouncil}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Registration Number:</span>
                    <span className="font-mono font-bold text-blue-300">{item.registrationNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Primary Degree:</span>
                    <span className="font-semibold text-slate-200">{item.primaryDegree}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Hospital / Practice:</span>
                    <span className="text-slate-300">{item.organization || "Private Practice"}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
                {!item.registrationVerified ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleReject(item)}
                      className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition-colors"
                    >
                      Reject Credentials
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(item)}
                      className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-500 transition-colors"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Approve & Verify</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleReject(item)}
                    className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    Revoke Verification
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <AdminConfirmDialog
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((p) => ({ ...p, isOpen: false }))}
        onConfirm={(reason) => confirmModal.action(reason)}
        title={confirmModal.title}
        description={confirmModal.description}
        variant={confirmModal.variant}
        requireReason={confirmModal.variant === "danger"}
      />
    </div>
  );
}
