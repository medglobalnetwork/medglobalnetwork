"use client";

import * as React from "react";
import {
  ShieldCheck,
  Building2,
  Check,
  FileText,
  Eye,
  Star,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  Package,
  Users,
  Zap,
} from "lucide-react";
import { MarketplaceProduct } from "../types";

export interface MarketplaceProductCardProps {
  product: MarketplaceProduct;
  onOpenRfq: (product: MarketplaceProduct) => void;
  onQuickView: (product: MarketplaceProduct) => void;
  onToggleCompare: (product: MarketplaceProduct) => void;
  isCompared: boolean;
  onJoinGroupPool?: (product: MarketplaceProduct) => void;
  onAddToQuickOrder?: (product: MarketplaceProduct) => void;
}

export function MarketplaceProductCard({
  product,
  onOpenRfq,
  onQuickView,
  onToggleCompare,
  isCompared,
  onJoinGroupPool,
  onAddToQuickOrder,
}: MarketplaceProductCardProps) {
  const [showBulkTiers, setShowBulkTiers] = React.useState(false);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const keySpecEntries = Object.entries(product.keySpecs).slice(0, 3);

  return (
    <article
      aria-labelledby={`prod-title-${product.id}`}
      className="group relative flex flex-col justify-between rounded-2xl border border-[#e8e6e3] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-[#ded8d1] dark:hover:border-[#484f58] transition-all duration-200"
    >
      <div>
        {/* Top Badges & Compare Toggle */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {product.bestSeller && (
              <span className="inline-flex items-center gap-1 rounded-md bg-[#eef5fc] dark:bg-[#0f4c81]/25 border border-[#0f4c81]/20 px-2 py-0.5 text-[10px] font-bold text-[#0f4c81] dark:text-[#388bfd]">
                <Sparkles className="size-3" />
                Best Seller
              </span>
            )}
            {product.isGroupBuyingEligible && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                <Users className="size-3" />
                Pool Save {product.groupDiscountPercent || 5}%
              </span>
            )}
            {product.certifications[0] && (
              <span className="inline-flex items-center gap-1 rounded-md bg-[#eafaf1] dark:bg-[#16804d]/20 border border-[#16804d]/20 px-2 py-0.5 text-[10px] font-semibold text-[#16804d] dark:text-[#2ea043]">
                <Check className="size-3" />
                {product.certifications[0]}
              </span>
            )}
          </div>

          {/* Compare Checkbox */}
          <label className="flex items-center gap-1 text-[11px] font-medium text-[#77716b] dark:text-[#8b949e] hover:text-[#171717] dark:hover:text-white cursor-pointer select-none shrink-0">
            <input
              type="checkbox"
              checked={isCompared}
              onChange={() => onToggleCompare(product)}
              className="size-3.5 rounded text-[#0f4c81] accent-[#0f4c81] focus-visible:ring-1 focus-visible:ring-[#0f4c81]"
            />
            <span>Compare</span>
          </label>
        </div>

        {/* Product Image Showcase */}
        <div
          onClick={() => onQuickView(product)}
          className="relative my-2.5 h-44 sm:h-48 w-full rounded-xl overflow-hidden bg-slate-50 dark:bg-[#0d1117] border border-[#e8e6e3] dark:border-[#30363d] flex items-center justify-center cursor-pointer group/img"
        >
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover object-center group-hover/img:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-[#77716b] dark:text-[#8b949e] p-4 text-center">
              <Package className="size-10 mb-1 text-[#0f4c81]/40 dark:text-[#388bfd]/40" />
              <span className="text-[11px] font-medium">{product.subcategory}</span>
            </div>
          )}

          {/* Quick View Hover Button */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 dark:bg-[#161b22]/95 px-3 py-1.5 text-xs font-bold text-[#0f4c81] dark:text-[#388bfd] shadow-md backdrop-blur-xs transform -translate-y-1 group-hover/img:translate-y-0 transition-transform">
              <Eye className="size-3.5" />
              Quick Specs
            </span>
          </div>

          {/* In Stock / Lead time Pill on image */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1">
            <span className="inline-flex items-center gap-1 rounded-md bg-white/90 dark:bg-[#161b22]/90 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-[#16804d] dark:text-[#2ea043] border border-[#16804d]/20 shadow-xs">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {product.inStock ? "In Stock" : "On Request"}
            </span>
          </div>
        </div>

        {/* Brand & Model */}
        <div className="flex items-center justify-between text-xs text-[#77716b] dark:text-[#8b949e] mb-1">
          <span className="font-semibold text-[#0f4c81] dark:text-[#388bfd]">{product.brand}</span>
          <span className="font-mono text-[11px]">{product.modelNumber}</span>
        </div>

        {/* Product Title */}
        <h3
          id={`prod-title-${product.id}`}
          onClick={() => onQuickView(product)}
          className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc] group-hover:text-[#0f4c81] dark:group-hover:text-[#388bfd] transition leading-snug line-clamp-2 cursor-pointer"
        >
          {product.name}
        </h3>

        {/* Pack Size / Subcategory Pill */}
        {product.packSize && (
          <div className="mt-1 inline-flex items-center gap-1 rounded-md bg-[#faf9f8] dark:bg-[#21262d] border border-[#e8e6e3] dark:border-[#30363d] px-2 py-0.5 text-[10px] font-medium text-[#5d5854] dark:text-[#8b949e]">
            <Package className="size-3 text-[#77716b]" />
            <span>{product.packSize}</span>
          </div>
        )}

        {/* Rating and Reviews */}
        <div className="mt-1.5 flex items-center gap-2 text-xs">
          <div className="inline-flex items-center gap-1 rounded-md bg-[#fffbeb] dark:bg-amber-950/40 px-1.5 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-400">
            <Star className="size-3 fill-amber-500 text-amber-500" />
            <span>{product.rating}</span>
          </div>
          <span className="text-[11px] text-[#77716b] dark:text-[#8b949e]">
            ({product.reviewCount} reviews)
          </span>
        </div>

        {/* Key Technical Highlights */}
        <div className="mt-3 rounded-xl border border-[#e8e6e3] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] p-2.5 space-y-1.5 text-[11px]">
          {keySpecEntries.map(([key, value]) => (
            <div key={key} className="flex items-start justify-between gap-2">
              <span className="text-[#77716b] dark:text-[#8b949e] shrink-0">{key}:</span>
              <span className="font-medium text-[#171717] dark:text-[#f0f6fc] text-right truncate">
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Pricing Block */}
        <div className="mt-3.5 space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-extrabold text-[#171717] dark:text-[#f0f6fc]">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-[#9c958f] dark:text-[#6e7681] line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <span className="text-[11px] text-[#77716b] dark:text-[#8b949e]">
              / {product.priceDisplayUnit}
            </span>
          </div>

          {/* Group Price Callout if eligible */}
          {product.isGroupBuyingEligible && product.groupPrice && (
            <div className="flex items-center justify-between gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-md">
              <span>Group Pool: {formatPrice(product.groupPrice)}</span>
              {onJoinGroupPool && (
                <button
                  type="button"
                  onClick={() => onJoinGroupPool(product)}
                  className="inline-flex items-center gap-1 text-[10px] text-[#0f4c81] dark:text-[#388bfd] hover:underline font-bold"
                >
                  <Users className="size-3" />
                  <span>Join Pool →</span>
                </button>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-[#77716b] dark:text-[#8b949e]">
            <span>Min. Order (MOQ): <strong className="text-[#171717] dark:text-[#f0f6fc]">{product.minOrderQuantity} Unit</strong></span>
            {product.bulkPricing.length > 1 && (
              <button
                type="button"
                onClick={() => setShowBulkTiers(!showBulkTiers)}
                className="text-[#0f4c81] dark:text-[#388bfd] font-semibold hover:underline inline-flex items-center gap-0.5"
              >
                <span>Bulk Rates</span>
                <ChevronRight className={`size-3 transition-transform ${showBulkTiers ? "rotate-90" : ""}`} />
              </button>
            )}
          </div>

          {/* Bulk Tier Dropdown / Accordion */}
          {showBulkTiers && (
            <div className="mt-2 rounded-lg border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-2 space-y-1 text-[10px]">
              <div className="font-semibold text-[#171717] dark:text-[#f0f6fc] border-b border-[#e8e6e3] dark:border-[#30363d] pb-1">
                Wholesale Volume Tiers:
              </div>
              {product.bulkPricing.map((tier, idx) => (
                <div key={idx} className="flex justify-between items-center text-[#5d5854] dark:text-[#8b949e]">
                  <span>{tier.minQty}{tier.maxQty ? `-${tier.maxQty}` : "+"} units:</span>
                  <span className="font-bold text-[#171717] dark:text-[#f0f6fc]">{formatPrice(tier.pricePerUnit)}</span>
                  {tier.savingsPercentage > 0 && (
                    <span className="text-[#16804d] dark:text-[#2ea043] font-semibold">Save {tier.savingsPercentage}%</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Verified Supplier Strip (IndiaMART/Medikabazaar inspired) */}
        <div className="mt-3.5 pt-3 border-t border-[#e8e6e3] dark:border-[#30363d] space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 truncate">
              <Building2 className="size-3.5 text-[#0f4c81] dark:text-[#388bfd] shrink-0" />
              <span className="font-bold text-[#171717] dark:text-[#f0f6fc] truncate">
                {product.supplier.name}
              </span>
            </div>
            <span className="shrink-0 text-[10px] text-[#77716b] dark:text-[#8b949e]">
              {product.supplier.city}
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#77716b] dark:text-[#8b949e]">
            <span className="inline-flex items-center gap-1 text-[#16804d] dark:text-[#2ea043] font-semibold">
              <ShieldCheck className="size-3" />
              {product.supplier.verifiedBadge}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" />
              Resp. {product.supplier.responseTimeText}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-3 border-t border-[#e8e6e3] dark:border-[#30363d] flex items-center gap-2">
        <button
          type="button"
          onClick={() => onOpenRfq(product)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0f4c81] dark:bg-[#388bfd] hover:bg-[#0c3c66] dark:hover:bg-[#2075e8] text-white py-2 px-3 text-xs font-bold transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] dark:focus-visible:ring-[#388bfd]"
        >
          <FileText className="size-3.5" />
          <span>Get Quote</span>
        </button>

        {onAddToQuickOrder && (
          <button
            type="button"
            onClick={() => onAddToQuickOrder(product)}
            title="Add to Quick Order Pad"
            aria-label={`Add ${product.name} to Quick Order Pad`}
            className="rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/60 text-amber-800 dark:text-amber-300 p-2 text-xs font-medium transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <Zap className="size-4 fill-current" />
          </button>
        )}

        <button
          type="button"
          onClick={() => onQuickView(product)}
          aria-label={`View detailed specifications for ${product.name}`}
          className="rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#21262d] hover:bg-white dark:hover:bg-[#30363d] text-[#5d5854] dark:text-[#f0f6fc] p-2 text-xs font-medium transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] dark:focus-visible:ring-[#388bfd]"
        >
          <Eye className="size-4" />
        </button>
      </div>
    </article>
  );
}
