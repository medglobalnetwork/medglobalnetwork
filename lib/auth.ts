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

const rawBaseUrl =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
  "http://localhost:3000";

let cleanBaseUrl = rawBaseUrl.replace(/\/api\/auth\/?$/, "").replace(/\/+$/, "");

// Force HTTPS for production domains
if (
  (cleanBaseUrl.includes("mgn.life") || cleanBaseUrl.includes("vercel.app") || process.env.NODE_ENV === "production") &&
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
  process.env.NODE_ENV === "production";

const globalForAuth = globalThis as typeof globalThis & {
  mgnAuthPool?: Pool;
  mgnAuthDatabase?: Kysely<unknown>;
};

const pool =
  globalForAuth.mgnAuthPool ??
  new Pool({
    connectionString: databaseUrl,
    ssl: isRemoteDb ? { rejectUnauthorized: false } : undefined,
    max: process.env.NODE_ENV === "production" ? 10 : 5,
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

export const auth = betterAuth({
  baseURL,
  trustedOrigins: [
    baseURL,
    "https://www.mgn.life",
    "https://mgn.life",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
  ],
  database: pool,
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
  secret: process.env.BETTER_AUTH_SECRET || "mgn-auth-super-secret-key-2026",
});
