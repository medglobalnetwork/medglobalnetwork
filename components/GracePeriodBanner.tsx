"use client";

import * as React from "react";
import Link from "next/link";
import { Clock, AlertTriangle, ShieldCheck, ArrowRight, X } from "lucide-react";

export default function GracePeriodBanner() {
  const [data, setData] = React.useState<any>(null);
  const [dismissed, setDismissed] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState<{ days: number; hours: number; minutes: number } | null>(null);

  React.useEffect(() => {
    fetch("/api/onboarding", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.identity) setData(d.identity);
      })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    if (!data?.verification_deadline) return;

    const calculateTime = () => {
      const remaining = new Date(data.verification_deadline).getTime() - Date.now();
      if (remaining <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
      } else {
        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft({ days, hours, minutes });
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 30000);
    return () => clearInterval(timer);
  }, [data?.verification_deadline]);

  if (!data || dismissed) return null;

  const status = data.verification_status;
  if (status === "APPROVED") return null;

  const formatTimeString = () => {
    if (!timeLeft) return "3 days";
    if (timeLeft.days > 0) return `${timeLeft.days}d ${timeLeft.hours}h remaining`;
    if (timeLeft.hours > 0) return `${timeLeft.hours}h ${timeLeft.minutes}m remaining`;
    return `${timeLeft.minutes}m remaining`;
  };

  if (status === "ENROLLED") {
    return (
      <div className="bg-gradient-to-r from-[#0a2f52] via-[#0f4c81] to-[#16804d] text-white px-3 sm:px-4 py-2 sm:py-2.5 text-xs shadow-xs relative z-30">
        <div className="mx-auto max-w-[1440px] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
              <Clock className="h-3 w-3" />
            </span>
            <span>
              <strong className="font-bold">3-Day Grace Period Active:</strong> You have full platform access! Please upload your verification documents within{" "}
              <span className="underline decoration-white/50 font-bold bg-white/10 px-1.5 py-0.5 rounded text-[11px] inline-block">
                {formatTimeString()}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1 text-[11px] font-bold text-[#0f4c81] hover:bg-[#f0efee] transition shadow-2xs"
            >
              <span>Upload Documents</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label="Dismiss banner"
              className="p-1 text-white/70 hover:text-white transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === "CORRECTION_REQUIRED") {
    return (
      <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-rose-700 text-white px-3 sm:px-4 py-2 sm:py-2.5 text-xs shadow-xs relative z-30">
        <div className="mx-auto max-w-[1440px] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
              <AlertTriangle className="h-3 w-3" />
            </span>
            <span>
              <strong className="font-bold">Correction Requested:</strong> Reviewer requested document update. You have{" "}
              <span className="underline decoration-white/50 font-bold bg-white/10 px-1.5 py-0.5 rounded text-[11px] inline-block">
                {formatTimeString()}
              </span>{" "}
              to re-submit.
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-50 transition shadow-2xs"
            >
              <span>Update Documents</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label="Dismiss banner"
              className="p-1 text-white/70 hover:text-white transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === "UNDER_REVIEW") {
    return (
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-3 sm:px-4 py-2 text-xs shadow-xs relative z-30 border-b border-slate-700/50">
        <div className="mx-auto max-w-[1440px] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium text-slate-200">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
            </span>
            <span>
              <strong className="font-bold text-white">Documents Under Review:</strong> Your credentials are being reviewed by the MGN clinical team. You have full access in the meantime.
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <Link
              href="/onboarding/status"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:underline"
            >
              <span>View Status</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label="Dismiss banner"
              className="p-1 text-slate-400 hover:text-white transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
