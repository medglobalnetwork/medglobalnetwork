// ============================================================
// MGN PWA & Hardware Permissions Manager
// lib/pwa-permissions.ts
// Handles Notifications, Geolocation, Camera, Microphone,
// Persistent Storage, App Badging, and PWA Installation lifecycle.
// ============================================================

export type PermissionType =
  | "notifications"
  | "location"
  | "camera"
  | "microphone"
  | "storage"
  | "badging"
  | "clipboard";

export type PermissionStatusState = "granted" | "denied" | "prompt" | "unsupported";

export interface AllPermissionsState {
  notifications: PermissionStatusState;
  location: PermissionStatusState;
  camera: PermissionStatusState;
  microphone: PermissionStatusState;
  storage: PermissionStatusState;
  badging: PermissionStatusState;
  clipboard: PermissionStatusState;
}

export interface StorageEstimateInfo {
  usageMB: number;
  quotaMB: number;
  percentUsed: number;
  persisted: boolean;
}

export interface PwaStatusInfo {
  isInstalled: boolean;
  isInstallable: boolean;
  isServiceWorkerReady: boolean;
  isOnline: boolean;
  platform: "ios" | "android" | "desktop" | "other";
}

/** Detect if running inside installed standalone PWA window */
export function isPwaInstalled(): boolean {
  if (typeof window === "undefined") return false;
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
  const isIosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  return isStandalone || isIosStandalone || document.referrer.includes("android-app://");
}

/** Detect device operating system */
export function getDevicePlatform(): "ios" | "android" | "desktop" | "other" {
  if (typeof window === "undefined") return "desktop";
  const userAgent = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(userAgent)) return "ios";
  if (/android/.test(userAgent)) return "android";
  if (/macintosh|windows|linux/.test(userAgent)) return "desktop";
  return "other";
}

/** Check Push Notifications permission status */
export function checkNotificationPermission(): PermissionStatusState {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission as PermissionStatusState;
}

/** Check Geolocation permission status via Permissions API */
export async function checkLocationPermission(): Promise<PermissionStatusState> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    return "unsupported";
  }
  if (navigator.permissions && navigator.permissions.query) {
    try {
      const res = await navigator.permissions.query({ name: "geolocation" });
      return res.state as PermissionStatusState;
    } catch {
      // Fallback
    }
  }
  return "prompt";
}

/** Check Camera permission status */
export async function checkCameraPermission(): Promise<PermissionStatusState> {
  if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return "unsupported";
  }
  if (navigator.permissions && navigator.permissions.query) {
    try {
      const res = await navigator.permissions.query({ name: "camera" as unknown as PermissionName });
      return res.state as PermissionStatusState;
    } catch {
      // Browsers like Firefox or Safari may reject 'camera' in query
    }
  }
  return "prompt";
}

/** Check Microphone permission status */
export async function checkMicrophonePermission(): Promise<PermissionStatusState> {
  if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return "unsupported";
  }
  if (navigator.permissions && navigator.permissions.query) {
    try {
      const res = await navigator.permissions.query({ name: "microphone" as unknown as PermissionName });
      return res.state as PermissionStatusState;
    } catch {
      // Fallback
    }
  }
  return "prompt";
}

/** Check Storage Persistence status */
export async function checkStoragePersistence(): Promise<PermissionStatusState> {
  if (typeof window === "undefined" || !navigator.storage?.persisted) {
    return "unsupported";
  }
  try {
    const isPersisted = await navigator.storage.persisted();
    return isPersisted ? "granted" : "prompt";
  } catch {
    return "unsupported";
  }
}

/** Check Clipboard permission status */
export async function checkClipboardPermission(): Promise<PermissionStatusState> {
  if (typeof window === "undefined" || !navigator.clipboard) {
    return "unsupported";
  }
  if (navigator.permissions && navigator.permissions.query) {
    try {
      const res = await navigator.permissions.query({ name: "clipboard-read" as unknown as PermissionName });
      return res.state as PermissionStatusState;
    } catch {
      // Fallback
    }
  }
  return "prompt";
}

/** Check App Badging capability */
export function checkBadgingSupport(): PermissionStatusState {
  if (typeof window === "undefined") return "unsupported";
  if ("setAppBadge" in navigator) return "granted";
  return "unsupported";
}

/** Aggregate all device permissions */
export async function getAllPermissionStatuses(): Promise<AllPermissionsState> {
  const [location, camera, microphone, storage, clipboard] = await Promise.all([
    checkLocationPermission(),
    checkCameraPermission(),
    checkMicrophonePermission(),
    checkStoragePersistence(),
    checkClipboardPermission(),
  ]);

  return {
    notifications: checkNotificationPermission(),
    location,
    camera,
    microphone,
    storage,
    badging: checkBadgingSupport(),
    clipboard,
  };
}

/** Request Web Push Notification permission and sync device token */
export async function requestNotificationPermission(): Promise<PermissionStatusState> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // Register with Service Worker Push Manager if available
      if ("serviceWorker" in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          if ("pushManager" in registration) {
            let subscription = await registration.pushManager.getSubscription();
            if (!subscription) {
              // Attempt subscription
              subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || undefined,
              }).catch(() => null);
            }

            // Sync to backend if token/endpoint available
            if (subscription) {
              await fetch("/api/notifications/devices", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                  token: subscription.endpoint,
                  platform: "web",
                  appVersion: "pwa-v2.0",
                }),
              }).catch(() => {});
            }
          }
        } catch (swErr) {
          console.warn("[MGN-PWA] PushManager subscription warning:", swErr);
        }
      }
    }
    return permission as PermissionStatusState;
  } catch (err) {
    console.error("[MGN-PWA] Notification request error:", err);
    return "denied";
  }
}

/** Request Geolocation GPS coordinates */
export async function requestLocationPermission(): Promise<{
  status: PermissionStatusState;
  coords?: { lat: number; lng: number };
  error?: string;
}> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    return { status: "unsupported", error: "Geolocation not supported" };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          status: "granted",
          coords: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          },
        });
      },
      (err) => {
        resolve({
          status: err.code === err.PERMISSION_DENIED ? "denied" : "prompt",
          error: err.message,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}

/** Request Camera permission */
export async function requestCameraPermission(): Promise<PermissionStatusState> {
  if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return "unsupported";
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    // Stop stream immediately once permission is verified
    stream.getTracks().forEach((track) => track.stop());
    return "granted";
  } catch (err: unknown) {
    const errorName = (err as { name?: string })?.name;
    if (errorName === "NotAllowedError" || errorName === "PermissionDeniedError") {
      return "denied";
    }
    return "unsupported";
  }
}

/** Request Microphone permission */
export async function requestMicrophonePermission(): Promise<PermissionStatusState> {
  if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return "unsupported";
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Stop stream immediately once permission is verified
    stream.getTracks().forEach((track) => track.stop());
    return "granted";
  } catch (err: unknown) {
    const errorName = (err as { name?: string })?.name;
    if (errorName === "NotAllowedError" || errorName === "PermissionDeniedError") {
      return "denied";
    }
    return "unsupported";
  }
}

/** Request Persistent Storage to prevent browser cache eviction */
export async function requestStoragePersistence(): Promise<boolean> {
  if (typeof window === "undefined" || !navigator.storage?.persist) {
    return false;
  }
  try {
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

/** Get storage quota and usage breakdown in Megabytes */
export async function getStorageQuotaEstimate(): Promise<StorageEstimateInfo> {
  if (typeof window === "undefined" || !navigator.storage?.estimate) {
    return { usageMB: 0, quotaMB: 0, percentUsed: 0, persisted: false };
  }
  try {
    const [estimate, isPersisted] = await Promise.all([
      navigator.storage.estimate(),
      navigator.storage.persisted ? navigator.storage.persisted() : Promise.resolve(false),
    ]);
    const usageMB = Math.round(((estimate.usage || 0) / (1024 * 1024)) * 10) / 10;
    const quotaMB = Math.round(((estimate.quota || 0) / (1024 * 1024)) * 10) / 10;
    const percentUsed = quotaMB > 0 ? Math.min(100, Math.round((usageMB / quotaMB) * 100)) : 0;
    return { usageMB, quotaMB, percentUsed, persisted: isPersisted };
  } catch {
    return { usageMB: 0, quotaMB: 0, percentUsed: 0, persisted: false };
  }
}

/** Set app icon badge count */
export async function setAppBadge(count: number = 1): Promise<boolean> {
  if (typeof window === "undefined" || !("setAppBadge" in navigator)) {
    return false;
  }
  try {
    await (navigator as unknown as { setAppBadge: (count?: number) => Promise<void> }).setAppBadge(count);
    return true;
  } catch {
    return false;
  }
}

/** Clear app icon badge */
export async function clearAppBadge(): Promise<boolean> {
  if (typeof window === "undefined" || !("clearAppBadge" in navigator)) {
    return false;
  }
  try {
    await (navigator as unknown as { clearAppBadge: () => Promise<void> }).clearAppBadge();
    return true;
  } catch {
    return false;
  }
}

/** Send a local test notification to verify OS-level notification delivery */
export async function triggerTestNotification(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  if (Notification.permission !== "granted") {
    const perm = await requestNotificationPermission();
    if (perm !== "granted") return false;
  }

  try {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification("Med Global Network", {
        body: "All systems active. Notifications, offline caching, and PWA capabilities are fully operational.",
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: "mgn-test-alert",
        data: { url: "/settings/permissions" },
      });
      return true;
    } else {
      new Notification("Med Global Network", {
        body: "All systems active. Notifications, offline caching, and PWA capabilities are fully operational.",
        icon: "/icon-192.png",
      });
      return true;
    }
  } catch (err) {
    console.error("[MGN-PWA] Test notification trigger failed:", err);
    return false;
  }
}

/** Batch request all essential permissions in guided sequence */
export async function requestAllEssentialPermissions(): Promise<{
  notifications: PermissionStatusState;
  location: PermissionStatusState;
  storage: boolean;
}> {
  const notif = await requestNotificationPermission();
  const locRes = await requestLocationPermission();
  const storage = await requestStoragePersistence();

  return {
    notifications: notif,
    location: locRes.status,
    storage,
  };
}
