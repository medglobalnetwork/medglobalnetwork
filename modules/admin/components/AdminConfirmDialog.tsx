"use client";

import React, { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

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
      btn: "bg-rose-600 hover:bg-rose-700 text-white shadow-xs",
      icon: "bg-rose-50 text-rose-600 border-rose-200",
    },
    warning: {
      btn: "bg-amber-600 hover:bg-amber-700 text-white shadow-xs",
      icon: "bg-amber-50 text-amber-600 border-amber-200",
    },
    success: {
      btn: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs",
      icon: "bg-emerald-50 text-emerald-600 border-emerald-200",
    },
    primary: {
      btn: "bg-blue-600 hover:bg-blue-700 text-white shadow-xs",
      icon: "bg-blue-50 text-blue-600 border-blue-200",
    },
  }[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${colors.icon}`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <h3 className="mt-4 text-base font-bold text-slate-900 tracking-tight">{title}</h3>
        <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{description}</p>

        {requireReason && (
          <div className="mt-4">
            <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
              Reason / Administrative Justification <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={reasonPlaceholder}
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors shadow-2xs"
            />
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 transition-colors shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading || (requireReason && !reason.trim())}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold disabled:opacity-50 transition-colors ${colors.btn}`}
          >
            {isLoading && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
