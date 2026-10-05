"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck, UserPlus, Sparkles, ArrowRight } from "lucide-react";

interface CliniciansShowcaseProps {
  onOpenAuth: (mode?: "signin" | "signup") => void;
}

export function CliniciansShowcase({ onOpenAuth }: CliniciansShowcaseProps) {
  const clinicians = [
    {
      name: "Dr. Rajesh Verma, MD",
      profession: "Orthopedic Surgeon",
      specialization: "Joint Replacement & Arthroscopy",
      organization: "Max Super Specialty Hospital",
      city: "New Delhi",
      avatarColor: "#0f4c81",
      initials: "RV",
      verified: true,
      founder: true,
      connections: "1.2k+ connections",
    },
    {
      name: "Dr. Ananya Iyer, MPT",
      profession: "Sports Physiotherapist",
      specialization: "Neuromusculoskeletal Rehab",
      organization: "National Sports Academy",
      city: "Bengaluru",
      avatarColor: "#16804d",
      initials: "AI",
      verified: true,
      founder: false,
      connections: "890+ connections",
    },
    {
      name: "Dr. Sameer Kulkarni, DM",
      profession: "Cardiologist",
      specialization: "Interventional Cardiology",
      organization: "Apollo Hospitals",
      city: "Mumbai",
      avatarColor: "#4f46e5",
      initials: "SK",
      verified: true,
      founder: true,
      connections: "2.4k+ connections",
    },
    {
      name: "Dr. Meera Nambiar, PhD",
      profession: "Clinical Researcher",
      specialization: "Oncology Genomics & Trials",
      organization: "Tata Memorial Centre",
      city: "Mumbai",
      avatarColor: "#0d9488",
      initials: "MN",
      verified: true,
      founder: false,
      connections: "950+ connections",
    },
  ];

  return (
    <section id="network-showcase" className="bg-white py-16 sm:py-24 border-t border-[#ded8d1]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[#16804d] bg-[#eef8f2] px-3.5 py-1 rounded-full mb-3 inline-block">
              Verified Healthcare Graph
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#171717] tracking-tight">
              Connect with Verified Clinicians & Specialists
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#5d5854] font-medium leading-relaxed">
              Every profile on MGN is authenticated through medical councils, institutional affiliations, and clinical licensing.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenAuth("signup")}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#0f4c81] hover:text-[#0c3c66] transition cursor-pointer self-start md:self-auto"
          >
            <span>Explore Verified Profiles</span>
            <ArrowRight className="size-4" />
          </button>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {clinicians.map((doctor, idx) => (
            <div
              key={idx}
              className="group relative flex flex-col justify-between items-center text-center rounded-3xl border border-[#ded8d1] bg-white p-5 shadow-2xs hover:shadow-md hover:border-[#0f4c81]/40 transition-all duration-200"
            >
              <div className="flex flex-col items-center w-full">
                {/* Circular Profile Avatar */}
                <div className="relative mb-3.5">
                  <div
                    className="size-20 sm:size-22 rounded-full overflow-hidden flex items-center justify-center text-xl font-bold text-white shadow-sm ring-2 ring-[#0f4c81]/15 transition-transform duration-200 group-hover:scale-105"
                    style={{ background: doctor.avatarColor }}
                  >
                    {doctor.initials}
                  </div>
                  {doctor.founder && (
                    <span
                      className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-950 shadow-xs ring-2 ring-white text-xs font-bold"
                      title="Founding Member"
                    >
                      👑
                    </span>
                  )}
                </div>

                {/* Name & Badge */}
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  <h3 className="text-sm sm:text-base font-bold text-[#171717] group-hover:text-[#0f4c81] transition-colors truncate">
                    {doctor.name}
                  </h3>
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.2 text-[9px] font-bold text-[#16804d] border border-emerald-200/60">
                    <ShieldCheck className="size-3" />
                  </span>
                </div>

                {/* Profession */}
                <p className="mt-1 text-xs font-bold text-[#0f4c81] truncate max-w-full">
                  {doctor.profession}
                </p>

                {/* Specialization */}
                <p className="text-[11px] text-[#77716b] font-medium mt-0.5 truncate max-w-full">
                  {doctor.specialization}
                </p>

                {/* Organization & City */}
                <p className="text-[10px] text-[#8a8784] font-medium mt-1 truncate max-w-full">
                  {doctor.organization} · {doctor.city}
                </p>
              </div>

              {/* Connect CTA */}
              <div className="mt-5 w-full pt-3 border-t border-[#f0efee]">
                <Link
                  href="/signup"
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0f4c81] py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#0c3c66] transition active:scale-95 cursor-pointer"
                >
                  <UserPlus className="size-3.5" />
                  <span>Connect</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
