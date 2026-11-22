"use client";

import * as React from "react";
import {
  X,
  Users,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Bell,
  Building2,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { MarketplaceProduct } from "../types";

interface GroupBuyingInterestModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: MarketplaceProduct | null;
}

export function GroupBuyingInterestModal({
  isOpen,
  onClose,
  product,
}: GroupBuyingInterestModalProps) {
  const [quantity, setQuantity] = React.useState(5);
  const [hospitalName, setHospitalName] = React.useState("");
  const [buyerName, setBuyerName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [pincode, setPincode] = React.useState("110001");
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsSubmitted(false);
      setQuantity(5);
    }
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const groupPrice = product.groupPrice || Math.round(product.price * 0.92);
  const singlePrice = product.price;
  const unitSavings = singlePrice - groupPrice;
  const totalSavings = unitSavings * quantity;
  const totalGroupCost = groupPrice * quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

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
      aria-labelledby="group-buy-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-2xl space-y-5">
        
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
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                <Users className="size-3.5" />
                <span>Hospital Group Buying Pool</span>
              </div>
              <h2 id="group-buy-title" className="text-lg font-bold text-[#171717] dark:text-[#f0f6fc]">
                Join Procurement Pool for Bulk Discount
              </h2>
              <p className="text-xs text-[#5d5854] dark:text-[#8b949e]">
                No upfront payment required. Register your institutional interest to lock in the volume price tier.
              </p>
            </div>

            {/* Product Summary Box */}
            <div className="rounded-xl border border-[#e8e6e3] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] p-3.5 space-y-2.5">
              <div className="flex items-center gap-3">
                {product.imageUrl && (
                  <div className="size-14 rounded-lg overflow-hidden shrink-0 border border-[#e8e6e3] dark:border-[#30363d] bg-white dark:bg-[#161b22]">
                    <img src={product.imageUrl} alt={product.name} className="size-full object-cover" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc] line-clamp-1">
                    {product.name}
                  </p>
                  <p className="text-[11px] text-[#77716b] dark:text-[#8b949e]">
                    {product.brand} • {product.packSize || product.priceDisplayUnit}
                  </p>
                </div>
                <span className="rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-[10px] px-2 py-0.5 whitespace-nowrap shrink-0">
                  Save {product.groupDiscountPercent || 8}%
                </span>
              </div>

              {/* Price comparison */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#e8e6e3] dark:border-[#30363d] text-center">
                <div className="rounded-lg bg-white dark:bg-[#161b22] p-2 border border-[#ded8d1] dark:border-[#30363d]">
                  <p className="text-[10px] text-[#77716b] dark:text-[#8b949e]">Individual Price</p>
                  <p className="text-xs font-semibold text-[#5d5854] dark:text-[#8b949e] line-through">
                    {formatPrice(singlePrice)}
                  </p>
                </div>
                <div className="rounded-lg bg-[#eef5fc] dark:bg-[#0f4c81]/25 p-2 border border-[#0f4c81]/30">
                  <p className="text-[10px] font-bold text-[#0f4c81] dark:text-[#388bfd]">Pool Group Price</p>
                  <p className="text-sm font-black text-[#0f4c81] dark:text-[#388bfd]">
                    {formatPrice(groupPrice)}
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Quantity Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#171717] dark:text-[#f0f6fc] mb-1.5">
                  Desired Institutional Quantity ({product.packSize || "Packs / Units"})
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-xl border border-[#ded8d1] dark:border-[#30363d] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-1.5 text-sm font-bold bg-[#faf9f8] dark:bg-[#21262d] hover:bg-[#e8e6e3] transition"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-xs font-mono font-bold text-[#171717] dark:text-[#f0f6fc]">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="px-3 py-1.5 text-sm font-bold bg-[#faf9f8] dark:bg-[#21262d] hover:bg-[#e8e6e3] transition"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                    Total Estimated Savings: {formatPrice(totalSavings)}
                  </div>
                </div>
              </div>

              {/* Hospital & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-[#77716b] dark:text-[#8b949e] mb-1">
                    Hospital / Clinic Name *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-2.5 top-2.5 size-3.5 text-[#77716b]" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apollo / City Clinic"
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                      className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#0d1117] pl-8 pr-3 py-2 text-xs text-[#171717] dark:text-[#f0f6fc] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#77716b] dark:text-[#8b949e] mb-1">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Sharma / Purchase Head"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#0d1117] px-3 py-2 text-xs text-[#171717] dark:text-[#f0f6fc] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#77716b] dark:text-[#8b949e] mb-1">
                    Mobile Number (for WhatsApp Alert) *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-2.5 size-3.5 text-[#77716b]" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#0d1117] pl-8 pr-3 py-2 text-xs text-[#171717] dark:text-[#f0f6fc] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#77716b] dark:text-[#8b949e] mb-1">
                    Delivery Pincode *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-2.5 top-2.5 size-3.5 text-[#77716b]" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="e.g. 400093 or 110001"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#0d1117] pl-8 pr-3 py-2 text-xs text-[#171717] dark:text-[#f0f6fc] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f4c81] dark:bg-[#388bfd] hover:bg-[#0c3c66] text-white py-2.5 px-4 text-xs font-bold shadow-md transition active:scale-98"
                >
                  <Bell className="size-4" />
                  <span>Confirm Interest & Lock Pool Price ({formatPrice(totalGroupCost)})</span>
                </button>
                <p className="text-[10px] text-center text-[#77716b] dark:text-[#8b949e] mt-2">
                  Zero payment needed now. You will receive an SMS/WhatsApp verification when target pool threshold is achieved.
                </p>
              </div>
            </form>
          </>
        ) : (
          /* Confirmation State */
          <div className="py-6 text-center space-y-4">
            <div className="size-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="size-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">
                You've Successfully Joined the Pool!
              </h3>
              <p className="text-xs text-[#5d5854] dark:text-[#8b949e] max-w-sm mx-auto">
                We've locked your allocation of <span className="font-bold text-[#171717] dark:text-white">{quantity} {product.packSize || "units"}</span> for {hospitalName || "your institution"} at the wholesale rate of {formatPrice(groupPrice)}/unit.
              </p>
            </div>

            <div className="rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] p-3 text-xs text-left space-y-1">
              <div className="flex justify-between text-[#77716b] dark:text-[#8b949e]">
                <span>Pledge Reference:</span>
                <span className="font-mono font-bold text-[#171717] dark:text-[#f0f6fc]">MGN-POOL-{Math.floor(100000 + Math.random() * 900000)}</span>
              </div>
              <div className="flex justify-between text-[#77716b] dark:text-[#8b949e]">
                <span>Notification Contact:</span>
                <span className="font-semibold text-[#171717] dark:text-[#f0f6fc]">{phone || "+91 Contact Verified"}</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                <span>Total Expected Savings:</span>
                <span>{formatPrice(totalSavings)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-[#0f4c81] dark:bg-[#388bfd] text-white px-6 py-2.5 text-xs font-bold hover:bg-[#0c3c66] transition"
            >
              Back to Marketplace
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
