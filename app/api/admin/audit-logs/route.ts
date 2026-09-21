import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, hasPermission } from "@/modules/admin/lib/rbac";
import { getAuditLogs } from "@/modules/admin/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession(req.headers);
    if (!admin || !hasPermission(admin, "audit.read")) {
      return NextResponse.json({ error: "Unauthorized. Permission audit.read required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get("entityType") || undefined;
    const action = searchParams.get("action") || undefined;
    const adminEmail = searchParams.get("adminEmail") || undefined;
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "50", 10));
    const offset = Math.max(0, parseInt(searchParams.get("offset") || "0", 10));

    const result = await getAuditLogs({
      entityType,
      action,
      adminEmail,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in audit logs API:", error);
    return NextResponse.json({ error: error.message || "Failed to load audit logs" }, { status: 500 });
  }
}
