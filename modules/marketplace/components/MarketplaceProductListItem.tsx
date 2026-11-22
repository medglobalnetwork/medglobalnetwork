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
  Package,
  Users,
  Zap,
} from "lucide-react";
import { MarketplaceProduct } from "../types";

export interface MarketplaceProductListItemProps {
  product: MarketplaceProduct;
  onOpenRfq: (product: MarketplaceProduct) => void;
  onQuickView: (product: MarketplaceProduct) => void;
  onToggleCompare: (product: MarketplaceProduct) => void;
  isCompared: boolean;
  onJoinGroupPool?: (product: MarketplaceProduct) => void;
  onAddToQuickOrder?: (product: MarketplaceProduct) => void;
}

export function MarketplaceProductListItem({
  product,
  onOpenRfq,
  onQuickView,
  onToggleCompare,
  isCompared,
  onJoinGroupPool,
  onAddToQuickOrder,
}: MarketplaceProductListItemProps) {
  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <article
      aria-labelledby={`list-title-${product.id}`}
      className="group rounded-2xl border border-[#e8e6e3] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-[#ded8d1] dark:hover:border-[#484f58] transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
    >
      {/* Product Image Thumbnail */}
      <div
        onClick={() => onQuickView(product)}
        className="relative size-28 sm:size-36 shrink-0 rounded-xl overflow-hidden bg-slate-50 dark:bg-[#0d1117] border border-[#e8e6e3] dark:border-[#30363d] flex items-center justify-center cursor-pointer group/itemimg"
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover object-center group-hover/itemimg:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <Package className="size-8 text-[#0f4c81]/40 dark:text-[#388bfd]/40" />
        )}
        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/itemimg:opacity-100 transition-opacity flex items-center justify-center">
          <Eye className="size-4 text-white drop-shadow-md" />
        </div>
      </div>

      {/* Left Details Column */}
      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {product.bestSeller && (
            <span className="inline-flex items-center gap-1 rounded-md bg-[#eef5fc] dark:bg-[#0f4c81]/25 border border-[#0f4c81]/20 px-2 py-0.5 text-[10px] font-bold text-[#0f4c81] dark:text-[#388bfd]">
              <Sparkles className="size-3" />
              Best Seller
            </span>
          )}
          {product.isGroupBuyingEligible && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
              <Users className="size-3" />
              Group Pool Available
            </span>
          )}
          {product.certifications.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md bg-[#eafaf1] dark:bg-[#16804d]/20 border border-[#16804d]/20 px-2 py-0.5 text-[10px] font-semibold text-[#16804d] dark:text-[#2ea043]">
              <Check className="size-3" />
              {product.certifications.slice(0, 2).join(" • ")}
            </span>
          )}
          <span className="text-[11px] font-semibold text-[#0f4c81] dark:text-[#388bfd]">
            {product.brand} ({product.modelNumber})
          </span>
          {product.packSize && (
            <span className="inline-flex items-center gap-1 rounded-md bg-[#faf9f8] dark:bg-[#21262d] border border-[#e8e6e3] dark:border-[#30363d] px-2 py-0.5 text-[10px] font-medium text-[#5d5854] dark:text-[#8b949e]">
              <Package className="size-3 text-[#77716b]" />
              {product.packSize}
            </span>
          )}
        </div>

        <h3
          id={`list-title-${product.id}`}
          onClick={() => onQuickView(product)}
          className="text-base font-bold text-[#171717] dark:text-[#f0f6fc] group-hover:text-[#0f4c81] dark:group-hover:text-[#388bfd] transition cursor-pointer"
        >
          {product.name}
        </h3>

        <p className="text-xs text-[#5d5854] dark:text-[#8b949e] line-clamp-2 max-w-2xl leading-relaxed">
          {product.shortDescription}
        </p>

        {/* Spec Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-[#77716b] dark:text-[#8b949e]">
          {Object.entries(product.keySpecs).slice(0, 3).map(([key, val]) => (
            <span key={key} className="rounded-md bg-[#faf9f8] dark:bg-[#0d1117] border border-[#e8e6e3] dark:border-[#30363d] px-2 py-0.5">
              <strong className="text-[#171717] dark:text-[#f0f6fc]">{key}:</strong> {val}
            </span>
          ))}
        </div>
      </div>

      {/* Middle: Supplier & Location */}
      <div className="lg:w-56 shrink-0 space-y-1.5 lg:border-l lg:border-[#e8e6e3] dark:lg:border-[#30363d] lg:pl-4">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#171717] dark:text-[#f0f6fc]">
          <Building2 className="size-3.5 text-[#0f4c81] dark:text-[#388bfd]" />
          <span className="truncate">{product.supplier.name}</span>
        </div>
        <div className="text-[11px] text-[#77716b] dark:text-[#8b949e]">
          {product.supplier.city}, {product.supplier.state}
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-[#16804d] dark:text-[#2ea043] font-semibold flex items-center gap-0.5">
            <ShieldCheck className="size-3" />
            {product.supplier.verifiedBadge}
          </span>
          <span>•</span>
          <span className="flex items-center gap-0.5 text-[#77716b] dark:text-[#8b949e]">
            <Clock className="size-3" />
            {product.supplier.responseTimeText}
          </span>
        </div>
      </div>

      {/* Right Price & Actions */}
      <div className="lg:w-60 shrink-0 flex flex-col items-start lg:items-end justify-between space-y-2 lg:border-l lg:border-[#e8e6e3] dark:lg:border-[#30363d] lg:pl-4">
        <div className="lg:text-right">
          <div className="flex items-baseline gap-2 lg:justify-end">
            <span className="text-lg font-extrabold text-[#171717] dark:text-[#f0f6fc]">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-[#9c958f] dark:text-[#6e7681] line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          <div className="text-[11px] text-[#77716b] dark:text-[#8b949e]">
            per {product.priceDisplayUnit}
          </div>
          {product.isGroupBuyingEligible && product.groupPrice && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <span>Group Pool: {formatPrice(product.groupPrice)}</span>
              {onJoinGroupPool && (
                <button
                  type="button"
                  onClick={() => onJoinGroupPool(product)}
                  className="text-[#0f4c81] dark:text-[#388bfd] hover:underline font-bold"
                >
                  (Join Pool →)
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <label className="flex items-center gap-1 text-[11px] font-medium text-[#77716b] dark:text-[#8b949e] hover:text-[#171717] dark:hover:text-white cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isCompared}
              onChange={() => onToggleCompare(product)}
              className="size-3.5 rounded text-[#0f4c81] accent-[#0f4c81]"
            />
            <span>Compare</span>
          </label>

          {onAddToQuickOrder && (
            <button
              type="button"
              onClick={() => onAddToQuickOrder(product)}
              title="Add to Quick Order Pad"
              aria-label={`Add ${product.name} to Quick Order Pad`}
              className="rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/60 text-amber-800 dark:text-amber-300 p-2 text-xs font-medium transition active:scale-95"
            >
              <Zap className="size-4 fill-current" />
            </button>
          )}

          <button
            type="button"
            onClick={() => onQuickView(product)}
            className="rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#21262d] text-[#5d5854] dark:text-[#f0f6fc] p-2 hover:bg-[#faf9f8] transition"
          >
            <Eye className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => onOpenRfq(product)}
            className="flex-1 lg:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0f4c81] dark:bg-[#388bfd] hover:bg-[#0c3c66] dark:hover:bg-[#2075e8] text-white py-2 px-4 text-xs font-bold transition active:scale-95"
          >
            <FileText className="size-3.5" />
            <span>Get Quote</span>
          </button>
        </div>
      </div>
    </article>
  );
}
