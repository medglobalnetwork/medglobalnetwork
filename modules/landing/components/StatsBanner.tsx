"use client";

import * as React from "react";
import { Users, Briefcase, GraduationCap, ShieldCheck } from "lucide-react";

export function StatsBanner() {
  const stats = [
    {
      id: "professionals",
      icon: Users,
      value: "10,000+",
      label: "Healthcare Professionals Onboarded",
    },
    {
      id: "jobs",
      icon: Briefcase,
      value: "2,000+",
      label: "Job Opportunities Posted",
    },
    {
      id: "courses",
      icon: GraduationCap,
      value: "500+",
      label: "Courses & Learning Resources",
    },
    {
      id: "trust",
      icon: ShieldCheck,
      value: "100%",
      label: "Verified & Trusted Community",
    },
  ];

  return (
    <section className="py-6 sm:py-10 lg:py-12 bg-white dark:bg-[#0b0f17]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#0f4c81] dark:bg-[#0c3c66] text-white p-6 sm:p-8 lg:p-12 shadow-xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.id}
                  className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 sm:gap-4 p-2"
                >
                  <div className="size-10 sm:size-12 lg:size-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                    <Icon className="size-5 sm:size-6 lg:size-7 text-white" />
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight tabular-nums">
                      {s.value}
                    </div>
                    <div className="text-[11px] sm:text-xs lg:text-[13px] text-white/80 font-medium mt-0.5 leading-snug text-pretty">
                      {s.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
