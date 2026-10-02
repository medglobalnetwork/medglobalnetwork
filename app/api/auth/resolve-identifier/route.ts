import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { pool } from "@/lib/auth";
import { normalizePhoneNumber } from "@/lib/phone-auth";
import { checkRateLimit, getClientIp } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const reqHeaders = await headers();
    const clientIp = getClientIp(reqHeaders);

    // Rate limit: max 20 lookups per minute per IP
    const ipLimit = checkRateLimit(`resolve:${clientIp}`, 20, 60000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { found: false, error: "Too many requests. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const rawIdentifier = (body.identifier || "").trim();

    if (!rawIdentifier) {
      return NextResponse.json({ found: false, email: null }, { status: 400 });
    }

    // Strip leading '@' if user entered @username
    const cleanIdentifier = rawIdentifier.startsWith("@")
      ? rawIdentifier.slice(1).trim()
      : rawIdentifier;

    // 1. Direct Email or Username match in "user" table
    const directUserRes = await pool.query(
      `SELECT email FROM "user" 
       WHERE LOWER(email) = LOWER($1) 
          OR LOWER(COALESCE(username, '')) = LOWER($1)
       LIMIT 1`,
      [cleanIdentifier]
    );

    if (directUserRes.rows.length > 0 && directUserRes.rows[0].email) {
      return NextResponse.json({
        found: true,
        email: directUserRes.rows[0].email,
      });
    }

    // 2. Lookup by Phone number in "user", "professional_profiles", or "mgn_identities"
    const digitsOnly = cleanIdentifier.replace(/\D/g, "");
    if (digitsOnly.length >= 7) {
      const normalizedPhone = normalizePhoneNumber(cleanIdentifier);

      const phoneUserRes = await pool.query(
        `SELECT email FROM "user"
         WHERE phone = $1 
            OR phone = $2 
            OR phone = $3
            OR LOWER(email) = LOWER($4)
         LIMIT 1`,
        [normalizedPhone, digitsOnly, `+${digitsOnly}`, `phone_${digitsOnly}@mgn.life`]
      );

      if (phoneUserRes.rows.length > 0 && phoneUserRes.rows[0].email) {
        return NextResponse.json({
          found: true,
          email: phoneUserRes.rows[0].email,
        });
      }

      // Check mgn_identities or mgn_organisation_identities for phone
      try {
        const phoneIdentityRes = await pool.query(
          `SELECT u.email 
           FROM "user" u
           LEFT JOIN mgn_identities mi ON mi.user_id = u.id
           LEFT JOIN mgn_organisation_identities moi ON moi.user_id = u.id
           WHERE mi.phone = $1 OR mi.phone = $2 OR mi.phone = $3
              OR moi.auth_rep_phone = $1 OR moi.auth_rep_phone = $2 OR moi.auth_rep_phone = $3
           LIMIT 1`,
          [normalizedPhone, digitsOnly, `+${digitsOnly}`]
        );

        if (phoneIdentityRes.rows.length > 0 && phoneIdentityRes.rows[0].email) {
          return NextResponse.json({
            found: true,
            email: phoneIdentityRes.rows[0].email,
          });
        }
      } catch {
        // Table might not exist yet
      }
    }

    // 3. Lookup in professional_profiles (by username or member_id)
    const ppRes = await pool.query(
      `SELECT u.email 
       FROM professional_profiles pp
       JOIN "user" u ON u.id = pp.user_id
       WHERE LOWER(COALESCE(pp.username, '')) = LOWER($1)
          OR LOWER(COALESCE(pp.member_id, '')) = LOWER($1)
       LIMIT 1`,
      [cleanIdentifier]
    );

    if (ppRes.rows.length > 0 && ppRes.rows[0].email) {
      return NextResponse.json({
        found: true,
        email: ppRes.rows[0].email,
      });
    }

    // 4. Fallback: If it's a formatted email, return as-is
    if (cleanIdentifier.includes("@")) {
      return NextResponse.json({
        found: true,
        email: cleanIdentifier,
      });
    }

    return NextResponse.json({
      found: false,
      email: null,
    });
  } catch (error) {
    console.error("Failed to resolve identifier:", error);
    return NextResponse.json(
      { found: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
