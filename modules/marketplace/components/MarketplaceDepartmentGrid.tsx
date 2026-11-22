"use client";

import * as React from "react";
import {
  Layers,
  Activity,
  Smile,
  FlaskConical,
  RotateCcw,
  Bone,
  Scissors,
  BedDouble,
  Scan,
  Tag,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { EXPLORE_DEPARTMENTS } from "../data";
import { EquipmentCategorySlug } from "../types";

interface MarketplaceDepartmentGridProps {
  activeCategory: EquipmentCategorySlug;
  onSelectCategory: (category: EquipmentCategorySlug) => void;
}

const DEPT_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Layers,
  Activity,
  Smile,
  FlaskConical,
  RotateCcw,
  Bone,
  Scissors,
  BedDouble,
  Scan,
  Tag,
};

export function MarketplaceDepartmentGrid({
  activeCategory,
  onSelectCategory,
}: MarketplaceDepartmentGridProps) {
  return (
    <section aria-label="Explore Medical Departments" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e8e6e3] dark:border-[#30363d] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#171717] dark:text-[#f0f6fc]">
              Shop by Medical Department
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-[#0f4c81]/10 dark:bg-[#388bfd]/20 px-2.5 py-0.5 text-[11px] font-bold text-[#0f4c81] dark:text-[#388bfd]">
              10 Specialized Zones
            </span>
          </div>
          <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
            Procure directly from specialized medical manufacturers and certified distributors
          </p>
        </div>

        {activeCategory !== "all" && (
          <button
            type="button"
            onClick={() => onSelectCategory("all")}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#0f4c81] dark:text-[#388bfd] hover:underline"
          >
            <span>Show All Departments</span>
            <ChevronRight className="size-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {EXPLORE_DEPARTMENTS.slice(0, 8).map((dept) => {
          const Icon = DEPT_ICON_MAP[dept.iconName] || Activity;
          const isSelected = activeCategory === dept.categorySlug;

          return (
            <button
              key={dept.id}
              type="button"
              onClick={() => onSelectCategory(dept.categorySlug)}
              className={`group flex flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] ${
                isSelected
                  ? "border-[#0f4c81] bg-[#eef5fc] dark:border-[#388bfd] dark:bg-[#0f4c81]/20 ring-1 ring-[#0f4c81] shadow-xs"
                  : "border-[#e8e6e3] dark:border-[#30363d] bg-white dark:bg-[#161b22] hover:border-[#0f4c81]/50 dark:hover:border-[#388bfd]/50 hover:shadow-xs hover:bg-[#faf9f8] dark:hover:bg-[#1c2128]"
              }`}
            >
              <div className="space-y-3 w-full">
                {dept.imageUrl && (
                  <div className="relative h-24 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-[#21262d] mb-1">
                    <img
                      src={dept.imageUrl}
                      alt={dept.name}
                      loading="lazy"
                      className="size-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div
                    className={`flex size-10 items-center justify-center rounded-xl transition ${
                      isSelected
                        ? "bg-[#0f4c81] text-white dark:bg-[#388bfd]"
                        : "bg-[#eef5fc] text-[#0f4c81] dark:bg-[#21262d] dark:text-[#388bfd] group-hover:bg-[#0f4c81] group-hover:text-white"
                    }`}
                  >
                    <Icon className="size-5" />
                  </div>

                  {dept.highlightBadge && (
                    <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                      {dept.highlightBadge}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc] group-hover:text-[#0f4c81] dark:group-hover:text-[#388bfd] transition">
                    {dept.name}
                  </h3>
                  <p className="mt-1 text-xs text-[#77716b] dark:text-[#8b949e] line-clamp-2 leading-relaxed">
                    {dept.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#f0ede8] dark:border-[#21262d] pt-3 text-[11px] w-full">
                <span className="font-semibold text-[#5d5854] dark:text-[#8b949e]">
                  {dept.itemCount}+ Items
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-[#0f4c81] dark:text-[#388bfd] group-hover:translate-x-0.5 transition-transform">
                  <span>Browse</span>
                  <ArrowRight className="size-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
