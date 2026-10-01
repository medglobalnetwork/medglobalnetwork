// ============================================================
// Platform Security Utilities & Protections
// lib/security.ts
//
// Form input sanitization, XSS escaping, safe URL validation,
// and in-memory rate limiting for API endpoints.
// ============================================================

/**
 * Escapes HTML characters to prevent XSS attacks when rendering untrusted text
 */
export function sanitizeHtml(input: unknown): string {
  if (input === null || input === undefined) return "";
  const str = String(input);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Strips script tags, malicious event handlers, and control characters from user text inputs
 */
export function sanitizeText(input: unknown, maxLength?: number): string {
  if (input === null || input === undefined) return "";
  let str = String(input);

  // Remove null bytes and invisible control characters except standard newlines and tabs
  str = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // Remove potential inline script and iframe tags
  str = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  str = str.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");
  str = str.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "");
  str = str.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "");

  // Remove inline event handler attributes like onerror=, onclick=, onload=
  str = str.replace(/on\w+\s*=\s*(['"]).*?\1/gi, "");
  str = str.replace(/on\w+\s*=\s*[^>\s]+/gi, "");

  // Normalize excessive whitespaces
  str = str.replace(/\r\n/g, "\n");

  if (typeof maxLength === "number" && maxLength > 0) {
    str = str.slice(0, maxLength);
  }

  return str.trim();
}

/**
 * Checks whether a URL is strictly safe against javascript:, data:, or vbscript: injection
 */
export function isSafeUrl(url: unknown): boolean {
  if (typeof url !== "string" || !url.trim()) return false;
  const trimmed = url.trim();

  // Safe relative paths (e.g. /profile, /feed, /uploads/...)
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.startsWith("/\\")) {
    return true;
  }

  // Safe absolute protocols
  try {
    const parsed = new URL(trimmed);
    const protocol = parsed.protocol.toLowerCase();
    return (
      protocol === "http:" ||
      protocol === "https:" ||
      protocol === "mailto:" ||
      protocol === "tel:"
    );
  } catch {
    return false;
  }
}

/**
 * Returns the URL if safe, or a fallback URL if malicious/invalid
 */
export function sanitizeUrl(url: unknown, fallback = "#"): string {
  if (isSafeUrl(url)) {
    return String(url).trim();
  }
  return fallback;
}

/**
 * Validates email format strictly
 */
export function isValidEmail(email: unknown): boolean {
  if (typeof email !== "string" || !email) return false;
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return email.length <= 254 && re.test(email.trim());
}

/**
 * Validates username: 3-30 chars, alphanumeric, underscores, dots
 */
export function isValidUsername(username: unknown): boolean {
  if (typeof username !== "string" || !username) return false;
  return /^[a-zA-Z0-9_.]{3,30}$/.test(username.trim());
}

// ============================================================
// In-Memory Token Bucket / Sliding Window Rate Limiter
// ============================================================

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale rate limit records every 5 minutes
if (typeof setInterval !== "undefined") {
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 300000);
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    }
  }, 300000);
  if (cleanupInterval.unref) cleanupInterval.unref();
}

/**
 * Evaluates rate limit for a given key (IP address, user ID, or endpoint key)
 * @param key Unique identifier for the client (e.g. `ip:endpoint` or `userId:endpoint`)
 * @param maxRequests Maximum allowed requests in the window
 * @param windowMs Window duration in milliseconds (default: 60,000ms = 1 minute)
 */
export function checkRateLimit(
  key: string,
  maxRequests = 60,
  windowMs = 60000
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key) || { timestamps: [] };

  // Filter timestamps within current window
  const validTimestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (validTimestamps.length >= maxRequests) {
    const oldest = validTimestamps[0];
    const resetMs = Math.max(0, windowMs - (now - oldest));
    rateLimitStore.set(key, { timestamps: validTimestamps });
    return {
      allowed: false,
      remaining: 0,
      resetMs,
    };
  }

  validTimestamps.push(now);
  rateLimitStore.set(key, { timestamps: validTimestamps });

  return {
    allowed: true,
    remaining: maxRequests - validTimestamps.length,
    resetMs: windowMs,
  };
}

/**
 * Extracts client IP from request headers safely with proxy header precedence
 */
export function getClientIp(reqHeaders: Headers): string {
  const cfIp = reqHeaders.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  const trueClientIp = reqHeaders.get("true-client-ip");
  if (trueClientIp) return trueClientIp.trim();

  const realIp = reqHeaders.get("x-real-ip");
  if (realIp) return realIp.trim();

  const forwarded = reqHeaders.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",");
    if (parts[0]) return parts[0].trim();
  }

  return "127.0.0.1";
}
