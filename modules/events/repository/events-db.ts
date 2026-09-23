// ============================================================
// MGN Events Repository
// modules/events/repository/events-db.ts
// ============================================================

import { database } from "@/lib/auth";
import crypto from "crypto";
import { CreateEventInput, EventFilterParams, EventRecord, EventSpeaker, EventAgendaItem } from "../domain/types";

const db = database as any;

export class EventsRepository {
  static async ensureTables(): Promise<void> {
    try {
      await db.schema
        .createTable("events")
        .ifNotExists()
        .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
        .addColumn("slug", "varchar(255)", (col: any) => col.notNull().unique())
        .addColumn("title", "varchar(255)", (col: any) => col.notNull())
        .addColumn("event_type", "varchar(64)", (col: any) => col.defaultTo("conference"))
        .addColumn("category", "varchar(64)", (col: any) => col.defaultTo("General Healthcare"))
        .addColumn("short_description", "text")
        .addColumn("description", "text", (col: any) => col.notNull())
        .addColumn("cover_url", "text")
        .addColumn("organizer_type", "varchar(32)", (col: any) => col.defaultTo("individual"))
        .addColumn("organizer_id", "text", (col: any) => col.notNull())
        .addColumn("organization_id", "text")
        .addColumn("start_time", "timestamptz", (col: any) => col.notNull())
        .addColumn("end_time", "timestamptz", (col: any) => col.notNull())
        .addColumn("timezone", "varchar(64)", (col: any) => col.defaultTo("Asia/Kolkata"))
        .addColumn("format", "varchar(32)", (col: any) => col.defaultTo("online"))
        .addColumn("venue_name", "text")
        .addColumn("address", "text")
        .addColumn("city", "text")
        .addColumn("state", "text")
        .addColumn("country", "text", (col: any) => col.defaultTo("India"))
        .addColumn("online_meeting_url", "text")
        .addColumn("online_meeting_platform", "varchar(64)")
        .addColumn("price", "numeric(10,2)", (col: any) => col.defaultTo(0))
        .addColumn("currency", "varchar(8)", (col: any) => col.defaultTo("INR"))
        .addColumn("is_free", "boolean", (col: any) => col.defaultTo(true))
        .addColumn("capacity", "integer")
        .addColumn("registered_count", "integer", (col: any) => col.defaultTo(0))
        .addColumn("cme_credits", "numeric(4,1)", (col: any) => col.defaultTo(0))
        .addColumn("cme_accreditation_body", "text")
        .addColumn("certificate_enabled", "boolean", (col: any) => col.defaultTo(false))
        .addColumn("certificate_template", "text", (col: any) => col.defaultTo("standard"))
        .addColumn("status", "varchar(32)", (col: any) => col.defaultTo("draft"))
        .addColumn("rejection_reason", "text")
        .addColumn("requirements", "text[]" as any)
        .addColumn("tags", "text[]" as any)
        .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
        .addColumn("updated_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
        .addColumn("published_at", "timestamptz")
        .execute();

      await db.schema
        .createTable("event_speakers")
        .ifNotExists()
        .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
        .addColumn("event_id", "varchar(64)", (col: any) => col.notNull())
        .addColumn("user_id", "text")
        .addColumn("name", "varchar(255)", (col: any) => col.notNull())
        .addColumn("title", "varchar(255)")
        .addColumn("organization", "varchar(255)")
        .addColumn("bio", "text")
        .addColumn("avatar_url", "text")
        .addColumn("topic", "varchar(255)")
        .addColumn("order_index", "integer", (col: any) => col.defaultTo(0))
        .execute();

      await db.schema
        .createTable("event_agenda")
        .ifNotExists()
        .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
        .addColumn("event_id", "varchar(64)", (col: any) => col.notNull())
        .addColumn("title", "varchar(255)", (col: any) => col.notNull())
        .addColumn("description", "text")
        .addColumn("speaker_name", "varchar(255)")
        .addColumn("start_time", "timestamptz", (col: any) => col.notNull())
        .addColumn("end_time", "timestamptz", (col: any) => col.notNull())
        .addColumn("order_index", "integer", (col: any) => col.defaultTo(0))
        .execute();

      await db.schema
        .createTable("event_registrations")
        .ifNotExists()
        .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
        .addColumn("event_id", "varchar(64)", (col: any) => col.notNull())
        .addColumn("user_id", "text", (col: any) => col.notNull())
        .addColumn("status", "varchar(32)", (col: any) => col.defaultTo("confirmed"))
        .addColumn("ticket_number", "varchar(64)")
        .addColumn("answers", "jsonb")
        .addColumn("attended_at", "timestamptz")
        .addColumn("registered_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
        .execute();
    } catch {
      // Tables ready
    }
  }

  static async findMany(params: EventFilterParams, currentUserId?: string): Promise<{ items: EventRecord[]; total: number }> {
    await this.ensureTables();
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;

    let q = db
      .selectFrom("events as e")
      .leftJoin("user as u", "u.id", "e.organizer_id")
      .leftJoin("professional_profiles as pp", "pp.user_id", "e.organizer_id")
      .leftJoin("organizations as o", "o.id", "e.organization_id")
      .select([
        "e.id",
        "e.slug",
        "e.title",
        "e.event_type",
        "e.category",
        "e.short_description",
        "e.description",
        "e.cover_url",
        "e.organizer_type",
        "e.organizer_id",
        "e.organization_id",
        "e.start_time",
        "e.end_time",
        "e.timezone",
        "e.format",
        "e.venue_name",
        "e.address",
        "e.city",
        "e.state",
        "e.country",
        "e.online_meeting_url",
        "e.online_meeting_platform",
        "e.price",
        "e.currency",
        "e.is_free",
        "e.capacity",
        "e.registered_count",
        "e.cme_credits",
        "e.cme_accreditation_body",
        "e.certificate_enabled",
        "e.certificate_template",
        "e.status",
        "e.rejection_reason",
        "e.requirements",
        "e.tags",
        "e.created_at",
        "e.updated_at",
        "e.published_at",
        "u.name as organizer_name",
        "u.image as organizer_image",
        "pp.profession as organizer_profession",
        "pp.identity_verified as organizer_verified",
        "o.name as organization_name",
        "o.slug as organization_slug",
        "o.verification_status as organization_verification",
      ]);

    if (params.organizer_id) {
      q = q.where("e.organizer_id", "=", params.organizer_id);
    } else {
      q = q.where("e.status", "in", ["published", "approved"]);
    }

    if (params.search) {
      const term = `%${params.search}%`;
      q = q.where((eb: any) =>
        eb.or([
          eb("e.title", "ilike", term),
          eb("e.description", "ilike", term),
          eb("e.city", "ilike", term),
          eb("e.category", "ilike", term),
        ])
      );
    }

    if (params.event_type) {
      q = q.where("e.event_type", "=", params.event_type);
    }

    if (params.category) {
      q = q.where("e.category", "=", params.category);
    }

    if (params.format) {
      q = q.where("e.format", "=", params.format);
    }

    if (params.city) {
      q = q.where("e.city", "ilike", params.city);
    }

    if (params.is_free !== undefined) {
      q = q.where("e.is_free", "=", params.is_free);
    }

    if (params.timeframe === "upcoming") {
      q = q.where("e.end_time", ">=", new Date());
    } else if (params.timeframe === "past") {
      q = q.where("e.end_time", "<", new Date());
    }

    const countResult = await q
      .select((eb: any) => eb.fn.countAll().as("total_count"))
      .executeTakeFirst() as any;
    const total = parseInt(countResult?.total_count || "0", 10);

    const rows = await q
      .orderBy("e.start_time", "asc")
      .limit(limit)
      .offset(offset)
      .execute();

    let userRegistrations: Set<string> = new Set();
    if (currentUserId && rows.length > 0) {
      const regRows = await db
        .selectFrom("event_registrations" as any)
        .select(["event_id"])
        .where("user_id", "=", currentUserId)
        .where("status", "=", "confirmed")
        .where("event_id", "in", rows.map((r: any) => r.id))
        .execute() as any[];
      userRegistrations = new Set(regRows.map((r) => r.event_id));
    }

    const items: EventRecord[] = rows.map((r: any) => ({
      ...r,
      is_user_registered: userRegistrations.has(r.id),
    }));

    return { items, total };
  }

  static async findById(id: string, currentUserId?: string): Promise<EventRecord | null> {
    await this.ensureTables();
    const row = await db
      .selectFrom("events as e")
      .leftJoin("user as u", "u.id", "e.organizer_id")
      .leftJoin("professional_profiles as pp", "pp.user_id", "e.organizer_id")
      .leftJoin("organizations as o", "o.id", "e.organization_id")
      .selectAll("e")
      .select([
        "u.name as organizer_name",
        "u.image as organizer_image",
        "pp.profession as organizer_profession",
        "pp.identity_verified as organizer_verified",
        "o.name as organization_name",
        "o.slug as organization_slug",
        "o.verification_status as organization_verification",
      ])
      .where("e.id", "=", id)
      .executeTakeFirst() as any;

    if (!row) return null;

    const speakers = await db
      .selectFrom("event_speakers" as any)
      .selectAll()
      .where("event_id", "=", id)
      .orderBy("order_index", "asc")
      .execute() as EventSpeaker[];

    const agenda = await db
      .selectFrom("event_agenda" as any)
      .selectAll()
      .where("event_id", "=", id)
      .orderBy("order_index", "asc")
      .execute() as EventAgendaItem[];

    let is_user_registered = false;
    if (currentUserId) {
      const reg = await db
        .selectFrom("event_registrations" as any)
        .select(["id"])
        .where("event_id", "=", id)
        .where("user_id", "=", currentUserId)
        .where("status", "=", "confirmed")
        .executeTakeFirst();
      is_user_registered = !!reg;
    }

    return {
      ...row,
      speakers,
      agenda,
      is_user_registered,
    };
  }

  static async create(input: CreateEventInput, organizerId: string): Promise<EventRecord> {
    await this.ensureTables();
    const id = crypto.randomUUID();
    const baseSlug = input.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    const slug = `${baseSlug}-${crypto.randomBytes(2).toString("hex")}`;

    const status = input.submit_for_review ? "pending_review" : "draft";

    const newEvent = {
      id,
      slug,
      title: input.title,
      event_type: input.event_type,
      category: input.category || "General Healthcare",
      short_description: input.short_description || null,
      description: input.description,
      cover_url: input.cover_url || null,
      organizer_type: input.organization_id ? "organization" : "individual",
      organizer_id: organizerId,
      organization_id: input.organization_id || null,
      start_time: new Date(input.start_time),
      end_time: new Date(input.end_time),
      timezone: input.timezone || "Asia/Kolkata",
      format: input.format,
      venue_name: input.venue_name || null,
      address: input.address || null,
      city: input.city || null,
      state: input.state || null,
      country: input.country || "India",
      online_meeting_url: input.online_meeting_url || null,
      online_meeting_platform: input.online_meeting_platform || null,
      price: input.is_free ? 0 : input.price || 0,
      currency: input.currency || "INR",
      is_free: input.is_free ?? true,
      capacity: input.capacity || null,
      registered_count: 0,
      cme_credits: input.cme_credits || 0,
      cme_accreditation_body: input.cme_accreditation_body || null,
      certificate_enabled: input.certificate_enabled ?? false,
      certificate_template: "standard",
      status,
      requirements: input.requirements || [],
      tags: input.tags || [],
      created_at: new Date(),
      updated_at: new Date(),
      published_at: null,
    };

    await db
      .insertInto("events" as any)
      .values(newEvent)
      .execute();

    // Insert speakers if any
    if (input.speakers && input.speakers.length > 0) {
      for (let i = 0; i < input.speakers.length; i++) {
        const s = input.speakers[i];
        await db
          .insertInto("event_speakers" as any)
          .values({
            id: crypto.randomUUID(),
            event_id: id,
            name: s.name,
            title: s.title || null,
            organization: s.organization || null,
            bio: s.bio || null,
            avatar_url: s.avatar_url || null,
            topic: s.topic || null,
            order_index: i,
          })
          .execute();
      }
    }

    // Insert agenda if any
    if (input.agenda && input.agenda.length > 0) {
      for (let i = 0; i < input.agenda.length; i++) {
        const a = input.agenda[i];
        await db
          .insertInto("event_agenda" as any)
          .values({
            id: crypto.randomUUID(),
            event_id: id,
            title: a.title,
            description: a.description || null,
            speaker_name: a.speaker_name || null,
            start_time: new Date(a.start_time),
            end_time: new Date(a.end_time),
            order_index: i,
          })
          .execute();
      }
    }

    const created = await this.findById(id, organizerId);
    return created!;
  }

  static async findUserRegisteredEvents(userId: string): Promise<EventRecord[]> {
    await this.ensureTables();
    const rows = await db
      .selectFrom("event_registrations as er")
      .innerJoin("events as e", "e.id", "er.event_id")
      .leftJoin("user as u", "u.id", "e.organizer_id")
      .leftJoin("organizations as o", "o.id", "e.organization_id")
      .selectAll("e")
      .select([
        "u.name as organizer_name",
        "o.name as organization_name",
        "er.ticket_number as ticket_number",
        "er.status as registration_status",
      ])
      .where("er.user_id", "=", userId)
      .where("er.status", "in", ["confirmed", "attended"])
      .orderBy("e.start_time", "desc")
      .execute();

    return rows.map((r: any) => ({
      ...r,
      is_user_registered: true,
    }));
  }

  static async findUserOrganizedEvents(userId: string): Promise<EventRecord[]> {
    await this.ensureTables();
    const rows = await db
      .selectFrom("events as e")
      .leftJoin("organizations as o", "o.id", "e.organization_id")
      .selectAll("e")
      .select(["o.name as organization_name"])
      .where("e.organizer_id", "=", userId)
      .orderBy("e.created_at", "desc")
      .execute();

    return rows as EventRecord[];
  }
}
