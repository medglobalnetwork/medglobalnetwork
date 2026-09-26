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
 */
export const registerPushNotifications = async (): Promise<string | null> => {
  if (!isNativePlatform()) return null;

  try {
    const perm = await PushNotifications.requestPermissions();
    if (perm.receive === "granted") {
      await PushNotifications.register();
      return new Promise((resolve) => {
        PushNotifications.addListener("registration", (token) => {
          resolve(token.value);
        });
        PushNotifications.addListener("registrationError", () => {
          resolve(null);
        });
      });
    }
  } catch (err) {
    console.warn("Push registration error:", err);
  }
  return null;
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

/**
 * Native Google Sign In using Google Play Services bottom-sheet dialog inside the app
 */
export const signInWithNativeGoogle = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  if (!isNativePlatform()) {
    return { success: false, error: "Not on native platform" };
  }

  try {
    const { GoogleAuth } = await import("@codetrix-studio/capacitor-google-auth");

    try {
      await GoogleAuth.initialize({
        clientId:
          "241814547071-mkam9r4khm5gi5i0j0pfevjtarab8ebc.apps.googleusercontent.com",
        scopes: ["profile", "email"],
        grantOfflineAccess: true,
      });
    } catch {
      // already initialized or fallback
    }

    const googleUser = await GoogleAuth.signIn();

    const idToken =
      googleUser.authentication?.idToken ||
      (googleUser as { idToken?: string }).idToken;

    if (!idToken) {
      return { success: false, error: "No ID token returned from Google" };
    }

    const baseUrl =
      typeof window !== "undefined" && window.location.origin.startsWith("http")
        ? window.location.origin
        : "https://www.mgn.life";

    const res = await fetch(`${baseUrl}/api/auth/google-native`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        idToken,
        user: {
          email: googleUser.email,
          name: googleUser.name || googleUser.givenName,
          imageUrl: googleUser.imageUrl,
        },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.session?.token) {
        try {
          localStorage.setItem("better-auth.session_token", data.session.token);
        } catch {}
      }
      return { success: true };
    } else {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errData.error || "Authentication failed on server",
      };
    }
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : typeof err === "object" && err !== null && "message" in err
        ? String((err as { message: unknown }).message)
        : "Google Sign-In was cancelled or failed";
    console.error("Native Google Sign-In error:", err);
    return {
      success: false,
      error: errorMessage,
    };
  }
};



