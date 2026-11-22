import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { pool, auth } from "@/lib/auth";
import { ensureVerificationTables, verifDb } from "@/modules/onboarding/lib/verification-db";
import { IDENTITY_DOCUMENT_REQUIREMENTS } from "@/app/api/onboarding/documents/route";

const IDENTITY_METADATA: Record<string, { title: string; group: string; prefix?: string }> = {
  student: { title: "Student", group: "Education & Learning" },
  intern_trainee: { title: "Intern / Trainee", group: "Education & Learning" },
  doctor: { title: "Doctor", group: "Healthcare Professionals", prefix: "Dr." },
  nurse: { title: "Nurse", group: "Healthcare Professionals" },
  pharmacist: { title: "Pharmacist", group: "Healthcare Professionals" },
  physiotherapist: { title: "Physiotherapist", group: "Healthcare Professionals" },
  paramedical: { title: "Paramedical Professional", group: "Healthcare Professionals" },
  allied_health: { title: "Allied Healthcare Professional", group: "Healthcare Professionals" },
  researcher: { title: "Researcher", group: "Research & Academia" },
  faculty: { title: "Faculty / Academician", group: "Research & Academia", prefix: "Prof." },
  business_owner: { title: "Healthcare Business Owner", group: "Healthcare Business" },
  service_provider: { title: "Healthcare Service Provider", group: "Healthcare Business" },
  other_healthcare: { title: "Other Healthcare Identity", group: "Healthcare" },
};

export async function GET(request: Request) {
  try {
    const reqHeaders = await headers();
    let targetUserId = "";

    try {
      const session = await auth.api.getSession({ headers: reqHeaders });
      if (session?.user?.id) targetUserId = session.user.id;
    } catch {}

    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get("userId");
    if (!targetUserId && queryUserId) {
      targetUserId = queryUserId;
    }

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: "Authentication required to access the dashboard." },
        { status: 401 }
      );
    }

    await ensureVerificationTables();

    // 1. Fetch User Record
    const userRes = await pool.query(
      `SELECT id, name, email, "emailVerified", phone, image, role, "createdAt", selected_identities 
       FROM "user" 
       WHERE id = $1 LIMIT 1`,
      [targetUserId]
    );
    const user = userRes.rows[0];
    if (!user) {
      return NextResponse.json({ success: false, error: "User account not found." }, { status: 404 });
    }

    // 2. Fetch Professional Profile
    const profileRes = await pool.query(
      `SELECT first_name, middle_name, last_name, full_name, dob, gender, country, state, city, 
              selected_identities, identity_details, identity_statuses, verification_status,
              identity_verified, registration_verified, education_verified
       FROM professional_profiles 
       WHERE user_id = $1 LIMIT 1`,
      [targetUserId]
    );
    const profile = profileRes.rows[0] || {};

    // 3. Fetch Identity Record
    const identityRes = await verifDb
      .selectFrom("mgn_identities")
      .selectAll()
      .where("user_id", "=", targetUserId)
      .executeTakeFirst();

    // 4. Fetch Documents
    const docs = await verifDb
      .selectFrom("mgn_verification_documents")
      .selectAll()
      .where("user_id", "=", targetUserId)
      .execute();

    // 5. Connections count
    let connectionsCount = 0;
    try {
      const connRes = await pool.query(
        `SELECT COUNT(*) FROM network_connections 
         WHERE (requester_id = $1 OR target_id = $1) AND status = 'accepted'`,
        [targetUserId]
      );
      connectionsCount = parseInt(connRes.rows[0]?.count || "0", 10);
    } catch {}

    // 6. Unread notifications count
    let unreadNotificationsCount = 0;
    try {
      const notifRes = await pool.query(
        `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false`,
        [targetUserId]
      );
      unreadNotificationsCount = parseInt(notifRes.rows[0]?.count || "0", 10);
    } catch {}

    // 7. Resolve Selected Identities
    const rawSelected: string[] =
      (identityRes as any)?.selected_identities ||
      profile.selected_identities ||
      user?.selected_identities ||
      [];
    const selectedIdentities = Array.from(new Set(rawSelected.filter(Boolean)));

    const storedIdentityStatuses: Record<string, string> =
      (identityRes as any)?.identity_statuses || profile.identity_statuses || {};

    // 8. Individual Identity Cards
    const isOverallApproved = identityRes?.verification_status === "APPROVED" || profile.identity_verified;

    const identitiesList = selectedIdentities.map((key) => {
      const meta = IDENTITY_METADATA[key] || {
        title: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        group: "Healthcare",
      };

      const identityDocs = docs.filter(
        (d) => (d as any).identity_type === key || (!d.identity_type && d.document_type.startsWith(key))
      );

      let status = storedIdentityStatuses[key] || "NOT_SUBMITTED";

      if (isOverallApproved) {
        status = "APPROVED";
      } else if (status === "NOT_SUBMITTED") {
        if (identityDocs.length > 0) {
          const hasRejected = identityDocs.some((d) => d.status === "REJECTED");
          const hasUnderReview = identityDocs.some((d) => d.status === "UNDER_REVIEW");
          if (hasRejected) status = "REJECTED";
          else if (hasUnderReview) status = "UNDER_REVIEW";
          else status = "SUBMITTED";
        }
      }

      // STRICT SECURITY RULE: Never show verified badge or prefix unless verified
      const isVerified = status === "APPROVED";

      return {
        id: key,
        title: meta.title,
        group: meta.group,
        prefix: isVerified ? meta.prefix : undefined,
        status, // "NOT_SUBMITTED" | "SUBMITTED" | "UNDER_REVIEW" | "ADDITIONAL_INFORMATION_REQUIRED" | "REJECTED" | "APPROVED"
        isVerified,
        documentsCount: identityDocs.length,
      };
    });

    // 9. Profile Completion Calculation (Configured Profile Requirements)
    // 5 criteria, 20% each:
    // - Account identity (Name & Email): 20%
    // - Contact verification (Email & Phone verified): 20%
    // - Personal Details (Country, State, City): 20%
    // - Healthcare Roles (At least 1 selected): 20%
    // - Document Verification (Documents uploaded): 20%
    let completionPercent = 20; // Account registered
    const completedItems: string[] = ["Basic Account Registration"];
    const pendingItems: string[] = [];

    if (user.emailVerified) {
      completionPercent += 10;
      completedItems.push("Email Verified");
    } else {
      pendingItems.push("Verify Email Address");
    }

    if (user.phone || profile.phone) {
      completionPercent += 10;
      completedItems.push("Mobile Number Verified");
    } else {
      pendingItems.push("Verify Mobile Number");
    }

    if (profile.country && profile.state && profile.city) {
      completionPercent += 20;
      completedItems.push("Location & Demographic Details");
    } else {
      pendingItems.push("Add City, State & Location");
    }

    if (selectedIdentities.length > 0) {
      completionPercent += 20;
      completedItems.push("Healthcare Roles Configured");
    } else {
      pendingItems.push("Select Healthcare Roles");
    }

    if (docs.length > 0) {
      completionPercent += 20;
      completedItems.push("Verification Documents Submitted");
    } else {
      pendingItems.push("Upload Identity Verification Documents");
    }

    completionPercent = Math.min(100, completionPercent);

    // 10. Location Formatting
    const locationParts = [profile.city, profile.state, profile.country].filter(Boolean);
    const locationStr = locationParts.length > 0 ? locationParts.join(", ") : "India";

    // 11. Name & Initials
    const firstName = profile.first_name || user.name?.split(" ")[0] || "Member";
    const fullName =
      profile.full_name ||
      user.name ||
      [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
      "Healthcare Professional";

    const initials = fullName
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        firstName,
        fullName,
        email: user.email,
        phone: user.phone || profile.phone || "",
        image: user.image || null,
        initials,
        accountType: "Individual Account",
        location: locationStr,
        createdAt: user.createdAt,
      },
      contacts: {
        emailVerified: Boolean(user.emailVerified),
        phoneVerified: Boolean(user.phone || profile.phone),
      },
      profileCompletion: {
        percent: completionPercent,
        completedItems,
        pendingItems,
      },
      identities: identitiesList,
      counts: {
        connections: connectionsCount,
        unreadNotifications: unreadNotificationsCount,
        documents: docs.length,
      },
      activeIdentity: identitiesList[0] || null,
      organization: {
        hasLinkedOrg: false,
        orgName: null,
      },
    });
  } catch (err: any) {
    console.error("GET /api/dashboard/overview error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load dashboard overview." },
      { status: 500 }
    );
  }
}
