import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/auth";
import { sql } from "kysely";
import { getAdminSession, hasPermission } from "@/modules/admin/lib/rbac";
import { recordAuditLog } from "@/modules/admin/lib/audit";
import { ensureAdminTables } from "@/modules/admin/lib/admin-db";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession(req.headers);
    if (!admin || !hasPermission(admin, "settings.read")) {
      return NextResponse.json({ error: "Unauthorized. Permission settings.read required." }, { status: 403 });
    }

    await ensureAdminTables();

    // Fetch settings
    const settingsRes: any = await sql`
      SELECT * FROM admin_settings ORDER BY category, key
    `.execute(database);

    // Fetch current RBAC admins
    const rolesRes: any = await sql`
      SELECT * FROM admin_user_roles ORDER BY created_at DESC
    `.execute(database);

    return NextResponse.json({
      settings: settingsRes?.rows || [],
      adminRoles: rolesRes?.rows || [],
    });
  } catch (error: any) {
    console.error("Error loading admin settings:", error);
    return NextResponse.json({ error: error.message || "Failed to load settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession(req.headers);
    if (!admin || !hasPermission(admin, "settings.write")) {
      return NextResponse.json({ error: "Unauthorized. Permission settings.write required." }, { status: 403 });
    }

    await ensureAdminTables();
    const body = await req.json();
    const { key, value, category, description, reason } = body;

    // Fetch previous state
    const prevRes: any = await sql`SELECT value FROM admin_settings WHERE key = ${key}`.execute(database);
    const prevState = prevRes?.rows?.[0]?.value || null;

    await sql`
      INSERT INTO admin_settings (key, value, category, description, updated_by, updated_by_email, updated_at)
      VALUES (${key}, ${JSON.stringify(value)}::jsonb, ${category || 'general'}, ${description || null}, ${admin.userId}, ${admin.email}, NOW())
      ON CONFLICT (key) DO UPDATE SET 
        value = ${JSON.stringify(value)}::jsonb,
        category = COALESCE(${category || null}, admin_settings.category),
        description = COALESCE(${description || null}, admin_settings.description),
        updated_by = ${admin.userId},
        updated_by_email = ${admin.email},
        updated_at = NOW()
    `.execute(database);

    await recordAuditLog({
      admin,
      action: "setting.updated",
      entityType: "setting",
      entityId: key,
      previousState: prevState,
      newState: value,
      reason,
    });

    return NextResponse.json({ success: true, message: `Setting ${key} updated successfully` });
  } catch (error: any) {
    console.error("Error saving setting:", error);
    return NextResponse.json({ error: error.message || "Failed to save setting" }, { status: 500 });
  }
}
