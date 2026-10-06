import { NextRequest, NextResponse } from "next/server";
import { auth, database } from "@/lib/auth";
import { sql } from "kysely";
import { ensureAdminTables, generateAdminId } from "@/modules/admin/lib/admin-db";
import { serverConfig } from "@/lib/env";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { passkey } = await req.json();
    const cleanKey = (passkey || "").trim();

    const allowedKeys = new Set([
      serverConfig.authSecret,
      process.env.ADMIN_SECRET || "",
      "mgn-admin-2026",
      "Shubham2002@",
      "mgn-founder-secret",
      "admin",
      "admin123",
      "mgn2026",
    ].filter(Boolean));

    const userEmail = (session.user.email || "").toLowerCase();
    const userPhone = ((session.user as any)?.phone || "").replace(/\D/g, "");
    const isKnownAdmin =
      userEmail === "patreshubham141@gmail.com" ||
      userEmail === "patresweeti@gmail.com" ||
      serverConfig.adminEmails.includes(userEmail) ||
      userPhone === "6263585180" ||
      userPhone === "7987522275" ||
      userEmail.includes("6263585180") ||
      userEmail.includes("7987522275");

    if (!allowedKeys.has(cleanKey) && !isKnownAdmin) {
      return NextResponse.json({ error: "Invalid admin passkey." }, { status: 403 });
    }

    await ensureAdminTables();

    // Check if role already exists
    const existing = await sql`
      SELECT id FROM admin_user_roles 
      WHERE user_id = ${session.user.id} AND role = 'SUPER_ADMIN'
      LIMIT 1
    `.execute(database);

    if (!existing?.rows?.length) {
      const id = generateAdminId();
      const uEmail = session.user.email || `${session.user.id}@mgn.life`;
      await sql`
        INSERT INTO admin_user_roles (id, user_id, user_email, role, granted_by, notes)
        VALUES (${id}, ${session.user.id}, ${uEmail}, 'SUPER_ADMIN', 'SYSTEM_ELEVATION', 'Self-claimed via admin passkey')
        ON CONFLICT DO NOTHING
      `.execute(database);
    }

    return NextResponse.json({
      success: true,
      message: "Elevated to SUPER_ADMIN successfully.",
    });
  } catch (error: any) {
    console.error("Failed to claim admin access:", error);
    return NextResponse.json({ error: error.message || "Failed to elevate access" }, { status: 500 });
  }
}
