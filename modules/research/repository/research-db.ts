// ============================================================
// MGN Research Repository
// modules/research/repository/research-db.ts
// ============================================================

import { database } from "@/lib/auth";
import crypto from "crypto";
import {
  AddPublicationInput,
  CreateResearchOpportunityInput,
  CreateResearchProjectInput,
  ResearchCollabRequestRecord,
  ResearchMemberRecord,
  ResearchOpportunityRecord,
  ResearchProjectRecord,
  ResearchPublicationRecord,
} from "../domain/types";

const db = database as any;

export class ResearchRepository {
  static async ensureTables(): Promise<void> {
    try {
      await db.schema
        .createTable("research_projects")
        .ifNotExists()
        .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
        .addColumn("slug", "varchar(255)", (col: any) => col.notNull().unique())
        .addColumn("title", "varchar(255)", (col: any) => col.notNull())
        .addColumn("lead_researcher_id", "text", (col: any) => col.notNull())
        .addColumn("organization_id", "text")
        .addColumn("research_area", "varchar(128)", (col: any) => col.notNull())
        .addColumn("abstract", "text", (col: any) => col.notNull())
        .addColumn("methodology", "text")
        .addColumn("research_questions", "text[]" as any)
        .addColumn("required_skills", "text[]" as any)
        .addColumn("status", "varchar(32)", (col: any) => col.defaultTo("draft"))
        .addColumn("start_date", "timestamptz")
        .addColumn("estimated_end_date", "timestamptz")
        .addColumn("cover_url", "text")
        .addColumn("ethical_approval_number", "varchar(128)")
        .addColumn("funding_status", "varchar(64)", (col: any) => col.defaultTo("unfunded"))
        .addColumn("documents", "jsonb")
        .addColumn("collaborators_count", "integer", (col: any) => col.defaultTo(1))
        .addColumn("views_count", "integer", (col: any) => col.defaultTo(0))
        .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
        .addColumn("updated_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
        .addColumn("published_at", "timestamptz")
        .execute();

      await db.schema
        .createTable("research_project_members")
        .ifNotExists()
        .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
        .addColumn("project_id", "varchar(64)", (col: any) => col.notNull())
        .addColumn("user_id", "text", (col: any) => col.notNull())
        .addColumn("role", "varchar(64)", (col: any) => col.defaultTo("collaborator"))
        .addColumn("contribution_details", "text")
        .addColumn("joined_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
        .execute();

      await db.schema
        .createTable("research_collaboration_requests")
        .ifNotExists()
        .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
        .addColumn("project_id", "varchar(64)", (col: any) => col.notNull())
        .addColumn("sender_id", "text", (col: any) => col.notNull())
        .addColumn("receiver_id", "text", (col: any) => col.notNull())
        .addColumn("role_applied", "varchar(64)")
        .addColumn("proposal_message", "text", (col: any) => col.notNull())
        .addColumn("status", "varchar(32)", (col: any) => col.defaultTo("pending"))
        .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
        .addColumn("responded_at", "timestamptz")
        .execute();

      await db.schema
        .createTable("research_opportunities")
        .ifNotExists()
        .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
        .addColumn("project_id", "varchar(64)")
        .addColumn("organization_id", "text")
        .addColumn("created_by", "text", (col: any) => col.notNull())
        .addColumn("title", "varchar(255)", (col: any) => col.notNull())
        .addColumn("opportunity_type", "varchar(64)", (col: any) => col.defaultTo("research_assistant"))
        .addColumn("description", "text", (col: any) => col.notNull())
        .addColumn("required_qualifications", "text[]" as any)
        .addColumn("required_skills", "text[]" as any)
        .addColumn("stipend_amount", "numeric(10,2)")
        .addColumn("stipend_currency", "varchar(8)", (col: any) => col.defaultTo("INR"))
        .addColumn("is_funded", "boolean", (col: any) => col.defaultTo(false))
        .addColumn("location_type", "varchar(32)", (col: any) => col.defaultTo("remote"))
        .addColumn("city", "text")
        .addColumn("application_deadline", "timestamptz")
        .addColumn("slots_available", "integer", (col: any) => col.defaultTo(1))
        .addColumn("applicant_count", "integer", (col: any) => col.defaultTo(0))
        .addColumn("status", "varchar(32)", (col: any) => col.defaultTo("published"))
        .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
        .addColumn("updated_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
        .execute();

      await db.schema
        .createTable("research_opportunity_applications")
        .ifNotExists()
        .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
        .addColumn("opportunity_id", "varchar(64)", (col: any) => col.notNull())
        .addColumn("applicant_id", "text", (col: any) => col.notNull())
        .addColumn("cover_letter", "text")
        .addColumn("resume_url", "text")
        .addColumn("status", "varchar(32)", (col: any) => col.defaultTo("applied"))
        .addColumn("applied_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
        .addColumn("reviewed_at", "timestamptz")
        .execute();

      await db.schema
        .createTable("research_publications")
        .ifNotExists()
        .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
        .addColumn("user_id", "text", (col: any) => col.notNull())
        .addColumn("project_id", "varchar(64)")
        .addColumn("title", "varchar(500)", (col: any) => col.notNull())
        .addColumn("authors", "text[]" as any)
        .addColumn("journal_or_conference", "varchar(255)", (col: any) => col.notNull())
        .addColumn("publication_date", "date")
        .addColumn("doi", "varchar(255)")
        .addColumn("abstract", "text")
        .addColumn("research_area", "varchar(128)")
        .addColumn("external_url", "text")
        .addColumn("pdf_url", "text")
        .addColumn("citation_count", "integer", (col: any) => col.defaultTo(0))
        .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
        .addColumn("updated_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
        .execute();
    } catch {
      // Handled
    }
  }

  static async findProjects(filters: {
    search?: string;
    research_area?: string;
    status?: string;
    recruiting_only?: boolean;
    page?: number;
    limit?: number;
    lead_id?: string;
  }, currentUserId?: string): Promise<{ items: ResearchProjectRecord[]; total: number }> {
    await this.ensureTables();
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    let q = db
      .selectFrom("research_projects as rp")
      .leftJoin("user as u", "u.id", "rp.lead_researcher_id")
      .leftJoin("professional_profiles as pp", "pp.user_id", "rp.lead_researcher_id")
      .leftJoin("organizations as o", "o.id", "rp.organization_id")
      .select([
        "rp.id",
        "rp.slug",
        "rp.title",
        "rp.lead_researcher_id",
        "rp.organization_id",
        "rp.research_area",
        "rp.abstract",
        "rp.methodology",
        "rp.research_questions",
        "rp.required_skills",
        "rp.status",
        "rp.start_date",
        "rp.estimated_end_date",
        "rp.cover_url",
        "rp.ethical_approval_number",
        "rp.funding_status",
        "rp.documents",
        "rp.collaborators_count",
        "rp.views_count",
        "rp.created_at",
        "rp.updated_at",
        "rp.published_at",
        "u.name as lead_name",
        "u.image as lead_image",
        "pp.profession as lead_profession",
        "pp.identity_verified as lead_verified",
        "o.name as organization_name",
        "o.slug as organization_slug",
        "o.verification_status as organization_verification",
      ]);

    if (filters.lead_id) {
      q = q.where("rp.lead_researcher_id", "=", filters.lead_id);
    } else {
      q = q.where("rp.status", "in", ["active", "recruiting", "completed"]);
    }

    if (filters.search) {
      const term = `%${filters.search}%`;
      q = q.where((eb: any) =>
        eb.or([
          eb("rp.title", "ilike", term),
          eb("rp.abstract", "ilike", term),
          eb("rp.research_area", "ilike", term),
        ])
      );
    }

    if (filters.research_area) {
      q = q.where("rp.research_area", "=", filters.research_area);
    }

    if (filters.recruiting_only) {
      q = q.where("rp.status", "=", "recruiting");
    }

    const countResult = await q
      .select((eb: any) => eb.fn.countAll().as("total_count"))
      .executeTakeFirst() as any;
    const total = parseInt(countResult?.total_count || "0", 10);

    const rows = await q
      .orderBy("rp.created_at", "desc")
      .limit(limit)
      .offset(offset)
      .execute();

    return { items: rows as ResearchProjectRecord[], total };
  }

  static async findProjectById(id: string, currentUserId?: string): Promise<ResearchProjectRecord | null> {
    await this.ensureTables();
    const row = await db
      .selectFrom("research_projects as rp")
      .leftJoin("user as u", "u.id", "rp.lead_researcher_id")
      .leftJoin("professional_profiles as pp", "pp.user_id", "rp.lead_researcher_id")
      .leftJoin("organizations as o", "o.id", "rp.organization_id")
      .selectAll("rp")
      .select([
        "u.name as lead_name",
        "u.image as lead_image",
        "pp.profession as lead_profession",
        "pp.identity_verified as lead_verified",
        "o.name as organization_name",
        "o.slug as organization_slug",
        "o.verification_status as organization_verification",
      ])
      .where("rp.id", "=", id)
      .executeTakeFirst() as any;

    if (!row) return null;

    const members = await db
      .selectFrom("research_project_members as rpm")
      .innerJoin("user as u", "u.id", "rpm.user_id")
      .leftJoin("professional_profiles as pp", "pp.user_id", "rpm.user_id")
      .select([
        "rpm.id",
        "rpm.project_id",
        "rpm.user_id",
        "rpm.role",
        "rpm.contribution_details",
        "rpm.joined_at",
        "u.name as user_name",
        "u.image as user_image",
        "pp.profession as user_profession",
        "pp.specialization as user_specialization",
      ])
      .where("rpm.project_id", "=", id)
      .execute() as ResearchMemberRecord[];

    const opportunities = await db
      .selectFrom("research_opportunities as ro")
      .selectAll("ro")
      .where("ro.project_id", "=", id)
      .execute() as ResearchOpportunityRecord[];

    const publications = await db
      .selectFrom("research_publications as pub")
      .selectAll("pub")
      .where("pub.project_id", "=", id)
      .execute() as ResearchPublicationRecord[];

    let user_membership_role: string | null = null;
    let user_pending_collab_request = false;

    if (currentUserId) {
      if (row.lead_researcher_id === currentUserId) {
        user_membership_role = "lead";
      } else {
        const mem = members.find((m) => m.user_id === currentUserId);
        if (mem) user_membership_role = mem.role;

        const req = await db
          .selectFrom("research_collaboration_requests" as any)
          .select(["id"])
          .where("project_id", "=", id)
          .where("sender_id", "=", currentUserId)
          .where("status", "=", "pending")
          .executeTakeFirst();
        user_pending_collab_request = !!req;
      }
    }

    return {
      ...row,
      members,
      opportunities,
      publications,
      user_membership_role,
      user_pending_collab_request,
    };
  }

  static async createProject(input: CreateResearchProjectInput, leadId: string): Promise<ResearchProjectRecord> {
    await this.ensureTables();
    const id = crypto.randomUUID();
    const baseSlug = input.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    const slug = `${baseSlug}-${crypto.randomBytes(2).toString("hex")}`;

    const status = input.submit_for_review ? "active" : "draft";

    const newProject = {
      id,
      slug,
      title: input.title,
      lead_researcher_id: leadId,
      organization_id: input.organization_id || null,
      research_area: input.research_area,
      abstract: input.abstract,
      methodology: input.methodology || null,
      research_questions: input.research_questions || [],
      required_skills: input.required_skills || [],
      status,
      start_date: input.start_date ? new Date(input.start_date) : null,
      estimated_end_date: input.estimated_end_date ? new Date(input.estimated_end_date) : null,
      cover_url: input.cover_url || null,
      ethical_approval_number: input.ethical_approval_number || null,
      funding_status: input.funding_status || "unfunded",
      documents: input.documents ? JSON.stringify(input.documents) : null,
      collaborators_count: 1,
      views_count: 0,
      created_at: new Date(),
      updated_at: new Date(),
      published_at: status === "active" ? new Date() : null,
    };

    await db
      .insertInto("research_projects" as any)
      .values(newProject)
      .execute();

    // Add lead as project member
    await db
      .insertInto("research_project_members" as any)
      .values({
        id: crypto.randomUUID(),
        project_id: id,
        user_id: leadId,
        role: "lead",
        contribution_details: "Principal Investigator / Project Lead",
        joined_at: new Date(),
      })
      .execute();

    const created = await this.findProjectById(id, leadId);
    return created!;
  }

  static async findOpportunities(filters: { search?: string; type?: string; project_id?: string }, currentUserId?: string) {
    await this.ensureTables();
    let q = db
      .selectFrom("research_opportunities as ro")
      .leftJoin("user as u", "u.id", "ro.created_by")
      .leftJoin("professional_profiles as pp", "pp.user_id", "ro.created_by")
      .leftJoin("organizations as o", "o.id", "ro.organization_id")
      .leftJoin("research_projects as rp", "rp.id", "ro.project_id")
      .select([
        "ro.id",
        "ro.project_id",
        "ro.organization_id",
        "ro.created_by",
        "ro.title",
        "ro.opportunity_type",
        "ro.description",
        "ro.required_qualifications",
        "ro.required_skills",
        "ro.stipend_amount",
        "ro.stipend_currency",
        "ro.is_funded",
        "ro.location_type",
        "ro.city",
        "ro.application_deadline",
        "ro.slots_available",
        "ro.applicant_count",
        "ro.status",
        "ro.created_at",
        "u.name as creator_name",
        "u.image as creator_image",
        "pp.profession as creator_profession",
        "o.name as organization_name",
        "rp.title as project_title",
      ])
      .where("ro.status", "=", "published");

    if (filters.search) {
      const term = `%${filters.search}%`;
      q = q.where((eb: any) =>
        eb.or([
          eb("ro.title", "ilike", term),
          eb("ro.description", "ilike", term),
        ])
      );
    }

    if (filters.type) {
      q = q.where("ro.opportunity_type", "=", filters.type);
    }

    if (filters.project_id) {
      q = q.where("ro.project_id", "=", filters.project_id);
    }

    const rows = await q.orderBy("ro.created_at", "desc").execute();
    return rows;
  }

  static async findPublications(filters: { search?: string; research_area?: string; user_id?: string }) {
    await this.ensureTables();
    let q = db
      .selectFrom("research_publications as pub")
      .leftJoin("user as u", "u.id", "pub.user_id")
      .leftJoin("professional_profiles as pp", "pp.user_id", "pub.user_id")
      .leftJoin("research_projects as rp", "rp.id", "pub.project_id")
      .select([
        "pub.id",
        "pub.user_id",
        "pub.project_id",
        "pub.title",
        "pub.authors",
        "pub.journal_or_conference",
        "pub.publication_date",
        "pub.doi",
        "pub.abstract",
        "pub.research_area",
        "pub.external_url",
        "pub.pdf_url",
        "pub.citation_count",
        "pub.created_at",
        "u.name as author_name",
        "u.image as author_image",
        "pp.profession as author_profession",
        "rp.title as project_title",
      ]);

    if (filters.user_id) {
      q = q.where("pub.user_id", "=", filters.user_id);
    }

    if (filters.search) {
      const term = `%${filters.search}%`;
      q = q.where((eb: any) =>
        eb.or([
          eb("pub.title", "ilike", term),
          eb("pub.abstract", "ilike", term),
          eb("pub.journal_or_conference", "ilike", term),
        ])
      );
    }

    if (filters.research_area) {
      q = q.where("pub.research_area", "=", filters.research_area);
    }

    const rows = await q.orderBy("pub.publication_date", "desc").execute();
    return rows;
  }
}
