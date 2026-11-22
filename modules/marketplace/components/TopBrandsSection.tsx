"use client";

import * as React from "react";
import { Award, ChevronRight, X, Sparkles, Building } from "lucide-react";
import { TOP_BRANDS } from "../data";
import { TopBrand } from "../types";

interface TopBrandsSectionProps {
  selectedBrand?: string;
  onSelectBrand: (brandName: string) => void;
  onClearBrand: () => void;
}

export function TopBrandsSection({
  selectedBrand,
  onSelectBrand,
  onClearBrand,
}: TopBrandsSectionProps) {
  return (
    <section
      aria-labelledby="top-brands-title"
      className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-4 sm:p-5 shadow-2xs space-y-3.5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-[#0f4c81]/10 dark:bg-[#388bfd]/20 text-[#0f4c81] dark:text-[#388bfd]">
            <Award className="size-4" />
          </div>
          <div>
            <h3 id="top-brands-title" className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">
              Top Medical Brands & Manufacturers
            </h3>
            <p className="text-[11px] text-[#77716b] dark:text-[#8b949e]">
              Direct OEM verified clinical equipment and diagnostic supply partners
            </p>
          </div>
        </div>

        {selectedBrand && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#77716b] dark:text-[#8b949e]">Filtered by:</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#0f4c81] dark:bg-[#388bfd] text-white px-2.5 py-0.5 text-xs font-bold shadow-xs">
              <span>{selectedBrand}</span>
              <button
                type="button"
                onClick={onClearBrand}
                aria-label="Clear brand filter"
                className="hover:opacity-80"
              >
                <X className="size-3" />
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Brand Grid / Horizontal Scroll */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {TOP_BRANDS.map((brand) => {
          const isSelected = selectedBrand?.toLowerCase() === brand.name.toLowerCase();

          return (
            <button
              key={brand.id}
              type="button"
              onClick={() => {
                if (isSelected) {
                  onClearBrand();
                } else {
                  onSelectBrand(brand.name);
                }
              }}
              className={`group flex flex-col justify-between rounded-xl border p-3 text-left transition active:scale-98 ${
                isSelected
                  ? "border-[#0f4c81] bg-[#eef5fc] dark:border-[#388bfd] dark:bg-[#0f4c81]/25 ring-2 ring-[#0f4c81]/20"
                  : "border-[#e8e6e3] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] hover:border-[#ded8d1] dark:hover:border-[#484f58] hover:bg-white dark:hover:bg-[#161b22]"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-mono font-semibold text-[#77716b] dark:text-[#8b949e]">
                    {brand.country}
                  </span>
                  {brand.badge && (
                    <span className="text-[9px] font-bold text-[#0f4c81] dark:text-[#388bfd]">
                      {brand.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc] group-hover:text-[#0f4c81] dark:group-hover:text-[#388bfd] truncate">
                  {brand.name}
                </p>
                <p className="text-[10px] text-[#77716b] dark:text-[#8b949e] line-clamp-1">
                  {brand.category}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-[#e8e6e3] dark:border-[#30363d] flex items-center justify-between text-[10px] text-[#77716b] dark:text-[#8b949e]">
                <span>{brand.productCount} models</span>
                <span className="text-[#0f4c81] dark:text-[#388bfd] font-semibold opacity-0 group-hover:opacity-100 transition">
                  Browse →
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
