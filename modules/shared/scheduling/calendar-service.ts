// ============================================================
// MGN Shared Central Calendar Service
// modules/shared/scheduling/calendar-service.ts
//
// Centralized calendar sync, conflict detection, and event
// schedule querying across Events, Camps, Meetings, and Research.
// ============================================================

import { database } from "@/lib/auth";
import crypto from "crypto";

const db = database as any;

export interface CalendarEntry {
  id: string;
  user_id: string;
  source_type: "event" | "camp" | "meeting" | "interview" | "research_meeting";
  source_id: string;
  title: string;
  description?: string | null;
  start_time: Date | string;
  end_time: Date | string;
  timezone: string;
  location?: string | null;
  meeting_link?: string | null;
  status: "confirmed" | "cancelled" | "tentative";
  reminder_minutes_before: number;
  created_at?: Date;
}

export interface AddCalendarEntryParams {
  userId: string;
  sourceType: "event" | "camp" | "meeting" | "interview" | "research_meeting";
  sourceId: string;
  title: string;
  description?: string | null;
  startTime: Date | string;
  endTime: Date | string;
  timezone?: string;
  location?: string | null;
  meetingLink?: string | null;
  reminderMinutesBefore?: number;
}

export class CentralCalendarService {
  /**
   * Ensures the calendar table exists in the database.
   */
  static async ensureCalendarTable(): Promise<void> {
    try {
      await db.schema
        .createTable("calendar_events")
        .ifNotExists()
        .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
        .addColumn("user_id", "text", (col: any) => col.notNull())
        .addColumn("source_type", "varchar(32)", (col: any) => col.notNull())
        .addColumn("source_id", "varchar(64)", (col: any) => col.notNull())
        .addColumn("title", "varchar(255)", (col: any) => col.notNull())
        .addColumn("description", "text")
        .addColumn("start_time", "timestamptz", (col: any) => col.notNull())
        .addColumn("end_time", "timestamptz", (col: any) => col.notNull())
        .addColumn("timezone", "varchar(64)", (col: any) => col.defaultTo("Asia/Kolkata"))
        .addColumn("location", "text")
        .addColumn("meeting_link", "text")
        .addColumn("status", "varchar(32)", (col: any) => col.defaultTo("confirmed"))
        .addColumn("reminder_minutes_before", "integer", (col: any) => col.defaultTo(30))
        .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
        .execute();
    } catch {
      // Table already exists or handled by migration
    }
  }

  /**
   * Adds or updates an entry in the user's central calendar.
   */
  static async addOrUpdateEntry(params: AddCalendarEntryParams): Promise<CalendarEntry> {
    await this.ensureCalendarTable();

    const startTime = new Date(params.startTime);
    const endTime = new Date(params.endTime);
    const timezone = params.timezone || "Asia/Kolkata";

    const existing = await db
      .selectFrom("calendar_events" as any)
      .selectAll()
      .where("user_id", "=", params.userId)
      .where("source_type", "=", params.sourceType)
      .where("source_id", "=", params.sourceId)
      .executeTakeFirst() as CalendarEntry | undefined;

    if (existing) {
      await db
        .updateTable("calendar_events" as any)
        .set({
          title: params.title,
          description: params.description || null,
          start_time: startTime,
          end_time: endTime,
          timezone,
          location: params.location || null,
          meeting_link: params.meetingLink || null,
          status: "confirmed",
        })
        .where("id", "=", existing.id)
        .execute();

      return {
        ...existing,
        title: params.title,
        description: params.description || null,
        start_time: startTime,
        end_time: endTime,
        location: params.location || null,
        meeting_link: params.meetingLink || null,
      };
    }

    const id = crypto.randomUUID();
    const newEntry: CalendarEntry = {
      id,
      user_id: params.userId,
      source_type: params.sourceType,
      source_id: params.sourceId,
      title: params.title,
      description: params.description || null,
      start_time: startTime,
      end_time: endTime,
      timezone,
      location: params.location || null,
      meeting_link: params.meetingLink || null,
      status: "confirmed",
      reminder_minutes_before: params.reminderMinutesBefore || 30,
      created_at: new Date(),
    };

    await db
      .insertInto("calendar_events" as any)
      .values({
        id: newEntry.id,
        user_id: newEntry.user_id,
        source_type: newEntry.source_type,
        source_id: newEntry.source_id,
        title: newEntry.title,
        description: newEntry.description,
        start_time: newEntry.start_time,
        end_time: newEntry.end_time,
        timezone: newEntry.timezone,
        location: newEntry.location,
        meeting_link: newEntry.meeting_link,
        status: newEntry.status,
        reminder_minutes_before: newEntry.reminder_minutes_before,
        created_at: newEntry.created_at,
      })
      .execute();

    return newEntry;
  }

  /**
   * Removes an entry from the user's central calendar.
   */
  static async removeEntry(userId: string, sourceType: string, sourceId: string): Promise<boolean> {
    await this.ensureCalendarTable();
    try {
      await db
        .deleteFrom("calendar_events" as any)
        .where("user_id", "=", userId)
        .where("source_type", "=", sourceType)
        .where("source_id", "=", sourceId)
        .execute();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Checks for schedule conflicts in user's calendar.
   */
  static async detectConflicts(
    userId: string,
    startTime: Date | string,
    endTime: Date | string,
    excludeSourceId?: string
  ): Promise<CalendarEntry[]> {
    await this.ensureCalendarTable();
    const start = new Date(startTime);
    const end = new Date(endTime);

    try {
      const rows = await db
        .selectFrom("calendar_events" as any)
        .selectAll()
        .where("user_id", "=", userId)
        .where("status", "=", "confirmed")
        .where("start_time", "<", end)
        .where("end_time", ">", start)
        .execute() as CalendarEntry[];

      if (excludeSourceId) {
        return rows.filter((r: any) => r.source_id !== excludeSourceId);
      }
      return rows;
    } catch {
      return [];
    }
  }

  /**
   * Retrieves user's agenda for a specified time range or upcoming items.
   */
  static async getUserAgenda(
    userId: string,
    options?: {
      fromDate?: Date | string;
      toDate?: Date | string;
      limit?: number;
    }
  ): Promise<CalendarEntry[]> {
    await this.ensureCalendarTable();
    const from = options?.fromDate ? new Date(options.fromDate) : new Date();
    const limit = options?.limit || 50;

    try {
      let q = db
        .selectFrom("calendar_events" as any)
        .selectAll()
        .where("user_id", "=", userId)
        .where("status", "=", "confirmed")
        .where("end_time", ">=", from);

      if (options?.toDate) {
        q = q.where("start_time", "<=", new Date(options.toDate));
      }

      const results = await q
        .orderBy("start_time", "asc")
        .limit(limit)
        .execute() as CalendarEntry[];

      return results;
    } catch {
      return [];
    }
  }
}
