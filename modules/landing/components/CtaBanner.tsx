"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Stethoscope, HeartPulse, Award } from "lucide-react";

interface CtaBannerProps {
  onOpenAuth: (mode?: "signin" | "signup") => void;
}

export function CtaBanner({ onOpenAuth }: CtaBannerProps) {
  return (
    <section className="py-10 sm:py-16 lg:py-20 bg-white dark:bg-[#0b0f17]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f4c81] via-[#0c3c66] to-[#082846] text-white p-6 sm:p-10 lg:p-14 shadow-2xl">
          {/* Subtle decorative background circles */}
          <div className="absolute -top-24 -right-24 size-72 sm:size-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 size-72 sm:size-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left side text & CTA */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 backdrop-blur-xs border border-white/10">
                <Sparkles className="size-3.5 shrink-0" />
                <span>Join the Verified Healthcare Network</span>
              </div>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight text-balance">
                Ready to Connect, Grow &amp; Thrive?
              </h2>

              <p className="text-xs sm:text-sm lg:text-base text-slate-200 leading-relaxed max-w-xl mx-auto lg:mx-0 text-pretty">
                Join thousands of verified healthcare professionals, students, and organizations already collaborating, hiring, learning, and advancing medicine on MGN.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onOpenAuth("signup")}
                  className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-white text-[#0f4c81] hover:bg-slate-100 px-6 sm:px-8 py-3.5 text-xs sm:text-sm lg:text-base font-bold shadow-lg hover:shadow-xl transition cursor-pointer group"
                >
                  <span>Join MGN Today – It&apos;s Free</span>
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => onOpenAuth("signin")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 hover:bg-white/15 px-5 py-3.5 text-xs sm:text-sm font-semibold text-white transition cursor-pointer"
                >
                  <span>Sign In</span>
                </button>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-2 text-[11px] sm:text-xs text-emerald-300/90 pt-1 text-pretty">
                <ShieldCheck className="size-4 shrink-0" />
                <span>No credit card required. Free forever for individual clinicians and students.</span>
              </div>
            </div>

            {/* Right side graphic mockup */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-sm rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-4 sm:p-6 shadow-2xl space-y-3.5 sm:space-y-4 text-left">
                {/* Visual Header */}
                <div className="flex items-center gap-3 border-b border-white/10 pb-3 sm:pb-4">
                  <div className="size-10 sm:size-11 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
                    <Stethoscope className="size-5 sm:size-6" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-white">Healthcare Ecosystem</div>
                    <div className="text-[11px] sm:text-xs text-emerald-300 font-medium">100% Medical License Verified</div>
                  </div>
                </div>

                {/* Badges Stack */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="font-semibold text-white flex items-center gap-2 truncate pr-2">
                      <HeartPulse className="size-3.5 sm:size-4 text-rose-400 shrink-0" />
                      <span className="truncate">Collaborative Discussions</span>
                    </span>
                    <span className="text-[9px] sm:text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold shrink-0">Active</span>
                  </div>

                  <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="font-semibold text-white flex items-center gap-2 truncate pr-2">
                      <Award className="size-3.5 sm:size-4 text-amber-300 shrink-0" />
                      <span className="truncate">Accredited CME &amp; Research</span>
                    </span>
                    <span className="text-[9px] sm:text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-bold shrink-0">Verified</span>
                  </div>
                </div>

                <div className="text-center pt-1 sm:pt-2">
                  <Link
                    href="/about"
                    className="text-[11px] sm:text-xs font-semibold text-slate-300 hover:text-white transition inline-flex items-center gap-1"
                  >
                    <span>Learn how MGN transforms healthcare</span>
                    <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
