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
    <section className="py-8 sm:py-12 bg-white dark:bg-[#0b0f17]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#0f4c81] dark:bg-[#0c3c66] text-white p-8 sm:p-10 lg:p-12 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-white/15">
            {stats.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.id}
                  className={`flex items-center gap-4 ${
                    idx !== 0 ? "pt-6 sm:pt-0 sm:pl-6 lg:pl-8" : ""
                  }`}
                >
                  <div className="size-12 sm:size-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                    <Icon className="size-6 sm:size-7 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      {s.value}
                    </div>
                    <div className="text-xs sm:text-[13px] text-white/80 font-medium mt-0.5 leading-snug">
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
