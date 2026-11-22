"use client";

import * as React from "react";
import {
  X,
  Plus,
  Trash2,
  Zap,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Calculator,
  Building2,
  Phone,
  Mail,
  MapPin,
  Package,
} from "lucide-react";
import { MARKETPLACE_PRODUCTS } from "../data";
import { MarketplaceProduct, QuickOrderItem } from "../types";

export interface QuickOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSession?: any;
  preselectedProduct?: MarketplaceProduct | null;
}

export function QuickOrderModal({
  isOpen,
  onClose,
  userSession,
  preselectedProduct,
}: QuickOrderModalProps) {
  // Pre-seed with 2-3 popular consumables
  const [items, setItems] = React.useState<QuickOrderItem[]>([
    {
      productId: "prod-con-01",
      productName: "mb+ K2 EDTA Non-Vacuum Blood Collection Tubes - PP 3ml (Pack of 100)",
      sku: "MB-EDTA-3ML",
      unitPrice: 177,
      quantity: 10,
      packSize: "Pack of 100",
    },
    {
      productId: "prod-con-02",
      productName: "IMDFLO 2ml Hypodermic Syringe with Needle - 18G (Pack of 100)",
      sku: "IMF-2ML-18G",
      unitPrice: 225,
      quantity: 20,
      packSize: "Pack of 100",
    },
  ]);

  const [selectedToAdd, setSelectedToAdd] = React.useState<string>(MARKETPLACE_PRODUCTS[0]?.id || "");
  const [hospitalName, setHospitalName] = React.useState("");
  const [buyerName, setBuyerName] = React.useState(userSession?.name || "");
  const [phone, setPhone] = React.useState("");
  const [pincode, setPincode] = React.useState("110001");
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [orderRef, setOrderRef] = React.useState("");

  React.useEffect(() => {
    if (isOpen) {
      setIsSubmitted(false);
      if (userSession?.name) setBuyerName(userSession.name);
    }
  }, [isOpen, userSession]);

  React.useEffect(() => {
    if (isOpen && preselectedProduct) {
      setSelectedToAdd(preselectedProduct.id);
      setItems((prev) => {
        const existingIdx = prev.findIndex((i) => i.productId === preselectedProduct.id);
        const incQty = preselectedProduct.minOrderQuantity || 1;
        if (existingIdx >= 0) {
          return prev.map((it, idx) =>
            idx === existingIdx ? { ...it, quantity: it.quantity + incQty } : it
          );
        }
        return [
          ...prev,
          {
            productId: preselectedProduct.id,
            productName: preselectedProduct.name,
            sku: preselectedProduct.modelNumber,
            unitPrice: preselectedProduct.price,
            quantity: preselectedProduct.minOrderQuantity || 1,
            packSize: preselectedProduct.packSize || preselectedProduct.priceDisplayUnit,
          },
        ];
      });
    }
  }, [isOpen, preselectedProduct]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    const prod = MARKETPLACE_PRODUCTS.find((p) => p.id === selectedToAdd);
    if (!prod) return;

    const existingIdx = items.findIndex((i) => i.productId === prod.id);
    const incQty = prod.minOrderQuantity || 1;
    if (existingIdx >= 0) {
      setItems((prev) =>
        prev.map((it, idx) => (idx === existingIdx ? { ...it, quantity: it.quantity + incQty } : it))
      );
    } else {
      setItems((prev) => [
        ...prev,
        {
          productId: prod.id,
          productName: prod.name,
          sku: prod.modelNumber,
          unitPrice: prod.price,
          quantity: prod.minOrderQuantity || 1,
          packSize: prod.packSize || prod.priceDisplayUnit,
        },
      ]);
    }
  };

  const handleRemoveItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateQuantity = (idx: number, qty: number) => {
    if (qty <= 0) return;
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, quantity: qty } : it))
    );
  };

  const subtotal = items.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
  const gstCredit = Math.round(subtotal * 0.12);
  const totalAmount = subtotal + gstCredit;

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderRef(`MGN-QO-${Math.floor(100000 + Math.random() * 900000)}`);
    setIsSubmitted(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-order-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 sm:p-7 shadow-2xl space-y-5 hide-scrollbar">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-[#77716b] hover:bg-[#faf9f8] dark:hover:bg-[#21262d] transition"
        >
          <X className="size-5" />
        </button>

        {!isSubmitted ? (
          <>
            {/* Header */}
            <div className="space-y-1 pr-6">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 text-[11px] font-bold text-[#0f4c81] dark:text-[#388bfd]">
                <Zap className="size-3.5 fill-current" />
                <span>Rapid Multi-SKU Procurement</span>
              </div>
              <h2 id="quick-order-title" className="text-xl font-bold text-[#171717] dark:text-[#f0f6fc]">
                Hospital Quick-Order & Bulk Quote Pad
              </h2>
              <p className="text-xs text-[#5d5854] dark:text-[#8b949e]">
                Add multiple consumable items, set lot quantities, and generate an instant consolidated institutional quotation with GST input credit calculation.
              </p>
            </div>

            {/* Quick Add Form Row */}
            <div className="rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-[#77716b] dark:text-[#8b949e] uppercase mb-1">
                  Select Product to Add
                </label>
                <select
                  value={selectedToAdd}
                  onChange={(e) => setSelectedToAdd(e.target.value)}
                  className="w-full rounded-lg border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] px-2.5 py-1.5 text-xs text-[#171717] dark:text-[#f0f6fc] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                >
                  {MARKETPLACE_PRODUCTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatPrice(p.price)} ({p.packSize || p.priceDisplayUnit})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="self-end sm:self-auto sm:mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#0f4c81] dark:bg-[#388bfd] text-white px-4 py-2 text-xs font-bold hover:bg-[#0c3c66] transition shrink-0"
              >
                <Plus className="size-3.5" />
                <span>Add to Pad</span>
              </button>
            </div>

            {/* Itemized Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#171717] dark:text-[#f0f6fc]">
                <div className="flex items-center gap-2">
                  <span>Order Items ({items.length})</span>
                  {items.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setItems([])}
                      className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <span className="text-[#77716b] text-[11px] font-normal">Pricing based on institutional tier</span>
              </div>

              {items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#ded8d1] dark:border-[#30363d] p-6 text-center text-xs text-[#77716b]">
                  Your quick order pad is empty. Select an item above to add.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {items.map((it, idx) => {
                    const prodMatch = MARKETPLACE_PRODUCTS.find((p) => p.id === it.productId);
                    return (
                    <div
                      key={it.productId + idx}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[#e8e6e3] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-2.5 text-xs"
                    >
                      {prodMatch?.imageUrl && (
                        <div className="size-10 rounded-lg overflow-hidden shrink-0 border border-[#e8e6e3] dark:border-[#30363d] bg-slate-50 dark:bg-[#0d1117]">
                          <img src={prodMatch.imageUrl} alt={it.productName} className="size-full object-cover" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-[#171717] dark:text-[#f0f6fc] truncate">
                          {it.productName}
                        </p>
                        <p className="text-[10px] text-[#77716b] dark:text-[#8b949e]">
                          SKU: {it.sku} • {formatPrice(it.unitPrice)} / {it.packSize || "unit"}
                        </p>
                      </div>

                      {/* Quantity input */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center rounded-lg border border-[#ded8d1] dark:border-[#30363d] overflow-hidden">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(idx, it.quantity - 1)}
                            className="px-2 py-1 bg-[#faf9f8] dark:bg-[#21262d] font-bold text-xs"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={it.quantity}
                            onChange={(e) => handleUpdateQuantity(idx, parseInt(e.target.value) || 1)}
                            className="w-12 text-center text-xs font-bold bg-transparent focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(idx, it.quantity + 1)}
                            className="px-2 py-1 bg-[#faf9f8] dark:bg-[#21262d] font-bold text-xs"
                          >
                            +
                          </button>
                        </div>

                        <span className="w-20 text-right font-mono font-bold text-[#171717] dark:text-[#f0f6fc]">
                          {formatPrice(it.unitPrice * it.quantity)}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          aria-label="Remove item"
                          className="text-[#77716b] hover:text-red-500 transition p-1"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                </div>
              )}
            </div>

            {/* Calculations Box */}
            <div className="rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] p-3.5 space-y-2 text-xs">
              <div className="flex justify-between text-[#77716b] dark:text-[#8b949e]">
                <span>Item Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)} total units/packs):</span>
                <span className="font-mono font-semibold text-[#171717] dark:text-[#f0f6fc]">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#77716b] dark:text-[#8b949e]">
                <span>Estimated GST 12% (100% Eligible for ITC Input Tax Credit):</span>
                <span className="font-mono font-semibold text-[#171717] dark:text-[#f0f6fc]">{formatPrice(gstCredit)}</span>
              </div>
              <div className="h-px bg-[#ded8d1] dark:bg-[#30363d]" />
              <div className="flex justify-between text-sm font-bold text-[#0f4c81] dark:text-[#388bfd]">
                <span>Total Estimated Quotation:</span>
                <span className="font-mono">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            {/* Hospital Checkout Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-[#77716b] dark:text-[#8b949e] mb-1">
                    Hospital / Institutional Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fortis Memorial / Metro Hospital"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#0d1117] px-3 py-2 text-xs text-[#171717] dark:text-[#f0f6fc] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#77716b] dark:text-[#8b949e] mb-1">
                    Authorized Buyer / Doctor Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. K. Verma (Purchase Head)"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#0d1117] px-3 py-2 text-xs text-[#171717] dark:text-[#f0f6fc] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#77716b] dark:text-[#8b949e] mb-1">
                    Contact Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98111 22334"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#0d1117] px-3 py-2 text-xs text-[#171717] dark:text-[#f0f6fc] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#77716b] dark:text-[#8b949e] mb-1">
                    Delivery Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 110001 or 400001"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#0d1117] px-3 py-2 text-xs text-[#171717] dark:text-[#f0f6fc] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-[#ded8d1] dark:border-[#30363d] px-4 py-2 text-xs font-semibold hover:bg-[#faf9f8] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={items.length === 0}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0f4c81] dark:bg-[#388bfd] text-white px-5 py-2.5 text-xs font-bold hover:bg-[#0c3c66] transition disabled:opacity-50"
                >
                  <FileText className="size-4" />
                  <span>Request Combined Institutional Quote</span>
                </button>
              </div>
            </form>
          </>
        ) : (
          /* Success Screen */
          <div className="py-6 text-center space-y-4">
            <div className="size-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="size-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">
                Consolidated Quotation Generated!
              </h3>
              <p className="text-xs text-[#5d5854] dark:text-[#8b949e] max-w-sm mx-auto">
                Reference ID: <span className="font-mono font-bold text-[#171717] dark:text-white">{orderRef}</span>
              </p>
              <p className="text-xs text-[#5d5854] dark:text-[#8b949e]">
                We have transmitted your multi-SKU purchase order to verified authorized suppliers serving pincode {pincode}. You will receive a stamped institutional quote with delivery timelines in under 2 hours.
              </p>
            </div>

            <div className="rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] p-3 text-xs text-left space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span>Items in Order:</span>
                <span>{items.length} Product Lines</span>
              </div>
              <div className="flex justify-between font-bold text-[#0f4c81] dark:text-[#388bfd]">
                <span>Estimated Quotation Value:</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-[#0f4c81] dark:bg-[#388bfd] text-white px-6 py-2.5 text-xs font-bold hover:bg-[#0c3c66] transition"
            >
              Done
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
