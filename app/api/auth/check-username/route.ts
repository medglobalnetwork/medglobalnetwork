import { NextResponse } from "next/server";
import { pool } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let username = (searchParams.get("username") || "").trim().toLowerCase();

    if (username.startsWith("@")) {
      username = username.slice(1).trim();
    }

    if (!username || username.length < 3) {
      return NextResponse.json({
        available: false,
        error: "Username must be at least 3 characters long",
      });
    }

    if (!/^[a-z0-9_.]+$/.test(username)) {
      return NextResponse.json({
        available: false,
        error: "Username can only contain letters, numbers, dots, and underscores",
      });
    }

    const checkRes = await pool.query(
      `SELECT 1 FROM "user" WHERE LOWER(username) = LOWER($1)
       UNION
       SELECT 1 FROM professional_profiles WHERE LOWER(username) = LOWER($1)
       LIMIT 1`,
      [username]
    );

    const isAvailable = checkRes.rows.length === 0;

    return NextResponse.json({
      available: isAvailable,
      username,
    });
  } catch (error) {
    console.error("Failed to check username:", error);
    return NextResponse.json({ available: false, error: "Internal error" }, { status: 500 });
  }
}
