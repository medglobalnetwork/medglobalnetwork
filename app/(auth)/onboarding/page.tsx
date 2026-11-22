"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Building2, Check, ArrowRight, ShieldCheck } from "lucide-react";

export type AccountTypeChoice = "INDIVIDUAL" | "ORGANISATION";

export default function OnboardingAccountTypePage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = React.useState<AccountTypeChoice | null>(null);

  // Restore selection if navigating backward
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("mgn_onboarding_account_type");
        if (stored === "INDIVIDUAL" || stored === "ORGANISATION") {
          setSelectedType(stored);
        }
      } catch (e) {
        console.warn("Could not read saved account type:", e);
      }
    }
  }, []);

  const handleSelect = (type: AccountTypeChoice) => {
    setSelectedType(type);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("mgn_onboarding_account_type", type);
      } catch (e) {
        console.warn("Could not persist account type choice:", e);
      }
    }
  };

  const handleContinue = () => {
    if (!selectedType) return;
    if (selectedType === "INDIVIDUAL") {
      router.push("/onboarding/individual");
    } else {
      router.push("/onboarding/business");
    }
  };

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
      <main className="flex-1 flex items-center justify-center py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl mx-auto space-y-8 sm:space-y-10">
          {/* Heading & Subtitle */}
          <div className="text-center space-y-2.5 sm:space-y-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#102D45] dark:text-white tracking-tight">
              Join Our Healthcare Network
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
              Connect with a community of healthcare students, professionals, institutions and businesses.
            </p>
          </div>

          {/* Question */}
          <div className="text-center">
            <h2 className="text-base sm:text-lg font-bold text-[#102D45] dark:text-slate-100">
              How would you like to join?
            </h2>
          </div>

          {/* ─────────────────────────────────────────────
              3. SELECTABLE CARDS (OPTION A & B)
              ───────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* OPTION A: INDIVIDUAL */}
            <div
              role="button"
              tabIndex={0}
              aria-pressed={selectedType === "INDIVIDUAL"}
              onClick={() => handleSelect("INDIVIDUAL")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSelect("INDIVIDUAL");
                }
              }}
              className={`relative rounded-2xl p-6 sm:p-7 border-2 text-left cursor-pointer transition-all duration-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#168B78] flex flex-col justify-between group select-none ${
                selectedType === "INDIVIDUAL"
                  ? "border-[#168B78] bg-teal-50/20 dark:bg-teal-950/20 shadow-md ring-1 ring-[#168B78]"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121c2a] hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm"
              }`}
            >
              {/* Top Row: Icon + Selection Indicator */}
              <div className="flex items-center justify-between mb-5">
                <div
                  className={`size-12 rounded-xl flex items-center justify-center transition-colors ${
                    selectedType === "INDIVIDUAL"
                      ? "bg-[#168B78] text-white shadow-xs"
                      : "bg-[#102D45]/10 text-[#102D45] dark:bg-slate-800 dark:text-slate-200 group-hover:bg-[#102D45]/15"
                  }`}
                >
                  <User className="size-6 stroke-[2]" />
                </div>

                {/* Custom Radio / Checkmark Indicator */}
                <div
                  className={`size-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedType === "INDIVIDUAL"
                      ? "border-[#168B78] bg-[#168B78] text-white"
                      : "border-slate-300 dark:border-slate-700 bg-transparent"
                  }`}
                >
                  {selectedType === "INDIVIDUAL" && <Check className="size-3.5 stroke-[3]" />}
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3
                  className={`text-lg sm:text-xl font-bold transition-colors ${
                    selectedType === "INDIVIDUAL"
                      ? "text-[#102D45] dark:text-white"
                      : "text-[#102D45] dark:text-slate-100"
                  }`}
                >
                  Individual
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  I&apos;m joining as an individual – student, doctor, healthcare professional, researcher or healthcare community member.
                </p>
              </div>
            </div>

            {/* OPTION B: BUSINESS / ORGANIZATION */}
            <div
              role="button"
              tabIndex={0}
              aria-pressed={selectedType === "ORGANISATION"}
              onClick={() => handleSelect("ORGANISATION")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSelect("ORGANISATION");
                }
              }}
              className={`relative rounded-2xl p-6 sm:p-7 border-2 text-left cursor-pointer transition-all duration-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#168B78] flex flex-col justify-between group select-none ${
                selectedType === "ORGANISATION"
                  ? "border-[#168B78] bg-teal-50/20 dark:bg-teal-950/20 shadow-md ring-1 ring-[#168B78]"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121c2a] hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm"
              }`}
            >
              {/* Top Row: Icon + Selection Indicator */}
              <div className="flex items-center justify-between mb-5">
                <div
                  className={`size-12 rounded-xl flex items-center justify-center transition-colors ${
                    selectedType === "ORGANISATION"
                      ? "bg-[#168B78] text-white shadow-xs"
                      : "bg-[#102D45]/10 text-[#102D45] dark:bg-slate-800 dark:text-slate-200 group-hover:bg-[#102D45]/15"
                  }`}
                >
                  <Building2 className="size-6 stroke-[2]" />
                </div>

                {/* Custom Radio / Checkmark Indicator */}
                <div
                  className={`size-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedType === "ORGANISATION"
                      ? "border-[#168B78] bg-[#168B78] text-white"
                      : "border-slate-300 dark:border-slate-700 bg-transparent"
                  }`}
                >
                  {selectedType === "ORGANISATION" && <Check className="size-3.5 stroke-[3]" />}
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3
                  className={`text-lg sm:text-xl font-bold transition-colors ${
                    selectedType === "ORGANISATION"
                      ? "text-[#102D45] dark:text-white"
                      : "text-[#102D45] dark:text-slate-100"
                  }`}
                >
                  Business / Organization
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  I&apos;m joining on behalf of a hospital, clinic, company, manufacturer, distributor or healthcare organization.
                </p>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────
              4. CONTINUE ACTION BUTTON
              ───────────────────────────────────────────── */}
          <div className="pt-2 flex flex-col items-center space-y-3">
            <button
              type="button"
              disabled={!selectedType}
              onClick={handleContinue}
              className={`w-full sm:w-auto min-w-[220px] py-3.5 px-8 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all duration-200 ${
                selectedType
                  ? "bg-[#102D45] hover:bg-[#0c2235] text-white shadow-md hover:shadow-lg active:scale-98 cursor-pointer"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
              }`}
            >
              <span>Continue</span>
              <ArrowRight className="size-4" />
            </button>

            <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-[#168B78]" />
              <span>Independent profiles and privacy controls apply</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
