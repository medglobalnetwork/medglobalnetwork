"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  FileText,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Eye,
  Trash2,
  Lock,
  Award,
  Building,
  GraduationCap,
  Sparkles,
  AlertTriangle,
  UserCheck,
} from "lucide-react";

interface VerificationDossier {
  identity: {
    id: string;
    user_id: string;
    account_type: "INDIVIDUAL" | "ORGANISATION";
    category: string;
    profession_or_type: string;
    legal_first_name?: string;
    legal_last_name?: string;
    display_name?: string;
    verification_status: string;
    verification_deadline?: string;
    correction_reason?: string;
    correction_fields?: any;
    rejection_reason?: string;
    enrolled_at?: string;
    submitted_at?: string;
    reviewed_at?: string;
  } | null;
  documents: Array<{
    id: string;
    document_type: string;
    file_name: string;
    file_size: number;
    mime_type: string;
    status: string;
    rejection_reason?: string;
    uploaded_at: string;
  }>;
  titles: Array<{
    claimed_title: string;
    verified_title?: string;
    status: string;
  }>;
  qualifications: Array<{
    degree: string;
    institution: string;
    graduation_year?: number;
    status: string;
  }>;
  registrations: Array<{
    council_name: string;
    registration_number: string;
    state_or_jurisdiction?: string;
    status: string;
  }>;
  schemaDocuments: Array<{
    id: string;
    label: string;
    mandatory: boolean;
    description?: string;
  }>;
  progressPercent: number;
  remainingMs: number | null;
}

export default function UserVerificationCenterPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<VerificationDossier | null>(null);
  const [uploadingDocType, setUploadingDocType] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [actionSuccess, setActionSuccess] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

  const fetchVerificationStatus = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/onboarding", { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load verification status:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!isPending && !session) {
      router.replace("/");
      return;
    }
    if (session?.user) {
      fetchVerificationStatus();
    }
  }, [isPending, session, router, fetchVerificationStatus]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setActionError("File size cannot exceed 10MB.");
      return;
    }

    try {
      setUploadingDocType(docType);
      setActionError(null);
      setActionSuccess(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("document_type", docType);

      const res = await fetch("/api/onboarding/documents", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Upload failed");
      }

      setActionSuccess(`Successfully uploaded ${docType.replace(/_/g, " ")}`);
      await fetchVerificationStatus();
    } catch (err: any) {
      setActionError(err.message || "Failed to upload file");
    } finally {
      setUploadingDocType(null);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      setActionError(null);
      const res = await fetch(`/api/onboarding/documents/${docId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to delete document");
      }
      setActionSuccess("Document removed.");
      await fetchVerificationStatus();
    } catch (err: any) {
      setActionError(err.message || "Failed to delete document");
    }
  };

  const handleSubmitForReview = async () => {
    try {
      setSubmitting(true);
      setActionError(null);
      setActionSuccess(null);

      const res = await fetch("/api/onboarding/submit-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to submit for review");
      }

      setActionSuccess("Your verification dossier has been submitted for review!");
      await fetchVerificationStatus();
    } catch (err: any) {
      setActionError(err.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="size-6 animate-spin text-[#0f4c81]" />
      </div>
    );
  }

  const identity = data?.identity;
  const status = identity?.verification_status || "NOT_STARTED";
  const isApproved = status === "APPROVED";
  const isUnderReview = status === "UNDER_REVIEW";
  const isCorrection = status === "CORRECTION_REQUIRED";
  const isExpired = status === "VERIFICATION_INCOMPLETE";
  const isEnrolled = status === "ENROLLED" || status === "DRAFT";

  // Calculate remaining deadline in hours/minutes
  const remainingHours = data?.remainingMs ? Math.floor(data.remainingMs / (1000 * 60 * 60)) : 0;
  const remainingMins = data?.remainingMs
    ? Math.floor((data.remainingMs % (1000 * 60 * 60)) / (1000 * 60))
    : 0;

  // Levels calculation
  const levels = [
    {
      level: 1,
      title: "Level 1: Account Verified",
      desc: "Email address & phone number verified with OTP.",
      isComplete: true,
      badge: "Account Verified",
    },
    {
      level: 2,
      title: "Level 2: Identity Verified",
      desc: "Legal identity matched with government-issued photo identification.",
      isComplete: isApproved,
      badge: "Identity Verified",
    },
    {
      level: 3,
      title: "Level 3: Student Status Verified",
      desc: "Enrollment in an accredited healthcare college / university confirmed.",
      isComplete: isApproved && identity?.category === "student",
      badge: "Student Verified",
      applicable: identity?.category === "student",
    },
    {
      level: 4,
      title: "Level 4: Education Verified",
      desc: "Academic degrees & clinical qualifications verified against institution records.",
      isComplete: isApproved && data?.qualifications?.some((q) => q.status === "VERIFIED"),
      badge: "Education Verified",
      applicable: identity?.account_type === "INDIVIDUAL" && identity?.category !== "student",
    },
    {
      level: 5,
      title: "Level 5: Professional Registration Verified",
      desc: "State or National Healthcare Council licensing registration verified.",
      isComplete: isApproved && data?.registrations?.some((r) => r.status === "VERIFIED"),
      badge: "Registration Verified",
      applicable: identity?.account_type === "INDIVIDUAL" && identity?.category === "healthcare_professional",
    },
    {
      level: 6,
      title: "Level 6: Organization Verified",
      desc: "Clinical establishment license, facility accreditation & authorized representative verified.",
      isComplete: isApproved && identity?.account_type === "ORGANISATION",
      badge: "Organization Verified",
      applicable: identity?.account_type === "ORGANISATION",
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0f4c81] dark:text-[#58a6ff]">
          <ShieldCheck className="size-4" />
          Trust & Identity Engine
        </div>
        <h1 className="mt-1 text-2xl font-bold text-[#171717] dark:text-[#f0f6fc]">
          Verification Center
        </h1>
        <p className="mt-1 text-sm text-[#77716b] dark:text-[#8b949e]">
          Manage your verified professional credentials, multi-level trust badges, and active licenses on MedGlobalNetwork.
        </p>
      </div>

      {/* Action alerts */}
      {actionSuccess && (
        <div className="flex items-center gap-3 rounded-lg border border-[#16804d]/20 bg-[#16804d]/10 px-4 py-3 text-sm text-[#16804d] dark:text-[#3fb950]">
          <CheckCircle2 className="size-5 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="flex items-center gap-3 rounded-lg border border-[#e11d48]/20 bg-[#e11d48]/10 px-4 py-3 text-sm text-[#e11d48] dark:text-[#f85149]">
          <AlertCircle className="size-5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Main Status Banner */}
      <div className="rounded-xl border border-[#e8e6e3] bg-white p-6 shadow-sm dark:border-[#30363d] dark:bg-[#161b22]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${
                isApproved
                  ? "bg-[#16804d]/10 text-[#16804d] dark:text-[#3fb950]"
                  : isUnderReview
                  ? "bg-[#0f4c81]/10 text-[#0f4c81] dark:text-[#58a6ff]"
                  : isCorrection
                  ? "bg-[#b45309]/10 text-[#b45309] dark:text-[#d29922]"
                  : isExpired
                  ? "bg-[#e11d48]/10 text-[#e11d48] dark:text-[#f85149]"
                  : "bg-[#77716b]/10 text-[#77716b] dark:text-[#8b949e]"
              }`}
            >
              {isApproved ? (
                <ShieldCheck className="size-6" />
              ) : isUnderReview ? (
                <Clock className="size-6" />
              ) : isCorrection ? (
                <AlertTriangle className="size-6" />
              ) : (
                <ShieldAlert className="size-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-[#171717] dark:text-[#f0f6fc]">
                  Status:{" "}
                  {isApproved
                    ? "Verified Healthcare Identity"
                    : isUnderReview
                    ? "Under Admin Review"
                    : isCorrection
                    ? "Correction Required"
                    : isExpired
                    ? "Verification Grace Window Expired"
                    : isEnrolled
                    ? "Enrolled (72h Submission Window Active)"
                    : "Not Enrolled"}
                </h2>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    isApproved
                      ? "bg-[#16804d]/15 text-[#16804d] dark:text-[#3fb950]"
                      : isUnderReview
                      ? "bg-[#0f4c81]/15 text-[#0f4c81] dark:text-[#58a6ff]"
                      : isCorrection
                      ? "bg-[#b45309]/15 text-[#b45309] dark:text-[#d29922]"
                      : "bg-[#77716b]/15 text-[#77716b] dark:text-[#8b949e]"
                  }`}
                >
                  {status}
                </span>
              </div>

              <p className="mt-1 text-sm text-[#77716b] dark:text-[#8b949e]">
                {isApproved
                  ? "Your identity and credentials have been verified by the MGN Trust Operations Center."
                  : isUnderReview
                  ? "Your application and uploaded documents are currently being audited by our verification team."
                  : isCorrection
                  ? "Some submitted documents require replacement or correction before approval."
                  : isExpired
                  ? "Your 72-hour onboarding window has passed. Please upload the required documents to restore full platform access."
                  : "Complete your onboarding verification to unlock all features across Network, Learn, Jobs, and Events."}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {status === "NOT_STARTED" ? (
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 rounded-lg bg-[#0f4c81] px-4 py-2 text-sm font-medium text-white hover:bg-[#14559b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81]"
              >
                Start Verification
                <ChevronRight className="size-4" />
              </Link>
            ) : isCorrection || isEnrolled || isExpired ? (
              <button
                onClick={handleSubmitForReview}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-[#0f4c81] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#14559b] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81]"
              >
                {submitting ? (
                  <RefreshCw className="size-4 animate-spin" />
                ) : (
                  <UploadCloud className="size-4" />
                )}
                Submit for Verification
              </button>
            ) : (
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 rounded-lg border border-[#e8e6e3] bg-[#faf9f8] px-4 py-2 text-sm font-medium text-[#171717] hover:bg-[#f0efee] dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#f0f6fc] dark:hover:bg-[#30363d]"
              >
                Edit Dossier
              </Link>
            )}
          </div>
        </div>

        {/* 72-Hour Deadline Timer */}
        {(isEnrolled || isCorrection) && data?.remainingMs !== null && (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-[#0f4c81]/20 bg-[#0f4c81]/5 px-4 py-2.5 text-xs text-[#0f4c81] dark:border-[#58a6ff]/20 dark:bg-[#58a6ff]/10 dark:text-[#58a6ff]">
            <div className="flex items-center gap-2 font-medium">
              <Clock className="size-4 shrink-0" />
              <span>
                72-Hour Onboarding Grace Window: <strong>{remainingHours}h {remainingMins}m remaining</strong>
              </span>
            </div>
            <span className="text-[#77716b] dark:text-[#8b949e]">
              Full network access is active during this period
            </span>
          </div>
        )}

        {/* Correction Alert Box */}
        {isCorrection && identity?.correction_reason && (
          <div className="mt-4 rounded-lg border border-[#b45309]/30 bg-[#b45309]/10 p-4 text-sm text-[#b45309] dark:border-[#d29922]/30 dark:text-[#d29922]">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="size-4" />
              Action Required from Reviewer:
            </div>
            <p className="mt-1 font-normal text-[#171717] dark:text-[#f0f6fc]">
              {identity.correction_reason}
            </p>
          </div>
        )}
      </div>

      {/* Verification Level Progression Matrix */}
      <div className="rounded-xl border border-[#e8e6e3] bg-white p-6 shadow-sm dark:border-[#30363d] dark:bg-[#161b22]">
        <h3 className="text-base font-semibold text-[#171717] dark:text-[#f0f6fc]">
          Multi-Level Verification Hierarchy
        </h3>
        <p className="mt-1 text-xs text-[#77716b] dark:text-[#8b949e]">
          MGN awards distinct verified trust badges reflecting concrete evidence layers rather than a generic boolean status.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {levels.map((lvl) => {
            const isApplicable = lvl.applicable !== false;
            return (
              <div
                key={lvl.level}
                className={`flex flex-col justify-between rounded-lg border p-4 transition-colors ${
                  lvl.isComplete
                    ? "border-[#16804d]/30 bg-[#16804d]/5 dark:border-[#3fb950]/30 dark:bg-[#3fb950]/5"
                    : isApplicable
                    ? "border-[#e8e6e3] bg-[#faf9f8] dark:border-[#30363d] dark:bg-[#21262d]"
                    : "border-dashed border-[#e8e6e3] opacity-40 dark:border-[#30363d]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#77716b] dark:text-[#8b949e]">
                      Level {lvl.level}
                    </span>
                    {lvl.isComplete ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#16804d]/20 px-2 py-0.5 text-[11px] font-semibold text-[#16804d] dark:text-[#3fb950]">
                        <CheckCircle2 className="size-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#77716b]/10 px-2 py-0.5 text-[11px] font-medium text-[#77716b] dark:text-[#8b949e]">
                        {isApplicable ? "Pending" : "N/A"}
                      </span>
                    )}
                  </div>
                  <h4 className="mt-2 text-sm font-semibold text-[#171717] dark:text-[#f0f6fc]">
                    {lvl.badge}
                  </h4>
                  <p className="mt-1 text-xs text-[#77716b] dark:text-[#8b949e]">
                    {lvl.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Required & Uploaded Documents Section */}
      <div className="rounded-xl border border-[#e8e6e3] bg-white p-6 shadow-sm dark:border-[#30363d] dark:bg-[#161b22]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-[#171717] dark:text-[#f0f6fc]">
              Evidence & Verification Documents
            </h3>
            <p className="mt-1 text-xs text-[#77716b] dark:text-[#8b949e]">
              Upload genuine certificates, council registrations, and institutional identification.
            </p>
          </div>

          <Link
            href="/onboarding"
            className="text-xs font-medium text-[#0f4c81] hover:underline dark:text-[#58a6ff]"
          >
            Full Onboarding Wizard →
          </Link>
        </div>

        {/* Schema Requirement Cards */}
        <div className="mt-4 space-y-3">
          {data?.schemaDocuments && data.schemaDocuments.length > 0 ? (
            data.schemaDocuments.map((req) => {
              const uploaded = data.documents?.find((d) => d.document_type === req.id);
              const isRejected = uploaded?.status === "REJECTED";
              const isDocVerified = uploaded?.status === "VERIFIED";

              return (
                <div
                  key={req.id}
                  className={`flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between ${
                    isRejected
                      ? "border-[#e11d48]/30 bg-[#e11d48]/5 dark:border-[#f85149]/30"
                      : isDocVerified
                      ? "border-[#16804d]/30 bg-[#16804d]/5 dark:border-[#3fb950]/30"
                      : uploaded
                      ? "border-[#0f4c81]/30 bg-[#0f4c81]/5 dark:border-[#58a6ff]/30"
                      : "border-[#e8e6e3] bg-[#faf9f8] dark:border-[#30363d] dark:bg-[#21262d]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                        isDocVerified
                          ? "bg-[#16804d]/20 text-[#16804d] dark:text-[#3fb950]"
                          : isRejected
                          ? "bg-[#e11d48]/20 text-[#e11d48] dark:text-[#f85149]"
                          : uploaded
                          ? "bg-[#0f4c81]/20 text-[#0f4c81] dark:text-[#58a6ff]"
                          : "bg-[#77716b]/10 text-[#77716b] dark:text-[#8b949e]"
                      }`}
                    >
                      <FileText className="size-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#171717] dark:text-[#f0f6fc]">
                          {req.label}
                        </span>
                        {req.mandatory && (
                          <span className="rounded bg-[#e11d48]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#e11d48] dark:text-[#f85149]">
                            Required
                          </span>
                        )}
                        {uploaded && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              isDocVerified
                                ? "bg-[#16804d]/20 text-[#16804d] dark:text-[#3fb950]"
                                : isRejected
                                ? "bg-[#e11d48]/20 text-[#e11d48] dark:text-[#f85149]"
                                : "bg-[#0f4c81]/20 text-[#0f4c81] dark:text-[#58a6ff]"
                            }`}
                          >
                            {uploaded.status}
                          </span>
                        )}
                      </div>

                      <p className="mt-0.5 text-xs text-[#77716b] dark:text-[#8b949e]">
                        {uploaded ? (
                          <>
                            File: <strong>{uploaded.file_name}</strong> ({(uploaded.file_size / 1024).toFixed(0)} KB)
                          </>
                        ) : (
                          req.description || "PDF or high-resolution JPG/PNG"
                        )}
                      </p>

                      {isRejected && uploaded?.rejection_reason && (
                        <p className="mt-1 text-xs font-medium text-[#e11d48] dark:text-[#f85149]">
                          Reason for rejection: {uploaded.rejection_reason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {uploaded ? (
                      <>
                        <a
                          href={`/api/onboarding/documents/${uploaded.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e6e3] bg-white px-3 py-1.5 text-xs font-medium text-[#171717] hover:bg-[#faf9f8] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#f0f6fc] dark:hover:bg-[#21262d]"
                        >
                          <Eye className="size-3.5" />
                          View
                        </a>

                        {!isApproved && (
                          <button
                            onClick={() => handleDeleteDocument(uploaded.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#e11d48]/20 bg-white px-3 py-1.5 text-xs font-medium text-[#e11d48] hover:bg-[#e11d48]/10 dark:bg-[#161b22] dark:text-[#f85149]"
                          >
                            <Trash2 className="size-3.5" />
                            Remove
                          </button>
                        )}
                      </>
                    ) : (
                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#0f4c81] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#14559b]">
                        {uploadingDocType === req.id ? (
                          <RefreshCw className="size-3.5 animate-spin" />
                        ) : (
                          <UploadCloud className="size-3.5" />
                        )}
                        Upload
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.webp"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, req.id)}
                        />
                      </label>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-lg border border-dashed border-[#e8e6e3] p-8 text-center text-xs text-[#77716b] dark:border-[#30363d] dark:text-[#8b949e]">
              Start your onboarding to see required document slots for your profession.
            </div>
          )}
        </div>
      </div>

      {/* Claimed Credentials & Registration Card */}
      {identity && (
        <div className="rounded-xl border border-[#e8e6e3] bg-white p-6 shadow-sm dark:border-[#30363d] dark:bg-[#161b22]">
          <h3 className="text-base font-semibold text-[#171717] dark:text-[#f0f6fc]">
            Profile & Credential Dossier
          </h3>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="rounded-lg bg-[#faf9f8] p-3 dark:bg-[#21262d]">
              <span className="text-[11px] font-semibold uppercase text-[#77716b] dark:text-[#8b949e]">
                Account Category
              </span>
              <p className="mt-1 text-sm font-medium text-[#171717] dark:text-[#f0f6fc] capitalize">
                {identity.category?.replace(/_/g, " ") || "Not set"} ({identity.account_type})
              </p>
            </div>

            <div className="rounded-lg bg-[#faf9f8] p-3 dark:bg-[#21262d]">
              <span className="text-[11px] font-semibold uppercase text-[#77716b] dark:text-[#8b949e]">
                Profession / Designation
              </span>
              <p className="mt-1 text-sm font-medium text-[#171717] dark:text-[#f0f6fc] capitalize">
                {identity.profession_or_type?.replace(/_/g, " ") || "Not set"}
              </p>
            </div>

            <div className="rounded-lg bg-[#faf9f8] p-3 dark:bg-[#21262d]">
              <span className="text-[11px] font-semibold uppercase text-[#77716b] dark:text-[#8b949e]">
                Professional Title
              </span>
              <p className="mt-1 text-sm font-medium text-[#171717] dark:text-[#f0f6fc]">
                {data?.titles?.[0]?.claimed_title || "None claimed"} (
                {data?.titles?.[0]?.status === "VERIFIED" ? (
                  <span className="text-[#16804d] dark:text-[#3fb950] font-semibold">Verified</span>
                ) : (
                  "Claimed"
                )}
                )
              </p>
            </div>

            {data?.registrations && data.registrations.length > 0 && (
              <div className="rounded-lg bg-[#faf9f8] p-3 dark:bg-[#21262d]">
                <span className="text-[11px] font-semibold uppercase text-[#77716b] dark:text-[#8b949e]">
                  Council Registration
                </span>
                <p className="mt-1 text-sm font-medium text-[#171717] dark:text-[#f0f6fc]">
                  {data.registrations[0].registration_number} ({data.registrations[0].council_name})
                </p>
              </div>
            )}

            {data?.qualifications && data.qualifications.length > 0 && (
              <div className="rounded-lg bg-[#faf9f8] p-3 dark:bg-[#21262d]">
                <span className="text-[11px] font-semibold uppercase text-[#77716b] dark:text-[#8b949e]">
                  Primary Qualification
                </span>
                <p className="mt-1 text-sm font-medium text-[#171717] dark:text-[#f0f6fc]">
                  {data.qualifications[0].degree} — {data.qualifications[0].institution}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
