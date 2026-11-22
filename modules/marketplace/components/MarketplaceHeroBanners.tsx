"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  Layers,
  Zap,
} from "lucide-react";
import { BANNER_PROMOTIONS } from "../data";
import { BannerPromotion, EquipmentCategorySlug, FilterState } from "../types";

interface MarketplaceHeroBannersProps {
  onFilterChange: (updates: Partial<FilterState>) => void;
  onOpenRfqModal: () => void;
}

export function MarketplaceHeroBanners({
  onFilterChange,
  onOpenRfqModal,
}: MarketplaceHeroBannersProps) {
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  // Auto-advance banner every 6 seconds unless user is hovering
  React.useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % BANNER_PROMOTIONS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const currentBanner = BANNER_PROMOTIONS[currentIdx];

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev - 1 + BANNER_PROMOTIONS.length) % BANNER_PROMOTIONS.length);
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % BANNER_PROMOTIONS.length);
  };

  const handleCtaClick = (banner: BannerPromotion) => {
    if (banner.filterCategory) {
      onFilterChange({ category: banner.filterCategory, subcategory: "" });
    } else if (banner.filterItemType) {
      onFilterChange({ itemType: banner.filterItemType });
    } else {
      onOpenRfqModal();
    }
  };

  return (
    <div
      role="region"
      aria-label="Promotional Banners"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative overflow-hidden rounded-2xl border border-[#0f4c81]/20 dark:border-[#388bfd]/30 shadow-md bg-gradient-to-br from-[#0a355c] via-[#0f4c81] to-[#163b65] text-white"
    >
      {/* Background Hero Photography */}
      {currentBanner.imageUrl && (
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-25 lg:opacity-35 overflow-hidden">
          <img
            src={currentBanner.imageUrl}
            alt={currentBanner.title}
            className="size-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a355c] via-[#0f4c81]/80 to-transparent" />
        </div>
      )}

      {/* Background Decorative Medical Geometry */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute right-1/3 bottom-0 w-64 h-64 rounded-full bg-[#388bfd]/30 blur-2xl" />
        <svg
          className="absolute right-6 top-1/2 -translate-y-1/2 w-96 h-96 text-white/5"
          viewBox="0 0 200 200"
          fill="currentColor"
        >
          <path d="M90 20 h20 v60 h60 v20 h-60 v60 h-20 v-60 h-60 v-20 h60 z" />
        </svg>
      </div>

      <div className="relative px-6 py-6 sm:px-8 sm:py-8 md:py-9 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Banner Content */}
        <div className="max-w-2xl space-y-3 z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
              <Zap className="size-3 text-amber-300 fill-amber-300" />
              {currentBanner.tag}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 text-[#0a2540] px-2.5 py-0.5 text-[11px] font-extrabold shadow-sm">
              <Sparkles className="size-3" />
              {currentBanner.badge}
            </span>
            <span className="text-xs text-white/80 font-medium hidden sm:inline">
              • {currentBanner.discountText}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
            {currentBanner.title}
          </h2>

          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed max-w-xl">
            {currentBanner.subtitle}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => handleCtaClick(currentBanner)}
              className="inline-flex items-center gap-2 rounded-xl bg-white text-[#0f4c81] hover:bg-blue-50 px-5 py-2.5 text-xs font-bold shadow-lg transition active:scale-95"
            >
              <span>{currentBanner.ctaText}</span>
              <ArrowRight className="size-3.5" />
            </button>

            <button
              type="button"
              onClick={onOpenRfqModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white px-4 py-2.5 text-xs font-semibold transition"
            >
              <ShieldCheck className="size-3.5" />
              <span>Get Institutional Quote</span>
            </button>
          </div>
        </div>

        {/* Right Info Quick Badges */}
        <div className="hidden lg:flex flex-col gap-2.5 z-10 shrink-0 w-64 bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/20">
          <div className="flex items-center gap-2.5 text-xs">
            <div className="size-7 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <ShieldCheck className="size-4 text-emerald-300" />
            </div>
            <div>
              <p className="font-bold text-white text-[11px]">100% Genuine Supplies</p>
              <p className="text-[10px] text-blue-100/75">CDSCO, CE & ISO 13485 Verified</p>
            </div>
          </div>
          <div className="h-px bg-white/15" />
          <div className="flex items-center gap-2.5 text-xs">
            <div className="size-7 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <Clock className="size-4 text-amber-300" />
            </div>
            <div>
              <p className="font-bold text-white text-[11px]">24-48 Hr Express Cargo</p>
              <p className="text-[10px] text-blue-100/75">Cold-Chain logistics nationwide</p>
            </div>
          </div>
          <div className="h-px bg-white/15" />
          <div className="flex items-center gap-2.5 text-xs">
            <div className="size-7 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <Layers className="size-4 text-cyan-300" />
            </div>
            <div>
              <p className="font-bold text-white text-[11px]">GST 12% Input Credit</p>
              <p className="text-[10px] text-blue-100/75">Direct B2B e-invoice generation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls & Dots */}
      <div className="relative px-6 pb-4 sm:px-8 flex items-center justify-between">
        {/* Pagination Dots */}
        <div className="flex items-center gap-1.5">
          {BANNER_PROMOTIONS.map((b, idx) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setCurrentIdx(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentIdx ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>

        {/* Prev / Next buttons */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono text-white/70 mr-1">
            {currentIdx + 1} / {BANNER_PROMOTIONS.length}
          </span>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous slide"
            className="flex size-7 items-center justify-center rounded-lg bg-white/15 hover:bg-white/25 text-white transition active:scale-95"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next slide"
            className="flex size-7 items-center justify-center rounded-lg bg-white/15 hover:bg-white/25 text-white transition active:scale-95"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
