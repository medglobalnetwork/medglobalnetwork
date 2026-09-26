import { pool } from "@/lib/auth";
import crypto from "node:crypto";

let tableEnsured = false;

/**
 * Ensure the mobile auth bridge table exists in PostgreSQL
 */
export async function ensureMobileAuthBridgeTable() {
  if (tableEnsured) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mobile_auth_bridge (
        token VARCHAR(128) PRIMARY KEY,
        session_token TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_mobile_auth_bridge_expires ON mobile_auth_bridge(expires_at);
    `);
    tableEnsured = true;
  } catch (err) {
    console.error("Failed to ensure mobile_auth_bridge table:", err);
  }
}

/**
 * Generate a short-lived (2 minute) single-use exchange token
 * to bridge auth session from mobile browser/CustomTabs into Android WebView
 */
export async function createMobileBridgeCode(
  sessionToken: string,
  userId: string
): Promise<string> {
  await ensureMobileAuthBridgeTable();
  const bridgeToken = crypto.randomBytes(32).toString("hex");

  try {
    await pool.query(
      `
      INSERT INTO mobile_auth_bridge (token, session_token, user_id, expires_at)
      VALUES ($1, $2, $3, NOW() + INTERVAL '2 minutes')
    `,
      [bridgeToken, sessionToken, userId]
    );

    // Periodic cleanup of expired tokens (non-blocking)
    pool.query(`DELETE FROM mobile_auth_bridge WHERE expires_at < NOW()`).catch(() => {});

    return bridgeToken;
  } catch (err) {
    console.error("Error creating mobile bridge code:", err);
    throw err;
  }
}

/**
 * Exchange and invalidate the one-time bridge token
 */
export async function exchangeMobileBridgeCode(
  bridgeToken: string
): Promise<{ sessionToken: string; userId: string } | null> {
  await ensureMobileAuthBridgeTable();

  try {
    const res = await pool.query(
      `
      DELETE FROM mobile_auth_bridge
      WHERE token = $1 AND expires_at > NOW()
      RETURNING session_token, user_id
    `,
      [bridgeToken]
    );

    if (res.rows && res.rows.length > 0) {
      return {
        sessionToken: res.rows[0].session_token,
        userId: res.rows[0].user_id,
      };
    }
  } catch (err) {
    console.error("Error exchanging mobile bridge code:", err);
  }

  return null;
}
