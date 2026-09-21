"use client";

import * as React from "react";
import { Search, ShieldCheck, Check, Filter } from "lucide-react";
import { PROFESSIONS } from "../types";
import type { NetworkFilters as FiltersType } from "../types";

interface NetworkFiltersProps {
  filters: FiltersType;
  onChange: (filters: FiltersType) => void;
  onReset: () => void;
}

const EXPERIENCE_LEVELS = [
  { id: "student", label: "Student", min: 0, max: 0, isStudent: true },
  { id: "0-2", label: "0 - 2 years", min: 0, max: 2 },
  { id: "3-5", label: "3 - 5 years", min: 3, max: 5 },
  { id: "6-10", label: "6 - 10 years", min: 6, max: 10 },
  { id: "10+", label: "10+ years", min: 10, max: 99 },
];

const COMMON_ORGANIZATIONS = [
  "AIIMS New Delhi",
  "Fortis Healthcare",
  "Apollo Hospitals",
  "Max Healthcare",
  "Manipal Hospitals",
  "Medanta - The Medicity",
  "Narayana Health",
  "Tata Memorial Hospital",
  "Christian Medical College",
  "King Edward Memorial Hospital",
];

const SPECIALIZATIONS: Record<string, string[]> = {
  Doctor: [
    "Cardiology",
    "Neurology",
    "Orthopaedics",
    "Pediatrics",
    "Oncology",
    "Dermatology",
    "Radiology",
    "General Medicine",
    "Emergency Medicine",
    "Anaesthesia",
    "Psychiatry",
    "Ophthalmology",
    "ENT",
    "Gynaecology",
    "Urology",
    "Gastroenterology",
    "Pulmonology",
  ],
  Physiotherapist: [
    "Sports Rehabilitation",
    "Neuro Physiotherapy",
    "Musculoskeletal Rehab",
    "Cardiopulmonary Physio",
    "Paediatric Physio",
    "Geriatric Rehab",
    "Occupational Health",
    "Manual Therapy",
    "Orthopedic Rehab",
  ],
  Nurse: [
    "Critical Care (ICU)",
    "Oncology Nursing",
    "Pediatric Nursing",
    "Surgical Nursing",
    "Community Nursing",
    "Neonatology (NICU)",
    "Emergency Nursing",
  ],
  Pharmacist: [
    "Clinical Pharmacy",
    "Hospital Pharmacy",
    "Community Pharmacy",
    "Oncology Pharmacy",
    "Regulatory Affairs",
    "Pharmacovigilance",
  ],
  "Lab Technician": [
    "Clinical Pathology",
    "Microbiology",
    "Hematology",
    "Biochemistry",
    "Histopathology",
  ],
  Radiographer: [
    "MRI / CT Scan",
    "Interventional Radiology",
    "Ultrasound & Sonography",
    "Diagnostic X-Ray",
  ],
};

export function NetworkFilters({ filters, onChange, onReset }: NetworkFiltersProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Local draft state for filters
  const [localFilters, setLocalFilters] = React.useState<FiltersType>(filters);

  // Keep local filters in sync with parent if parent resets
  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const availableSpecs = localFilters.profession
    ? SPECIALIZATIONS[localFilters.profession] ?? []
    : Array.from(new Set(Object.values(SPECIALIZATIONS).flat())).slice(0, 16);

  const hasActiveFilters =
    !!localFilters.profession ||
    !!localFilters.specialization ||
    !!localFilters.city ||
    !!localFilters.organization ||
    !!localFilters.query ||
    localFilters.experience_min !== undefined ||
    localFilters.verified_only;

  const handleApply = () => {
    onChange(localFilters);
    if (mobileOpen) setMobileOpen(false);
  };

  const handleReset = () => {
    setLocalFilters({});
    onReset();
    if (mobileOpen) setMobileOpen(false);
  };

  const handleExperienceToggle = (opt: typeof EXPERIENCE_LEVELS[number]) => {
    const isSelected =
      localFilters.experience_min === opt.min &&
      localFilters.experience_max === opt.max;

    const next = {
      ...localFilters,
      experience_min: isSelected ? undefined : opt.min,
      experience_max: isSelected ? undefined : opt.max,
    };
    setLocalFilters(next);
    onChange(next);
  };

  const FilterBody = () => (
    <div className="space-y-4">
      {/* Header with Reset */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#171717]">Filters</h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold text-[#1769c2] transition hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      {/* Search Input inside Filter */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8a8784]" />
        <input
          type="search"
          value={localFilters.query ?? ""}
          onChange={(e) => {
            const next = { ...localFilters, query: e.target.value || undefined };
            setLocalFilters(next);
            onChange(next);
          }}
          placeholder="Search by name, hospital, skill..."
          className="h-9 w-full rounded-xl border border-[#ded8d1] bg-white pl-8 pr-3 text-xs text-[#171717] placeholder:text-[#8a8784] focus:border-[#1769c2] focus:outline-none focus:ring-1 focus:ring-[#1769c2]"
        />
      </div>

      {/* Verified professionals checkbox */}
      <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[#f0efee] bg-[#faf9f8] p-2.5 transition hover:bg-[#f4f3f0]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#1769c2] fill-[#1769c2]/10" />
          <span className="text-xs font-semibold text-[#171717]">
            Verified professionals
          </span>
        </div>
        <div
          role="checkbox"
          aria-checked={localFilters.verified_only}
          onClick={(e) => {
            e.stopPropagation();
            const next = {
              ...localFilters,
              verified_only: !localFilters.verified_only,
            };
            setLocalFilters(next);
            onChange(next);
          }}
          className={`flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded border transition ${
            localFilters.verified_only
              ? "border-[#1769c2] bg-[#1769c2] text-white"
              : "border-[#ded8d1] bg-white"
          }`}
        >
          {localFilters.verified_only && <Check className="h-3 w-3 stroke-[3]" />}
        </div>
      </label>

      {/* Profession */}
      <div>
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#77716b]">
          Profession
        </label>
        <select
          value={localFilters.profession ?? ""}
          onChange={(e) => {
            const val = e.target.value || undefined;
            const next = {
              ...localFilters,
              profession: val,
              specialization: undefined,
            };
            setLocalFilters(next);
            onChange(next);
          }}
          className="w-full rounded-xl border border-[#ded8d1] bg-white px-3 py-2 text-xs text-[#171717] focus:border-[#1769c2] focus:outline-none focus:ring-1 focus:ring-[#1769c2]"
        >
          <option value="">All professions</option>
          {PROFESSIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Specialization */}
      <div>
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#77716b]">
          Specialization
        </label>
        <select
          value={localFilters.specialization ?? ""}
          onChange={(e) => {
            const next = {
              ...localFilters,
              specialization: e.target.value || undefined,
            };
            setLocalFilters(next);
            onChange(next);
          }}
          className="w-full rounded-xl border border-[#ded8d1] bg-white px-3 py-2 text-xs text-[#171717] focus:border-[#1769c2] focus:outline-none focus:ring-1 focus:ring-[#1769c2]"
        >
          <option value="">Select specialization</option>
          {availableSpecs.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Organization */}
      <div>
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#77716b]">
          Organization / Hospital
        </label>
        <select
          value={localFilters.organization ?? ""}
          onChange={(e) => {
            const next = {
              ...localFilters,
              organization: e.target.value || undefined,
            };
            setLocalFilters(next);
            onChange(next);
          }}
          className="w-full rounded-xl border border-[#ded8d1] bg-white px-3 py-2 text-xs text-[#171717] focus:border-[#1769c2] focus:outline-none focus:ring-1 focus:ring-[#1769c2]"
        >
          <option value="">Select organization</option>
          {COMMON_ORGANIZATIONS.map((org) => (
            <option key={org} value={org}>
              {org}
            </option>
          ))}
        </select>
      </div>

      {/* Experience Level */}
      <div>
        <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-[#77716b]">
          Experience Level
        </label>
        <div className="space-y-2">
          {EXPERIENCE_LEVELS.map((opt) => {
            const isChecked =
              localFilters.experience_min === opt.min &&
              localFilters.experience_max === opt.max;
            return (
              <label
                key={opt.id}
                onClick={() => handleExperienceToggle(opt)}
                className="flex cursor-pointer items-center gap-2.5 select-none"
              >
                <div
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                    isChecked
                      ? "border-[#1769c2] bg-[#1769c2] text-white"
                      : "border-[#ded8d1] bg-white hover:border-[#1769c2]"
                  }`}
                >
                  {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
                <span className="text-xs text-[#5d5854] hover:text-[#171717]">
                  {opt.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Apply Filters Button */}
      <button
        type="button"
        onClick={handleApply}
        className="w-full rounded-xl bg-[#1769c2] py-2.5 text-center text-xs font-semibold text-white shadow-xs transition hover:bg-[#12569f]"
      >
        Apply Filters
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Trigger Button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="flex items-center gap-1.5 rounded-xl border border-[#ded8d1] bg-white px-3.5 py-2 text-xs font-semibold text-[#5d5854] shadow-xs lg:hidden"
      >
        <Filter className="h-3.5 w-3.5 text-[#1769c2]" />
        Filters
        {hasActiveFilters && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#1769c2] text-[9px] font-bold text-white">
            !
          </span>
        )}
      </button>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex items-end lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative max-h-[85vh] w-full overflow-y-auto rounded-t-2xl border-t border-[#e8e6e3] bg-white p-5 shadow-2xl">
            <FilterBody />
          </div>
        </div>
      )}

      {/* Desktop Card */}
      <div className="hidden lg:block rounded-2xl border border-[#e8e6e3] bg-white p-4 shadow-xs">
        <FilterBody />
      </div>
    </>
  );
}
