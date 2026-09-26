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

// Determine canonical Base URL with intelligent production fallback
let rawBaseUrl =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
  "http://localhost:3000";

let cleanBaseUrl = rawBaseUrl.replace(/\/api\/auth\/?$/, "").replace(/\/+$/, "");

// If in production and baseURL accidentally pointed to localhost or empty, fallback to production domain
if (isProduction && (!cleanBaseUrl || cleanBaseUrl.includes("localhost") || cleanBaseUrl.includes("127.0.0.1"))) {
  cleanBaseUrl =
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "https://www.mgn.life";
}

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

export const pool =
  globalForAuth.mgnAuthPool ??
  new Pool({
    connectionString: databaseUrl,
    ssl: isRemoteDb ? { rejectUnauthorized: false } : undefined,
    max: isProduction ? 15 : 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    keepAlive: true,
  });

export const database =
  globalForAuth.mgnAuthDatabase ??
  new Kysely({
    dialect: new PostgresDialect({ pool }),
  });

globalForAuth.mgnAuthPool = pool;
globalForAuth.mgnAuthDatabase = database;

export const auth = betterAuth({
  baseURL,
  trustedOrigins: [
    baseURL,
    "https://www.mgn.life",
    "https://mgn.life",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "capacitor://localhost",
    "https://localhost",
    "http://localhost",
    "life.mgn.app://",
    "life.mgn.app",
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ...(process.env.VERCEL_PROJECT_PRODUCTION_URL ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`] : []),
    ...(process.env.NEXT_PUBLIC_APP_URL ? [process.env.NEXT_PUBLIC_APP_URL] : []),
    ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
  ],
  database: pool,
  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          if (session?.userId) {
            try {
              const { enforceDeviceSessionLimit } = await import("./device-session");
              await enforceDeviceSessionLimit(
                session.userId,
                session.id || session.token,
                session.userAgent
              );
            } catch (err) {
              console.error("Device limit hook error:", err);
            }
          }
        },
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days session persistence
    updateAge: 60 * 60 * 24 * 1, // Refresh session token once a day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      requireLocalEmailVerified: false,
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
      accessType: "offline",
    },
  },
  secret:
    process.env.BETTER_AUTH_SECRET ||
    "mgn-auth-super-secret-key-2026-production-stable-mgnlife",
});
