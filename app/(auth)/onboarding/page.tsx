"use client";

import * as React from "react";
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
  AlertCircle,
  Stethoscope,
  Hospital,
  Sparkles,
  Check,
} from "lucide-react";
import {
  INDIVIDUAL_CATEGORIES,
  ORGANISATION_TYPES,
  CATEGORY_PROFESSIONS,
  PROFESSION_SCHEMAS,
  ORGANISATION_SCHEMAS,
  getProfessionSchema,
  getOrganisationSchema,
  type AccountType,
  type DynamicFormField,
  type DocumentRequirement,
  type ProfessionSchema,
} from "@/modules/onboarding/config/schemas";

const DRAFT_STORAGE_KEY = "mgn_onboarding_form_draft";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = React.useState<number>(1);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  // Form State
  const [accountType, setAccountType] = React.useState<AccountType>("INDIVIDUAL");
  const [category, setCategory] = React.useState<string>("healthcare_professional");
  const [professionOrType, setProfessionOrType] = React.useState<string>("doctor");

  // Basic Details
  const [legalFirstName, setLegalFirstName] = React.useState<string>("");
  const [legalMiddleName, setLegalMiddleName] = React.useState<string>("");
  const [legalLastName, setLegalLastName] = React.useState<string>("");
  const [dob, setDob] = React.useState<string>("");
  const [gender, setGender] = React.useState<string>("male");
  const [country, setCountry] = React.useState<string>("India");
  const [state, setState] = React.useState<string>("");
  const [city, setCity] = React.useState<string>("");
  const [phone, setPhone] = React.useState<string>("");

  // Professional / Org Dynamic Details
  const [claimedTitle, setClaimedTitle] = React.useState<string>("Dr.");
  const [titleType, setTitleType] = React.useState<"PREFIX" | "SUFFIX">("PREFIX");
  const [dynamicValues, setDynamicValues] = React.useState<Record<string, any>>({});

  // Documents
  const [uploadedDocs, setUploadedDocs] = React.useState<Record<string, { id: string; name: string; size: number }>>({});
  const [uploadingDocId, setUploadingDocId] = React.useState<string | null>(null);
  // Correction notes & identity state
  const [correctionNote, setCorrectionNote] = React.useState<string | null>(null);

  // 1. Initial Load: Hydrate from localStorage first, then sync with Server DB
  React.useEffect(() => {
    // Read local cache immediately to prevent blank forms on refresh
    let savedLocalStep = 1;
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (cached) {
          const p = JSON.parse(cached);
          if (p.accountType) setAccountType(p.accountType);
          if (p.category) setCategory(p.category);
          if (p.professionOrType) setProfessionOrType(p.professionOrType);
          if (p.legalFirstName) setLegalFirstName(p.legalFirstName);
          if (p.legalMiddleName) setLegalMiddleName(p.legalMiddleName);
          if (p.legalLastName) setLegalLastName(p.legalLastName);
          if (p.dob) setDob(p.dob);
          if (p.gender) setGender(p.gender);
          if (p.country) setCountry(p.country);
          if (p.state) setState(p.state);
          if (p.city) setCity(p.city);
          if (p.phone) setPhone(p.phone);
          if (p.claimedTitle !== undefined) setClaimedTitle(p.claimedTitle);
          if (p.titleType) setTitleType(p.titleType);
          if (p.dynamicValues) setDynamicValues(p.dynamicValues);
          if (p.step && p.step >= 1 && p.step <= 5) {
            savedLocalStep = p.step;
            setStep(p.step);
          }
        }
      } catch (e) {
        console.warn("Failed to load local onboarding draft:", e);
      }
    }

    // Fetch server record
    fetch("/api/onboarding", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.identity) {
          const id = data.identity;
          if (id.verification_status === "APPROVED") {
            router.replace("/home");
            return;
          }
          if (
            id.verification_status === "UNDER_REVIEW" ||
            id.verification_status === "VERIFICATION_INCOMPLETE" ||
            id.verification_status === "REJECTED" ||
            id.verification_status === "SUSPENDED"
          ) {
            router.replace("/onboarding/status");
            return;
          }

          if (id.verification_status === "CORRECTION_REQUIRED") {
            setCorrectionNote(id.correction_reason || "Reviewer requested corrections to your uploaded KYC documents.");
            setStep(4);
            return;
          }

          if (id.account_type) setAccountType(id.account_type);
          if (id.category) setCategory(id.category);
          if (id.profession_or_type) setProfessionOrType(id.profession_or_type);
          if (id.legal_first_name) setLegalFirstName(id.legal_first_name);
          if (id.legal_middle_name) setLegalMiddleName(id.legal_middle_name);
          if (id.legal_last_name) setLegalLastName(id.legal_last_name);
          if (id.dob) setDob(id.dob.slice(0, 10));
          if (id.gender) setGender(id.gender);
          if (id.country) setCountry(id.country);
          if (id.state) setState(id.state);
          if (id.city) setCity(id.city);
          if (id.phone) setPhone(id.phone);

          if (data.titles && data.titles.length > 0) {
            setClaimedTitle(data.titles[0].claimed_title);
            setTitleType(data.titles[0].title_type);
          } else if (id.category === "student" || id.profession_or_type?.includes("student")) {
            setClaimedTitle("");
          }

          // Merge qualifications/registrations into dynamicValues if available
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
          }
          if (id.current_organization) {
            dynUpdates.current_organization = id.current_organization;
          }
          if (id.specialization) {
            dynUpdates.specialization = id.specialization;
          }
          if (id.experience_years !== undefined && id.experience_years !== null) {
            dynUpdates.experience_years = id.experience_years;
          }

          setDynamicValues((prev) => ({ ...dynUpdates, ...prev }));

          const existingDocs: Record<string, any> = {};
          data.documents?.forEach((d: any) => {
            existingDocs[d.document_type] = {
              id: d.id,
              name: d.file_name,
              size: d.file_size,
            };
          });
          setUploadedDocs((prev) => ({ ...existingDocs, ...prev }));

          // Determine step if local didn't specify higher
          if (savedLocalStep <= 1) {
            if (data.documents && data.documents.length > 0) {
              setStep(4);
            } else if (data.qualifications && data.qualifications.length > 0) {
              setStep(4);
            } else if (id.legal_first_name && id.city) {
              setStep(3);
            } else if (id.profession_or_type) {
              setStep(2);
            }
          }
        }
      })
      .catch((err) => console.error("Error loading onboarding state:", err))
      .finally(() => setLoading(false));
  }, [router]);

  // 2. Persist to localStorage whenever form values change
  React.useEffect(() => {
    if (loading) return;
    if (typeof window === "undefined") return;
    try {
      const draft = {
        step,
        accountType,
        category,
        professionOrType,
        legalFirstName,
        legalMiddleName,
        legalLastName,
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
    legalFirstName,
    legalMiddleName,
    legalLastName,
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

  // Handle Category Switch
  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    if (newCategory === "student") {
      setProfessionOrType("student");
      setClaimedTitle("");
    } else {
      const availableProfs = CATEGORY_PROFESSIONS[newCategory] || [];
      if (availableProfs.length > 0) {
        setProfessionOrType(availableProfs[0].id);
        if (availableProfs[0].id === "doctor") setClaimedTitle("Dr.");
        else if (availableProfs[0].id === "nurse") setClaimedTitle("RN");
        else setClaimedTitle("");
      }
    }
  };

  const isStudentMode = category === "student" || professionOrType.includes("student");

  const activeSchema =
    accountType === "INDIVIDUAL"
      ? (isStudentMode ? PROFESSION_SCHEMAS.student : getProfessionSchema(professionOrType))
      : getOrganisationSchema(professionOrType);

  const handleStartEnrollment = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const effectiveProfession = isStudentMode ? "student" : professionOrType;
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "START",
          account_type: accountType,
          category,
          profession_or_type: effectiveProfession,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to initialize enrollment");
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveBasicInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!legalFirstName.trim() || !country.trim() || !city.trim()) {
      setError("Please fill all required basic identity fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          legal_first_name: legalFirstName.trim(),
          legal_middle_name: legalMiddleName.trim(),
          legal_last_name: legalLastName.trim(),
          display_name: `${legalFirstName.trim()} ${legalLastName.trim()}`.trim(),
          dob: dob || null,
          gender,
          country,
          state,
          city,
          phone,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to save details");
      setStep(3);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveProfessionalDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate active schema required fields
    for (const f of activeSchema.fields) {
      if (f.required && !dynamicValues[f.name]?.toString().trim()) {
        setError(`Please fill required field: ${f.label}`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          claimed_title: isStudentMode ? null : (claimedTitle || null),
          title_type: titleType,
          ...dynamicValues,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to save credentials");
      setStep(4);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (docType: string, file: File) => {
    setError(null);
    setUploadingDocId(docType);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_type", docType);

    try {
      const res = await fetch("/api/onboarding/documents", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Upload failed");

      setUploadedDocs((prev) => ({
        ...prev,
        [docType]: {
          id: d.document.id,
          name: d.document.file_name,
          size: d.document.file_size,
        },
      }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploadingDocId(null);
    }
  };

  const handleFinalSubmitReview = async () => {
    setError(null);
    // Check all mandatory documents uploaded
    const missing = activeSchema.documents.filter((d) => d.mandatory && !uploadedDocs[d.id]);
    if (missing.length > 0) {
      setError(`Please upload all mandatory documents: ${missing.map((m) => m.name).join(", ")}`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/onboarding/submit-review", {
        method: "POST",
        credentials: "include",
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to submit for review");

      // Clean local storage draft upon successful completion
      if (typeof window !== "undefined") {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }

      router.push("/onboarding/status");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#faf9f8]">
        <div className="flex flex-col items-center gap-3">
          <div className="size-9 animate-spin rounded-full border-3 border-[#1769c2] border-t-transparent" />
          <p className="text-xs font-semibold text-[#77716b]">Restoring MGN Identity Portal...</p>
        </div>
      </div>
    );
  }

  const stepsList = [
    { num: 1, title: "Account Type" },
    { num: 2, title: "Basic Identity" },
    { num: 3, title: isStudentMode ? "Enrollment" : "Credentials" },
    { num: 4, title: "Documents" },
    { num: 5, title: "Review & Submit" },
  ];

  const availableProfessions =
    CATEGORY_PROFESSIONS[category] || [
      { id: "doctor", label: "Doctor / Medical Practitioner" },
      { id: "physiotherapist", label: "Physiotherapist" },
      { id: "nurse", label: "Nursing Professional" },
      { id: "student", label: "Medical / Health Science Student" },
      { id: "researcher", label: "Medical Researcher / Scientist" },
      { id: "other", label: "Other Health Science Professional" },
    ];

  return (
    <div className="min-h-dvh bg-[#faf9f8] text-[#171717]">
      {/* Header */}
      <header className="border-b border-[#e8e6e3] bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="MGN" className="h-7 w-auto object-contain" />
            <span className="hidden sm:inline-block h-4 w-px bg-[#ded8d1]" />
            <span className="hidden sm:inline-block text-xs font-bold text-[#171717]">
              Identity & Verification Gateway
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-[11px] font-bold text-[#1769c2]">
            <Clock className="h-3.5 w-3.5" />
            <span>3-Day Verification Window</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
        {/* Step Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {stepsList.map((s, idx) => (
              <div key={s.num} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (step > s.num) setStep(s.num);
                    }}
                    className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full text-xs font-bold transition ${
                      step > s.num
                        ? "bg-emerald-600 text-white cursor-pointer hover:bg-emerald-700"
                        : step === s.num
                        ? "bg-[#1769c2] text-white shadow-md ring-4 ring-[#1769c2]/15"
                        : "bg-[#e8e6e3] text-[#77716b]"
                    }`}
                  >
                    {step > s.num ? <Check className="h-4 w-4 stroke-[3]" /> : s.num}
                  </button>
                  <span
                    className={`mt-1 text-[10px] sm:text-xs font-semibold hidden md:block ${
                      step === s.num ? "text-[#1769c2]" : "text-[#77716b]"
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
                {idx < stepsList.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 transition-colors ${
                      step > s.num ? "bg-emerald-600" : "bg-[#e8e6e3]"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-start gap-2.5 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-medium text-rose-800 animate-in fade-in duration-150">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: ACCOUNT TYPE SELECTION */}
        {step === 1 && (
          <div className="rounded-3xl border border-[#e8e6e3] bg-white p-6 sm:p-8 shadow-xs">
            <h1 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight">
              What are you joining MGN as?
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#77716b] mb-6">
              MGN enforces a strict verified canonical identity. Select your primary account type.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Individual Option */}
              <div
                onClick={() => setAccountType("INDIVIDUAL")}
                className={`relative flex flex-col justify-between rounded-2xl border-2 p-5 cursor-pointer transition ${
                  accountType === "INDIVIDUAL"
                    ? "border-[#1769c2] bg-blue-50/40 shadow-xs"
                    : "border-[#e8e6e3] hover:border-[#ded8d1] bg-white"
                }`}
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-[#1769c2] mb-3">
                    <User className="h-6 w-6 stroke-[2]" />
                  </div>
                  <h3 className="text-base font-bold text-[#171717]">Individual</h3>
                  <p className="mt-1 text-xs text-[#77716b]">
                    Doctor, Physiotherapist, Nurse, Researcher, Medical Student or Healthcare Practitioner.
                  </p>
                </div>
                {accountType === "INDIVIDUAL" && (
                  <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#1769c2]">
                    <CheckCircle2 className="h-4 w-4" /> Selected
                  </div>
                )}
              </div>

              {/* Organisation Option */}
              <div
                onClick={() => setAccountType("ORGANISATION")}
                className={`relative flex flex-col justify-between rounded-2xl border-2 p-5 cursor-pointer transition ${
                  accountType === "ORGANISATION"
                    ? "border-[#1769c2] bg-blue-50/40 shadow-xs"
                    : "border-[#e8e6e3] hover:border-[#ded8d1] bg-white"
                }`}
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-[#4f46e5] mb-3">
                    <Building2 className="h-6 w-6 stroke-[2]" />
                  </div>
                  <h3 className="text-base font-bold text-[#171717]">Organisation</h3>
                  <p className="mt-1 text-xs text-[#77716b]">
                    Hospital, Clinic, Medical College, Diagnostic Lab, NGO or HealthTech Company.
                  </p>
                </div>
                {accountType === "ORGANISATION" && (
                  <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#1769c2]">
                    <CheckCircle2 className="h-4 w-4" /> Selected
                  </div>
                )}
              </div>
            </div>

            {/* Category and Specific Profession */}
            {accountType === "INDIVIDUAL" ? (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-[#5d5854] mb-1.5">
                    Professional Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full rounded-xl border border-[#ded8d1] px-3.5 py-2.5 text-xs sm:text-sm font-medium focus:border-[#1769c2] focus:outline-none bg-white"
                  >
                    {INDIVIDUAL_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5d5854] mb-1.5">
                    {category === "student" ? "Course / Student Stream" : "Specific Profession"}
                  </label>
                  <select
                    value={professionOrType}
                    onChange={(e) => setProfessionOrType(e.target.value)}
                    className="w-full rounded-xl border border-[#ded8d1] px-3.5 py-2.5 text-xs sm:text-sm font-medium focus:border-[#1769c2] focus:outline-none bg-white"
                  >
                    {availableProfessions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-[#5d5854] mb-1.5">
                    Organisation Type
                  </label>
                  <select
                    value={professionOrType}
                    onChange={(e) => setProfessionOrType(e.target.value)}
                    className="w-full rounded-xl border border-[#ded8d1] px-3.5 py-2.5 text-xs sm:text-sm font-medium focus:border-[#1769c2] focus:outline-none bg-white"
                  >
                    {ORGANISATION_TYPES.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleStartEnrollment}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1769c2] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow hover:bg-[#12569f] transition active:scale-95 disabled:opacity-50"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: BASIC IDENTITY */}
        {step === 2 && (
          <form onSubmit={handleSaveBasicInfo} className="rounded-3xl border border-[#e8e6e3] bg-white p-6 sm:p-8 shadow-xs">
            <h2 className="text-xl font-black text-[#171717] tracking-tight">
              Legal Identity & Location
            </h2>
            <p className="mt-1 text-xs text-[#77716b] mb-6">
              Enter legal details matching your government identity proof for verification.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-[#5d5854] mb-1">
                  Legal First Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shubham"
                  value={legalFirstName}
                  onChange={(e) => setLegalFirstName(e.target.value)}
                  className="w-full rounded-xl border border-[#ded8d1] px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#1769c2] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5d5854] mb-1">
                  Middle Name
                </label>
                <input
                  type="text"
                  placeholder="Optional"
                  value={legalMiddleName}
                  onChange={(e) => setLegalMiddleName(e.target.value)}
                  className="w-full rounded-xl border border-[#ded8d1] px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#1769c2] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5d5854] mb-1">
                  Legal Last Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sharma"
                  value={legalLastName}
                  onChange={(e) => setLegalLastName(e.target.value)}
                  className="w-full rounded-xl border border-[#ded8d1] px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#1769c2] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-[#5d5854] mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full rounded-xl border border-[#ded8d1] px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#1769c2] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5d5854] mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-xl border border-[#ded8d1] px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#1769c2] focus:outline-none bg-white"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5d5854] mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-[#ded8d1] px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#1769c2] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-[#5d5854] mb-1">
                  Country *
                </label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full rounded-xl border border-[#ded8d1] px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#1769c2] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5d5854] mb-1">
                  State / Province
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maharashtra"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full rounded-xl border border-[#ded8d1] px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#1769c2] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5d5854] mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-[#ded8d1] px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#1769c2] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#f0efee]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#ded8d1] px-4 py-2.5 text-xs font-semibold text-[#5d5854] hover:bg-[#f8f7f6]"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1769c2] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow hover:bg-[#12569f] transition active:scale-95 disabled:opacity-50"
              >
                <span>Save & Continue</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: DYNAMIC PROFESSIONAL CREDENTIALS / STUDENT ENROLLMENT */}
        {step === 3 && (
          <form onSubmit={handleSaveProfessionalDetails} className="rounded-3xl border border-[#e8e6e3] bg-white p-6 sm:p-8 shadow-xs">
            <h2 className="text-xl font-black text-[#171717] tracking-tight">
              {isStudentMode ? "Student Enrollment & Academic Details" : `${activeSchema.name} Credentials`}
            </h2>
            <p className="mt-1 text-xs text-[#77716b] mb-6">
              {isStudentMode
                ? "Provide your current college and expected year of graduation. (No license or council registration required for students)"
                : "Provide your verified qualification and council registration details."}
            </p>

            {/* Title Selection for Individual (Skipped for students) */}
            {accountType === "INDIVIDUAL" && !isStudentMode && (() => {
              const indSchema = activeSchema as ProfessionSchema;
              if (!indSchema.allowedPrefixes?.length && !indSchema.allowedSuffixes?.length) return null;
              return (
                <div className="mb-6 rounded-2xl bg-[#f0f7ff] border border-[#d0e5fc] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="h-4 w-4 text-[#1769c2]" />
                    <span className="text-xs font-bold text-[#1769c2]">
                      Claimed Professional Title (Subject to Verification)
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5d5854] mb-3">
                    This title will only appear publicly with verified badge after document approval.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {indSchema.allowedPrefixes?.map((prefix) => (
                      <button
                        key={prefix}
                        type="button"
                        onClick={() => {
                          setClaimedTitle(prefix);
                          setTitleType("PREFIX");
                        }}
                        className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                          claimedTitle === prefix
                            ? "bg-[#1769c2] text-white shadow-xs"
                            : "bg-white text-[#5d5854] border border-[#ded8d1] hover:bg-[#f8f7f6]"
                        }`}
                      >
                        {prefix}
                      </button>
                    ))}
                    {indSchema.allowedSuffixes?.map((suffix) => (
                      <button
                        key={suffix}
                        type="button"
                        onClick={() => {
                          setClaimedTitle(suffix);
                          setTitleType("SUFFIX");
                        }}
                        className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                          claimedTitle === suffix
                            ? "bg-[#1769c2] text-white shadow-xs"
                            : "bg-white text-[#5d5854] border border-[#ded8d1] hover:bg-[#f8f7f6]"
                        }`}
                      >
                        , {suffix}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setClaimedTitle("")}
                      className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                        !claimedTitle
                          ? "bg-[#1769c2] text-white"
                          : "bg-white text-[#5d5854] border border-[#ded8d1] hover:bg-[#f8f7f6]"
                      }`}
                    >
                      No Title
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Dynamic Fields */}
            <div className="space-y-4 mb-6">
              {activeSchema.fields.map((f) => (
                <div key={f.name}>
                  <label className="block text-xs font-bold text-[#5d5854] mb-1">
                    {f.label} {f.required && "*"}
                  </label>
                  {f.type === "select" ? (
                    <select
                      required={f.required}
                      value={dynamicValues[f.name] || ""}
                      onChange={(e) =>
                        setDynamicValues((prev) => ({ ...prev, [f.name]: e.target.value }))
                      }
                      className="w-full rounded-xl border border-[#ded8d1] px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#1769c2] focus:outline-none bg-white"
                    >
                      <option value="">Select {f.label}</option>
                      {f.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={f.type}
                      required={f.required}
                      placeholder={f.placeholder}
                      value={dynamicValues[f.name] || ""}
                      onChange={(e) =>
                        setDynamicValues((prev) => ({ ...prev, [f.name]: e.target.value }))
                      }
                      className="w-full rounded-xl border border-[#ded8d1] px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#1769c2] focus:outline-none"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#f0efee]">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#ded8d1] px-4 py-2.5 text-xs font-semibold text-[#5d5854] hover:bg-[#f8f7f6]"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1769c2] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow hover:bg-[#12569f] transition active:scale-95 disabled:opacity-50"
              >
                <span>Save & Continue</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: DOCUMENT UPLOAD */}
        {step === 4 && (
          <div className="rounded-3xl border border-[#e8e6e3] bg-white p-6 sm:p-8 shadow-xs">
            {correctionNote && (
              <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <AlertCircle className="h-4 w-4 text-amber-700" />
                  <span>Reviewer Requested Corrections:</span>
                </div>
                <p className="leading-relaxed">{correctionNote}</p>
              </div>
            )}

            <div className="mb-6 rounded-2xl bg-[#f0f7ff] border border-[#d0e5fc] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-[#1769c2] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-[#1769c2] uppercase tracking-wide">
                    3-Day Verification Grace Period
                  </h3>
                  <p className="text-xs text-[#5d5854] mt-0.5">
                    Document upload is not mandatory right now. You can skip and enjoy full platform access for 72 hours!
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => router.push("/home")}
                className="shrink-0 rounded-xl bg-white border border-[#1769c2] px-3.5 py-1.5 text-xs font-bold text-[#1769c2] hover:bg-blue-50 transition shadow-2xs"
              >
                Skip & Start Exploring →
              </button>
            </div>

            <h2 className="text-xl font-black text-[#171717] tracking-tight">
              Verification KYC Documents
            </h2>
            <p className="mt-1 text-xs text-[#77716b] mb-6">
              Upload clear PDF or image copies. Documents are stored in secure private storage.
            </p>

            <div className="space-y-4 mb-6">
              {activeSchema.documents.map((docReq) => {
                const uploaded = uploadedDocs[docReq.id];
                const isUploading = uploadingDocId === docReq.id;

                return (
                  <div
                    key={docReq.id}
                    className={`rounded-2xl border p-4 sm:p-5 transition ${
                      uploaded
                        ? "border-emerald-200 bg-emerald-50/40"
                        : docReq.mandatory
                        ? "border-[#ded8d1] bg-white"
                        : "border-[#e8e6e3] bg-[#faf9f8]"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-[#171717]">
                            {docReq.name}
                          </span>
                          {docReq.mandatory ? (
                            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                              Mandatory
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-[#77716b]">
                              Optional
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-[#77716b]">{docReq.description}</p>
                      </div>

                      {/* Upload CTA */}
                      <div>
                        {uploaded ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-3 py-1.5 rounded-xl">
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="truncate max-w-[140px]">{uploaded.name}</span>
                            </span>
                            <label className="cursor-pointer text-[11px] font-semibold text-[#1769c2] hover:underline">
                              Replace
                              <input
                                type="file"
                                className="hidden"
                                accept=".pdf,image/jpeg,image/png"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) handleFileUpload(docReq.id, f);
                                }}
                              />
                            </label>
                          </div>
                        ) : (
                          <label
                            className={`inline-flex items-center gap-1.5 rounded-xl border border-[#ded8d1] bg-white px-4 py-2 text-xs font-bold text-[#171717] hover:bg-[#f8f7f6] hover:border-[#1769c2] transition cursor-pointer shadow-2xs ${
                              isUploading ? "opacity-50 pointer-events-none" : ""
                            }`}
                          >
                            <UploadCloud className="h-4 w-4 text-[#1769c2]" />
                            <span>{isUploading ? "Uploading..." : "Upload File"}</span>
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,image/jpeg,image/png"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleFileUpload(docReq.id, f);
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#f0efee]">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#ded8d1] px-4 py-2.5 text-xs font-semibold text-[#5d5854] hover:bg-[#f8f7f6]"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.push("/home")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#ded8d1] bg-[#f8f7f6] px-4 py-2.5 text-xs font-bold text-[#5d5854] hover:bg-[#eae8e5] transition"
                >
                  <Clock className="h-3.5 w-3.5 text-[#1769c2]" />
                  <span>Skip for now</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1769c2] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow hover:bg-[#12569f] transition active:scale-95"
                >
                  <span>Proceed to Review</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: REVIEW & FINAL SUBMIT */}
        {step === 5 && (
          <div className="rounded-3xl border border-[#e8e6e3] bg-white p-6 sm:p-8 shadow-xs">
            <h2 className="text-xl font-black text-[#171717] tracking-tight">
              Confirm & Submit for Review
            </h2>
            <p className="mt-1 text-xs text-[#77716b] mb-6">
              Review your information. Once submitted, your profile will enter the admin verification queue.
            </p>

            <div className="space-y-4 mb-6">
              {/* Summary Card */}
              <div className="rounded-2xl bg-[#f8f7f6] border border-[#e8e6e3] p-4 sm:p-5 space-y-3">
                <div className="flex justify-between items-center border-b border-[#e8e6e3] pb-3">
                  <div>
                    <span className="text-[11px] font-bold text-[#77716b] uppercase">
                      Canonical Identity
                    </span>
                    <h3 className="text-base font-bold text-[#171717]">
                      {claimedTitle ? `${claimedTitle} ` : ""}
                      {legalFirstName} {legalLastName}
                    </h3>
                  </div>
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-[#1769c2]">
                    {activeSchema.name}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#77716b]">Location:</span>{" "}
                    <strong className="text-[#171717]">{city}, {country}</strong>
                  </div>
                  {dynamicValues.primary_degree && (
                    <div>
                      <span className="text-[#77716b]">{isStudentMode ? "Course Enrolled:" : "Degree:"}</span>{" "}
                      <strong className="text-[#171717]">{dynamicValues.primary_degree}</strong>
                    </div>
                  )}
                  {dynamicValues.institution && (
                    <div>
                      <span className="text-[#77716b]">College / University:</span>{" "}
                      <strong className="text-[#171717]">{dynamicValues.institution}</strong>
                    </div>
                  )}
                  {dynamicValues.graduation_year && (
                    <div>
                      <span className="text-[#77716b]">{isStudentMode ? "Expected Graduation:" : "Graduation Year:"}</span>{" "}
                      <strong className="text-[#171717]">{dynamicValues.graduation_year}</strong>
                    </div>
                  )}
                  {dynamicValues.medical_council && (
                    <div>
                      <span className="text-[#77716b]">Council:</span>{" "}
                      <strong className="text-[#171717]">{dynamicValues.medical_council}</strong>
                    </div>
                  )}
                  {dynamicValues.registration_number && (
                    <div>
                      <span className="text-[#77716b]">Reg Number:</span>{" "}
                      <strong className="text-[#171717]">{dynamicValues.registration_number}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Uploaded Documents Check */}
              <div className="rounded-2xl border border-[#e8e6e3] p-4">
                <h4 className="text-xs font-bold text-[#171717] mb-2">Attached KYC Documents</h4>
                <div className="space-y-1.5">
                  {activeSchema.documents.map((d) => {
                    const isUp = uploadedDocs[d.id];
                    return (
                      <div key={d.id} className="flex items-center justify-between text-xs">
                        <span className="text-[#5d5854]">{d.name}</span>
                        {isUp ? (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                            <Check className="h-3.5 w-3.5" /> Uploaded
                          </span>
                        ) : d.mandatory ? (
                          <span className="font-bold text-rose-600">Missing *</span>
                        ) : (
                          <span className="text-[#8a8784]">Optional (Not added)</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#f0efee]">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#ded8d1] px-4 py-2.5 text-xs font-semibold text-[#5d5854] hover:bg-[#f8f7f6]"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleFinalSubmitReview}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition active:scale-95 disabled:opacity-50"
              >
                <ShieldCheck className="h-4.5 w-4.5" />
                <span>{submitting ? "Submitting..." : "Submit & Request Review"}</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
