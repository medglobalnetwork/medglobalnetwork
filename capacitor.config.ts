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
};

export default config;
