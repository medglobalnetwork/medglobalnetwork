"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck, FileCheck, Award, ArrowRight, CheckCircle2 } from "lucide-react";

interface LiveDocAboutUsProps {
  onOpenAuth?: (mode?: "signin" | "signup") => void;
}

export function LiveDocAboutUs({ onOpenAuth }: LiveDocAboutUsProps) {
  const verificationSteps = [
    {
      step: "01",
      title: "Submit Medical Council Credentials",
      description:
        "Provide your National Medical Commission (NMC) registration number, State Medical Council ID, or accredited hospital affiliation during onboarding.",
      icon: FileCheck,
      color: "#0c2b4e",
    },
    {
      step: "02",
      title: "Automated & Audit Cross-Check",
      description:
        "Our verification engine cross-references official statutory medical registries to authenticate licenses, qualifications, and clinical specialty standing.",
      icon: ShieldCheck,
      color: "#16804d",
    },
    {
      step: "03",
      title: "Receive Verified Badge & Full Access",
      description:
        "Unlock authenticated doctor-to-doctor case discussions, direct verified hospital vacancies, accredited CME credits, and institutional collaborations.",
      icon: Award,
      color: "#0f4c81",
    },
  ];

  return (
    <section id="verification" className="py-16 sm:py-24 bg-white dark:bg-[#0b0f17] border-b border-slate-200/60 dark:border-slate-800">
      {/* ═══════════════════════════════════════════════
          SECTION HEADER: VERIFICATION & COMPLIANCE
          ═══════════════════════════════════════════════ */}
      <div className="relative mb-12 text-center">
        <span className="text-xs font-bold uppercase tracking-wider text-[#16804d] dark:text-[#34d399] bg-emerald-50 dark:bg-emerald-950/50 px-3.5 py-1 rounded-md mb-3 inline-block border border-emerald-200/60 dark:border-emerald-900/40">
          Statutory Compliance
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0c2b4e] dark:text-[#58a6ff] tracking-tight">
          Verified &amp; Council Compliant
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#6b7280] dark:text-[#8b949e] font-medium max-w-xl mx-auto px-4">
          India&apos;s Dedicated Ecosystem for Authenticated Healthcare Professionals &amp; Institutions
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          {/* Left Column: Authentic Verification Graphic */}
          <div className="md:col-span-6 flex justify-center order-1 md:order-2">
            <div className="relative">
              <div className="size-72 sm:size-88 rounded-2xl overflow-hidden shadow-xl ring-4 ring-blue-100 dark:ring-blue-900/30 p-1 bg-white dark:bg-[#161b22]">
                <img
                  src="/assets/img/gallery/health-care.png"
                  alt="Authentic Medical Verification Protocol"
                  className="size-full object-cover rounded-xl"
                />
              </div>
              {/* Floating pill badge */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white dark:bg-[#161b22] px-5 py-2 rounded-lg shadow-md border border-slate-200 dark:border-slate-800 flex items-center gap-2 whitespace-nowrap">
                <CheckCircle2 className="size-4 text-[#16804d] shrink-0" />
                <span className="text-xs font-bold text-[#0c2b4e] dark:text-[#58a6ff]">
                  100% Council Verified Network
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative */}
          <div className="md:col-span-6 text-center md:text-left space-y-5 order-2 md:order-1">
            <h3 className="text-2xl sm:text-4xl font-extrabold text-[#0c2b4e] dark:text-[#f0f6fc] leading-tight tracking-tight">
              Built specifically for verified medical professionals, not general social media
            </h3>
            <p className="text-sm sm:text-base text-[#4b5563] dark:text-[#9ca3af] leading-relaxed">
              Generic professional networks fail healthcare because clinical integrity requires statutory council licensing and regulatory compliance. At MedGlobalNetwork, we ensure every participating doctor, hospital HR, and vendor is thoroughly verified before accessing sensitive clinical exchanges and institutional job networks.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3.5">
              <button
                type="button"
                onClick={() => (onOpenAuth ? onOpenAuth("signup") : (window.location.href = "/signup"))}
                className="inline-flex items-center gap-2 rounded-lg bg-[#0c2b4e] hover:bg-[#081d36] text-white px-7 py-3 text-sm font-bold shadow-xs hover:shadow-sm transition cursor-pointer"
              >
                <span>Verify Your Clinical Profile</span>
                <ArrowRight className="size-4" />
              </button>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#161b22] text-[#0c2b4e] dark:text-[#58a6ff] hover:bg-slate-50 dark:hover:bg-slate-800 px-6 py-3 text-sm font-bold transition shadow-2xs"
              >
                <span>Learn About Verification</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            3-STEP CREDENTIALING PROTOCOL CARDS
            ═══════════════════════════════════════════════ */}
        <div className="mt-16 sm:mt-20 pt-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#16804d] dark:text-emerald-400 mb-1.5">
              Verification Protocol
            </h4>
            <p className="text-xl sm:text-2xl font-bold text-[#0c2b4e] dark:text-[#f0f6fc]">
              How We Protect Medical Authenticity in 3 Simple Steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {verificationSteps.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="bg-white dark:bg-[#161b22] p-7 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all space-y-4 text-left relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-slate-300 dark:text-slate-700 font-mono">
                      {item.step}
                    </span>
                    <div
                      className="size-10 rounded-lg flex items-center justify-center text-white shadow-2xs"
                      style={{ backgroundColor: item.color }}
                    >
                      <Icon className="size-5 stroke-[2]" />
                    </div>
                  </div>
                  <h5 className="text-base sm:text-lg font-bold text-[#0c2b4e] dark:text-[#f0f6fc]">
                    {item.title}
                  </h5>
                  <p className="text-xs sm:text-sm text-[#4b5563] dark:text-[#8b949e] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
