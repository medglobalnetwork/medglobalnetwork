// ============================================================
// MGN Research Application Service
// modules/research/services/research-service.ts
// ============================================================

import { ResearchRepository } from "../repository/research-db";
import {
  AddPublicationInput,
  CreateResearchOpportunityInput,
  CreateResearchProjectInput,
  ResearchProjectRecord,
} from "../domain/types";
import { OrganizerEligibilityService } from "@/modules/shared/permissions/organizer-eligibility-service";
import { SharedNotificationService } from "@/modules/shared/notifications/notification-service";
import { database } from "@/lib/auth";
import crypto from "crypto";

const db = database as any;

export class ResearchService {
  static async getProjects(filters: any, userId?: string) {
    return ResearchRepository.findProjects(filters, userId);
  }

  static async getProjectDetail(id: string, userId?: string): Promise<ResearchProjectRecord | null> {
    return ResearchRepository.findProjectById(id, userId);
  }

  static async createProject(input: CreateResearchProjectInput, userId: string): Promise<ResearchProjectRecord> {
    const eligibility = await OrganizerEligibilityService.canCreateResearchProject(userId, input.organization_id);
    if (!eligibility.eligible) {
      throw new Error(eligibility.reason || "You must be a verified healthcare professional or organization to create research projects.");
    }

    return ResearchRepository.createProject(input, userId);
  }

  static async requestCollaboration(projectId: string, senderId: string, roleApplied: string, proposalMessage: string) {
    const project = await ResearchRepository.findProjectById(projectId, senderId);
    if (!project) throw new Error("Research project not found.");

    if (project.lead_researcher_id === senderId) {
      throw new Error("You are already the lead investigator of this project.");
    }

    const existing = await db
      .selectFrom("research_collaboration_requests" as any)
      .selectAll()
      .where("project_id", "=", projectId)
      .where("sender_id", "=", senderId)
      .where("status", "=", "pending")
      .executeTakeFirst();

    if (existing) {
      throw new Error("A collaboration request is already pending for this project.");
    }

    const id = crypto.randomUUID();
    const req = {
      id,
      project_id: projectId,
      sender_id: senderId,
      receiver_id: project.lead_researcher_id,
      role_applied: roleApplied,
      proposal_message: proposalMessage,
      status: "pending",
      created_at: new Date(),
    };

    await db
      .insertInto("research_collaboration_requests" as any)
      .values(req)
      .execute();

    // Notify project lead
    await SharedNotificationService.notifyResearchCollabRequest({
      receiverId: project.lead_researcher_id,
      senderId,
      projectId,
      projectTitle: project.title,
      roleApplied,
    });

    return req;
  }

  static async respondCollaborationRequest(requestId: string, status: "accepted" | "declined", responderId: string) {
    const req = await db
      .selectFrom("research_collaboration_requests as rcr")
      .innerJoin("research_projects as rp", "rp.id", "rcr.project_id")
      .select(["rcr.id", "rcr.project_id", "rcr.sender_id", "rcr.receiver_id", "rcr.role_applied", "rp.title as project_title"])
      .where("rcr.id", "=", requestId)
      .where("rcr.receiver_id", "=", responderId)
      .executeTakeFirst() as any;

    if (!req) throw new Error("Collaboration request not found or not authorized.");

    await db
      .updateTable("research_collaboration_requests" as any)
      .set({ status, responded_at: new Date() })
      .where("id", "=", requestId)
      .execute();

    if (status === "accepted") {
      await db
        .insertInto("research_project_members" as any)
        .values({
          id: crypto.randomUUID(),
          project_id: req.project_id,
          user_id: req.sender_id,
          role: req.role_applied || "collaborator",
          contribution_details: "Collaborator",
          joined_at: new Date(),
        })
        .execute();

      await db
        .updateTable("research_projects" as any)
        .set((eb: any) => ({
          collaborators_count: eb("collaborators_count", "+", 1),
        }))
        .where("id", "=", req.project_id)
        .execute();
    }

    await SharedNotificationService.notifyResearchCollabStatus({
      receiverId: req.sender_id,
      projectId: req.project_id,
      projectTitle: req.project_title,
      status,
    });

    return { success: true, status };
  }

  static async getOpportunities(filters: any, userId?: string) {
    return ResearchRepository.findOpportunities(filters, userId);
  }

  static async createOpportunity(input: CreateResearchOpportunityInput, userId: string) {
    const eligibility = await OrganizerEligibilityService.canPublishResearchOpportunity(userId, input.organization_id);
    if (!eligibility.eligible) {
      throw new Error(eligibility.reason || "You must be a verified professional or organization to post research opportunities.");
    }

    await ResearchRepository.ensureTables();
    const id = crypto.randomUUID();
    const newOpp = {
      id,
      project_id: input.project_id || null,
      organization_id: input.organization_id || null,
      created_by: userId,
      title: input.title,
      opportunity_type: input.opportunity_type,
      description: input.description,
      required_qualifications: input.required_qualifications || [],
      required_skills: input.required_skills || [],
      stipend_amount: input.stipend_amount || null,
      stipend_currency: input.stipend_currency || "INR",
      is_funded: input.is_funded ?? false,
      location_type: input.location_type || "remote",
      city: input.city || null,
      application_deadline: input.application_deadline ? new Date(input.application_deadline) : null,
      slots_available: input.slots_available || 1,
      applicant_count: 0,
      status: "published",
      created_at: new Date(),
      updated_at: new Date(),
    };

    await db
      .insertInto("research_opportunities" as any)
      .values(newOpp)
      .execute();

    return newOpp;
  }

  static async applyOpportunity(oppId: string, applicantId: string, coverLetter?: string, resumeUrl?: string) {
    await ResearchRepository.ensureTables();
    const opp = await db
      .selectFrom("research_opportunities as ro")
      .selectAll()
      .where("id", "=", oppId)
      .executeTakeFirst() as any;

    if (!opp) throw new Error("Research opportunity not found.");

    const existing = await db
      .selectFrom("research_opportunity_applications" as any)
      .select(["id"])
      .where("opportunity_id", "=", oppId)
      .where("applicant_id", "=", applicantId)
      .executeTakeFirst();

    if (existing) throw new Error("You have already applied for this opportunity.");

    const id = crypto.randomUUID();
    await db
      .insertInto("research_opportunity_applications" as any)
      .values({
        id,
        opportunity_id: oppId,
        applicant_id: applicantId,
        cover_letter: coverLetter || null,
        resume_url: resumeUrl || null,
        status: "applied",
        applied_at: new Date(),
      })
      .execute();

    await db
      .updateTable("research_opportunities" as any)
      .set((eb: any) => ({
        applicant_count: eb("applicant_count", "+", 1),
      }))
      .where("id", "=", oppId)
      .execute();

    await SharedNotificationService.notifyResearchOppApplication({
      creatorId: opp.created_by,
      applicantId,
      oppId,
      oppTitle: opp.title,
    });

    return { id, status: "applied" };
  }

  static async getPublications(filters: any) {
    return ResearchRepository.findPublications(filters);
  }

  static async addPublication(input: AddPublicationInput, userId: string) {
    await ResearchRepository.ensureTables();
    const id = crypto.randomUUID();
    const newPub = {
      id,
      user_id: userId,
      project_id: input.project_id || null,
      title: input.title,
      authors: input.authors,
      journal_or_conference: input.journal_or_conference,
      publication_date: input.publication_date ? new Date(input.publication_date) : null,
      doi: input.doi || null,
      abstract: input.abstract || null,
      research_area: input.research_area || null,
      external_url: input.external_url || null,
      pdf_url: input.pdf_url || null,
      citation_count: 0,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await db
      .insertInto("research_publications" as any)
      .values(newPub)
      .execute();

    return newPub;
  }

  static async getMyResearch(userId: string) {
    await ResearchRepository.ensureTables();
    const [ledProjects, memberProjects, collabRequestsReceived, publications] = await Promise.all([
      db
        .selectFrom("research_projects as rp")
        .selectAll("rp")
        .where("rp.lead_researcher_id", "=", userId)
        .orderBy("rp.created_at", "desc")
        .execute() as Promise<any[]>,

      db
        .selectFrom("research_project_members as rpm")
        .innerJoin("research_projects as rp", "rp.id", "rpm.project_id")
        .selectAll("rp")
        .select(["rpm.role as my_role", "rpm.joined_at as my_joined_at"])
        .where("rpm.user_id", "=", userId)
        .where("rp.lead_researcher_id", "!=", userId)
        .orderBy("rpm.joined_at", "desc")
        .execute() as Promise<any[]>,

      db
        .selectFrom("research_collaboration_requests as rcr")
        .innerJoin("research_projects as rp", "rp.id", "rcr.project_id")
        .innerJoin("user as u", "u.id", "rcr.sender_id")
        .leftJoin("professional_profiles as pp", "pp.user_id", "rcr.sender_id")
        .select([
          "rcr.id",
          "rcr.project_id",
          "rcr.role_applied",
          "rcr.proposal_message",
          "rcr.status",
          "rcr.created_at",
          "rp.title as project_title",
          "u.name as sender_name",
          "u.image as sender_image",
          "pp.profession as sender_profession",
        ])
        .where("rcr.receiver_id", "=", userId)
        .where("rcr.status", "=", "pending")
        .orderBy("rcr.created_at", "desc")
        .execute() as Promise<any[]>,

      db
        .selectFrom("research_publications as pub")
        .selectAll("pub")
        .where("pub.user_id", "=", userId)
        .orderBy("pub.created_at", "desc")
        .execute() as Promise<any[]>,
    ]);

    return {
      ledProjects,
      memberProjects,
      collabRequestsReceived,
      publications,
    };
  }
}
