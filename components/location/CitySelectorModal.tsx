"use client";

// ============================================================
// MGN City Selector Modal
// components/location/CitySelectorModal.tsx
//
// Allows searching and selecting any city across India & world
// for manual location matching and suggestion filtering.
// ============================================================

import * as React from "react";
import { X, Search, MapPin, Check } from "lucide-react";
import { MAJOR_CITIES, CityLocation } from "@/lib/geo";

interface CitySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCity?: string;
  onSelectCity: (city: CityLocation) => void;
}

export function CitySelectorModal({
  isOpen,
  onClose,
  currentCity,
  onSelectCity,
}: CitySelectorModalProps) {
  const [search, setSearch] = React.useState("");

  if (!isOpen) return null;

  const popularCities = MAJOR_CITIES.filter((c) => c.popular);
  const filteredCities = search.trim()
    ? MAJOR_CITIES.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.state.toLowerCase().includes(search.toLowerCase())
      )
    : popularCities;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-2xl bg-white dark:bg-[#161b22] border border-[#ded8d1] dark:border-[#30363d] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ded8d1] dark:border-[#30363d] px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[#0f4c81]/10 text-[#0f4c81] dark:bg-[#0f4c81]/25 dark:text-blue-400">
              <MapPin className="size-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#171717] dark:text-[#f0f6fc]">
                Select Your City
              </h3>
              <p className="text-[11px] text-[#77716b] dark:text-[#8b949e]">
                Suggestions and nearby updates will personalize to this location
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#77716b] hover:bg-[#f2efe9] dark:hover:bg-[#21262d] transition"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-4 border-b border-[#ded8d1] dark:border-[#30363d]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#77716b]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by city or state (e.g. Mumbai, Pune, Lucknow)..."
              autoFocus
              className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] py-2.5 pl-9 pr-3 text-xs text-[#171717] dark:text-[#f0f6fc] placeholder-[#77716b] focus:border-[#0f4c81] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
            />
          </div>
        </div>

        {/* City list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {!search.trim() && (
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#77716b] dark:text-[#8b949e]">
              Major Healthcare Hubs
            </div>
          )}

          {filteredCities.map((city) => {
            const isSelected =
              currentCity &&
              currentCity.trim().toLowerCase() === city.name.toLowerCase();

            return (
              <button
                key={`${city.name}-${city.state}`}
                type="button"
                onClick={() => {
                  onSelectCity(city);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition ${
                  isSelected
                    ? "bg-[#0f4c81]/10 text-[#0f4c81] dark:bg-[#0f4c81]/25 dark:text-blue-400 font-semibold"
                    : "hover:bg-[#f8f7f6] dark:hover:bg-[#21262d] text-[#171717] dark:text-[#f0f6fc]"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <MapPin className={`size-3.5 shrink-0 ${isSelected ? "text-[#0f4c81] dark:text-blue-400" : "text-[#77716b]"}`} />
                  <div className="truncate">
                    <span className="text-xs font-semibold">{city.name}</span>
                    <span className="text-[11px] text-[#77716b] dark:text-[#8b949e] ml-1.5">
                      · {city.state}
                    </span>
                  </div>
                </div>
                {isSelected && <Check className="size-4 text-[#0f4c81] dark:text-blue-400 shrink-0" />}
              </button>
            );
          })}

          {filteredCities.length === 0 && (
            <div className="py-8 text-center text-xs text-[#77716b]">
              No cities found matching &quot;{search}&quot;.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#ded8d1] dark:border-[#30363d] px-4 py-3 bg-[#faf9f8] dark:bg-[#0d1117] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#21262d] px-4 py-1.5 text-xs font-semibold text-[#171717] dark:text-[#f0f6fc] hover:bg-[#f2efe9]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

