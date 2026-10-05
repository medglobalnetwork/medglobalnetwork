import { NextRequest, NextResponse } from "next/server";
import { database, pool } from "@/lib/auth";
import { sql } from "kysely";
import { getAdminSession, hasPermission } from "@/modules/admin/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession(req.headers);
    if (!admin || !hasPermission(admin, "users.read")) {
      return NextResponse.json({ error: "Unauthorized. Permission users.read required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    // ─────────────────────────────────────────────────────────────
    // CASE 1: ROOT DIRECTORY — List all User Folders with counts
    // ─────────────────────────────────────────────────────────────
    if (!userId) {
      const search = searchParams.get("search")?.trim().toLowerCase() || "";

      // Fetch users with basic profile
      const usersRes: any = await sql`
        SELECT 
          u.id,
          u.name,
          u.email,
          u."emailVerified",
          u.image,
          u.phone,
          u."createdAt",
          pp.profession,
          pp.specialization,
          pp.organization,
          pp.city,
          pp.identity_verified,
          pp.registration_verified,
          COALESCE(
            (SELECT json_agg(ar.role) FROM admin_user_roles ar WHERE ar.user_id = u.id),
            '[]'::json
          ) as admin_roles
        FROM "user" u
        LEFT JOIN professional_profiles pp ON pp.user_id = u.id
        ORDER BY u."createdAt" DESC
        LIMIT 300
      `.execute(database);

      const rawUsers = usersRes?.rows || [];

      // Efficiently aggregate post counts per user
      let postCountsMap: Record<string, { totalPosts: number; mediaUploads: number }> = {};
      try {
        const postsRes = await pool.query(`
          SELECT 
            author_id,
            COUNT(*) as post_count,
            COUNT(CASE WHEN media_urls IS NOT NULL AND media_urls != '[]' THEN 1 END) as media_post_count
          FROM network_posts
          GROUP BY author_id
        `);
        for (const r of postsRes.rows) {
          postCountsMap[r.author_id] = {
            totalPosts: parseInt(r.post_count || "0", 10),
            mediaUploads: parseInt(r.media_post_count || "0", 10),
          };
        }
      } catch {}

      // Efficiently aggregate quotas/payments counts
      let paymentCountsMap: Record<string, number> = {};
      try {
        const payRes = await pool.query(`
          SELECT owner_id, COUNT(*) as pay_count
          FROM creation_payments
          GROUP BY owner_id
        `);
        for (const r of payRes.rows) {
          paymentCountsMap[r.owner_id] = parseInt(r.pay_count || "0", 10);
        }
      } catch {}

      const userFolders = rawUsers
        .map((u: any) => {
          const pStats = postCountsMap[u.id] || { totalPosts: 0, mediaUploads: 0 };
          const payCount = paymentCountsMap[u.id] || 0;
          const hasAvatar = u.image ? 1 : 0;
          const totalUploads = pStats.mediaUploads + hasAvatar;
          const totalTexts = pStats.totalPosts;
          const totalItems = totalUploads + totalTexts + payCount + 1; // +1 for profile.json

          const folderName = u.name
            ? `${u.name} (@${u.email ? u.email.split("@")[0] : u.id.slice(0, 6)})`
            : `User_${u.id.slice(0, 8)}`;

          return {
            id: u.id,
            userId: u.id,
            folderName,
            name: u.name || "Anonymous Member",
            email: u.email || "No email",
            phone: u.phone || null,
            image: u.image || null,
            profession: u.profession || "Healthcare Professional",
            specialization: u.specialization || null,
            organization: u.organization || null,
            city: u.city || null,
            identityVerified: Boolean(u.identity_verified),
            adminRoles: Array.isArray(u.admin_roles) ? u.admin_roles : [],
            createdAt: u.createdAt,
            stats: {
              totalItems,
              uploadsCount: totalUploads,
              textsCount: totalTexts,
              paymentsCount: payCount,
            },
          };
        })
        .filter((f: any) => {
          if (!search) return true;
          return (
            f.name.toLowerCase().includes(search) ||
            f.email.toLowerCase().includes(search) ||
            (f.phone && f.phone.includes(search)) ||
            f.userId.toLowerCase().includes(search)
          );
        });

      return NextResponse.json({
        success: true,
        totalFolders: userFolders.length,
        userFolders,
      });
    }

    // ─────────────────────────────────────────────────────────────
    // CASE 2: SINGLE USER FOLDER — Deep File & Category Inspection
    // ─────────────────────────────────────────────────────────────
    // 1. Fetch user base info
    const userRes: any = await sql`
      SELECT 
        u.id,
        u.name,
        u.email,
        u."emailVerified",
        u.image,
        u.phone,
        u."createdAt",
        pp.member_id,
        pp.is_founding_member,
        pp.membership_tier,
        pp.profession,
        pp.specialization,
        pp.designation,
        pp.primary_degree,
        pp.organization,
        pp.city,
        pp.state,
        pp.medical_council,
        pp.registration_number,
        pp.bio,
        pp.identity_verified,
        pp.registration_verified,
        pp.education_verified,
        pp.experience_verified,
        COALESCE(
          (SELECT json_agg(ar.role) FROM admin_user_roles ar WHERE ar.user_id = u.id),
          '[]'::json
        ) as admin_roles
      FROM "user" u
      LEFT JOIN professional_profiles pp ON pp.user_id = u.id
      WHERE u.id = ${userId}
      LIMIT 1
    `.execute(database);

    if (!userRes?.rows?.length) {
      return NextResponse.json({ error: "User folder not found" }, { status: 404 });
    }

    const user = userRes.rows[0];

    // 2. Fetch User Posts & Texts
    let posts: any[] = [];
    try {
      const postsQ = await pool.query(
        `SELECT id, post_type, content, media_urls, visibility, reaction_count, comment_count, created_at 
         FROM network_posts 
         WHERE author_id = $1 
         ORDER BY created_at DESC`,
        [userId]
      );
      posts = postsQ.rows || [];
    } catch {}

    // 3. Fetch Creation Quotas & Payments
    let quotas: any[] = [];
    let payments: any[] = [];
    try {
      const qRes = await pool.query(
        `SELECT category, free_used, created_at, updated_at 
         FROM creation_quotas 
         WHERE owner_id = $1`,
        [userId]
      );
      quotas = qRes.rows || [];

      const pRes = await pool.query(
        `SELECT id, order_id, payment_id, category, amount, currency, status, created_at 
         FROM creation_payments 
         WHERE owner_id = $1 
         ORDER BY created_at DESC`,
        [userId]
      );
      payments = pRes.rows || [];
    } catch {}

    // 4. Fetch Events created by user if table exists
    let events: any[] = [];
    try {
      const evRes = await pool.query(
        `SELECT id, title, event_type, format, start_time, end_time, is_free, price, currency, created_at 
         FROM events 
         WHERE organizer_id = $1 
         ORDER BY created_at DESC`,
        [userId]
      );
      events = evRes.rows || [];
    } catch {}

    // 5. Fetch Camps created by user if table exists
    let camps: any[] = [];
    try {
      const campRes = await pool.query(
        `SELECT id, title, camp_type, start_date, venue_name, city, created_at 
         FROM camps 
         WHERE organizer_id = $1 
         ORDER BY created_at DESC`,
        [userId]
      );
      camps = campRes.rows || [];
    } catch {}

    // 6. Fetch Uploaded KYC/Verification documents if table exists
    let verificationDocs: any[] = [];
    try {
      const vRes = await pool.query(
        `SELECT id, document_type, file_name, file_path, file_size, mime_type, status, uploaded_at 
         FROM mgn_verification_documents 
         WHERE user_id = $1 
         ORDER BY uploaded_at DESC`,
        [userId]
      );
      verificationDocs = vRes.rows || [];
    } catch {}

    // ─────────────────────────────────────────────────────────────
    // ASSEMBLE VIRTUAL FILE MANAGER DIRECTORIES
    // ─────────────────────────────────────────────────────────────

    // Directory A: Profile & Identity Documents
    const profileFiles = [
      {
        id: `profile_${user.id}.json`,
        name: "profile.json",
        extension: "json",
        category: "profile",
        size: `${(JSON.stringify(user).length / 1024).toFixed(1)} KB`,
        createdAt: user.createdAt,
        downloadable: true,
        previewType: "json",
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          memberId: user.member_id,
          profession: user.profession,
          specialization: user.specialization,
          primaryDegree: user.primary_degree,
          designation: user.designation,
          organization: user.organization,
          city: user.city,
          state: user.state,
          bio: user.bio,
          registeredAt: user.createdAt,
        },
      },
      {
        id: `verification_${user.id}.txt`,
        name: "kyc-verification.txt",
        extension: "txt",
        category: "profile",
        size: "0.5 KB",
        createdAt: user.createdAt,
        downloadable: true,
        previewType: "text",
        text: `--- MGN CLINICIAN KYC AUDIT RECORD ---
User ID: ${user.id}
Full Name: ${user.name}
Registration No: ${user.registration_number || "Not provided"}
Medical Council: ${user.medical_council || "Not provided"}
Primary Degree: ${user.primary_degree || "Not provided"}
Identity Verified: ${user.identity_verified ? "YES (APPROVED)" : "NO"}
Registration Verified: ${user.registration_verified ? "YES (APPROVED)" : "NO"}
Education Verified: ${user.education_verified ? "YES (APPROVED)" : "NO"}
Tier: ${user.membership_tier || "MEMBER"}
Founding Member: ${user.is_founding_member ? "YES" : "NO"}
`,
      },
    ];

    // Directory B: Uploads & Media Files
    const mediaFiles: any[] = [];
    if (user.image) {
      mediaFiles.push({
        id: `avatar_${user.id}`,
        name: "avatar.png",
        extension: "png",
        category: "uploads",
        url: user.image,
        description: "Profile Display Photo",
        createdAt: user.createdAt,
        previewType: "image",
      });
    }

    // Add actual KYC/Verification documents
    verificationDocs.forEach((doc: any, dIdx: number) => {
      const ext =
        doc.file_name?.split(".").pop()?.toLowerCase() ||
        (doc.mime_type?.includes("pdf") ? "pdf" : "jpg");
      mediaFiles.push({
        id: `doc_${doc.id}`,
        name: doc.file_name || `${doc.document_type || "document"}_${dIdx + 1}.${ext}`,
        extension: ext,
        category: "uploads",
        url: doc.file_path,
        description: `${doc.document_type || "Verification Document"} (${doc.status || "uploaded"})`,
        createdAt: doc.uploaded_at,
        previewType: ["png", "jpg", "jpeg", "webp", "gif"].includes(ext) ? "image" : "document",
      });
    });

    // Extract media URLs from network posts
    posts.forEach((p, idx) => {
      let urls: string[] = [];
      try {
        if (Array.isArray(p.media_urls)) {
          urls = p.media_urls;
        } else if (typeof p.media_urls === "string") {
          urls = JSON.parse(p.media_urls);
        }
      } catch {}

      urls.forEach((mUrl, mIdx) => {
        const ext = mUrl.split(".").pop()?.split("?")[0]?.toLowerCase() || "jpg";
        mediaFiles.push({
          id: `post_media_${p.id}_${mIdx}`,
          name: `post_${idx + 1}_media_${mIdx + 1}.${ext}`,
          extension: ext,
          category: "uploads",
          url: mUrl,
          sourcePostId: p.id,
          description: `Media attachment in Post #${idx + 1} (${p.post_type})`,
          createdAt: p.created_at,
          previewType: ["png", "jpg", "jpeg", "webp", "gif"].includes(ext) ? "image" : "document",
        });
      });
    });

    // Directory C: Texts & Posts
    const textFiles = posts.map((p, idx) => ({
      id: `post_${p.id}`,
      name: `post-${idx + 1}-${p.post_type || "feed"}.md`,
      extension: "md",
      category: "texts",
      size: `${(p.content?.length || 0) > 1024 ? `${((p.content?.length || 0) / 1024).toFixed(1)} KB` : `${p.content?.length || 0} B`}`,
      createdAt: p.created_at,
      previewType: "markdown",
      text: p.content || "",
      postType: p.post_type,
      visibility: p.visibility,
      reactions: p.reaction_count || 0,
      comments: p.comment_count || 0,
      mediaCount: Array.isArray(p.media_urls) ? p.media_urls.length : 0,
    }));

    // Directory D: Events & Camps
    const activityFiles: any[] = [];
    events.forEach((ev, idx) => {
      activityFiles.push({
        id: `event_${ev.id}`,
        name: `event-${idx + 1}-${(ev.title || "event").toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30)}.json`,
        extension: "json",
        category: "activities",
        typeLabel: "CME / Medical Event",
        title: ev.title,
        size: "1.2 KB",
        createdAt: ev.created_at,
        previewType: "json",
        data: ev,
      });
    });

    camps.forEach((cmp, idx) => {
      activityFiles.push({
        id: `camp_${cmp.id}`,
        name: `camp-${idx + 1}-${(cmp.title || "camp").toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30)}.json`,
        extension: "json",
        category: "activities",
        typeLabel: "Health Camp",
        title: cmp.title,
        size: "1.1 KB",
        createdAt: cmp.created_at,
        previewType: "json",
        data: cmp,
      });
    });

    // Directory E: Billing & Creation Quotas
    const billingFiles: any[] = [
      {
        id: `quotas_${user.id}.json`,
        name: "creation_quotas.json",
        extension: "json",
        category: "billing",
        size: "0.8 KB",
        createdAt: user.createdAt,
        previewType: "json",
        data: quotas,
      },
    ];

    payments.forEach((pm, idx) => {
      billingFiles.push({
        id: `receipt_${pm.id}`,
        name: `receipt-${idx + 1}-${pm.order_id || pm.id}.json`,
        extension: "json",
        category: "billing",
        size: "0.9 KB",
        amount: pm.amount,
        currency: pm.currency,
        status: pm.status,
        createdAt: pm.created_at,
        previewType: "json",
        data: pm,
      });
    });

    // Folders Array
    const folders = [
      {
        id: "profile",
        name: "Profile & Identity",
        icon: "user",
        description: "Personal and clinician credential files",
        itemCount: profileFiles.length,
        files: profileFiles,
      },
      {
        id: "uploads",
        name: "Uploads & Media",
        icon: "image",
        description: "Photos, images, avatar, and uploaded documents",
        itemCount: mediaFiles.length,
        files: mediaFiles,
      },
      {
        id: "texts",
        name: "Texts & Posts",
        icon: "file-text",
        description: "Feed posts, articles, and clinical discussions",
        itemCount: textFiles.length,
        files: textFiles,
      },
      {
        id: "activities",
        name: "Events & Camps",
        icon: "calendar",
        description: "Organized CME sessions, conferences, and health camps",
        itemCount: activityFiles.length,
        files: activityFiles,
      },
      {
        id: "billing",
        name: "Billing & Quotas",
        icon: "credit-card",
        description: "Publishing quotas, payment orders, and invoices",
        itemCount: billingFiles.length,
        files: billingFiles,
      },
    ];

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name || "Unnamed User",
        email: user.email,
        phone: user.phone,
        image: user.image,
        profession: user.profession,
        specialization: user.specialization,
        organization: user.organization,
        city: user.city,
        createdAt: user.createdAt,
        adminRoles: Array.isArray(user.admin_roles) ? user.admin_roles : [],
      },
      folders,
      totalFiles:
        profileFiles.length +
        mediaFiles.length +
        textFiles.length +
        activityFiles.length +
        billingFiles.length,
    });
  } catch (error: any) {
    console.error("Error in admin files API:", error);
    return NextResponse.json({ error: error.message || "Failed to load files" }, { status: 500 });
  }
}
