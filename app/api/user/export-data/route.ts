import { auth, database } from "@/lib/auth";
import { ensureDpdpTables } from "@/modules/dpdp/lib/dpdp-db";
import { headers } from "next/headers";
import { sql } from "kysely";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    await ensureDpdpTables();

    // 1. Basic User Auth Data
    const userResult = await sql<any>`
      SELECT id, name, email, email_verified, image, created_at, updated_at
      FROM "user"
      WHERE id = ${userId}
    `.execute(database);

    // 2. Professional Profile Data
    let profileData = null;
    try {
      const profResult = await sql<any>`
        SELECT * FROM professional_profiles WHERE user_id = ${userId}
      `.execute(database);
      profileData = profResult.rows[0] || null;
    } catch {
      // Ignore if table doesn't exist
    }

    // 3. Identity & Verification Data
    let identityData = null;
    try {
      const idResult = await sql<any>`
        SELECT * FROM mgn_identities WHERE user_id = ${userId}
      `.execute(database);
      identityData = idResult.rows[0] || null;
    } catch {
      // Ignore
    }

    // 4. DPDP Nominee Data
    const nomineeResult = await sql<any>`
      SELECT * FROM user_nominees WHERE user_id = ${userId}
    `.execute(database);

    // 5. DPDP Consents
    const consentResult = await sql<any>`
      SELECT consent_key, granted, granted_at FROM user_privacy_consents WHERE user_id = ${userId}
    `.execute(database);

    // 6. Network Posts & Activity
    let postsData: any[] = [];
    try {
      const postsResult = await sql<any>`
        SELECT id, post_type, content, media_urls, visibility, reaction_count, comment_count, created_at
        FROM network_posts WHERE author_id = ${userId}
      `.execute(database);
      postsData = postsResult.rows;
    } catch {
      // Ignore
    }

    // 7. Event Registrations
    let eventRegistrations: any[] = [];
    try {
      const eventRegResult = await sql<any>`
        SELECT er.id, er.event_id, er.status, er.created_at, e.title as event_title, e.start_date
        FROM event_registrations er
        LEFT JOIN events e ON e.id = er.event_id
        WHERE er.user_id = ${userId}
      `.execute(database);
      eventRegistrations = eventRegResult.rows;
    } catch {
      // Ignore
    }

    // 8. Camp Registrations
    let campRegistrations: any[] = [];
    try {
      const campRegResult = await sql<any>`
        SELECT cr.id, cr.camp_id, cr.role, cr.status, cr.created_at, c.title as camp_title, c.start_date
        FROM camp_registrations cr
        LEFT JOIN camps c ON c.id = cr.camp_id
        WHERE cr.user_id = ${userId}
      `.execute(database);
      campRegistrations = campRegResult.rows;
    } catch {
      // Ignore
    }

    // 9. Learn & Course Enrollments
    let courseEnrollments: any[] = [];
    try {
      const courseResult = await sql<any>`
        SELECT ce.id, ce.course_id, ce.progress_percent, ce.completed_at, ce.created_at, c.title as course_title
        FROM course_enrollments ce
        LEFT JOIN courses c ON c.id = ce.course_id
        WHERE ce.user_id = ${userId}
      `.execute(database);
      courseEnrollments = courseResult.rows;
    } catch {
      // Ignore
    }

    const exportBundle = {
      dpdp_compliance_header: {
        act: "Digital Personal Data Protection Act (DPDP Act, 2023) - India",
        fiduciary: "MedGlobalNetwork (MGN - https://mgn.life)",
        fiduciary_email: "grievance@mgn.life",
        right_exercised: "Section 11 - Right to Access Information about Personal Data",
        export_generated_at: new Date().toISOString(),
        data_principal_id: userId,
        data_principal_email: session.user.email,
      },
      account_profile: userResult.rows[0] || null,
      professional_profile: profileData,
      identity_verification: identityData,
      dpdp_nominee: nomineeResult.rows[0] || null,
      privacy_consents: consentResult.rows,
      network_posts: postsData,
      event_registrations: eventRegistrations,
      camp_participations: campRegistrations,
      cme_course_enrollments: courseEnrollments,
    };

    const filename = `mgn-personal-data-export-${userId.slice(0, 8)}-${Date.now()}.json`;

    return new Response(JSON.stringify(exportBundle, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (err: any) {
    console.error("Failed to generate data export:", err);
    return Response.json({ error: "Failed to compile personal data export" }, { status: 500 });
  }
}
