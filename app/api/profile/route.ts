import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { pool, auth } from "@/lib/auth";
import { ensureVerificationTables, verifDb } from "@/modules/onboarding/lib/verification-db";
import { isR2Configured, uploadR2Buffer } from "@/lib/r2";
import { nanoid } from "nanoid";

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

async function ensureProfileColumns() {
  await ensureVerificationTables();
  try {
    await pool.query(`
      ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS headline VARCHAR(255);
      ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS education_history JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS experience_history JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS publications JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;
      ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS healthcare_interests TEXT[] DEFAULT '{}'::text[];
      ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS section_privacy JSONB DEFAULT '{"about":"public","identities":"public","education":"public","experience":"public","skills":"public","achievements":"public","publications":"public","social":"public"}'::jsonb;
    `);
  } catch (err) {
    console.warn("ensureProfileColumns warning:", err);
  }
}

// ─────────────────────────────────────────────
// GET: RETRIEVE FULL PROFILE
// ─────────────────────────────────────────────
export async function GET(request: Request) {
  try {
    const reqHeaders = await headers();
    let sessionUserId = "";

    try {
      const session = await auth.api.getSession({ headers: reqHeaders });
      if (session?.user?.id) sessionUserId = session.user.id;
    } catch {}

    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get("userId") || searchParams.get("id");
    const targetUserId = queryUserId || sessionUserId;

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: "Authentication required to view profile." },
        { status: 401 }
      );
    }

    await ensureProfileColumns();

    // 1. Fetch user account
    const userRes = await pool.query(
      `SELECT id, name, email, "emailVerified", phone, image, role, "createdAt", selected_identities 
       FROM "user" 
       WHERE id = $1 LIMIT 1`,
      [targetUserId]
    );
    const user = userRes.rows[0];
    if (!user) {
      return NextResponse.json({ success: false, error: "Profile not found." }, { status: 404 });
    }

    // 2. Fetch professional profile
    const profileRes = await pool.query(
      `SELECT * FROM professional_profiles WHERE user_id = $1 LIMIT 1`,
      [targetUserId]
    );
    const profile = profileRes.rows[0] || {};

    // 3. Fetch identity record for verification statuses
    const identityRes = await verifDb
      .selectFrom("mgn_identities")
      .selectAll()
      .where("user_id", "=", targetUserId)
      .executeTakeFirst();

    // 4. Check if own profile or relationship
    const isOwnProfile = sessionUserId === targetUserId;

    // 5. Build identities with verification badges
    const rawSelected: string[] =
      (identityRes as any)?.selected_identities ||
      profile.selected_identities ||
      user.selected_identities ||
      [];
    const selectedIdentities = Array.from(new Set(rawSelected.filter(Boolean)));
    const storedIdentityStatuses: Record<string, string> =
      (identityRes as any)?.identity_statuses || profile.identity_statuses || {};
    const identityDetails: Record<string, any> =
      (identityRes as any)?.identity_details || profile.identity_details || {};

    const isOverallApproved = identityRes?.verification_status === "APPROVED" || profile.identity_verified;

    const identitiesList = selectedIdentities.map((key) => {
      const meta = IDENTITY_METADATA[key] || {
        title: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        group: "Healthcare",
      };

      let status = storedIdentityStatuses[key] || "NOT_SUBMITTED";
      if (isOverallApproved) status = "APPROVED";

      const isVerified = status === "APPROVED";
      const details = identityDetails[key] || {};

      return {
        id: key,
        title: meta.title,
        group: meta.group,
        details,
        status,
        isVerified, // Only true if approved
        prefix: isVerified ? meta.prefix : undefined,
      };
    });

    // 6. Calculate dynamic profile completion
    let completionPercent = 20; // Account created
    const completedSteps: string[] = ["Account Registered"];
    const pendingSteps: string[] = [];

    if (user.emailVerified) {
      completionPercent += 10;
      completedSteps.push("Email Verified");
    } else {
      pendingSteps.push("Verify Email");
    }

    if (user.phone || profile.phone) {
      completionPercent += 10;
      completedSteps.push("Mobile Verified");
    } else {
      pendingSteps.push("Verify Mobile");
    }

    if (profile.bio && profile.bio.length > 20) {
      completionPercent += 15;
      completedSteps.push("Biography Added");
    } else {
      pendingSteps.push("Add Professional Bio");
    }

    if (Array.isArray(profile.skills) && profile.skills.length > 0) {
      completionPercent += 15;
      completedSteps.push("Healthcare Skills Added");
    } else {
      pendingSteps.push("Add Skills & Expertise");
    }

    if (Array.isArray(profile.education_history) && profile.education_history.length > 0) {
      completionPercent += 15;
      completedSteps.push("Education History Added");
    } else {
      pendingSteps.push("Add Education History");
    }

    if (Array.isArray(profile.experience_history) && profile.experience_history.length > 0) {
      completionPercent += 15;
      completedSteps.push("Clinical Experience Added");
    } else {
      pendingSteps.push("Add Clinical / Work Experience");
    }

    completionPercent = Math.min(100, completionPercent);

    // 7. Privacy filtering: NEVER expose private data (phone, email, DOB, private docs) by default
    const privacy = profile.section_privacy || {
      about: "public",
      identities: "public",
      education: "public",
      experience: "public",
      skills: "public",
      achievements: "public",
      publications: "public",
      social: "public",
    };

    // Format location
    const locationParts = [profile.city, profile.state, profile.country].filter(Boolean);
    const location = locationParts.length > 0 ? locationParts.join(", ") : "India";

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

    // Default headline fallback if not set
    const defaultHeadline =
      profile.headline ||
      [profile.profession, profile.specialization, profile.organization].filter(Boolean).join(" • ") ||
      "Healthcare Professional & Member";

    return NextResponse.json({
      success: true,
      profile: {
        userId: user.id,
        fullName,
        headline: defaultHeadline,
        initials,
        image: profile.profile_photo_url || user.image || null,
        coverImageUrl: profile.cover_image_url || null,
        accountType: "Individual Account",
        location,
        country: profile.country || "India",
        state: profile.state || "",
        city: profile.city || "",
        memberId: profile.member_id || null,
        isFoundingMember: Boolean(profile.is_founding_member),
        createdAt: user.createdAt,

        // Contact security & verified states
        email: isOwnProfile ? user.email : undefined, // Never public
        phone: isOwnProfile ? user.phone || profile.phone : undefined, // Never public
        emailVerified: Boolean(user.emailVerified),
        phoneVerified: Boolean(user.phone || profile.phone),
        isIdentityVerified: Boolean(isOverallApproved),

        // About & Bio
        bio: profile.bio || "",
        bioCharLimit: 2000,
        healthcareInterests: profile.healthcare_interests || [],

        // Multi-Identities
        identities: identitiesList,

        // Education, Experience, Skills, Achievements, Publications, Social Links
        education: Array.isArray(profile.education_history) ? profile.education_history : [],
        experience: Array.isArray(profile.experience_history) ? profile.experience_history : [],
        skills: Array.isArray(profile.skills) ? profile.skills : [],
        achievements: Array.isArray(profile.achievements) ? profile.achievements : [],
        publications: Array.isArray(profile.publications) ? profile.publications : [],
        socialLinks: profile.social_links || {},

        // Section Privacy & Completion
        sectionPrivacy: privacy,
        completionPercent,
        completedSteps,
        pendingSteps,
        isOwnProfile,
      },
    });
  } catch (err: any) {
    console.error("GET /api/profile error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load profile." },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────
// PUT/PATCH: UPDATE PROFILE SECTIONS
// ─────────────────────────────────────────────
export async function PUT(request: Request) {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({ headers: reqHeaders });
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required to update profile." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    await ensureProfileColumns();

    const body = await request.json();

    // 1. Update basic user table if name or image changed
    if (body.fullName || body.image !== undefined) {
      const userUpdates: Record<string, any> = { updatedAt: new Date() };
      if (body.fullName) userUpdates.name = body.fullName.trim();
      if (body.image !== undefined) userUpdates.image = body.image;

      await pool.query(
        `UPDATE "user" SET name = COALESCE($1, name), image = COALESCE($2, image), "updatedAt" = NOW() WHERE id = $3`,
        [body.fullName ? body.fullName.trim() : null, body.image !== undefined ? body.image : null, userId]
      );
    }

    // 2. Validate URL inputs in socialLinks
    const socialLinks = body.socialLinks || {};
    for (const [key, url] of Object.entries(socialLinks)) {
      if (typeof url === "string" && url.trim().length > 0) {
        const trimmed = url.trim();
        if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
          socialLinks[key] = `https://${trimmed}`;
        }
      }
    }

    // 3. Bio character limit validation (max 2000)
    let validatedBio = body.bio !== undefined ? String(body.bio).slice(0, 2000) : undefined;

    // 4. Update professional_profiles safely without overwriting verified council records
    const profileUpdates = {
      headline: body.headline !== undefined ? body.headline.trim() : undefined,
      bio: validatedBio,
      city: body.city !== undefined ? body.city.trim() : undefined,
      state: body.state !== undefined ? body.state.trim() : undefined,
      country: body.country !== undefined ? body.country.trim() : undefined,
      skills: Array.isArray(body.skills) ? body.skills : undefined,
      healthcare_interests: Array.isArray(body.healthcareInterests) ? body.healthcareInterests : undefined,
      education_history: Array.isArray(body.education) ? JSON.stringify(body.education) : undefined,
      experience_history: Array.isArray(body.experience) ? JSON.stringify(body.experience) : undefined,
      achievements: Array.isArray(body.achievements) ? JSON.stringify(body.achievements) : undefined,
      publications: Array.isArray(body.publications) ? JSON.stringify(body.publications) : undefined,
      social_links: Object.keys(socialLinks).length > 0 ? JSON.stringify(socialLinks) : undefined,
      section_privacy: body.sectionPrivacy ? JSON.stringify(body.sectionPrivacy) : undefined,
      cover_image_url: body.coverImageUrl !== undefined ? body.coverImageUrl : undefined,
      full_name: body.fullName !== undefined ? body.fullName.trim() : undefined,
    };

    // Build parameterized query dynamically
    const setClauses: string[] = ["updated_at = NOW()"];
    const queryValues: any[] = [userId];
    let paramIdx = 2;

    if (profileUpdates.headline !== undefined) {
      setClauses.push(`headline = $${paramIdx++}`);
      queryValues.push(profileUpdates.headline);
    }
    if (profileUpdates.bio !== undefined) {
      setClauses.push(`bio = $${paramIdx++}`);
      queryValues.push(profileUpdates.bio);
    }
    if (profileUpdates.city !== undefined) {
      setClauses.push(`city = $${paramIdx++}`);
      queryValues.push(profileUpdates.city);
    }
    if (profileUpdates.state !== undefined) {
      setClauses.push(`state = $${paramIdx++}`);
      queryValues.push(profileUpdates.state);
    }
    if (profileUpdates.country !== undefined) {
      setClauses.push(`country = $${paramIdx++}`);
      queryValues.push(profileUpdates.country);
    }
    if (profileUpdates.skills !== undefined) {
      setClauses.push(`skills = $${paramIdx++}`);
      queryValues.push(profileUpdates.skills);
    }
    if (profileUpdates.healthcare_interests !== undefined) {
      setClauses.push(`healthcare_interests = $${paramIdx++}`);
      queryValues.push(profileUpdates.healthcare_interests);
    }
    if (profileUpdates.education_history !== undefined) {
      setClauses.push(`education_history = $${paramIdx++}`);
      queryValues.push(profileUpdates.education_history);
    }
    if (profileUpdates.experience_history !== undefined) {
      setClauses.push(`experience_history = $${paramIdx++}`);
      queryValues.push(profileUpdates.experience_history);
    }
    if (profileUpdates.achievements !== undefined) {
      setClauses.push(`achievements = $${paramIdx++}`);
      queryValues.push(profileUpdates.achievements);
    }
    if (profileUpdates.publications !== undefined) {
      setClauses.push(`publications = $${paramIdx++}`);
      queryValues.push(profileUpdates.publications);
    }
    if (profileUpdates.social_links !== undefined) {
      setClauses.push(`social_links = $${paramIdx++}`);
      queryValues.push(profileUpdates.social_links);
    }
    if (profileUpdates.section_privacy !== undefined) {
      setClauses.push(`section_privacy = $${paramIdx++}`);
      queryValues.push(profileUpdates.section_privacy);
    }
    if (profileUpdates.cover_image_url !== undefined) {
      setClauses.push(`cover_image_url = $${paramIdx++}`);
      queryValues.push(profileUpdates.cover_image_url);
    }
    if (profileUpdates.full_name !== undefined) {
      setClauses.push(`full_name = $${paramIdx++}`);
      queryValues.push(profileUpdates.full_name);
    }

    await pool.query(
      `UPDATE professional_profiles 
       SET ${setClauses.join(", ")} 
       WHERE user_id = $1`,
      queryValues
    );

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
    });
  } catch (err: any) {
    console.error("PUT /api/profile error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update profile." },
      { status: 500 }
    );
  }
}
