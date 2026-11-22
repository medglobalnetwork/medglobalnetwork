"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  FileCheck,
  Award,
  ArrowRight,
  Database,
  Stethoscope,
} from "lucide-react";

interface VerificationTrustSectionProps {
  onOpenAuth?: (mode?: "signin" | "signup") => void;
}

export function VerificationTrustSection({ onOpenAuth }: VerificationTrustSectionProps) {
  const steps = [
    {
      step: "01",
      title: "Submit Clinical Credentials",
      description:
        "Provide your NMC or State Medical Council registration number or verified institutional hospital ID during signup.",
      icon: FileCheck,
      color: "text-[#0c2b4e] dark:text-[#58a6ff] bg-blue-100/70 dark:bg-blue-950/70",
      pill: "Instant Intake",
    },
    {
      step: "02",
      title: "Automated Registry Match",
      description:
        "Our engine cross-checks official statutory council databases in real time to validate active practice standing and specialty credentials.",
      icon: Database,
      color: "text-[#0d9488] dark:text-[#2dd4bf] bg-teal-100/70 dark:bg-teal-950/70",
      pill: "Registry Cross-Check",
    },
    {
      step: "03",
      title: "Issue Verified Badge",
      description:
        "Receive your cryptographic tamper-proof MGN Verified Badge, eliminating medical impersonation across the platform.",
      icon: ShieldCheck,
      color: "text-[#16804d] dark:text-[#3fb950] bg-emerald-100/70 dark:bg-emerald-950/70",
      pill: "Zero Impersonation",
    },
    {
      step: "04",
      title: "Full Ecosystem Access",
      description:
        "Unlock peer case discussions, verified locum openings, accredited CME credits, and B2B hospital procurement.",
      icon: Award,
      color: "text-[#0284c7] dark:text-[#38bdf8] bg-sky-100/70 dark:bg-sky-950/70",
      pill: "Full Privileges",
    },
  ];

  return (
    <section
      id="verification"
      className="relative isolate overflow-hidden py-20 sm:py-28 bg-[#fafbfc] dark:bg-[#0b0f17] border-b border-slate-200/60 dark:border-slate-800"
    >
      {/* Background Soft Glows */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 -z-10 w-[600px] h-[350px] rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
          <span className="text-xs font-bold uppercase tracking-wider text-[#16804d] dark:text-[#3fb950] bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-1 rounded-md mb-3 inline-block border border-emerald-200/70 dark:border-emerald-900/40 shadow-xs">
            Trust &amp; Credential Integrity
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0c2b4e] dark:text-[#f0f6fc] tracking-tight text-balance">
            How MGN Guarantees 100% Medical Authenticity
          </h2>
          <p className="mt-3.5 text-sm sm:text-base text-[#4b5563] dark:text-[#9ca3af] max-w-2xl mx-auto leading-relaxed font-medium">
            Unlike unvetted social media groups, MGN is an authenticated clinical network. Every physician, resident, and hospital entity is systematically verified before joining.
          </p>
        </div>

        {/* 4 Sequential Milestones Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {steps.map((item, idx) => {
            const IconComponent = item.icon;

            return (
              <div
                key={idx}
                className="relative rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-[#161b22]/95 backdrop-blur-md p-6 sm:p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Header: Step Number & Icon */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs font-black tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                      STEP {item.step}
                    </span>
                    <div
                      className={`size-11 rounded-xl flex items-center justify-center ${item.color} shadow-xs transition-transform group-hover:scale-110 duration-200`}
                    >
                      <IconComponent className="size-5.5 stroke-[2]" />
                    </div>
                  </div>

                  {/* Step Title */}
                  <h3 className="text-base sm:text-lg font-bold text-[#0c2b4e] dark:text-[#f0f6fc] mb-2 leading-snug group-hover:text-[#16804d] dark:group-hover:text-[#3fb950] transition-colors">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-[13px] text-[#4b5563] dark:text-[#9ca3af] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Footer Badge */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-[#16804d] dark:text-[#3fb950]">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 shrink-0" />
                    <span>{item.pill}</span>
                  </span>
                  <span className="text-slate-300 dark:text-slate-700 text-xs font-mono">
                    0{idx + 1}/04
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Highlight Box */}
        <div className="mt-14 rounded-2xl border border-blue-900/20 bg-gradient-to-r from-[#0c2b4e] via-[#0f4c81] to-[#16804d] p-6 sm:p-8 text-white shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="size-12 shrink-0 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white shadow-xs">
                <Lock className="size-6" />
              </div>
              <div className="space-y-1 text-left">
                <h4 className="text-base sm:text-lg font-bold text-white">
                  Statutory Medical Governance &amp; Regulatory Compliance
                </h4>
                <p className="text-xs sm:text-sm text-white/85 max-w-2xl leading-relaxed">
                  Your credentials and clinical consultations remain end-to-end protected. Only vetted medical fraternity peers can interact on clinical case threads.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => (onOpenAuth ? onOpenAuth("signup") : (window.location.href = "/signup"))}
              className="shrink-0 w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-50 text-[#0c2b4e] px-6 py-3.5 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <span>Get Council Verified</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
