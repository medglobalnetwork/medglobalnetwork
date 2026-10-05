"use client";

import * as React from "react";
import { Users, Briefcase, GraduationCap, ShieldCheck } from "lucide-react";

interface PublicStats {
  professionals: number;
  jobs: number;
  courses: number;
  verifiedClinicians: number;
}

export function StatsBanner() {
  const [statsData, setStatsData] = React.useState<PublicStats | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/public/stats")
      .then((res) => {
        if (!res.ok) throw new Error("Stats fetch failed");
        return res.json();
      })
      .then((data: PublicStats) => {
        if (!cancelled) setStatsData(data);
      })
      .catch((err) => {
        console.warn("Could not load real-time platform statistics:", err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const formatStatValue = (count: number, suffix = "+") => {
    if (count <= 0) return "0";
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k+`;
    return `${count}${suffix}`;
  };

  const stats = [
    {
      id: "professionals",
      icon: Users,
      value: statsData !== null ? formatStatValue(statsData.professionals) : "...",
      label: "Healthcare Professionals Onboarded",
    },
    {
      id: "jobs",
      icon: Briefcase,
      value: statsData !== null ? formatStatValue(statsData.jobs) : "...",
      label: "Clinical Opportunities & Jobs",
    },
    {
      id: "courses",
      icon: GraduationCap,
      value: statsData !== null ? formatStatValue(statsData.courses) : "...",
      label: "Accredited CME & Courses",
    },
    {
      id: "trust",
      icon: ShieldCheck,
      value: statsData?.verifiedClinicians && statsData.verifiedClinicians > 0
        ? `${statsData.verifiedClinicians}+`
        : "100%",
      label: statsData?.verifiedClinicians && statsData.verifiedClinicians > 0
        ? "Council-Verified Clinicians"
        : "Verified & Trusted Community",
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
