"use client";

import * as React from "react";
import Link from "next/link";
import { Users, Briefcase, GraduationCap, ShoppingCart, ArrowRight, CheckCircle2 } from "lucide-react";

export function PlatformFeaturesSection() {
  const features = [
    {
      id: "network",
      icon: Users,
      iconColor: "text-[#0c2b4e] bg-blue-100/80 dark:bg-blue-950/70",
      title: "Doctor & Clinician Network",
      description:
        "Connect with council-verified peers, collaborate on complex clinical cases, share peer-reviewed medical insights, and access secure doctor-to-doctor messaging.",
      linkText: "Explore Network",
      href: "/network",
      badge: "Doctor-to-Doctor",
      highlight: "NMC & Council Verified",
    },
    {
      id: "jobs",
      icon: Briefcase,
      iconColor: "text-[#16804d] bg-emerald-100/80 dark:bg-emerald-950/70",
      title: "Healthcare Careers & Jobs",
      description:
        "Discover verified hospital job vacancies, locum tenens, specialty fellowships, and consultant openings. Connect directly with vetted hospital HRs.",
      linkText: "Find Hospital Jobs",
      href: "/opportunities/jobs",
      badge: "Verified Openings",
      highlight: "Direct Hospital Applications",
    },
    {
      id: "learning",
      icon: GraduationCap,
      iconColor: "text-[#0d9488] bg-teal-100/80 dark:bg-teal-950/70",
      title: "CME & Clinical Learning",
      description:
        "Access accredited Continuing Medical Education (CME) courses, surgical masterclasses, clinical case walkthroughs, and verified certificates to upskill.",
      linkText: "Browse CME Courses",
      href: "/learn",
      badge: "Accredited Credits",
      highlight: "Clinical Masterclasses",
    },
    {
      id: "marketplace",
      icon: ShoppingCart,
      iconColor: "text-[#0284c7] bg-sky-100/80 dark:bg-sky-950/70",
      title: "B2B Medical Marketplace",
      description:
        "Procure certified hospital diagnostic equipment, clinical consumables, ICU essentials, and surgical instruments directly from authenticated manufacturers.",
      linkText: "View Med Marketplace",
      href: "/marketplace",
      badge: "Verified Suppliers",
      highlight: "Certified Medical Equipment",
    },
  ];

  return (
    <section
      id="features"
      className="relative isolate overflow-hidden py-20 sm:py-28 border-b border-slate-200/60 dark:border-slate-800 bg-slate-50 dark:bg-[#0c1829]"
    >
      {/* Background Graphic Layer - Doctor holding digital tablet */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none select-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/features-bg.jpg"
          alt="Healthcare Platform Background"
          className="w-full h-full object-cover object-center pointer-events-none select-none"
        />
        {/* Translucent overlay that lets the doctor, tablet, and cyan ECG pulse shine through cleanly while preserving maximum text contrast */}
        <div className="absolute inset-0 bg-white/55 dark:bg-[#0c1829]/80 backdrop-blur-[0.5px] pointer-events-none" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0c2b4e] dark:text-[#58a6ff] bg-white/90 dark:bg-blue-950/80 px-3.5 py-1 rounded-md mb-3 inline-block border border-blue-200/80 dark:border-blue-900/40 shadow-xs backdrop-blur-sm">
            Comprehensive Professional Ecosystem
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0c2b4e] dark:text-[#f0f6fc] tracking-tight text-balance">
            Everything You Need. All in One Platform.
          </h2>
          <p className="mt-3.5 text-sm sm:text-base text-[#1e293b] dark:text-[#9ca3af] max-w-2xl mx-auto leading-relaxed font-semibold">
            Eliminate fragmented WhatsApp medical groups, unverified job portals, and unauthorized vendor lists. MGN delivers the complete authenticated infrastructure for modern healthcare.
          </p>
        </div>

        {/* 4 Pillars Grid with Frosted Glass Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                className="rounded-2xl border border-white/80 dark:border-slate-700/60 bg-white/80 hover:bg-white/95 dark:bg-[#161b22]/80 dark:hover:bg-[#161b22]/95 backdrop-blur-md p-6 sm:p-7 flex flex-col justify-between shadow-lg shadow-blue-950/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group text-left relative overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`size-11 rounded-xl flex items-center justify-center ${item.iconColor} shadow-xs`}>
                      <Icon className="size-5.5 stroke-[2]" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-800 px-2.5 py-0.5 rounded-md">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-[#0c2b4e] dark:text-[#f0f6fc] group-hover:text-[#16804d] dark:group-hover:text-[#34d399] transition-colors pt-1">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#4b5563] dark:text-[#9ca3af] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6 space-y-3">
                  <div className="text-[11px] font-semibold text-[#16804d] dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 shrink-0" />
                    <span>{item.highlight}</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0c2b4e] dark:text-[#58a6ff] group-hover:gap-2.5 transition-all">
                    <span>{item.linkText}</span>
                    <ArrowRight className="size-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
