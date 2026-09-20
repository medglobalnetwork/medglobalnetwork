"use client";

import * as React from "react";
import { PROFESSIONS } from "../types";
import type { NetworkFilters } from "../types";

interface NetworkFiltersProps {
  filters: NetworkFilters;
  onChange: (filters: NetworkFilters) => void;
  onReset: () => void;
}

const EXPERIENCE_OPTIONS = [
  { label: "Any experience", min: 0, max: 99 },
  { label: "0–2 yrs", min: 0, max: 2 },
  { label: "3–5 yrs", min: 3, max: 5 },
  { label: "6–10 yrs", min: 6, max: 10 },
  { label: "10+ yrs", min: 10, max: 99 },
];

const SPECIALIZATIONS: Record<string, string[]> = {
  Doctor: [
    "Cardiology", "Neurology", "Orthopaedics", "Pediatrics",
    "Oncology", "Dermatology", "Radiology", "General Medicine",
    "Emergency Medicine", "Anaesthesia", "Psychiatry", "Ophthalmology",
    "ENT", "Gynaecology", "Urology",
  ],
  Physiotherapist: [
    "Sports Rehabilitation", "Neuro Physiotherapy", "Musculoskeletal",
    "Cardiopulmonary", "Paediatric Physio", "Geriatric Physio",
    "Occupational Health", "Community Rehab",
  ],
  Nurse: [
    "Critical Care", "Oncology Nursing", "Pediatric Nursing",
    "Surgical Nursing", "Community Nursing", "Neonatology",
  ],
  Pharmacist: [
    "Clinical Pharmacy", "Hospital Pharmacy", "Community Pharmacy",
    "Oncology Pharmacy", "Regulatory Affairs",
  ],
};

export function NetworkFilters({ filters, onChange, onReset }: NetworkFiltersProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const availableSpecs = filters.profession
    ? (SPECIALIZATIONS[filters.profession] ?? [])
    : [];

  const hasActiveFilters =
    !!filters.profession ||
    !!filters.specialization ||
    !!filters.city ||
    !!filters.organization ||
    filters.experience_min !== undefined ||
    filters.verified_only;

  const FilterContent = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#171717]">Filters</h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-[11px] font-medium text-[#1769c2] hover:underline"
          >
            Reset all
          </button>
        )}
      </div>

      {/* Verified only */}
      <label className="flex cursor-pointer items-center gap-2.5">
        <div
          role="checkbox"
          aria-checked={filters.verified_only}
          onClick={() =>
            onChange({ ...filters, verified_only: !filters.verified_only })
          }
          className={`relative flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md border transition ${
            filters.verified_only
              ? "border-[#1769c2] bg-[#1769c2]"
              : "border-[#ded8d1] bg-white"
          }`}
        >
          {filters.verified_only && (
            <svg
              className="h-3 w-3 fill-white"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
        <span className="text-xs font-medium text-[#171717]">Verified professionals only</span>
      </label>

      <hr className="border-[#f0efee]" />

      {/* Profession */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[#77716b] uppercase tracking-wide">
          Profession
        </label>
        <select
          value={filters.profession ?? ""}
          onChange={(e) =>
            onChange({
              ...filters,
              profession: e.target.value || undefined,
              specialization: undefined,
            })
          }
          className="block w-full rounded-xl border border-[#ded8d1] bg-white px-3 py-2 text-xs text-[#171717] focus:border-[#1769c2] focus:outline-none"
        >
          <option value="">All professions</option>
          {PROFESSIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Specialization (conditional) */}
      {availableSpecs.length > 0 && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[#77716b] uppercase tracking-wide">
            Specialization
          </label>
          <select
            value={filters.specialization ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                specialization: e.target.value || undefined,
              })
            }
            className="block w-full rounded-xl border border-[#ded8d1] bg-white px-3 py-2 text-xs text-[#171717] focus:border-[#1769c2] focus:outline-none"
          >
            <option value="">All specializations</option>
            {availableSpecs.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Organization / Hospital */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[#77716b] uppercase tracking-wide">
          Hospital / Organization
        </label>
        <input
          type="text"
          value={filters.organization ?? ""}
          onChange={(e) =>
            onChange({ ...filters, organization: e.target.value || undefined })
          }
          placeholder="e.g. AIIMS, Fortis"
          className="block w-full rounded-xl border border-[#ded8d1] bg-white px-3 py-2 text-xs text-[#171717] placeholder:text-[#8a8784] focus:border-[#1769c2] focus:outline-none"
        />
      </div>

      {/* City / Location */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[#77716b] uppercase tracking-wide">
          Location / City
        </label>
        <input
          type="text"
          value={filters.city ?? ""}
          onChange={(e) =>
            onChange({ ...filters, city: e.target.value || undefined })
          }
          placeholder="e.g. Mumbai, Raipur"
          className="block w-full rounded-xl border border-[#ded8d1] bg-white px-3 py-2 text-xs text-[#171717] placeholder:text-[#8a8784] focus:border-[#1769c2] focus:outline-none"
        />
      </div>

      {/* Experience */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[#77716b] uppercase tracking-wide">
          Experience
        </label>
        <div className="flex flex-wrap gap-1.5">
          {EXPERIENCE_OPTIONS.map((opt) => {
            const isActive =
              filters.experience_min === opt.min &&
              filters.experience_max === opt.max;
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() =>
                  onChange({
                    ...filters,
                    experience_min: opt.min === 0 && opt.max === 99 ? undefined : opt.min,
                    experience_max: opt.min === 0 && opt.max === 99 ? undefined : opt.max,
                  })
                }
                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                  isActive
                    ? "border-[#1769c2] bg-[#eef5fc] text-[#1769c2]"
                    : "border-[#ded8d1] bg-white text-[#5d5854] hover:border-[#1769c2] hover:text-[#1769c2]"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile filter toggle button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="flex lg:hidden items-center gap-1.5 rounded-xl border border-[#ded8d1] bg-white px-3 py-2 text-xs font-medium text-[#5d5854] shadow-xs"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="14" y2="12" />
          <line x1="4" y1="18" x2="10" y2="18" />
        </svg>
        Filters
        {hasActiveFilters && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#1769c2] text-[9px] font-bold text-white">
            !
          </span>
        )}
      </button>

      {/* Mobile filter drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex items-end lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-full rounded-t-2xl border-t border-[#e8e6e3] bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold">Filters</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="text-xs font-semibold text-[#1769c2]"
              >
                Done
              </button>
            </div>
            <FilterContent />
          </div>
        </div>
      )}

      {/* Desktop filter sidebar */}
      <div className="hidden lg:block">
        <div className="rounded-2xl border border-[#e8e6e3] bg-white p-4 shadow-xs">
          <FilterContent />
        </div>
      </div>
    </>
  );
}
