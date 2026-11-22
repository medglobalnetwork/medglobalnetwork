"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
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
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  ChevronDown,
  Info,
} from "lucide-react";

// ============================================================
// SUBCATEGORY & FIELD DATA DICTIONARY
// ============================================================

const STUDENT_COURSES = [
  "MBBS",
  "BDS",
  "Nursing (B.Sc / GNM)",
  "Pharmacy (B.Pharm / Pharm.D)",
  "Physiotherapy (BPT)",
  "AYUSH (BAMS / BHMS / BUMS)",
  "Paramedical Sciences",
  "Other Health Sciences Degree",
];

const MBBS_STAGES = [
  "First Professional (Year 1)",
  "Second Professional (Year 2)",
  "Third Professional Part I (Year 3)",
  "Third Professional Part II (Final Year)",
  "Internship (CRRI)",
  "Other",
];

const GENERAL_ACADEMIC_STAGES = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "Final Year / Internship",
  "Post-Graduate (MD/MS/M.Sc)",
  "Other",
];

const DOCTOR_SPECIALIZATIONS = [
  "General Medicine",
  "General Surgery",
  "Pediatrics",
  "Obstetrics & Gynecology",
  "Orthopedics",
  "Cardiology",
  "Dermatology & Venereology",
  "Psychiatry & Behavioral Health",
  "Radiology & Imaging",
  "Anesthesiology & Critical Care",
  "Ophthalmology",
  "ENT (Otorhinolaryngology)",
  "Neurology",
  "Oncology & Cancer Care",
  "Pathology & Laboratory Medicine",
  "Emergency Medicine",
  "Pulmonology / Respiratory Medicine",
  "Gastroenterology",
  "Nephrology",
  "Urology",
  "Community Medicine & Public Health",
  "Dentistry (BDS / MDS)",
  "AYUSH (Ayurveda / Homeopathy)",
  "Other Specialization",
];

const NURSE_CATEGORIES = [
  "Staff Nurse (Registered Nurse RN / RM)",
  "Critical Care / ICU Nurse",
  "Operation Theatre (OT) Nurse",
  "Pediatric & Neonatal (NICU) Nurse",
  "Midwife & Obstetric Nurse",
  "Emergency & Trauma Nurse",
  "Nursing Tutor / Clinical Educator",
  "Chief Nursing Officer (CNO) / Supervisor",
  "Other Nursing Category",
];

const PHARMACIST_CATEGORIES = [
  "Clinical Pharmacist",
  "Hospital / Inpatient Pharmacist",
  "Retail & Community Pharmacist",
  "Industrial & Production Pharmacist",
  "Quality Assurance & R&D Pharmacist",
  "Regulatory Affairs Pharmacist",
  "Other Pharmacy Category",
];

const PHYSIOTHERAPIST_CATEGORIES = [
  "BPT (Bachelor of Physiotherapy)",
  "MPT - Orthopedics & Musculoskeletal",
  "MPT - Neurology & Psychosomatic",
  "MPT - Sports Physiotherapy",
  "MPT - Cardiopulmonary Physiotherapy",
  "MPT - Pediatrics",
  "MPT - Community & Geriatrics",
  "DPT (Doctor of Physical Therapy)",
  "Other",
];

const PARAMEDICAL_CATEGORIES = [
  "Medical Laboratory Technologist (MLT / Pathology)",
  "Radiology & Imaging Technologist (X-Ray / CT / MRI)",
  "Emergency Medical Technician (EMT / Paramedic)",
  "Operation Theatre & Anesthesia Technologist",
  "Dialysis Technologist",
  "Cardiac Care / Cath Lab Technologist",
  "Optometry & Ophthalmic Technologist",
  "Respiratory Therapy Technologist",
  "Other Paramedical Discipline",
];

const RESEARCHER_AREAS = [
  "Clinical Trials & Human Studies",
  "Oncology & Cancer Biology",
  "Public Health & Epidemiology",
  "Infectious Diseases & Immunology",
  "Neuroscience & Mental Health",
  "Biotechnology & Pharmacology",
  "Genetics & Molecular Medicine",
  "Biomedical Engineering & Medical Devices",
  "Healthcare AI & Medical Informatics",
  "Other Research Domain",
];

const FACULTY_DISCIPLINES = [
  "Anatomy & Histology",
  "Physiology",
  "Biochemistry",
  "Pharmacology",
  "Pathology & Laboratory Medicine",
  "Microbiology",
  "Forensic Medicine & Toxicology",
  "Community Medicine & Preventive Care",
  "General Medicine & Clinical Sciences",
  "General Surgery & Surgical Specialties",
  "Nursing Sciences",
  "Pharmaceutical Sciences",
  "Other Academic Discipline",
];

const BUSINESS_ACTIVITIES = [
  "Hospital / Nursing Home / Specialized Clinic",
  "Diagnostic Center / Pathological Laboratory",
  "Retail / Wholesale Pharmacy / Chemist",
  "Medical Equipment & Device Manufacturing",
  "Healthcare IT / Telemedicine / HealthTech",
  "Medical Distribution & Surgical Consumables",
  "Home Healthcare & Patient Care Agency",
  "Other Healthcare Enterprise",
];

const SERVICE_CATEGORIES = [
  "Healthcare Management & Hospital Consulting",
  "Biomedical Equipment Maintenance & Service (BMES)",
  "Tele-consulting & Digital Clinical Services",
  "Home Healthcare & Hospice Nursing Services",
  "Healthcare Staffing & Medical Recruitment",
  "Medical Billing, Coding & Revenue Cycle",
  "Other Healthcare Service",
];

const TRAINEE_PROGRAMMES = [
  "Medical Compulsory Rotatory Internship (CRRI)",
  "Junior Resident / Post-Graduate Residency (MD/MS)",
  "Senior Residency / Post-Doctoral Fellowship",
  "Nursing Clinical Intern",
  "Pharmacy Practice Intern",
  "Physiotherapy Clinical Intern",
  "Other Healthcare Internship / Fellowship",
];

const OTHER_DOMAINS = [
  "Healthcare Administration & Operations",
  "Health Policy, Public Health & Advocacy",
  "Medical Law, Ethics & Regulatory Compliance",
  "Medical Communications & Healthcare Writing",
  "Community Health Worker / Public Health NGO",
  "Other Health-Related Engagement",
];

// Details State Interface
export interface IdentityDetailsState {
  student?: { course: string; stage: string };
  doctor?: { specialization: string };
  nurse?: { category: string };
  pharmacist?: { category: string };
  physiotherapist?: { category: string };
  paramedical?: { category: string };
  researcher?: { researchArea: string };
  faculty?: { discipline: string };
  business_owner?: { businessActivity: string };
  service_provider?: { serviceCategory: string };
  intern_trainee?: { programme: string };
  other?: { domain: string };
}

export default function IndividualIdentityDetailsPage() {
  const router = useRouter();

  // User & Selection state
  const [userId, setUserId] = React.useState<string>("");
  const [selectedIdentities, setSelectedIdentities] = React.useState<string[]>([]);
  const [isLoaded, setIsLoaded] = React.useState(false);

  // Form Details State
  const [details, setDetails] = React.useState<IdentityDetailsState>({});

  // Loading & Error States
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSkipping, setIsSkipping] = React.useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = React.useState<"saved" | "saving" | null>(null);
  const [backendError, setBackendError] = React.useState<string | null>(null);

  // 1. Load selected identities from localStorage or backend
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedUser = localStorage.getItem("mgn_onboarding_registered_user");
        if (storedUser) {
          const u = JSON.parse(storedUser);
          if (u.userId) setUserId(u.userId);
        }

        let ids: string[] = [];
        const savedIds = localStorage.getItem("mgn_onboarding_selected_identities");
        if (savedIds) {
          const parsed = JSON.parse(savedIds);
          if (Array.isArray(parsed) && parsed.length > 0) {
            ids = parsed;
          }
        }

        // Default to doctor & student for direct previews if empty
        if (ids.length === 0) {
          ids = ["doctor", "student"];
        }
        setSelectedIdentities(ids);

        // Restore saved details if available
        const savedDetails = localStorage.getItem("mgn_onboarding_identity_details");
        if (savedDetails) {
          setDetails(JSON.parse(savedDetails));
        } else {
          // Initialize defaults
          setDetails({
            student: { course: "MBBS", stage: "Third Professional Part I (Year 3)" },
            doctor: { specialization: "General Medicine" },
            nurse: { category: NURSE_CATEGORIES[0] },
            pharmacist: { category: PHARMACIST_CATEGORIES[0] },
            physiotherapist: { category: PHYSIOTHERAPIST_CATEGORIES[0] },
            paramedical: { category: PARAMEDICAL_CATEGORIES[0] },
            researcher: { researchArea: RESEARCHER_AREAS[0] },
            faculty: { discipline: FACULTY_DISCIPLINES[0] },
            business_owner: { businessActivity: BUSINESS_ACTIVITIES[0] },
            service_provider: { serviceCategory: SERVICE_CATEGORIES[0] },
            intern_trainee: { programme: TRAINEE_PROGRAMMES[0] },
            other: { domain: OTHER_DOMAINS[0] },
          });
        }
        setIsLoaded(true);
      } catch (e) {
        console.warn("Could not load stored identity details:", e);
        setIsLoaded(true);
      }
    }
  }, []);

  // 2. Auto-save progress locally
  React.useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      try {
        localStorage.setItem("mgn_onboarding_identity_details", JSON.stringify(details));
        setAutoSaveStatus("saved");
      } catch (e) {
        console.warn("Could not auto-save identity details:", e);
      }
    }
  }, [details, isLoaded]);

  // Helper updater
  const updateSection = (key: keyof IdentityDetailsState, field: string, value: string) => {
    setDetails((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] as any),
        [field]: value,
      },
    }));
  };

  // ─────────────────────────────────────────────
  // SUBMIT: SAVE & CONTINUE
  // ─────────────────────────────────────────────
  const handleSaveAndContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setBackendError(null);
    setIsSaving(true);

    try {
      const payload = {
        userId,
        selectedIdentities,
        identityDetails: details,
        isSkip: false,
      };

      const res = await fetch("/api/onboarding/identity-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setBackendError(data.error || "Failed to save identity details. Please try again.");
        setIsSaving(false);
        return;
      }

      // Route to Page 7: Completion
      router.push("/onboarding/individual/complete");
    } catch (err) {
      console.error("Save identity details network error:", err);
      setBackendError("Network error. Please check your connection and try again.");
      setIsSaving(false);
    }
  };

  // ─────────────────────────────────────────────
  // SKIP FOR NOW
  // ─────────────────────────────────────────────
  const handleSkip = async () => {
    if (isSkipping) return;
    setIsSkipping(true);

    try {
      const payload = {
        userId,
        selectedIdentities,
        identityDetails: details,
        isSkip: true,
      };

      await fetch("/api/onboarding/identity-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});

      router.push("/onboarding/individual/complete");
    } catch {
      router.push("/onboarding/individual/complete");
    }
  };

  const studentCourse = details.student?.course || "MBBS";
  const isMBBS = studentCourse === "MBBS";

  return (
    <div className="min-h-dvh bg-white dark:bg-[#0b131e] text-[#1f2937] dark:text-[#f3f4f6] flex flex-col font-sans">
      {/* ─────────────────────────────────────────────
          1. HEADER
          ───────────────────────────────────────────── */}
      <header className="w-full border-b border-slate-100 dark:border-slate-800/80 bg-white/95 dark:bg-[#0b131e]/95 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo on Left */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="MED Global Network Logo"
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

          {/* Right Header Navigation */}
          <div className="flex items-center gap-4 text-xs sm:text-sm">
            {autoSaveStatus === "saved" && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-3.5" />
                <span>Progress saved</span>
              </span>
            )}
            <button
              type="button"
              onClick={handleSkip}
              disabled={isSkipping}
              className="text-xs font-semibold text-slate-500 hover:text-[#102D45] dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
            >
              {isSkipping ? "Skipping..." : "Skip for now"}
            </button>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────
          2. MAIN CONTENT AREA
          ───────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-start py-8 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-3xl mx-auto space-y-6">
          {/* Back Navigation */}
          <div>
            <Link
              href="/onboarding/individual/identity"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#102D45] dark:text-slate-400 dark:hover:text-white transition group"
            >
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Back to Identity Selection</span>
            </Link>
          </div>

          {/* Main Card Container */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#121c2a] p-6 sm:p-9 shadow-md relative overflow-hidden">
            {/* Header inside Card */}
            <div className="space-y-2 pb-6 border-b border-slate-100 dark:border-slate-800 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#168B78]/10 text-[#168B78] dark:bg-teal-950/40 dark:text-[#2dd4bf]">
                <ShieldCheck className="size-3.5" />
                <span>Step 6 of Onboarding · Role Details</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102D45] dark:text-white tracking-tight">
                Your Healthcare Identity
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Tell us a little more about your selected roles. You can complete detailed information later.
              </p>
            </div>

            {/* Error Alert */}
            {backendError && (
              <div className="mt-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs sm:text-sm text-rose-700 dark:text-rose-300 flex items-start gap-2.5 animate-in fade-in">
                <AlertTriangle className="size-4 shrink-0 text-rose-500 mt-0.5" />
                <span className="leading-relaxed font-medium">{backendError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveAndContinue} className="mt-7 space-y-6 text-left" noValidate>
              {/* ─────────────────────────────────────────────
                  DYNAMIC IDENTITY SECTIONS
                  ───────────────────────────────────────────── */}

              {/* 1. STUDENT SECTION */}
              {selectedIdentities.includes("student") && (
                <div className="p-5 rounded-2xl border border-teal-200/70 dark:border-teal-900/50 bg-teal-50/20 dark:bg-teal-950/10 space-y-4 animate-in fade-in">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-teal-100 dark:border-teal-900/50">
                    <div className="size-8.5 rounded-lg bg-[#168B78] text-white flex items-center justify-center">
                      <GraduationCap className="size-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#102D45] dark:text-white">
                        Student Details
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Academic programme and current year of study
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Course / Programme */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#102D45] dark:text-slate-200">
                        Course / Programme
                      </label>
                      <select
                        value={details.student?.course || "MBBS"}
                        onChange={(e) => updateSection("student", "course", e.target.value)}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0b131e] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-[#168B78] transition-all cursor-pointer"
                      >
                        {STUDENT_COURSES.map((course) => (
                          <option key={course} value={course}>
                            {course}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Academic Stage */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#102D45] dark:text-slate-200">
                        Current Academic Stage
                      </label>
                      <select
                        value={
                          details.student?.stage ||
                          (isMBBS ? MBBS_STAGES[0] : GENERAL_ACADEMIC_STAGES[0])
                        }
                        onChange={(e) => updateSection("student", "stage", e.target.value)}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0b131e] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-[#168B78] transition-all cursor-pointer"
                      >
                        {(isMBBS ? MBBS_STAGES : GENERAL_ACADEMIC_STAGES).map((stg) => (
                          <option key={stg} value={stg}>
                            {stg}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. DOCTOR SECTION */}
              {selectedIdentities.includes("doctor") && (
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-[#0e1622] space-y-4 animate-in fade-in">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="size-8.5 rounded-lg bg-[#102D45] text-white flex items-center justify-center">
                      <Stethoscope className="size-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#102D45] dark:text-white">
                        Doctor Practice Focus
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Primary clinical specialization or department
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#102D45] dark:text-slate-200">
                      Medical Specialization
                    </label>
                    <select
                      value={details.doctor?.specialization || DOCTOR_SPECIALIZATIONS[0]}
                      onChange={(e) => updateSection("doctor", "specialization", e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0b131e] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-[#168B78] transition-all cursor-pointer"
                    >
                      {DOCTOR_SPECIALIZATIONS.map((spec) => (
                        <option key={spec} value={spec}>
                          {spec}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* 3. NURSE SECTION */}
              {selectedIdentities.includes("nurse") && (
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-[#0e1622] space-y-4 animate-in fade-in">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="size-8.5 rounded-lg bg-[#102D45] text-white flex items-center justify-center">
                      <HeartPulse className="size-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#102D45] dark:text-white">
                        Nursing Professional Details
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Nursing qualification and primary clinical department
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#102D45] dark:text-slate-200">
                      Nursing Qualification Category
                    </label>
                    <select
                      value={details.nurse?.category || NURSE_CATEGORIES[0]}
                      onChange={(e) => updateSection("nurse", "category", e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0b131e] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-[#168B78] transition-all cursor-pointer"
                    >
                      {NURSE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* 4. PHARMACIST SECTION */}
              {selectedIdentities.includes("pharmacist") && (
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-[#0e1622] space-y-4 animate-in fade-in">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="size-8.5 rounded-lg bg-[#102D45] text-white flex items-center justify-center">
                      <Pill className="size-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#102D45] dark:text-white">
                        Pharmacy Category
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Sector and area of pharmaceutical practice
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#102D45] dark:text-slate-200">
                      Pharmacy Qualification Category
                    </label>
                    <select
                      value={details.pharmacist?.category || PHARMACIST_CATEGORIES[0]}
                      onChange={(e) => updateSection("pharmacist", "category", e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0b131e] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-[#168B78] transition-all cursor-pointer"
                    >
                      {PHARMACIST_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* 5. PHYSIOTHERAPIST SECTION */}
              {selectedIdentities.includes("physiotherapist") && (
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-[#0e1622] space-y-4 animate-in fade-in">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="size-8.5 rounded-lg bg-[#102D45] text-white flex items-center justify-center">
                      <Activity className="size-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#102D45] dark:text-white">
                        Physiotherapy Specialization
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        BPT, MPT clinical branch, or physical rehabilitation focus
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#102D45] dark:text-slate-200">
                      Physiotherapy Qualification
                    </label>
                    <select
                      value={details.physiotherapist?.category || PHYSIOTHERAPIST_CATEGORIES[0]}
                      onChange={(e) => updateSection("physiotherapist", "category", e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0b131e] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-[#168B78] transition-all cursor-pointer"
                    >
                      {PHYSIOTHERAPIST_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* 6. PARAMEDICAL SECTION */}
              {selectedIdentities.includes("paramedical") && (
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-[#0e1622] space-y-4 animate-in fade-in">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="size-8.5 rounded-lg bg-[#102D45] text-white flex items-center justify-center">
                      <Ambulance className="size-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#102D45] dark:text-white">
                        Paramedical Discipline
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Diagnostic, emergency, or allied technology practice
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#102D45] dark:text-slate-200">
                      Professional Category
                    </label>
                    <select
                      value={details.paramedical?.category || PARAMEDICAL_CATEGORIES[0]}
                      onChange={(e) => updateSection("paramedical", "category", e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0b131e] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-[#168B78] transition-all cursor-pointer"
                    >
                      {PARAMEDICAL_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* 7. ALLIED HEALTH SECTION */}
              {selectedIdentities.includes("allied_health") && (
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-[#0e1622] space-y-4 animate-in fade-in">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="size-8.5 rounded-lg bg-[#102D45] text-white flex items-center justify-center">
                      <Users className="size-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#102D45] dark:text-white">
                        Allied Healthcare Discipline
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Dietetics, optometry, psychology, or therapy
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#102D45] dark:text-slate-200">
                      Allied Health Specialization
                    </label>
                    <select
                      value={details.doctor?.specialization || "Clinical Nutrition & Dietetics"}
                      onChange={(e) => updateSection("doctor", "specialization", e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0b131e] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-[#168B78] transition-all cursor-pointer"
                    >
                      <option value="Clinical Nutrition & Dietetics">Clinical Nutrition &amp; Dietetics</option>
                      <option value="Clinical Psychology & Behavioral Health">Clinical Psychology &amp; Behavioral Health</option>
                      <option value="Optometry & Vision Sciences">Optometry &amp; Vision Sciences</option>
                      <option value="Audiology & Speech Language Pathology">Audiology &amp; Speech Language Pathology</option>
                      <option value="Occupational Therapy">Occupational Therapy</option>
                      <option value="Medical Social Work">Medical Social Work</option>
                      <option value="Other Allied Health Profession">Other Allied Health Profession</option>
                    </select>
                  </div>
                </div>
              )}

              {/* 8. RESEARCHER SECTION */}
              {selectedIdentities.includes("researcher") && (
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-[#0e1622] space-y-4 animate-in fade-in">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="size-8.5 rounded-lg bg-[#102D45] text-white flex items-center justify-center">
                      <Microscope className="size-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#102D45] dark:text-white">
                        Research &amp; Scientific Investigation
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Primary domain of health sciences research
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#102D45] dark:text-slate-200">
                      Research Area
                    </label>
                    <select
                      value={details.researcher?.researchArea || RESEARCHER_AREAS[0]}
                      onChange={(e) => updateSection("researcher", "researchArea", e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0b131e] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-[#168B78] transition-all cursor-pointer"
                    >
                      {RESEARCHER_AREAS.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* 9. FACULTY / ACADEMICIAN SECTION */}
              {selectedIdentities.includes("faculty") && (
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-[#0e1622] space-y-4 animate-in fade-in">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="size-8.5 rounded-lg bg-[#102D45] text-white flex items-center justify-center">
                      <BookOpen className="size-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#102D45] dark:text-white">
                        Academic Department
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Primary teaching or clinical professorship subject
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#102D45] dark:text-slate-200">
                      Academic Discipline
                    </label>
                    <select
                      value={details.faculty?.discipline || FACULTY_DISCIPLINES[0]}
                      onChange={(e) => updateSection("faculty", "discipline", e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0b131e] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-[#168B78] transition-all cursor-pointer"
                    >
                      {FACULTY_DISCIPLINES.map((disc) => (
                        <option key={disc} value={disc}>
                          {disc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* 10. HEALTHCARE BUSINESS OWNER SECTION */}
              {selectedIdentities.includes("business_owner") && (
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-[#0e1622] space-y-4 animate-in fade-in">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="size-8.5 rounded-lg bg-[#102D45] text-white flex items-center justify-center">
                      <Building2 className="size-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#102D45] dark:text-white">
                        Healthcare Enterprise
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Primary enterprise type or operational domain
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#102D45] dark:text-slate-200">
                      Business Activity
                    </label>
                    <select
                      value={details.business_owner?.businessActivity || BUSINESS_ACTIVITIES[0]}
                      onChange={(e) =>
                        updateSection("business_owner", "businessActivity", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0b131e] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-[#168B78] transition-all cursor-pointer"
                    >
                      {BUSINESS_ACTIVITIES.map((act) => (
                        <option key={act} value={act}>
                          {act}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* 11. HEALTHCARE SERVICE PROVIDER SECTION */}
              {selectedIdentities.includes("service_provider") && (
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-[#0e1622] space-y-4 animate-in fade-in">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="size-8.5 rounded-lg bg-[#102D45] text-white flex items-center justify-center">
                      <Briefcase className="size-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#102D45] dark:text-white">
                        Clinical &amp; Healthcare Services
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Type of professional or institutional service provided
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#102D45] dark:text-slate-200">
                      Service Category
                    </label>
                    <select
                      value={details.service_provider?.serviceCategory || SERVICE_CATEGORIES[0]}
                      onChange={(e) =>
                        updateSection("service_provider", "serviceCategory", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0b131e] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-[#168B78] transition-all cursor-pointer"
                    >
                      {SERVICE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* 12. INTERN / TRAINEE SECTION */}
              {selectedIdentities.includes("intern_trainee") && (
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-[#0e1622] space-y-4 animate-in fade-in">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="size-8.5 rounded-lg bg-[#102D45] text-white flex items-center justify-center">
                      <Award className="size-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#102D45] dark:text-white">
                        Internship &amp; Clinical Residency
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Current training programme or rotatory attachment
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#102D45] dark:text-slate-200">
                      Training Programme
                    </label>
                    <select
                      value={details.intern_trainee?.programme || TRAINEE_PROGRAMMES[0]}
                      onChange={(e) => updateSection("intern_trainee", "programme", e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0b131e] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-[#168B78] transition-all cursor-pointer"
                    >
                      {TRAINEE_PROGRAMMES.map((prg) => (
                        <option key={prg} value={prg}>
                          {prg}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* 13. OTHER IDENTITY SECTION */}
              {selectedIdentities.includes("other") && (
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-[#0e1622] space-y-4 animate-in fade-in">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="size-8.5 rounded-lg bg-[#102D45] text-white flex items-center justify-center">
                      <Sparkles className="size-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#102D45] dark:text-white">
                        Healthcare Community Association
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Operational or allied community role
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#102D45] dark:text-slate-200">
                      Primary Area of Activity
                    </label>
                    <select
                      value={details.other?.domain || OTHER_DOMAINS[0]}
                      onChange={(e) => updateSection("other", "domain", e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0b131e] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-[#168B78] transition-all cursor-pointer"
                    >
                      {OTHER_DOMAINS.map((dom) => (
                        <option key={dom} value={dom}>
                          {dom}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────
                  ACTIONS: SAVE & CONTINUE + SKIP
                  ───────────────────────────────────────────── */}
              <div className="pt-6 space-y-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all duration-200 bg-[#102D45] hover:bg-[#0c2235] text-white shadow-md hover:shadow-lg active:scale-98 cursor-pointer ring-2 ring-[#168B78]/30"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="size-4.5 animate-spin" />
                      <span>Saving Role Information...</span>
                    </>
                  ) : (
                    <>
                      <span>Save &amp; Continue</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleSkip}
                    disabled={isSkipping}
                    className="text-xs font-semibold text-slate-500 hover:text-[#102D45] dark:text-slate-400 dark:hover:text-white transition cursor-pointer py-1"
                  >
                    {isSkipping ? "Navigating..." : "Skip this step for now →"}
                  </button>
                </div>
              </div>
            </form>

            {/* Verification & Compliance Assurance */}
            <div className="mt-8 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0e1622] border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400 text-left">
              <Info className="size-4 shrink-0 text-[#168B78] mt-0.5" />
              <div className="space-y-1">
                <p className="leading-relaxed">
                  <strong className="text-[#102D45] dark:text-slate-200">
                    Credential Verification Policy:
                  </strong>{" "}
                  Selecting your roles here provides relevant content and community recommendations.
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Official council registration numbers, licenses, and verified member badges will be reviewed through our standard credentialing portal. No document upload is required today.
                </p>
              </div>
            </div>

            {/* Footer Trust Tag */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="size-4 text-[#168B78]" />
              <span>Unified Member Profile Architecture</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
