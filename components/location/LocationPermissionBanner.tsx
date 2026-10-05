"use client";

// ============================================================
// MGN Location Permission Banner
// components/location/LocationPermissionBanner.tsx
//
// Friendly, non-intrusive prompt that enables users to activate
// GPS tracking or manually choose their city for nearby suggestions.
// ============================================================

import * as React from "react";
import { MapPin, Navigation, Compass, X } from "lucide-react";
import { CitySelectorModal } from "./CitySelectorModal";
import { CityLocation } from "@/lib/geo";

interface LocationPermissionBannerProps {
  onEnableGps: () => void;
  onSelectCity: (city: CityLocation) => void;
  isLoading?: boolean;
}

export function LocationPermissionBanner({
  onEnableGps,
  onSelectCity,
  isLoading,
}: LocationPermissionBannerProps) {
  const [isDismissed, setIsDismissed] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  React.useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem("mgn_loc_banner_dismissed");
      if (dismissed) setIsDismissed(true);
    } catch {}
  }, []);

  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem("mgn_loc_banner_dismissed", "1");
    } catch {}
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white dark:from-[#0d1e33] dark:via-[#0b1626] dark:to-[#0d1117] p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#0f4c81] text-white shadow-xs">
              <Navigation className="size-4.5 animate-pulse" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs sm:text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">
                Personalize with Your Location
              </h4>
              <p className="text-xs text-[#5d5854] dark:text-[#8b949e] max-w-lg leading-relaxed">
                Enable GPS to discover verified doctors, free health camps, CME seminars, and hospital vacancies near you.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={onEnableGps}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#0c3c66] transition active:scale-95 disabled:opacity-50"
            >
              <Navigation className="size-3.5" />
              {isLoading ? "Detecting..." : "Enable GPS"}
            </button>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] px-3 py-1.5 text-xs font-semibold text-[#171717] dark:text-[#f0f6fc] hover:bg-[#f8f7f6] dark:hover:bg-[#21262d] transition"
            >
              <MapPin className="size-3.5 text-[#0f4c81]" />
              Select City
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss banner"
              className="rounded-lg p-1 text-[#77716b] hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <CitySelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectCity={onSelectCity}
      />
    </>
  );
}

