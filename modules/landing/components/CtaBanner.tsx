"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Mail, Sparkles, CheckCircle2 } from "lucide-react";

interface CtaBannerProps {
  onOpenAuth: (mode?: "signin" | "signup") => void;
}

export function CtaBanner({ onOpenAuth }: CtaBannerProps) {
  const [email, setEmail] = React.useState("");
  const [subscribed, setSubscribed] = React.useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubscribed(true);
  };

  return (
    <section className="relative py-16 sm:py-20 bg-white dark:bg-[#0b0f17]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-[#0c2b4e] text-white p-8 sm:p-12 lg:p-16 shadow-xl">
          {/* Subtle Glow */}
          <div className="absolute top-0 right-0 size-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Column: Heading & Value */}
            <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
              <h2 className="text-2xl sm:text-4xl lg:text-[44px] font-black text-white leading-tight tracking-tight">
                One Network. <br />
                Endless Opportunities.
              </h2>

              <p className="text-xs sm:text-sm lg:text-base text-blue-100/90 leading-relaxed max-w-xl mx-auto lg:mx-0">
                MGN connects healthcare professionals, students, organizations and businesses on a single authenticated platform to learn, grow, collaborate and advance medicine.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onOpenAuth("signup")}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-white text-[#0c2b4e] hover:bg-slate-100 px-7 py-3 text-sm sm:text-base font-bold shadow-sm transition-all cursor-pointer group"
                >
                  <span>Join MGN Free</span>
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => onOpenAuth("signin")}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/40 hover:bg-white/10 px-6 py-3 text-sm sm:text-base font-semibold text-white transition-all cursor-pointer"
                >
                  <span>Sign In</span>
                </button>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-2 text-xs text-blue-100/80 pt-1">
                <ShieldCheck className="size-4 text-emerald-300 shrink-0" />
                <span>No credit card required • 100% Free for individual clinicians &amp; students</span>
              </div>
            </div>

            {/* Right Column: Weekly Clinical Digest */}
            <div className="lg:col-span-5">
              <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-6 sm:p-7 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-100">
                  SUBSCRIBE TO WEEKLY CLINICAL DIGEST
                </h3>
                <p className="text-xs text-blue-100/80 leading-relaxed">
                  Receive curated peer-reviewed case briefs, high-priority hospital openings, and CME alerts directly in your inbox.
                </p>

                {subscribed ? (
                  <div className="p-4 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-xs font-bold text-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-300" />
                    <span>Subscribed! Check your inbox for the weekly briefing.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-blue-200/70" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="doctor@hospital.org"
                        className="w-full rounded-lg bg-white/15 border border-white/25 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-blue-200/60 focus:outline-hidden focus:ring-2 focus:ring-white/40"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#16804d] hover:bg-[#126b40] text-white py-2.5 px-4 text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <span>Get Weekly Briefing</span>
                      <ArrowRight className="size-3.5" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
