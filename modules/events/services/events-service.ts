// ============================================================
// MGN Events Application Service
// modules/events/services/events-service.ts
// ============================================================

import { EventsRepository } from "../repository/events-db";
import { CreateEventInput, EventFilterParams, EventRecord } from "../domain/types";
import { OrganizerEligibilityService } from "@/modules/shared/permissions/organizer-eligibility-service";
import { SharedRegistrationEngine } from "@/modules/shared/registration/registration-engine";
import { SharedCertificateService } from "@/modules/shared/certificates/certificate-service";
import { database } from "@/lib/auth";

const db = database as any;

export class EventsService {
  /**
   * Retrieves discoverable events with optional personalization.
   */
  static async getEvents(params: EventFilterParams, userId?: string) {
    return EventsRepository.findMany(params, userId);
  }

  /**
   * Retrieves event detail by ID or Slug.
   */
  static async getEventDetail(idOrSlug: string, userId?: string): Promise<EventRecord | null> {
    return EventsRepository.findById(idOrSlug, userId);
  }

  /**
   * Creates a new event after verifying organizer eligibility.
   */
  static async createEvent(input: CreateEventInput, userId: string): Promise<EventRecord> {
    const eligibility = await OrganizerEligibilityService.canCreateEvent(userId, input.organization_id);
    if (!eligibility.eligible) {
      throw new Error(eligibility.reason || "You are not authorized to create events on MGN.");
    }

    return EventsRepository.create(input, userId);
  }

  /**
   * Registers a user for an event using the Shared Registration Engine.
   */
  static async registerForEvent(eventId: string, userId: string, answers?: Record<string, any>) {
    return SharedRegistrationEngine.registerForEvent({
      eventId,
      userId,
      answers,
    });
  }

  /**
   * Cancels a user's registration.
   */
  static async cancelRegistration(eventId: string, userId: string) {
    return SharedRegistrationEngine.cancelEventRegistration(eventId, userId);
  }

  /**
   * Retrieves user's registered & organized events.
   */
  static async getMyEvents(userId: string) {
    const [registered, organized] = await Promise.all([
      EventsRepository.findUserRegisteredEvents(userId),
      EventsRepository.findUserOrganizedEvents(userId),
    ]);

    return { registered, organized };
  }

  /**
   * Marks attendee presence and issues a verified completion/CME certificate if enabled.
   */
  static async markAttendanceAndIssueCert(eventId: string, attendeeUserId: string, organizerUserId: string) {
    const event = await EventsRepository.findById(eventId, organizerUserId);
    if (!event) throw new Error("Event not found.");

    if (event.organizer_id !== organizerUserId) {
      throw new Error("Only the event organizer can mark attendance.");
    }

    // Update registration status to 'attended'
    await db
      .updateTable("event_registrations" as any)
      .set({ status: "attended", attended_at: new Date() })
      .where("event_id", "=", eventId)
      .where("user_id", "=", attendeeUserId)
      .execute();

    let cert = null;
    if (event.certificate_enabled) {
      const attendee = await db
        .selectFrom("user" as any)
        .select(["name"])
        .where("id", "=", attendeeUserId)
        .executeTakeFirst() as any;

      cert = await SharedCertificateService.issueCertificate({
        userId: attendeeUserId,
        recipientName: attendee?.name || "Healthcare Participant",
        issuerName: event.organization_name || event.organizer_name || "MGN Events",
        entityType: "event",
        entityId: event.id,
        title: `Certificate of Attendance — ${event.title}`,
        subtitle: event.cme_credits
          ? `Awarded ${event.cme_credits} CME Credits (${event.cme_accreditation_body || "MGN Healthcare Academy"})`
          : undefined,
        metadata: {
          cme_credits: event.cme_credits,
          category: event.category,
          event_type: event.event_type,
          event_date: event.start_time,
        },
      });
    }

    return { success: true, certificate: cert };
  }
}
