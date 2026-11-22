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

  const formatStatValue = (count?: number) => {
    if (typeof count !== "number") return "—";
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k+`;
    return `${count}+`;
  };

  const stats = [
    {
      id: "professionals",
      icon: Users,
      value: statsData !== null ? formatStatValue(statsData.professionals) : "Live",
      label: "Healthcare Professionals Onboarded",
    },
    {
      id: "jobs",
      icon: Briefcase,
      value: statsData !== null ? formatStatValue(statsData.jobs) : "Active",
      label: "Clinical Opportunities & Hospital Jobs",
    },
    {
      id: "courses",
      icon: GraduationCap,
      value: statsData !== null ? formatStatValue(statsData.courses) : "Accredited",
      label: "CME Modules & Surgical Masterclasses",
    },
    {
      id: "trust",
      icon: ShieldCheck,
      value: "100%",
      label: "Council-Verified Medical Community",
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-white dark:bg-[#0b0f17] border-b border-slate-200/60 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-[#0c2b4e] text-white p-8 sm:p-10 lg:p-12 shadow-xl relative overflow-hidden">
          {/* Subtle Glow */}
          <div className="absolute top-0 right-0 size-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative z-10">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.id}
                  className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3.5 sm:gap-4 p-2"
                >
                  <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-white shadow-2xs border border-white/15">
                    <Icon className="size-6 stroke-[2]" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                      {s.value}
                    </div>
                    <div className="text-xs sm:text-[13px] text-blue-100/80 font-medium leading-snug mt-1">
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
