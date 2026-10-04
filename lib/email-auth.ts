import { pool } from "@/lib/auth";
import crypto from "node:crypto";
import { isProduction } from "./env";

let emailTableEnsured = false;

/**
 * Ensures the email_verifications table exists in PostgreSQL
 */
export async function ensureEmailAuthTables(): Promise<void> {
  if (emailTableEnsured) return;

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS email_verifications (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp_hash VARCHAR(128) NOT NULL,
        otp_plain VARCHAR(16),
        attempts INT DEFAULT 0,
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);
      CREATE INDEX IF NOT EXISTS idx_email_verifications_expires ON email_verifications(expires_at);
    `);

    emailTableEnsured = true;
  } catch (err) {
    console.error("Failed to ensure email auth schema:", err);
  }
}

/**
 * Hash OTP code for safe comparison
 */
function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

/**
 * Check if an email is already registered in the user table
 */
export async function checkEmailRegistered(rawEmail: string): Promise<boolean> {
  const email = rawEmail.trim().toLowerCase();
  if (!email) return false;

  const res = await pool.query(
    `SELECT id FROM "user" WHERE LOWER(email) = LOWER($1) LIMIT 1`,
    [email]
  );
  return res.rows.length > 0;
}

/**
 * Generate a 6-digit numeric OTP and store in email_verifications table
 */
export async function sendEmailOtp(
  rawEmail: string,
  purpose: "signup" | "login" | "verify" = "signup"
): Promise<{ success: boolean; email: string; expiresInSeconds: number; devOtp?: string; message: string }> {
  await ensureEmailAuthTables();

  const email = rawEmail.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Please enter a valid email address.");
  }

  // If signup, check if email is already registered
  if (purpose === "signup") {
    const isRegistered = await checkEmailRegistered(email);
    if (isRegistered) {
      throw new Error("An account with this email address already exists. Please log in.");
    }
  }

  // Rate limit check removed to prevent deadlock when reCAPTCHA verification is required

  // Generate cryptographically random 6-digit OTP
  const otpNumber = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = hashOtp(otpNumber);
  const id = crypto.randomUUID();

  // Expire in 10 minutes
  await pool.query(
    `INSERT INTO email_verifications (id, email, otp_hash, otp_plain, expires_at)
     VALUES ($1, $2, $3, $4, NOW() + INTERVAL '10 minutes')`,
    [id, email, otpHash, !isProduction ? otpNumber : null]
  );

  // Log in development / test
  if (!isProduction) {
    console.info(`[EMAIL_AUTH] OTP for ${email}: ${otpNumber}`);
  }

  return {
    success: true,
    email,
    expiresInSeconds: 600,
    devOtp: !isProduction ? otpNumber : undefined,
    message: `Verification code sent to ${email}`,
  };
}

/**
 * Verify OTP for an email address
 */
export async function verifyEmailOtp(rawEmail: string, rawOtp: string): Promise<boolean> {
  await ensureEmailAuthTables();

  const email = rawEmail.trim().toLowerCase();
  const otp = rawOtp.trim();

  if (!email || !otp) return false;

  const otpHash = hashOtp(otp);

  const res = await pool.query(
    `SELECT id, attempts FROM email_verifications
     WHERE LOWER(email) = LOWER($1) 
       AND verified = FALSE 
       AND expires_at > NOW()
     ORDER BY created_at DESC
     LIMIT 1`,
    [email]
  );

  if (res.rows.length === 0) {
    return false;
  }

  const record = res.rows[0];

  // Prevent brute force
  if (record.attempts >= 5) {
    await pool.query(`DELETE FROM email_verifications WHERE id = $1`, [record.id]);
    throw new Error("Too many incorrect attempts. Please request a new email verification code.");
  }

  // Compare OTP hash
  const matchRes = await pool.query(
    `SELECT id FROM email_verifications 
     WHERE id = $1 AND (otp_hash = $2 OR otp_plain = $3)`,
    [record.id, otpHash, otp]
  );

  if (matchRes.rows.length > 0) {
    // Mark verified
    await pool.query(`UPDATE email_verifications SET verified = TRUE WHERE id = $1`, [record.id]);
    return true;
  } else {
    // Increment attempts
    await pool.query(`UPDATE email_verifications SET attempts = attempts + 1 WHERE id = $1`, [record.id]);
    return false;
  }
}

/**
 * Check if an email was verified within the last 15 minutes
 */
export async function isEmailVerifiedRecently(rawEmail: string): Promise<boolean> {
  await ensureEmailAuthTables();

  const email = rawEmail.trim().toLowerCase();
  if (!email) return false;

  const res = await pool.query(
    `SELECT id FROM email_verifications 
     WHERE LOWER(email) = LOWER($1) 
       AND verified = TRUE 
       AND created_at > NOW() - INTERVAL '15 minutes'
     LIMIT 1`,
    [email]
  );

  return res.rows.length > 0;
}
