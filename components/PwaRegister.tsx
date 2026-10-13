"use client";

import * as React from "react";
import { PwaInstallPrompt } from "@/components/pwa/PwaInstallPrompt";

export function PwaRegister() {
  React.useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const registerWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        // Check for updates periodically (every 60 mins)
        setInterval(() => {
          registration.update().catch(() => {});
        }, 60 * 60 * 1000);

        // Detect new Service Worker waiting
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                // New update available, activate it immediately
                newWorker.postMessage({ action: "skipWaiting" });
              }
            });
          }
        });
      } catch (err) {
        console.warn("[MGN-PWA] Service Worker registration failed:", err);
      }
    };

    if (document.readyState === "complete") {
      registerWorker();
    } else {
      window.addEventListener("load", registerWorker);
      return () => window.removeEventListener("load", registerWorker);
    }
  }, []);

  // Clear app badge on window focus
  React.useEffect(() => {
    if (typeof window === "undefined" || !("clearAppBadge" in navigator)) return;
    const handleFocus = () => {
      (navigator as unknown as { clearAppBadge: () => Promise<void> }).clearAppBadge().catch(() => {});
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  return <PwaInstallPrompt />;
}
