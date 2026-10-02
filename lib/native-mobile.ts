"use client";

import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Geolocation, Position } from "@capacitor/geolocation";
import { PushNotifications } from "@capacitor/push-notifications";

/**
 * Check if running inside native Android or iOS app shell
 */
export const isNativePlatform = (): boolean => {
  return typeof window !== "undefined" && Capacitor.isNativePlatform();
};

const PUSH_TOKEN_KEY = "mgn_push_token";

/**
 * Initialize Native Android App Features:
 * - Status bar theming (#0f4c81)
 * - Android hardware back button navigation
 * - Native splash screen sync
 */
export const initNativeApp = (routerBack?: () => void) => {
  if (!isNativePlatform()) return;

  try {
    // 1. Status Bar Setup (Status bar notification area must not overlay web content)
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    StatusBar.setBackgroundColor({ color: "#0f4c81" }).catch(() => {});
    StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});

    // 2. Hide hardware splash screen once web UI loads
    SplashScreen.hide().catch(() => {});

    // 3. Android Hardware Back Button listener
    CapApp.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack && routerBack) {
        routerBack();
      } else {
        CapApp.exitApp();
      }
    }).catch(() => {});
  } catch (err) {
    console.warn("Native mobile initialization warning:", err);
  }
};

/**
 * Trigger subtle native vibration feedback
 */
export const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Light) => {
  if (isNativePlatform()) {
    try {
      await Haptics.impact({ style });
    } catch {
      // Fallback or ignore
    }
  }
};

/**
 * Get current GPS coordinates for Health Camps & nearby medical discovery
 */
export const getDeviceLocation = async (): Promise<{ lat: number; lng: number } | null> => {
  try {
    if (isNativePlatform()) {
      const perm = await Geolocation.requestPermissions();
      if (perm.location === "granted" || perm.coarseLocation === "granted") {
        const pos: Position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
        });
        return { lat: pos.coords.latitude, lng: pos.coords.longitude };
      }
    } else if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => resolve(null),
          { timeout: 10000 }
        );
      });
    }
  } catch (err) {
    console.warn("Location fetch error:", err);
  }
  return null;
};

/**
 * Register device for Push Notifications (FCM)
 *
 * Listeners are attached BEFORE `register()` — on Android the registration
 * event can fire immediately, and a listener added afterwards never sees it.
 */
export const registerPushNotifications = async (): Promise<string | null> => {
  if (!isNativePlatform()) return null;

  try {
    const perm = await PushNotifications.requestPermissions();
    if (perm.receive !== "granted") return null;

    return new Promise<string | null>((resolve) => {
      let settled = false;
      const finish = (value: string | null) => {
        if (settled) return;
        settled = true;
        resolve(value);
      };

      void Promise.all([
        PushNotifications.addListener("registration", (token) =>
          finish(token.value)
        ),
        PushNotifications.addListener("registrationError", () => finish(null)),
      ]).then(() => PushNotifications.register())
        .catch((err) => {
          console.warn("Push registration error:", err);
          finish(null);
        });

      // Android occasionally never emits either event on an already-registered device.
      setTimeout(() => finish(null), 15000);
    });
  } catch (err) {
    console.warn("Push registration error:", err);
    return null;
  }
};

/**
 * Register the device for push and hand the FCM token to the server.
 * Safe to call on every app start — registration is idempotent.
 */
export const syncPushToken = async (): Promise<string | null> => {
  const token = await registerPushNotifications();
  if (!token) return null;

  let appVersion: string | undefined;
  try {
    const info = await CapApp.getInfo();
    appVersion = `${info.version} (${info.build})`;
  } catch {
    // getInfo unavailable on this platform — version is optional
  }

  try {
    const res = await fetch("/api/notifications/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        token,
        platform: "android",
        appVersion,
      }),
    });
    if (!res.ok) {
      console.warn("Push token sync rejected:", res.status);
      return token;
    }
    try {
      localStorage.setItem(PUSH_TOKEN_KEY, token);
    } catch {}
    return token;
  } catch (err) {
    console.warn("Push token sync failed:", err);
  }
  return token;
};

/**
 * Drop the server-side token on sign-out so the next account on this device
 * does not inherit the previous user's pushes.
 */
export const unregisterPushToken = async (): Promise<void> => {
  if (!isNativePlatform()) return;

  let token: string | null = null;
  try {
    token = localStorage.getItem(PUSH_TOKEN_KEY);
  } catch {}

  try {
    if (token) {
      await fetch("/api/notifications/devices", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token }),
      });
      localStorage.removeItem(PUSH_TOKEN_KEY);
    }
  } catch (err) {
    console.warn("Push token removal failed:", err);
  }

  try {
    await PushNotifications.unregister();
  } catch {
    // Nothing to unregister
  }
};

/**
 * Open OAuth URLs inside native Custom Tabs / In-App Browser
 */
export const openOAuthBrowser = async (url: string) => {
  if (isNativePlatform()) {
    try {
      const { Browser } = await import("@capacitor/browser");
      await Browser.open({
        url,
        windowName: "_blank",
        toolbarColor: "#0f4c81",
        presentationStyle: "popover",
      });
      return;
    } catch (err) {
      console.warn("Error opening in-app browser, falling back to window.location:", err);
    }
  }
  window.location.href = url;
};

/**
 * Close native In-App Browser if open
 */
export const closeOAuthBrowser = async () => {
  if (isNativePlatform()) {
    try {
      const { Browser } = await import("@capacitor/browser");
      await Browser.close();
    } catch {
      // Ignore if not open
    }
  }
};

/**
 * Exchange bridge token received via deep link to establish authenticated session inside Android WebView
 */
export const exchangeBridgeToken = async (bridgeToken: string): Promise<boolean> => {
  try {
    const baseUrl =
      typeof window !== "undefined" && window.location.origin.startsWith("http")
        ? window.location.origin
        : "https://www.mgn.life";

    const res = await fetch(`${baseUrl}/api/auth/mobile-bridge/exchange`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ bridge_token: bridgeToken }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.sessionToken) {
        try {
          localStorage.setItem("better-auth.session_token", data.sessionToken);
        } catch {}
      }
      return true;
    }
  } catch (err) {
    console.error("Failed to exchange mobile bridge token:", err);
  }
  return false;
};

/**
 * Listen for app resume or deep link return
 */
export const onAppResumeOrDeepLink = (
  callback: (url?: string, authSuccess?: boolean) => void
) => {
  if (typeof window === "undefined") return () => {};

  const cleanups: Array<() => void> = [];

  const handleDeepLinkUrl = async (rawUrl: string) => {
    try {
      if (rawUrl.includes("bridge_token=")) {
        const match = rawUrl.match(/bridge_token=([^&]+)/);
        if (match && match[1]) {
          const token = decodeURIComponent(match[1]);
          const success = await exchangeBridgeToken(token);
          await closeOAuthBrowser();
          callback(rawUrl, success);
          return;
        }
      }
    } catch (err) {
      console.error("Deep link parse error:", err);
    }
    callback(rawUrl, false);
  };

  // 1. Web visibility change
  const handleVisibility = () => {
    if (document.visibilityState === "visible") {
      callback();
    }
  };
  document.addEventListener("visibilitychange", handleVisibility);
  cleanups.push(() => document.removeEventListener("visibilitychange", handleVisibility));

  // 2. Web window focus
  const handleFocus = () => {
    callback();
  };
  window.addEventListener("focus", handleFocus);
  cleanups.push(() => window.removeEventListener("focus", handleFocus));

  // 3. Capacitor App state change & deep link
  if (isNativePlatform()) {
    try {
      CapApp.addListener("appStateChange", ({ isActive }) => {
        if (isActive) {
          callback();
        }
      }).then((handle) => {
        cleanups.push(() => handle.remove());
      });

      CapApp.addListener("appUrlOpen", (data) => {
        handleDeepLinkUrl(data.url);
      }).then((handle) => {
        cleanups.push(() => handle.remove());
      });
    } catch {
      // ignore
    }
  }

  return () => {
    cleanups.forEach((fn) => {
      try {
        fn();
      } catch {
        // ignore
      }
    });
  };
};





