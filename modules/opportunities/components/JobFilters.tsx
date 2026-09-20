"use client";

import * as React from "react";
import { CheckCircle2, Circle, RotateCcw, SlidersHorizontal } from "lucide-react";

interface JobFiltersProps {
  opportunityType: string;
  onSelectOpportunityType: (type: string) => void;
  profession: string;
  onSelectProfession: (prof: string) => void;
  specialization: string;
  onSelectSpecialization: (spec: string) => void;
  workMode: string;
  onSelectWorkMode: (mode: string) => void;
  employmentType: string;
  onSelectEmploymentType: (type: string) => void;
  verifiedOnly: boolean;
  onToggleVerifiedOnly: () => void;
  onReset: () => void;
}

const OPPORTUNITY_TYPES = [
  { id: "All", label: "All Types" },
  { id: "job", label: "Jobs" },
  { id: "internship", label: "Internships" },
  { id: "clinical_internship", label: "Clinical Internships" },
  { id: "observership", label: "Observerships" },
  { id: "fellowship", label: "Fellowships" },
];

const PROFESSIONS = [
  "All",
  "Physiotherapist",
  "Doctor",
  "Surgeon",
  "Nurse",
  "Researcher",
  "Dentist",
  "Pharmacist",
  "Lab Technician",
];

const SPECIALIZATIONS = [
  "All",
  "Sports Rehabilitation",
  "Cardiology",
  "Orthopedics",
  "Musculoskeletal",
  "Neurology",
  "Pediatrics",
  "Clinical Research",
  "Critical Care",
  "General Medicine",
];

const WORK_MODES = [
  { id: "All", label: "All Modes" },
  { id: "onsite", label: "On-site" },
  { id: "hybrid", label: "Hybrid" },
  { id: "remote", label: "Remote" },
];

const EMPLOYMENT_TYPES = [
  { id: "All", label: "All Schedules" },
  { id: "full_time", label: "Full Time" },
  { id: "part_time", label: "Part Time" },
  { id: "contract", label: "Contract" },
  { id: "internship", label: "Internship" },
  { id: "fellowship", label: "Fellowship" },
];

export function JobFilters({
  opportunityType,
  onSelectOpportunityType,
  profession,
  onSelectProfession,
  specialization,
  onSelectSpecialization,
  workMode,
  onSelectWorkMode,
  employmentType,
  onSelectEmploymentType,
  verifiedOnly,
  onToggleVerifiedOnly,
  onReset,
}: JobFiltersProps) {
  return (
    <div className="space-y-4 rounded-3xl border border-[#ded8d1] bg-white p-5 shadow-2xs">
      {/* 1. Opportunity Type Pills */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#77716b]">
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#1769c2]" /> Opportunity Category
          </label>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1769c2] hover:underline"
          >
            <RotateCcw className="h-3 w-3" /> Reset Filters
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {OPPORTUNITY_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelectOpportunityType(t.id)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                opportunityType === t.id
                  ? "bg-[#1769c2] text-white shadow-2xs"
                  : "border border-[#ded8d1] bg-[#faf9f8] text-[#5d5854] hover:bg-[#eef5fc] hover:text-[#1769c2]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Selectors Grid */}
      <div className="grid grid-cols-1 gap-3 border-t border-[#f5f4f3] pt-3 sm:grid-cols-2 lg:grid-cols-5">
        {/* Profession Filter */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-[#77716b] mb-1">
            Profession
          </label>
          <select
            value={profession}
            onChange={(e) => onSelectProfession(e.target.value)}
            className="h-9 w-full rounded-xl border border-[#ded8d1] bg-white px-2.5 text-xs text-[#171717] focus:border-[#1769c2] focus:outline-none"
          >
            {PROFESSIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Specialization Filter */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-[#77716b] mb-1">
            Specialization
          </label>
          <select
            value={specialization}
            onChange={(e) => onSelectSpecialization(e.target.value)}
            className="h-9 w-full rounded-xl border border-[#ded8d1] bg-white px-2.5 text-xs text-[#171717] focus:border-[#1769c2] focus:outline-none"
          >
            {SPECIALIZATIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Work Mode Filter */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-[#77716b] mb-1">
            Work Mode
          </label>
          <select
            value={workMode}
            onChange={(e) => onSelectWorkMode(e.target.value)}
            className="h-9 w-full rounded-xl border border-[#ded8d1] bg-white px-2.5 text-xs text-[#171717] focus:border-[#1769c2] focus:outline-none"
          >
            {WORK_MODES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Employment Type Filter */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-[#77716b] mb-1">
            Schedule
          </label>
          <select
            value={employmentType}
            onChange={(e) => onSelectEmploymentType(e.target.value)}
            className="h-9 w-full rounded-xl border border-[#ded8d1] bg-white px-2.5 text-xs text-[#171717] focus:border-[#1769c2] focus:outline-none"
          >
            {EMPLOYMENT_TYPES.map((e) => (
              <option key={e.id} value={e.id}>
                {e.label}
              </option>
            ))}
          </select>
        </div>

        {/* Verified Employer Only Toggle */}
        <div className="flex items-end">
          <button
            type="button"
            onClick={onToggleVerifiedOnly}
            className={`flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition ${
              verifiedOnly
                ? "border-[#15803d] bg-[#f0fdf4] text-[#15803d]"
                : "border-[#ded8d1] bg-white text-[#5d5854] hover:bg-[#faf9f8]"
            }`}
          >
            {verifiedOnly ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-[#15803d]" />
            ) : (
              <Circle className="h-3.5 w-3.5 text-[#77716b]" />
            )}
            <span className="truncate">Verified Employers</span>
          </button>
        </div>
      </div>
    </div>
  );
}
