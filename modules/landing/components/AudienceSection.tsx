"use client";

import * as React from "react";
import { Stethoscope, GraduationCap, Building2, Store } from "lucide-react";

export function AudienceSection() {
  const audiences = [
    {
      id: "professionals",
      icon: Stethoscope,
      bgGradient: "from-blue-500/10 to-indigo-500/10 text-[#0c2b4e] dark:text-[#58a6ff]",
      title: "Healthcare Professionals",
      subtitle: "Doctors, Surgeons, Residents, Nurses, Therapists & Allied Health Experts",
    },
    {
      id: "students",
      icon: GraduationCap,
      bgGradient: "from-emerald-500/10 to-teal-500/10 text-[#16804d] dark:text-[#3fb950]",
      title: "Students & Learners",
      subtitle: "MBBS, MD/MS, DNB, Nursing & Allied Health Students Preparing for Practice",
    },
    {
      id: "organizations",
      icon: Building2,
      bgGradient: "from-cyan-500/10 to-blue-500/10 text-[#0f4c81] dark:text-[#38bdf8]",
      title: "Hospitals & Institutions",
      subtitle: "Multi-Specialty Hospitals, Clinics, Research Centers & Talent Recruiters",
    },
    {
      id: "businesses",
      icon: Store,
      bgGradient: "from-purple-500/10 to-pink-500/10 text-[#7c3aed] dark:text-[#c084fc]",
      title: "Medical Businesses",
      subtitle: "Medical Device Suppliers, Diagnostic Manufacturers & Pharma Enterprises",
    },
  ];

  return (
    <section id="audience" className="py-16 sm:py-24 bg-white dark:bg-[#0b0f17] border-b border-slate-200/60 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#16804d] bg-emerald-50 dark:bg-emerald-950/50 px-3.5 py-1 rounded-md mb-3 inline-block border border-emerald-200/60 dark:border-emerald-900/40">
            For The Entire Medical Fraternity
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0c2b4e] dark:text-[#f0f6fc] tracking-tight">
            Who Is MGN For?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#4b5563] dark:text-[#8b949e]">
            Empowering every healthcare stakeholder with specialized tools, verified privacy, and clinical focus
          </p>
        </div>

        {/* 4 Audience Cards - Rounded-xl */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {audiences.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="flex flex-col items-center p-7 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-[#fafbfc] dark:bg-[#161b22] hover:bg-white dark:hover:bg-[#1c2433] hover:shadow-lg transition-all duration-300 shadow-2xs"
              >
                {/* Circular Avatar Graphic */}
                <div
                  className={`size-20 rounded-2xl bg-gradient-to-tr ${item.bgGradient} border-2 border-slate-100 dark:border-[#21262d] shadow-2xs flex items-center justify-center mb-5`}
                >
                  <Icon className="size-9 stroke-[1.8]" />
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#0c2b4e] dark:text-[#f0f6fc]">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-[13px] text-[#6b7280] dark:text-[#8b949e] mt-2 leading-relaxed">
                  {item.subtitle}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
