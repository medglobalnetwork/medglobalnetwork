"use client";

import * as React from "react";
import {
  Search,
  MapPin,
  FileText,
  Sparkles,
  ShieldCheck,
  Building2,
  SlidersHorizontal,
  LayoutGrid,
  List,
  ChevronDown,
  X,
  BookOpen,
  Zap,
  Truck,
  Layers,
  Activity,
  Users,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { CITIES_LIST, EQUIPMENT_CATEGORIES } from "../data";
import { EquipmentCategorySlug, FilterState } from "../types";

interface MarketplaceHeaderProps {
  filters: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  onOpenRfqModal: () => void;
  onOpenDsGuideModal: () => void;
  onOpenMobileFilters: () => void;
  totalProductsCount: number;
  onOpenQuickOrderModal?: () => void;
  onOpenPincodeModal?: () => void;
  onResetCategory?: () => void;
  selectedPincode?: string;
  selectedCity?: string;
}

export function MarketplaceHeader({
  filters,
  onFilterChange,
  onOpenRfqModal,
  onOpenDsGuideModal,
  onOpenMobileFilters,
  totalProductsCount,
  onOpenQuickOrderModal,
  onOpenPincodeModal,
  onResetCategory,
  selectedPincode = "110001",
  selectedCity = "New Delhi",
}: MarketplaceHeaderProps) {
  const [searchInput, setSearchInput] = React.useState(filters.searchQuery);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);

  // Sync internal search input whenever filter changes externally
  React.useEffect(() => {
    setSearchInput(filters.searchQuery);
  }, [filters.searchQuery]);

  // Click outside to dismiss search suggestions
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const POPULAR_SEARCHES = [
    "ICU Ventilator",
    "K2 EDTA Blood Tubes",
    "Class-B Autoclave",
    "Patient Monitor",
    "Hypodermic Syringes",
    "Color Doppler Ultrasound",
    "Urine Test Strips",
    "Dental Alginate",
    "16-Slice CT Scanner",
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ searchQuery: searchInput.trim() });
    setShowSuggestions(false);
  };

  const handleSelectSuggestion = (term: string) => {
    setSearchInput(term);
    onFilterChange({ searchQuery: term });
    setShowSuggestions(false);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    onFilterChange({ searchQuery: "" });
  };

  const ITEM_TYPE_TABS: Array<{ id: NonNullable<FilterState["itemType"]>; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: "all", label: "All Catalog", icon: LayoutGrid },
    { id: "equipment", label: "Capital Equipment", icon: Activity },
    { id: "consumable", label: "Hospital Consumables", icon: Layers },
    { id: "group-buying", label: "Group Buying Pools", icon: Users },
    { id: "refurbished", label: "OEM Refurbished", icon: RotateCcw },
  ];

  const activeCategoryObj = EQUIPMENT_CATEGORIES.find((c) => c.id === filters.category);
  const isAllCategories = !filters.category || filters.category === "all";

  return (
    <header className="space-y-5">
      {/* Top Breadcrumb & Live Delivery Hub (Medikabazaar Header Pattern) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#77716b] dark:text-[#8b949e]">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2">
          <Link
            href="/home"
            className="hover:text-[#0f4c81] dark:hover:text-[#388bfd] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] rounded"
          >
            Home
          </Link>
          <span aria-hidden="true" className="text-[#b8b2a9] dark:text-[#484f58]">/</span>
          {isAllCategories ? (
            <span className="text-[#0f4c81] dark:text-[#388bfd] font-bold">Marketplace</span>
          ) : (
            <>
              <button
                type="button"
                onClick={onResetCategory}
                className="hover:text-[#0f4c81] dark:hover:text-[#388bfd] hover:underline font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] rounded"
              >
                Marketplace
              </button>
              <span aria-hidden="true" className="text-[#b8b2a9] dark:text-[#484f58]">/</span>
              <span className="text-[#0f4c81] dark:text-[#388bfd] font-bold flex items-center gap-1.5">
                {activeCategoryObj?.name || "Hospital Supplies & Equipment"}
                {onResetCategory && (
                  <button
                    type="button"
                    onClick={onResetCategory}
                    title="Clear category filter"
                    className="size-4 inline-flex items-center justify-center rounded-full bg-[#ded8d1] dark:bg-[#30363d] text-[#171717] dark:text-[#f0f6fc] hover:bg-[#b8b2a9] text-[10px]"
                  >
                    ×
                  </button>
                )}
              </span>
            </>
          )}
        </nav>

        {/* Medikabazaar Delivery Pincode Indicator & Badges */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenPincodeModal}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] px-2.5 py-1 text-xs text-[#171717] dark:text-[#f0f6fc] hover:border-[#0f4c81] dark:hover:border-[#388bfd] transition shadow-2xs"
          >
            <MapPin className="size-3.5 text-[#0f4c81] dark:text-[#388bfd]" />
            <span className="text-[#77716b] dark:text-[#8b949e]">Deliver to:</span>
            <span className="font-bold text-[#0f4c81] dark:text-[#388bfd]">{selectedCity}, {selectedPincode}</span>
            <ChevronDown className="size-3 text-[#77716b]" />
          </button>

          <span className="hidden md:inline-flex items-center gap-1 text-[#16804d] dark:text-[#2ea043] font-semibold text-[11px]">
            <ShieldCheck className="size-3.5" />
            100% CDSCO Verified
          </span>
        </div>
      </div>

      {/* Main Hero Card */}
      <div className="relative overflow-hidden rounded-3xl border border-[#e8e6e3] dark:border-[#30363d] bg-gradient-to-br from-white via-[#fcfbf9] to-[#f4f7fb] dark:from-[#161b22] dark:via-[#131920] dark:to-[#0d1117] p-5 sm:p-7 shadow-xs">
        <div className="max-w-3xl space-y-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0f4c81]/25 bg-[#eef5fc] dark:bg-[#0f4c81]/20 px-3 py-1 text-xs font-bold text-[#0f4c81] dark:text-[#388bfd]">
              <Sparkles className="size-3.5" />
              {isAllCategories ? "B2B Medical Marketplace & Procurement Hub" : `${activeCategoryObj?.shortName || "Department"} Catalog`}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Wholesale Institutional Pricing + GST 12% Input Tax Credit
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#171717] dark:text-[#f0f6fc] text-balance">
            {isAllCategories ? "MGN Healthcare Marketplace & Equipment Hub" : (activeCategoryObj?.name || "B2B Medical Equipment & Hospital Supplies")}
          </h1>

          <p className="text-xs sm:text-sm text-[#5d5854] dark:text-[#8b949e] leading-relaxed text-pretty">
            {isAllCategories
              ? "India's central verified healthcare procurement network — source ICU ventilators, imaging systems, surgical instruments, clinical disposables, dental supplies, and hospital furniture directly from CDSCO and US FDA certified manufacturers."
              : (activeCategoryObj?.description || "Source verified medical devices and clinical supplies directly from certified manufacturers with nationwide cold-chain delivery.")}
          </p>

          {!isAllCategories && onResetCategory && (
            <div className="pt-1">
              <button
                type="button"
                onClick={onResetCategory}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#21262d] px-3 py-1.5 text-xs font-semibold text-[#0f4c81] dark:text-[#388bfd] hover:bg-[#faf9f8] dark:hover:bg-[#30363d] transition shadow-2xs"
              >
                <span>← View All Marketplace Departments</span>
              </button>
            </div>
          )}

          {/* Quick Action Buttons (RFQ + Quick Order + Design System) */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onOpenRfqModal}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0f4c81] dark:bg-[#388bfd] hover:bg-[#0c3c66] dark:hover:bg-[#2075e8] text-white px-5 py-2.5 text-xs sm:text-sm font-bold shadow-xs transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81]"
            >
              <FileText className="size-4" />
              <span>Post Buy Requirement (RFQ)</span>
            </button>

            {onOpenQuickOrderModal && (
              <button
                type="button"
                onClick={onOpenQuickOrderModal}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 text-xs sm:text-sm font-bold shadow-xs transition active:scale-95"
              >
                <Zap className="size-4 fill-current" />
                <span>Quick Order Pad</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenDsGuideModal}
              className="inline-flex items-center gap-2 rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#21262d] text-[#171717] dark:text-[#f0f6fc] hover:bg-[#faf9f8] dark:hover:bg-[#30363d] px-4 py-2.5 text-xs sm:text-sm font-semibold transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81]"
            >
              <BookOpen className="size-4 text-[#0f4c81] dark:text-[#388bfd]" />
              <span>Design System Guide</span>
            </button>
          </div>
        </div>
      </div>

      {/* Item Type Mode Switcher (All / Capital Equipment / Consumables / Group Buying / Refurbished) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {ITEM_TYPE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = (filters.itemType || "all") === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onFilterChange({ itemType: tab.id })}
              className={`shrink-0 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition active:scale-95 ${
                isActive
                  ? "bg-[#0f4c81] text-white dark:bg-[#388bfd] dark:text-[#0d1117] shadow-xs"
                  : "bg-white dark:bg-[#161b22] border border-[#ded8d1] dark:border-[#30363d] text-[#5d5854] dark:text-[#8b949e] hover:border-[#0f4c81] hover:text-[#0f4c81]"
              }`}
            >
              <Icon className="size-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Global Search and City Bar */}
      <div className="rounded-2xl border border-[#e8e6e3] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-3 sm:p-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          
          {/* Search Input with Suggestions */}
          <div ref={searchContainerRef} className="relative flex-1">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 size-4 text-[#77716b] dark:text-[#8b949e] pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search hospital equipment, consumables (Syringes, EDTA tubes), brand (Mindray, GE, 3M, Contec)..."
                className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] pl-10 pr-10 py-2.5 text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] placeholder-[#9c958f] dark:placeholder-[#6e7681] focus:bg-white dark:focus:bg-[#161b22] focus:border-[#0f4c81] dark:focus:border-[#388bfd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81]/30 transition"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 p-1 rounded-full text-[#77716b] hover:text-[#171717] dark:hover:text-white"
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Instant Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 z-30 mt-1.5 rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-3 shadow-lg">
                <div className="text-[11px] font-bold text-[#77716b] dark:text-[#8b949e] uppercase tracking-wider mb-2">
                  Popular Medical Equipment & Supplies
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SEARCHES.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handleSelectSuggestion(term)}
                      className="rounded-lg border border-[#e8e6e3] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] hover:border-[#0f4c81] dark:hover:border-[#388bfd] hover:bg-[#eef5fc] dark:hover:bg-[#0f4c81]/20 px-2.5 py-1 text-xs text-[#5d5854] dark:text-[#8b949e] hover:text-[#0f4c81] dark:hover:text-[#388bfd] transition text-left"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Location Selector (IndiaMART feature) */}
          <div className="relative shrink-0 md:w-52">
            <div className="relative flex items-center">
              <MapPin className="absolute left-3 size-4 text-[#0f4c81] dark:text-[#388bfd] pointer-events-none" />
              <select
                value={filters.selectedCity}
                onChange={(e) => onFilterChange({ selectedCity: e.target.value })}
                aria-label="Filter suppliers by location"
                className="w-full appearance-none rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] pl-9 pr-8 py-2.5 text-xs sm:text-sm font-medium text-[#171717] dark:text-[#f0f6fc] focus:border-[#0f4c81] dark:focus:border-[#388bfd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81]/30 transition"
              >
                {CITIES_LIST.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 size-3.5 text-[#77716b] pointer-events-none" />
            </div>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-[#0f4c81] dark:bg-[#388bfd] hover:bg-[#0c3c66] dark:hover:bg-[#2075e8] text-white px-5 py-2.5 text-xs sm:text-sm font-bold shadow-xs transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81]"
          >
            Find Supplies
          </button>
        </form>

        {/* Bottom Filter Controls Bar */}
        <div className="mt-3.5 pt-3 border-t border-[#e8e6e3] dark:border-[#30363d] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#5d5854] dark:text-[#8b949e]">
            <span className="font-bold text-[#171717] dark:text-[#f0f6fc]">
              {totalProductsCount} {totalProductsCount === 1 ? "Item" : "Items"}
            </span>
            <span>listed</span>
            {filters.selectedCity !== "All India" && (
              <span className="inline-flex items-center gap-1 rounded-md bg-[#eef5fc] dark:bg-[#0f4c81]/20 px-2 py-0.5 text-[11px] font-semibold text-[#0f4c81] dark:text-[#388bfd]">
                in {filters.selectedCity}
              </span>
            )}
            {filters.brand && (
              <span className="inline-flex items-center gap-1 rounded-md bg-[#eef5fc] dark:bg-[#0f4c81]/20 px-2 py-0.5 text-[11px] font-semibold text-[#0f4c81] dark:text-[#388bfd]">
                Brand: {filters.brand}
                <button
                  type="button"
                  onClick={() => onFilterChange({ brand: undefined })}
                  className="hover:text-red-500 ml-0.5"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
            {filters.searchQuery && (
              <span className="inline-flex items-center gap-1 rounded-md bg-[#faf9f8] dark:bg-[#21262d] border border-[#ded8d1] dark:border-[#30363d] px-2 py-0.5 text-[11px] text-[#171717] dark:text-[#f0f6fc]">
                &ldquo;{filters.searchQuery}&rdquo;
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="hover:text-red-500"
                  aria-label="Remove search filter"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile Filter Button */}
            <button
              type="button"
              onClick={onOpenMobileFilters}
              className="lg:hidden inline-flex items-center gap-1.5 rounded-lg border border-[#ded8d1] dark:border-[#30363d] px-3 py-1.5 text-xs font-semibold text-[#171717] dark:text-[#f0f6fc] hover:bg-[#faf9f8] dark:hover:bg-[#21262d] transition"
            >
              <SlidersHorizontal className="size-3.5" />
              <span>Filters</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-[#77716b] dark:text-[#8b949e]">
              <span className="hidden sm:inline">Sort by:</span>
              <select
                value={filters.sortBy}
                onChange={(e) => onFilterChange({ sortBy: e.target.value as FilterState["sortBy"] })}
                aria-label="Sort products"
                className="rounded-lg border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#0d1117] px-2.5 py-1.5 text-xs font-medium text-[#171717] dark:text-[#f0f6fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81]"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="fastest-delivery">Fastest Delivery</option>
              </select>
            </div>

            {/* View Mode Toggle (Grid / List) */}
            <div className="flex items-center rounded-lg border border-[#ded8d1] dark:border-[#30363d] p-0.5 bg-[#faf9f8] dark:bg-[#0d1117]">
              <button
                type="button"
                onClick={() => onFilterChange({ viewMode: "grid" })}
                aria-label="Grid view"
                className={`p-1.5 rounded-md transition ${
                  filters.viewMode === "grid"
                    ? "bg-white dark:bg-[#21262d] text-[#0f4c81] dark:text-[#388bfd] shadow-2xs"
                    : "text-[#77716b] dark:text-[#8b949e] hover:text-[#171717]"
                }`}
              >
                <LayoutGrid className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onFilterChange({ viewMode: "list" })}
                aria-label="List view"
                className={`p-1.5 rounded-md transition ${
                  filters.viewMode === "list"
                    ? "bg-white dark:bg-[#21262d] text-[#0f4c81] dark:text-[#388bfd] shadow-2xs"
                    : "text-[#77716b] dark:text-[#8b949e] hover:text-[#171717]"
                }`}
              >
                <List className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
