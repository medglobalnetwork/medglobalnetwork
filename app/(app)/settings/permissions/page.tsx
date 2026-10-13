"use client";

import * as React from "react";
import {
  Bell,
  MapPin,
  Camera,
  Mic,
  HardDrive,
  BadgeAlert,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Send,
  Sparkles,
  Smartphone,
  Wifi,
  WifiOff,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import {
  AllPermissionsState,
  StorageEstimateInfo,
  getAllPermissionStatuses,
  requestNotificationPermission,
  requestLocationPermission,
  requestCameraPermission,
  requestMicrophonePermission,
  requestStoragePersistence,
  getStorageQuotaEstimate,
  triggerTestNotification,
  setAppBadge,
  clearAppBadge,
  isPwaInstalled,
  getDevicePlatform,
  requestAllEssentialPermissions,
  PermissionStatusState,
} from "@/lib/pwa-permissions";

export default function PermissionsSettingsPage() {
  const [permissions, setPermissions] = React.useState<AllPermissionsState>({
    notifications: "prompt",
    location: "prompt",
    camera: "prompt",
    microphone: "prompt",
    storage: "prompt",
    badging: "unsupported",
    clipboard: "prompt",
  });

  const [storageInfo, setStorageInfo] = React.useState<StorageEstimateInfo>({
    usageMB: 0,
    quotaMB: 0,
    percentUsed: 0,
    persisted: false,
  });

  const [isInstalled, setIsInstalled] = React.useState(false);
  const [platform, setPlatform] = React.useState<string>("desktop");
  const [isOnline, setIsOnline] = React.useState(true);
  const [loadingAction, setLoadingAction] = React.useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = React.useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [detectedCoords, setDetectedCoords] = React.useState<{ lat: number; lng: number } | null>(null);

  const refreshAllState = React.useCallback(async () => {
    if (typeof window === "undefined") return;
    setIsInstalled(isPwaInstalled());
    setPlatform(getDevicePlatform());
    setIsOnline(navigator.onLine);

    try {
      const perms = await getAllPermissionStatuses();
      setPermissions(perms);
      const storage = await getStorageQuotaEstimate();
      setStorageInfo(storage);
    } catch (e) {
      console.warn("Failed to refresh permission status:", e);
    }
  }, []);

  React.useEffect(() => {
    refreshAllState();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [refreshAllState]);

  const handleGrantNotifications = async () => {
    setLoadingAction("notifications");
    try {
      const status = await requestNotificationPermission();
      setPermissions((prev) => ({ ...prev, notifications: status }));
      if (status === "granted") {
        setFeedbackMessage({ text: "Push notifications successfully enabled!", type: "success" });
      } else if (status === "denied") {
        setFeedbackMessage({ text: "Notifications were blocked in your browser settings.", type: "error" });
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleTestNotification = async () => {
    setLoadingAction("test-notif");
    try {
      const sent = await triggerTestNotification();
      if (sent) {
        setFeedbackMessage({ text: "Test notification dispatched to your system tray!", type: "success" });
      } else {
        setFeedbackMessage({ text: "Please allow notifications first to receive alerts.", type: "error" });
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleGrantLocation = async () => {
    setLoadingAction("location");
    try {
      const res = await requestLocationPermission();
      setPermissions((prev) => ({ ...prev, location: res.status }));
      if (res.status === "granted" && res.coords) {
        setDetectedCoords(res.coords);
        setFeedbackMessage({
          text: `GPS locked: ${res.coords.lat.toFixed(4)}°N, ${res.coords.lng.toFixed(4)}°E`,
          type: "success",
        });
      } else if (res.status === "denied") {
        setFeedbackMessage({ text: "Location permission denied in your browser settings.", type: "error" });
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleGrantCamera = async () => {
    setLoadingAction("camera");
    try {
      const status = await requestCameraPermission();
      setPermissions((prev) => ({ ...prev, camera: status }));
      if (status === "granted") {
        setFeedbackMessage({ text: "Camera hardware access verified and enabled!", type: "success" });
      } else {
        setFeedbackMessage({ text: "Camera permission denied or camera device in use.", type: "error" });
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleGrantMicrophone = async () => {
    setLoadingAction("microphone");
    try {
      const status = await requestMicrophonePermission();
      setPermissions((prev) => ({ ...prev, microphone: status }));
      if (status === "granted") {
        setFeedbackMessage({ text: "Microphone access verified and enabled!", type: "success" });
      } else {
        setFeedbackMessage({ text: "Microphone permission denied or microphone in use.", type: "error" });
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleGrantStorage = async () => {
    setLoadingAction("storage");
    try {
      const isPersisted = await requestStoragePersistence();
      setPermissions((prev) => ({ ...prev, storage: isPersisted ? "granted" : "prompt" }));
      const newEstimate = await getStorageQuotaEstimate();
      setStorageInfo(newEstimate);
      if (isPersisted) {
        setFeedbackMessage({ text: "Persistent offline storage activated!", type: "success" });
      } else {
        setFeedbackMessage({ text: "Browser kept default storage policy.", type: "info" });
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleTestBadge = async () => {
    setLoadingAction("badge");
    try {
      await setAppBadge(3);
      setFeedbackMessage({ text: "Set app badge count to 3 on supported platforms.", type: "success" });
      setTimeout(() => {
        clearAppBadge().catch(() => {});
      }, 5000);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleClearCache = async () => {
    setLoadingAction("clear-cache");
    try {
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ action: "clearCache" });
      }
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      await refreshAllState();
      setFeedbackMessage({ text: "Service worker offline cache refreshed!", type: "success" });
    } catch {
      setFeedbackMessage({ text: "Failed to reset offline cache.", type: "error" });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleTriggerInstall = () => {
    window.dispatchEvent(new CustomEvent("mgn-trigger-install"));
  };

  const handleGrantAll = async () => {
    setLoadingAction("grant-all");
    try {
      await requestAllEssentialPermissions();
      await requestCameraPermission();
      await requestMicrophonePermission();
      await refreshAllState();
      setFeedbackMessage({ text: "All core permissions processed successfully!", type: "success" });
    } catch {
      setFeedbackMessage({ text: "One or more permissions were skipped.", type: "info" });
    } finally {
      setLoadingAction(null);
    }
  };

  const renderBadge = (status: PermissionStatusState) => {
    switch (status) {
      case "granted":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="size-3" />
            Allowed
          </span>
        );
      case "denied":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            <XCircle className="size-3" />
            Blocked
          </span>
        );
      case "unsupported":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
            Unavailable
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="size-3" />
            Not Granted
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#171717] dark:text-[#f0f6fc]">
            Device Permissions & PWA
          </h1>
          <p className="text-xs text-[#77716b] dark:text-[#8b949e] mt-1">
            Manage hardware access, web push notifications, offline storage, and app installation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refreshAllState}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e5e0d8] dark:border-[#30363d] bg-white dark:bg-[#161b22] text-xs font-semibold text-[#171717] dark:text-[#f0f6fc] hover:bg-[#f6f4f0] dark:hover:bg-[#21262d] transition cursor-pointer"
          >
            <RefreshCw className="size-3.5" />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleGrantAll}
            disabled={loadingAction === "grant-all"}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0f4c81] dark:bg-[#14559b] text-white text-xs font-semibold hover:bg-[#0c3c66] dark:hover:bg-[#0f4c81] transition cursor-pointer disabled:opacity-60 shadow-xs"
          >
            <Sparkles className="size-3.5" />
            <span>{loadingAction === "grant-all" ? "Requesting..." : "Enable All"}</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedbackMessage && (
        <div
          className={`flex items-center justify-between p-3.5 rounded-xl text-xs font-medium border animate-in fade-in ${
            feedbackMessage.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
              : feedbackMessage.type === "error"
              ? "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800"
              : "bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800"
          }`}
        >
          <span>{feedbackMessage.text}</span>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            className="text-current hover:opacity-70 ml-2 cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* App & Diagnostic Status Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* PWA State */}
        <div className="bg-white dark:bg-[#161b22] border border-[#e5e0d8] dark:border-[#30363d] rounded-2xl p-4.5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase text-[#a09890] dark:text-[#8b949e]">PWA Status</p>
            <h3 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">
              {isInstalled ? "Installed (Standalone)" : "Browser Mode"}
            </h3>
            <p className="text-[11px] text-[#77716b] dark:text-[#8b949e] capitalize">Platform: {platform}</p>
          </div>
          {!isInstalled ? (
            <button
              type="button"
              onClick={handleTriggerInstall}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0f4c81]/10 dark:bg-[#0f4c81]/30 text-[#0f4c81] dark:text-[#58a6ff] text-xs font-semibold hover:bg-[#0f4c81]/20 transition cursor-pointer"
            >
              <Download className="size-3.5" />
              <span>Install</span>
            </button>
          ) : (
            <div className="size-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="size-5" />
            </div>
          )}
        </div>

        {/* Network & Offline Status */}
        <div className="bg-white dark:bg-[#161b22] border border-[#e5e0d8] dark:border-[#30363d] rounded-2xl p-4.5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase text-[#a09890] dark:text-[#8b949e]">Connectivity</p>
            <h3 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">
              {isOnline ? "Online & Synced" : "Offline Mode"}
            </h3>
            <p className="text-[11px] text-[#77716b] dark:text-[#8b949e]">
              Service Worker: Cache v2 active
            </p>
          </div>
          <div
            className={`size-9 rounded-xl flex items-center justify-center ${
              isOnline
                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
            }`}
          >
            {isOnline ? <Wifi className="size-5" /> : <WifiOff className="size-5" />}
          </div>
        </div>

        {/* Offline Storage Status */}
        <div className="bg-white dark:bg-[#161b22] border border-[#e5e0d8] dark:border-[#30363d] rounded-2xl p-4.5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase text-[#a09890] dark:text-[#8b949e]">Offline Quota</p>
            <h3 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">
              {storageInfo.usageMB} MB / {storageInfo.quotaMB > 0 ? `${storageInfo.quotaMB} MB` : "Available"}
            </h3>
            <p className="text-[11px] text-[#77716b] dark:text-[#8b949e]">
              {storageInfo.persisted ? "Persistent Storage: ON" : "Standard Storage"}
            </p>
          </div>
          <div className="size-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-[#0f4c81] dark:text-[#58a6ff] flex items-center justify-center">
            <HardDrive className="size-5" />
          </div>
        </div>
      </div>

      {/* Main Permissions Section */}
      <div className="bg-white dark:bg-[#161b22] border border-[#e5e0d8] dark:border-[#30363d] rounded-2xl p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">Hardware & Feature Permissions</h2>
          <p className="text-xs text-[#77716b] dark:text-[#8b949e] mt-0.5">
            These permissions enable core features of the MGN healthcare platform.
          </p>
        </div>

        <div className="divide-y divide-[#e5e0d8] dark:divide-[#30363d]">
          {/* 1. Push Notifications */}
          <div className="py-4.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="size-9 rounded-xl bg-[#0f4c81]/10 dark:bg-[#0f4c81]/25 text-[#0f4c81] dark:text-[#58a6ff] flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="size-4.5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#171717] dark:text-[#f0f6fc]">Push Notifications</h3>
                  {renderBadge(permissions.notifications)}
                </div>
                <p className="text-xs text-[#77716b] dark:text-[#8b949e] max-w-lg leading-relaxed">
                  Real-time alerts for patient messages, urgent clinical discussions, verified CME releases, and health camp assignments.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              {permissions.notifications !== "granted" ? (
                <button
                  type="button"
                  onClick={handleGrantNotifications}
                  disabled={loadingAction === "notifications"}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0f4c81] text-white text-xs font-semibold hover:bg-[#0c3c66] transition cursor-pointer disabled:opacity-60 shadow-xs"
                >
                  {loadingAction === "notifications" ? "Requesting..." : "Enable"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleTestNotification}
                  disabled={loadingAction === "test-notif"}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e5e0d8] dark:border-[#30363d] bg-white dark:bg-[#161b22] text-[#171717] dark:text-[#f0f6fc] text-xs font-semibold hover:bg-[#f6f4f0] dark:hover:bg-[#21262d] transition cursor-pointer"
                >
                  <Send className="size-3" />
                  <span>{loadingAction === "test-notif" ? "Sending..." : "Test Push"}</span>
                </button>
              )}
            </div>
          </div>

          {/* 2. Geolocation / GPS */}
          <div className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="size-9 rounded-xl bg-[#0f4c81]/10 dark:bg-[#0f4c81]/25 text-[#0f4c81] dark:text-[#58a6ff] flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="size-4.5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#171717] dark:text-[#f0f6fc]">Location & GPS</h3>
                  {renderBadge(permissions.location)}
                </div>
                <p className="text-xs text-[#77716b] dark:text-[#8b949e] max-w-lg leading-relaxed">
                  Required to identify nearby rural medical camps, hospital emergency centers, and localized clinical job opportunities.
                </p>
                {detectedCoords && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                    Lat: {detectedCoords.lat.toFixed(5)}, Lng: {detectedCoords.lng.toFixed(5)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <button
                type="button"
                onClick={handleGrantLocation}
                disabled={loadingAction === "location"}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-60 ${
                  permissions.location === "granted"
                    ? "border border-[#e5e0d8] dark:border-[#30363d] bg-white dark:bg-[#161b22] text-[#171717] dark:text-[#f0f6fc] hover:bg-[#f6f4f0] dark:hover:bg-[#21262d]"
                    : "bg-[#0f4c81] text-white hover:bg-[#0c3c66] shadow-xs"
                }`}
              >
                {loadingAction === "location"
                  ? "Locating..."
                  : permissions.location === "granted"
                  ? "Re-check GPS"
                  : "Enable GPS"}
              </button>
            </div>
          </div>

          {/* 3. Camera */}
          <div className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="size-9 rounded-xl bg-[#0f4c81]/10 dark:bg-[#0f4c81]/25 text-[#0f4c81] dark:text-[#58a6ff] flex items-center justify-center shrink-0 mt-0.5">
                <Camera className="size-4.5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#171717] dark:text-[#f0f6fc]">Camera Access</h3>
                  {renderBadge(permissions.camera)}
                </div>
                <p className="text-xs text-[#77716b] dark:text-[#8b949e] max-w-lg leading-relaxed">
                  Used for telemedicine video calls, clinical case lesion scans, and live medical credential verification document capture.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <button
                type="button"
                onClick={handleGrantCamera}
                disabled={loadingAction === "camera"}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-60 ${
                  permissions.camera === "granted"
                    ? "border border-[#e5e0d8] dark:border-[#30363d] bg-white dark:bg-[#161b22] text-[#171717] dark:text-[#f0f6fc] hover:bg-[#f6f4f0] dark:hover:bg-[#21262d]"
                    : "bg-[#0f4c81] text-white hover:bg-[#0c3c66] shadow-xs"
                }`}
              >
                {loadingAction === "camera"
                  ? "Checking..."
                  : permissions.camera === "granted"
                  ? "Test Camera"
                  : "Enable Camera"}
              </button>
            </div>
          </div>

          {/* 4. Microphone */}
          <div className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="size-9 rounded-xl bg-[#0f4c81]/10 dark:bg-[#0f4c81]/25 text-[#0f4c81] dark:text-[#58a6ff] flex items-center justify-center shrink-0 mt-0.5">
                <Mic className="size-4.5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#171717] dark:text-[#f0f6fc]">Microphone Access</h3>
                  {renderBadge(permissions.microphone)}
                </div>
                <p className="text-xs text-[#77716b] dark:text-[#8b949e] max-w-lg leading-relaxed">
                  Used for speech-to-text case dictation, voice notes in doctor-to-doctor messaging, and live webinars.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <button
                type="button"
                onClick={handleGrantMicrophone}
                disabled={loadingAction === "microphone"}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-60 ${
                  permissions.microphone === "granted"
                    ? "border border-[#e5e0d8] dark:border-[#30363d] bg-white dark:bg-[#161b22] text-[#171717] dark:text-[#f0f6fc] hover:bg-[#f6f4f0] dark:hover:bg-[#21262d]"
                    : "bg-[#0f4c81] text-white hover:bg-[#0c3c66] shadow-xs"
                }`}
              >
                {loadingAction === "microphone"
                  ? "Checking..."
                  : permissions.microphone === "granted"
                  ? "Test Mic"
                  : "Enable Mic"}
              </button>
            </div>
          </div>

          {/* 5. Persistent Offline Storage */}
          <div className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="size-9 rounded-xl bg-[#0f4c81]/10 dark:bg-[#0f4c81]/25 text-[#0f4c81] dark:text-[#58a6ff] flex items-center justify-center shrink-0 mt-0.5">
                <HardDrive className="size-4.5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#171717] dark:text-[#f0f6fc]">Persistent Offline Storage</h3>
                  {renderBadge(storageInfo.persisted ? "granted" : "prompt")}
                </div>
                <p className="text-xs text-[#77716b] dark:text-[#8b949e] max-w-lg leading-relaxed">
                  Prevents browser from auto-clearing cached medical guidelines, saved CME certificates, and offline emergency records when device memory runs low.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <button
                type="button"
                onClick={handleGrantStorage}
                disabled={loadingAction === "storage" || storageInfo.persisted}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-60 ${
                  storageInfo.persisted
                    ? "border border-[#e5e0d8] dark:border-[#30363d] bg-zinc-50 dark:bg-zinc-800 text-zinc-500 cursor-default"
                    : "bg-[#0f4c81] text-white hover:bg-[#0c3c66] shadow-xs"
                }`}
              >
                {storageInfo.persisted ? "Persisted" : "Protect Storage"}
              </button>
            </div>
          </div>

          {/* 6. App Icon Badging */}
          <div className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="size-9 rounded-xl bg-[#0f4c81]/10 dark:bg-[#0f4c81]/25 text-[#0f4c81] dark:text-[#58a6ff] flex items-center justify-center shrink-0 mt-0.5">
                <BadgeAlert className="size-4.5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#171717] dark:text-[#f0f6fc]">App Icon Badging</h3>
                  {renderBadge(permissions.badging)}
                </div>
                <p className="text-xs text-[#77716b] dark:text-[#8b949e] max-w-lg leading-relaxed">
                  Shows unread message counts and urgent triage notification dots on your device's home screen app icon.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <button
                type="button"
                onClick={handleTestBadge}
                disabled={loadingAction === "badge" || permissions.badging === "unsupported"}
                className="px-3.5 py-1.5 rounded-xl border border-[#e5e0d8] dark:border-[#30363d] bg-white dark:bg-[#161b22] text-[#171717] dark:text-[#f0f6fc] text-xs font-semibold hover:bg-[#f6f4f0] dark:hover:bg-[#21262d] transition cursor-pointer disabled:opacity-50"
              >
                {loadingAction === "badge" ? "Setting..." : "Test Badge Dot"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Offline Maintenance & Diagnostics */}
      <div className="bg-white dark:bg-[#161b22] border border-[#e5e0d8] dark:border-[#30363d] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">PWA Cache & Maintenance</h3>
          <p className="text-xs text-[#77716b] dark:text-[#8b949e] mt-0.5">
            Reset cached offline data if you suspect outdated pages or want to free device space.
          </p>
        </div>

        <button
          type="button"
          onClick={handleClearCache}
          disabled={loadingAction === "clear-cache"}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100 transition cursor-pointer disabled:opacity-60 self-start sm:self-center"
        >
          <Trash2 className="size-3.5" />
          <span>{loadingAction === "clear-cache" ? "Purging..." : "Clear Cache"}</span>
        </button>
      </div>
    </div>
  );
}
