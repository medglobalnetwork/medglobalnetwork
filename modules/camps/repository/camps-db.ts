// ============================================================
// MGN Medical Camps Repository
// modules/camps/repository/camps-db.ts
// ============================================================

import { database } from "@/lib/auth";
import crypto from "crypto";
import { CampFilterParams, CampRecord, CampRequiredRole, CampVolunteerApplication, CreateCampInput, CampReportRecord } from "../domain/types";

const db = database as any;

export class CampsRepository {
  static async ensureTables(): Promise<void> {
    try {
      await db.schema
        .createTable("camps")
        .ifNotExists()
        .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
        .addColumn("slug", "varchar(255)", (col: any) => col.notNull().unique())
        .addColumn("title", "varchar(255)", (col: any) => col.notNull())
        .addColumn("camp_type", "varchar(64)", (col: any) => col.defaultTo("health_screening"))
        .addColumn("description", "text", (col: any) => col.notNull())
        .addColumn("cover_url", "text")
        .addColumn("organizer_type", "varchar(32)", (col: any) => col.defaultTo("organization"))
        .addColumn("organizer_id", "text", (col: any) => col.notNull())
        .addColumn("organization_id", "text")
        .addColumn("start_date", "timestamptz", (col: any) => col.notNull())
        .addColumn("end_date", "timestamptz", (col: any) => col.notNull())
        .addColumn("venue_name", "text", (col: any) => col.notNull())
        .addColumn("address", "text", (col: any) => col.notNull())
        .addColumn("city", "text", (col: any) => col.notNull())
        .addColumn("state", "text", (col: any) => col.notNull())
        .addColumn("country", "text", (col: any) => col.defaultTo("India"))
        .addColumn("target_population", "text")
        .addColumn("expected_beneficiaries", "integer", (col: any) => col.defaultTo(0))
        .addColumn("participant_capacity", "integer")
        .addColumn("participant_registered_count", "integer", (col: any) => col.defaultTo(0))
        .addColumn("services", "text[]" as any)
        .addColumn("guidelines", "text")
        .addColumn("certificate_enabled", "boolean", (col: any) => col.defaultTo(true))
        .addColumn("status", "varchar(32)", (col: any) => col.defaultTo("draft"))
        .addColumn("rejection_reason", "text")
        .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
        .addColumn("updated_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
        .addColumn("published_at", "timestamptz")
        .execute();

      await db.schema
        .createTable("camp_required_roles")
        .ifNotExists()
        .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
        .addColumn("camp_id", "varchar(64)", (col: any) => col.notNull())
        .addColumn("role_title", "varchar(128)", (col: any) => col.notNull())
        .addColumn("is_professional", "boolean", (col: any) => col.defaultTo(true))
        .addColumn("profession", "varchar(64)")
        .addColumn("slots_needed", "integer", (col: any) => col.defaultTo(1))
        .addColumn("slots_filled", "integer", (col: any) => col.defaultTo(0))
        .addColumn("description", "text")
        .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
        .execute();

      await db.schema
        .createTable("camp_volunteers")
        .ifNotExists()
        .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
        .addColumn("camp_id", "varchar(64)", (col: any) => col.notNull())
        .addColumn("user_id", "text", (col: any) => col.notNull())
        .addColumn("role_id", "varchar(64)", (col: any) => col.notNull())
        .addColumn("status", "varchar(32)", (col: any) => col.defaultTo("pending"))
        .addColumn("application_note", "text")
        .addColumn("reviewed_by", "text")
        .addColumn("reviewed_at", "timestamptz")
        .addColumn("attended", "boolean", (col: any) => col.defaultTo(false))
        .addColumn("attendance_marked_at", "timestamptz")
        .addColumn("certificate_issued", "boolean", (col: any) => col.defaultTo(false))
        .addColumn("certificate_id", "varchar(64)")
        .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
        .addColumn("updated_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
        .execute();

      await db.schema
        .createTable("camp_registrations")
        .ifNotExists()
        .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
        .addColumn("camp_id", "varchar(64)", (col: any) => col.notNull())
        .addColumn("user_id", "text")
        .addColumn("participant_name", "varchar(255)", (col: any) => col.notNull())
        .addColumn("participant_phone", "varchar(32)")
        .addColumn("participant_age", "integer")
        .addColumn("participant_gender", "varchar(32)")
        .addColumn("registration_number", "varchar(64)")
        .addColumn("status", "varchar(32)", (col: any) => col.defaultTo("confirmed"))
        .addColumn("attended_at", "timestamptz")
        .addColumn("notes", "text")
        .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
        .addColumn("updated_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
        .execute();

      await db.schema
        .createTable("camp_reports")
        .ifNotExists()
        .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
        .addColumn("camp_id", "varchar(64)", (col: any) => col.notNull().unique())
        .addColumn("submitted_by", "text", (col: any) => col.notNull())
        .addColumn("participants_screened", "integer", (col: any) => col.defaultTo(0))
        .addColumn("volunteers_present", "integer", (col: any) => col.defaultTo(0))
        .addColumn("professionals_present", "integer", (col: any) => col.defaultTo(0))
        .addColumn("referrals_made", "integer", (col: any) => col.defaultTo(0))
        .addColumn("services_delivered", "text[]" as any)
        .addColumn("key_findings_summary", "text", (col: any) => col.notNull())
        .addColumn("challenges_and_feedback", "text")
        .addColumn("photos", "text[]" as any)
        .addColumn("documents", "text[]" as any)
        .addColumn("status", "varchar(32)", (col: any) => col.defaultTo("submitted"))
        .addColumn("verified_by", "text")
        .addColumn("verified_at", "timestamptz")
        .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
        .addColumn("updated_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
        .execute();
    } catch {
      // Tables ready
    }
  }

  static async findMany(params: CampFilterParams, currentUserId?: string): Promise<{ items: CampRecord[]; total: number }> {
    await this.ensureTables();
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;

    let q = db
      .selectFrom("camps as c")
      .leftJoin("user as u", "u.id", "c.organizer_id")
      .leftJoin("professional_profiles as pp", "pp.user_id", "c.organizer_id")
      .leftJoin("organizations as o", "o.id", "c.organization_id")
      .select([
        "c.id",
        "c.slug",
        "c.title",
        "c.camp_type",
        "c.description",
        "c.cover_url",
        "c.organizer_type",
        "c.organizer_id",
        "c.organization_id",
        "c.start_date",
        "c.end_date",
        "c.venue_name",
        "c.address",
        "c.city",
        "c.state",
        "c.country",
        "c.target_population",
        "c.expected_beneficiaries",
        "c.participant_capacity",
        "c.participant_registered_count",
        "c.services",
        "c.guidelines",
        "c.certificate_enabled",
        "c.status",
        "c.rejection_reason",
        "c.created_at",
        "c.updated_at",
        "c.published_at",
        "u.name as organizer_name",
        "u.image as organizer_image",
        "pp.profession as organizer_profession",
        "pp.identity_verified as organizer_verified",
        "o.name as organization_name",
        "o.slug as organization_slug",
        "o.verification_status as organization_verification",
      ]);

    if (params.organizer_id) {
      q = q.where("c.organizer_id", "=", params.organizer_id);
    } else {
      q = q.where("c.status", "in", ["published", "approved", "active", "completed"]);
    }

    if (params.search) {
      const term = `%${params.search}%`;
      q = q.where((eb: any) =>
        eb.or([
          eb("c.title", "ilike", term),
          eb("c.description", "ilike", term),
          eb("c.city", "ilike", term),
          eb("c.venue_name", "ilike", term),
        ])
      );
    }

    if (params.camp_type) {
      q = q.where("c.camp_type", "=", params.camp_type);
    }

    if (params.city) {
      q = q.where("c.city", "ilike", params.city);
    }

    if (params.timeframe === "upcoming") {
      q = q.where("c.end_date", ">=", new Date());
    } else if (params.timeframe === "past") {
      q = q.where("c.end_date", "<", new Date());
    }

    const countResult = await q
      .select((eb: any) => eb.fn.countAll().as("total_count"))
      .executeTakeFirst() as any;
    const total = parseInt(countResult?.total_count || "0", 10);

    const rows = await q
      .orderBy("c.start_date", "asc")
      .limit(limit)
      .offset(offset)
      .execute();

    let userVolunteerMap: Map<string, any> = new Map();
    let userParticipantSet: Set<string> = new Set();

    if (currentUserId && rows.length > 0) {
      const campIds = rows.map((r: any) => r.id);
      const [volRows, partRows] = await Promise.all([
        db
          .selectFrom("camp_volunteers" as any)
          .select(["camp_id", "role_id", "status"])
          .where("user_id", "=", currentUserId)
          .where("camp_id", "in", campIds)
          .execute() as any[],
        db
          .selectFrom("camp_registrations" as any)
          .select(["camp_id"])
          .where("user_id", "=", currentUserId)
          .where("camp_id", "in", campIds)
          .execute() as any[],
      ]);

      volRows.forEach((v: any) => userVolunteerMap.set(v.camp_id, v));
      partRows.forEach((p: any) => userParticipantSet.add(p.camp_id));
    }

    const items: CampRecord[] = rows.map((r: any) => {
      const volInfo = userVolunteerMap.get(r.id);
      return {
        ...r,
        user_volunteer_status: volInfo?.status || null,
        user_volunteer_role_id: volInfo?.role_id || null,
        is_user_participant: userParticipantSet.has(r.id),
      };
    });

    return { items, total };
  }

  static async findById(id: string, currentUserId?: string): Promise<CampRecord | null> {
    await this.ensureTables();
    const row = await db
      .selectFrom("camps as c")
      .leftJoin("user as u", "u.id", "c.organizer_id")
      .leftJoin("professional_profiles as pp", "pp.user_id", "c.organizer_id")
      .leftJoin("organizations as o", "o.id", "c.organization_id")
      .selectAll("c")
      .select([
        "u.name as organizer_name",
        "u.image as organizer_image",
        "pp.profession as organizer_profession",
        "pp.identity_verified as organizer_verified",
        "o.name as organization_name",
        "o.slug as organization_slug",
        "o.verification_status as organization_verification",
      ])
      .where("c.id", "=", id)
      .executeTakeFirst() as any;

    if (!row) return null;

    const required_roles = await db
      .selectFrom("camp_required_roles" as any)
      .selectAll()
      .where("camp_id", "=", id)
      .execute() as CampRequiredRole[];

    const report = await db
      .selectFrom("camp_reports" as any)
      .selectAll()
      .where("camp_id", "=", id)
      .executeTakeFirst() as CampReportRecord | undefined;

    let user_volunteer_status: string | null = null;
    let user_volunteer_role_id: string | null = null;
    let is_user_participant = false;

    if (currentUserId) {
      const vol = await db
        .selectFrom("camp_volunteers" as any)
        .selectAll()
        .where("camp_id", "=", id)
        .where("user_id", "=", currentUserId)
        .executeTakeFirst() as any;

      if (vol) {
        user_volunteer_status = vol.status;
        user_volunteer_role_id = vol.role_id;
      }

      const part = await db
        .selectFrom("camp_registrations" as any)
        .select(["id"])
        .where("camp_id", "=", id)
        .where("user_id", "=", currentUserId)
        .executeTakeFirst();

      is_user_participant = !!part;
    }

    return {
      ...row,
      required_roles,
      user_volunteer_status,
      user_volunteer_role_id,
      is_user_participant,
      report: report || null,
    };
  }

  static async create(input: CreateCampInput, organizerId: string): Promise<CampRecord> {
    await this.ensureTables();
    const id = crypto.randomUUID();
    const baseSlug = input.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    const slug = `${baseSlug}-${crypto.randomBytes(2).toString("hex")}`;

    const status = input.submit_for_review ? "pending_review" : "draft";

    const newCamp = {
      id,
      slug,
      title: input.title,
      camp_type: input.camp_type,
      description: input.description,
      cover_url: input.cover_url || null,
      organizer_type: input.organization_id ? "organization" : "individual",
      organizer_id: organizerId,
      organization_id: input.organization_id || null,
      start_date: new Date(input.start_date),
      end_date: new Date(input.end_date),
      venue_name: input.venue_name,
      address: input.address,
      city: input.city,
      state: input.state,
      country: input.country || "India",
      target_population: input.target_population || null,
      expected_beneficiaries: input.expected_beneficiaries || 0,
      participant_capacity: input.participant_capacity || null,
      participant_registered_count: 0,
      services: input.services || [],
      guidelines: input.guidelines || null,
      certificate_enabled: input.certificate_enabled ?? true,
      status,
      created_at: new Date(),
      updated_at: new Date(),
      published_at: null,
    };

    await db
      .insertInto("camps" as any)
      .values(newCamp)
      .execute();

    if (input.required_roles && input.required_roles.length > 0) {
      for (const role of input.required_roles) {
        await db
          .insertInto("camp_required_roles" as any)
          .values({
            id: crypto.randomUUID(),
            camp_id: id,
            role_title: role.role_title,
            is_professional: role.is_professional,
            profession: role.profession || null,
            slots_needed: role.slots_needed || 1,
            slots_filled: 0,
            description: role.description || null,
            created_at: new Date(),
          })
          .execute();
      }
    }

    const created = await this.findById(id, organizerId);
    return created!;
  }

  static async findCampVolunteers(campId: string): Promise<CampVolunteerApplication[]> {
    await this.ensureTables();
    const rows = await db
      .selectFrom("camp_volunteers as cv")
      .innerJoin("user as u", "u.id", "cv.user_id")
      .leftJoin("professional_profiles as pp", "pp.user_id", "cv.user_id")
      .leftJoin("camp_required_roles as crr", "crr.id", "cv.role_id")
      .select([
        "cv.id",
        "cv.camp_id",
        "cv.user_id",
        "cv.role_id",
        "cv.status",
        "cv.application_note",
        "cv.attended",
        "cv.certificate_issued",
        "cv.created_at",
        "u.name as user_name",
        "u.image as user_image",
        "pp.profession as user_profession",
        "pp.specialization as user_specialization",
        "crr.role_title as role_title",
      ])
      .where("cv.camp_id", "=", campId)
      .orderBy("cv.created_at", "asc")
      .execute();

    return rows as CampVolunteerApplication[];
  }

  static async findUserVolunteerCamps(userId: string): Promise<any[]> {
    await this.ensureTables();
    const rows = await db
      .selectFrom("camp_volunteers as cv")
      .innerJoin("camps as c", "c.id", "cv.camp_id")
      .leftJoin("camp_required_roles as crr", "crr.id", "cv.role_id")
      .leftJoin("organizations as o", "o.id", "c.organization_id")
      .selectAll("c")
      .select([
        "cv.id as volunteer_application_id",
        "cv.status as volunteer_status",
        "cv.attended as volunteer_attended",
        "cv.certificate_issued",
        "crr.role_title",
        "o.name as organization_name",
      ])
      .where("cv.user_id", "=", userId)
      .orderBy("c.start_date", "desc")
      .execute();

    return rows;
  }
}
