import { createAuthClient } from "better-auth/react";

const getBaseURL = () => {
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    // In Capacitor Android/iOS WebView or if origin is localhost/file, use production server
    if (
      !origin ||
      origin.includes("localhost") ||
      origin.includes("127.0.0.1") ||
      origin.startsWith("capacitor:") ||
      origin.startsWith("file:") ||
      origin.includes("life.mgn.app")
    ) {
      if (process.env.NODE_ENV === "development" && origin.includes(":3000")) {
        return origin;
      }
      return "https://www.mgn.life";
    }
    return origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || "https://www.mgn.life";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  fetchOptions: {
    credentials: "include",
  },
});
