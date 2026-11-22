"use client";

import * as React from "react";
import {
  X,
  FileText,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Clock,
  HelpCircle,
} from "lucide-react";
import { MarketplaceProduct, RfqFormData, RfqSubmissionResult } from "../types";

interface RfqModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedProduct?: MarketplaceProduct | null;
  userSession?: {
    name?: string | null;
    email?: string | null;
  } | null;
}

export function RfqModal({
  isOpen,
  onClose,
  preselectedProduct,
  userSession,
}: RfqModalProps) {
  const [formData, setFormData] = React.useState<RfqFormData>({
    productId: preselectedProduct?.id,
    productName: preselectedProduct?.name || "",
    category: preselectedProduct?.categoryName || "ICU & Critical Care Equipment",
    quantity: preselectedProduct?.minOrderQuantity || 1,
    quantityUnit: "Units",
    urgency: "Within 15 Days",
    procurementType: "Hospital Purchase",
    destinationCity: preselectedProduct?.supplier.city || "New Delhi",
    pincode: "110001",
    hospitalName: "",
    buyerName: userSession?.name || "",
    buyerPhone: "",
    buyerEmail: userSession?.email || "",
    additionalNotes: "",
    requireFinancing: false,
    requireLiveDemo: true,
    requireAMC: true,
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submissionResult, setSubmissionResult] = React.useState<RfqSubmissionResult | null>(null);
  const [copiedRfq, setCopiedRfq] = React.useState(false);

  // Sync with preselected product when changed
  React.useEffect(() => {
    if (preselectedProduct) {
      setFormData((prev) => ({
        ...prev,
        productId: preselectedProduct.id,
        productName: preselectedProduct.name,
        category: preselectedProduct.categoryName,
        quantity: Math.max(prev.quantity, preselectedProduct.minOrderQuantity),
      }));
    }
  }, [preselectedProduct]);

  // Sync with user session
  React.useEffect(() => {
    if (userSession) {
      setFormData((prev) => ({
        ...prev,
        buyerName: prev.buyerName || userSession.name || "",
        buyerEmail: prev.buyerEmail || userSession.email || "",
      }));
    }
  }, [userSession]);

  // Escape key listener & body lock
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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate network submission and multi-supplier matching
    setTimeout(() => {
      const generatedId = `RFQ-MGN-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmissionResult({
        rfqId: generatedId,
        timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        matchedSuppliersCount: 4,
        status: "Broadcasting to Verified Suppliers",
        estimatedFirstQuoteHours: 2,
        summary: { ...formData },
      });
      setIsSubmitting(false);
    }, 700);
  };

  const handleCopyRfq = () => {
    if (submissionResult) {
      navigator.clipboard.writeText(submissionResult.rfqId);
      setCopiedRfq(true);
      setTimeout(() => setCopiedRfq(false), 2000);
    }
  };

  const resetAndClose = () => {
    setSubmissionResult(null);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rfq-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] text-[#171717] dark:text-[#f0f6fc] shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e8e6e3] dark:border-[#30363d] px-6 py-4 bg-[#faf9f8] dark:bg-[#0d1117]">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#0f4c81] text-white">
              <FileText className="size-5" />
            </div>
            <div>
              <h2 id="rfq-dialog-title" className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">
                Request for Quotation (RFQ)
              </h2>
              <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
                Receive competitive factory-direct quotes from verified hospital OEMs & suppliers
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            aria-label="Close RFQ dialog"
            className="rounded-lg p-1.5 text-[#77716b] hover:text-[#171717] hover:bg-[#e8e6e3] dark:hover:bg-[#21262d] dark:text-[#8b949e] dark:hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81]"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 text-xs">
          {submissionResult ? (
            /* Success Confirmation State */
            <div className="space-y-6 text-center py-4">
              <div className="flex size-14 items-center justify-center rounded-full bg-[#eafaf1] dark:bg-[#16804d]/25 text-[#16804d] dark:text-[#2ea043] mx-auto">
                <CheckCircle2 className="size-8 stroke-[2.5]" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-[#171717] dark:text-[#f0f6fc]">
                  RFQ Successfully Broadcasted!
                </h3>
                <p className="text-xs text-[#5d5854] dark:text-[#8b949e] max-w-md mx-auto">
                  Your procurement request has been routed to <strong>{submissionResult.matchedSuppliersCount} verified medical equipment manufacturers and authorized distributors</strong> in your region.
                </p>
              </div>

              {/* RFQ Reference Box */}
              <div className="rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] p-4 max-w-md mx-auto text-left space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#77716b] dark:text-[#8b949e]">RFQ Reference Code:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-sm text-[#0f4c81] dark:text-[#388bfd]">
                      {submissionResult.rfqId}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyRfq}
                      aria-label="Copy RFQ reference code"
                      className="p-1 rounded text-[#77716b] hover:text-[#171717] dark:hover:text-white"
                    >
                      {copiedRfq ? <Check className="size-3.5 text-[#16804d]" /> : <Copy className="size-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="text-[11px] space-y-1 pt-2 border-t border-[#e8e6e3] dark:border-[#30363d] text-[#5d5854] dark:text-[#8b949e]">
                  <div><strong>Equipment:</strong> {submissionResult.summary.productName}</div>
                  <div><strong>Quantity:</strong> {submissionResult.summary.quantity} {submissionResult.summary.quantityUnit}</div>
                  <div><strong>Delivery Location:</strong> {submissionResult.summary.destinationCity} ({submissionResult.summary.pincode})</div>
                  <div><strong>Expected First Quote:</strong> Within {submissionResult.estimatedFirstQuoteHours} hours via SMS & Email</div>
                </div>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="rounded-xl bg-[#0f4c81] dark:bg-[#388bfd] text-white px-6 py-2.5 text-xs font-bold shadow-xs hover:bg-[#0c3c66] dark:hover:bg-[#2075e8] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] dark:focus-visible:ring-[#388bfd] focus-visible:ring-offset-2"
                >
                  Done, Back to Catalog
                </button>
              </div>
            </div>
          ) : (
            /* RFQ Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Product Info Bar */}
              <div className="rounded-xl border border-[#0f4c81]/20 bg-[#eef5fc] dark:bg-[#0f4c81]/15 p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {preselectedProduct?.imageUrl && (
                    <div className="size-12 rounded-lg overflow-hidden shrink-0 border border-[#0f4c81]/20 bg-white dark:bg-[#161b22]">
                      <img src={preselectedProduct.imageUrl} alt={formData.productName} className="size-full object-cover" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0f4c81] dark:text-[#388bfd]">
                      Procuring Equipment
                    </span>
                    <div className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc] truncate">
                      {formData.productName || "General Equipment Requirement"}
                    </div>
                    <div className="text-[11px] text-[#5d5854] dark:text-[#8b949e]">
                      Category: {formData.category}
                    </div>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white dark:bg-[#161b22] px-2.5 py-1 text-[11px] font-semibold text-[#16804d] dark:text-[#2ea043] border border-[#16804d]/25">
                    <ShieldCheck className="size-3.5" />
                    Verified Suppliers
                  </span>
                </div>
              </div>

              {/* Two-column layout for Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Quantity and Unit */}
                <div className="space-y-1.5">
                  <label htmlFor="rfq-qty" className="font-semibold text-[#171717] dark:text-[#f0f6fc]">
                    Quantity Required <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="rfq-qty"
                      type="number"
                      min={1}
                      required
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                      className="w-28 rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] px-3 py-2 text-xs font-bold text-[#171717] dark:text-[#f0f6fc] focus:border-[#0f4c81] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81]"
                    />
                    <select
                      value={formData.quantityUnit}
                      onChange={(e) => setFormData({ ...formData, quantityUnit: e.target.value as RfqFormData["quantityUnit"] })}
                      className="flex-1 rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] px-3 py-2 text-xs text-[#171717] dark:text-[#f0f6fc] focus:border-[#0f4c81] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81]"
                    >
                      <option value="Units">Units</option>
                      <option value="Sets">Sets</option>
                      <option value="Hospital Package">Hospital Package</option>
                      <option value="Tender Lot">Tender Lot</option>
                    </select>
                  </div>
                </div>

                {/* Procurement Urgency */}
                <div className="space-y-1.5">
                  <label htmlFor="rfq-urgency" className="font-semibold text-[#171717] dark:text-[#f0f6fc]">
                    Requirement Urgency
                  </label>
                  <select
                    id="rfq-urgency"
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value as RfqFormData["urgency"] })}
                    className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] px-3 py-2 text-xs text-[#171717] dark:text-[#f0f6fc] focus:border-[#0f4c81] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81]"
                  >
                    <option value="Immediate (< 48 hrs)">Immediate (&lt; 48 hrs)</option>
                    <option value="Within 15 Days">Within 15 Days</option>
                    <option value="Within 30 Days">Within 30 Days</option>
                    <option value="Budgetary / Project Planning">Budgetary / Project Planning</option>
                  </select>
                </div>

                {/* Procurement Type */}
                <div className="space-y-1.5">
                  <label htmlFor="rfq-type" className="font-semibold text-[#171717] dark:text-[#f0f6fc]">
                    Procurement Purpose
                  </label>
                  <select
                    id="rfq-type"
                    value={formData.procurementType}
                    onChange={(e) => setFormData({ ...formData, procurementType: e.target.value as RfqFormData["procurementType"] })}
                    className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] px-3 py-2 text-xs text-[#171717] dark:text-[#f0f6fc] focus:border-[#0f4c81] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81]"
                  >
                    <option value="Hospital Purchase">Hospital Purchase</option>
                    <option value="Clinic / OPD Setup">Clinic / OPD Setup</option>
                    <option value="Diagnostic Lab">Diagnostic Lab</option>
                    <option value="Tender / Institutional">Tender / Institutional</option>
                    <option value="Replacement">Replacement Upgrade</option>
                  </select>
                </div>

                {/* Hospital / Organization Name */}
                <div className="space-y-1.5">
                  <label htmlFor="rfq-hospital" className="font-semibold text-[#171717] dark:text-[#f0f6fc]">
                    Hospital / Institution Name
                  </label>
                  <input
                    id="rfq-hospital"
                    type="text"
                    placeholder="e.g. Apollo / Fortis / City Healthcare Clinic"
                    value={formData.hospitalName}
                    onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                    className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] px-3 py-2 text-xs text-[#171717] dark:text-[#f0f6fc] focus:border-[#0f4c81] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81]"
                  />
                </div>

                {/* Delivery City */}
                <div className="space-y-1.5">
                  <label htmlFor="rfq-city" className="font-semibold text-[#171717] dark:text-[#f0f6fc]">
                    Delivery City <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="rfq-city"
                    type="text"
                    required
                    placeholder="e.g. New Delhi, Bengaluru, Mumbai"
                    value={formData.destinationCity}
                    onChange={(e) => setFormData({ ...formData, destinationCity: e.target.value })}
                    className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] px-3 py-2 text-xs text-[#171717] dark:text-[#f0f6fc] focus:border-[#0f4c81] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81]"
                  />
                </div>

                {/* Pincode */}
                <div className="space-y-1.5">
                  <label htmlFor="rfq-pincode" className="font-semibold text-[#171717] dark:text-[#f0f6fc]">
                    Delivery Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="rfq-pincode"
                    type="text"
                    required
                    maxLength={6}
                    placeholder="6-digit postal code"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] px-3 py-2 text-xs text-[#171717] dark:text-[#f0f6fc] focus:border-[#0f4c81] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81]"
                  />
                </div>

                {/* Buyer Name */}
                <div className="space-y-1.5">
                  <label htmlFor="rfq-name" className="font-semibold text-[#171717] dark:text-[#f0f6fc]">
                    Contact Person Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="rfq-name"
                    type="text"
                    required
                    placeholder="Dr. / Mr. / Ms."
                    value={formData.buyerName}
                    onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                    className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] px-3 py-2 text-xs text-[#171717] dark:text-[#f0f6fc] focus:border-[#0f4c81] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81]"
                  />
                </div>

                {/* Buyer Mobile Phone */}
                <div className="space-y-1.5">
                  <label htmlFor="rfq-phone" className="font-semibold text-[#171717] dark:text-[#f0f6fc]">
                    Mobile Number (Quotes via WhatsApp/SMS) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="rfq-phone"
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.buyerPhone}
                    onChange={(e) => setFormData({ ...formData, buyerPhone: e.target.value })}
                    className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] px-3 py-2 text-xs text-[#171717] dark:text-[#f0f6fc] focus:border-[#0f4c81] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81]"
                  />
                </div>
              </div>

              {/* Value-Added Preferences */}
              <div className="rounded-xl border border-[#e8e6e3] dark:border-[#30363d] p-3.5 space-y-2 bg-[#faf9f8] dark:bg-[#0d1117]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#77716b] dark:text-[#8b949e]">
                  Additional Procurement Services
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requireLiveDemo}
                      onChange={(e) => setFormData({ ...formData, requireLiveDemo: e.target.checked })}
                      className="size-3.5 rounded text-[#0f4c81] accent-[#0f4c81]"
                    />
                    <span className="text-xs text-[#171717] dark:text-[#f0f6fc]">Request On-Site Demo</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requireAMC}
                      onChange={(e) => setFormData({ ...formData, requireAMC: e.target.checked })}
                      className="size-3.5 rounded text-[#0f4c81] accent-[#0f4c81]"
                    />
                    <span className="text-xs text-[#171717] dark:text-[#f0f6fc]">Include AMC/CMC Quote</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requireFinancing}
                      onChange={(e) => setFormData({ ...formData, requireFinancing: e.target.checked })}
                      className="size-3.5 rounded text-[#0f4c81] accent-[#0f4c81]"
                    />
                    <span className="text-xs text-[#171717] dark:text-[#f0f6fc]">Equipment EMI / Leasing</span>
                  </label>
                </div>
              </div>

              {/* Specific Technical Notes */}
              <div className="space-y-1.5">
                <label htmlFor="rfq-notes" className="font-semibold text-[#171717] dark:text-[#f0f6fc]">
                  Special Technical Requirements / Hospital Notes
                </label>
                <textarea
                  id="rfq-notes"
                  rows={2}
                  placeholder="Specify probes required, battery backup needs, voltage requirements, or tender specification compliance..."
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                  className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] p-2.5 text-xs text-[#171717] dark:text-[#f0f6fc] focus:border-[#0f4c81] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81]"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#e8e6e3] dark:border-[#30363d]">
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="rounded-xl border border-[#ded8d1] dark:border-[#30363d] px-4 py-2 text-xs font-semibold text-[#5d5854] dark:text-[#8b949e] hover:bg-[#faf9f8] dark:hover:bg-[#21262d] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] dark:focus-visible:ring-[#388bfd]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0f4c81] dark:bg-[#388bfd] hover:bg-[#0c3c66] dark:hover:bg-[#2075e8] text-white px-6 py-2 text-xs font-bold shadow-xs transition active:scale-95 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] dark:focus-visible:ring-[#388bfd] focus-visible:ring-offset-2"
                >
                  {isSubmitting ? (
                    <span>Broadcasting RFQ...</span>
                  ) : (
                    <>
                      <Send className="size-3.5" />
                      <span>Submit & Broadcast RFQ</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}
