import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

import { betterAuth } from "better-auth";
import { dash } from "@better-auth/infra";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

const databaseUrl =
  process.env.SUPABASE_DATABASE_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  "postgresql://localhost:5432/mgn";

const isProduction = process.env.NODE_ENV === "production";

// Determine stable baseURL:
// In production, priority: BETTER_AUTH_URL (if non-local) -> NEXT_PUBLIC_APP_URL (if non-local) -> "https://www.mgn.life"
// In development: "http://localhost:3000"
let cleanBaseUrl = "";
if (process.env.BETTER_AUTH_URL && !process.env.BETTER_AUTH_URL.includes("localhost") && !process.env.BETTER_AUTH_URL.includes("127.0.0.1")) {
  cleanBaseUrl = process.env.BETTER_AUTH_URL;
} else if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("localhost") && !process.env.NEXT_PUBLIC_APP_URL.includes("127.0.0.1")) {
  cleanBaseUrl = process.env.NEXT_PUBLIC_APP_URL;
} else if (isProduction) {
  cleanBaseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://www.mgn.life";
} else if (process.env.VERCEL_URL) {
  cleanBaseUrl = `https://${process.env.VERCEL_URL}`;
} else {
  cleanBaseUrl = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

cleanBaseUrl = cleanBaseUrl.replace(/\/api\/auth\/?$/, "").replace(/\/+$/, "");
if (
  (cleanBaseUrl.includes("mgn.life") || cleanBaseUrl.includes("vercel.app") || isProduction) &&
  cleanBaseUrl.startsWith("http://") &&
  !cleanBaseUrl.includes("localhost") &&
  !cleanBaseUrl.includes("127.0.0.1")
) {
  cleanBaseUrl = cleanBaseUrl.replace("http://", "https://");
}

const baseURL = cleanBaseUrl;

const isRemoteDb =
  databaseUrl.includes("supabase") ||
  databaseUrl.includes("pooler") ||
  databaseUrl.includes("aws") ||
  isProduction;

const globalForAuth = globalThis as typeof globalThis & {
  mgnAuthPool?: Pool;
  mgnAuthDatabase?: Kysely<unknown>;
};

const pool =
  globalForAuth.mgnAuthPool ??
  new Pool({
    connectionString: databaseUrl,
    ssl: isRemoteDb ? { rejectUnauthorized: false } : undefined,
    max: isProduction ? 10 : 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
  });

export const database =
  globalForAuth.mgnAuthDatabase ??
  new Kysely({
    dialect: new PostgresDialect({ pool }),
  });

globalForAuth.mgnAuthPool = pool;
globalForAuth.mgnAuthDatabase = database;

const isHttps = baseURL.startsWith("https://") || isProduction;
const isMgnLifeDomain = baseURL.includes("mgn.life");

export const auth = betterAuth({
  baseURL,
  trustedOrigins: [
    baseURL,
    "https://www.mgn.life",
    "https://mgn.life",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ...(process.env.VERCEL_PROJECT_PRODUCTION_URL ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`] : []),
  ],
  database: pool,
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days session persistence
    updateAge: 60 * 60 * 24 * 1, // Refresh session token once a day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes cache to reduce db lookups
    },
  },
  advanced: {
    cookiePrefix: "mgn_auth",
    useSecureCookies: isHttps,
    crossSubDomainCookies: {
      enabled: isMgnLifeDomain,
      domain: isMgnLifeDomain ? ".mgn.life" : undefined,
    },
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: isHttps,
      path: "/",
      httpOnly: true,
    },
  },
  plugins: process.env.BETTER_AUTH_API_KEY ? [dash()] : [],
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      console.info(`Password reset requested for ${user.email}: ${url}`);
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      prompt: "select_account",
    },
  },
  secret:
    process.env.BETTER_AUTH_SECRET ||
    "mgn-auth-super-secret-key-2026-production-stable-mgnlife",
});
