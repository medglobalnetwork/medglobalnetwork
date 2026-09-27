"use client";

import * as React from "react";
import { Stethoscope, GraduationCap, Building2, Store } from "lucide-react";

export function AudienceSection() {
  const audiences = [
    {
      id: "professionals",
      icon: Stethoscope,
      bgGradient: "from-blue-500/10 to-indigo-500/10 text-[#0f4c81]",
      title: "Healthcare Professionals",
      subtitle: "Doctors, Nurses, Therapists, Technicians & more",
    },
    {
      id: "students",
      icon: GraduationCap,
      bgGradient: "from-emerald-500/10 to-teal-500/10 text-[#16804d]",
      title: "Students & Learners",
      subtitle: "Medical, Paramedical & Allied Health Students",
    },
    {
      id: "organizations",
      icon: Building2,
      bgGradient: "from-cyan-500/10 to-blue-500/10 text-[#0284c7]",
      title: "Organizations",
      subtitle: "Hospitals, Clinics, Institutions & Recruiters",
    },
    {
      id: "businesses",
      icon: Store,
      bgGradient: "from-purple-500/10 to-pink-500/10 text-[#7c3aed]",
      title: "Businesses",
      subtitle: "Suppliers, Manufacturers & Service Providers",
    },
  ];

  return (
    <section id="audience" className="py-16 sm:py-20 bg-[#faf9f8] dark:bg-[#0e141f]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#171717] dark:text-[#f0f6fc]">
            Who Is MGN For?
          </h2>
        </div>

        {/* 4 Audience Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6 text-center">
          {audiences.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="flex flex-col items-center space-y-3.5 group">
                {/* Circular Avatar / Icon Graphic */}
                <div className={`size-24 sm:size-28 rounded-full bg-gradient-to-tr ${item.bgGradient} border-2 border-white dark:border-[#30363d] shadow-md flex items-center justify-center transition-transform duration-200 group-hover:scale-105`}>
                  <Icon className="size-10 sm:size-12 stroke-[1.8]" />
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#171717] dark:text-[#f0f6fc]">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-[13px] text-[#555] dark:text-[#8b949e] max-w-[220px] leading-relaxed">
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
