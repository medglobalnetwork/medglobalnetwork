"use client";

import * as React from "react";
import {
  RotateCcw,
  Check,
  ShieldCheck,
  BadgePercent,
  Truck,
  Building2,
  X,
  Filter,
  Award,
  Layers,
  Users,
} from "lucide-react";
import { PRICE_RANGES, TOP_BRANDS } from "../data";
import { EquipmentCertification, FilterState } from "../types";

interface MarketplaceFiltersProps {
  filters: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  onResetFilters: () => void;
  isMobileModal?: boolean;
  onCloseMobileModal?: () => void;
}

const CERTIFICATIONS_LIST: EquipmentCertification[] = [
  "CDSCO Approved",
  "CE Marked",
  "ISO 13485",
  "US FDA Cleared",
  "AERB Approved",
  "BIS Certified",
];

export function MarketplaceFilters({
  filters,
  onFilterChange,
  onResetFilters,
  isMobileModal = false,
  onCloseMobileModal,
}: MarketplaceFiltersProps) {
  const toggleCertification = (cert: EquipmentCertification) => {
    const current = [...filters.certifications];
    const index = current.indexOf(cert);
    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(cert);
    }
    onFilterChange({ certifications: current });
  };

  const content = (
    <div className="space-y-6 text-xs">
      {/* Header for Filter Block */}
      <div className="flex items-center justify-between pb-3 border-b border-[#e8e6e3] dark:border-[#30363d]">
        <div className="flex items-center gap-2 font-bold text-[#171717] dark:text-[#f0f6fc]">
          <Filter className="size-4 text-[#0f4c81] dark:text-[#388bfd]" />
          <span>Filter Catalog</span>
        </div>
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0f4c81] dark:text-[#388bfd] hover:underline"
        >
          <RotateCcw className="size-3" />
          <span>Reset All</span>
        </button>
      </div>

      {/* Trust & Availability Toggles */}
      <fieldset className="space-y-2.5">
        <legend className="text-[11px] font-bold uppercase tracking-wider text-[#77716b] dark:text-[#8b949e]">
          Verification & Availability
        </legend>

        {/* Verified Supplier Only */}
        <label className="flex items-center justify-between p-2 rounded-xl border border-[#e8e6e3] dark:border-[#30363d] bg-white dark:bg-[#161b22] hover:bg-[#faf9f8] dark:hover:bg-[#21262d] cursor-pointer transition">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-[#16804d] dark:text-[#2ea043]" />
            <span className="font-semibold text-[#171717] dark:text-[#f0f6fc]">Verified Suppliers Only</span>
          </div>
          <input
            type="checkbox"
            checked={filters.verifiedSupplierOnly}
            onChange={(e) => onFilterChange({ verifiedSupplierOnly: e.target.checked })}
            className="size-4 rounded text-[#0f4c81] accent-[#0f4c81] focus-visible:ring-2 focus-visible:ring-[#0f4c81]"
          />
        </label>

        {/* Ready to Ship / In Stock */}
        <label className="flex items-center justify-between p-2 rounded-xl border border-[#e8e6e3] dark:border-[#30363d] bg-white dark:bg-[#161b22] hover:bg-[#faf9f8] dark:hover:bg-[#21262d] cursor-pointer transition">
          <div className="flex items-center gap-2">
            <Truck className="size-4 text-[#0f4c81] dark:text-[#388bfd]" />
            <span className="font-semibold text-[#171717] dark:text-[#f0f6fc]">In Stock (Ready to Ship)</span>
          </div>
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => onFilterChange({ inStockOnly: e.target.checked })}
            className="size-4 rounded text-[#0f4c81] accent-[#0f4c81] focus-visible:ring-2 focus-visible:ring-[#0f4c81]"
          />
        </label>
      </fieldset>

      {/* Catalog Mode / Item Type */}
      <fieldset className="space-y-1.5">
        <legend className="text-[11px] font-bold uppercase tracking-wider text-[#77716b] dark:text-[#8b949e]">
          Item Type
        </legend>
        <div className="space-y-1">
          {[
            { id: "all", label: "All Catalog" },
            { id: "equipment", label: "Hospital Capital Equipment" },
            { id: "consumable", label: "Hospital Consumables & Kits" },
            { id: "group-buying", label: "Group Buying Pools (Wholesale)" },
            { id: "refurbished", label: "OEM Refurbished Devices" },
          ].map((type) => {
            const isSelected = (filters.itemType || "all") === type.id;
            return (
              <label
                key={type.id}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition ${
                  isSelected
                    ? "bg-[#eef5fc] dark:bg-[#0f4c81]/20 font-bold text-[#0f4c81] dark:text-[#388bfd]"
                    : "text-[#5d5854] dark:text-[#8b949e] hover:bg-[#faf9f8] dark:hover:bg-[#21262d]"
                }`}
              >
                <input
                  type="radio"
                  name="itemType"
                  value={type.id}
                  checked={isSelected}
                  onChange={() => onFilterChange({ itemType: type.id as FilterState["itemType"] })}
                  className="size-3.5 text-[#0f4c81] accent-[#0f4c81]"
                />
                <span>{type.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Brand Filter (Medikabazaar B2B Feature) */}
      <fieldset className="space-y-2">
        <div className="flex items-center justify-between">
          <legend className="text-[11px] font-bold uppercase tracking-wider text-[#77716b] dark:text-[#8b949e]">
            Top Medical Brands
          </legend>
          {filters.brand && (
            <button
              type="button"
              onClick={() => onFilterChange({ brand: undefined })}
              className="text-[10px] font-semibold text-[#0f4c81] dark:text-[#388bfd] hover:underline"
            >
              Clear
            </button>
          )}
        </div>
        <div className="max-h-48 overflow-y-auto space-y-1 pr-1 scrollbar-none">
          {TOP_BRANDS.map((b) => {
            const isChecked = filters.brand?.toLowerCase() === b.name.toLowerCase();
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => onFilterChange({ brand: isChecked ? undefined : b.name })}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition ${
                  isChecked
                    ? "bg-[#eef5fc] dark:bg-[#0f4c81]/20 font-bold text-[#0f4c81] dark:text-[#388bfd]"
                    : "text-[#5d5854] dark:text-[#8b949e] hover:bg-[#faf9f8] dark:hover:bg-[#21262d]"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <div
                    className={`size-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                      isChecked
                        ? "border-[#0f4c81] dark:border-[#388bfd] bg-[#0f4c81] dark:bg-[#388bfd]"
                        : "border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22]"
                    }`}
                  >
                    {isChecked && <div className="size-1.5 rounded-full bg-white dark:bg-[#0d1117]" />}
                  </div>
                  <span className="truncate">{b.name}</span>
                </div>
                <span className="text-[10px] text-[#77716b] dark:text-[#8b949e] ml-2 shrink-0">{b.productCount}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Price Range Filter */}
      <fieldset className="space-y-2">
        <legend className="text-[11px] font-bold uppercase tracking-wider text-[#77716b] dark:text-[#8b949e]">
          Price Range (INR)
        </legend>
        <div className="space-y-1">
          {PRICE_RANGES.map((range) => {
            const isSelected = filters.priceRange === range.id;
            return (
              <label
                key={range.id}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition ${
                  isSelected
                    ? "bg-[#eef5fc] dark:bg-[#0f4c81]/20 font-bold text-[#0f4c81] dark:text-[#388bfd]"
                    : "text-[#5d5854] dark:text-[#8b949e] hover:bg-[#faf9f8] dark:hover:bg-[#21262d] hover:text-[#171717] dark:hover:text-[#f0f6fc]"
                }`}
              >
                <input
                  type="radio"
                  name="priceRange"
                  value={range.id}
                  checked={isSelected}
                  onChange={() => onFilterChange({ priceRange: range.id as FilterState["priceRange"] })}
                  className="size-3.5 text-[#0f4c81] accent-[#0f4c81]"
                />
                <span>{range.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Regulatory Certifications (WCAG pass/fail testable) */}
      <fieldset className="space-y-2">
        <legend className="text-[11px] font-bold uppercase tracking-wider text-[#77716b] dark:text-[#8b949e]">
          Regulatory Certifications
        </legend>
        <div className="space-y-1.5">
          {CERTIFICATIONS_LIST.map((cert) => {
            const isChecked = filters.certifications.includes(cert);
            return (
              <label
                key={cert}
                className="flex items-center gap-2.5 px-2 py-1 rounded-lg cursor-pointer hover:bg-[#faf9f8] dark:hover:bg-[#21262d] transition"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleCertification(cert)}
                  className="size-3.5 rounded text-[#0f4c81] accent-[#0f4c81] focus-visible:ring-2 focus-visible:ring-[#0f4c81]"
                />
                <span className={`text-xs ${isChecked ? "font-bold text-[#171717] dark:text-[#f0f6fc]" : "text-[#5d5854] dark:text-[#8b949e]"}`}>
                  {cert}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Equipment Condition */}
      <fieldset className="space-y-2">
        <legend className="text-[11px] font-bold uppercase tracking-wider text-[#77716b] dark:text-[#8b949e]">
          Equipment Condition
        </legend>
        <div className="space-y-1">
          {[
            { id: "all", label: "All Conditions" },
            { id: "Brand New", label: "Brand New (Factory Sealed)" },
            { id: "OEM Refurbished (Grade A)", label: "OEM Refurbished (Grade A)" },
          ].map((cond) => {
            const isSelected = filters.condition === cond.id;
            return (
              <label
                key={cond.id}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition ${
                  isSelected
                    ? "bg-[#eef5fc] dark:bg-[#0f4c81]/20 font-bold text-[#0f4c81] dark:text-[#388bfd]"
                    : "text-[#5d5854] dark:text-[#8b949e] hover:bg-[#faf9f8] dark:hover:bg-[#21262d]"
                }`}
              >
                <input
                  type="radio"
                  name="condition"
                  value={cond.id}
                  checked={isSelected}
                  onChange={() => onFilterChange({ condition: cond.id as FilterState["condition"] })}
                  className="size-3.5 text-[#0f4c81] accent-[#0f4c81]"
                />
                <span>{cond.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Bulk Procurement Assistance Help Banner */}
      <div className="rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-gradient-to-b from-[#f8f9fa] to-white dark:from-[#1b2129] dark:to-[#161b22] p-3 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#0f4c81] dark:text-[#388bfd]">
          <BadgePercent className="size-4" />
          <span>Hospital Tender & Bulk Orders</span>
        </div>
        <p className="text-[11px] text-[#77716b] dark:text-[#8b949e] leading-snug">
          Need turnkey procurement for a new ICU wing or diagnostic center? Get volume discounts up to 25% with GST input tax credit.
        </p>
      </div>
    </div>
  );

  if (isMobileModal) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filter Equipment"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      >
        <div className="w-full max-w-md max-h-[85vh] flex flex-col rounded-2xl bg-white dark:bg-[#161b22] border border-[#ded8d1] dark:border-[#30363d] shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e8e6e3] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117]">
            <span className="font-bold text-sm text-[#171717] dark:text-[#f0f6fc]">Filters</span>
            <button
              type="button"
              onClick={onCloseMobileModal}
              className="p-1 rounded-md text-[#77716b] hover:text-[#171717] dark:hover:text-white"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">{content}</div>
          <div className="p-4 border-t border-[#e8e6e3] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] flex gap-2">
            <button
              type="button"
              onClick={onResetFilters}
              className="flex-1 rounded-xl border border-[#ded8d1] dark:border-[#30363d] py-2 text-xs font-semibold text-[#5d5854] dark:text-[#8b949e]"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onCloseMobileModal}
              className="flex-1 rounded-xl bg-[#0f4c81] text-white py-2 text-xs font-bold"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <aside
      aria-label="Product Filters"
      className="rounded-2xl border border-[#e8e6e3] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 shadow-xs sticky top-20"
    >
      {content}
    </aside>
  );
}
