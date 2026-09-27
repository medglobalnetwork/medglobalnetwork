"use client";

import * as React from "react";
import { ShieldCheck, CheckCircle2, Lock, FileCheck, Award, ArrowRight } from "lucide-react";

interface VerificationTrustSectionProps {
  onOpenAuth: (mode?: "signin" | "signup") => void;
}

export function VerificationTrustSection({ onOpenAuth }: VerificationTrustSectionProps) {
  const steps = [
    {
      step: "01",
      title: "Submit Clinical Credentials",
      description:
        "Provide your medical registration number, state medical council ID, or verified institutional affiliation during seamless onboarding.",
      icon: FileCheck,
      color: "#0f4c81",
    },
    {
      step: "02",
      title: "Automated & Audit Verification",
      description:
        "Our credential verification engine cross-references official medical databases to validate licensing, specialty qualifications, and practice status.",
      icon: ShieldCheck,
      color: "#16804d",
    },
    {
      step: "03",
      title: "Receive Verified Badge & Full Access",
      description:
        "Get your authenticated MGN Verified Badge. Unlock peer clinical discussions, verified job openings, CME certificates, and collaborative research.",
      icon: Award,
      color: "#0f4c81",
    },
  ];

  return (
    <section id="verification-trust" className="bg-[#faf9f8] py-16 sm:py-24 border-t border-[#ded8d1]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#16804d] bg-[#eef8f2] px-3.5 py-1 rounded-full mb-3 inline-block">
            Trust & Credential Integrity
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-[#171717] tracking-tight">
            How MGN Guarantees 100% Medical Authenticity
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#5d5854] font-medium leading-relaxed">
            Unlike generic social platforms, MGN is a closed, trusted network. Every member is vetted so healthcare professionals can communicate, refer patients, and collaborate with complete confidence.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                className="relative rounded-3xl border border-[#ded8d1] bg-white p-7 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-2xl font-black text-[#ded8d1]">
                      {item.step}
                    </span>
                    <div
                      className="size-12 rounded-2xl flex items-center justify-center bg-[#faf9f8] border border-[#ded8d1]"
                      style={{ color: item.color }}
                    >
                      <IconComponent className="size-6 stroke-[2]" />
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#171717] mb-2.5">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#77716b] font-medium leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#f0efee] flex items-center gap-2 text-xs font-bold text-[#16804d]">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>Verified Standard</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Highlight Box */}
        <div className="mt-12 rounded-3xl border border-[#ded8d1] bg-gradient-to-r from-[#0a2f52] via-[#0f4c81] to-[#16804d] p-6 sm:p-8 text-white shadow-md">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="size-12 shrink-0 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
                <Lock className="size-6" />
              </div>
              <div className="space-y-1 text-left">
                <h4 className="text-base sm:text-lg font-bold text-white">
                  Institutional Security & Healthcare Data Privacy
                </h4>
                <p className="text-xs sm:text-sm text-white/85 max-w-2xl leading-relaxed">
                  Your clinical discussions, medical credentials, and research proposals are protected with end-to-end encryption and stringent healthcare privacy standards.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenAuth("signup")}
              className="shrink-0 w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-xs sm:text-sm font-bold text-[#0f4c81] shadow-sm hover:bg-[#faf9f8] transition active:scale-95 cursor-pointer"
            >
              <span>Get Verified Now</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
