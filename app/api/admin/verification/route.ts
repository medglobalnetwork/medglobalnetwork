import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/auth";
import { sql } from "kysely";
import { getAdminSession, hasPermission } from "@/modules/admin/lib/rbac";
import { recordAuditLog } from "@/modules/admin/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession(req.headers);
    if (!admin || !hasPermission(admin, "verification.read")) {
      return NextResponse.json({ error: "Unauthorized. Permission verification.read required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "pending"; // 'pending' | 'verified' | 'all'

    let whereClause = sql`pp.registration_number IS NOT NULL`;
    if (filter === "pending") {
      whereClause = sql`${whereClause} AND (pp.registration_verified = false OR pp.registration_verified IS NULL)`;
    } else if (filter === "verified") {
      whereClause = sql`${whereClause} AND pp.registration_verified = true`;
    }

    const queueRes: any = await sql`
      SELECT 
        pp.id,
        pp.user_id,
        u.name,
        u.email,
        u.image,
        pp.profession,
        pp.specialization,
        pp.primary_degree,
        pp.medical_council,
        pp.registration_number,
        pp.organization,
        pp.city,
        pp.state,
        pp.experience_years,
        pp.identity_verified,
        pp.registration_verified,
        pp.education_verified,
        pp.created_at,
        pp.updated_at
      FROM professional_profiles pp
      JOIN "user" u ON u.id = pp.user_id
      WHERE ${whereClause}
      ORDER BY pp.updated_at DESC
      LIMIT 100
    `.execute(database);

    const items = (queueRes?.rows || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      name: row.name || "Doctor / Clinician",
      email: row.email,
      image: row.image,
      profession: row.profession || "Doctor / Physician",
      specialization: row.specialization || "General Medicine",
      primaryDegree: row.primary_degree || "MBBS",
      medicalCouncil: row.medical_council || "National Medical Commission",
      registrationNumber: row.registration_number || "PENDING-KYC",
      organization: row.organization,
      city: row.city,
      state: row.state,
      experienceYears: row.experience_years || 0,
      identityVerified: Boolean(row.identity_verified),
      registrationVerified: Boolean(row.registration_verified),
      educationVerified: Boolean(row.education_verified),
      status: row.registration_verified ? "verified" : "pending",
      submittedAt: row.created_at,
    }));

    return NextResponse.json({ queue: items });
  } catch (error: any) {
    console.error("Error in verification queue API:", error);
    return NextResponse.json({ error: error.message || "Failed to load verification queue" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession(req.headers);
    if (!admin || !hasPermission(admin, "verification.approve")) {
      return NextResponse.json({ error: "Unauthorized. Permission verification.approve required." }, { status: 403 });
    }

    const body = await req.json();
    const { action, userId, reason, notes } = body;

    if (action === "approve") {
      await sql`
        UPDATE professional_profiles
        SET 
          identity_verified = true,
          registration_verified = true,
          education_verified = true,
          updated_at = NOW()
        WHERE user_id = ${userId}
      `.execute(database);

      await recordAuditLog({
        admin,
        action: "verification.doctor_approved",
        entityType: "professional_profile",
        entityId: userId,
        newState: {
          identity_verified: true,
          registration_verified: true,
          education_verified: true,
        },
        reason: reason || "Medical council registration and credentials verified by officer.",
      });

      return NextResponse.json({ success: true, message: "Doctor verified successfully with platform badge." });
    }

    if (action === "reject") {
      if (!hasPermission(admin, "verification.reject")) {
        return NextResponse.json({ error: "Unauthorized. Permission verification.reject required." }, { status: 403 });
      }

      await sql`
        UPDATE professional_profiles
        SET 
          registration_verified = false,
          identity_verified = false,
          updated_at = NOW()
        WHERE user_id = ${userId}
      `.execute(database);

      await recordAuditLog({
        admin,
        action: "verification.doctor_rejected",
        entityType: "professional_profile",
        entityId: userId,
        newState: { registration_verified: false },
        reason: reason || "Credentials rejected due to mismatched council registration.",
      });

      return NextResponse.json({ success: true, message: "Doctor verification rejected." });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error updating verification:", error);
    return NextResponse.json({ error: error.message || "Failed to update verification" }, { status: 500 });
  }
}
