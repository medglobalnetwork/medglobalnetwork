// ============================================================
// MGN Admin Notifications & Broadcast API
// app/api/admin/notifications/broadcast/route.ts
// Handles bulk notification sending, push delivery, and notification history.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, hasPermission } from "@/modules/admin/lib/rbac";
import { pool } from "@/lib/auth";
import { pushToTokens } from "@/lib/push";
import { recordAuditLog } from "@/modules/admin/lib/audit";

export const dynamic = "force-dynamic";

/** GET: Returns notification telemetry, device stats, sent history, and audience breakdown */
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession(req.headers);
    if (!admin || !hasPermission(admin, "notifications.read")) {
      return NextResponse.json(
        { error: "Unauthorized. Permission notifications.read required." },
        { status: 403 }
      );
    }

    // 1. Device stats (FCM & Web Push)
    const deviceRes = await pool.query<{ count: string; platform: string }>(
      `SELECT platform, COUNT(*)::text as count FROM push_devices GROUP BY platform`
    ).catch(() => ({ rows: [] }));

    let totalDevices = 0;
    const platformBreakdown: Record<string, number> = { android: 0, ios: 0, web: 0 };
    for (const row of deviceRes.rows) {
      const c = parseInt(row.count, 10);
      totalDevices += c;
      platformBreakdown[row.platform || "android"] = (platformBreakdown[row.platform || "android"] || 0) + c;
    }

    // 2. Audience counts
    const totalUsersRes = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM "user"`
    ).catch(() => ({ rows: [{ count: "0" }] }));

    const verifiedDoctorsRes = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM "user" 
       WHERE (medical_council IS NOT NULL OR profession = 'doctor') 
         AND (status = 'verified' OR identity_verified = true)`
    ).catch(() => ({ rows: [{ count: "0" }] }));

    const studentsRes = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM "user" WHERE profession = 'student'`
    ).catch(() => ({ rows: [{ count: "0" }] }));

    // 3. Sent Broadcast History (from announcements table)
    const historyRes = await pool.query(
      `SELECT 
         a.id, 
         a.title, 
         a.body, 
         a.priority, 
         a.scope, 
         a.created_at, 
         u.name as sender_name,
         u.email as sender_email,
         (SELECT COUNT(*)::int FROM announcement_reads r WHERE r.announcement_id = a.id) as read_count
       FROM announcements a
       LEFT JOIN "user" u ON a.created_by = u.id
       ORDER BY a.created_at DESC
       LIMIT 50`
    ).catch(() => ({ rows: [] }));

    // 4. Live Received In-App Notifications Feed (recent activity stream)
    const streamRes = await pool.query(
      `SELECT 
         n.id,
         n.user_id,
         n.type,
         n.message,
         n.is_read,
         n.created_at,
         u.name as recipient_name,
         u.email as recipient_email
       FROM network_notifications n
       LEFT JOIN "user" u ON n.user_id = u.id
       ORDER BY n.created_at DESC
       LIMIT 40`
    ).catch(() => ({ rows: [] }));

    return NextResponse.json({
      telemetry: {
        totalDevices,
        platformBreakdown,
        totalUsers: parseInt(totalUsersRes.rows[0]?.count || "0", 10),
        verifiedDoctors: parseInt(verifiedDoctorsRes.rows[0]?.count || "0", 10),
        medicalStudents: parseInt(studentsRes.rows[0]?.count || "0", 10),
      },
      broadcastHistory: historyRes.rows,
      liveNotificationStream: streamRes.rows,
    });
  } catch (error: any) {
    console.error("GET /api/admin/notifications/broadcast error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load notification telemetry" },
      { status: 500 }
    );
  }
}

/** POST: Dispatches bulk push notifications and in-app broadcasts */
export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession(req.headers);
    if (!admin || !hasPermission(admin, "notifications.send")) {
      return NextResponse.json(
        { error: "Unauthorized. Permission notifications.send required." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      title,
      message,
      targetAudience = "all", // "all" | "doctors" | "students" | "city" | "single_user"
      targetValue = "",
      channel = "push_and_inapp", // "push_and_inapp" | "push_only" | "inapp_only" | "announcement"
      link = "/home",
      priority = "normal", // "normal" | "high" | "urgent"
    } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Notification title is required." }, { status: 400 });
    }
    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Notification body message is required." }, { status: 400 });
    }

    // 1. Resolve Target User IDs
    let userQuery = `SELECT id FROM "user" WHERE 1=1`;
    const queryParams: any[] = [];

    if (targetAudience === "doctors") {
      userQuery += ` AND (medical_council IS NOT NULL OR profession = 'doctor')`;
    } else if (targetAudience === "students") {
      userQuery += ` AND profession = 'student'`;
    } else if (targetAudience === "city" && targetValue) {
      queryParams.push(`%${targetValue}%`);
      userQuery += ` AND city ILIKE $${queryParams.length}`;
    } else if (targetAudience === "single_user" && targetValue) {
      queryParams.push(targetValue.trim().toLowerCase());
      userQuery += ` AND (email = $${queryParams.length} OR id = $${queryParams.length})`;
    }

    const usersRes = await pool.query<{ id: string }>(userQuery, queryParams);
    const targetUserIds = usersRes.rows.map((u) => u.id);

    if (targetUserIds.length === 0) {
      return NextResponse.json(
        { error: "No matching users found for the specified target criteria." },
        { status: 400 }
      );
    }

    let pushSent = 0;
    let pushFailed = 0;

    // 2. Dispatch Push Notifications (if channel allows)
    if (channel === "push_and_inapp" || channel === "push_only") {
      try {
        const tokensRes = await pool.query<{ token: string }>(
          `SELECT token FROM push_devices 
           WHERE user_id = ANY($1::text[]) 
             AND last_seen_at > NOW() - INTERVAL '90 days'`,
          [targetUserIds]
        );

        const tokens = tokensRes.rows.map((r) => r.token);
        if (tokens.length > 0) {
          const pushOutcome = await pushToTokens(tokens, {
            title,
            body: message,
            channelId: priority === "urgent" ? "emergency" : "announcements",
            data: {
              kind: "announcement",
              url: link || "/home",
              priority,
            },
          });
          pushSent = pushOutcome.sent;
          pushFailed = pushOutcome.failed;
        }
      } catch (pushErr) {
        console.warn("[Admin Notifications] Push dispatch warning:", pushErr);
      }
    }

    // 3. Write to Announcements Table (Global / In-App Broadcast)
    let announcementId: string | null = null;
    if (channel === "push_and_inapp" || channel === "inapp_only" || channel === "announcement") {
      try {
        const annRes = await pool.query<{ id: string }>(
          `INSERT INTO announcements (created_by, title, body, priority, scope)
           VALUES ($1, $2, $3, $4, 'global')
           RETURNING id`,
          [admin.userId, title, message, priority === "urgent" ? "urgent" : priority === "high" ? "high" : "normal"]
        );
        announcementId = annRes.rows[0]?.id || null;
      } catch (annErr) {
        console.warn("[Admin Notifications] Announcement insert warning:", annErr);
      }

      // Also populate network_notifications for in-app alert bells (capped at top 500 for single batch)
      if (channel !== "announcement") {
        try {
          const limitedIds = targetUserIds.slice(0, 500);
          for (const uid of limitedIds) {
            await pool.query(
              `INSERT INTO network_notifications (user_id, actor_id, type, entity_type, entity_id, message)
               VALUES ($1, $2, 'announcement', 'announcement', $3, $4)`,
              [uid, admin.userId, announcementId, `${title}: ${message.slice(0, 100)}`]
            ).catch(() => {});
          }
        } catch {}
      }
    }

    // 4. Record Audit Log
    await recordAuditLog({
      admin,
      action: "NOTIFICATIONS_BROADCAST_SENT",
      entityType: "notification_broadcast",
      entityId: announcementId || `broadcast-${Date.now()}`,
      newState: {
        title,
        targetAudience,
        targetValue,
        channel,
        recipientsCount: targetUserIds.length,
        pushSent,
        pushFailed,
        priority,
      },
      reason: `Admin broadcast dispatched to ${targetUserIds.length} users.`,
    });

    return NextResponse.json({
      success: true,
      recipientsCount: targetUserIds.length,
      pushSent,
      pushFailed,
      announcementId,
    });
  } catch (error: any) {
    console.error("POST /api/admin/notifications/broadcast error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to broadcast notifications" },
      { status: 500 }
    );
  }
}
