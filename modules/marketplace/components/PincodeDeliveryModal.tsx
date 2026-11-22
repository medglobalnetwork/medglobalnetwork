"use client";

import * as React from "react";
import {
  X,
  MapPin,
  CheckCircle2,
  Clock,
  Snowflake,
  Truck,
  ShieldCheck,
  Building2,
} from "lucide-react";

interface PincodeDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPincode: string;
  currentCity: string;
  onSelectPincode: (pincode: string, city: string) => void;
}

const PINCODE_LOOKUP: Record<string, { city: string; transitHours: string; coldChain: boolean; hub: string }> = {
  "110001": { city: "New Delhi", transitHours: "Within 24 Hours", coldChain: true, hub: "Delhi NCR Okhla Central Hub" },
  "400001": { city: "Mumbai South", transitHours: "Within 24 Hours", coldChain: true, hub: "Mumbai Andheri Marol Depot" },
  "400093": { city: "Mumbai Andheri East", transitHours: "Within 18 Hours", coldChain: true, hub: "Seepz Marol Fulfillment Center" },
  "560001": { city: "Bengaluru", transitHours: "Within 24-48 Hours", coldChain: true, hub: "Bengaluru Peenya Logistics Center" },
  "500001": { city: "Hyderabad", transitHours: "Within 24 Hours", coldChain: true, hub: "Hyderabad Sanathnagar Pharma Depot" },
  "600001": { city: "Chennai", transitHours: "Within 24-48 Hours", coldChain: true, hub: "Chennai Guindy Hub" },
  "700001": { city: "Kolkata", transitHours: "Within 48 Hours", coldChain: true, hub: "Kolkata Salt Lake Hub" },
  "411001": { city: "Pune", transitHours: "Within 24 Hours", coldChain: true, hub: "Pune Chakan Express Depot" },
};

export function PincodeDeliveryModal({
  isOpen,
  onClose,
  currentPincode,
  currentCity,
  onSelectPincode,
}: PincodeDeliveryModalProps) {
  const [inputPin, setInputPin] = React.useState(currentPincode);
  const [errorMsg, setErrorMsg] = React.useState("");

  React.useEffect(() => {
    if (isOpen) {
      setInputPin(currentPincode);
      setErrorMsg("");
    }
  }, [isOpen, currentPincode]);

  if (!isOpen) return null;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = inputPin.trim();
    if (!/^\d{6}$/.test(cleanPin)) {
      setErrorMsg("Please enter a valid 6-digit Indian PIN code.");
      return;
    }

    const matched = PINCODE_LOOKUP[cleanPin] || {
      city: `Pincode ${cleanPin}`,
      transitHours: "24-48 Hours",
      coldChain: true,
      hub: "National Express Medical Freight",
    };

    onSelectPincode(cleanPin, matched.city);
    onClose();
  };

  const activeHubInfo = PINCODE_LOOKUP[inputPin.trim()] || {
    city: currentCity,
    transitHours: "24-48 Hours",
    coldChain: true,
    hub: "Nearest Regional Medical Logistics Depot",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pincode-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 sm:p-6 shadow-2xl space-y-4">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-[#77716b] hover:bg-[#faf9f8] dark:hover:bg-[#21262d] transition"
        >
          <X className="size-5" />
        </button>

        <div className="space-y-1 pr-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 text-[11px] font-bold text-[#0f4c81] dark:text-[#388bfd]">
            <Truck className="size-3.5" />
            <span>Hospital Logistics & Cold-Chain</span>
          </div>
          <h2 id="pincode-modal-title" className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">
            Select Delivery Location & Check Transit
          </h2>
          <p className="text-xs text-[#5d5854] dark:text-[#8b949e]">
            Verify express cargo delivery, temperature-controlled transport, and local warehouse stocking.
          </p>
        </div>

        <form onSubmit={handleApply} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#171717] dark:text-[#f0f6fc] mb-1.5">
              Enter 6-Digit Indian Pincode
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-2.5 size-4 text-[#77716b]" />
                <input
                  type="text"
                  maxLength={6}
                  value={inputPin}
                  onChange={(e) => {
                    setInputPin(e.target.value);
                    setErrorMsg("");
                  }}
                  placeholder="e.g. 110001 or 400093"
                  className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#0d1117] pl-9 pr-3 py-2 text-xs font-mono font-bold text-[#171717] dark:text-[#f0f6fc] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-[#0f4c81] dark:bg-[#388bfd] text-white px-4 py-2 text-xs font-bold hover:bg-[#0c3c66] transition shrink-0"
              >
                Apply Pincode
              </button>
            </div>
            {errorMsg && <p className="text-[11px] text-red-500 mt-1">{errorMsg}</p>}
          </div>

          {/* Quick city presets */}
          <div>
            <p className="text-[10px] font-bold text-[#77716b] dark:text-[#8b949e] uppercase mb-1.5">
              Major Medical Supply Hubs
            </p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(PINCODE_LOOKUP).slice(0, 5).map(([pin, info]) => (
                <button
                  key={pin}
                  type="button"
                  onClick={() => {
                    setInputPin(pin);
                    onSelectPincode(pin, info.city);
                    onClose();
                  }}
                  className="rounded-lg border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#21262d] px-2 py-1 text-[11px] font-medium text-[#5d5854] dark:text-[#8b949e] hover:border-[#0f4c81] hover:text-[#0f4c81] transition"
                >
                  {info.city} ({pin})
                </button>
              ))}
            </div>
          </div>

          {/* Logistics Capabilities Status */}
          <div className="rounded-xl border border-[#e8e6e3] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] p-3 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
              <CheckCircle2 className="size-4" />
              <span>Express Delivery Available to {inputPin}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-[#5d5854] dark:text-[#8b949e]">
              <div className="flex items-center gap-1.5">
                <Clock className="size-3.5 text-[#0f4c81]" />
                <span>{activeHubInfo.transitHours}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Snowflake className="size-3.5 text-cyan-600" />
                <span>Active 2°C - 8°C Cold Chain</span>
              </div>
            </div>
            <p className="text-[10px] text-[#77716b] dark:text-[#8b949e] pt-1 border-t border-[#ded8d1] dark:border-[#30363d]">
              Dispatch Hub: {activeHubInfo.hub}
            </p>
          </div>
        </form>

      </div>
    </div>
  );
}
