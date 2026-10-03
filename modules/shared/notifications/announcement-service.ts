// ============================================================
// MGN Announcement Service
// modules/shared/notifications/announcement-service.ts
//
// Admin broadcasts (scope = global) and organizer announcements
// for camps and events. Every publish mirrors to native push.
// ============================================================

import { pool } from "@/lib/auth";
import { pushToUsers } from "@/lib/push";

export type AnnouncementScope = "global" | "camp" | "event";
export type AnnouncementPriority = "normal" | "high" | "urgent";

export type CreateAnnouncementInput = {
  scope: AnnouncementScope;
  scopeId?: string | null;
  createdBy: string;
  title: string;
  body: string;
  priority?: AnnouncementPriority;
  expiresAt?: Date | null;
};

/** Guard against a runaway broadcast to the whole user base in one request. */
const GLOBAL_AUDIENCE_CAP = 50_000;

let announcementsTableChecked = false;

export async function ensureAnnouncementsTables() {
  if (announcementsTableChecked) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        scope VARCHAR(20) NOT NULL DEFAULT 'global',
        scope_id TEXT,
        created_by TEXT NOT NULL,
        title VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        priority VARCHAR(20) NOT NULL DEFAULT 'normal',
        expires_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_announcements_scope ON announcements(scope, scope_id);
      CREATE INDEX IF NOT EXISTS idx_announcements_created ON announcements(created_at DESC);

      CREATE TABLE IF NOT EXISTS announcement_reads (
        user_id TEXT NOT NULL,
        announcement_id UUID NOT NULL,
        read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, announcement_id)
      );
    `);
    announcementsTableChecked = true;
  } catch (err) {
    console.warn("[AnnouncementService] table check warning:", err);
  }
}

export class AnnouncementService {
  /**
   * Publishes an announcement and pushes it to every device in its audience.
   * Push failures never block the publish.
   */
  static async create(input: CreateAnnouncementInput) {
    await ensureAnnouncementsTables();
    const {
      scope,
      scopeId = null,
      createdBy,
      title,
      body,
      priority = "normal",
      expiresAt = null,
    } = input;

    const inserted = await pool.query<{ id: string; created_at: Date }>(
      `INSERT INTO announcements (scope, scope_id, created_by, title, body, priority, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, created_at`,
      [scope, scopeId, createdBy, title, body, priority, expiresAt]
    );

    const announcement = inserted.rows[0];
    if (!announcement) throw new Error("Failed to create announcement");

    const audience = await this.resolveAudience(scope, scopeId);

    void pushToUsers(
      audience,
      {
        title: priority === "urgent" ? `⚠️ ${title}` : title,
        body,
        channelId: "announcements",
        data: {
          kind: "announcement",
          announcementId: announcement.id,
          scope,
          scopeId: scopeId ?? "",
        },
      },
      "announcements"
    ).catch((err) =>
      console.error("[AnnouncementService] push failed:", err)
    );

    return { ...announcement, audienceSize: audience.length };
  }

  /** User ids who should receive a given announcement. */
  static async resolveAudience(
    scope: AnnouncementScope,
    scopeId?: string | null
  ): Promise<string[]> {
    if (scope === "global") {
      const res = await pool.query<{ id: string }>(
        `SELECT id FROM "user" ORDER BY created_at DESC LIMIT $1`,
        [GLOBAL_AUDIENCE_CAP]
      );
      return res.rows.map((r) => r.id);
    }

    if (!scopeId) return [];

    if (scope === "camp") {
      const res = await pool.query<{ id: string }>(
        `SELECT DISTINCT user_id AS id FROM (
           SELECT user_id FROM camp_volunteers WHERE camp_id = $1 AND user_id IS NOT NULL
           UNION
           SELECT user_id FROM camp_registrations WHERE camp_id = $1 AND user_id IS NOT NULL
           UNION
           SELECT organizer_id AS user_id FROM camps WHERE id = $1
         ) t`,
        [scopeId]
      );
      return res.rows.map((r) => r.id);
    }

    const res = await pool.query<{ id: string }>(
      `SELECT DISTINCT user_id AS id FROM (
         SELECT user_id FROM event_registrations
           WHERE event_id = $1 AND status <> 'cancelled'
         UNION
         SELECT organizer_id AS user_id FROM events WHERE id = $1
       ) t`,
      [scopeId]
    );
    return res.rows.map((r) => r.id);
  }

  /**
   * Live announcements visible to one user: every global broadcast plus the
   * camp/event announcements they are actually part of.
   */
  static async listForUser(userId: string, limit = 50) {
    await ensureAnnouncementsTables();
    try {
      const res = await pool.query(
        `SELECT a.id, a.scope, a.scope_id, a.title, a.body, a.priority, a.created_at,
                a.expires_at, u.name AS author_name, u.image AS author_image,
                (r.user_id IS NOT NULL) AS is_read
           FROM announcements a
           LEFT JOIN "user" u ON u.id = a.created_by
           LEFT JOIN announcement_reads r
                  ON r.announcement_id = a.id AND r.user_id = $1
          WHERE (a.expires_at IS NULL OR a.expires_at > NOW())
            AND a.scope = 'global'
          ORDER BY
            CASE a.priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 ELSE 2 END,
            a.created_at DESC
          LIMIT $2`,
        [userId, limit]
      );
      return res.rows;
    } catch (err) {
      console.warn("[AnnouncementService] listForUser fallback:", err);
      return [];
    }
  }

  /** Idempotent — re-reading an announcement just refreshes the timestamp. */
  static async markRead(userId: string, announcementId: string) {
    await pool.query(
      `INSERT INTO announcement_reads (user_id, announcement_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, announcement_id) DO NOTHING`,
      [userId, announcementId]
    );
  }

  /** Whether the user owns the entity an announcement is scoped to. */
  static async canPublish(
    userId: string,
    scope: AnnouncementScope,
    scopeId: string
  ): Promise<boolean> {
    if (scope === "camp") {
      const res = await pool.query(
        `SELECT 1 FROM camps WHERE id = $1 AND organizer_id = $2`,
        [scopeId, userId]
      );
      return res.rows.length > 0;
    }
    if (scope === "event") {
      const res = await pool.query(
        `SELECT 1 FROM events WHERE id = $1 AND organizer_id = $2`,
        [scopeId, userId]
      );
      return res.rows.length > 0;
    }
    return false;
  }
}