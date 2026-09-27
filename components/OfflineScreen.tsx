"use client";

import * as React from "react";
import { WifiOff, RefreshCw } from "lucide-react";

export function OfflineScreen() {
  const [isOffline, setIsOffline] = React.useState<boolean>(false);
  const [isRetrying, setIsRetrying] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Initial check
    if (typeof window !== "undefined") {
      setIsOffline(!window.navigator.onLine);
    }

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    if (typeof window !== "undefined") {
      if (window.navigator.onLine) {
        setIsOffline(false);
        setIsRetrying(false);
      } else {
        setTimeout(() => {
          setIsRetrying(false);
        }, 1200);
      }
    }
  };

  if (!isOffline) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#faf9f8] dark:bg-[#0d1117] text-[#171717] dark:text-[#f0f6fc] px-4 py-8 overflow-y-auto animate-in fade-in duration-200">
      <div className="max-w-md sm:max-w-lg w-full text-center flex flex-col items-center space-y-6">
        {/* Responsive Offline Image */}
        <div className="w-full flex justify-center">
          {/* Mobile Image */}
          <img
            src="/404mob.png"
            alt="No Internet Connection"
            className="block sm:hidden max-h-64 xs:max-h-72 w-auto object-contain"
          />
          {/* Tablet & Desktop Image */}
          <img
            src="/404error.png"
            alt="No Internet Connection"
            className="hidden sm:block max-h-72 md:max-h-80 w-auto object-contain"
          />
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold">
            <WifiOff className="size-3.5" />
            <span>No Internet Connection</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#171717] dark:text-[#f0f6fc]">
            You're Currently Offline
          </h2>

          <p className="text-xs sm:text-sm text-[#77716b] dark:text-[#8b949e] max-w-sm mx-auto leading-relaxed">
            Please check your network connection or Wi-Fi settings. We will automatically reconnect once your connection is restored.
          </p>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleRetry}
          disabled={isRetrying}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f4c81] dark:bg-[#14559b] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#0c3c66] dark:hover:bg-[#0f4c81] transition cursor-pointer active:scale-98 disabled:opacity-60"
        >
          <RefreshCw className={`size-4 ${isRetrying ? "animate-spin" : ""}`} />
          <span>{isRetrying ? "Checking connection..." : "Retry Connection"}</span>
        </button>
      </div>
    </div>
  );
}
