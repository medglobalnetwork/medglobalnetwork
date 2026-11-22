"use client";

import * as React from "react";
import {
  LayoutGrid,
  Activity,
  Scan,
  Scissors,
  BedDouble,
  HeartPulse,
  FlaskConical,
  Accessibility,
  ShieldCheck,
  ChevronRight,
  Layers,
  Smile,
  RotateCcw,
  Bone,
  Tag,
} from "lucide-react";
import { EQUIPMENT_CATEGORIES } from "../data";
import { EquipmentCategorySlug } from "../types";

interface MarketplaceCategoryBarProps {
  activeCategory: EquipmentCategorySlug;
  activeSubcategory: string;
  onSelectCategory: (categoryId: EquipmentCategorySlug) => void;
  onSelectSubcategory: (subcategory: string) => void;
}

const CATEGORY_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutGrid,
  Activity,
  Scan,
  Scissors,
  BedDouble,
  HeartPulse,
  FlaskConical,
  Accessibility,
  ShieldCheck,
  Layers,
  Smile,
  RotateCcw,
  Bone,
  Tag,
};

export function MarketplaceCategoryBar({
  activeCategory,
  activeSubcategory,
  onSelectCategory,
  onSelectSubcategory,
}: MarketplaceCategoryBarProps) {
  const selectedCatObj = EQUIPMENT_CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <div className="space-y-3">
      {/* Scrollable Category Cards Bar */}
      <div
        role="tablist"
        aria-label="Medical Equipment & Supplies Categories"
        className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none scroll-smooth"
      >
        {EQUIPMENT_CATEGORIES.map((cat) => {
          const Icon = CATEGORY_ICON_MAP[cat.iconName] || LayoutGrid;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => {
                onSelectCategory(cat.id);
                onSelectSubcategory("");
              }}
              className={`group shrink-0 flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-xs font-semibold transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] ${
                isActive
                  ? "border-[#0f4c81] bg-[#eef5fc] text-[#0f4c81] dark:border-[#388bfd] dark:bg-[#0f4c81]/25 dark:text-[#388bfd] shadow-2xs font-bold"
                  : "border-[#e8e6e3] dark:border-[#30363d] bg-white dark:bg-[#161b22] text-[#5d5854] dark:text-[#8b949e] hover:border-[#ded8d1] dark:hover:border-[#484f58] hover:text-[#171717] dark:hover:text-[#f0f6fc]"
              }`}
            >
              <div
                className={`flex size-7 items-center justify-center rounded-lg transition ${
                  isActive
                    ? "bg-[#0f4c81] text-white dark:bg-[#388bfd]"
                    : "bg-[#faf9f8] dark:bg-[#21262d] text-[#77716b] dark:text-[#8b949e] group-hover:text-[#0f4c81] dark:group-hover:text-[#388bfd]"
                }`}
              >
                <Icon className="size-4" />
              </div>
              <div className="flex flex-col">
                <span className="whitespace-nowrap">{cat.shortName}</span>
                <span className="text-[10px] text-[#9c958f] dark:text-[#6e7681]">
                  {cat.itemCount} items
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Subcategory Filter Pills */}
      {selectedCatObj && selectedCatObj.popularSubcategories.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-semibold text-[#77716b] dark:text-[#8b949e] flex items-center gap-1 mr-1">
            <span>Subcategories:</span>
            <ChevronRight className="size-3" />
          </span>

          <button
            type="button"
            onClick={() => onSelectSubcategory("")}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
              !activeSubcategory
                ? "bg-[#0f4c81] text-white dark:bg-[#388bfd] shadow-2xs font-semibold"
                : "bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] text-[#5d5854] dark:text-[#8b949e] hover:border-[#ded8d1] dark:hover:border-[#484f58]"
            }`}
          >
            All Subcategories
          </button>

          {selectedCatObj.popularSubcategories.map((subcat) => {
            const isSubActive = activeSubcategory === subcat;
            return (
              <button
                key={subcat}
                type="button"
                onClick={() => onSelectSubcategory(isSubActive ? "" : subcat)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  isSubActive
                    ? "bg-[#0f4c81] text-white dark:bg-[#388bfd] shadow-2xs font-semibold"
                    : "bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] text-[#5d5854] dark:text-[#8b949e] hover:border-[#ded8d1] dark:hover:border-[#484f58]"
                }`}
              >
                {subcat}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
