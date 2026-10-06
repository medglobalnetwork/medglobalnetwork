"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  User,
  Building2,
  GraduationCap,
  FileText,
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Clock,
  AlertTriangle,
  Stethoscope,
  Hospital,
  Sparkles,
  Check,
  Trash2,
  RefreshCw,
  Eye,
  FileCheck,
  AlertCircle,
  HelpCircle,
  Camera,
  Activity,
  Award,
  BadgeCheck,
  HeartPulse,
  Syringe,
  Microscope,
  Briefcase,
  Layers,
  ChevronRight,
  LogOut,
} from "lucide-react";
import {
  INDIVIDUAL_CATEGORIES,
  ORGANISATION_CATEGORIES,
  CATEGORY_PROFESSIONS,
  STUDENT_STAGES,
  PROFESSION_SCHEMAS,
  ORGANISATION_SCHEMAS,
  getProfessionSchema,
  getOrganisationSchema,
  type AccountType,
  type DynamicFormField,
  type DocumentRequirement,
  type ProfessionSchema,
  type RequirementLevel,
} from "@/modules/onboarding/config/schemas";
import { parseFullName } from "@/lib/name-parser";
import { signOutUser } from "@/lib/auth-client";

const DRAFT_STORAGE_KEY = "mgn_onboarding_form_draft";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = React.useState<number>(1);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  // ─────────────────────────────────────────────
  // Core Selection States
  // ─────────────────────────────────────────────
  const [accountType, setAccountType] = React.useState<AccountType>("INDIVIDUAL");
  const [category, setCategory] = React.useState<string>("clinical_practitioner");
  const [professionOrType, setProfessionOrType] = React.useState<string>("general_physician");

  // Student specific stage
  const [studentStage, setStudentStage] = React.useState<string>("ug_1");

  // Basic Personal / Organization Info
  const [legalFirstName, setLegalFirstName] = React.useState<string>("");
  const [legalMiddleName, setLegalMiddleName] = React.useState<string>("");
  const [legalLastName, setLegalLastName] = React.useState<string>("");
  const [displayName, setDisplayName] = React.useState<string>("");
  const [dob, setDob] = React.useState<string>("");
  const [gender, setGender] = React.useState<string>("male");
  const [country, setCountry] = React.useState<string>("India");
  const [state, setState] = React.useState<string>("");
  const [city, setCity] = React.useState<string>("");
  const [phone, setPhone] = React.useState<string>("");
  const [claimedTitle, setClaimedTitle] = React.useState<string>("Dr.");
  const [titleType, setTitleType] = React.useState<"PREFIX" | "SUFFIX">("PREFIX");

  // Dynamic Profile Form Values (mapped to fields in schema)
  const [dynamicValues, setDynamicValues] = React.useState<Record<string, any>>({});

  // Documents
  const [uploadedDocs, setUploadedDocs] = React.useState<
    Record<string, { id: string; name: string; size: number; url?: string; status?: string; rejectionReason?: string }>
  >({});
  const [uploadingDocId, setUploadingDocId] = React.useState<string | null>(null);

  // Declaration
  const [confirmedDeclaration, setConfirmedDeclaration] = React.useState<boolean>(false);

  // Status & Correction States
  const [verificationStatus, setVerificationStatus] = React.useState<string>("DRAFT");
  const [correctionNote, setCorrectionNote] = React.useState<string | null>(null);
  const [rejectedDocTypes, setRejectedDocTypes] = React.useState<string[]>([]);
  const [skippedDocuments, setSkippedDocuments] = React.useState<boolean>(false);

  // ─────────────────────────────────────────────
  // 1. Initial Load & Server Synchronization
  // ─────────────────────────────────────────────
  React.useEffect(() => {
    let savedLocalStep = 1;
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (cached) {
          const p = JSON.parse(cached);
          if (p.accountType) setAccountType(p.accountType);
          if (p.category) setCategory(p.category);
          if (p.professionOrType) setProfessionOrType(p.professionOrType);
          if (p.studentStage) setStudentStage(p.studentStage);
          if (p.legalFirstName) {
            if (!p.legalLastName && p.legalFirstName.trim().includes(" ")) {
              const parsed = parseFullName(p.legalFirstName);
              setLegalFirstName(
                parsed.legalMiddleName
                  ? `${parsed.legalFirstName} ${parsed.legalMiddleName}`.trim()
                  : parsed.legalFirstName
              );
              if (parsed.legalLastName) setLegalLastName(parsed.legalLastName);
              if (parsed.claimedTitle) setClaimedTitle(parsed.claimedTitle);
            } else {
              setLegalFirstName(p.legalFirstName);
            }
          }
          if (p.legalMiddleName) setLegalMiddleName(p.legalMiddleName);
          if (p.legalLastName) setLegalLastName(p.legalLastName);
          if (p.displayName) setDisplayName(p.displayName);
          if (p.dob) setDob(p.dob);
          if (p.gender) setGender(p.gender);
          if (p.country) setCountry(p.country);
          if (p.state) setState(p.state);
          if (p.city) setCity(p.city);
          if (p.phone) setPhone(p.phone);
          if (p.claimedTitle !== undefined) setClaimedTitle(p.claimedTitle);
          if (p.titleType) setTitleType(p.titleType);
          if (p.dynamicValues) setDynamicValues(p.dynamicValues);
          if (p.step && p.step >= 1 && p.step <= 6) {
            savedLocalStep = p.step;
            setStep(p.step);
          }
        }
      } catch (e) {
        console.warn("Failed to load local onboarding draft:", e);
      }
    }

    // Fetch authoritative server record
    fetch("/api/onboarding", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.isApproved || data.identity?.verification_status === "APPROVED") {
          if (typeof window !== "undefined") {
            localStorage.removeItem(DRAFT_STORAGE_KEY);
          }
          router.replace("/home");
          return;
        }

        if (data.identity) {
          const id = data.identity;
          setVerificationStatus(id.verification_status || "DRAFT");
          if (id.verification_status === "APPROVED") {
            if (typeof window !== "undefined") {
              localStorage.removeItem(DRAFT_STORAGE_KEY);
            }
            router.replace("/home");
            return;
          }
          if (
            id.verification_status === "UNDER_REVIEW" ||
            id.verification_status === "VERIFICATION_INCOMPLETE" ||
            id.verification_status === "REJECTED" ||
            id.verification_status === "SUSPENDED" ||
            id.verification_status === "BANNED" ||
            id.verification_status === "ON_HOLD" ||
            id.verification_status === "RESTRICTED"
          ) {
            router.replace("/onboarding/status");
            return;
          }

          if (id.verification_status === "CORRECTION_REQUIRED") {
            setCorrectionNote(id.correction_reason || "Reviewer requested corrections to your uploaded KYC documents.");
            setStep(5); // Jump directly to document upload step for correction
          } else if (id.verification_status === "ENROLLED") {
            // User in 72h grace window visiting onboarding -> go to document upload step directly
            setStep(5);
          } else if (id.onboarding_step && id.onboarding_step >= 1 && id.onboarding_step <= 6) {
            // Resume from authoritative server step
            setStep(id.onboarding_step);
          } else if (savedLocalStep && savedLocalStep >= 1 && savedLocalStep <= 6) {
            setStep(savedLocalStep);
          }

          if (id.account_type) setAccountType(id.account_type);
          if (id.category) setCategory(id.category);
          if (id.profession_or_type) setProfessionOrType(id.profession_or_type);
          
          if (id.legal_first_name) {
            if (!id.legal_last_name && id.legal_first_name.trim().includes(" ")) {
              const parsed = parseFullName(id.legal_first_name);
              setLegalFirstName(
                parsed.legalMiddleName
                  ? `${parsed.legalFirstName} ${parsed.legalMiddleName}`.trim()
                  : parsed.legalFirstName
              );
              if (parsed.legalLastName) setLegalLastName(parsed.legalLastName);
              if (parsed.claimedTitle) setClaimedTitle(parsed.claimedTitle);
            } else {
              setLegalFirstName(id.legal_first_name);
            }
          }
          if (id.legal_middle_name) setLegalMiddleName(id.legal_middle_name);
          if (id.legal_last_name) setLegalLastName(id.legal_last_name);
          if (id.display_name) setDisplayName(id.display_name);
          if (id.dob) setDob(id.dob.slice(0, 10));
          if (id.gender) setGender(id.gender);
          if (id.country) setCountry(id.country);
          if (id.state) setState(id.state);
          if (id.city) setCity(id.city);
          if (id.phone) setPhone(id.phone);

          if (data.titles && data.titles.length > 0) {
            setClaimedTitle(data.titles[0].claimed_title);
            setTitleType(data.titles[0].title_type);
          }

          // Hydrate dynamic values
          const dynUpdates: Record<string, any> = {};
          if (data.qualifications && data.qualifications.length > 0) {
            const q = data.qualifications[0];
            if (q.degree) dynUpdates.primary_degree = q.degree;
            if (q.institution) dynUpdates.institution = q.institution;
            if (q.graduation_year) dynUpdates.graduation_year = q.graduation_year;
            if (q.specialization) dynUpdates.specialization = q.specialization;
          }
          if (data.registrations && data.registrations.length > 0) {
            const reg = data.registrations[0];
            if (reg.council_name) dynUpdates.medical_council = reg.council_name;
            if (reg.registration_number) dynUpdates.registration_number = reg.registration_number;
            if (reg.state_or_jurisdiction) dynUpdates.registration_state = reg.state_or_jurisdiction;
          }
          if (id.current_organization) dynUpdates.current_organization = id.current_organization;
          if (id.specialization) dynUpdates.specialization = id.specialization;
          if (id.experience_years !== undefined && id.experience_years !== null) {
            dynUpdates.experience_years = id.experience_years;
          }

          setDynamicValues((prev) => ({ ...dynUpdates, ...prev }));

          const existingDocs: Record<string, any> = {};
          const rejected: string[] = [];
          data.documents?.forEach((d: any) => {
            existingDocs[d.document_type] = {
              id: d.id,
              name: d.file_name,
              size: d.file_size,
              url: d.file_path,
              status: d.status,
              rejectionReason: d.rejection_reason,
            };
            if (d.status === "REJECTED") {
              rejected.push(d.document_type);
            }
          });
          setUploadedDocs((prev) => ({ ...existingDocs, ...prev }));
          setRejectedDocTypes(rejected);
        }
      })
      .catch((err) => console.error("Error loading onboarding state:", err))
      .finally(() => setLoading(false));
  }, [router]);

  // ─────────────────────────────────────────────
  // 2. Local Storage Autosave
  // ─────────────────────────────────────────────
  React.useEffect(() => {
    if (loading) return;
    if (typeof window === "undefined") return;
    try {
      const draft = {
        step,
        accountType,
        category,
        professionOrType,
        studentStage,
        legalFirstName,
        legalMiddleName,
        legalLastName,
        displayName,
        dob,
        gender,
        country,
        state,
        city,
        phone,
        claimedTitle,
        titleType,
        dynamicValues,
        updatedAt: Date.now(),
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Ignore quota errors
    }
  }, [
    step,
    accountType,
    category,
    professionOrType,
    studentStage,
    legalFirstName,
    legalMiddleName,
    legalLastName,
    displayName,
    dob,
    gender,
    country,
    state,
    city,
    phone,
    claimedTitle,
    titleType,
    dynamicValues,
    loading,
  ]);

  // ─────────────────────────────────────────────
  // Active Schema & Document Requirements Resolver
  // ─────────────────────────────────────────────
  const currentSchema: ProfessionSchema | any = React.useMemo(() => {
    if (accountType === "INDIVIDUAL") {
      return getProfessionSchema(professionOrType || category);
    }
    return getOrganisationSchema(professionOrType || category);
  }, [accountType, category, professionOrType]);

  const documentRequirements: DocumentRequirement[] = React.useMemo(() => {
    return currentSchema.documents || [];
  }, [currentSchema]);

  // ─────────────────────────────────────────────
  // Step Navigation & Validation
  // ─────────────────────────────────────────────
  // Step Navigation & Validation
  // ─────────────────────────────────────────────
  const handleSkipDocuments = async () => {
    setSkippedDocuments(true);
    setError(null);
    try {
      await fetch("/api/onboarding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ step: 6 }),
      });
    } catch {}
    setStep(6);
  };

  const handleBackStep = async () => {
    setError(null);
    const prev = Math.max(1, step - 1);
    setStep(prev);
    try {
      await fetch("/api/onboarding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ step: prev }),
      });
    } catch {}
  };

  const handleNextStep = async () => {
    setError(null);

    if (step === 1) {
      // Step 1: Account Type chosen -> proceed & persist
      try {
        await fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            action: "START",
            account_type: accountType,
            category,
            profession_or_type: professionOrType,
            step: 2,
          }),
        });
      } catch (e) {
        console.warn("Could not sync category to server:", e);
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      // Step 2: Category & Role chosen -> initialize server session & persist
      try {
        await fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            action: "START",
            account_type: accountType,
            category,
            profession_or_type: professionOrType,
            step: 3,
          }),
        });
      } catch (e) {
        console.warn("Could not sync category to server:", e);
      }
      setStep(3);
      return;
    }

    if (step === 3) {
      // Step 3: Personal Information validation
      if (!legalFirstName.trim()) {
        setError("Legal First Name is required as per government identity proof.");
        return;
      }
      if (!city.trim() || !state.trim()) {
        setError("City and State are required.");
        return;
      }

      // Persist step 3 details to server
      try {
        await fetch("/api/onboarding", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            legal_first_name: legalFirstName,
            legal_middle_name: legalMiddleName,
            legal_last_name: legalLastName,
            display_name: displayName || `${legalFirstName} ${legalLastName}`.trim(),
            dob,
            gender,
            country,
            state,
            city,
            phone,
            claimed_title: claimedTitle,
            title_type: titleType,
            step: 4,
          }),
        });
      } catch (e) {
        console.warn("Could not save step 3 details to server:", e);
      }

      setStep(4);
      return;
    }

    if (step === 4) {
      // Step 4: Dynamic Professional Fields validation
      for (const field of currentSchema.fields || []) {
        if (field.required && !dynamicValues[field.name]) {
          setError(`Please fill in "${field.label}" to proceed.`);
          return;
        }
      }

      // Save draft details to server
      try {
        await fetch("/api/onboarding", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            legal_first_name: legalFirstName,
            legal_middle_name: legalMiddleName,
            legal_last_name: legalLastName,
            display_name: displayName || `${legalFirstName} ${legalLastName}`.trim(),
            dob,
            gender,
            country,
            state,
            city,
            phone,
            claimed_title: claimedTitle,
            title_type: titleType,
            step: 5,
            ...dynamicValues,
          }),
        });
      } catch (e) {
        console.warn("Could not save draft details to server:", e);
      }

      setStep(5);
      return;
    }

    if (step === 5) {
      // Step 5: Document requirements check
      const missingMandatory = documentRequirements
        .filter((d) => d.mandatory && !uploadedDocs[d.id])
        .map((d) => d.name);

      if (missingMandatory.length > 0) {
        // If mandatory documents are missing, user can either upload or click Skip for Now
        setError(
          `Please upload all required documents: ${missingMandatory.join(", ")} or click "Skip for now" to upload later within 72 hours.`
        );
        return;
      }

      setSkippedDocuments(false);
      try {
        await fetch("/api/onboarding", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ step: 6 }),
        });
      } catch {}
      setStep(6);
      return;
    }
  };

  // ─────────────────────────────────────────────
  // Document Upload Handler
  // ─────────────────────────────────────────────
  const handleFileUpload = async (docId: string, file: File) => {
    setError(null);
    setUploadingDocId(docId);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("document_type", docId);

      const res = await fetch("/api/onboarding/documents", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload document");
      }

      setUploadedDocs((prev) => ({
        ...prev,
        [docId]: {
          id: data.document.id,
          name: file.name,
          size: file.size,
          url: data.document.file_path,
          status: "UPLOADED",
        },
      }));

      // Remove from rejected list if replaced
      setRejectedDocTypes((prev) => prev.filter((t) => t !== docId));
      setSuccessMsg(`"${file.name}" uploaded successfully.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to upload file. Please try again.");
    } finally {
      setUploadingDocId(null);
    }
  };

  // ─────────────────────────────────────────────
  // Final Review & Submission Handler
  // ─────────────────────────────────────────────
  const handleSubmitReview = async () => {
    if (!confirmedDeclaration) {
      setError("Please confirm the verification declaration to submit your application.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // 1. Final synchronization of all draft details
      await fetch("/api/onboarding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          legal_first_name: legalFirstName,
          legal_middle_name: legalMiddleName,
          legal_last_name: legalLastName,
          display_name: displayName || `${legalFirstName} ${legalLastName}`.trim(),
          dob,
          gender,
          country,
          state,
          city,
          phone,
          claimed_title: claimedTitle,
          title_type: titleType,
          step: 6,
          ...dynamicValues,
        }),
      });

      // 2. Check if user skipped mandatory docs or provided all
      const missingMandatory = documentRequirements
        .filter((d) => d.mandatory && !uploadedDocs[d.id])
        .map((d) => d.id);

      if (missingMandatory.length > 0 || skippedDocuments) {
        // Defer document upload and enter 72h grace period
        const res = await fetch("/api/onboarding/skip", {
          method: "POST",
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to complete setup in grace period");
        }
      } else {
        // Full documents submitted -> Move to UNDER_REVIEW
        const res = await fetch("/api/onboarding/submit-review", {
          method: "POST",
          credentials: "include",
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to submit verification request");
        }
      }

      // Clear local storage draft upon clean submission
      if (typeof window !== "undefined") {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }

      router.push("/onboarding/status");
    } catch (err: any) {
      setError(err.message || "Failed to submit application. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-[#faf9f8] dark:bg-[#0b0f17]">
        <div className="size-10 rounded-full border-2 border-[#0f4c81] border-t-transparent animate-spin mb-4" />
        <p className="text-xs sm:text-sm text-[#77716b] dark:text-[#8b949e] font-medium">
          Loading your verification application...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#faf9f8] dark:bg-[#0b0f17] flex flex-col selection:bg-[#0f4c81]/20 font-sans transition-colors">
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 w-full border-b border-[#ded8d1]/70 dark:border-[#1e293b] bg-white/90 dark:bg-[#0b0f17]/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <img
            src="/logo.png"
            alt="Med Global Network"
            className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-semibold tracking-tight text-[#171717] dark:text-[#f0f6fc]">
              Med Global Network
            </span>
            <span className="text-[10px] text-[#16804d] font-medium flex items-center gap-1">
              <ShieldCheck className="size-3" />
              Official Verification Engine
            </span>
          </div>
        </Link>

        {/* Wizard Step Progress Pills */}
        <div className="hidden md:flex items-center gap-2">
          {[
            { num: 1, label: "Account" },
            { num: 2, label: "Category" },
            { num: 3, label: "Identity" },
            { num: 4, label: "Professional" },
            { num: 5, label: "Documents" },
            { num: 6, label: "Review" },
          ].map((s) => (
            <div
              key={s.num}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition ${
                step === s.num
                  ? "bg-[#0f4c81] text-white shadow-xs"
                  : step > s.num
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : "bg-[#f0efee] text-[#77716b] dark:bg-[#161b22] dark:text-[#8b949e]"
              }`}
            >
              {step > s.num ? (
                <Check className="size-3.5" />
              ) : (
                <span className="size-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                  {s.num}
                </span>
              )}
              <span>{s.label}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {verificationStatus === "ENROLLED" && (
            <Link
              href="/home"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#0f4c81]/30 dark:border-[#58a6ff]/30 bg-[#eef5fc] dark:bg-[#161b22] px-3 py-1.5 text-xs font-semibold text-[#0f4c81] dark:text-[#58a6ff] hover:bg-[#0f4c81]/10 transition shadow-2xs"
            >
              <span>Go to Home Feed</span>
              <ArrowRight className="size-3.5" />
            </Link>
          )}
          <button
            type="button"
            onClick={async () => {
              await signOutUser("/login");
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] px-3 py-1.5 text-xs font-semibold text-[#5d5854] dark:text-[#8b949e] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-[#f0efee] dark:hover:bg-[#21262d] transition cursor-pointer shadow-2xs"
            title="Sign out of your session and return to login"
          >
            <LogOut className="size-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Correction Alert Banner */}
        {correctionNote && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
            <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-amber-900 dark:text-amber-200">
                Action Required: Verification Corrections Requested
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-1 leading-relaxed">
                {correctionNote}
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 font-medium">
                Please re-upload the corrected documents below and re-submit your verification.
              </p>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-3 text-xs font-medium text-rose-700 dark:text-rose-400 animate-in fade-in">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Global Success Banner */}
        {successMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-xs font-medium text-emerald-700 dark:text-emerald-400 animate-in fade-in">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            STEP 1: ACCOUNT TYPE SELECTION
            ═══════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="text-left">
              <span className="text-xs font-semibold text-[#0f4c81] dark:text-[#58a6ff] uppercase tracking-wider">
                Step 1 of 6
              </span>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#171717] dark:text-[#f0f6fc] mt-1">
                What are you joining MGN as?
              </h1>
              <p className="text-xs sm:text-sm text-[#77716b] dark:text-[#8b949e] mt-1.5 leading-relaxed">
                Select your primary account identity. Organization and Individual verification requirements are distinct.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Individual Card */}
              <button
                type="button"
                onClick={() => {
                  setAccountType("INDIVIDUAL");
                  setCategory("clinical_practitioner");
                  setProfessionOrType("general_physician");
                }}
                className={`p-6 rounded-3xl border-2 text-left transition cursor-pointer flex flex-col justify-between group ${
                  accountType === "INDIVIDUAL"
                    ? "border-[#0f4c81] bg-[#eef5fc]/60 dark:bg-[#1f2937]/70 ring-2 ring-[#0f4c81]/20 shadow-xs"
                    : "border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] hover:border-[#8a8784]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`size-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                        accountType === "INDIVIDUAL"
                          ? "bg-[#0f4c81] text-white"
                          : "bg-[#f0efee] dark:bg-[#21262d] text-[#5d5854] dark:text-[#8b949e]"
                      }`}
                    >
                      <User className="size-6" />
                    </div>
                    {accountType === "INDIVIDUAL" && (
                      <span className="size-3 rounded-full bg-[#0f4c81] dark:bg-[#58a6ff]" />
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-[#171717] dark:text-[#f0f6fc]">
                    Individual Professional
                  </h3>
                  <p className="text-xs text-[#77716b] dark:text-[#8b949e] mt-1.5 leading-relaxed">
                    For Medical Doctors, Surgeons, Allied Health Specialists, Nurses, Students & Healthcare Professionals.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#ded8d1]/50 dark:border-[#30363d]/50 flex items-center justify-between text-xs font-medium text-[#0f4c81] dark:text-[#58a6ff]">
                  <span>Personal Verified Identity</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </div>
              </button>

              {/* Organization Card */}
              <button
                type="button"
                onClick={() => {
                  setAccountType("ORGANISATION");
                  setCategory("healthcare_organization");
                  setProfessionOrType("hospital");
                }}
                className={`p-6 rounded-3xl border-2 text-left transition cursor-pointer flex flex-col justify-between group ${
                  accountType === "ORGANISATION"
                    ? "border-[#0f4c81] bg-[#eef5fc]/60 dark:bg-[#1f2937]/70 ring-2 ring-[#0f4c81]/20 shadow-xs"
                    : "border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] hover:border-[#8a8784]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`size-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                        accountType === "ORGANISATION"
                          ? "bg-[#0f4c81] text-white"
                          : "bg-[#f0efee] dark:bg-[#21262d] text-[#5d5854] dark:text-[#8b949e]"
                      }`}
                    >
                      <Building2 className="size-6" />
                    </div>
                    {accountType === "ORGANISATION" && (
                      <span className="size-3 rounded-full bg-[#0f4c81] dark:bg-[#58a6ff]" />
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-[#171717] dark:text-[#f0f6fc]">
                    Healthcare Organization
                  </h3>
                  <p className="text-xs text-[#77716b] dark:text-[#8b949e] mt-1.5 leading-relaxed">
                    For Hospitals, Clinics, Diagnostic Labs, Blood Banks, Medical Colleges, Healthcare NGOs & Enterprises.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#ded8d1]/50 dark:border-[#30363d]/50 flex items-center justify-between text-xs font-medium text-[#0f4c81] dark:text-[#58a6ff]">
                  <span>Institutional Accreditation</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            STEP 2: CATEGORY & SUB-ROLE ENGINE
            ═══════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="text-left">
              <span className="text-xs font-semibold text-[#0f4c81] dark:text-[#58a6ff] uppercase tracking-wider">
                Step 2 of 6
              </span>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#171717] dark:text-[#f0f6fc] mt-1">
                Choose your professional category & role
              </h1>
              <p className="text-xs sm:text-sm text-[#77716b] dark:text-[#8b949e] mt-1.5 leading-relaxed">
                The verification requirement engine automatically customizes your credentials checklist according to your field.
              </p>
            </div>

            {/* Individual Category Selector */}
            {accountType === "INDIVIDUAL" && (
              <div className="space-y-4">
                <label className="block text-xs font-semibold text-[#171717] dark:text-[#f0f6fc]">
                  1. Select Professional Category
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {INDIVIDUAL_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setCategory(cat.id);
                        const firstRole = CATEGORY_PROFESSIONS[cat.id]?.[0]?.id || "other";
                        setProfessionOrType(firstRole);
                      }}
                      className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        category === cat.id
                          ? "border-[#0f4c81] bg-[#eef5fc]/60 dark:bg-[#1f2937] ring-1.5 ring-[#0f4c81]/30 shadow-xs"
                          : "border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] hover:border-[#8a8784]"
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold text-[#171717] dark:text-[#f0f6fc]">
                          {cat.label}
                        </div>
                        <div className="text-[11px] text-[#77716b] dark:text-[#8b949e] mt-1 line-clamp-2">
                          {cat.description}
                        </div>
                      </div>
                      <div className="mt-3 text-[10px] font-semibold text-[#0f4c81] dark:text-[#58a6ff]">
                        {cat.badge}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Sub-Role Picker */}
                <div className="mt-6 pt-4 border-t border-[#ded8d1]/60 dark:border-[#30363d]">
                  <label className="block text-xs font-semibold text-[#171717] dark:text-[#f0f6fc] mb-2">
                    2. Select Your Specific Role / Clinical Title
                  </label>
                  <select
                    value={professionOrType}
                    onChange={(e) => setProfessionOrType(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] px-4 text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#0f4c81] font-medium cursor-pointer"
                  >
                    {(CATEGORY_PROFESSIONS[category] || []).map((r) => (
                      <option key={r.id} value={r.id} className="bg-white dark:bg-[#161b22] text-[#171717] dark:text-white">
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* If Medical Student, select Academic Stage */}
                {category === "medical_student" && (
                  <div className="mt-4">
                    <label className="block text-xs font-semibold text-[#171717] dark:text-[#f0f6fc] mb-2">
                      3. Current Stage of Medical Training
                    </label>
                    <select
                      value={studentStage}
                      onChange={(e) => setStudentStage(e.target.value)}
                      className="h-12 w-full rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] px-4 text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#0f4c81] font-medium cursor-pointer"
                    >
                      {STUDENT_STAGES.map((st) => (
                        <option key={st.value} value={st.value} className="bg-white dark:bg-[#161b22] text-[#171717] dark:text-white">
                          {st.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Organisation Category Selector */}
            {accountType === "ORGANISATION" && (
              <div className="space-y-4">
                <label className="block text-xs font-semibold text-[#171717] dark:text-[#f0f6fc]">
                  Select Organization Type
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {CATEGORY_PROFESSIONS.healthcare_organization.map((org) => (
                    <button
                      key={org.id}
                      type="button"
                      onClick={() => setProfessionOrType(org.id)}
                      className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        professionOrType === org.id
                          ? "border-[#0f4c81] bg-[#eef5fc]/60 dark:bg-[#1f2937] ring-1.5 ring-[#0f4c81]/30 shadow-xs"
                          : "border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] hover:border-[#8a8784]"
                      }`}
                    >
                      <div className="text-xs font-semibold text-[#171717] dark:text-[#f0f6fc]">
                        {org.label}
                      </div>
                      <span className="mt-2 text-[10px] text-[#0f4c81] dark:text-[#58a6ff] font-medium">
                        Institution Profile
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            STEP 3: PERSONAL & CONTACT INFORMATION
            ═══════════════════════════════════════════════ */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="text-left">
              <span className="text-xs font-semibold text-[#0f4c81] dark:text-[#58a6ff] uppercase tracking-wider">
                Step 3 of 6
              </span>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#171717] dark:text-[#f0f6fc] mt-1">
                {accountType === "ORGANISATION"
                  ? "Organization Identity & Location"
                  : "Personal Identity & Contact"}
              </h1>
              <p className="text-xs sm:text-sm text-[#77716b] dark:text-[#8b949e] mt-1.5 leading-relaxed">
                Enter legal details exactly matching your official government and registration documents.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* Title Prefix (Only for Individual) */}
              {accountType === "INDIVIDUAL" && (
                <div>
                  <label className="block text-xs font-medium text-[#5d5854] dark:text-[#8b949e] mb-1.5">
                    Prefix Title
                  </label>
                  <select
                    value={claimedTitle}
                    onChange={(e) => setClaimedTitle(e.target.value)}
                    className="h-11 w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] px-3.5 text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] focus:border-[#0f4c81] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                  >
                    <option value="Dr.">Dr.</option>
                    <option value="Prof.">Prof.</option>
                    <option value="PT">PT</option>
                    <option value="RN">RN</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="">None</option>
                  </select>
                </div>
              )}

              {/* Legal First Name */}
              <div className={accountType === "INDIVIDUAL" ? "sm:col-span-2" : "sm:col-span-3"}>
                <label className="block text-xs font-medium text-[#5d5854] dark:text-[#8b949e] mb-1.5">
                  {accountType === "ORGANISATION" ? "Official Legal Organization Name *" : "Legal First & Middle Name *"}
                </label>
                <input
                  type="text"
                  value={legalFirstName}
                  onChange={(e) => setLegalFirstName(e.target.value)}
                  onBlur={() => {
                    if (accountType === "INDIVIDUAL" && legalFirstName.trim()) {
                      const hasPrefix = /^(dr\.|dr|prof\.|prof|pt\.|pt|rn\.|rn|mr\.|mr|ms\.|ms|mrs\.|mrs)\s+/i.test(legalFirstName.trim());
                      const hasMultipleWords = legalFirstName.trim().includes(" ");
                      if (hasPrefix || (!legalLastName && hasMultipleWords)) {
                        const parsed = parseFullName(legalFirstName);
                        setLegalFirstName(
                          parsed.legalMiddleName
                            ? `${parsed.legalFirstName} ${parsed.legalMiddleName}`.trim()
                            : parsed.legalFirstName
                        );
                        if (parsed.legalLastName && !legalLastName) {
                          setLegalLastName(parsed.legalLastName);
                        }
                        if (hasPrefix && parsed.claimedTitle) {
                          setClaimedTitle(parsed.claimedTitle);
                        }
                      }
                    }
                  }}
                  placeholder={accountType === "ORGANISATION" ? "e.g. Apex Multispeciality Hospital Pvt Ltd" : "e.g. Rajesh Kumar"}
                  required
                  className="h-11 w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] px-3.5 text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] placeholder:text-[#8a8784] focus:border-[#0f4c81] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                />
              </div>

              {/* Legal Last Name */}
              {accountType === "INDIVIDUAL" && (
                <div className="sm:col-span-3">
                  <label className="block text-xs font-medium text-[#5d5854] dark:text-[#8b949e] mb-1.5">
                    Legal Last Name / Surname
                  </label>
                  <input
                    type="text"
                    value={legalLastName}
                    onChange={(e) => setLegalLastName(e.target.value)}
                    placeholder="e.g. Sharma"
                    className="h-11 w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] px-3.5 text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] placeholder:text-[#8a8784] focus:border-[#0f4c81] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                  />
                </div>
              )}

              {/* Date of Birth & Gender (For Individual) */}
              {accountType === "INDIVIDUAL" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-[#5d5854] dark:text-[#8b949e] mb-1.5">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="h-11 w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] px-3.5 text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] focus:border-[#0f4c81] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#5d5854] dark:text-[#8b949e] mb-1.5">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="h-11 w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] px-3.5 text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] focus:border-[#0f4c81] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#5d5854] dark:text-[#8b949e] mb-1.5">
                      Official Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="h-11 w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] px-3.5 text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] focus:border-[#0f4c81] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                    />
                  </div>
                </>
              )}

              {/* Location: City, State, Country */}
              <div>
                <label className="block text-xs font-medium text-[#5d5854] dark:text-[#8b949e] mb-1.5">
                  City *
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Mumbai, New Delhi, Bengaluru"
                  required
                  className="h-11 w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] px-3.5 text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] focus:border-[#0f4c81] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5d5854] dark:text-[#8b949e] mb-1.5">
                  State / Province *
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Maharashtra, Delhi, Karnataka"
                  required
                  className="h-11 w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] px-3.5 text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] focus:border-[#0f4c81] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5d5854] dark:text-[#8b949e] mb-1.5">
                  Country
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="India"
                  className="h-11 w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] px-3.5 text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] focus:border-[#0f4c81] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            STEP 4: DYNAMIC PROFESSIONAL DETAILS FORM
            ═══════════════════════════════════════════════ */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="text-left">
              <span className="text-xs font-semibold text-[#0f4c81] dark:text-[#58a6ff] uppercase tracking-wider">
                Step 4 of 6
              </span>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#171717] dark:text-[#f0f6fc] mt-1">
                Professional Credentials & Registration
              </h1>
              <p className="text-xs sm:text-sm text-[#77716b] dark:text-[#8b949e] mt-1.5 leading-relaxed">
                Provide details for{" "}
                <span className="font-semibold text-[#0f4c81] dark:text-[#58a6ff]">
                  {currentSchema.name || "your chosen discipline"}
                </span>
                . These will be verified against your council registries.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {(currentSchema.fields || []).map((f: DynamicFormField) => (
                <div key={f.name} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                  <label className="block text-xs font-medium text-[#5d5854] dark:text-[#8b949e] mb-1.5">
                    {f.label} {f.required && "*"}
                  </label>

                  {f.type === "select" ? (
                    <select
                      value={dynamicValues[f.name] || ""}
                      onChange={(e) =>
                        setDynamicValues((prev) => ({ ...prev, [f.name]: e.target.value }))
                      }
                      className="h-11 w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] px-3.5 text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] focus:border-[#0f4c81] focus:outline-none focus:ring-1 focus:ring-[#0f4c81] cursor-pointer"
                    >
                      <option value="">Select {f.label}</option>
                      {(f.options || []).map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#161b22] text-[#171717] dark:text-white">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : f.type === "textarea" ? (
                    <textarea
                      rows={3}
                      value={dynamicValues[f.name] || ""}
                      onChange={(e) =>
                        setDynamicValues((prev) => ({ ...prev, [f.name]: e.target.value }))
                      }
                      placeholder={f.placeholder}
                      className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-3 text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] focus:border-[#0f4c81] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                    />
                  ) : (
                    <input
                      type={f.type === "number" ? "number" : "text"}
                      value={dynamicValues[f.name] || ""}
                      onChange={(e) =>
                        setDynamicValues((prev) => ({ ...prev, [f.name]: e.target.value }))
                      }
                      placeholder={f.placeholder}
                      className="h-11 w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] px-3.5 text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] placeholder:text-[#8a8784] focus:border-[#0f4c81] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                    />
                  )}
                  {f.helpText && (
                    <p className="text-[10px] text-[#77716b] dark:text-[#8b949e] mt-1">{f.helpText}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            STEP 5: DYNAMIC DOCUMENT REQUIREMENTS & UPLOADS
            ═══════════════════════════════════════════════ */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="text-left">
              <span className="text-xs font-semibold text-[#0f4c81] dark:text-[#58a6ff] uppercase tracking-wider">
                Step 5 of 6
              </span>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#171717] dark:text-[#f0f6fc] mt-1">
                Upload Verification Documents
              </h1>
              <p className="text-xs sm:text-sm text-[#77716b] dark:text-[#8b949e] mt-1.5 leading-relaxed">
                Our verification compliance team validates your identity, clinical registration, and degree certificates.
                Documents are kept strictly private in encrypted storage and never exposed publicly.
              </p>
            </div>

            {/* Skip for now / Grace Period Banner */}
            <div className="p-4 rounded-2xl bg-[#eef5fc] dark:bg-[#161b22] border border-[#0f4c81]/20 dark:border-[#58a6ff]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-[#0f4c81]/10 dark:bg-[#58a6ff]/10 text-[#0f4c81] dark:text-[#58a6ff] flex items-center justify-center shrink-0">
                  <Clock className="size-4.5" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs sm:text-sm font-semibold text-[#171717] dark:text-[#f0f6fc]">
                    {verificationStatus === "ENROLLED"
                      ? "72-Hour Grace Period Active"
                      : "Don't have your documents ready right now?"}
                  </h4>
                  <p className="text-[11px] text-[#5d5854] dark:text-[#8b949e] mt-0.5">
                    {verificationStatus === "ENROLLED"
                      ? "You have full platform access. You can upload documents here anytime before your window expires."
                      : "You can skip this step and upload your certificates anytime within your 72-hour grace period."}
                  </p>
                </div>
              </div>
              {verificationStatus === "ENROLLED" ? (
                <Link
                  href="/home"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0f4c81] dark:bg-[#14559b] text-xs font-semibold text-white hover:bg-[#0c3c66] transition shrink-0 cursor-pointer self-start sm:self-auto shadow-2xs"
                >
                  <span>Explore App</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleSkipDocuments}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-[#21262d] border border-[#0f4c81]/40 dark:border-[#58a6ff]/40 text-xs font-semibold text-[#0f4c81] dark:text-[#58a6ff] hover:bg-[#0f4c81]/5 transition shrink-0 cursor-pointer self-start sm:self-auto shadow-2xs"
                >
                  <span>Skip for now</span>
                  <ArrowRight className="size-3.5" />
                </button>
              )}
            </div>

            {/* Document Cards List */}
            <div className="space-y-4 pt-1">
              {documentRequirements.map((docReq) => {
                const isUploaded = !!uploadedDocs[docReq.id];
                const docData = uploadedDocs[docReq.id];
                const isRejected = rejectedDocTypes.includes(docReq.id) || docData?.status === "REJECTED";
                const isUploading = uploadingDocId === docReq.id;

                return (
                  <div
                    key={docReq.id}
                    className={`p-5 sm:p-6 rounded-3xl border transition-all ${
                      isRejected
                        ? "border-rose-300 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20"
                        : isUploaded
                        ? "border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20"
                        : docReq.mandatory
                        ? "border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] hover:border-[#0f4c81]/40"
                        : "border-[#ded8d1]/80 dark:border-[#30363d]/80 bg-white/70 dark:bg-[#161b22]/70"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Document Details */}
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`size-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                            isRejected
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300"
                              : isUploaded
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                              : docReq.mandatory
                              ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                              : "bg-[#f0efee] dark:bg-[#21262d] text-[#5d5854] dark:text-[#8b949e]"
                          }`}
                        >
                          {isRejected ? (
                            <AlertTriangle className="size-5" />
                          ) : isUploaded ? (
                            <Check className="size-5" />
                          ) : (
                            <FileText className="size-5" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-semibold text-[#171717] dark:text-[#f0f6fc]">
                              {docReq.name}
                            </h4>

                            {/* Precise Requirement Badges */}
                            {docReq.mandatory ? (
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900">
                                Required
                              </span>
                            ) : docReq.level === "CONDITIONAL" ? (
                              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900">
                                Conditional (If Applicable)
                              </span>
                            ) : docReq.level === "RECOMMENDED" ? (
                              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900">
                                Recommended
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-[#f0efee] text-[#5d5854] border border-[#ded8d1] dark:bg-[#21262d] dark:text-[#8b949e] dark:border-[#30363d]">
                                Optional
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-[#77716b] dark:text-[#8b949e] mt-1">
                            {docReq.description}
                          </p>

                          {/* Rejection Note */}
                          {isRejected && docData?.rejectionReason && (
                            <div className="mt-2 text-xs font-medium text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                              <AlertCircle className="size-3.5 shrink-0" />
                              <span>Reason: {docData.rejectionReason}</span>
                            </div>
                          )}

                          {/* Uploaded File Meta */}
                          {isUploaded && !isRejected && (
                            <div className="mt-2 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                              <FileCheck className="size-3.5 shrink-0" />
                              <span>
                                {docData.name} ({(docData.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Upload CTA Button */}
                      <div className="shrink-0 flex items-center gap-2">
                        <label className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-[#21262d] border border-[#ded8d1] dark:border-[#30363d] px-4 py-2 text-xs font-medium text-[#171717] dark:text-[#f0f6fc] hover:bg-[#f0efee] dark:hover:bg-[#30363d] transition shadow-xs">
                          {isUploading ? (
                            <RefreshCw className="size-3.5 animate-spin text-[#0f4c81]" />
                          ) : isUploaded ? (
                            <RefreshCw className="size-3.5" />
                          ) : (
                            <UploadCloud className="size-3.5 text-[#0f4c81] dark:text-[#58a6ff]" />
                          )}
                          <span>{isUploading ? "Uploading..." : isUploaded ? "Replace" : "Upload"}</span>
                          <input
                            type="file"
                            className="hidden"
                            accept={docReq.acceptedFormats.join(",")}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(docReq.id, file);
                            }}
                            disabled={isUploading}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            STEP 6: APPLICATION REVIEW & DECLARATION
            ═══════════════════════════════════════════════ */}
        {step === 6 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="text-left">
              <span className="text-xs font-semibold text-[#0f4c81] dark:text-[#58a6ff] uppercase tracking-wider">
                Step 6 of 6
              </span>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#171717] dark:text-[#f0f6fc] mt-1">
                Review Your Verification Application
              </h1>
              <p className="text-xs sm:text-sm text-[#77716b] dark:text-[#8b949e] mt-1.5 leading-relaxed">
                Confirm your claimed professional credentials before submission to the verification compliance desk.
              </p>
            </div>

            {/* If documents were deferred/skipped */}
            {(skippedDocuments ||
              documentRequirements.some((d) => d.mandatory && !uploadedDocs[d.id])) && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
                <Clock className="size-4.5 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-900 dark:text-amber-200">
                    Documents Pending — 72-Hour Verification Grace Period
                  </h4>
                  <p className="mt-0.5 leading-relaxed">
                    You have chosen to upload documents later. You will be able to explore MGN and can complete your document uploads anytime from your profile or settings within the 72-hour window.
                  </p>
                </div>
              </div>
            )}

            {/* Application Overview Card */}
            <div className="p-6 sm:p-8 rounded-3xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] space-y-6">
              {/* Header profile summary */}
              <div className="flex items-start justify-between pb-5 border-b border-[#ded8d1]/60 dark:border-[#30363d]">
                <div className="flex items-center gap-3.5">
                  <div className="size-14 rounded-2xl bg-[#0f4c81] text-white flex items-center justify-center font-semibold text-lg">
                    {legalFirstName[0] || "M"}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#171717] dark:text-[#f0f6fc]">
                      {claimedTitle ? `${claimedTitle} ` : ""}
                      {legalFirstName} {legalLastName}
                    </h3>
                    <p className="text-xs text-[#0f4c81] dark:text-[#58a6ff] font-medium">
                      {currentSchema.name} • {city}, {state}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                  Pending Submission
                </span>
              </div>

              {/* Grid of details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#77716b] dark:text-[#8b949e] block">Account Type:</span>
                  <span className="font-semibold text-[#171717] dark:text-[#f0f6fc]">
                    {accountType === "INDIVIDUAL" ? "Individual Healthcare Professional" : "Healthcare Organization"}
                  </span>
                </div>

                <div>
                  <span className="text-[#77716b] dark:text-[#8b949e] block">Category:</span>
                  <span className="font-semibold text-[#171717] dark:text-[#f0f6fc]">
                    {category} ({professionOrType})
                  </span>
                </div>

                {dynamicValues.primary_degree && (
                  <div>
                    <span className="text-[#77716b] dark:text-[#8b949e] block">Qualification:</span>
                    <span className="font-semibold text-[#171717] dark:text-[#f0f6fc]">
                      {dynamicValues.primary_degree}
                    </span>
                  </div>
                )}

                {dynamicValues.registration_number && (
                  <div>
                    <span className="text-[#77716b] dark:text-[#8b949e] block">Council Registration #:</span>
                    <span className="font-semibold text-[#171717] dark:text-[#f0f6fc]">
                      {dynamicValues.registration_number} ({dynamicValues.medical_council || "Council"})
                    </span>
                  </div>
                )}

                {dynamicValues.institution && (
                  <div>
                    <span className="text-[#77716b] dark:text-[#8b949e] block">Institution / College:</span>
                    <span className="font-semibold text-[#171717] dark:text-[#f0f6fc]">
                      {dynamicValues.institution}
                    </span>
                  </div>
                )}

                {dynamicValues.current_organization && (
                  <div>
                    <span className="text-[#77716b] dark:text-[#8b949e] block">Hospital / Clinic Practice:</span>
                    <span className="font-semibold text-[#171717] dark:text-[#f0f6fc]">
                      {dynamicValues.current_organization}
                    </span>
                  </div>
                )}
              </div>

              {/* Document checklist */}
              <div className="pt-4 border-t border-[#ded8d1]/60 dark:border-[#30363d]">
                <h4 className="text-xs font-semibold text-[#171717] dark:text-[#f0f6fc] mb-3">
                  Verification Documents Checklist ({Object.keys(uploadedDocs).length}/{documentRequirements.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {documentRequirements.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-[#faf9f8] dark:bg-[#0d1117] border border-[#ded8d1]/40 dark:border-[#30363d]/40 text-xs"
                    >
                      {uploadedDocs[d.id] ? (
                        <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <Clock className="size-4 text-amber-500 shrink-0" />
                      )}
                      <span className="truncate">{d.name}</span>
                      <span className="text-[10px] text-[#77716b] ml-auto font-normal">
                        {d.mandatory ? "Required" : "Optional"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Legal Declaration Checkbox */}
            <div className="p-5 rounded-2xl bg-[#eef5fc]/60 dark:bg-[#161b22] border border-[#0f4c81]/20 dark:border-[#58a6ff]/20">
              <label className="flex items-start gap-3 cursor-pointer text-xs text-[#171717] dark:text-[#f0f6fc]">
                <input
                  type="checkbox"
                  checked={confirmedDeclaration}
                  onChange={(e) => setConfirmedDeclaration(e.target.checked)}
                  className="mt-0.5 size-4 rounded border-[#ded8d1] dark:border-[#30363d] text-[#0f4c81] focus:ring-[#0f4c81]"
                />
                <span className="leading-relaxed font-normal">
                  I solemnly declare and confirm that the professional qualifications, registration credentials, and
                  information provided are authentic. I understand that full verification of my clinical credentials
                  requires valid documents within 72 hours, and fraudulent claims are subject to account restriction.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            BOTTOM ACTION BUTTONS
            ═══════════════════════════════════════════════ */}
        <div className="mt-8 pt-6 border-t border-[#ded8d1]/70 dark:border-[#1e293b] flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBackStep}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-[#5d5854] dark:text-[#8b949e] hover:bg-[#f0efee] dark:hover:bg-[#21262d] transition cursor-pointer"
            >
              <ArrowLeft className="size-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => signOutUser("/login")}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-[#5d5854] dark:text-[#8b949e] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-[#f0efee] dark:hover:bg-[#21262d] transition cursor-pointer"
              title="Sign out and return to the login page"
            >
              <ArrowLeft className="size-4" />
              <span>Exit to Login</span>
            </button>
          )}

          <div className="flex items-center gap-3">
            {step === 5 && (
              <button
                type="button"
                onClick={handleSkipDocuments}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#ded8d1] dark:border-[#30363d] px-4 py-2.5 text-xs sm:text-sm font-medium text-[#5d5854] dark:text-[#8b949e] hover:bg-[#f0efee] dark:hover:bg-[#21262d] transition cursor-pointer"
              >
                <span>Skip for now</span>
                <ArrowRight className="size-3.5" />
              </button>
            )}

            {step < 6 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0f4c81] dark:bg-[#14559b] px-6 py-2.5 text-xs sm:text-sm font-medium text-white shadow-xs hover:bg-[#0c3c66] dark:hover:bg-[#0f4c81] transition cursor-pointer active:scale-98"
              >
                <span>Continue</span>
                <ArrowRight className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={submitting || !confirmedDeclaration}
                className="inline-flex items-center gap-2 rounded-xl bg-[#16804d] px-6 py-3 text-xs sm:text-sm font-medium text-white shadow-xs hover:bg-[#136b40] transition disabled:opacity-50 cursor-pointer active:scale-98"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" />
                    <span>Processing Submission...</span>
                  </>
                ) : skippedDocuments || documentRequirements.some((d) => d.mandatory && !uploadedDocs[d.id]) ? (
                  <>
                    <Clock className="size-4" />
                    <span>Complete Setup (72h Grace Window)</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="size-4" />
                    <span>Submit & Request Verification</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
