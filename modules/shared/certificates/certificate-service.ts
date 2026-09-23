// ============================================================
// MGN Shared Unified Certificate Service
// modules/shared/certificates/certificate-service.ts
//
// Central certificate issuance, cryptographic code generation,
// public verification, and transcript service for Courses, Events,
// Camps, and Research projects.
// ============================================================

import { database } from "@/lib/auth";
import crypto from "crypto";
import { SharedNotificationService } from "../notifications/notification-service";

const db = database as any;

export interface UnifiedCertificateRecord {
  id: string;
  certificate_number: string;
  verification_code: string;
  user_id: string;
  recipient_name: string;
  issuer_name: string;
  entity_type: "course" | "event" | "camp" | "research";
  entity_id: string;
  title: string;
  subtitle?: string | null;
  issued_at: Date | string;
  metadata?: Record<string, any> | null;
  status: "valid" | "revoked";
}

export interface IssueCertificateParams {
  userId: string;
  recipientName: string;
  issuerName: string;
  entityType: "course" | "event" | "camp" | "research";
  entityId: string;
  title: string;
  subtitle?: string;
  metadata?: Record<string, any>;
}

export class SharedCertificateService {
  /**
   * Generates a human-friendly unique certificate serial number.
   * Example: MGN-EVT-2026-A8F2K9
   */
  private static generateCertNumber(type: string): string {
    const prefix =
      type === "event"
        ? "EVT"
        : type === "camp"
        ? "CMP"
        : type === "research"
        ? "RES"
        : "LRN";
    const year = new Date().getFullYear();
    const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
    return `MGN-${prefix}-${year}-${randomHex}`;
  }

  /**
   * Generates a 12-char secure verification code (e.g. 7X9K-3P2M-9W1Q)
   */
  private static generateVerificationCode(): string {
    const raw = crypto.randomBytes(6).toString("hex").toUpperCase();
    return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
  }

  /**
   * Ensures the unified_certificates table exists.
   */
  static async ensureCertificateTable(): Promise<void> {
    try {
      await db.schema
        .createTable("unified_certificates")
        .ifNotExists()
        .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
        .addColumn("certificate_number", "varchar(64)", (col: any) => col.notNull().unique())
        .addColumn("verification_code", "varchar(64)", (col: any) => col.notNull().unique())
        .addColumn("user_id", "text", (col: any) => col.notNull())
        .addColumn("recipient_name", "varchar(255)", (col: any) => col.notNull())
        .addColumn("issuer_name", "varchar(255)", (col: any) => col.notNull())
        .addColumn("entity_type", "varchar(32)", (col: any) => col.notNull())
        .addColumn("entity_id", "varchar(64)", (col: any) => col.notNull())
        .addColumn("title", "varchar(255)", (col: any) => col.notNull())
        .addColumn("subtitle", "text")
        .addColumn("issued_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
        .addColumn("metadata", "jsonb")
        .addColumn("status", "varchar(32)", (col: any) => col.defaultTo("valid"))
        .execute();
    } catch {
      // Handled
    }
  }

  /**
   * Issues a certificate if not already issued for the given user & entity.
   */
  static async issueCertificate(params: IssueCertificateParams): Promise<UnifiedCertificateRecord> {
    await this.ensureCertificateTable();

    // Check if already issued
    const existing = await db
      .selectFrom("unified_certificates" as any)
      .selectAll()
      .where("user_id", "=", params.userId)
      .where("entity_type", "=", params.entityType)
      .where("entity_id", "=", params.entityId)
      .executeTakeFirst() as UnifiedCertificateRecord | undefined;

    if (existing) {
      return existing;
    }

    const id = crypto.randomUUID();
    const certificate_number = this.generateCertNumber(params.entityType);
    const verification_code = this.generateVerificationCode();
    const issued_at = new Date();

    const newRecord: UnifiedCertificateRecord = {
      id,
      certificate_number,
      verification_code,
      user_id: params.userId,
      recipient_name: params.recipientName,
      issuer_name: params.issuerName,
      entity_type: params.entityType,
      entity_id: params.entityId,
      title: params.title,
      subtitle: params.subtitle || null,
      issued_at,
      metadata: params.metadata || null,
      status: "valid",
    };

    await db
      .insertInto("unified_certificates" as any)
      .values({
        id: newRecord.id,
        certificate_number: newRecord.certificate_number,
        verification_code: newRecord.verification_code,
        user_id: newRecord.user_id,
        recipient_name: newRecord.recipient_name,
        issuer_name: newRecord.issuer_name,
        entity_type: newRecord.entity_type,
        entity_id: newRecord.entity_id,
        title: newRecord.title,
        subtitle: newRecord.subtitle,
        issued_at: newRecord.issued_at,
        metadata: newRecord.metadata ? JSON.stringify(newRecord.metadata) : null,
        status: newRecord.status,
      })
      .execute();

    // Notify user
    await SharedNotificationService.notifyCertificateIssued({
      userId: params.userId,
      entityType: params.entityType,
      entityId: params.entityId,
      title: params.title,
      certificateNumber: certificate_number,
      verificationCode: verification_code,
    });

    return newRecord;
  }

  /**
   * Verifies a certificate by its public verification code or certificate number.
   */
  static async verifyCertificate(codeOrNumber: string): Promise<UnifiedCertificateRecord | null> {
    await this.ensureCertificateTable();
    const clean = codeOrNumber.trim().toUpperCase();

    try {
      const record = await db
        .selectFrom("unified_certificates" as any)
        .selectAll()
        .where((eb: any) =>
          eb.or([
            eb("verification_code", "=", clean),
            eb("certificate_number", "=", clean),
          ])
        )
        .executeTakeFirst() as UnifiedCertificateRecord | undefined;

      return record || null;
    } catch {
      return null;
    }
  }

  /**
   * Retrieves all verified certificates belonging to a user.
   */
  static async getUserCertificates(userId: string): Promise<UnifiedCertificateRecord[]> {
    await this.ensureCertificateTable();
    try {
      const records = await db
        .selectFrom("unified_certificates" as any)
        .selectAll()
        .where("user_id", "=", userId)
        .orderBy("issued_at", "desc")
        .execute() as UnifiedCertificateRecord[];

      return records;
    } catch {
      return [];
    }
  }
}
