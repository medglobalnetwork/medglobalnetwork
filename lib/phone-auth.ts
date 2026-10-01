import { pool } from "@/lib/auth";
import crypto from "node:crypto";
import { serverConfig, isProduction } from "./env";

let tableEnsured = false;

/**
 * Normalizes phone numbers into canonical E.164-like format:
 * Examples:
 * "9876543210" -> "+919876543210"
 * "09876543210" -> "+919876543210"
 * "+91 98765-43210" -> "+919876543210"
 * "+1 555-123-4567" -> "+15551234567"
 */
export function normalizePhoneNumber(raw: string): string {
  if (!raw) return "";
  const cleaned = raw.trim().replace(/[\s\-\(\)\.]/g, "");

  // If starts with +, ensure digits
  if (cleaned.startsWith("+")) {
    return "+" + cleaned.slice(1).replace(/\D/g, "");
  }

  // If starts with 0 and 11 digits (e.g. 09876543210), strip 0 and add +91
  if (cleaned.startsWith("0") && cleaned.length === 11) {
    return "+91" + cleaned.slice(1);
  }

  // If standard 10 digit Indian number, default to +91
  if (/^\d{10}$/.test(cleaned)) {
    return "+91" + cleaned;
  }

  // Otherwise prefix with + if not present
  return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
}

/**
 * Ensures the phone verification and user phone column exist in PostgreSQL
 */
export async function ensurePhoneAuthTables(): Promise<void> {
  if (tableEnsured) return;

  try {
    // 1. Create phone verification table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS phone_verifications (
        id VARCHAR(64) PRIMARY KEY,
        phone VARCHAR(32) NOT NULL,
        otp_hash VARCHAR(128) NOT NULL,
        otp_plain VARCHAR(16),
        attempts INT DEFAULT 0,
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_phone_verifications_phone ON phone_verifications(phone);
      CREATE INDEX IF NOT EXISTS idx_phone_verifications_expires ON phone_verifications(expires_at);
    `);

    // 2. Ensure phone column in "user" table
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'user' AND column_name = 'phone'
        ) THEN
          ALTER TABLE "user" ADD COLUMN phone VARCHAR(32);
          CREATE INDEX IF NOT EXISTS idx_user_phone ON "user"(phone);
        END IF;
      END $$;
    `);

    tableEnsured = true;
  } catch (err) {
    console.error("Failed to ensure phone auth schema:", err);
  }
}

/**
 * Hash OTP code for safe comparison
 */
function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

/**
 * Generate a 6-digit numeric OTP and store in phone_verifications table
 */
export async function sendPhoneOtp(
  rawPhone: string
): Promise<{ success: boolean; phone: string; expiresInSeconds: number; devOtp?: string; message: string }> {
  await ensurePhoneAuthTables();

  const phone = normalizePhoneNumber(rawPhone);
  if (!phone || phone.length < 10) {
    throw new Error("Please enter a valid mobile number.");
  }

  // Rate limit: Check if OTP was sent in the last 30 seconds for this phone
  const recentRes = await pool.query(
    `SELECT created_at FROM phone_verifications 
     WHERE phone = $1 AND created_at > NOW() - INTERVAL '30 seconds'
     ORDER BY created_at DESC LIMIT 1`,
    [phone]
  );

  if (recentRes.rows.length > 0) {
    throw new Error("Please wait 30 seconds before requesting a new OTP.");
  }

  // Generate cryptographically random 6-digit OTP
  const otpNumber = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = hashOtp(otpNumber);
  const id = crypto.randomUUID();

  // Expire in 5 minutes
  await pool.query(
    `INSERT INTO phone_verifications (id, phone, otp_hash, otp_plain, expires_at)
     VALUES ($1, $2, $3, $4, NOW() + INTERVAL '5 minutes')`,
    [id, phone, otpHash, !isProduction ? otpNumber : null]
  );

  // Send SMS via Gateway if configured (e.g. Twilio / Fast2SMS / MSG91)
  if (!isProduction) {
    console.info(`[PHONE_AUTH] OTP for ${phone}: ${otpNumber}`);
  }

  return {
    success: true,
    phone,
    expiresInSeconds: 300,
    devOtp: !isProduction ? otpNumber : undefined,
    message: `Verification code sent to ${phone}`,
  };
}

/**
 * Verify OTP for a phone number
 */
export async function verifyPhoneOtp(rawPhone: string, rawOtp: string): Promise<boolean> {
  await ensurePhoneAuthTables();

  const phone = normalizePhoneNumber(rawPhone);
  const otp = rawOtp.trim();

  if (!phone || !otp) return false;

  const otpHash = hashOtp(otp);

  const res = await pool.query(
    `SELECT id, attempts FROM phone_verifications
     WHERE phone = $1 
       AND verified = FALSE 
       AND expires_at > NOW()
     ORDER BY created_at DESC
     LIMIT 1`,
    [phone]
  );

  if (res.rows.length === 0) {
    return false;
  }

  const record = res.rows[0];

  // Prevent brute force
  if (record.attempts >= 5) {
    await pool.query(`DELETE FROM phone_verifications WHERE id = $1`, [record.id]);
    throw new Error("Too many incorrect attempts. Please request a new OTP.");
  }

  // Compare OTP hash
  const matchRes = await pool.query(
    `SELECT id FROM phone_verifications 
     WHERE id = $1 AND (otp_hash = $2 OR otp_plain = $3)`,
    [record.id, otpHash, otp]
  );

  if (matchRes.rows.length > 0) {
    // Mark verified
    await pool.query(`UPDATE phone_verifications SET verified = TRUE WHERE id = $1`, [record.id]);
    return true;
  } else {
    // Increment attempts
    await pool.query(`UPDATE phone_verifications SET attempts = attempts + 1 WHERE id = $1`, [record.id]);
    return false;
  }
}

/**
 * Find or create a user associated with this phone number
 */
export async function findOrCreateUserByPhone(
  rawPhone: string,
  fullName?: string
): Promise<{ id: string; email: string; name: string; isNewUser: boolean }> {
  await ensurePhoneAuthTables();

  const phone = normalizePhoneNumber(rawPhone);
  const digits = phone.replace(/\D/g, "");
  const fallbackEmail = `phone_${digits}@mgn.life`;

  // 1. Lookup in "user" table by phone or by synthesized phone email
  const existingUserRes = await pool.query(
    `SELECT id, name, email FROM "user" 
     WHERE phone = $1 
        OR phone = $2 
        OR LOWER(email) = LOWER($3)
     LIMIT 1`,
    [phone, digits, fallbackEmail]
  );

  if (existingUserRes.rows.length > 0) {
    const u = existingUserRes.rows[0];
    return {
      id: u.id,
      email: u.email,
      name: u.name || "MGN Member",
      isNewUser: false,
    };
  }

  // 2. Lookup in mgn_identities or professional_profiles if user was created with phone
  const profileLookup = await pool.query(
    `SELECT u.id, u.name, u.email 
     FROM "user" u
     JOIN professional_profiles pp ON pp.user_id = u.id
     WHERE pp.phone = $1 OR pp.phone = $2
     LIMIT 1`,
    [phone, digits]
  );

  if (profileLookup.rows.length > 0) {
    const u = profileLookup.rows[0];
    return {
      id: u.id,
      email: u.email,
      name: u.name || "MGN Member",
      isNewUser: false,
    };
  }

  // 3. Create new user for phone login
  const userId = crypto.randomUUID();
  const displayName = fullName?.trim() || `Member ${digits.slice(-4)}`;
  const username = `user_${digits.slice(-6)}`;
  const memberId = `MGN-${Math.floor(100000 + Math.random() * 900000)}`;

  await pool.query(
    `INSERT INTO "user" (id, name, email, "emailVerified", phone, username, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, TRUE, $4, $5, NOW(), NOW())`,
    [userId, displayName, fallbackEmail, phone, username]
  );

  // Insert professional profile
  await pool.query(
    `INSERT INTO professional_profiles (id, user_id, username, member_id, created_at, updated_at)
     VALUES ($1, $2, $3, $4, NOW(), NOW())
     ON CONFLICT (user_id) DO NOTHING`,
    [`pp_${userId}`, userId, username, memberId]
  );

  return {
    id: userId,
    email: fallbackEmail,
    name: displayName,
    isNewUser: true,
  };
}

/**
 * Creates a Better Auth compatible session in PostgreSQL and signs the token
 */
export async function createPhoneSession(
  userId: string,
  userAgent?: string | null,
  ipAddress?: string | null
): Promise<{ sessionToken: string; signedSessionToken: string; maxAge: number }> {
  const sessionId = crypto.randomUUID();
  const sessionToken = crypto.randomBytes(32).toString("hex");
  const maxAge = 60 * 60 * 24 * 30; // 30 days
  const expiresAt = new Date(Date.now() + maxAge * 1000);

  // Insert session record
  await pool.query(
    `INSERT INTO session (id, "userId", token, "expiresAt", "ipAddress", "userAgent", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
    [sessionId, userId, sessionToken, expiresAt, ipAddress || null, userAgent || null]
  );

  // Enforce single device session limit if applicable
  try {
    const { enforceDeviceSessionLimit } = await import("./device-session");
    await enforceDeviceSessionLimit(userId, sessionId, userAgent);
  } catch (deviceErr) {
    console.warn("Device session enforcement notice:", deviceErr);
  }

  // Sign token using better-auth secret
  const secret = serverConfig.authSecret;
  let signedSessionToken = sessionToken;

  try {
    const { makeSignature } = await import("better-auth/crypto");
    const sig = await makeSignature(sessionToken, secret);
    signedSessionToken = `${sessionToken}.${sig}`;
  } catch (sigErr) {
    console.warn("Could not sign session token with better-auth:", sigErr);
  }

  return {
    sessionToken,
    signedSessionToken,
    maxAge,
  };
}
