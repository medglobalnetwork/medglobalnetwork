"use client";

import * as React from "react";
import {
  Users,
  TrendingDown,
  Clock,
  Sparkles,
  Heart,
  CheckCircle2,
  ChevronRight,
  Info,
  Package,
  Layers,
  ArrowRight,
} from "lucide-react";
import { MARKETPLACE_PRODUCTS } from "../data";
import { MarketplaceProduct } from "../types";

interface GroupBuyingSectionProps {
  onJoinPool: (product: MarketplaceProduct) => void;
  onQuickView: (product: MarketplaceProduct) => void;
}

export function GroupBuyingSection({
  onJoinPool,
  onQuickView,
}: GroupBuyingSectionProps) {
  const groupBuyingProducts = React.useMemo(() => {
    return MARKETPLACE_PRODUCTS.filter((p) => p.isGroupBuyingEligible);
  }, []);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (groupBuyingProducts.length === 0) return null;

  return (
    <section
      aria-labelledby="group-buying-heading"
      className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 sm:p-6 shadow-xs space-y-6"
    >
      {/* Top Banner Explainer matching Medikabazaar "Buy together. Pay less." */}
      <div className="rounded-xl bg-gradient-to-r from-[#0f4c81] via-[#155a96] to-[#0c3c66] text-white p-5 sm:p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 pointer-events-none transform skew-x-12" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 border border-amber-300/30 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
              <Sparkles className="size-3" />
              <span>Bulk Institutional Procurement Pool</span>
            </div>
            <h2 id="group-buying-heading" className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Buy together. Pay less.
            </h2>
            <p className="text-xs text-blue-100/90 leading-relaxed">
              Consolidate your hospital purchase orders with verified healthcare institutions nationwide to unlock tier-3 wholesale manufacturer pricing.
            </p>
          </div>

          {/* 3 Steps Flow */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto shrink-0 text-left">
            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-3 border border-white/15">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex size-5 items-center justify-center rounded-full bg-amber-400 text-[#0f4c81] text-[10px] font-bold">1</span>
                <span className="text-xs font-bold text-white">Join the pool</span>
              </div>
              <p className="text-[10px] text-blue-100/80">Choose your quantity & register institutional interest.</p>
            </div>

            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-3 border border-white/15">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex size-5 items-center justify-center rounded-full bg-amber-400 text-[#0f4c81] text-[10px] font-bold">2</span>
                <span className="text-xs font-bold text-white">More buyers join</span>
              </div>
              <p className="text-[10px] text-blue-100/80">Pool accumulates orders towards wholesale quota.</p>
            </div>

            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-3 border border-white/15">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex size-5 items-center justify-center rounded-full bg-amber-400 text-[#0f4c81] text-[10px] font-bold">3</span>
                <span className="text-xs font-bold text-white">Target reached</span>
              </div>
              <p className="text-[10px] text-blue-100/80">Discount confirmed and dispatched with cold-chain.</p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-blue-100/90">
          <span className="inline-flex items-center gap-1.5">
            <Info className="size-3.5 text-amber-300" />
            <span>No advance payment required. Tap "Interested" to lock volume rate.</span>
          </span>
          <span className="font-semibold text-amber-300 hidden sm:inline">
            Active Pools: {groupBuyingProducts.length} Items Available
          </span>
        </div>
      </div>

      {/* Product Cards Row */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">
              Eligible for Group Buying
            </h3>
            <p className="text-[11px] text-[#77716b] dark:text-[#8b949e]">
              High-volume medical disposables, blood collection tubes, autoclaves, and diagnostic strips
            </p>
          </div>
          <span className="text-xs font-semibold text-[#0f4c81] dark:text-[#388bfd]">
            Swipe / Scroll to view all ({groupBuyingProducts.length})
          </span>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-3 pt-1 scrollbar-none scroll-smooth">
          {groupBuyingProducts.map((prod) => {
            const groupPrice = prod.groupPrice || Math.round(prod.price * 0.92);
            const savingsAmt = prod.price - groupPrice;
            const savingsPct = prod.groupDiscountPercent || Math.round((savingsAmt / prod.price) * 100);

            return (
              <div
                key={prod.id}
                className="w-64 sm:w-72 shrink-0 rounded-xl border border-[#e8e6e3] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] p-3.5 flex flex-col justify-between hover:border-[#0f4c81]/40 dark:hover:border-[#388bfd]/40 hover:shadow-md transition"
              >
                <div>
                  {/* Top: Interest count pill & Quick View */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0f4c81] dark:text-[#388bfd] bg-[#eef5fc] dark:bg-[#0f4c81]/25 px-2 py-0.5 rounded-full">
                      <Users className="size-3 text-[#0f4c81] dark:text-[#388bfd]" />
                      <span>{prod.groupInterestedCount || 10} interested</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onQuickView(prod)}
                      className="text-[10px] font-medium text-[#77716b] dark:text-[#8b949e] hover:text-[#0f4c81] dark:hover:text-[#388bfd]"
                    >
                      View Specs
                    </button>
                  </div>

                  {/* Group Buying Product Image */}
                  <div
                    onClick={() => onQuickView(prod)}
                    className="relative my-2 h-32 w-full rounded-lg overflow-hidden bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] flex items-center justify-center cursor-pointer group/gb"
                  >
                    {prod.imageUrl ? (
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        loading="lazy"
                        className="size-full object-cover object-center group-hover/gb:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <Package className="size-8 text-[#0f4c81]/40" />
                    )}
                  </div>

                  {/* Brand & Subcategory */}
                  <div className="text-[10px] font-bold text-[#77716b] dark:text-[#8b949e] uppercase tracking-wider mb-1">
                    {prod.brand} • {prod.subcategory}
                  </div>

                  {/* Product Title */}
                  <h4
                    onClick={() => onQuickView(prod)}
                    className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc] line-clamp-2 hover:text-[#0f4c81] dark:hover:text-[#388bfd] cursor-pointer min-h-[32px] leading-snug"
                  >
                    {prod.name}
                  </h4>

                  {/* Pack Size */}
                  <div className="mt-1 text-[10px] text-[#5d5854] dark:text-[#8b949e] flex items-center gap-1">
                    <Package className="size-3 text-[#77716b]" />
                    <span>{prod.packSize || prod.priceDisplayUnit}</span>
                  </div>
                </div>

                {/* Price block matching Medikabazaar 2-column layout */}
                <div className="mt-3 pt-2.5 border-t border-[#e8e6e3] dark:border-[#30363d] space-y-2">
                  <div className="overflow-hidden rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22]">
                    <div className="flex items-stretch divide-x divide-[#e8e6e3] dark:divide-[#30363d]">
                      {/* Individual Price */}
                      <div className="flex flex-1 flex-col justify-center bg-[#faf9f8] dark:bg-[#21262d] px-2.5 py-1.5 text-center">
                        <span className="text-[9px] font-semibold text-[#77716b] dark:text-[#8b949e] uppercase">Now</span>
                        <span className="text-xs font-bold text-[#5d5854] dark:text-[#8b949e] line-through">
                          {formatPrice(prod.price)}
                        </span>
                      </div>
                      {/* Group Price */}
                      <div className="flex flex-1 flex-col justify-center px-2.5 py-1.5 text-center bg-[#eef5fc]/50 dark:bg-[#0f4c81]/15">
                        <span className="text-[9px] font-bold text-[#0f4c81] dark:text-[#388bfd] uppercase">Group</span>
                        <span className="text-xs font-extrabold text-[#0f4c81] dark:text-[#388bfd]">
                          {formatPrice(groupPrice)}
                        </span>
                      </div>
                    </div>
                    {/* Savings Tag */}
                    <div className="bg-[#eafaf1] dark:bg-emerald-950/40 px-2.5 py-1 text-center text-[10px] font-bold text-[#16804d] dark:text-[#2ea043]">
                      Save {formatPrice(savingsAmt)} · {savingsPct}% off
                    </div>
                  </div>

                  {/* Interested / Join Button */}
                  <button
                    type="button"
                    onClick={() => onJoinPool(prod)}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-white dark:bg-[#21262d] border border-[#0f4c81] dark:border-[#388bfd] text-[#0f4c81] dark:text-[#388bfd] hover:bg-[#0f4c81] hover:text-white dark:hover:bg-[#388bfd] dark:hover:text-[#0d1117] py-1.5 px-3 text-xs font-bold shadow-2xs transition active:scale-95"
                  >
                    <Heart className="size-3.5 fill-current text-rose-500" />
                    <span>Join Pool / Interested</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
