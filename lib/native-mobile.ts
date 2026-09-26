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
    // 1. Status Bar Setup
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    StatusBar.setBackgroundColor({ color: "#0f4c81" }).catch(() => {});

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
