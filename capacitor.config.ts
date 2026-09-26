import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "life.mgn.app",
  appName: "MedGlobalNetwork",
  webDir: "public",
  server: {
    // Points directly to the live production deployment for instant over-the-air updates
    url: "https://www.mgn.life",
    cleartext: false,
    androidScheme: "https",
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: process.env.NODE_ENV !== "production",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1000,
      launchAutoHide: true,
      backgroundColor: "#0f4c81",
      androidScaleType: "CENTER_INSIDE",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
