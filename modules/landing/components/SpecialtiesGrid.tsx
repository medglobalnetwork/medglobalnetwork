"use client";

import * as React from "react";
import {
  Stethoscope,
  Activity,
  Heart,
  Brain,
  Bone,
  Eye,
  Syringe,
  Baby,
  Pill,
  Microscope,
  Crosshair,
  Flame,
  ArrowRight,
} from "lucide-react";

interface SpecialtiesGridProps {
  onOpenAuth: (mode?: "signin" | "signup") => void;
}

export function SpecialtiesGrid({ onOpenAuth }: SpecialtiesGridProps) {
  const specialties = [
    { name: "Physiotherapy & Rehab", icon: Activity, count: "12,400+ Clinicians" },
    { name: "Orthopedic Surgery", icon: Bone, count: "6,800+ Surgeons" },
    { name: "Cardiology", icon: Heart, count: "5,200+ Specialists" },
    { name: "Neurology & Neurosurgery", icon: Brain, count: "4,100+ Specialists" },
    { name: "Nursing & Critical Care", icon: Syringe, count: "11,500+ Nurses" },
    { name: "Clinical Research & Trials", icon: Microscope, count: "3,800+ Researchers" },
    { name: "Pediatrics & Neonatology", icon: Baby, count: "4,900+ Doctors" },
    { name: "Radiology & Imaging", icon: Crosshair, count: "3,400+ Radiologists" },
    { name: "General Medicine", icon: Stethoscope, count: "8,900+ Physicians" },
    { name: "Oncology & Radiotherapy", icon: Flame, count: "2,700+ Oncologists" },
    { name: "Ophthalmology", icon: Eye, count: "2,300+ Eye Surgeons" },
    { name: "Pharmacy & Pharmacology", icon: Pill, count: "4,500+ Pharmacists" },
  ];

  return (
    <section id="specialties" className="bg-white py-16 sm:py-24 border-t border-[#ded8d1]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0f4c81] bg-[#eef5fc] px-3.5 py-1 rounded-full mb-3 inline-block">
            Specialty Hubs
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-[#171717] tracking-tight">
            Connecting All Healthcare Specialties
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#5d5854] font-medium leading-relaxed">
            Find peer clinical discussions, case reviews, specialized job openings, and accredited CME tailored specifically to your domain of practice.
          </p>
        </div>

        {/* Specialties Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {specialties.map((spec, idx) => {
            const IconComp = spec.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onOpenAuth("signup")}
                className="group flex flex-col items-start p-4 sm:p-5 rounded-2xl border border-[#ded8d1] bg-[#faf9f8] hover:bg-white hover:border-[#0f4c81]/40 hover:shadow-sm transition-all duration-150 text-left cursor-pointer"
              >
                <div className="size-10 rounded-xl bg-white border border-[#ded8d1] flex items-center justify-center text-[#0f4c81] group-hover:bg-[#0f4c81] group-hover:text-white transition-colors duration-150 mb-3">
                  <IconComp className="size-5 stroke-[2]" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-[#171717] group-hover:text-[#0f4c81] transition-colors line-clamp-1">
                  {spec.name}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-[#77716b] font-medium mt-0.5">
                  {spec.count}
                </p>
              </button>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-14 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-3 rounded-2xl bg-[#faf9f8] border border-[#ded8d1] p-4 sm:px-6">
            <span className="text-xs sm:text-sm font-bold text-[#171717]">
              Are you a hospital, medical college, or healthcare organisation?
            </span>
            <button
              type="button"
              onClick={() => onOpenAuth("signup")}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0f4c81] hover:underline"
            >
              <span>Register as Verified Institution</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
