"use client";

import * as React from "react";

interface LearnFiltersProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedProfession: string;
  onSelectProfession: (prof: string) => void;
  selectedLevel: string;
  onSelectLevel: (lvl: string) => void;
  isFreeOnly: boolean;
  onToggleFreeOnly: () => void;
}

const CATEGORIES = [
  "All",
  "Physiotherapy",
  "Medicine",
  "Cardiology",
  "Orthopedics",
  "Neurology",
  "Pediatrics",
  "Clinical Research",
  "Nursing",
];

const PROFESSIONS = [
  "All",
  "Physiotherapist",
  "Doctor / Physician",
  "Surgeon",
  "Nurse",
  "Researcher",
  "Dentist",
  "Pharmacist",
];

const LEVELS = [
  { id: "all_levels", label: "All Levels" },
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

export function LearnFilters({
  selectedCategory,
  onSelectCategory,
  selectedProfession,
  onSelectProfession,
  selectedLevel,
  onSelectLevel,
  isFreeOnly,
  onToggleFreeOnly,
}: LearnFiltersProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-[#ded8d1] bg-white p-4 shadow-2xs">
      {/* 1. Category Pills */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#77716b] mb-2">
          Clinical Domain
        </label>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                selectedCategory === cat
                  ? "bg-[#1769c2] text-white shadow-2xs"
                  : "border border-[#ded8d1] bg-[#faf9f8] text-[#5d5854] hover:bg-[#eef5fc] hover:text-[#1769c2]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Profession & Level Selectors */}
      <div className="grid grid-cols-1 gap-3 border-t border-[#f5f4f3] pt-3 sm:grid-cols-3">
        {/* Profession Filter */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-[#77716b] mb-1">
            Target Profession
          </label>
          <select
            value={selectedProfession}
            onChange={(e) => onSelectProfession(e.target.value)}
            className="w-full rounded-xl border border-[#ded8d1] bg-white px-3 py-1.5 text-xs text-[#171717] focus:outline-none"
          >
            {PROFESSIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Level Filter */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-[#77716b] mb-1">
            Complexity Level
          </label>
          <select
            value={selectedLevel}
            onChange={(e) => onSelectLevel(e.target.value)}
            className="w-full rounded-xl border border-[#ded8d1] bg-white px-3 py-1.5 text-xs text-[#171717] focus:outline-none"
          >
            {LEVELS.map((lvl) => (
              <option key={lvl.id} value={lvl.id}>
                {lvl.label}
              </option>
            ))}
          </select>
        </div>

        {/* Free Only Toggle */}
        <div className="flex items-end">
          <button
            type="button"
            onClick={onToggleFreeOnly}
            className={`flex w-full items-center justify-center gap-2 rounded-xl border py-1.5 text-xs font-semibold transition ${
              isFreeOnly
                ? "border-[#15803d] bg-[#f0fdf4] text-[#15803d]"
                : "border-[#ded8d1] bg-white text-[#5d5854] hover:bg-[#faf9f8]"
            }`}
          >
            <span>{isFreeOnly ? "✓" : "○"}</span>
            <span>Free CME Only</span>
          </button>
        </div>
      </div>
    </div>
  );
}
