// ============================================================
// MGN Shared Notification Service
// modules/shared/notifications/notification-service.ts
//
// Centralized notification dispatcher for Events, Camps,
// Research, Certificates, and Scheduling.
// ============================================================

import { database } from "@/lib/auth";
import crypto from "crypto";

const db = database as any;

export interface SendNotificationParams {
  userId: string;
  actorId?: string | null;
  type: string;
  entityType?: string | null;
  entityId?: string | null;
  message: string;
}

export class SharedNotificationService {
  /**
   * Generic notification dispatcher storing directly in network_notifications
   */
  static async send(params: SendNotificationParams): Promise<void> {
    try {
      const id = crypto.randomUUID();
      await db
        .insertInto("network_notifications" as any)
        .values({
          id,
          user_id: params.userId,
          actor_id: params.actorId || null,
          type: params.type,
          entity_type: params.entityType || null,
          entity_id: params.entityId || null,
          message: params.message,
          is_read: false,
          created_at: new Date(),
        })
        .execute();
    } catch (err) {
      console.error("[SharedNotificationService] Error dispatching notification:", err);
    }
  }

  // ── EVENT NOTIFICATIONS ──────────────────────────────────────
  static async notifyEventRegistration(params: {
    userId: string;
    eventId: string;
    eventTitle: string;
    ticketNumber?: string;
  }) {
    return this.send({
      userId: params.userId,
      type: "event_registered",
      entityType: "event",
      entityId: params.eventId,
      message: `You are registered for "${params.eventTitle}". Ticket: ${params.ticketNumber || "Confirmed"}`,
    });
  }

  static async notifyEventStatusUpdate(params: {
    userId: string;
    eventId: string;
    eventTitle: string;
    status: string;
    message?: string;
  }) {
    return this.send({
      userId: params.userId,
      type: "event_status_updated",
      entityType: "event",
      entityId: params.eventId,
      message: params.message || `Update for event "${params.eventTitle}": Status is now ${params.status}.`,
    });
  }

  // ── CAMP NOTIFICATIONS ───────────────────────────────────────
  static async notifyCampVolunteerApplication(params: {
    organizerId: string;
    volunteerId: string;
    campId: string;
    campTitle: string;
    roleTitle: string;
  }) {
    return this.send({
      userId: params.organizerId,
      actorId: params.volunteerId,
      type: "camp_volunteer_application",
      entityType: "camp",
      entityId: params.campId,
      message: `New volunteer application received for role "${params.roleTitle}" in "${params.campTitle}".`,
    });
  }

  static async notifyCampVolunteerStatus(params: {
    volunteerId: string;
    campId: string;
    campTitle: string;
    status: "approved" | "rejected" | "attended";
    roleTitle: string;
  }) {
    const statusText =
      params.status === "approved"
        ? "APPROVED 🎉"
        : params.status === "attended"
        ? "verified as attended ✅"
        : "updated";

    return this.send({
      userId: params.volunteerId,
      type: `camp_volunteer_${params.status}`,
      entityType: "camp",
      entityId: params.campId,
      message: `Your volunteer application for "${params.roleTitle}" in "${params.campTitle}" has been ${statusText}.`,
    });
  }

  static async notifyCampParticipantRegistration(params: {
    userId: string;
    campId: string;
    campTitle: string;
    registrationNumber: string;
  }) {
    return this.send({
      userId: params.userId,
      type: "camp_participant_registered",
      entityType: "camp",
      entityId: params.campId,
      message: `Registration confirmed for "${params.campTitle}". Reg #${params.registrationNumber}.`,
    });
  }

  // ── RESEARCH NOTIFICATIONS ───────────────────────────────────
  static async notifyResearchCollabRequest(params: {
    receiverId: string;
    senderId: string;
    projectId: string;
    projectTitle: string;
    roleApplied?: string;
  }) {
    return this.send({
      userId: params.receiverId,
      actorId: params.senderId,
      type: "research_collaboration_request",
      entityType: "research_project",
      entityId: params.projectId,
      message: `You received a research collaboration request for "${params.projectTitle}".`,
    });
  }

  static async notifyResearchCollabStatus(params: {
    receiverId: string;
    projectId: string;
    projectTitle: string;
    status: "accepted" | "declined";
  }) {
    return this.send({
      userId: params.receiverId,
      type: `research_collaboration_${params.status}`,
      entityType: "research_project",
      entityId: params.projectId,
      message: `Your collaboration request for "${params.projectTitle}" was ${params.status}.`,
    });
  }

  static async notifyResearchOppApplication(params: {
    creatorId: string;
    applicantId: string;
    oppId: string;
    oppTitle: string;
  }) {
    return this.send({
      userId: params.creatorId,
      actorId: params.applicantId,
      type: "research_opp_application",
      entityType: "research_opportunity",
      entityId: params.oppId,
      message: `New application submitted for research opportunity: "${params.oppTitle}".`,
    });
  }

  // ── CERTIFICATE NOTIFICATIONS ────────────────────────────────
  static async notifyCertificateIssued(params: {
    userId: string;
    entityType: "course" | "event" | "camp" | "research";
    entityId: string;
    title: string;
    certificateNumber: string;
    verificationCode: string;
  }) {
    return this.send({
      userId: params.userId,
      type: "certificate_issued",
      entityType: params.entityType,
      entityId: params.entityId,
      message: `Your verified certificate for "${params.title}" is ready! (Code: ${params.verificationCode})`,
    });
  }
}
