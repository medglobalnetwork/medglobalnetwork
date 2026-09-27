"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  BookOpen,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  GraduationCap,
  Briefcase,
  ShoppingCart,
  CheckCircle2,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface HeroSectionProps {
  onOpenAuth?: (mode?: "signin" | "signup") => void;
}

export function HeroSection({ onOpenAuth }: HeroSectionProps) {
  const { data: session } = authClient.useSession();
  const isLoggedIn = Boolean(session?.user);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#fbfbfb] to-[#faf9f8] dark:from-[#0b0f17] dark:via-[#0e141f] dark:to-[#0b0f17] pt-6 pb-12 sm:pt-12 sm:pb-20 lg:pt-16 lg:pb-24">
      {/* Subtle Background Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 -z-10 w-full max-w-7xl h-[450px] sm:h-[550px] pointer-events-none opacity-30 sm:opacity-40 overflow-hidden">
        <div className="absolute top-0 right-10 size-[320px] sm:size-[480px] rounded-full bg-gradient-to-br from-[#0f4c81]/15 to-[#16804d]/15 blur-3xl" />
        <div className="absolute bottom-0 left-10 size-[280px] sm:size-[400px] rounded-full bg-gradient-to-tr from-[#16804d]/10 to-[#0f4c81]/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* ═══════════════════════════════════════════════
              LEFT COLUMN: HEADLINE & ACTIONS
              ═══════════════════════════════════════════════ */}
          <div className="lg:col-span-6 space-y-5 sm:space-y-6 text-center lg:text-left">
            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-extrabold text-[#171717] dark:text-[#f0f6fc] leading-[1.15] text-balance">
              One Network. <br />
              <span className="text-[#16804d] dark:text-[#2ea043]">
                Endless Opportunities.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-sm sm:text-base text-[#4b5563] dark:text-[#9ca3af] leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal text-pretty">
              MGN connects healthcare professionals, students, organizations, and businesses on a single platform to learn, grow, collaborate, and thrive.
            </p>

            {/* 4 Value Proposition Badges */}
            <div className="flex items-center justify-center lg:justify-start gap-3 sm:gap-5 flex-wrap pt-1 text-xs sm:text-[13px] font-semibold text-[#1f2937] dark:text-[#f0f6fc]">
              <div className="flex items-center gap-1.5 text-[#0f4c81] dark:text-[#58a6ff]">
                <Users className="size-4 shrink-0" />
                <span>Connect</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#16804d] dark:text-[#3fb950]">
                <BookOpen className="size-4 shrink-0" />
                <span>Learn</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#0d9488] dark:text-[#2dd4bf]">
                <TrendingUp className="size-4 shrink-0" />
                <span>Grow</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#d97706] dark:text-[#facc15]">
                <Sparkles className="size-4 shrink-0" />
                <span>Thrive</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-2">
              {isLoggedIn ? (
                <Link
                  href="/home"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f4c81] dark:bg-[#14559b] px-6 py-3.5 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-[#0c3c66] dark:hover:bg-[#0f4c81] transition active:scale-98"
                >
                  <span>Go to Your Dashboard</span>
                  <ArrowRight className="size-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f4c81] dark:bg-[#14559b] px-6 py-3.5 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-[#0c3c66] dark:hover:bg-[#0f4c81] transition active:scale-98 cursor-pointer"
                  >
                    <span>Get Started – It&apos;s Free</span>
                  </Link>

                  <a
                    href="#features"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#0f4c81]/40 dark:border-[#58a6ff]/40 bg-white dark:bg-[#161b22] px-6 py-3.5 text-xs sm:text-sm font-semibold text-[#0f4c81] dark:text-[#58a6ff] hover:bg-[#0f4c81]/5 transition active:scale-98 cursor-pointer"
                  >
                    <span>Explore Features</span>
                  </a>
                </>
              )}
            </div>

            {/* Trust Footnote */}
            <div className="flex items-center justify-center lg:justify-start gap-2 text-xs font-medium text-[#4b5563] dark:text-[#8b949e] pt-1">
              <ShieldCheck className="size-4 text-[#16804d] shrink-0" />
              <span>Trusted | Verified | Healthcare Focused</span>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════
              RIGHT COLUMN: REALISTIC DEVICE & HERO COMPOSITION
              ═══════════════════════════════════════════════ */}
          <div className="lg:col-span-6 relative flex items-center justify-center px-2 sm:px-0">
            <div className="relative w-full max-w-[500px]">
              {/* Floating Orbit Icons (Tablet & Desktop) */}
              <div className="hidden sm:flex absolute -top-5 left-10 size-9 sm:size-10 rounded-full bg-white dark:bg-[#161b22] shadow-md border border-[#ded8d1]/60 dark:border-[#30363d] items-center justify-center text-[#0f4c81] z-20">
                <GraduationCap className="size-4.5 sm:size-5" />
              </div>

              <div className="hidden sm:flex absolute -top-6 right-20 size-9 sm:size-10 rounded-full bg-white dark:bg-[#161b22] shadow-md border border-[#ded8d1]/60 dark:border-[#30363d] items-center justify-center text-[#16804d] z-20">
                <Briefcase className="size-4.5 sm:size-5" />
              </div>

              <div className="hidden sm:flex absolute top-1/4 -left-2 size-9 sm:size-10 rounded-full bg-white dark:bg-[#161b22] shadow-md border border-[#ded8d1]/60 dark:border-[#30363d] items-center justify-center text-[#0f4c81] z-20">
                <Users className="size-4.5 sm:size-5" />
              </div>

              <div className="hidden sm:flex absolute top-1/3 -right-2 size-9 sm:size-10 rounded-full bg-white dark:bg-[#161b22] shadow-md border border-[#ded8d1]/60 dark:border-[#30363d] items-center justify-center text-[#0d9488] z-20">
                <ShoppingCart className="size-4.5 sm:size-5" />
              </div>

              {/* Laptop Mockup Wrapper */}
              <div className="relative z-10 mx-auto w-full pt-4 sm:pt-6">
                <div className="relative mx-auto rounded-t-2xl border-[3px] sm:border-4 border-[#333e48] bg-[#1e293b] p-1.5 shadow-2xl overflow-hidden">
                  {/* Laptop Camera dot */}
                  <div className="mx-auto size-1.5 rounded-full bg-slate-600 mb-1" />

                  {/* Laptop Screen Content */}
                  <div className="rounded-lg bg-white dark:bg-[#0d1117] p-2.5 sm:p-3 text-left border border-slate-200 dark:border-slate-800">
                    {/* Header inside laptop */}
                    <div className="flex items-center justify-between pb-1.5 sm:pb-2 border-b border-slate-100 dark:border-slate-800 text-[9px] sm:text-[10px]">
                      <div className="flex items-center gap-1 font-bold text-[#0f4c81] dark:text-[#58a6ff]">
                        <img src="/logo.png" alt="MGN" className="h-3.5 sm:h-4 w-auto object-contain" />
                      </div>
                      <span className="text-[#555] dark:text-slate-400 font-medium truncate max-w-[140px] sm:max-w-none">
                        Welcome back, Dr. Priya
                      </span>
                    </div>

                    {/* Dashboard Mini Cards inside laptop */}
                    <div className="pt-2 space-y-1.5 sm:space-y-2">
                      <div className="text-[9px] sm:text-[10px] font-bold text-[#171717] dark:text-white">Discover Opportunities</div>
                      <div className="grid grid-cols-4 gap-1 text-[7px] sm:text-[8px] text-center font-medium">
                        <div className="p-1 sm:p-1.5 rounded-md bg-[#eef5fc] dark:bg-[#1e293b] text-[#0f4c81] dark:text-[#58a6ff]">
                          Network
                        </div>
                        <div className="p-1 sm:p-1.5 rounded-md bg-[#ecfdf5] dark:bg-[#064e3b]/30 text-[#16804d] dark:text-[#34d399]">
                          Jobs
                        </div>
                        <div className="p-1 sm:p-1.5 rounded-md bg-[#f0f9ff] dark:bg-[#0c4a6e]/30 text-[#0284c7] dark:text-[#38bdf8]">
                          Learning
                        </div>
                        <div className="p-1 sm:p-1.5 rounded-md bg-[#faf5ff] dark:bg-[#581c87]/30 text-[#7c3aed] dark:text-[#c084fc]">
                          Market
                        </div>
                      </div>

                      {/* Mini Job / Feed item */}
                      <div className="p-1.5 sm:p-2 rounded-lg bg-[#faf9f8] dark:bg-[#161b22] border border-[#e5e7eb] dark:border-slate-800 flex items-center justify-between text-[8px] sm:text-[9px]">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="size-4 sm:size-5 rounded-full bg-[#0f4c81] text-white flex items-center justify-center font-bold text-[7px] sm:text-[8px] shrink-0">
                            P
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-[#171717] dark:text-white truncate">Physiotherapist (Sports Rehab)</div>
                            <div className="text-slate-400 text-[7px] sm:text-[8px] truncate">Apollo Hospital • Full Time</div>
                          </div>
                        </div>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[7px] sm:text-[8px] font-semibold shrink-0 ml-1">
                          Verified
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Laptop Base */}
                  <div className="h-2.5 sm:h-3 w-full bg-[#475569] rounded-b-xl border-t border-[#64748b] mt-1" />
                </div>

                {/* Overlaid Smartphone Mockup on Right */}
                <div className="absolute -bottom-3 sm:-bottom-4 right-1 sm:right-4 w-28 sm:w-36 rounded-2xl border-[3px] sm:border-4 border-[#1e293b] bg-white dark:bg-[#161b22] p-1 sm:p-1.5 shadow-2xl z-30 transform rotate-1">
                  {/* Speaker pill */}
                  <div className="mx-auto h-0.5 sm:h-1 w-6 sm:w-8 rounded-full bg-slate-400 mb-1" />
                  <div className="space-y-1 sm:space-y-1.5 text-[7px] sm:text-[8px] text-left">
                    <div className="flex items-center justify-between border-b pb-0.5 text-[6px] sm:text-[7px] text-[#0f4c81] font-bold">
                      <span>+MGN</span>
                      <span className="size-1 sm:size-1.5 rounded-full bg-emerald-500" />
                    </div>
                    <div className="font-bold text-[#171717] dark:text-white truncate">Top Learning Picks</div>
                    <div className="p-1 rounded bg-[#eef5fc] dark:bg-[#1e293b] text-[#0f4c81] font-semibold truncate">
                      Accredited CME: ICU Critical Care
                    </div>
                    <div className="p-1 rounded bg-[#ecfdf5] dark:bg-[#064e3b]/30 text-[#16804d] font-semibold truncate">
                      Clinical Case: Sports Knee Injury
                    </div>
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
