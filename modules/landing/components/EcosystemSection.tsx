"use client";

import * as React from "react";
import {
  Users,
  Briefcase,
  GraduationCap,
  Calendar,
  Microscope,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

interface EcosystemSectionProps {
  onOpenAuth: (mode?: "signin" | "signup") => void;
}

export function EcosystemSection({ onOpenAuth }: EcosystemSectionProps) {
  const pillars = [
    {
      title: "Verified Professional Network",
      description:
        "Connect directly with authenticated doctors, physiotherapists, surgeons, and healthcare researchers. Build meaningful professional relationships without spam.",
      icon: Users,
      color: "#0f4c81",
      bgColor: "#eef5fc",
      badge: "Doctor-to-Doctor",
    },
    {
      title: "Clinical Careers & Opportunities",
      description:
        "Access verified openings at top hospitals, specialized clinics, and medical institutes. Apply securely with your authenticated credentials.",
      icon: Briefcase,
      color: "#b45309",
      bgColor: "#fef3c7",
      badge: "Verified Openings",
    },
    {
      title: "Accredited Learn & CME",
      description:
        "Earn clinical CME credit points through specialized courses, masterclasses, and workshops designed by accredited medical bodies.",
      icon: GraduationCap,
      color: "#4f46e5",
      bgColor: "#ede9fe",
      badge: "Accredited Credits",
    },
    {
      title: "Conferences & Medical Camps",
      description:
        "Discover global medical summits, clinical webinars, and volunteer for community health camps to make a tangible public health impact.",
      icon: Calendar,
      color: "#16804d",
      bgColor: "#eef8f2",
      badge: "Events & Outreach",
    },
    {
      title: "Collaborative Research & Trials",
      description:
        "Find co-authors, propose multi-center research studies, recruit clinical investigators, and publish peer-reviewed papers.",
      icon: Microscope,
      color: "#0d9488",
      bgColor: "#ccfbf1",
      badge: "Peer Research",
    },
    {
      title: "Secure Clinical Communication",
      description:
        "Coordinate clinical cases in encrypted direct and group channels, schedule inter-departmental meetings, and consult specialists instantly.",
      icon: MessageSquare,
      color: "#7c3aed",
      bgColor: "#f3e8ff",
      badge: "Encrypted & Safe",
    },
  ];

  return (
    <section id="ecosystem" className="bg-[#faf9f8] py-16 sm:py-24 border-t border-[#ded8d1]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0f4c81] bg-[#eef5fc] px-3.5 py-1 rounded-full mb-3">
            Integrated Platform
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-[#171717] tracking-tight">
            Built Exclusively for Healthcare Leaders
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#5d5854] font-medium leading-relaxed">
            Everything medical professionals need to connect, grow, learn, and lead in one unified, credential-verified ecosystem.
          </p>
        </div>

        {/* 6 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {pillars.map((pillar, idx) => {
            const IconComponent = pillar.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl sm:rounded-3xl border border-[#ded8d1] bg-white p-6 sm:p-7 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group hover:border-[#0f4c81]/30"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="size-12 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                      style={{ backgroundColor: pillar.bgColor, color: pillar.color }}
                    >
                      <IconComponent className="size-6 stroke-[2]" />
                    </div>
                    <span
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
                      style={{
                        backgroundColor: pillar.bgColor,
                        color: pillar.color,
                        borderColor: pillar.color + "30",
                      }}
                    >
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#171717] group-hover:text-[#0f4c81] transition-colors">
                    {pillar.title}
                  </h3>

                  <p className="mt-2.5 text-xs sm:text-sm text-[#77716b] font-medium leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#f0efee]">
                  <button
                    type="button"
                    onClick={() => onOpenAuth("signup")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0f4c81] hover:text-[#0c3c66] transition cursor-pointer"
                  >
                    <span>Explore {pillar.title.split(" ")[0]}</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
