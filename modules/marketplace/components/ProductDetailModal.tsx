"use client";

import * as React from "react";
import {
  X,
  ShieldCheck,
  Building2,
  Check,
  FileText,
  Star,
  Clock,
  Phone,
  Mail,
  Zap,
  Package,
  Layers,
  Sparkles,
} from "lucide-react";
import { MarketplaceProduct } from "../types";

export interface ProductDetailModalProps {
  product: MarketplaceProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenRfq: (product: MarketplaceProduct) => void;
  onJoinGroupPool?: (product: MarketplaceProduct) => void;
  onAddToQuickOrder?: (product: MarketplaceProduct) => void;
}

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onOpenRfq,
  onJoinGroupPool,
  onAddToQuickOrder,
}: ProductDetailModalProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="spec-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] text-[#171717] dark:text-[#f0f6fc] shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e8e6e3] dark:border-[#30363d] px-6 py-4 bg-[#faf9f8] dark:bg-[#0d1117]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#0f4c81] dark:text-[#388bfd]">
                {product.brand}
              </span>
              <span className="text-xs text-[#77716b] dark:text-[#8b949e] font-mono">
                {product.modelNumber}
              </span>
            </div>
            <h2 id="spec-modal-title" className="text-base sm:text-lg font-bold text-[#171717] dark:text-[#f0f6fc]">
              {product.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close product specification modal"
            className="rounded-lg p-1.5 text-[#77716b] hover:text-[#171717] hover:bg-[#e8e6e3] dark:hover:bg-[#21262d] dark:text-[#8b949e] dark:hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81]"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 text-xs">
          
          {/* Product Visual Showcase Banner */}
          <div className="relative rounded-2xl overflow-hidden border border-[#e8e6e3] dark:border-[#30363d] bg-slate-50 dark:bg-[#0d1117]">
            <div className="flex flex-col md:flex-row items-center gap-6 p-4 sm:p-5">
              {/* Main Product Image */}
              <div className="relative w-full md:w-64 h-56 shrink-0 rounded-xl overflow-hidden bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] shadow-2xs flex items-center justify-center">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="size-full object-cover object-center"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <Package className="size-12 text-[#0f4c81]/40" />
                )}
                {product.bestSeller && (
                  <div className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-md bg-[#0f4c81] text-white px-2 py-0.5 text-[10px] font-bold">
                    <Sparkles className="size-3" />
                    Best Seller
                  </div>
                )}
              </div>

              {/* Product Brief & Trust Attributes */}
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-md bg-[#eef5fc] dark:bg-[#0f4c81]/30 text-[#0f4c81] dark:text-[#388bfd] font-bold px-2 py-0.5 text-[10px]">
                    {product.brand}
                  </span>
                  <span className="rounded-md bg-slate-100 dark:bg-[#21262d] text-[#5d5854] dark:text-[#8b949e] font-mono px-2 py-0.5 text-[10px]">
                    Model: {product.modelNumber}
                  </span>
                  <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold px-2 py-0.5 text-[10px] border border-emerald-200 dark:border-emerald-800">
                    {product.condition}
                  </span>
                </div>

                <p className="text-xs text-[#5d5854] dark:text-[#8b949e] leading-relaxed">
                  {product.shortDescription}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 border-t border-[#e8e6e3] dark:border-[#30363d]">
                  <div className="space-y-0.5">
                    <div className="text-[10px] text-[#77716b] dark:text-[#8b949e]">Warranty</div>
                    <div className="font-bold text-[#171717] dark:text-[#f0f6fc]">{product.warrantyMonths} Months OEM</div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[10px] text-[#77716b] dark:text-[#8b949e]">Lead Time</div>
                    <div className="font-bold text-[#171717] dark:text-[#f0f6fc]">{product.leadTimeDays} Business Day{product.leadTimeDays > 1 ? "s" : ""}</div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[10px] text-[#77716b] dark:text-[#8b949e]">Certifications</div>
                    <div className="font-bold text-[#171717] dark:text-[#f0f6fc] truncate">{product.certifications.slice(0, 2).join(", ")}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Overview & Pricing Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-[#0f4c81]/20 bg-[#eef5fc] dark:bg-[#0f4c81]/15 p-4">
            <div>
              <div className="text-xs text-[#77716b] dark:text-[#8b949e]">Hospital Price:</div>
              <div className="text-2xl font-extrabold text-[#171717] dark:text-[#f0f6fc]">
                {formatPrice(product.price)}
                <span className="text-xs font-normal text-[#5d5854] dark:text-[#8b949e] ml-1.5">
                  / {product.priceDisplayUnit}
                </span>
              </div>
              <div className="text-[11px] text-[#16804d] dark:text-[#2ea043] font-semibold mt-0.5">
                MOQ: {product.minOrderQuantity} Unit • In Stock ({product.stockCount} units available)
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRfq(product);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f4c81] dark:bg-[#388bfd] hover:bg-[#0c3c66] dark:hover:bg-[#2075e8] text-white px-4 py-2.5 text-xs font-bold shadow-xs transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] dark:focus-visible:ring-[#388bfd] focus-visible:ring-offset-2"
              >
                <FileText className="size-4" />
                <span>Request Quote / RFQ</span>
              </button>

              {onAddToQuickOrder && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onAddToQuickOrder(product);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/70 px-3.5 py-2.5 text-xs font-bold transition active:scale-95"
                >
                  <Zap className="size-3.5 fill-current" />
                  <span>Quick Order</span>
                </button>
              )}
            </div>
          </div>

          {/* Group Buying Pool Banner */}
          {product.isGroupBuyingEligible && product.groupPrice && (
            <div className="rounded-xl border border-amber-300/60 dark:border-amber-700/60 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-300">
                  <Sparkles className="size-3.5" />
                  <span>National Group Procurement Pool Active</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-extrabold text-[#171717] dark:text-[#f0f6fc]">
                    Group Price: {formatPrice(product.groupPrice)}
                  </span>
                  <span className="text-xs text-[#16804d] dark:text-[#2ea043] font-bold">
                    Save {product.groupDiscountPercent || 10}%
                  </span>
                </div>
                <p className="text-[11px] text-[#5d5854] dark:text-[#8b949e]">
                  Join {product.groupInterestedCount || 10}+ healthcare institutions to unlock wholesale tier pricing. Zero upfront payment.
                </p>
              </div>

              {onJoinGroupPool && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onJoinGroupPool(product);
                  }}
                  className="shrink-0 rounded-xl bg-[#0f4c81] dark:bg-[#388bfd] text-white hover:bg-[#0c3c66] px-4 py-2 text-xs font-bold transition active:scale-95 whitespace-nowrap shadow-xs"
                >
                  Join Buying Pool →
                </button>
              )}
            </div>
          )}

          {/* Clinical Description */}
          <section className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#77716b] dark:text-[#8b949e]">
              Clinical Overview
            </h3>
            <p className="text-xs text-[#5d5854] dark:text-[#8b949e] leading-relaxed">
              {product.fullDescription}
            </p>
          </section>

          {/* Technical Specifications Table */}
          <section className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#77716b] dark:text-[#8b949e]">
              Detailed Technical Specifications
            </h3>
            <div className="rounded-xl border border-[#e8e6e3] dark:border-[#30363d] overflow-hidden">
              <table className="w-full text-left text-xs">
                <tbody>
                  {Object.entries(product.keySpecs).map(([specName, specVal], idx) => (
                    <tr
                      key={specName}
                      className={idx % 2 === 0 ? "bg-white dark:bg-[#161b22]" : "bg-[#faf9f8] dark:bg-[#0d1117]"}
                    >
                      <td className="px-4 py-2.5 font-semibold text-[#5d5854] dark:text-[#8b949e] w-2/5 border-b border-[#e8e6e3] dark:border-[#30363d]">
                        {specName}
                      </td>
                      <td className="px-4 py-2.5 text-[#171717] dark:text-[#f0f6fc] border-b border-[#e8e6e3] dark:border-[#30363d]">
                        {specVal}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-white dark:bg-[#161b22]">
                    <td className="px-4 py-2.5 font-semibold text-[#5d5854] dark:text-[#8b949e] border-b border-[#e8e6e3] dark:border-[#30363d]">
                      Power & Voltage
                    </td>
                    <td className="px-4 py-2.5 text-[#171717] dark:text-[#f0f6fc] border-b border-[#e8e6e3] dark:border-[#30363d]">
                      {product.powerRequirements}
                    </td>
                  </tr>
                  <tr className="bg-[#faf9f8] dark:bg-[#0d1117]">
                    <td className="px-4 py-2.5 font-semibold text-[#5d5854] dark:text-[#8b949e]">
                      Dimensions & Weight
                    </td>
                    <td className="px-4 py-2.5 text-[#171717] dark:text-[#f0f6fc]">
                      {product.dimensionsWeight}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Standard Included Accessories */}
          <section className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#77716b] dark:text-[#8b949e] flex items-center gap-1.5">
              <Package className="size-3.5 text-[#0f4c81] dark:text-[#388bfd]" />
              Standard Package Accessories Included
            </h3>
            <ul className="rounded-xl border border-[#e8e6e3] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] p-3 space-y-1.5 text-xs text-[#5d5854] dark:text-[#8b949e]">
              {product.standardAccessories.map((acc, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="size-3.5 text-[#16804d] dark:text-[#2ea043] shrink-0 mt-0.5" />
                  <span>{acc}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Regulatory Compliance & Certifications */}
          <section className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#77716b] dark:text-[#8b949e]">
              Certifications & Standards Compliance
            </h3>
            <div className="flex flex-wrap gap-2">
              {product.certifications.map((cert) => (
                <span
                  key={cert}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#16804d]/30 bg-[#eafaf1] dark:bg-[#16804d]/20 px-3 py-1.5 text-xs font-semibold text-[#16804d] dark:text-[#2ea043]"
                >
                  <ShieldCheck className="size-3.5" />
                  {cert}
                </span>
              ))}
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#21262d] px-3 py-1.5 text-xs text-[#5d5854] dark:text-[#8b949e]">
                {product.warrantyMonths} Months OEM Warranty
              </span>
              {product.amcAvailable && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#21262d] px-3 py-1.5 text-xs text-[#5d5854] dark:text-[#8b949e]">
                  AMC / CMC Available
                </span>
              )}
            </div>
          </section>

          {/* Verified Supplier Dossier */}
          <section className="space-y-2 pt-2 border-t border-[#e8e6e3] dark:border-[#30363d]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#77716b] dark:text-[#8b949e]">
              Verified Supplier Dossier
            </h3>
            <div className="rounded-xl border border-[#ded8d1] dark:border-[#30363d] p-4 bg-white dark:bg-[#161b22] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#171717] dark:text-[#f0f6fc]">
                      {product.supplier.name}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#eafaf1] dark:bg-[#16804d]/20 px-2 py-0.5 text-[10px] font-bold text-[#16804d] dark:text-[#2ea043]">
                      <ShieldCheck className="size-3" />
                      {product.supplier.verifiedBadge}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#77716b] dark:text-[#8b949e] mt-0.5">
                    {product.supplier.companyType} • Established {product.supplier.establishedYear} • {product.supplier.city}, {product.supplier.state}
                  </div>
                </div>

                <div className="text-right text-[11px] text-[#77716b] dark:text-[#8b949e]">
                  <div>Hospital Clients: <strong className="text-[#171717] dark:text-[#f0f6fc]">{product.supplier.hospitalClientsServed}+</strong></div>
                  <div>Avg Response: <strong className="text-[#16804d] dark:text-[#2ea043]">{product.supplier.responseTimeText}</strong></div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#e8e6e3] dark:border-[#30363d] text-[11px] text-[#5d5854] dark:text-[#8b949e] font-mono">
                <div>GST: {product.supplier.gstNumber}</div>
                <div>CDSCO Lic: {product.supplier.cdscoRegistration}</div>
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="border-t border-[#e8e6e3] dark:border-[#30363d] px-6 py-3.5 bg-[#faf9f8] dark:bg-[#0d1117] flex items-center justify-between">
          <div className="text-xs text-[#77716b] dark:text-[#8b949e]">
            Delivery: Standard 2-4 business days with on-site installation
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenRfq(product);
            }}
            className="rounded-xl bg-[#0f4c81] dark:bg-[#388bfd] hover:bg-[#0c3c66] dark:hover:bg-[#2075e8] text-white px-5 py-2 text-xs font-bold transition"
          >
            Get Price Quote
          </button>
        </div>

      </div>
    </div>
  );
}
