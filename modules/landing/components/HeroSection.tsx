"use client";

import * as React from "react";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Users,
  Award,
  Stethoscope,
  HeartPulse,
  Briefcase,
  BookOpen,
  Calendar,
  Microscope,
} from "lucide-react";

interface HeroSectionProps {
  onOpenAuth: (mode?: "signin" | "signup") => void;
}

export function HeroSection({ onOpenAuth }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-white pt-10 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-32">
      {/* Background Decorative Ambient Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-full max-w-7xl h-[600px] pointer-events-none opacity-40">
        <div className="absolute top-10 left-1/4 size-[420px] rounded-full bg-gradient-to-tr from-[#0f4c81]/20 to-[#16804d]/20 blur-3xl" />
        <div className="absolute top-28 right-1/4 size-[380px] rounded-full bg-gradient-to-br from-[#16804d]/15 to-[#0f4c81]/15 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Trust Banner Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#ded8d1] bg-[#faf9f8] px-3.5 py-1.5 shadow-2xs transition hover:border-[#0f4c81]/40 mb-6">
            <span className="flex size-2 rounded-full bg-[#16804d] animate-pulse" />
            <ShieldCheck className="size-4 text-[#16804d]" />
            <span className="text-xs font-bold text-[#171717]">
              100% Medical License & Credential Verified Platform
            </span>
          </div>

          {/* Hero Headline */}
          <h1 className="max-w-4xl text-3xl font-black tracking-tight text-[#171717] sm:text-5xl md:text-6xl lg:leading-[1.12]">
            Connect, Collaborate & Advance{" "}
            <span className="bg-gradient-to-r from-[#0f4c81] via-[#134e8a] to-[#16804d] bg-clip-text text-transparent">
              Healthcare Worldwide
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-5 max-w-2xl text-base sm:text-lg text-[#5d5854] font-medium leading-relaxed">
            The global professional network for doctors, surgeons, physiotherapists, researchers, and healthcare institutions. Exchange clinical cases, access accredited CME, discover verified careers, and publish medical research.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onOpenAuth("signup")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0f4c81] px-7 py-3.5 text-sm sm:text-base font-bold text-white shadow-md hover:bg-[#0c3c66] transition active:scale-95 cursor-pointer"
            >
              <span>Join Verified Network</span>
              <ArrowRight className="size-4.5" />
            </button>

            <button
              type="button"
              onClick={() => onOpenAuth("signin")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-[#ded8d1] bg-white px-6 py-3.5 text-sm sm:text-base font-bold text-[#171717] shadow-2xs hover:bg-[#faf9f8] transition active:scale-95 cursor-pointer"
            >
              <span>Sign in to Account</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full max-w-4xl border-y border-[#ded8d1] py-6 sm:py-8">
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-black text-[#0f4c81]">50,000+</span>
              <span className="text-xs font-semibold text-[#77716b] mt-1">Verified Clinicians</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-black text-[#16804d]">500+</span>
              <span className="text-xs font-semibold text-[#77716b] mt-1">Healthcare Institutions</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-black text-[#0f4c81]">1,200+</span>
              <span className="text-xs font-semibold text-[#77716b] mt-1">CME & Medical Camps</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-black text-[#16804d]">100%</span>
              <span className="text-xs font-semibold text-[#77716b] mt-1">Credential Authenticated</span>
            </div>
          </div>

          {/* Interactive Platform Mockup Preview */}
          <div className="mt-12 sm:mt-16 w-full max-w-5xl">
            <div className="rounded-3xl border border-[#ded8d1] bg-gradient-to-b from-[#faf9f8] to-white p-3 sm:p-5 shadow-xl">
              {/* App Shell Mock Header */}
              <div className="rounded-2xl border border-[#ded8d1] bg-white p-3 sm:p-4 shadow-xs flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="size-3 rounded-full bg-rose-400" />
                  <div className="size-3 rounded-full bg-amber-400" />
                  <div className="size-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-bold text-[#171717] hidden sm:inline">
                    MGN.life · Healthcare Intelligence Feed
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#eef5fc] text-[#0f4c81] px-2.5 py-1 text-[10px] sm:text-xs font-bold flex items-center gap-1">
                    <ShieldCheck className="size-3.5 text-[#16804d]" />
                    Verified Clinician Session
                  </span>
                </div>
              </div>

              {/* Mock Feed & Profiles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-left">
                {/* Left: Feed Case Card (8 Cols) */}
                <div className="md:col-span-8 rounded-2xl border border-[#ded8d1] bg-white p-4 sm:p-5 shadow-2xs space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-11 rounded-full bg-[#0f4c81] text-white font-bold flex items-center justify-center text-sm ring-2 ring-[#0f4c81]/20">
                        DR
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-[#171717]">Dr. Rahul Sharma, MS</h4>
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#eef8f2] px-2 py-0.5 text-[10px] font-bold text-[#16804d]">
                            ✓ Verified Surgeon
                          </span>
                        </div>
                        <p className="text-[11px] text-[#77716b]">
                          Orthopedic Surgeon · Joint Reconstruction · AIIMS New Delhi
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-[#8a8784]">2h ago</span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#171717] leading-relaxed">
                    Successful arthroscopic rotator cuff reconstruction using augmented bio-inductive collagen implants. Significant reduction in post-op stiffness and accelerated clinical rehabilitation at 6-week milestone.
                  </p>

                  <div className="rounded-xl bg-[#0f4c81]/5 border border-[#0f4c81]/15 p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-[#0f4c81] font-bold">
                      <Microscope className="size-4" />
                      <span>Clinical Study & Protocol Attached (PDF)</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#16804d] bg-white px-2 py-1 rounded-md border border-[#ded8d1]">
                      Peer Reviewed
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-bold text-[#77716b] pt-1 border-t border-[#f0efee]">
                    <span className="text-[#0f4c81]">❤️ 48 Clinicians Reacted</span>
                    <span>💬 14 Specialist Insights</span>
                    <span>🔗 9 Shares</span>
                  </div>
                </div>

                {/* Right: Quick Recommendations & Stats (4 Cols) */}
                <div className="md:col-span-4 space-y-3">
                  <div className="rounded-2xl border border-[#ded8d1] bg-white p-4 shadow-2xs space-y-3">
                    <h5 className="text-xs font-bold text-[#171717] flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-[#0f4c81]" />
                      Specialist Discovery
                    </h5>
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-[#faf9f8]">
                        <div className="size-8 rounded-full bg-[#16804d] text-white text-xs font-bold flex items-center justify-center">
                          PA
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#171717] truncate">Dr. Priya Agrawal</p>
                          <p className="text-[10px] text-[#77716b] truncate">Sports Physiotherapy</p>
                        </div>
                        <span className="text-[10px] font-bold text-[#0f4c81] bg-[#eef5fc] px-2 py-0.5 rounded-lg">
                          Connect
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-[#faf9f8]">
                        <div className="size-8 rounded-full bg-[#4f46e5] text-white text-xs font-bold flex items-center justify-center">
                          VK
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#171717] truncate">Dr. Vikram Kapoor</p>
                          <p className="text-[10px] text-[#77716b] truncate">Cardiothoracic Surgery</p>
                        </div>
                        <span className="text-[10px] font-bold text-[#0f4c81] bg-[#eef5fc] px-2 py-0.5 rounded-lg">
                          Connect
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#ded8d1] bg-gradient-to-br from-[#0f4c81] to-[#16804d] p-4 text-white shadow-xs">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                      <Award className="size-4" />
                      <span>Accredited CME Webinar</span>
                    </div>
                    <p className="text-xs font-bold text-white mt-1">
                      Advanced Cardiac Imaging Summit 2026
                    </p>
                    <p className="text-[11px] text-white/80 mt-0.5">3 Credit Points · Online</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
