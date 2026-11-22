"use client";

import * as React from "react";
import { X, Check, ShieldCheck, FileText, ArrowRight } from "lucide-react";
import { MarketplaceProduct } from "../types";

interface CompareModalProps {
  products: MarketplaceProduct[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveProduct: (productId: string) => void;
  onOpenRfq: (product: MarketplaceProduct) => void;
}

export function CompareModal({
  products,
  isOpen,
  onClose,
  onRemoveProduct,
  onOpenRfq,
}: CompareModalProps) {
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

  // Auto-close modal if user removes all items
  React.useEffect(() => {
    if (isOpen && products.length === 0) {
      onClose();
    }
  }, [isOpen, products.length, onClose]);

  if (!isOpen || products.length === 0) return null;

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Collect union of all spec keys
  const allSpecKeys = Array.from(
    new Set(products.flatMap((p) => Object.keys(p.keySpecs)))
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] text-[#171717] dark:text-[#f0f6fc] shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e8e6e3] dark:border-[#30363d] px-6 py-4 bg-[#faf9f8] dark:bg-[#0d1117]">
          <div>
            <h2 id="compare-modal-title" className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">
              Side-by-Side Equipment Comparison
            </h2>
            <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
              Comparing {products.length} selected medical devices
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close comparison modal"
            className="rounded-lg p-1.5 text-[#77716b] hover:text-[#171717] hover:bg-[#e8e6e3] dark:hover:bg-[#21262d] dark:text-[#8b949e] dark:hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81]"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Comparison Grid */}
        <div className="flex-1 overflow-x-auto overflow-y-auto px-6 py-6 text-xs">
          <table className="w-full border-collapse text-left min-w-[600px]">
            <thead>
              <tr className="border-b border-[#e8e6e3] dark:border-[#30363d]">
                <th className="py-3 px-4 font-bold text-[#77716b] dark:text-[#8b949e] w-48 bg-[#faf9f8] dark:bg-[#0d1117]">
                  Features & Parameters
                </th>
                {products.map((p) => (
                  <th key={p.id} className="py-3 px-4 align-top">
                    {p.imageUrl && (
                      <div className="h-24 w-full rounded-lg overflow-hidden bg-slate-50 dark:bg-[#0d1117] border border-[#e8e6e3] dark:border-[#30363d] mb-2.5">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="size-full object-cover object-center"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-[#0f4c81] dark:text-[#388bfd]">
                          {p.brand}
                        </span>
                        <div className="font-bold text-sm text-[#171717] dark:text-[#f0f6fc] line-clamp-2">
                          {p.name}
                        </div>
                        <div className="text-sm font-extrabold text-[#171717] dark:text-[#f0f6fc] mt-1">
                          {formatPrice(p.price)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveProduct(p.id)}
                        aria-label={`Remove ${p.name} from comparison`}
                        className="p-1 rounded-md text-[#77716b] hover:text-red-500 hover:bg-[#e8e6e3] dark:hover:bg-[#21262d]"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenRfq(p);
                      }}
                      className="mt-3 w-full rounded-xl bg-[#0f4c81] dark:bg-[#388bfd] text-white py-1.5 px-3 text-xs font-bold transition hover:bg-[#0c3c66]"
                    >
                      Get Quote
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e6e3] dark:divide-[#30363d]">
              <tr>
                <td className="py-2.5 px-4 font-semibold text-[#5d5854] dark:text-[#8b949e] bg-[#faf9f8] dark:bg-[#0d1117]">
                  Model Number
                </td>
                {products.map((p) => (
                  <td key={p.id} className="py-2.5 px-4 font-mono font-medium">
                    {p.modelNumber}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-[#5d5854] dark:text-[#8b949e] bg-[#faf9f8] dark:bg-[#0d1117]">
                  Min Order Quantity (MOQ)
                </td>
                {products.map((p) => (
                  <td key={p.id} className="py-2.5 px-4">
                    {p.minOrderQuantity} Unit
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-[#5d5854] dark:text-[#8b949e] bg-[#faf9f8] dark:bg-[#0d1117]">
                  Certifications
                </td>
                {products.map((p) => (
                  <td key={p.id} className="py-2.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {p.certifications.map((c) => (
                        <span key={c} className="rounded bg-[#eafaf1] dark:bg-[#16804d]/20 px-1.5 py-0.5 text-[10px] text-[#16804d] dark:text-[#2ea043] font-medium">
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-[#5d5854] dark:text-[#8b949e] bg-[#faf9f8] dark:bg-[#0d1117]">
                  OEM Warranty
                </td>
                {products.map((p) => (
                  <td key={p.id} className="py-2.5 px-4 font-medium">
                    {p.warrantyMonths} Months {p.amcAvailable ? "(AMC Eligible)" : ""}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-[#5d5854] dark:text-[#8b949e] bg-[#faf9f8] dark:bg-[#0d1117]">
                  Lead Time / Delivery
                </td>
                {products.map((p) => (
                  <td key={p.id} className="py-2.5 px-4">
                    {p.leadTimeDays} Business Days
                  </td>
                ))}
              </tr>

              {/* Dynamic specs comparison */}
              {allSpecKeys.map((key) => (
                <tr key={key}>
                  <td className="py-2.5 px-4 font-semibold text-[#5d5854] dark:text-[#8b949e] bg-[#faf9f8] dark:bg-[#0d1117]">
                    {key}
                  </td>
                  {products.map((p) => (
                    <td key={p.id} className="py-2.5 px-4 text-[#171717] dark:text-[#f0f6fc]">
                      {p.keySpecs[key] || "—"}
                    </td>
                  ))}
                </tr>
              ))}

              <tr>
                <td className="py-2.5 px-4 font-semibold text-[#5d5854] dark:text-[#8b949e] bg-[#faf9f8] dark:bg-[#0d1117]">
                  Verified Supplier
                </td>
                {products.map((p) => (
                  <td key={p.id} className="py-2.5 px-4">
                    <div className="font-bold text-[#171717] dark:text-[#f0f6fc]">{p.supplier.name}</div>
                    <div className="text-[11px] text-[#77716b] dark:text-[#8b949e]">{p.supplier.city} • Rating {p.supplier.rating}/5</div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
