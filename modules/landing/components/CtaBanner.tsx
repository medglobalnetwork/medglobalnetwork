"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Stethoscope, HeartPulse, Award } from "lucide-react";

interface CtaBannerProps {
  onOpenAuth: (mode?: "signin" | "signup") => void;
}

export function CtaBanner({ onOpenAuth }: CtaBannerProps) {
  return (
    <section className="py-14 sm:py-20 bg-white dark:bg-[#0b0f17]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f4c81] via-[#0c3c66] to-[#082846] text-white p-8 sm:p-12 lg:p-16 shadow-2xl">
          {/* Subtle decorative background circles */}
          <div className="absolute -top-24 -right-24 size-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 size-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left side text & CTA */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 backdrop-blur-xs border border-white/10">
                <Sparkles className="size-3.5" />
                <span>Join the Verified Healthcare Network</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                Ready to Connect, Grow &amp; Thrive?
              </h2>

              <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-xl">
                Join thousands of verified healthcare professionals, students, and organizations already collaborating, hiring, learning, and advancing medicine on MGN.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => onOpenAuth("signup")}
                  className="inline-flex items-center gap-2.5 rounded-xl bg-white text-[#0f4c81] hover:bg-slate-100 px-6 sm:px-8 py-3.5 text-sm sm:text-base font-bold shadow-lg hover:shadow-xl transition cursor-pointer group"
                >
                  <span>Join MGN Today – It&apos;s Free</span>
                  <ArrowRight className="size-4.5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => onOpenAuth("signin")}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 hover:bg-white/15 px-5 py-3.5 text-sm font-semibold text-white transition cursor-pointer"
                >
                  <span>Sign In</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-emerald-300/90 pt-1">
                <ShieldCheck className="size-4 shrink-0" />
                <span>No credit card required. Free forever for individual clinicians and students.</span>
              </div>
            </div>

            {/* Right side graphic mockup */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-sm rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-6 shadow-2xl space-y-4 text-left">
                {/* Visual Header */}
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="size-11 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                    <Stethoscope className="size-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Healthcare Ecosystem</div>
                    <div className="text-xs text-emerald-300 font-medium">100% Medical License Verified</div>
                  </div>
                </div>

                {/* Badges Stack */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="font-semibold text-white flex items-center gap-2">
                      <HeartPulse className="size-4 text-rose-400" />
                      Collaborative Case Discussions
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">Active</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="font-semibold text-white flex items-center gap-2">
                      <Award className="size-4 text-amber-300" />
                      Accredited CME &amp; Research
                    </span>
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-bold">Verified</span>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <Link
                    href="/about"
                    className="text-xs font-semibold text-slate-300 hover:text-white transition inline-flex items-center gap-1"
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
