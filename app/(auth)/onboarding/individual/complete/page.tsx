"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  FileText,
  UploadCloud,
  Sparkles,
  AlertCircle,
  Stethoscope,
  GraduationCap,
  HeartPulse,
  Pill,
  Activity,
  Ambulance,
  Users,
  Microscope,
  BookOpen,
  Building2,
  Briefcase,
  Shield,
  Award,
  Mail,
  Smartphone,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Info,
  RefreshCw,
} from "lucide-react";

interface IdentityItem {
  id: string;
  title: string;
  group: string;
  description: string;
  status: string;
  isVerified: boolean;
}

interface AccountData {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  accountType: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
}

interface VerificationData {
  status: "APPROVED" | "UNDER_REVIEW" | "DEADLINE_EXPIRED" | "PENDING_DOCUMENT_UPLOAD";
  deadlineIso: string;
  deadlineRemainingSeconds: number;
  documentsSubmitted: boolean;
  isReviewPending: boolean;
  isExpired: boolean;
  isApproved: boolean;
  documentsCount: number;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  student: GraduationCap,
  intern_trainee: Award,
  doctor: Stethoscope,
  nurse: HeartPulse,
  pharmacist: Pill,
  physiotherapist: Activity,
  paramedical: Ambulance,
  allied_health: Users,
  researcher: Microscope,
  faculty: BookOpen,
  business_owner: Building2,
  service_provider: Briefcase,
  other_healthcare: Shield,
};

export default function IndividualCompletePage() {
  const router = useRouter();

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [account, setAccount] = React.useState<AccountData | null>(null);
  const [identities, setIdentities] = React.useState<IdentityItem[]>([]);
  const [verification, setVerification] = React.useState<VerificationData | null>(null);

  // Live countdown state in seconds (updated every 1s)
  const [secondsRemaining, setSecondsRemaining] = React.useState<number>(0);

  // ─────────────────────────────────────────────
  // FETCH SERVER STATE
  // ─────────────────────────────────────────────
  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Check localStorage for userId fallback if session cookie not yet synced
      let targetUserId = "";
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("mgn_onboarding_registered_user");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.userId) targetUserId = parsed.userId;
          } catch {}
        }
      }

      const url = targetUserId
        ? `/api/onboarding/complete?userId=${encodeURIComponent(targetUserId)}`
        : "/api/onboarding/complete";

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to retrieve account details.");
      }

      setAccount(data.account);
      setIdentities(data.identities || []);
      setVerification(data.verification);
      setSecondsRemaining(data.verification?.deadlineRemainingSeconds ?? 0);
    } catch (err: any) {
      console.error("Error loading onboarding complete state:", err);
      setError(err.message || "Failed to load account information. Please try refreshing.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // ─────────────────────────────────────────────
  // 72-HOUR COUNTDOWN TIMER (1-second tick)
  // Uses backend deadline timestamp
  // ─────────────────────────────────────────────
  React.useEffect(() => {
    if (!verification?.deadlineIso) return;

    // Do not run countdown if already submitted or approved
    if (verification.documentsSubmitted || verification.isApproved) {
      return;
    }

    const targetTime = new Date(verification.deadlineIso).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((targetTime - now) / 1000));
      setSecondsRemaining(diff);

      if (diff <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [verification?.deadlineIso, verification?.documentsSubmitted, verification?.isApproved]);

  // Format countdown into days, hours, mins, secs
  const days = Math.floor(secondsRemaining / (24 * 3600));
  const hours = Math.floor((secondsRemaining % (24 * 3600)) / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;
  const totalHoursLeft = Math.floor(secondsRemaining / 3600);

  const isExpired =
    secondsRemaining <= 0 &&
    !verification?.documentsSubmitted &&
    !verification?.isApproved;

  // ─────────────────────────────────────────────
  // LOADING SKELETON
  // ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-dvh bg-white dark:bg-[#0b131e] text-[#1f2937] dark:text-[#f3f4f6] flex flex-col font-sans">
        <header className="w-full border-b border-slate-100 dark:border-slate-800/80 bg-white/95 dark:bg-[#0b131e]/95 backdrop-blur-md sticky top-0 z-30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="MED Global Network" className="h-9 w-auto object-contain" />
              <div className="flex flex-col">
                <span className="text-xl font-black text-[#102D45] dark:text-[#58a6ff]">MED Global Network</span>
                <span className="text-[10px] font-bold uppercase text-[#168B78] dark:text-[#2dd4bf]">Healthcare Community</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm text-center space-y-4 animate-pulse">
            <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto" />
            <div className="h-6 w-48 bg-slate-100 dark:bg-slate-800 rounded mx-auto" />
            <div className="h-4 w-64 bg-slate-100 dark:bg-slate-800 rounded mx-auto" />
            <div className="pt-6 space-y-3">
              <div className="h-20 bg-slate-50 dark:bg-slate-800/40 rounded-2xl" />
              <div className="h-20 bg-slate-50 dark:bg-slate-800/40 rounded-2xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // ERROR STATE
  // ─────────────────────────────────────────────
  if (error && !account) {
    return (
      <div className="min-h-dvh bg-white dark:bg-[#0b131e] text-[#1f2937] dark:text-[#f3f4f6] flex flex-col font-sans">
        <header className="w-full border-b border-slate-100 dark:border-slate-800/80 bg-white/95 dark:bg-[#0b131e]/95 backdrop-blur-md sticky top-0 z-30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-18 flex items-center">
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/logo.png" alt="MED Global Network" className="h-9 w-auto object-contain" />
              <span className="text-xl font-black text-[#102D45] dark:text-[#58a6ff]">MED Global Network</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-red-100 dark:border-red-900/30 p-8 shadow-sm text-center space-y-4">
            <div className="size-14 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="size-7" />
            </div>
            <h2 className="text-xl font-bold text-[#102D45] dark:text-white">Unable to Load Status</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">{error}</p>
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={loadData}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#102D45] hover:bg-[#163f61] text-white text-sm font-semibold transition-all shadow-sm"
              >
                <RefreshCw className="size-4" />
                Retry
              </button>
              <button
                type="button"
                onClick={() => router.push("/feed")}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-white dark:bg-[#0b131e] text-[#1f2937] dark:text-[#f3f4f6] flex flex-col font-sans">
      {/* ─────────────────────────────────────────────
          1. HEADER
          ───────────────────────────────────────────── */}
      <header className="w-full border-b border-slate-100 dark:border-slate-800/80 bg-white/95 dark:bg-[#0b131e]/95 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="MED Global Network"
              className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="text-xl sm:text-[22px] font-black tracking-tight text-[#102D45] dark:text-[#58a6ff] leading-none">
                MED Global Network
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#168B78] dark:text-[#2dd4bf] mt-0.5">
                Healthcare Community
              </span>
            </div>
          </Link>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <CheckCircle2 className="size-3.5" />
            <span>Onboarding Complete</span>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────
          2. MAIN CONTENT
          ───────────────────────────────────────────── */}
      <main className="flex-1 py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Hero Success Illustration & Heading */}
          <div className="text-center space-y-4">
            <div className="relative inline-flex items-center justify-center">
              <div className="size-20 sm:size-24 rounded-3xl bg-gradient-to-tr from-[#168B78]/20 via-[#102D45]/10 to-teal-50 dark:from-[#168B78]/30 dark:to-slate-800 flex items-center justify-center border border-[#168B78]/30 shadow-lg shadow-[#168B78]/10">
                <CheckCircle2 className="size-10 sm:size-12 text-[#168B78] dark:text-[#2dd4bf]" />
              </div>
              <div className="absolute -top-1 -right-1 size-7 rounded-full bg-amber-400 dark:bg-amber-500 text-white flex items-center justify-center shadow-md animate-bounce">
                <Sparkles className="size-3.5 fill-current" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#102D45] dark:text-white tracking-tight">
                You&apos;re all set!
              </h1>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
                Your MED Global Network account has been successfully created. Welcome to the trusted global medical ecosystem.
              </p>
            </div>
          </div>

          {/* ─────────────────────────────────────────────
              3. ACCOUNT SUMMARY CARD
              ───────────────────────────────────────────── */}
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#102D45] dark:text-[#58a6ff]">
                  <UserCheck className="size-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#102D45] dark:text-white">Account Summary</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Authenticated membership credentials</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#102D45]/5 dark:bg-[#58a6ff]/10 text-[#102D45] dark:text-[#58a6ff] text-xs font-bold border border-[#102D45]/10 dark:border-[#58a6ff]/20">
                {account?.accountType || "Individual Account"}
              </span>
            </div>

            {/* Account Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email Status */}
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-2xs">
                    <Mail className="size-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Email Address</div>
                    <div className="text-xs sm:text-sm font-semibold text-[#102D45] dark:text-white break-all">
                      {account?.email || "—"}
                    </div>
                  </div>
                </div>
                <div className="shrink-0">
                  {account?.emailVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold border border-emerald-200 dark:border-emerald-800/40">
                      <CheckCircle2 className="size-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[11px] font-semibold border border-amber-200">
                      Unverified
                    </span>
                  )}
                </div>
              </div>

              {/* Mobile Status */}
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-2xs">
                    <Smartphone className="size-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Mobile Number</div>
                    <div className="text-xs sm:text-sm font-semibold text-[#102D45] dark:text-white">
                      {account?.phone || "—"}
                    </div>
                  </div>
                </div>
                <div className="shrink-0">
                  {account?.phoneVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold border border-emerald-200 dark:border-emerald-800/40">
                      <CheckCircle2 className="size-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[11px] font-semibold border border-amber-200">
                      Unverified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Security Notice: Separation of Contact vs Identity */}
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-sky-50/80 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 text-xs text-sky-900 dark:text-sky-300">
              <ShieldCheck className="size-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="font-semibold">Security Confirmation:</strong> Account creation and contact details (email & mobile) are fully secured. Healthcare identity verification operates independently via regulated credential auditing.
              </p>
            </div>
          </div>

          {/* ─────────────────────────────────────────────
              4. SELECTED HEALTHCARE IDENTITIES
              Each identity rendered separately with verification status
              ───────────────────────────────────────────── */}
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div>
                <h2 className="text-base font-bold text-[#102D45] dark:text-white">Selected Healthcare Roles</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Each healthcare identity maintains its independent verification track
                </p>
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {identities.length} {identities.length === 1 ? "Role" : "Roles"} registered
              </div>
            </div>

            {identities.length === 0 ? (
              <div className="text-center py-6 text-sm text-slate-500 dark:text-slate-400">
                No healthcare identities selected yet. You can add identities anytime from your profile settings.
              </div>
            ) : (
              <div className="space-y-3">
                {identities.map((item) => {
                  const Icon = ICON_MAP[item.id] || Stethoscope;
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-slate-200 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="size-10 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-[#168B78] dark:text-[#2dd4bf] flex items-center justify-center shrink-0 border border-teal-100 dark:border-teal-900/30">
                          <Icon className="size-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#102D45] dark:text-white">{item.title}</span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {item.group}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Independent Verification Status */}
                      <div className="shrink-0 self-start sm:self-center">
                        {item.isVerified ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                            <CheckCircle2 className="size-3.5" />
                            Verified
                          </span>
                        ) : verification?.isReviewPending ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                            <Clock className="size-3.5 animate-pulse" />
                            Under Review
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                            <Clock className="size-3.5 text-slate-400" />
                            Pending Document Verification
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
              <Info className="size-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                Verified healthcare badges and official titles (e.g., Dr., Prof.) are never assigned automatically. They are awarded exclusively after authorized verification review.
              </span>
            </div>
          </div>

          {/* ─────────────────────────────────────────────
              5. DOCUMENT SUBMISSION REMINDER (72-HOUR COUNTDOWN)
              ───────────────────────────────────────────── */}
          <div className="relative overflow-hidden rounded-3xl border border-teal-200 dark:border-teal-900/50 bg-gradient-to-br from-teal-50/70 via-white to-slate-50 dark:from-teal-950/30 dark:via-slate-900 dark:to-[#0b131e] p-6 sm:p-8 shadow-sm">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl -z-0 pointer-events-none" />

            <div className="relative z-10 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#168B78] dark:text-[#2dd4bf]">
                    <ShieldCheck className="size-4" />
                    <span>Identity Document Verification</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#102D45] dark:text-white">
                    Complete your verification
                  </h3>
                </div>

                {/* Status Indicator */}
                {verification?.isApproved ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 text-xs font-bold border border-emerald-300">
                    <CheckCircle2 className="size-4" />
                    Identity Verified
                  </span>
                ) : verification?.isReviewPending ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 text-xs font-bold border border-amber-300">
                    <Clock className="size-4 animate-spin" />
                    Under Review
                  </span>
                ) : isExpired ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-300">
                    <AlertCircle className="size-4" />
                    Priority Window Expired
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-teal-100/80 dark:bg-teal-950/60 text-[#168B78] dark:text-[#2dd4bf] text-xs font-bold border border-teal-300/80">
                    <Clock className="size-4" />
                    72-Hour Priority Window
                  </span>
                )}
              </div>

              {/* Conditional Display: Under Review vs Expired vs Active Countdown */}
              {verification?.isReviewPending ? (
                <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-amber-200/80 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 space-y-1.5">
                  <div className="font-bold text-sm flex items-center gap-2">
                    <Clock className="size-4 text-amber-600 dark:text-amber-400" />
                    Verification Documents Under Review
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    Your verification documents have been received by our clinical credentials committee. Your countdown is completed and you will receive an update once the review is finalised.
                  </p>
                </div>
              ) : isExpired ? (
                <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 space-y-1.5">
                  <div className="font-bold text-sm text-[#102D45] dark:text-white flex items-center gap-2">
                    <ShieldAlert className="size-4 text-slate-500" />
                    Priority Window Elapsed
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    Your 72-hour priority window has elapsed, but don&apos;t worry — your account is <strong>not suspended or deleted</strong>. You can upload your medical or student credentials whenever you are ready to unlock your verified practitioner badge and clinical tools.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Upload your council registration certificate, degree, or institutional identity card within the next <strong>72 hours</strong> for expedited badge issuance.
                  </p>

                  {/* 72-HOUR COUNTDOWN CLOCK CARDS */}
                  <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-md pt-1">
                    <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center shadow-2xs">
                      <div className="text-xl sm:text-2xl font-black text-[#102D45] dark:text-white font-mono">
                        {String(totalHoursLeft).padStart(2, "0")}
                      </div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                        Hours
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center shadow-2xs">
                      <div className="text-xl sm:text-2xl font-black text-[#102D45] dark:text-white font-mono">
                        {String(minutes).padStart(2, "0")}
                      </div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                        Mins
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center shadow-2xs">
                      <div className="text-xl sm:text-2xl font-black text-[#168B78] dark:text-[#2dd4bf] font-mono">
                        {String(seconds).padStart(2, "0")}
                      </div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                        Secs
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-900/60 text-center shadow-2xs flex flex-col justify-center">
                      <span className="text-[10px] font-bold text-[#168B78] dark:text-[#2dd4bf] leading-tight">
                        Priority
                      </span>
                      <span className="text-[9px] text-slate-400">Review</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload CTA Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => router.push("/onboarding/individual/documents")}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#168B78] hover:bg-[#127263] text-white text-sm font-bold shadow-md shadow-[#168B78]/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <UploadCloud className="size-4" />
                  <span>Upload Verification Documents</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────
              6. NAVIGATION BUTTONS (Go to Dashboard & Complete Profile Later)
              ───────────────────────────────────────────── */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-all"
            >
              <span>Complete Profile Later</span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[#102D45] hover:bg-[#163f61] text-white text-sm font-bold shadow-md shadow-[#102D45]/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </main>

      {/* ─────────────────────────────────────────────
          7. FOOTER
          ───────────────────────────────────────────── */}
      <footer className="w-full border-t border-slate-100 dark:border-slate-800/80 py-6 px-4 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} MED Global Network. All rights reserved. Regulated Healthcare Community.</p>
      </footer>
    </div>
  );
}
