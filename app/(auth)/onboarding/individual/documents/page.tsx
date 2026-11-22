"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Trash2,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Info,
  RefreshCw,
  Loader2,
  Lock,
  Eye,
  AlertTriangle,
  GraduationCap,
  Award,
  Stethoscope,
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
  Check,
} from "lucide-react";

interface UploadedDocument {
  id: string;
  documentType: string;
  documentLabel: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  status: string;
  rejectionReason?: string | null;
  uploadedAt: string;
  previewUrl: string;
}

interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  mandatory: boolean;
  acceptedFormats: string[];
  maxSizeMB: number;
}

interface IdentitySection {
  identityKey: string;
  status: "NOT_SUBMITTED" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "ADDITIONAL_INFORMATION_REQUIRED";
  requirements: DocumentRequirement[];
  uploadedDocuments: UploadedDocument[];
  hasAllMandatory: boolean;
  mandatoryCount: number;
  uploadedMandatoryCount: number;
}

const IDENTITY_METADATA: Record<string, { title: string; group: string; icon: React.ComponentType<{ className?: string }> }> = {
  student: { title: "Student", group: "Education & Learning", icon: GraduationCap },
  intern_trainee: { title: "Intern / Trainee", group: "Education & Learning", icon: Award },
  doctor: { title: "Doctor", group: "Healthcare Professionals", icon: Stethoscope },
  nurse: { title: "Nurse", group: "Healthcare Professionals", icon: HeartPulse },
  pharmacist: { title: "Pharmacist", group: "Healthcare Professionals", icon: Pill },
  physiotherapist: { title: "Physiotherapist", group: "Healthcare Professionals", icon: Activity },
  paramedical: { title: "Paramedical Professional", group: "Healthcare Professionals", icon: Ambulance },
  allied_health: { title: "Allied Healthcare Professional", group: "Healthcare Professionals", icon: Users },
  researcher: { title: "Researcher", group: "Research & Academia", icon: Microscope },
  faculty: { title: "Faculty / Academician", group: "Research & Academia", icon: BookOpen },
  business_owner: { title: "Healthcare Business Owner", group: "Healthcare Business", icon: Building2 },
  service_provider: { title: "Healthcare Service Provider", group: "Healthcare Business", icon: Briefcase },
  other_healthcare: { title: "Other Healthcare Identity", group: "Healthcare", icon: Shield },
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function IdentityDocumentsVerificationPage() {
  const router = useRouter();

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [identitySections, setIdentitySections] = React.useState<IdentitySection[]>([]);
  const [activeUploads, setActiveUploads] = React.useState<Record<string, { progress: number; fileName: string }>>({});
  const [uploadErrors, setUploadErrors] = React.useState<Record<string, string>>({});

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  const [submittingTarget, setSubmittingTarget] = React.useState<string | null>(null); // null = submit all
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitSuccessNotice, setSubmitSuccessNotice] = React.useState<string | null>(null);

  // Hidden file input refs mapped by identityKey_requirementId
  const fileInputRefs = React.useRef<Record<string, HTMLInputElement | null>>({});

  // ─────────────────────────────────────────────
  // LOAD DYNAMIC SPECIFICATIONS & EXISTING UPLOADS
  // ─────────────────────────────────────────────
  const loadData = React.useCallback(async () => {
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
        ? `/api/onboarding/documents?userId=${encodeURIComponent(targetUserId)}`
        : "/api/onboarding/documents";

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load document verification specifications.");
      }

      setIdentitySections(data.identitySections || []);
    } catch (err: any) {
      console.error("Error loading documents page:", err);
      setError(err.message || "Failed to connect to verification services.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // ─────────────────────────────────────────────
  // HANDLE FILE SELECTION & VALIDATION
  // ─────────────────────────────────────────────
  const handleFileChange = async (
    identityKey: string,
    requirement: DocumentRequirement,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const uploadKey = `${identityKey}_${requirement.id}`;
    setUploadErrors((prev) => ({ ...prev, [uploadKey]: "" }));

    // 1. Client-Side Validation
    if (file.size > requirement.maxSizeMB * 1024 * 1024) {
      setUploadErrors((prev) => ({
        ...prev,
        [uploadKey]: `File exceeds maximum allowed size of ${requirement.maxSizeMB}MB.`,
      }));
      return;
    }

    const accepted = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!accepted.includes(file.type)) {
      setUploadErrors((prev) => ({
        ...prev,
        [uploadKey]: "Invalid format. Only PDF, JPG, and PNG files are accepted.",
      }));
      return;
    }

    // 2. Simulated Upload Progress & Dispatch
    setActiveUploads((prev) => ({
      ...prev,
      [uploadKey]: { progress: 20, fileName: file.name },
    }));

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

      const formData = new FormData();
      formData.append("file", file);
      formData.append("identity_type", identityKey);
      formData.append("document_type", requirement.id);
      formData.append("document_label", requirement.name);
      if (targetUserId) formData.append("user_id", targetUserId);

      setActiveUploads((prev) => ({
        ...prev,
        [uploadKey]: { progress: 60, fileName: file.name },
      }));

      const res = await fetch("/api/onboarding/documents", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload failed. Please try again.");
      }

      setActiveUploads((prev) => ({
        ...prev,
        [uploadKey]: { progress: 100, fileName: file.name },
      }));

      // Reload state after short completion pulse
      setTimeout(() => {
        setActiveUploads((prev) => {
          const next = { ...prev };
          delete next[uploadKey];
          return next;
        });
        loadData();
      }, 500);
    } catch (err: any) {
      setUploadErrors((prev) => ({
        ...prev,
        [uploadKey]: err.message || "Upload failed due to network error.",
      }));
      setActiveUploads((prev) => {
        const next = { ...prev };
        delete next[uploadKey];
        return next;
      });
    } finally {
      // Clear input so same file can be re-selected if needed
      event.target.value = "";
    }
  };

  // ─────────────────────────────────────────────
  // REMOVE DOCUMENT
  // ─────────────────────────────────────────────
  const handleDeleteDocument = async (docId: string, uploadKey: string) => {
    try {
      const res = await fetch(`/api/onboarding/documents/${docId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to remove document.");
      }

      await loadData();
    } catch (err: any) {
      setUploadErrors((prev) => ({
        ...prev,
        [uploadKey]: err.message || "Failed to delete document.",
      }));
    }
  };

  // ─────────────────────────────────────────────
  // SUBMISSION LOGIC (CONFIRMATION & AUDIT DISPATCH)
  // ─────────────────────────────────────────────
  const initiateSubmission = (targetIdentityKey: string | null) => {
    setSubmittingTarget(targetIdentityKey);
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    setSubmitSuccessNotice(null);

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

      const res = await fetch("/api/onboarding/documents/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identityType: submittingTarget || undefined,
          userId: targetUserId || undefined,
        }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit verification request.");
      }

      setShowConfirmModal(false);
      setSubmitSuccessNotice(data.message || "Documents successfully submitted for verification review!");
      // Navigate to Page 9 (Verification Submission Confirmation)
      setTimeout(() => {
        router.push("/onboarding/individual/documents/confirmation");
      }, 600);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Submission error. Please ensure required documents are uploaded.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────
  // STATUS BADGE RENDERER
  // ─────────────────────────────────────────────
  const renderStatusBadge = (status: IdentitySection["status"]) => {
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
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 text-xs font-bold">
            <XCircle className="size-3.5" />
            Action Required: Rejected
          </span>
        );
      case "ADDITIONAL_INFORMATION_REQUIRED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-300 text-amber-800 dark:text-amber-200 text-xs font-bold">
            <AlertTriangle className="size-3.5" />
            Clarification Requested
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
  // LOADING SKELETON
  // ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-dvh bg-white dark:bg-[#0b131e] text-[#1f2937] dark:text-[#f3f4f6] flex flex-col font-sans">
        <header className="w-full border-b border-slate-100 dark:border-slate-800/80 bg-white/95 dark:bg-[#0b131e]/95 backdrop-blur-md sticky top-0 z-30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="MED Global Network" className="h-9 w-auto object-contain" />
              <span className="text-xl font-black text-[#102D45] dark:text-[#58a6ff]">MED Global Network</span>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6 animate-pulse">
          <div className="h-8 w-64 bg-slate-100 dark:bg-slate-800 rounded-lg" />
          <div className="h-4 w-96 bg-slate-100 dark:bg-slate-800 rounded" />
          <div className="space-y-4 pt-4">
            <div className="h-56 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-slate-800" />
            <div className="h-56 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-slate-800" />
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
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

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/feed")}
              className="hidden sm:inline-flex text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => router.push("/onboarding/individual/complete")}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Skip for Now
            </button>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────
          2. MAIN CONTENT
          ───────────────────────────────────────────── */}
      <main className="flex-1 py-10 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Top Title & Subtitle */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/40 text-[#168B78] dark:text-[#2dd4bf] text-xs font-bold border border-teal-200/80 dark:border-teal-800/40">
              <ShieldCheck className="size-3.5" />
              <span>Identity Document Verification</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102D45] dark:text-white tracking-tight">
              Upload Verification Documents
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Submit your qualifying credentials to verify your selected healthcare identities. Only sections matching your selected roles are shown.
            </p>
          </div>

          {/* Success Banner */}
          {submitSuccessNotice && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm font-medium">{submitSuccessNotice}</div>
            </div>
          )}

          {/* Privacy & Security Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 flex items-start gap-3.5 text-xs text-sky-900 dark:text-sky-200">
            <Lock className="size-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-sky-950 dark:text-sky-100">
                Encrypted & Private Healthcare Storage
              </p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                All uploaded documents are encrypted in private object storage and accessed strictly by certified medical verification officers. Your documents are <strong>never publicly visible</strong> on member profiles. Aadhaar is not mandatory.
              </p>
            </div>
          </div>

          {/* ─────────────────────────────────────────────
              3. DYNAMIC IDENTITY CARDS & UPLOAD SECTIONS
              ───────────────────────────────────────────── */}
          {identitySections.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <Info className="size-8 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-[#102D45] dark:text-white">No Healthcare Identities Selected</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                You haven&apos;t selected any healthcare roles yet. Please choose your roles on the identity page to configure document requirements.
              </p>
              <button
                type="button"
                onClick={() => router.push("/onboarding/individual/identity")}
                className="px-4 py-2 rounded-xl bg-[#102D45] text-white text-xs font-semibold"
              >
                Go to Identity Selection
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {identitySections.map((section) => {
                const meta = IDENTITY_METADATA[section.identityKey] || {
                  title: section.identityKey.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
                  group: "Healthcare",
                  icon: Stethoscope,
                };
                const Icon = meta.icon;

                return (
                  <div
                    key={section.identityKey}
                    className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-6 transition-all"
                  >
                    {/* Identity Section Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                      <div className="flex items-center gap-3.5">
                        <div className="size-11 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-[#168B78] dark:text-[#2dd4bf] flex items-center justify-center shrink-0 border border-teal-100 dark:border-teal-900/30">
                          <Icon className="size-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-base sm:text-lg font-bold text-[#102D45] dark:text-white">
                              {meta.title}
                            </h2>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {meta.group}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {section.uploadedMandatoryCount} of {section.mandatoryCount} mandatory documents uploaded
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        {renderStatusBadge(section.status)}
                      </div>
                    </div>

                    {/* Requirements & Upload Cards */}
                    <div className="space-y-4">
                      {section.requirements.map((req) => {
                        const uploadKey = `${section.identityKey}_${req.id}`;
                        const activeUpload = activeUploads[uploadKey];
                        const uploadError = uploadErrors[uploadKey];

                        // Existing uploaded doc of this type
                        const existingDoc = section.uploadedDocuments.find(
                          (d) => d.documentType === req.id
                        );

                        return (
                          <div
                            key={req.id}
                            className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                              existingDoc
                                ? "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80"
                                : "bg-white dark:bg-slate-900/30 border-dashed border-slate-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-600"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                              {/* Requirement Description */}
                              <div className="space-y-1.5 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-bold text-[#102D45] dark:text-white">
                                    {req.name}
                                  </span>
                                  {req.mandatory ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40">
                                      Required
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                      Optional
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                  {req.description}
                                </p>
                                <div className="text-[11px] text-slate-400">
                                  Formats: PDF, JPG, PNG • Max size: {req.maxSizeMB}MB
                                </div>

                                {/* Rejection / Clarification Reason if present */}
                                {existingDoc?.rejectionReason && (
                                  <div className="mt-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-200 text-xs space-y-1">
                                    <div className="font-bold flex items-center gap-1.5 text-rose-700 dark:text-rose-300">
                                      <AlertTriangle className="size-3.5" />
                                      Reviewer Feedback
                                    </div>
                                    <p>{existingDoc.rejectionReason}</p>
                                    <p className="text-[10px] text-rose-600 dark:text-rose-400">
                                      Please upload a clearer replacement document matching the guidelines.
                                    </p>
                                  </div>
                                )}

                                {/* Upload Error Display */}
                                {uploadError && (
                                  <div className="mt-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                                    <AlertCircle className="size-4 shrink-0" />
                                    <span>{uploadError}</span>
                                  </div>
                                )}
                              </div>

                              {/* Upload Action / Uploaded File Status */}
                              <div className="shrink-0 flex items-center gap-2">
                                {existingDoc ? (
                                  <div className="flex flex-col sm:items-end gap-2">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                                      <FileText className="size-4 text-[#168B78] dark:text-[#2dd4bf]" />
                                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[160px] truncate">
                                        {existingDoc.fileName}
                                      </span>
                                      <span className="text-[10px] text-slate-400">
                                        ({formatFileSize(existingDoc.fileSize)})
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      {/* Secure Preview Button */}
                                      <a
                                        href={existingDoc.previewUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                                      >
                                        <Eye className="size-3" />
                                        <span>Preview</span>
                                      </a>

                                      {/* Replace File Button */}
                                      <button
                                        type="button"
                                        onClick={() => fileInputRefs.current[uploadKey]?.click()}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#168B78] dark:text-[#2dd4bf] hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors"
                                      >
                                        <span>Replace</span>
                                      </button>

                                      {/* Delete File Button */}
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteDocument(existingDoc.id, uploadKey)}
                                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                        title="Remove Document"
                                      >
                                        <Trash2 className="size-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ) : activeUpload ? (
                                  <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/40 min-w-[180px]">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-[#168B78] dark:text-[#2dd4bf]">
                                      <Loader2 className="size-3.5 animate-spin" />
                                      <span>Uploading {activeUpload.progress}%</span>
                                    </div>
                                    <div className="w-full bg-teal-100 dark:bg-teal-900 rounded-full h-1.5 overflow-hidden">
                                      <div
                                        className="bg-[#168B78] dark:bg-[#2dd4bf] h-1.5 rounded-full transition-all duration-300"
                                        style={{ width: `${activeUpload.progress}%` }}
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <button
                                      type="button"
                                      onClick={() => fileInputRefs.current[uploadKey]?.click()}
                                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#102D45] hover:bg-[#163f61] text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
                                    >
                                      <UploadCloud className="size-4" />
                                      <span>Upload Document</span>
                                    </button>
                                  </div>
                                )}

                                {/* Hidden file input */}
                                <input
                                  type="file"
                                  ref={(el) => {
                                    fileInputRefs.current[uploadKey] = el;
                                  }}
                                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                                  className="hidden"
                                  onChange={(e) => handleFileChange(section.identityKey, req, e)}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Independent Identity Submission Action */}
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/60">
                      <div className="text-xs text-slate-500">
                        {section.uploadedDocuments.length === 0 ? (
                          <span>No documents uploaded yet.</span>
                        ) : section.status === "UNDER_REVIEW" ? (
                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                            Submitted on {new Date().toLocaleDateString()} — Credential verification underway.
                          </span>
                        ) : (
                          <span>
                            {section.uploadedDocuments.length} document(s) ready for review.
                          </span>
                        )}
                      </div>

                      {section.status !== "UNDER_REVIEW" && section.status !== "APPROVED" && (
                        <button
                          type="button"
                          disabled={section.uploadedDocuments.length === 0}
                          onClick={() => initiateSubmission(section.identityKey)}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#168B78] hover:bg-[#127263] disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-bold transition-all shadow-xs"
                        >
                          <ShieldCheck className="size-3.5" />
                          <span>Submit {meta.title} for Review</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ─────────────────────────────────────────────
              4. BOTTOM GLOBAL NAVIGATION & SUBMISSION BAR
              ───────────────────────────────────────────── */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => router.push("/feed")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-all"
            >
              <ArrowLeft className="size-4" />
              <span>Return to Dashboard</span>
            </button>

            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/onboarding/individual/complete")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                <span>Skip for Now</span>
              </button>

              <button
                type="button"
                onClick={() => initiateSubmission(null)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[#102D45] hover:bg-[#163f61] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#102D45]/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <ShieldCheck className="size-4" />
                <span>Submit Documents for Verification</span>
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ─────────────────────────────────────────────
          5. CONFIRMATION MODAL BEFORE SUBMISSION
          ───────────────────────────────────────────── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="size-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-[#168B78] dark:text-[#2dd4bf] flex items-center justify-center border border-teal-100 dark:border-teal-900/30">
              <ShieldCheck className="size-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-[#102D45] dark:text-white">
                Confirm Verification Submission
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {submittingTarget
                  ? `Are you ready to submit your credentials for ${IDENTITY_METADATA[submittingTarget]?.title || submittingTarget}? Once submitted, your documents will be locked for review by authorized compliance personnel.`
                  : "Are you ready to submit all uploaded identity documents? Once submitted, your credentials will enter the clinical audit queue for administrative verification."}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-start gap-2">
              <Info className="size-3.5 shrink-0 mt-0.5" />
              <span>
                You can save progress and resume later. If any document requires clarification, you will receive feedback and can re-upload anytime.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#168B78] hover:bg-[#127263] text-white text-xs font-bold transition-all shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-3.5" />
                    <span>Confirm & Submit</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────
          6. FOOTER
          ───────────────────────────────────────────── */}
      <footer className="w-full border-t border-slate-100 dark:border-slate-800/80 py-6 px-4 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} MED Global Network. Secure & Regulated Healthcare Credential System.</p>
      </footer>
    </div>
  );
}
