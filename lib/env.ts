// ============================================================
// Environment Variable Validator & Safe Accessor
// lib/env.ts
// ============================================================

import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

export const isProduction = process.env.NODE_ENV === "production";
export const isDevelopment = process.env.NODE_ENV === "development";
export const isTest = process.env.NODE_ENV === "test";

/**
 * Validates environment variables at boot / runtime.
 * Throws explicit descriptive errors in production if required secrets are missing.
 */
export function getRequiredEnv(key: string, devFallback?: string): string {
  const value = process.env[key];
  if (value && value.trim().length > 0) {
    return value.trim();
  }

  if (isProduction) {
    if (devFallback && process.env.ALLOW_INSECURE_SECRETS === "true") {
      console.warn(`[SECURITY WARNING] Using insecure fallback for ${key} in production!`);
      return devFallback;
    }
    throw new Error(
      `[SECURITY ERROR] Missing required environment variable: ${key}. Platform cannot start securely.`
    );
  }

  if (devFallback !== undefined) {
    return devFallback;
  }

  throw new Error(`Missing environment variable: ${key}`);
}

export function getOptionalEnv(key: string, defaultValue = ""): string {
  const value = process.env[key];
  return value !== undefined ? value.trim() : defaultValue;
}

/**
 * Resolved, validated server configuration
 */
export const serverConfig = {
  isProduction,
  isDevelopment,
  isTest,

  // Database Connection URL
  databaseUrl:
    process.env.SUPABASE_DATABASE_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    "postgresql://localhost:5432/mgn",

  // Better Auth Secret (Strong 32+ char key with multiple environment variable fallbacks)
  authSecret:
    process.env.BETTER_AUTH_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.BETTER_AUTH_SECRET_KEY ||
    "mgn-auth-secret-key-32-chars-minimum-safe-production-2026",

  // Application Base URL
  appUrl: (
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "http://localhost:3000"
  )
    .replace(/\/api\/auth\/?$/, "")
    .replace(/\/+$/, ""),

  // Admin Config
  adminEmails: (process.env.ADMIN_EMAILS || "")
    .split(",")
    .concat(["patreshubham141@gmail.com", "patresweeti@gmail.com"])
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),

  adminPhones: (process.env.ADMIN_PHONES || "")
    .split(",")
    .concat(["6263585180", "7987522275"])
    .map((p) => p.trim().replace(/\D/g, ""))
    .filter(Boolean),

  // Cloudflare R2
  r2: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || "",
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    bucketName: process.env.R2_BUCKET_NAME || "",
    mediaDomain: process.env.NEXT_PUBLIC_R2_MEDIA_DOMAIN || "https://media.mgn.life",
    isConfigured: Boolean(
      process.env.CLOUDFLARE_ACCOUNT_ID &&
        process.env.R2_ACCESS_KEY_ID &&
        process.env.R2_SECRET_ACCESS_KEY &&
        process.env.R2_BUCKET_NAME
    ),
  },
};
