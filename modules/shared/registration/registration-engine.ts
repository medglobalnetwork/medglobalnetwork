// ============================================================
// MGN Shared Registration Engine
// modules/shared/registration/registration-engine.ts
//
// Unified registration logic for Events, Medical Camps,
// Volunteer Slots, and Research Opportunity Applications.
// ============================================================

import { database } from "@/lib/auth";
import crypto from "crypto";
import { CentralCalendarService } from "../scheduling/calendar-service";
import { SharedNotificationService } from "../notifications/notification-service";

const db = database as any;

export interface RegisterForEventParams {
  eventId: string;
  userId: string;
  answers?: Record<string, any>;
  userFullName?: string;
}

export interface RegisterForCampParticipantParams {
  campId: string;
  userId?: string | null;
  participantName: string;
  participantPhone?: string;
  participantAge?: number;
  participantGender?: string;
  notes?: string;
}

export interface ApplyForCampVolunteerParams {
  campId: string;
  userId: string;
  roleId: string;
  applicationNote?: string;
}

export class SharedRegistrationEngine {
  private static generateTicketCode(prefix: string): string {
    const year = new Date().getFullYear();
    const hex = crypto.randomBytes(3).toString("hex").toUpperCase();
    return `${prefix}-${year}-${hex}`;
  }

  // ─────────────────────────────────────────────────────────────
  // 1. EVENT REGISTRATION
  // ─────────────────────────────────────────────────────────────
  static async registerForEvent(params: RegisterForEventParams) {
    // 1. Get event details
    const event = await db
      .selectFrom("events" as any)
      .selectAll()
      .where("id", "=", params.eventId)
      .executeTakeFirst() as any;

    if (!event) {
      throw new Error("Event not found.");
    }

    if (event.status !== "published" && event.status !== "approved") {
      throw new Error("This event is not open for registrations.");
    }

    // Capacity check
    if (event.capacity && event.registered_count >= event.capacity) {
      throw new Error("Event capacity has been reached.");
    }

    // Check existing registration
    const existing = await db
      .selectFrom("event_registrations" as any)
      .selectAll()
      .where("event_id", "=", params.eventId)
      .where("user_id", "=", params.userId)
      .executeTakeFirst() as any;

    if (existing) {
      if (existing.status === "cancelled") {
        // Re-activate
        await db
          .updateTable("event_registrations" as any)
          .set({ status: "confirmed", registered_at: new Date() })
          .where("id", "=", existing.id)
          .execute();

        await db
          .updateTable("events" as any)
          .set({ registered_count: (event.registered_count || 0) + 1 })
          .where("id", "=", params.eventId)
          .execute();

        // Calendar sync
        await CentralCalendarService.addOrUpdateEntry({
          userId: params.userId,
          sourceType: "event",
          sourceId: params.eventId,
          title: event.title,
          description: event.short_description || event.description?.slice(0, 150),
          startTime: event.start_time,
          endTime: event.end_time,
          timezone: event.timezone || "Asia/Kolkata",
          location: event.format === "online" ? "Online" : `${event.venue_name || ""}, ${event.city || ""}`,
          meetingLink: event.online_meeting_url,
        });

        return { ...existing, status: "confirmed" };
      }
      return existing; // already confirmed
    }

    const regId = crypto.randomUUID();
    const ticketNumber = this.generateTicketCode("EVT-TKT");

    const newReg = {
      id: regId,
      event_id: params.eventId,
      user_id: params.userId,
      status: "confirmed",
      ticket_number: ticketNumber,
      answers: params.answers ? JSON.stringify(params.answers) : null,
      registered_at: new Date(),
    };

    await db
      .insertInto("event_registrations" as any)
      .values(newReg)
      .execute();

    // Increment registered count
    await db
      .updateTable("events" as any)
      .set({ registered_count: (event.registered_count || 0) + 1 })
      .where("id", "=", params.eventId)
      .execute();

    // Sync Central Calendar
    await CentralCalendarService.addOrUpdateEntry({
      userId: params.userId,
      sourceType: "event",
      sourceId: params.eventId,
      title: event.title,
      description: event.short_description || event.description?.slice(0, 150),
      startTime: event.start_time,
      endTime: event.end_time,
      timezone: event.timezone || "Asia/Kolkata",
      location: event.format === "online" ? "Online" : `${event.venue_name || ""}, ${event.city || ""}`,
      meetingLink: event.online_meeting_url,
    });

    // Send confirmation notification
    await SharedNotificationService.notifyEventRegistration({
      userId: params.userId,
      eventId: params.eventId,
      eventTitle: event.title,
      ticketNumber,
    });

    return newReg;
  }

  static async cancelEventRegistration(eventId: string, userId: string) {
    const existing = await db
      .selectFrom("event_registrations" as any)
      .selectAll()
      .where("event_id", "=", eventId)
      .where("user_id", "=", userId)
      .executeTakeFirst() as any;

    if (!existing || existing.status === "cancelled") {
      return false;
    }

    await db
      .updateTable("event_registrations" as any)
      .set({ status: "cancelled" })
      .where("id", "=", existing.id)
      .execute();

    const event = await db
      .selectFrom("events" as any)
      .select(["registered_count"])
      .where("id", "=", eventId)
      .executeTakeFirst() as any;

    const count = Math.max(0, (event?.registered_count || 1) - 1);
    await db
      .updateTable("events" as any)
      .set({ registered_count: count })
      .where("id", "=", eventId)
      .execute();

    // Remove from calendar
    await CentralCalendarService.removeEntry(userId, "event", eventId);

    return true;
  }

  // ─────────────────────────────────────────────────────────────
  // 2. CAMP PARTICIPANT REGISTRATION
  // ─────────────────────────────────────────────────────────────
  static async registerForCampParticipant(params: RegisterForCampParticipantParams) {
    const camp = await db
      .selectFrom("camps" as any)
      .selectAll()
      .where("id", "=", params.campId)
      .executeTakeFirst() as any;

    if (!camp) {
      throw new Error("Medical camp not found.");
    }

    const regId = crypto.randomUUID();
    const regNum = this.generateTicketCode("CMP-REG");

    const newReg = {
      id: regId,
      camp_id: params.campId,
      user_id: params.userId || null,
      participant_name: params.participantName,
      participant_phone: params.participantPhone || null,
      participant_age: params.participantAge || null,
      participant_gender: params.participantGender || null,
      registration_number: regNum,
      status: "confirmed",
      notes: params.notes || null,
      created_at: new Date(),
    };

    await db
      .insertInto("camp_registrations" as any)
      .values(newReg)
      .execute();

    await db
      .updateTable("camps" as any)
      .set({ participant_registered_count: (camp.participant_registered_count || 0) + 1 })
      .where("id", "=", params.campId)
      .execute();

    if (params.userId) {
      // Add to calendar
      await CentralCalendarService.addOrUpdateEntry({
        userId: params.userId,
        sourceType: "camp",
        sourceId: params.campId,
        title: camp.title,
        description: `Healthcare Camp at ${camp.venue_name}, ${camp.city}`,
        startTime: camp.start_date,
        endTime: camp.end_date,
        location: `${camp.venue_name}, ${camp.address}, ${camp.city}`,
      });

      // Notification
      await SharedNotificationService.notifyCampParticipantRegistration({
        userId: params.userId,
        campId: params.campId,
        campTitle: camp.title,
        registrationNumber: regNum,
      });
    }

    return newReg;
  }

  // ─────────────────────────────────────────────────────────────
  // 3. CAMP VOLUNTEER REGISTRATION
  // ─────────────────────────────────────────────────────────────
  static async applyForCampVolunteer(params: ApplyForCampVolunteerParams) {
    const camp = await db
      .selectFrom("camps" as any)
      .selectAll()
      .where("id", "=", params.campId)
      .executeTakeFirst() as any;

    if (!camp) {
      throw new Error("Camp not found.");
    }

    const role = await db
      .selectFrom("camp_required_roles" as any)
      .selectAll()
      .where("id", "=", params.roleId)
      .where("camp_id", "=", params.campId)
      .executeTakeFirst() as any;

    if (!role) {
      throw new Error("Specified volunteer role not found.");
    }

    // Check if role is professional -> enforce verified identity
    if (role.is_professional) {
      const identity = await db
        .selectFrom("mgn_identities" as any)
        .selectAll()
        .where("user_id", "=", params.userId)
        .executeTakeFirst() as any;

      if (!identity || identity.verification_status !== "APPROVED") {
        throw new Error(`Role "${role.role_title}" requires a verified healthcare professional identity on MGN.`);
      }
    }

    // Check existing volunteer application
    const existing = await db
      .selectFrom("camp_volunteers" as any)
      .selectAll()
      .where("camp_id", "=", params.campId)
      .where("user_id", "=", params.userId)
      .where("role_id", "=", params.roleId)
      .executeTakeFirst() as any;

    if (existing) {
      return existing;
    }

    const volId = crypto.randomUUID();
    const newVol = {
      id: volId,
      camp_id: params.campId,
      user_id: params.userId,
      role_id: params.roleId,
      status: "pending",
      application_note: params.applicationNote || null,
      attended: false,
      certificate_issued: false,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await db
      .insertInto("camp_volunteers" as any)
      .values(newVol)
      .execute();

    // Notify camp organizer
    await SharedNotificationService.notifyCampVolunteerApplication({
      organizerId: camp.organizer_id,
      volunteerId: params.userId,
      campId: camp.id,
      campTitle: camp.title,
      roleTitle: role.role_title,
    });

    return newVol;
  }
}
