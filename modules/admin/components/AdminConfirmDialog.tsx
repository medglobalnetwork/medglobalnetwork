"use client";

import React, { useState } from "react";
import { AlertTriangle, X, ShieldAlert } from "lucide-react";

interface AdminConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: "danger" | "warning" | "success" | "primary";
  requireReason?: boolean;
  reasonPlaceholder?: string;
  isLoading?: boolean;
}

export function AdminConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm Action",
  variant = "danger",
  requireReason = false,
  reasonPlaceholder = "Provide an administrative rationale for audit compliance...",
  isLoading = false,
}: AdminConfirmDialogProps) {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) return;
    onConfirm(reason);
  };

  const colors = {
    danger: {
      btn: "bg-rose-600 hover:bg-rose-500 text-white",
      icon: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    },
    warning: {
      btn: "bg-amber-600 hover:bg-amber-500 text-white",
      icon: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    success: {
      btn: "bg-emerald-600 hover:bg-emerald-500 text-white",
      icon: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    primary: {
      btn: "bg-blue-600 hover:bg-blue-500 text-white",
      icon: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
  }[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${colors.icon}`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <h3 className="mt-4 text-base font-bold text-white tracking-tight">{title}</h3>
        <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">{description}</p>

        {requireReason && (
          <div className="mt-4">
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
              Reason / Administrative Justification <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={reasonPlaceholder}
              rows={3}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border border-slate-800 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading || (requireReason && !reason.trim())}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs disabled:opacity-50 ${colors.btn}`}
          >
            {isLoading && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
