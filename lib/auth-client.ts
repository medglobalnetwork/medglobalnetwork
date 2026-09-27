import { createAuthClient } from "better-auth/react";

const getBaseURL = () => {
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    // In Capacitor Android/iOS WebView or native file origin, use production server
    if (
      origin &&
      (origin.startsWith("capacitor:") ||
        origin.startsWith("file:") ||
        origin.includes("life.mgn.app"))
    ) {
      return "https://www.mgn.life";
    }
    if (origin && origin !== "null") {
      return origin;
    }
  }
  return process.env.NEXT_PUBLIC_APP_URL || "https://www.mgn.life";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  fetchOptions: {
    credentials: "include",
  },
});
