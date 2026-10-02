// ============================================================
// MGN Medical Camps Application Service
// modules/camps/services/camps-service.ts
// ============================================================

import { CampsRepository } from "../repository/camps-db";
import { CampFilterParams, CampRecord, CreateCampInput } from "../domain/types";
import { OrganizerEligibilityService } from "@/modules/shared/permissions/organizer-eligibility-service";
import { SharedRegistrationEngine } from "@/modules/shared/registration/registration-engine";
import { SharedCertificateService } from "@/modules/shared/certificates/certificate-service";
import { SharedNotificationService } from "@/modules/shared/notifications/notification-service";
import { database } from "@/lib/auth";
import { distanceMeters } from "@/lib/geo";
import crypto from "crypto";

const db = database as any;

export class CampsService {
  static async getCamps(params: CampFilterParams, userId?: string) {
    return CampsRepository.findMany(params, userId);
  }

  static async getCampDetail(id: string, userId?: string): Promise<CampRecord | null> {
    return CampsRepository.findById(id, userId);
  }

  /** Camps near a point, closest first. */
  static async getNearbyCamps(
    center: { lat: number; lng: number },
    radiusMeters: number,
    limit = 20
  ) {
    return CampsRepository.findNearby(center, radiusMeters, limit);
  }

  /**
   * Geofence check-in for a camp.
   *
   * Every attempt is recorded in camp_checkins — passed or failed — so an
   * attendance dispute can be reviewed afterwards. A successful check-in
   * also marks an approved volunteer as attended, which is what the
   * organizer's roster reads.
   */
  static async checkIn(params: {
    campId: string;
    userId: string;
    lat: number;
    lng: number;
    accuracyMeters?: number | null;
  }) {
    const camp = await CampsRepository.findById(params.campId, params.userId);
    if (!camp) {
      return { ok: false as const, error: "Camp not found" };
    }

    const venue = { lat: Number(camp.latitude), lng: Number(camp.longitude) };
    if (!Number.isFinite(venue.lat) || !Number.isFinite(venue.lng)) {
      return {
        ok: false as const,
        error: "This camp has no venue coordinates yet, so check-in is unavailable.",
      };
    }

    const radiusMeters = Number(camp.checkin_radius_meters) || 500;

    // A fix with a large accuracy radius cannot prove presence, so measure
    // from the edge of the error circle rather than from the reported point.
    const accuracy = params.accuracyMeters ?? 0;
    const measured = distanceMeters({ lat: params.lat, lng: params.lng }, venue);
    const distance = Math.max(0, Math.round(measured - accuracy));
    const withinRadius = distance <= radiusMeters;

    await db
      .insertInto("camp_checkins")
      .values({
        id: `chk_${crypto.randomBytes(8).toString("hex")}`,
        camp_id: params.campId,
        user_id: params.userId,
        latitude: params.lat,
        longitude: params.lng,
        accuracy_meters: accuracy || null,
        distance_meters: distance,
        radius_meters: radiusMeters,
        within_radius: withinRadius,
        method: "gps",
        checked_in_at: new Date(),
      })
      .execute();

    if (!withinRadius) {
      return {
        ok: false as const,
        withinRadius: false,
        distanceMeters: distance,
        radiusMeters,
        error: `You are ${distance} m from the venue. Move within ${radiusMeters} m to check in.`,
      };
    }

    // Only an approved volunteer gets attendance; attendees are marked by
    // the organizer through the roster.
    await db
      .updateTable("camp_volunteers")
      .set({ attended: true, attendance_marked_at: new Date() })
      .where("camp_id", "=", params.campId)
      .where("user_id", "=", params.userId)
      .where("status", "in", ["approved", "attended"])
      .execute();

    return {
      ok: true as const,
      withinRadius: true,
      distanceMeters: distance,
      radiusMeters,
      error: null,
    };
  }

  /** The signed-in user's check-in history for a camp. */
  static async getMyCheckIns(campId: string, userId: string) {
    return db
      .selectFrom("camp_checkins")
      .select(["id", "distance_meters", "radius_meters", "within_radius", "checked_in_at"])
      .where("camp_id", "=", campId)
      .where("user_id", "=", userId)
      .orderBy("checked_in_at", "desc")
      .limit(20)
      .execute();
  }

  static async createCamp(input: CreateCampInput, userId: string): Promise<CampRecord> {
    const eligibility = await OrganizerEligibilityService.canCreateCamp(userId, input.organization_id);
    if (!eligibility.eligible) {
      throw new Error(eligibility.reason || "You are not authorized to organize healthcare camps on MGN.");
    }

    return CampsRepository.create(input, userId);
  }

  static async applyVolunteer(campId: string, userId: string, roleId: string, note?: string) {
    return SharedRegistrationEngine.applyForCampVolunteer({
      campId,
      userId,
      roleId,
      applicationNote: note,
    });
  }

  static async registerParticipant(params: {
    campId: string;
    userId?: string | null;
    participantName: string;
    participantPhone?: string;
    participantAge?: number;
    participantGender?: string;
    notes?: string;
  }) {
    return SharedRegistrationEngine.registerForCampParticipant(params);
  }

  static async getCampVolunteers(campId: string, organizerUserId: string) {
    const camp = await CampsRepository.findById(campId, organizerUserId);
    if (!camp) throw new Error("Camp not found.");
    return CampsRepository.findCampVolunteers(campId);
  }

  static async reviewVolunteer(campId: string, volunteerApplicationId: string, status: "approved" | "rejected", organizerUserId: string) {
    const camp = await CampsRepository.findById(campId, organizerUserId);
    if (!camp) throw new Error("Camp not found.");
    if (camp.organizer_id !== organizerUserId) {
      throw new Error("Only the camp organizer can review volunteer applications.");
    }

    const application = await db
      .selectFrom("camp_volunteers as cv")
      .innerJoin("camp_required_roles as crr", "crr.id", "cv.role_id")
      .select(["cv.id", "cv.user_id", "cv.role_id", "cv.status", "crr.role_title"])
      .where("cv.id", "=", volunteerApplicationId)
      .where("cv.camp_id", "=", campId)
      .executeTakeFirst() as any;

    if (!application) throw new Error("Volunteer application not found.");

    await db
      .updateTable("camp_volunteers" as any)
      .set({
        status,
        reviewed_by: organizerUserId,
        reviewed_at: new Date(),
        updated_at: new Date(),
      })
      .where("id", "=", volunteerApplicationId)
      .execute();

    if (status === "approved") {
      // Update slots filled
      await db
        .updateTable("camp_required_roles" as any)
        .set((eb: any) => ({
          slots_filled: eb("slots_filled", "+", 1),
        }))
        .where("id", "=", application.role_id)
        .execute();
    }

    await SharedNotificationService.notifyCampVolunteerStatus({
      volunteerId: application.user_id,
      campId: camp.id,
      campTitle: camp.title,
      status,
      roleTitle: application.role_title,
    });

    return { success: true, status };
  }

  static async markVolunteerAttendance(campId: string, volunteerApplicationId: string, attended: boolean, organizerUserId: string) {
    const camp = await CampsRepository.findById(campId, organizerUserId);
    if (!camp) throw new Error("Camp not found.");
    if (camp.organizer_id !== organizerUserId) {
      throw new Error("Only the camp organizer can mark volunteer attendance.");
    }

    const vol = await db
      .selectFrom("camp_volunteers as cv")
      .innerJoin("camp_required_roles as crr", "crr.id", "cv.role_id")
      .innerJoin("user as u", "u.id", "cv.user_id")
      .select(["cv.id", "cv.user_id", "crr.role_title", "u.name as volunteer_name"])
      .where("cv.id", "=", volunteerApplicationId)
      .where("cv.camp_id", "=", campId)
      .executeTakeFirst() as any;

    if (!vol) throw new Error("Volunteer record not found.");

    await db
      .updateTable("camp_volunteers" as any)
      .set({
        attended,
        status: attended ? "attended" : "approved",
        attendance_marked_at: attended ? new Date() : null,
        updated_at: new Date(),
      })
      .where("id", "=", volunteerApplicationId)
      .execute();

    let cert = null;
    if (attended && camp.certificate_enabled) {
      cert = await SharedCertificateService.issueCertificate({
        userId: vol.user_id,
        recipientName: vol.volunteer_name,
        issuerName: camp.organization_name || camp.organizer_name || "MGN Community Healthcare Outreach",
        entityType: "camp",
        entityId: camp.id,
        title: `Volunteer & Healthcare Service Certificate — ${camp.title}`,
        subtitle: `Served as Verified ${vol.role_title} at ${camp.venue_name}, ${camp.city}`,
        metadata: {
          camp_type: camp.camp_type,
          role_title: vol.role_title,
          venue: camp.venue_name,
          city: camp.city,
          start_date: camp.start_date,
        },
      });

      await db
        .updateTable("camp_volunteers" as any)
        .set({ certificate_issued: true, certificate_id: cert.id })
        .where("id", "=", volunteerApplicationId)
        .execute();
    }

    return { success: true, attended, certificate: cert };
  }

  static async submitCampReport(campId: string, data: {
    participants_screened: number;
    volunteers_present: number;
    professionals_present: number;
    referrals_made?: number;
    services_delivered: string[];
    key_findings_summary: string;
    challenges_and_feedback?: string;
    photos?: string[];
    documents?: string[];
  }, organizerUserId: string) {
    const camp = await CampsRepository.findById(campId, organizerUserId);
    if (!camp) throw new Error("Camp not found.");
    if (camp.organizer_id !== organizerUserId) {
      throw new Error("Only the organizer can submit the post-camp outcome report.");
    }

    const reportId = crypto.randomUUID();
    const newReport = {
      id: reportId,
      camp_id: campId,
      submitted_by: organizerUserId,
      participants_screened: data.participants_screened || 0,
      volunteers_present: data.volunteers_present || 0,
      professionals_present: data.professionals_present || 0,
      referrals_made: data.referrals_made || 0,
      services_delivered: data.services_delivered || [],
      key_findings_summary: data.key_findings_summary,
      challenges_and_feedback: data.challenges_and_feedback || null,
      photos: data.photos || [],
      documents: data.documents || [],
      status: "submitted",
      created_at: new Date(),
      updated_at: new Date(),
    };

    await db
      .insertInto("camp_reports" as any)
      .values(newReport)
      .onConflict((oc: any) =>
        oc.column("camp_id").doUpdateSet({
          participants_screened: newReport.participants_screened,
          volunteers_present: newReport.volunteers_present,
          professionals_present: newReport.professionals_present,
          referrals_made: newReport.referrals_made,
          services_delivered: newReport.services_delivered,
          key_findings_summary: newReport.key_findings_summary,
          challenges_and_feedback: newReport.challenges_and_feedback,
          photos: newReport.photos,
          documents: newReport.documents,
          updated_at: new Date(),
        })
      )
      .execute();

    // Mark camp status as completed
    await db
      .updateTable("camps" as any)
      .set({ status: "completed", updated_at: new Date() })
      .where("id", "=", campId)
      .execute();

    return newReport;
  }

  static async getMyCamps(userId: string) {
    const [asVolunteer, organizedRows] = await Promise.all([
      CampsRepository.findUserVolunteerCamps(userId),
      db
        .selectFrom("camps as c")
        .leftJoin("organizations as o", "o.id", "c.organization_id")
        .selectAll("c")
        .select(["o.name as organization_name"])
        .where("c.organizer_id", "=", userId)
        .orderBy("c.created_at", "desc")
        .execute() as Promise<any[]>,
    ]);

    return {
      asVolunteer,
      asOrganizer: organizedRows,
    };
  }
}
