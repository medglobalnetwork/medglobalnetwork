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
  Check,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Info,
  X,
  Loader2,
} from "lucide-react";

export interface IdentityItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  group: string;
}

export interface IdentityGroup {
  id: string;
  title: string;
  badge?: string;
  items: IdentityItem[];
}

export const IDENTITY_GROUPS: IdentityGroup[] = [
  {
    id: "education",
    title: "1. Education & Learning",
    badge: "Students & Trainees",
    items: [
      {
        id: "student",
        title: "Student",
        description: "Enrolled in medical, dental, nursing, pharmacy, or allied health degree.",
        icon: GraduationCap,
        group: "Education",
      },
      {
        id: "intern_trainee",
        title: "Intern / Trainee",
        description: "Rotating intern, house surgeon, clinical trainee, or junior resident.",
        icon: Award,
        group: "Education",
      },
    ],
  },
  {
    id: "professionals",
    title: "2. Healthcare Professionals",
    badge: "Clinical Practice",
    items: [
      {
        id: "doctor",
        title: "Doctor",
        description: "Allopathic (MBBS/MD/MS), AYUSH, dental clinician, or super-specialist.",
        icon: Stethoscope,
        group: "Professionals",
      },
      {
        id: "nurse",
        title: "Nurse",
        description: "Registered nurse (GNM/BSc), nursing officer, or clinical specialist.",
        icon: HeartPulse,
        group: "Professionals",
      },
      {
        id: "pharmacist",
        title: "Pharmacist",
        description: "Hospital, retail, clinical, or industrial pharmaceutical professional.",
        icon: Pill,
        group: "Professionals",
      },
      {
        id: "physiotherapist",
        title: "Physiotherapist",
        description: "Physical rehabilitation, sports therapist, or orthopedic physiotherapist.",
        icon: Activity,
        group: "Professionals",
      },
      {
        id: "paramedical",
        title: "Paramedical Professional",
        description: "Emergency medical technician (EMT), lab technologist, or radiology tech.",
        icon: Ambulance,
        group: "Professionals",
      },
      {
        id: "allied_health",
        title: "Allied Healthcare Professional",
        description: "Clinical psychologist, dietitian/nutritionist, optometrist, or audiologist.",
        icon: Users,
        group: "Professionals",
      },
    ],
  },
  {
    id: "research",
    title: "3. Research & Academia",
    badge: "Scientific & Teaching",
    items: [
      {
        id: "researcher",
        title: "Researcher",
        description: "Clinical scientist, trial investigator, epidemiologist, or biotech researcher.",
        icon: Microscope,
        group: "Research",
      },
      {
        id: "faculty",
        title: "Faculty / Academician",
        description: "Professor, assistant professor, lecturer, or clinical preceptor in health sciences.",
        icon: BookOpen,
        group: "Research",
      },
    ],
  },
  {
    id: "business",
    title: "4. Healthcare Business & Services",
    badge: "Enterprises & Services",
    items: [
      {
        id: "business_owner",
        title: "Healthcare Business Owner",
        description: "Founder or partner in clinic, diagnostic center, pharma, or medical equipment firm.",
        icon: Building2,
        group: "Business",
      },
      {
        id: "service_provider",
        title: "Healthcare Service Provider",
        description: "Healthcare IT, medical consultant, biomedical distributor, or clinical supply agent.",
        icon: Briefcase,
        group: "Business",
      },
    ],
  },
  {
    id: "other",
    title: "5. Other",
    badge: "Community & Support",
    items: [
      {
        id: "other",
        title: "Other Healthcare-related Identity",
        description: "Hospital administrator, medical legal advisor, health policy advocate, or community worker.",
        icon: Sparkles,
        group: "Other",
      },
    ],
  },
];

export default function IndividualIdentitySelectionPage() {
  const router = useRouter();

  // State
  const [selectedIdentities, setSelectedIdentities] = React.useState<string[]>([]);
  const [userId, setUserId] = React.useState<string>("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [backendError, setBackendError] = React.useState<string | null>(null);

  // 1. Restore previously selected identities on mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedUser = localStorage.getItem("mgn_onboarding_registered_user");
        if (storedUser) {
          const u = JSON.parse(storedUser);
          if (u.userId) setUserId(u.userId);
        }

        const savedIds = localStorage.getItem("mgn_onboarding_selected_identities");
        if (savedIds) {
          const parsed = JSON.parse(savedIds);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSelectedIdentities(parsed);
          }
        }
      } catch (err) {
        console.warn("Could not load stored identities:", err);
      }
    }
  }, []);

  // 2. Persist locally on change
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "mgn_onboarding_selected_identities",
          JSON.stringify(selectedIdentities)
        );
      } catch (e) {
        console.warn("Could not persist identities locally:", e);
      }
    }
  }, [selectedIdentities]);

  // Toggle selection handler
  const handleToggleIdentity = (id: string) => {
    setBackendError(null);
    setSelectedIdentities((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Deselect pill
  const handleRemoveIdentity = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIdentities((prev) => prev.filter((item) => item !== id));
  };

  // Find identity item by ID
  const findIdentityItem = (id: string): IdentityItem | undefined => {
    for (const group of IDENTITY_GROUPS) {
      const match = group.items.find((item) => item.id === id);
      if (match) return match;
    }
    return undefined;
  };

  // Submit / Continue handler
  const handleContinue = async () => {
    if (selectedIdentities.length === 0 || isSaving) return;

    setIsSaving(true);
    setBackendError(null);

    try {
      const res = await fetch("/api/onboarding/identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          selectedIdentities,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setBackendError(data.error || "Failed to save healthcare identities. Please try again.");
        setIsSaving(false);
        return;
      }

      // Route to Page 6: Dynamic Identity Details
      router.push("/onboarding/individual/identity-details");
    } catch (err: any) {
      console.error("Save identities network error:", err);
      setBackendError("Network error. Please check your connection and try again.");
      setIsSaving(false);
    }
  };

  const hasSelection = selectedIdentities.length > 0;

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

          {/* Already a member? Sign In on Right */}
          <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <span>Already a member? </span>
            <Link
              href="/login"
              className="font-bold text-[#168B78] hover:text-[#116a5c] dark:text-[#2dd4bf] transition inline-flex items-center gap-1 ml-0.5 hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────
          2. MAIN CONTENT AREA
          ───────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-start py-8 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl mx-auto space-y-6">
          {/* Back Navigation */}
          <div>
            <Link
              href="/onboarding/individual/personal-information"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#102D45] dark:text-slate-400 dark:hover:text-white transition group"
            >
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Back to Personal Information</span>
            </Link>
          </div>

          {/* Main Container Card */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#121c2a] p-6 sm:p-9 shadow-md relative overflow-hidden">
            {/* Header inside Card */}
            <div className="space-y-2 pb-6 border-b border-slate-100 dark:border-slate-800 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#168B78]/10 text-[#168B78] dark:bg-teal-950/40 dark:text-[#2dd4bf]">
                <ShieldCheck className="size-3.5" />
                <span>Step 5 of Onboarding · Healthcare Identity</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102D45] dark:text-white tracking-tight">
                How are you associated with healthcare?
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Select all the roles that describe you. You can add more identities anytime.
              </p>
            </div>

            {/* Error Alert */}
            {backendError && (
              <div className="mt-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs sm:text-sm text-rose-700 dark:text-rose-300 flex items-start gap-2.5 animate-in fade-in">
                <Info className="size-4 shrink-0 text-rose-500 mt-0.5" />
                <span className="leading-relaxed font-medium">{backendError}</span>
              </div>
            )}

            {/* ─────────────────────────────────────────────
                3. IDENTITY GROUPS & CARDS
                ───────────────────────────────────────────── */}
            <div className="mt-7 space-y-8 text-left">
              {IDENTITY_GROUPS.map((group) => (
                <div key={group.id} className="space-y-3">
                  {/* Group Header */}
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#102D45] dark:text-slate-200">
                      {group.title}
                    </h2>
                    {group.badge && (
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                        {group.badge}
                      </span>
                    )}
                  </div>

                  {/* Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {group.items.map((item) => {
                      const IconComponent = item.icon;
                      const isSelected = selectedIdentities.includes(item.id);

                      return (
                        <div
                          key={item.id}
                          role="button"
                          tabIndex={0}
                          aria-pressed={isSelected}
                          onClick={() => handleToggleIdentity(item.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleToggleIdentity(item.id);
                            }
                          }}
                          className={`relative rounded-xl p-4 sm:p-4.5 border-2 text-left cursor-pointer transition-all duration-200 flex flex-col justify-between group select-none focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#168B78] ${
                            isSelected
                              ? "border-[#168B78] bg-teal-50/40 dark:bg-teal-950/20 shadow-xs ring-1 ring-[#168B78]/30"
                              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e1622] hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-2xs"
                          }`}
                        >
                          <div>
                            {/* Top row: Icon + Checkbox Badge */}
                            <div className="flex items-center justify-between mb-3">
                              <div
                                className={`size-10 rounded-lg flex items-center justify-center transition-colors ${
                                  isSelected
                                    ? "bg-[#168B78] text-white shadow-xs"
                                    : "bg-[#102D45]/10 text-[#102D45] dark:bg-slate-800 dark:text-slate-200 group-hover:bg-[#102D45]/15"
                                }`}
                              >
                                <IconComponent className="size-5" />
                              </div>

                              {/* Checkbox Indicator */}
                              <div
                                className={`size-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                  isSelected
                                    ? "border-[#168B78] bg-[#168B78] text-white"
                                    : "border-slate-300 dark:border-slate-700 bg-transparent group-hover:border-slate-400"
                                }`}
                              >
                                {isSelected && <Check className="size-3.5 stroke-[3]" />}
                              </div>
                            </div>

                            {/* Title & Description */}
                            <h3
                              className={`text-sm font-bold tracking-tight mb-1 transition-colors ${
                                isSelected
                                  ? "text-[#102D45] dark:text-[#2dd4bf]"
                                  : "text-slate-900 dark:text-white"
                              }`}
                            >
                              {item.title}
                            </h3>
                            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* ─────────────────────────────────────────────
                4. SELECTED IDENTITIES SUMMARY TRAY
                ───────────────────────────────────────────── */}
            {hasSelection && (
              <div className="mt-8 p-4 rounded-xl border border-teal-200 dark:border-teal-900 bg-teal-50/30 dark:bg-teal-950/20 space-y-2 text-left animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#102D45] dark:text-slate-200">
                    <span>Selected Identities</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#168B78] text-white text-[10px]">
                      {selectedIdentities.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedIdentities([])}
                    className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    Clear all
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedIdentities.map((id) => {
                    const item = findIdentityItem(id);
                    if (!item) return null;
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-[#121c2a] border border-teal-200 dark:border-teal-900 text-[#102D45] dark:text-slate-200 shadow-2xs"
                      >
                        <span>{item.title}</span>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveIdentity(id, e)}
                          aria-label={`Remove ${item.title}`}
                          className="text-slate-400 hover:text-rose-500 cursor-pointer"
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────
                5. ACTIONS & CONTINUE BUTTON
                ───────────────────────────────────────────── */}
            <div className="mt-8 pt-4 space-y-4">
              <button
                type="button"
                disabled={!hasSelection || isSaving}
                onClick={handleContinue}
                className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all duration-200 ${
                  hasSelection && !isSaving
                    ? "bg-[#102D45] hover:bg-[#0c2235] text-white shadow-md hover:shadow-lg active:scale-98 cursor-pointer ring-2 ring-[#168B78]/30"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-4.5 animate-spin" />
                    <span>Saving Selected Identities...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {hasSelection
                        ? `Continue with ${selectedIdentities.length} ${
                            selectedIdentities.length === 1 ? "Identity" : "Identities"
                          }`
                        : "Select at least 1 identity to continue"}
                    </span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>

              {/* Informational Policy Notice */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0e1622] border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400 text-left">
                <Info className="size-4 shrink-0 text-[#168B78] mt-0.5" />
                <div className="space-y-1">
                  <p className="leading-relaxed">
                    <strong className="text-[#102D45] dark:text-slate-200">
                      Multi-Identity Support:
                    </strong>{" "}
                    You can practice as a doctor, teach as faculty, and conduct research under a single MED Global Network account.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Professional titles and credentials will be configured in the next step. No document upload is required today.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Trust Tag */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="size-4 text-[#168B78]" />
              <span>Unified Single Account Architecture for Multi-Role Clinicians</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
