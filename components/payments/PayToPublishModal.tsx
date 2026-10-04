"use client";

// ============================================================
// MGN Pay-to-Publish Modal
// components/payments/PayToPublishModal.tsx
//
// Clean, minimal, baseline-ui aligned modal for checking quota,
// displaying 1st post free status, and handling Razorpay payments.
// ============================================================

import * as React from "react";
import {
  X,
  Sparkles,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { CreationCategory, CREATION_PRICING, getCategoryPricing } from "@/lib/pricing-config";

export interface PayToPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: CreationCategory;
  orgId?: string;
  onSuccess: (paymentOrderId?: string) => void;
  title?: string;
  description?: string;
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export function PayToPublishModal({
  isOpen,
  onClose,
  category,
  orgId,
  onSuccess,
  title,
  description,
}: PayToPublishModalProps) {
  const [loading, setLoading] = React.useState(true);
  const [quota, setQuota] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [paying, setPaying] = React.useState(false);
  const [sandboxOrder, setSandboxOrder] = React.useState<any>(null);

  const pricing = getCategoryPricing(category);

  // Fetch current quota status on open
  const fetchQuota = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    setSandboxOrder(null);
    try {
      const url = `/api/creation-quota/check?category=${encodeURIComponent(category)}${
        orgId ? `&orgId=${encodeURIComponent(orgId)}` : ""
      }`;
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to check quota");
      }
      setQuota(data);
    } catch (err: any) {
      setError(err.message || "Unable to check creation quota");
    } finally {
      setLoading(false);
    }
  }, [category, orgId]);

  React.useEffect(() => {
    if (isOpen) {
      fetchQuota();
    }
  }, [isOpen, fetchQuota]);

  // Load Razorpay script dynamically
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      if (window.Razorpay) return resolve(true);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Handle Pay via Razorpay or Sandbox
  const handleInitiatePayment = async () => {
    setPaying(true);
    setError(null);

    try {
      // 1. Create order on server
      const orderRes = await fetch("/api/creation-quota/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ category, orgId }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to initialize payment");
      }

      // 2. Check if in sandbox mode
      if (orderData.isSandbox) {
        setSandboxOrder(orderData);
        setPaying(false);
        return;
      }

      // 3. Live Razorpay mode
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay payment gateway");
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "MedGlobal Network",
        description: `Publish ${pricing?.name || "Creation"}`,
        order_id: orderData.orderId,
        theme: {
          color: "#1769c2",
        },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch("/api/creation-quota/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                orgId,
                category,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || "Payment verification failed");
            }

            onSuccess(response.razorpay_order_id);
            onClose();
          } catch (verErr: any) {
            setError(verErr.message || "Payment verification failed");
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err.message || "Payment process could not be completed");
      setPaying(false);
    }
  };

  // Simulate instant payment in Sandbox mode
  const handleSimulateSandboxPayment = async () => {
    if (!sandboxOrder?.orderId) return;
    setPaying(true);
    setError(null);

    try {
      const verifyRes = await fetch("/api/creation-quota/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          orderId: sandboxOrder.orderId,
          paymentId: `pay_sandbox_${Date.now()}`,
          signature: "sandbox_signature",
          orgId,
          category,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || "Sandbox verification failed");
      }

      onSuccess(sandboxOrder.orderId);
      onClose();
    } catch (err: any) {
      setError(err.message || "Sandbox verification failed");
    } finally {
      setPaying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#e8e6e3] transition-all"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-[#77716b] hover:bg-[#f5f4f3] hover:text-[#171717] transition focus-visible:ring-2 focus-visible:ring-[#1769c2] focus-visible:outline-none"
          aria-label="Close modal"
        >
          <X className="size-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 pr-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1769c2]">
              MGN Publishing Policy
            </span>
            {quota?.isFree ? (
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                1st Upload Free
              </span>
            ) : (
              <span className="rounded-full bg-[#eef5fc] px-2.5 py-0.5 text-[11px] font-bold text-[#1769c2] border border-[#d6e7f8]">
                Pay per Post
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-[#171717]">
            {title || pricing?.name || "Publish Creation"}
          </h3>
          <p className="text-xs text-[#77716b]">
            {description || pricing?.description || "Review publishing quota and terms."}
          </p>
        </div>

        {/* Modal Body */}
        <div className="mt-5 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <Loader2 className="size-7 animate-spin text-[#1769c2]" />
              <p className="text-xs font-medium text-[#77716b]">Checking category quota...</p>
            </div>
          ) : error ? (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 flex items-start gap-3">
              <AlertCircle className="size-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <p className="font-bold text-rose-900">Notice</p>
                <p className="text-rose-700">{error}</p>
                <button
                  type="button"
                  onClick={fetchQuota}
                  className="font-bold text-rose-800 underline hover:no-underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : quota?.isFree ? (
            /* 1st Post Free View */
            <div className="space-y-4">
              <div className="rounded-xl bg-emerald-50/80 border border-emerald-200 p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <Sparkles className="size-4 text-emerald-600 shrink-0" />
                  <span>Complimentary 1st Upload Available</span>
                </div>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  As part of the MedGlobal Network creator program, your <strong>1st upload</strong> in{" "}
                  <strong>{pricing?.name}</strong> is completely free of charge. Subsequent uploads
                  will be ₹{pricing?.priceINR} per post.
                </p>
              </div>

              <div className="rounded-xl bg-[#faf9f8] border border-[#e8e6e3] p-3 text-xs text-[#77716b] space-y-1">
                <div className="flex justify-between">
                  <span>Quota allocation:</span>
                  <span className="font-semibold text-[#171717]">1 Free Upload</span>
                </div>
                <div className="flex justify-between">
                  <span>Current used:</span>
                  <span className="font-semibold text-[#171717]">{quota.freeUsed} of 1</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount to pay today:</span>
                  <span className="font-bold text-emerald-700">₹0 (Free)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 px-4 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none transition active:scale-98"
              >
                <span>Proceed with Free Upload</span>
                <ArrowRight className="size-4" />
              </button>
            </div>
          ) : (
            /* 2nd+ Post Paid View */
            <div className="space-y-4">
              <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                  <AlertCircle className="size-3.5 text-amber-700 shrink-0" />
                  <span>Free Quota Exhausted</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  You have already used your 1 free upload for this category. To maintain verified
                  quality standards across the network, standard publication fee applies.
                </p>
              </div>

              {/* Price Breakdown Card */}
              <div className="rounded-xl border border-[#e8e6e3] bg-[#faf9f8] p-4 space-y-3">
                <div className="flex items-baseline justify-between border-b border-[#e8e6e3] pb-3">
                  <div>
                    <span className="text-xs font-semibold text-[#5d5854]">Publishing Fee</span>
                    <p className="text-[11px] text-[#77716b]">{pricing?.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-[#171717]">₹{pricing?.priceINR}</span>
                    <p className="text-[10px] text-[#77716b]">One-time per post</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] text-[#77716b]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-[#1769c2] shrink-0" />
                    <span>Instant publication upon successful verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-[#1769c2] shrink-0" />
                    <span>Supports UPI, Cards, Netbanking & Wallets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-3.5 text-emerald-600 shrink-0" />
                    <span>256-bit encrypted transaction secured by Razorpay</span>
                  </div>
                </div>
              </div>

              {/* Sandbox Alert if active */}
              {sandboxOrder && (
                <div className="rounded-xl bg-sky-50 border border-sky-200 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-900">Sandbox Test Mode Active</span>
                    <span className="text-[10px] font-mono bg-sky-100 text-sky-800 px-2 py-0.5 rounded">
                      DEV / TEST
                    </span>
                  </div>
                  <p className="text-[11px] text-sky-800">
                    No Razorpay API credentials are configured in this environment. You can simulate
                    a successful test transaction to verify the complete publication workflow.
                  </p>
                  <button
                    type="button"
                    onClick={handleSimulateSandboxPayment}
                    disabled={paying}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-sky-700 py-2 px-3 text-xs font-bold text-white hover:bg-sky-800 transition active:scale-98 disabled:opacity-50"
                  >
                    {paying ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        <span>Simulate Successful Test Payment</span>
                        <ArrowRight className="size-3.5" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              {!sandboxOrder && (
                <button
                  type="button"
                  onClick={handleInitiatePayment}
                  disabled={paying}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#1769c2] py-2.5 px-4 text-xs font-bold text-white shadow-xs hover:bg-[#12569f] focus-visible:ring-2 focus-visible:ring-[#1769c2] focus-visible:outline-none transition active:scale-98 disabled:opacity-60"
                >
                  {paying ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Opening Payment Gateway...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="size-4" />
                      <span>Pay ₹{pricing?.priceINR} & Publish</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer Guarantee */}
        <div className="mt-4 pt-3 border-t border-[#f0efee] flex items-center justify-between text-[10px] text-[#77716b]">
          <span>Protected by MGN Creator Integrity Guarantee</span>
          <span className="font-semibold text-[#171717]">Razorpay Verified</span>
        </div>
      </div>
    </div>
  );
}
