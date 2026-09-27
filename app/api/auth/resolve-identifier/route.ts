import { NextResponse } from "next/server";
import { pool } from "@/lib/auth";

export async function POST(request: Request) {
  try {
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

    // 2. Lookup in professional_profiles (by username or member_id)
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

    // 3. Fallback: If it's a formatted email, return as-is
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
