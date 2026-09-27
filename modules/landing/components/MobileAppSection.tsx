"use client";

import * as React from "react";
import { ShieldCheck, Smartphone, CheckCircle2 } from "lucide-react";

export function MobileAppSection() {
  return (
    <section id="mobile-app" className="py-16 sm:py-20 bg-white dark:bg-[#0b0f17] overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* ═══════════════════════════════════════════════
              LEFT COLUMN: DUAL SMARTPHONE MOCKUPS
              ═══════════════════════════════════════════════ */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            <div className="relative flex items-center justify-center gap-4 sm:gap-6">
              {/* Phone 1: Left */}
              <div className="w-40 sm:w-48 rounded-[28px] border-4 sm:border-[5px] border-[#1e293b] bg-white dark:bg-[#161b22] p-2 sm:p-2.5 shadow-2xl transform -rotate-2">
                {/* Notch / Speaker */}
                <div className="mx-auto h-1 sm:h-1.5 w-12 rounded-full bg-slate-400 mb-2" />
                <div className="space-y-2 text-left">
                  <div className="flex items-center justify-between border-b pb-1.5">
                    <img src="/logo.png" alt="MGN" className="h-4 w-auto object-contain" />
                    <span className="size-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="text-[10px] font-bold text-[#171717] dark:text-white">Good Morning, Dr. Priya</div>
                  <div className="grid grid-cols-2 gap-1 text-[8px]">
                    <div className="p-1.5 rounded-lg bg-[#eef5fc] dark:bg-[#1e293b] text-[#0f4c81] font-semibold text-center">
                      Network
                    </div>
                    <div className="p-1.5 rounded-lg bg-[#ecfdf5] dark:bg-[#064e3b]/30 text-[#16804d] font-semibold text-center">
                      Jobs
                    </div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-[#faf9f8] dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 text-[8px]">
                    <div className="font-bold text-[#0f4c81]">Recommended for you</div>
                    <div className="text-[7px] text-slate-500">Cardiology CME Module</div>
                  </div>
                </div>
              </div>

              {/* Phone 2: Right */}
              <div className="w-40 sm:w-48 rounded-[28px] border-4 sm:border-[5px] border-[#0f4c81] bg-white dark:bg-[#161b22] p-2 sm:p-2.5 shadow-2xl transform rotate-3">
                {/* Notch / Speaker */}
                <div className="mx-auto h-1 sm:h-1.5 w-12 rounded-full bg-slate-400 mb-2" />
                <div className="space-y-2 text-left">
                  <div className="text-[10px] font-bold text-[#16804d] flex items-center gap-1">
                    <CheckCircle2 className="size-3" />
                    <span>Verified Network</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-[#ecfdf5] dark:bg-[#064e3b]/30 text-[#16804d] text-[8px] font-semibold">
                    100% Medical License Authenticated
                  </div>
                  <div className="space-y-1 text-[8px]">
                    <div className="p-1.5 rounded-lg bg-[#faf9f8] dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800">
                      <div className="font-semibold text-[#171717] dark:text-white">Clinical Discussion</div>
                      <div className="text-[7px] text-slate-400">Orthopedic Surgery Case • 14 replies</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════
              RIGHT COLUMN: TEXT, STORE BADGES, SECURITY CARD
              ═══════════════════════════════════════════════ */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#171717] dark:text-[#f0f6fc] leading-tight">
              Take MGN Wherever You Go
            </h2>

            <p className="text-sm sm:text-base text-[#4b5563] dark:text-[#9ca3af] leading-relaxed max-w-lg">
              Stay connected, discover opportunities, and grow your career — anytime, anywhere.
            </p>

            {/* App Store / Play Store Badges */}
            <div className="flex items-center gap-3.5 flex-wrap pt-2">
              {/* Google Play Button */}
              <a
                href="#download"
                className="inline-flex items-center gap-3 rounded-xl bg-[#111827] text-white px-4 py-2.5 shadow-md hover:bg-black transition cursor-pointer"
              >
                <svg className="size-6 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a2.372 2.372 0 0 1-.61-.786 2.457 2.457 0 0 1-.19-.974V3.574c0-.348.064-.68.19-.974.13-.306.34-.582.61-.786zM15.207 13.414l2.45 2.45-12.013 6.94 9.563-9.39zm0-2.828L5.644 1.196l12.013 6.94-2.45 2.45zm1.414 1.414l3.19-1.84a1.72 1.72 0 0 1 1.72 0 1.71 1.71 0 0 1 .86 1.48v.72a1.71 1.71 0 0 1-.86 1.48 1.72 1.72 0 0 1-1.72 0l-3.19-1.84z"/>
                </svg>
                <div className="text-left">
                  <div className="text-[9px] uppercase tracking-wider text-slate-300">Get it on</div>
                  <div className="text-xs font-bold -mt-0.5">Google Play</div>
                </div>
              </a>

              {/* Apple App Store Button */}
              <a
                href="#download"
                className="inline-flex items-center gap-3 rounded-xl bg-[#111827] text-white px-4 py-2.5 shadow-md hover:bg-black transition cursor-pointer"
              >
                <svg className="size-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 1.01-2.85-.9.04-2 .6-2.65 1.35-.58.65-1.09 1.72-1.03 2.76 1.01.08 2.05-.51 2.67-1.26z"/>
                </svg>
                <div className="text-left">
                  <div className="text-[9px] uppercase tracking-wider text-slate-300">Download on the</div>
                  <div className="text-xs font-bold -mt-0.5">App Store</div>
                </div>
              </a>
            </div>

            {/* Safe Secure Verified Card */}
            <div className="p-5 rounded-2xl bg-[#eef5fc]/70 dark:bg-[#161b22] border border-[#0f4c81]/20 dark:border-[#58a6ff]/20 flex items-start gap-3.5 shadow-2xs">
              <div className="size-10 rounded-xl bg-[#0f4c81] text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">
                  Safe. Secure. Verified.
                </h4>
                <p className="text-xs text-[#555] dark:text-[#8b949e] mt-1 leading-relaxed">
                  We ensure a trusted environment with verified profiles, secure communication, and privacy you can count on.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
