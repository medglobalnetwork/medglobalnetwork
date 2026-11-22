"use client";

import * as React from "react";
import {
  Tag,
  Layers,
  Activity,
  Smile,
  FlaskConical,
  RotateCcw,
  Bone,
  HeartPulse,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Store,
} from "lucide-react";
import { EXPLORE_DEPARTMENTS } from "../data";
import { EquipmentCategorySlug, ExploreDepartment } from "../types";

export interface MarketplaceDepartmentRailProps {
  activeCategory: EquipmentCategorySlug;
  onSelectCategory: (cat: EquipmentCategorySlug) => void;
  onSupplierJoin?: () => void;
  onOpenSupplierJoin?: () => void;
}

const DEPT_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Tag,
  Layers,
  Activity,
  Smile,
  FlaskConical,
  RotateCcw,
  Bone,
  HeartPulse,
};

export function MarketplaceDepartmentRail({
  activeCategory,
  onSelectCategory,
  onSupplierJoin,
  onOpenSupplierJoin,
}: MarketplaceDepartmentRailProps) {
  const handleSupplierClick = onSupplierJoin || onOpenSupplierJoin || (() => {});
  return (
    <aside
      aria-label="Department Hierarchy Navigation"
      className="rounded-2xl border border-[#e8e6e3] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-4 shadow-2xs space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#e8e6e3] dark:border-[#30363d]">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-md bg-[#0f4c81]/10 dark:bg-[#388bfd]/20 text-[#0f4c81] dark:text-[#388bfd]">
            <Sparkles className="size-3.5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0f4c81] dark:text-[#388bfd]">
            EXPLORE DEPARTMENTS
          </span>
        </div>
        <span className="text-[10px] font-semibold text-[#77716b] dark:text-[#8b949e]">
          {EXPLORE_DEPARTMENTS.length} Sectors
        </span>
      </div>

      {/* Department Navigation List */}
      <nav className="space-y-1">
        {EXPLORE_DEPARTMENTS.map((dept) => {
          const Icon = DEPT_ICON_MAP[dept.iconName] || Activity;
          const isActive = activeCategory === dept.categorySlug;

          return (
            <button
              key={dept.id}
              type="button"
              onClick={() => onSelectCategory(dept.categorySlug)}
              className={`w-full group flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs transition active:scale-98 ${
                isActive
                  ? "bg-[#eef5fc] dark:bg-[#0f4c81]/25 text-[#0f4c81] dark:text-[#388bfd] font-bold border border-[#0f4c81]/25"
                  : "text-[#171717] dark:text-[#f0f6fc] hover:bg-[#faf9f8] dark:hover:bg-[#21262d] border border-transparent font-medium"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`flex size-7 shrink-0 items-center justify-center rounded-lg transition ${
                    isActive
                      ? "bg-[#0f4c81] text-white dark:bg-[#388bfd]"
                      : "bg-[#faf9f8] dark:bg-[#21262d] text-[#5d5854] dark:text-[#8b949e] group-hover:text-[#0f4c81] dark:group-hover:text-[#388bfd]"
                  }`}
                >
                  <Icon className="size-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate">{dept.shortName}</span>
                    {dept.highlightBadge && (
                      <span className="shrink-0 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-1.5 py-0.2 text-[9px] font-bold">
                        {dept.highlightBadge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#77716b] dark:text-[#8b949e] truncate max-w-[140px]">
                    {dept.itemCount}+ items
                  </p>
                </div>
              </div>

              <ChevronRight
                className={`size-3.5 shrink-0 transition ${
                  isActive
                    ? "text-[#0f4c81] dark:text-[#388bfd] translate-x-0.5"
                    : "text-[#77716b] opacity-0 group-hover:opacity-100"
                }`}
              />
            </button>
          );
        })}
      </nav>

      {/* Quick Explore Separator */}
      <div className="h-px bg-[#e8e6e3] dark:bg-[#30363d]" />

      {/* Become a Supplier / Vendor Onboarding Card */}
      <div className="rounded-xl border border-dashed border-[#0f4c81]/30 dark:border-[#388bfd]/30 bg-[#faf9f8] dark:bg-[#21262d]/50 p-3 text-center space-y-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-[#0f4c81]/10 dark:bg-[#388bfd]/20 text-[#0f4c81] dark:text-[#388bfd] mx-auto">
          <Store className="size-4" />
        </div>
        <div>
          <p className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc]">
            Sell on MedGlobalNetwork
          </p>
          <p className="text-[10px] text-[#77716b] dark:text-[#8b949e]">
            Connect with 4,500+ institutional hospitals nationwide
          </p>
        </div>
        <button
          type="button"
          onClick={handleSupplierClick}
          className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0f4c81] dark:bg-[#388bfd] text-white py-1.5 px-2 text-[11px] font-bold hover:bg-[#0c3c66] transition"
        >
          <span>Become a Supplier</span>
          <ExternalLink className="size-3" />
        </button>
      </div>
    </aside>
  );
}
