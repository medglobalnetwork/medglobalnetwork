import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

import { betterAuth } from "better-auth";
import { dash } from "@better-auth/infra";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { headers } from "next/headers";
import { serverConfig, isProduction } from "./env";

const databaseUrl = serverConfig.databaseUrl;

// Determine canonical Base URL with intelligent production fallback
let rawBaseUrl = serverConfig.appUrl;

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

const isSslDisabled = databaseUrl.includes("sslmode=disable") || databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1");

const isRemoteDb =
  !isSslDisabled &&
  (databaseUrl.includes("supabase") ||
    databaseUrl.includes("pooler") ||
    databaseUrl.includes("aws") ||
    databaseUrl.includes("neon") ||
    databaseUrl.includes("render") ||
    databaseUrl.includes("railway") ||
    databaseUrl.includes("sslmode=require") ||
    isProduction);

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

if (!globalForAuth.mgnAuthPool) {
  pool.on("error", (err) => {
    console.error("[PostgreSQL Pool Error]:", err?.message || err);
  });
}

export const database =
  globalForAuth.mgnAuthDatabase ??
  new Kysely({
    dialect: new PostgresDialect({ pool }),
  });

globalForAuth.mgnAuthPool = pool;
globalForAuth.mgnAuthDatabase = database;

export async function getSafeSession(customHeaders?: Headers) {
  try {
    const reqHeaders = customHeaders || (await headers());
    const session = await auth.api.getSession({ headers: reqHeaders });
    return session;
  } catch (err: any) {
    console.warn("[Auth] getSafeSession non-fatal error:", err?.message || err);
    return null;
  }
}

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
    "life.mgn.app://auth-callback",
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ...(process.env.VERCEL_PROJECT_PRODUCTION_URL ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`] : []),
    ...(process.env.NEXT_PUBLIC_APP_URL ? [process.env.NEXT_PUBLIC_APP_URL] : []),
    ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
  ],
  database: pool,
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            if (!user?.id) return;
            // 1. Generate base username from name or email
            let baseUsername = "";
            if (user.name) {
              baseUsername = user.name
                .toLowerCase()
                .replace(/^(dr\.|dr|mr\.|ms\.|mrs\.|prof\.)\s*/i, "")
                .replace(/[^a-z0-9_.]/g, "");
            }
            if (!baseUsername && user.email) {
              baseUsername = user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_.]/g, "");
            }
            if (!baseUsername || baseUsername.length < 3) {
              baseUsername = "mgn_member";
            }

            baseUsername = baseUsername.slice(0, 20);

            // Find available unique username
            let candidateUsername = baseUsername;
            let suffix = 1;
            while (true) {
              const check = await pool.query(
                `SELECT id FROM "user" WHERE LOWER(username) = LOWER($1) AND id != $2 LIMIT 1`,
                [candidateUsername, user.id]
              );
              if (check.rows.length === 0) break;
              candidateUsername = `${baseUsername}${suffix++}`;
            }

            // Generate unique member_id
            const randomNum = Math.floor(100000 + Math.random() * 900000);
            const memberId = `MGN-${randomNum}`;

            // Update user record with username
            await pool.query(
              `UPDATE "user" SET username = COALESCE(username, $1) WHERE id = $2`,
              [candidateUsername, user.id]
            );

            // Insert or update professional_profiles
            await pool.query(
              `INSERT INTO professional_profiles (id, user_id, username, member_id, created_at, updated_at)
               VALUES ($1, $2, $3, $4, NOW(), NOW())
               ON CONFLICT (user_id) DO UPDATE SET 
                 username = COALESCE(professional_profiles.username, EXCLUDED.username),
                 member_id = COALESCE(professional_profiles.member_id, EXCLUDED.member_id),
                 updated_at = NOW()`,
              [`pp_${user.id}`, user.id, candidateUsername, memberId]
            );
          } catch (hookErr) {
            console.error("User post-creation hook error:", hookErr);
          }
        },
      },
    },
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
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      try {
        const { sendPasswordResetEmail } = await import("./mail");
        await sendPasswordResetEmail(user.email, url, user.name);
      } catch (mailErr) {
        console.error("[AUTH] Failed to send password reset email:", mailErr);
      }
      if (!isProduction) {
        console.info(`[DEV PASSWORD RESET] ${user.email} -> ${url}`);
      }
    },
  },
  secret: serverConfig.authSecret,
});
