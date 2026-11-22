"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  FileText,
  ShieldCheck,
  ShieldAlert,
  Bell,
  Mail,
  Smartphone,
  ExternalLink,
  Sparkles,
  Info,
  RefreshCw,
  Eye,
  Check,
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
} from "lucide-react";

interface UploadedDocSummary {
  id: string;
  documentType: string;
  documentLabel: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  status: string;
  rejectionReason: string | null;
  uploadedAt: string;
}

interface IdentityConfirmationCard {
  identityKey: string;
  title: string;
  group: string;
  status: "NOT_SUBMITTED" | "INCOMPLETE" | "SUBMITTED" | "UNDER_REVIEW" | "ADDITIONAL_INFORMATION_REQUIRED" | "REJECTED" | "APPROVED";
  documents: UploadedDocSummary[];
  mandatoryCount: number;
  uploadedMandatoryCount: number;
  hasMissingMandatory: boolean;
  reviewNotes: string | null;
}

interface SubmissionPayload {
  submissionId: string;
  submittedAt: string;
  totalDocumentsSubmitted: number;
  overallStatus: string;
  isPartialSubmission: boolean;
}

interface UserSummary {
  id: string;
  fullName: string;
  email: string;
  emailVerified: boolean;
  phone: string;
  notifications: {
    emailAlerts: boolean;
    inAppAlerts: boolean;
  };
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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function VerificationConfirmationPage() {
  const router = useRouter();

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [submission, setSubmission] = React.useState<SubmissionPayload | null>(null);
  const [user, setUser] = React.useState<UserSummary | null>(null);
  const [identities, setIdentities] = React.useState<IdentityConfirmationCard[]>([]);

  // Notification toggles
  const [emailAlerts, setEmailAlerts] = React.useState(true);
  const [inAppAlerts, setInAppAlerts] = React.useState(true);

  // ─────────────────────────────────────────────
  // FETCH SERVER-SIDE SUBMISSION CONFIRMATION
  // ─────────────────────────────────────────────
  const loadConfirmationData = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let targetUserId = "";
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("mgn_onboarding_registered_user");
        if (stored) {
          try {
            const p = JSON.parse(stored);
            if (p.userId) targetUserId = p.userId;
          } catch {}
        }
      }

      const url = targetUserId
        ? `/api/onboarding/documents/confirmation?userId=${encodeURIComponent(targetUserId)}`
        : "/api/onboarding/documents/confirmation";

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load submission confirmation.");
      }

      setSubmission(data.submission);
      setUser(data.user);
      setIdentities(data.identityCards || []);
      if (data.user?.notifications) {
        setEmailAlerts(data.user.notifications.emailAlerts);
        setInAppAlerts(data.user.notifications.inAppAlerts);
      }
    } catch (err: any) {
      console.error("Error loading verification confirmation:", err);
      setError(err.message || "Failed to retrieve submission details. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadConfirmationData();
  }, [loadConfirmationData]);

  // ─────────────────────────────────────────────
  // RENDER PER-IDENTITY STATUS BADGE
  // ─────────────────────────────────────────────
  const renderIdentityStatusBadge = (status: IdentityConfirmationCard["status"]) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <CheckCircle2 className="size-3.5" />
            Approved
          </span>
        );
      case "UNDER_REVIEW":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-300 text-xs font-bold">
            <Clock className="size-3.5 animate-pulse" />
            Under Review
          </span>
        );
      case "SUBMITTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/40 text-sky-700 dark:text-sky-300 text-xs font-bold">
            <Check className="size-3.5" />
            Submitted
          </span>
        );
      case "INCOMPLETE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/40 text-orange-700 dark:text-orange-300 text-xs font-bold">
            <AlertCircle className="size-3.5" />
            Incomplete
          </span>
        );
      case "ADDITIONAL_INFORMATION_REQUIRED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-300 text-amber-800 dark:text-amber-200 text-xs font-bold">
            <AlertTriangle className="size-3.5" />
            Clarification Requested
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 text-xs font-bold">
            <XCircle className="size-3.5" />
            Action Required: Rejected
          </span>
        );
      case "NOT_SUBMITTED":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold">
            <Clock className="size-3.5 text-slate-400" />
            Not Submitted
          </span>
        );
    }
  };

  // ─────────────────────────────────────────────
  // LOADING STATE
  // ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-dvh bg-white dark:bg-[#0b131e] text-[#1f2937] dark:text-[#f3f4f6] flex flex-col font-sans">
        <header className="w-full border-b border-slate-100 dark:border-slate-800/80 bg-white/95 dark:bg-[#0b131e]/95 backdrop-blur-md sticky top-0 z-30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="MED Global Network" className="h-9 w-auto object-contain" />
              <span className="text-xl font-black text-[#102D45] dark:text-[#58a6ff]">MED Global Network</span>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-3xl w-full mx-auto p-6 space-y-6 animate-pulse">
          <div className="size-20 rounded-3xl bg-slate-100 dark:bg-slate-800 mx-auto" />
          <div className="h-8 w-64 bg-slate-100 dark:bg-slate-800 rounded mx-auto" />
          <div className="h-4 w-96 bg-slate-100 dark:bg-slate-800 rounded mx-auto" />
          <div className="h-48 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-slate-800" />
          <div className="h-48 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-slate-800" />
        </main>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // ERROR STATE
  // ─────────────────────────────────────────────
  if (error && !submission) {
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
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-red-100 dark:border-red-900/40 p-8 shadow-sm text-center space-y-4">
            <div className="size-14 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="size-7" />
            </div>
            <h2 className="text-xl font-bold text-[#102D45] dark:text-white">Unable to Load Submission</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">{error}</p>
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={loadConfirmationData}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#102D45] text-white text-xs font-semibold shadow-xs hover:bg-[#163f61]"
              >
                <RefreshCw className="size-3.5" />
                Retry
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Dashboard
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

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="text-xs font-semibold text-[#102D45] dark:text-[#58a6ff] hover:underline"
          >
            Go to Dashboard →
          </button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────
          2. MAIN CONTENT
          ───────────────────────────────────────────── */}
      <main className="flex-1 py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Hero Header & Successful Submission Indicator */}
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
                Documents Submitted!
              </h1>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
                Your documents have been successfully submitted for verification.
              </p>
            </div>
          </div>

          {/* ─────────────────────────────────────────────
              3. SUBMISSION SUMMARY CARD
              Server-authoritative actual data (never hardcoded)
              ───────────────────────────────────────────── */}
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-[#168B78] dark:text-[#2dd4bf] flex items-center justify-center">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#102D45] dark:text-white">Submission Summary</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Authenticated verification dossier</p>
                </div>
              </div>

              {submission?.isPartialSubmission ? (
                <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-200">
                  Partial Submission
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200">
                  All Roles Submitted
                </span>
              )}
            </div>

            {/* Actual Server Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Submission ID */}
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 space-y-1">
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Submission ID</div>
                <div className="text-sm font-mono font-bold text-[#102D45] dark:text-white break-all">
                  {submission?.submissionId || "SUB-PENDING"}
                </div>
              </div>

              {/* Timestamp */}
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 space-y-1">
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Submission Timestamp</div>
                <div className="text-xs sm:text-sm font-semibold text-[#102D45] dark:text-white">
                  {submission?.submittedAt ? formatDate(submission.submittedAt) : "Just now"}
                </div>
              </div>

              {/* Documents Submitted */}
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 space-y-1">
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Documents Submitted</div>
                <div className="text-sm font-bold text-[#168B78] dark:text-[#2dd4bf]">
                  {submission?.totalDocumentsSubmitted ?? 0} Document(s)
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────
              4. IDENTITY STATUS CARDS
              Separate card for every selected identity with uploaded document details
              ───────────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base font-bold text-[#102D45] dark:text-white">
                Individual Identity Status
              </h2>
              <span className="text-xs text-slate-500">
                {identities.length} {identities.length === 1 ? "Role" : "Roles"} tracked
              </span>
            </div>

            <div className="space-y-4">
              {identities.map((card) => {
                const Icon = ICON_MAP[card.identityKey] || Stethoscope;

                return (
                  <div
                    key={card.identityKey}
                    className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4"
                  >
                    {/* Role Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3.5">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-[#168B78] dark:text-[#2dd4bf] flex items-center justify-center shrink-0 border border-teal-100 dark:border-teal-900/30">
                          <Icon className="size-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-[#102D45] dark:text-white">{card.title}</h3>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {card.group}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {card.uploadedMandatoryCount} of {card.mandatoryCount} mandatory requirements uploaded
                          </p>
                        </div>
                      </div>

                      <div className="self-start sm:self-center">
                        {renderIdentityStatusBadge(card.status)}
                      </div>
                    </div>

                    {/* Reviewer Feedback / Clarification Notes if any */}
                    {card.reviewNotes && (
                      <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-800 dark:text-rose-200 text-xs space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-rose-700 dark:text-rose-300">
                          <AlertTriangle className="size-3.5" />
                          Reviewer Request
                        </div>
                        <p>{card.reviewNotes}</p>
                      </div>
                    )}

                    {/* Uploaded Documents List */}
                    {card.documents.length === 0 ? (
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex items-center justify-between">
                        <span>No documents uploaded yet for this role.</span>
                        <button
                          type="button"
                          onClick={() => router.push("/onboarding/individual/documents")}
                          className="text-xs font-semibold text-[#168B78] hover:underline"
                        >
                          Upload Now →
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                          Attached Verification Documents
                        </div>
                        <div className="space-y-1.5">
                          {card.documents.map((doc) => (
                            <div
                              key={doc.id}
                              className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2.5 truncate pr-3">
                                <FileText className="size-4 text-[#168B78] dark:text-[#2dd4bf] shrink-0" />
                                <div className="truncate">
                                  <span className="font-semibold text-[#102D45] dark:text-white mr-1.5 truncate">
                                    {doc.documentLabel}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    ({doc.fileName} • {formatFileSize(doc.fileSize)})
                                  </span>
                                </div>
                              </div>

                              <div className="shrink-0 flex items-center gap-2">
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                  {doc.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─────────────────────────────────────────────
              5. WHAT HAPPENS NEXT? (NO FALSE FIXED-TIME PROMISES)
              ───────────────────────────────────────────── */}
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-5">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-[#102D45] dark:text-white">What Happens Next?</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Transparent overview of our clinical compliance audit workflow
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Step 1 */}
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 space-y-2">
                <div className="size-7 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-[#168B78] dark:text-[#2dd4bf] text-xs font-bold flex items-center justify-center">
                  1
                </div>
                <h3 className="text-xs font-bold text-[#102D45] dark:text-white">
                  Document Review
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Our verification officers cross-reference submitted registration numbers and qualifications against regulatory medical databases.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 space-y-2">
                <div className="size-7 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-[#168B78] dark:text-[#2dd4bf] text-xs font-bold flex items-center justify-center">
                  2
                </div>
                <h3 className="text-xs font-bold text-[#102D45] dark:text-white">
                  Clarification (If Needed)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  If document scans are blurred or need verification letter updates, you will receive an alert with direct re-upload instructions.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 space-y-2">
                <div className="size-7 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-[#168B78] dark:text-[#2dd4bf] text-xs font-bold flex items-center justify-center">
                  3
                </div>
                <h3 className="text-xs font-bold text-[#102D45] dark:text-white">
                  Badge Activation
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Approved identities receive their official blue verified badge and unlock privileged prescribing & CME hosting tools.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-sky-50/80 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 text-[11px] text-sky-900 dark:text-sky-300 flex items-start gap-2.5">
              <Info className="size-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                Review time depends on statutory council response times. MED Global Network maintains strict regulatory compliance and never issues automated unverified approvals.
              </span>
            </div>
          </div>

          {/* ─────────────────────────────────────────────
              6. NOTIFICATIONS PREFERENCES & STATUS
              ───────────────────────────────────────────── */}
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#102D45] dark:text-[#58a6ff]">
                <Bell className="size-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#102D45] dark:text-white">Notification Status</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  How you will be alerted when verification decisions occur
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {/* Email Alerts */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="size-4 text-slate-500" />
                  <div>
                    <div className="text-xs font-semibold text-[#102D45] dark:text-white">
                      Email Notifications
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Dispatched to {user?.email || "your registered email"} upon status changes
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200">
                  <Check className="size-3" />
                  <span>Active</span>
                </div>
              </div>

              {/* In-App Alerts */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="size-4 text-slate-500" />
                  <div>
                    <div className="text-xs font-semibold text-[#102D45] dark:text-white">
                      In-App Dashboard Alerts
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Real-time bell notification and badge status alerts inside your member feed
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200">
                  <Check className="size-3" />
                  <span>Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────
              7. ACTION BUTTONS
              ───────────────────────────────────────────── */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => router.push("/onboarding/individual/documents")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-all"
            >
              <Eye className="size-4" />
              <span>Track Verification Status</span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[#102D45] hover:bg-[#163f61] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#102D45]/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </main>

      {/* ─────────────────────────────────────────────
          8. FOOTER
          ───────────────────────────────────────────── */}
      <footer className="w-full border-t border-slate-100 dark:border-slate-800/80 py-6 px-4 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} MED Global Network. Regulated Healthcare Member System.</p>
      </footer>
    </div>
  );
}
