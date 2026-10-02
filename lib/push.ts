// ============================================================
// MGN Push Delivery (Firebase Cloud Messaging — HTTP v1)
// lib/push.ts
//
// Minimal FCM client: signs its own RS256 JWT with node:crypto
// and exchanges it for an OAuth2 access token. No SDK dependency.
//
// Config via env:
//   FIREBASE_PROJECT_ID            e.g. "mgn-production"
//   FIREBASE_SERVICE_ACCOUNT_JSON  full service-account JSON (single line)
// ============================================================

import crypto from "node:crypto";
import { pool } from "@/lib/auth";

type ServiceAccount = {
  project_id: string;
  client_email: string;
  private_key: string;
};

export type PushPayload = {
  title: string;
  body: string;
  /** Values must be strings — FCM rejects nested objects in `data`. */
  data?: Record<string, string>;
  /** Android channel id. Must match a channel created by the app. */
  channelId?: string;
};

export type PushResult = {
  sent: number;
  failed: number;
  /** Tokens FCM reported as UNREGISTERED / INVALID_ARGUMENT — safe to delete. */
  invalidTokens: string[];
};

const SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const CONCURRENCY = 10;

let cachedToken: { value: string; expiresAt: number } | null = null;

const b64url = (input: Buffer | string) =>
  Buffer.from(input as never)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

function getServiceAccount(): ServiceAccount | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw || !raw.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ServiceAccount>;
    if (!parsed.project_id || !parsed.client_email || !parsed.private_key) return null;
    return parsed as ServiceAccount;
  } catch (err) {
    console.error("[push] FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON:", err);
    return null;
  }
}

export function isPushConfigured(): boolean {
  return getServiceAccount() !== null;
}

async function getAccessToken(sa: ServiceAccount): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  const issuedAt = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: issuedAt,
      exp: issuedAt + 3600,
    })
  );

  const signature = crypto.sign(
    "RSA-SHA256",
    Buffer.from(`${header}.${claims}`),
    sa.private_key
  );

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claims}.${b64url(signature)}`,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`FCM auth failed (${res.status}): ${await res.text()}`);
  }

  const json = (await res.json()) as { access_token: string; expires_in: number };
  // Refresh 60s early so an in-flight send never uses a token that just expired.
  cachedToken = {
    value: json.access_token,
    expiresAt: Date.now() + (json.expires_in - 60) * 1000,
  };
  return cachedToken.value;
}

async function sendOne(
  sa: ServiceAccount,
  accessToken: string,
  token: string,
  payload: PushPayload
): Promise<"ok" | "invalid" | "error"> {
  try {
    const res = await fetch(
      `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            token,
            notification: { title: payload.title, body: payload.body },
            data: payload.data ?? {},
            android: {
              priority: "high",
              notification: {
                channel_id: payload.channelId ?? "default",
                click_action: "OPEN_APP",
              },
            },
          },
        }),
        cache: "no-store",
      }
    );

    if (res.ok) return "ok";

    const body = await res.text();
    if (
      res.status === 404 ||
      body.includes("UNREGISTERED") ||
      body.includes("INVALID_ARGUMENT")
    ) {
      return "invalid";
    }

    console.error(`[push] send failed (${res.status}) token=${token.slice(0, 12)}…: ${body}`);
    return "error";
  } catch (err) {
    console.error("[push] send threw:", err);
    return "error";
  }
}

/** Sends to a batch of device tokens, respecting a concurrency cap. */
export async function pushToTokens(
  tokens: string[],
  payload: PushPayload
): Promise<PushResult> {
  const result: PushResult = { sent: 0, failed: 0, invalidTokens: [] };
  if (tokens.length === 0) return result;

  const sa = getServiceAccount();
  if (!sa) {
    console.warn("[push] FIREBASE_SERVICE_ACCOUNT_JSON not set — push skipped");
    return result;
  }

  let accessToken: string;
  try {
    accessToken = await getAccessToken(sa);
  } catch (err) {
    console.error("[push] could not obtain access token:", err);
    return result;
  }

  const queue = [...tokens];
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
      for (;;) {
        const token = queue.shift();
        if (!token) return;
        const outcome = await sendOne(sa, accessToken, token, payload);
        if (outcome === "ok") result.sent++;
        else if (outcome === "invalid") result.invalidTokens.push(token);
        else result.failed++;
      }
    })
  );

  if (result.invalidTokens.length > 0) {
    await pool
      .query(`DELETE FROM push_devices WHERE token = ANY($1::text[])`, [
        result.invalidTokens,
      ])
      .catch((err) => console.error("[push] failed to prune invalid tokens:", err));
  }

  return result;
}

export const PUSH_CATEGORIES = ["pings", "announcements", "calls"] as const;
export type PushCategory = (typeof PUSH_CATEGORIES)[number];

/** Sends to every active device of one user. */
export async function pushToUser(
  userId: string,
  payload: PushPayload,
  category?: PushCategory
): Promise<PushResult> {
  const empty: PushResult = { sent: 0, failed: 0, invalidTokens: [] };

  // Runtime guard: `category` becomes a column name below, so a value that
  // never came from this module's own types must not reach the query.
  if (category && !PUSH_CATEGORIES.includes(category)) {
    console.error(`[push] rejected unknown category: ${category}`);
    return empty;
  }

  if (category) {
    try {
      const pref = await pool.query<{ enabled: boolean }>(
        `SELECT COALESCE((${category}), TRUE) AS enabled
           FROM push_preferences WHERE user_id = $1`,
        [userId]
      );
      // No row means the user never set preferences — default is enabled.
      if (pref.rows[0] && pref.rows[0].enabled === false) return empty;
    } catch {
      // Preferences table not migrated yet — deliver anyway.
    }
  }

  try {
    const res = await pool.query<{ token: string }>(
      `SELECT token FROM push_devices WHERE user_id = $1 AND last_seen_at > NOW() - INTERVAL '90 days'`,
      [userId]
    );
    return await pushToTokens(res.rows.map((r) => r.token), payload);
  } catch (err) {
    console.error(`[push] pushToUser(${userId}) error:`, err);
    return empty;
  }
}

/** Sends to every active device of many users (one payload for all). */
export async function pushToUsers(
  userIds: string[],
  payload: PushPayload,
  category?: PushCategory
): Promise<PushResult> {
  if (userIds.length === 0) return { sent: 0, failed: 0, invalidTokens: [] };

  if (category && !PUSH_CATEGORIES.includes(category)) {
    console.error(`[push] rejected unknown category: ${category}`);
    return { sent: 0, failed: 0, invalidTokens: [] };
  }

  try {
    // Preferences are per-user, so an explicit opt-out removes the device rows
    // from the result set rather than filtering after delivery.
    const res = category
      ? await pool.query<{ token: string }>(
          `SELECT d.token FROM push_devices d
            WHERE d.user_id = ANY($1::text[])
              AND d.last_seen_at > NOW() - INTERVAL '90 days'
              AND COALESCE(
                    (SELECT (${category}) FROM push_preferences p WHERE p.user_id = d.user_id),
                    TRUE
                  )`,
          [userIds]
        )
      : await pool.query<{ token: string }>(
          `SELECT token FROM push_devices
            WHERE user_id = ANY($1::text[])
              AND last_seen_at > NOW() - INTERVAL '90 days'`,
          [userIds]
        );
    return await pushToTokens(res.rows.map((r) => r.token), payload);
  } catch (err) {
    console.error("[push] pushToUsers error:", err);
    return { sent: 0, failed: 0, invalidTokens: [] };
  }
}