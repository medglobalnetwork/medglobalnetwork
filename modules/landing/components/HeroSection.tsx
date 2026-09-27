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
  Stethoscope,
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
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#fbfbfb] to-[#faf9f8] dark:from-[#0b0f17] dark:via-[#0e141f] dark:to-[#0b0f17] pt-8 pb-16 sm:pt-14 sm:pb-24 lg:pt-18 lg:pb-28">
      {/* Subtle Background Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 -z-10 w-full max-w-7xl h-[550px] pointer-events-none opacity-40">
        <div className="absolute top-0 right-10 size-[480px] rounded-full bg-gradient-to-br from-[#0f4c81]/15 to-[#16804d]/15 blur-3xl" />
        <div className="absolute bottom-0 left-10 size-[400px] rounded-full bg-gradient-to-tr from-[#16804d]/10 to-[#0f4c81]/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* ═══════════════════════════════════════════════
              LEFT COLUMN: HEADLINE & ACTIONS
              ═══════════════════════════════════════════════ */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-7 text-left">
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight text-[#171717] dark:text-[#f0f6fc] leading-[1.12]">
              One Network. <br />
              <span className="text-[#16804d] dark:text-[#2ea043]">
                Endless Opportunities.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-sm sm:text-base text-[#4b5563] dark:text-[#9ca3af] leading-relaxed max-w-xl font-normal">
              MGN connects healthcare professionals, students, organizations, and businesses on a single platform to learn, grow, collaborate, and thrive.
            </p>

            {/* 4 Value Proposition Badges */}
            <div className="flex items-center gap-4 sm:gap-6 flex-wrap pt-1 text-xs font-semibold text-[#1f2937] dark:text-[#f0f6fc]">
              <div className="flex items-center gap-1.5 text-[#0f4c81] dark:text-[#58a6ff]">
                <Users className="size-4" />
                <span>Connect</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#16804d] dark:text-[#3fb950]">
                <BookOpen className="size-4" />
                <span>Learn</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#0d9488] dark:text-[#2dd4bf]">
                <TrendingUp className="size-4" />
                <span>Grow</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#eab308] dark:text-[#facc15]">
                <Sparkles className="size-4" />
                <span>Thrive</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-2">
              {isLoggedIn ? (
                <Link
                  href="/home"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f4c81] dark:bg-[#14559b] px-7 py-3.5 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-[#0c3c66] dark:hover:bg-[#0f4c81] transition active:scale-98"
                >
                  <span>Go to Your Dashboard</span>
                  <ArrowRight className="size-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f4c81] dark:bg-[#14559b] px-7 py-3.5 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-[#0c3c66] dark:hover:bg-[#0f4c81] transition active:scale-98 cursor-pointer"
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
            <div className="flex items-center gap-2 text-xs font-medium text-[#4b5563] dark:text-[#8b949e] pt-1">
              <ShieldCheck className="size-4 text-[#16804d]" />
              <span>Trusted | Verified | Healthcare Focused</span>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════
              RIGHT COLUMN: REALISTIC DEVICE & HERO COMPOSITION
              ═══════════════════════════════════════════════ */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            {/* Orbiting Floating Icon Badges */}
            <div className="relative w-full max-w-[540px]">
              {/* Floating Orbit Icons */}
              <div className="absolute -top-6 left-12 size-10 rounded-full bg-white dark:bg-[#161b22] shadow-md border border-[#ded8d1]/60 dark:border-[#30363d] flex items-center justify-center text-[#0f4c81] z-20 animate-bounce duration-1000">
                <GraduationCap className="size-5" />
              </div>

              <div className="absolute -top-8 right-28 size-10 rounded-full bg-white dark:bg-[#161b22] shadow-md border border-[#ded8d1]/60 dark:border-[#30363d] flex items-center justify-center text-[#16804d] z-20">
                <Briefcase className="size-5" />
              </div>

              <div className="absolute top-1/4 -left-3 size-10 rounded-full bg-white dark:bg-[#161b22] shadow-md border border-[#ded8d1]/60 dark:border-[#30363d] flex items-center justify-center text-[#0f4c81] z-20">
                <Users className="size-5" />
              </div>

              <div className="absolute top-1/3 -right-2 size-10 rounded-full bg-white dark:bg-[#161b22] shadow-md border border-[#ded8d1]/60 dark:border-[#30363d] flex items-center justify-center text-[#0d9488] z-20">
                <ShoppingCart className="size-5" />
              </div>

              {/* Medical Professionals Banner Layer */}
              <div className="relative z-10 mx-auto w-full pt-6">
                {/* Laptop Mockup Wrapper */}
                <div className="relative mx-auto rounded-t-2xl border-4 border-[#333e48] bg-[#1e293b] p-1.5 shadow-2xl">
                  {/* Laptop Camera dot */}
                  <div className="mx-auto size-1.5 rounded-full bg-slate-600 mb-1" />

                  {/* Laptop Screen Content */}
                  <div className="rounded-lg bg-white dark:bg-[#0d1117] p-3 text-left overflow-hidden border border-slate-200 dark:border-slate-800">
                    {/* Header inside laptop */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-[10px]">
                      <div className="flex items-center gap-1 font-bold text-[#0f4c81] dark:text-[#58a6ff]">
                        <img src="/logo.png" alt="MGN" className="h-4 w-auto object-contain" />
                      </div>
                      <span className="text-[#555] dark:text-slate-400 font-medium">Welcome back, Dr. Priya</span>
                    </div>

                    {/* Dashboard Mini Cards inside laptop */}
                    <div className="pt-2 space-y-2">
                      <div className="text-[10px] font-bold text-[#171717] dark:text-white">Discover Opportunities</div>
                      <div className="grid grid-cols-4 gap-1 text-[8px] text-center font-medium">
                        <div className="p-1.5 rounded-md bg-[#eef5fc] dark:bg-[#1e293b] text-[#0f4c81] dark:text-[#58a6ff]">
                          Network
                        </div>
                        <div className="p-1.5 rounded-md bg-[#ecfdf5] dark:bg-[#064e3b]/30 text-[#16804d] dark:text-[#34d399]">
                          Jobs
                        </div>
                        <div className="p-1.5 rounded-md bg-[#f0f9ff] dark:bg-[#0c4a6e]/30 text-[#0284c7] dark:text-[#38bdf8]">
                          Learning
                        </div>
                        <div className="p-1.5 rounded-md bg-[#faf5ff] dark:bg-[#581c87]/30 text-[#7c3aed] dark:text-[#c084fc]">
                          Marketplace
                        </div>
                      </div>

                      {/* Mini Job / Feed item */}
                      <div className="p-2 rounded-lg bg-[#faf9f8] dark:bg-[#161b22] border border-[#e5e7eb] dark:border-slate-800 flex items-center justify-between text-[9px]">
                        <div className="flex items-center gap-1.5">
                          <div className="size-5 rounded-full bg-[#0f4c81] text-white flex items-center justify-center font-bold text-[8px]">
                            P
                          </div>
                          <div>
                            <div className="font-semibold text-[#171717] dark:text-white">Physiotherapist (Sports Rehab)</div>
                            <div className="text-slate-400 text-[8px]">Apollo Hospital • Full Time</div>
                          </div>
                        </div>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[8px] font-semibold">
                          Verified
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Laptop Base */}
                  <div className="h-3 w-[106%] -ml-[3%] bg-[#475569] rounded-b-xl border-t border-[#64748b]" />
                </div>

                {/* Overlaid Smartphone Mockup on Right */}
                <div className="absolute -bottom-4 right-2 sm:right-6 w-32 sm:w-36 rounded-2xl border-4 border-[#1e293b] bg-white dark:bg-[#161b22] p-1.5 shadow-2xl z-30 transform rotate-1">
                  {/* Speaker pill */}
                  <div className="mx-auto h-1 w-8 rounded-full bg-slate-400 mb-1" />
                  <div className="space-y-1.5 text-[8px]">
                    <div className="flex items-center justify-between border-b pb-1 text-[7px] text-[#0f4c81] font-bold">
                      <span>+MGN</span>
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                    </div>
                    <div className="font-bold text-[#171717] dark:text-white text-[8px]">Top Learning Picks</div>
                    <div className="p-1 rounded bg-[#eef5fc] dark:bg-[#1e293b] text-[#0f4c81] font-semibold text-[7px]">
                      Accredited CME: ICU Critical Care
                    </div>
                    <div className="p-1 rounded bg-[#ecfdf5] dark:bg-[#064e3b]/30 text-[#16804d] font-semibold text-[7px]">
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
