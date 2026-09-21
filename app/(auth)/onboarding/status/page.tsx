"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  UploadCloud,
  ArrowRight,
  HelpCircle,
  RefreshCw,
  LogOut,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function OnboardingStatusPage() {
  const router = useRouter();
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [timeLeft, setTimeLeft] = React.useState<{ days: number; hours: number; minutes: number } | null>(null);

  const fetchStatus = React.useCallback(() => {
    fetch("/api/onboarding", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        if (d.identity?.verification_status === "APPROVED") {
          router.replace("/home");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  React.useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000); // 15s polling for review updates
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Live countdown timer calculation
  React.useEffect(() => {
    if (!data?.identity?.verification_deadline) return;

    const timer = setInterval(() => {
      const remaining = new Date(data.identity.verification_deadline).getTime() - Date.now();
      if (remaining <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
      } else {
        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft({ days, hours, minutes });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [data?.identity?.verification_deadline]);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.replace("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf9f8]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#1769c2] border-t-transparent" />
          <p className="text-xs font-semibold text-[#77716b]">Checking Verification Status...</p>
        </div>
      </div>
    );
  }

  const identity = data?.identity;
  const status = identity?.verification_status || "ENROLLED";
  const isApproved = status === "APPROVED";
  const isUnderReview = status === "UNDER_REVIEW";
  const isCorrection = status === "CORRECTION_REQUIRED";
  const isExpired = status === "VERIFICATION_INCOMPLETE";
  const isRejected = status === "REJECTED";

  return (
    <div className="min-h-screen bg-[#faf9f8] text-[#171717]">
      {/* Top Header */}
      <header className="border-b border-[#e8e6e3] bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3.5 sm:px-6">
          <img src="/logo.png" alt="MGN" className="h-7 w-auto object-contain" />
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#ded8d1] px-3 py-1.5 text-xs font-semibold text-[#5d5854] hover:bg-[#f8f7f6]"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Status Container */}
      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        {/* STATUS BANNER CARD */}
        <div className="rounded-3xl border border-[#e8e6e3] bg-white p-6 sm:p-8 shadow-xs mb-6">
          {/* UNDER REVIEW STATE */}
          {isUnderReview && (
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 mb-4">
                <Clock className="h-7 w-7 stroke-[2.2]" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight">
                  Application Under Review
                </h1>
                <span className="rounded-full bg-amber-100 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                  Pending Admin Approval
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#5d5854] leading-relaxed mb-6">
                Your credentials and KYC documents have been submitted to the MGN Verification Center. Our clinical verification team is reviewing your details (typically takes 24–48 hours).
              </p>
            </div>
          )}

          {/* CORRECTION REQUIRED STATE */}
          {isCorrection && (
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-4">
                <AlertTriangle className="h-7 w-7 stroke-[2.2]" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-black text-rose-900 tracking-tight">
                  Correction Requested by Reviewer
                </h1>
                <span className="rounded-full bg-rose-100 border border-rose-200 px-2.5 py-0.5 text-[11px] font-bold text-rose-800">
                  Action Required
                </span>
              </div>
              <div className="my-4 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-medium text-rose-900">
                <p className="font-bold mb-1">Reviewer Note:</p>
                <p>{identity?.correction_reason || "Please update your uploaded documents with clear, valid copies."}</p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/onboarding")}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1769c2] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow hover:bg-[#12569f]"
              >
                <span>Edit & Resubmit Application</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* VERIFICATION INCOMPLETE / EXPIRED STATE */}
          {(isExpired || status === "ENROLLED" || status === "DRAFT") && (
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-[#1769c2] mb-4">
                <ShieldCheck className="h-7 w-7 stroke-[2.2]" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight mb-1">
                Complete Your MGN Identity Verification
              </h1>
              <p className="text-xs sm:text-sm text-[#5d5854] leading-relaxed mb-6">
                To access feeds, network with clinicians, and view opportunities, you must complete your verified identity.
              </p>

              {/* 72h Countdown Box */}
              {timeLeft && (
                <div className="mb-6 rounded-2xl bg-[#f0f7ff] border border-[#d0e5fc] p-4 sm:p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="h-6 w-6 text-[#1769c2] shrink-0" />
                    <div>
                      <span className="text-[11px] font-bold text-[#1769c2] uppercase tracking-wider block">
                        Server-Enforced Verification Window
                      </span>
                      <span className="text-base sm:text-lg font-black text-[#171717]">
                        {timeLeft.days} days {timeLeft.hours} hours {timeLeft.minutes} mins remaining
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => router.push("/onboarding")}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1769c2] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow hover:bg-[#12569f]"
              >
                <span>Continue Verification</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* REJECTED STATE */}
          {isRejected && (
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-4">
                <XCircle className="h-7 w-7 stroke-[2.2]" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-rose-900 tracking-tight mb-1">
                Application Not Approved
              </h1>
              <p className="text-xs sm:text-sm text-[#5d5854] mb-4">
                {identity?.rejection_reason || "Your credentials could not be verified against the state medical council registry."}
              </p>
              <button
                type="button"
                onClick={() => router.push("/onboarding")}
                className="inline-flex items-center gap-2 rounded-xl border border-[#ded8d1] px-5 py-2.5 text-xs font-semibold text-[#171717] hover:bg-[#f8f7f6]"
              >
                <span>Re-apply with Updated Details</span>
              </button>
            </div>
          )}
        </div>

        {/* VERIFICATION PROGRESS & DOCUMENT DOSSIER */}
        <div className="rounded-3xl border border-[#e8e6e3] bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#171717]">Verification Progress</h3>
            <span className="text-xs font-bold text-[#1769c2]">
              {data?.progressPercent ?? 50}% Completed
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 w-full rounded-full bg-[#f0efee] overflow-hidden mb-6">
            <div
              className="h-full bg-[#1769c2] transition-all duration-500"
              style={{ width: `${data?.progressPercent ?? 50}%` }}
            />
          </div>

          {/* Checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-[#faf9f8]">
              <span className="font-semibold text-[#171717]">1. Basic Identity & Location</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" /> Completed
              </span>
            </div>

            <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-[#faf9f8]">
              <span className="font-semibold text-[#171717]">
                2. Professional Credentials & Council Registration
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" /> Completed
              </span>
            </div>

            <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-[#faf9f8]">
              <span className="font-semibold text-[#171717]">
                3. Attached KYC Documents ({data?.documents?.length || 0} uploaded)
              </span>
              {data?.documents?.length > 0 ? (
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" /> Uploaded
                </span>
              ) : (
                <span className="font-bold text-rose-600">Pending Upload</span>
              )}
            </div>

            <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-[#faf9f8]">
              <span className="font-semibold text-[#171717]">4. Admin Clinical Review</span>
              {isApproved ? (
                <span className="font-bold text-emerald-700">✓ Verified & Approved</span>
              ) : isUnderReview ? (
                <span className="font-bold text-amber-600">⏳ In Queue</span>
              ) : (
                <span className="text-[#8a8784]">Pending Submission</span>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
