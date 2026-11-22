"use client";

import * as React from "react";
import { Download, X, Share2, PlusSquare, Smartphone, CheckCircle } from "lucide-react";
import { isPwaInstalled, getDevicePlatform } from "@/lib/pwa-permissions";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = React.useState(false);
  const [isInstalled, setIsInstalled] = React.useState(false);
  const [isDismissed, setIsDismissed] = React.useState(true);
  const [showIosGuide, setShowIosGuide] = React.useState(false);
  const [platform, setPlatform] = React.useState<"ios" | "android" | "desktop" | "other">("desktop");

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect if already installed as standalone PWA
    const installed = isPwaInstalled();
    setIsInstalled(installed);
    const plat = getDevicePlatform();
    setPlatform(plat);

    // Check if dismissed recently (within 5 days)
    const dismissedAt = localStorage.getItem("mgn_pwa_dismissed");
    if (dismissedAt) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 5) {
        setIsDismissed(true);
      } else {
        setIsDismissed(false);
      }
    } else {
      setIsDismissed(false);
    }

    // Capture standard PWA install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      // If not dismissed, reveal prompt
      if (!localStorage.getItem("mgn_pwa_dismissed")) {
        setIsDismissed(false);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      setIsDismissed(true);
      try {
        localStorage.setItem("mgn_pwa_installed", "true");
      } catch {}
    };

    // Custom event to allow invoking install prompt from Settings or Navbar
    const handleTriggerInstall = () => {
      if (plat === "ios") {
        setShowIosGuide(true);
      } else if (deferredPrompt) {
        deferredPrompt.prompt().then(() => {
          return deferredPrompt.userChoice;
        }).then((choice) => {
          if (choice.outcome === "accepted") {
            setIsInstalled(true);
          }
          setDeferredPrompt(null);
        }).catch(() => {});
      } else {
        // Fallback for browsers without beforeinstallprompt
        setIsDismissed(false);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("mgn-trigger-install", handleTriggerInstall);

    // On iOS Safari, if not installed and not dismissed, show install opportunity
    if (plat === "ios" && !installed && !dismissedAt) {
      setIsInstallable(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("mgn-trigger-install", handleTriggerInstall);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (platform === "ios") {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) {
      alert("To install MGN, tap your browser's menu (⋮) and select 'Install App' or 'Add to Home screen'.");
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsInstalled(true);
        setIsDismissed(true);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.warn("Installation prompt rejected:", err);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem("mgn_pwa_dismissed", Date.now().toString());
    } catch {}
  };

  // If already installed or explicitly dismissed, don't show the bottom banner
  if (isInstalled || isDismissed) {
    return (
      <>
        {showIosGuide && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="max-w-sm w-full bg-white dark:bg-[#161b22] border border-[#e5e0d8] dark:border-[#30363d] rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-10 rounded-xl bg-[#0f4c81]/10 dark:bg-[#0f4c81]/20 flex items-center justify-center text-[#0f4c81] dark:text-[#58a6ff]">
                    <Smartphone className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">Install on iOS</h3>
                    <p className="text-xs text-[#77716b] dark:text-[#8b949e]">Add MGN to your Home Screen</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIosGuide(false)}
                  className="p-1 rounded-lg text-[#77716b] hover:text-[#171717] dark:hover:text-[#f0f6fc] transition"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-[#5d5854] dark:text-[#8b949e] border-y border-[#e5e0d8] dark:border-[#30363d] py-3">
                <div className="flex items-start gap-2.5">
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#0f4c81] text-[10px] font-bold text-white">
                    1
                  </div>
                  <p>
                    Tap the <strong>Share</strong> button <Share2 className="inline size-3.5 text-[#0f4c81]" /> at the bottom of Safari.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#0f4c81] text-[10px] font-bold text-white">
                    2
                  </div>
                  <p>
                    Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare className="inline size-3.5 text-[#0f4c81]" />.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#0f4c81] text-[10px] font-bold text-white">
                    3
                  </div>
                  <p>
                    Tap <strong>Add</strong> in the top-right corner to launch MGN as a native standalone app!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0f4c81] text-white text-xs font-semibold hover:bg-[#0c3c66] transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {/* Floating PWA Install Bar */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[900] animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/95 dark:bg-[#161b22]/95 backdrop-blur-md border border-[#0f4c81]/20 dark:border-[#30363d] shadow-xl">
          <div className="relative shrink-0">
            <img
              src="/icon-192.png"
              alt="MGN"
              className="size-11 rounded-xl shadow-xs object-cover border border-[#e5e0d8] dark:border-[#30363d]"
            />
            <span className="absolute -bottom-1 -right-1 size-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#161b22]" />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc] truncate">
              Install Med Global Network
            </h4>
            <p className="text-[11px] text-[#77716b] dark:text-[#8b949e] line-clamp-1">
              Offline records, faster launch & clinical alerts
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0f4c81] text-white text-xs font-semibold shadow-xs hover:bg-[#0c3c66] transition cursor-pointer active:scale-95"
            >
              <Download className="size-3.5" />
              <span>Install</span>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 rounded-lg text-[#a09890] hover:text-[#171717] dark:hover:text-[#f0f6fc] transition cursor-pointer"
              aria-label="Dismiss banner"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="max-w-sm w-full bg-white dark:bg-[#161b22] border border-[#e5e0d8] dark:border-[#30363d] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-10 rounded-xl bg-[#0f4c81]/10 dark:bg-[#0f4c81]/20 flex items-center justify-center text-[#0f4c81] dark:text-[#58a6ff]">
                  <Smartphone className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">Install on iOS</h3>
                  <p className="text-xs text-[#77716b] dark:text-[#8b949e]">Add MGN to your Home Screen</p>
                </div>
              </div>
              <button
                onClick={() => setShowIosGuide(false)}
                className="p-1 rounded-lg text-[#77716b] hover:text-[#171717] dark:hover:text-[#f0f6fc] transition"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#5d5854] dark:text-[#8b949e] border-y border-[#e5e0d8] dark:border-[#30363d] py-3">
              <div className="flex items-start gap-2.5">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#0f4c81] text-[10px] font-bold text-white">
                  1
                </div>
                <p>
                  Tap the <strong>Share</strong> button <Share2 className="inline size-3.5 text-[#0f4c81]" /> at the bottom of Safari.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#0f4c81] text-[10px] font-bold text-white">
                  2
                </div>
                <p>
                  Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare className="inline size-3.5 text-[#0f4c81]" />.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#0f4c81] text-[10px] font-bold text-white">
                  3
                </div>
                <p>
                  Tap <strong>Add</strong> in the top-right corner to launch MGN as a native standalone app!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0f4c81] text-white text-xs font-semibold hover:bg-[#0c3c66] transition cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
}
