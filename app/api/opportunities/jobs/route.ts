import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { database } from "@/lib/auth";
import { sql } from "kysely";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const currentUserId = session?.user?.id;

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query")?.trim() || "";
    const opportunityType = searchParams.get("opportunityType") || "";
    const profession = searchParams.get("profession") || "";
    const specialization = searchParams.get("specialization") || "";
    const employmentType = searchParams.get("employmentType") || "";
    const workMode = searchParams.get("workMode") || "";
    const location = searchParams.get("location")?.trim() || "";
    const city = searchParams.get("city")?.trim() || "";
    const verifiedOnly = searchParams.get("verifiedOnly") === "true";
    const recommended = searchParams.get("recommended") === "true";
    const sort = searchParams.get("sort") || "newest";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "12", 10)));
    const offset = (page - 1) * pageSize;

    // Get user profile if recommended sort is requested
    let userProfession = "";
    let userSpecialization = "";
    if (recommended && currentUserId) {
      const profileRes: any = await sql`
        SELECT profession, specialization FROM professional_profiles WHERE user_id = ${currentUserId} LIMIT 1
      `.execute(database);
      if (profileRes.rows?.[0]) {
        userProfession = profileRes.rows[0].profession || "";
        userSpecialization = profileRes.rows[0].specialization || "";
      }
    }

    let queryBuilder = sql`
      SELECT 
        j.*,
        json_build_object(
          'id', o.id,
          'name', o.name,
          'slug', o.slug,
          'logo_url', o.logo_url,
          'organization_type', o.organization_type,
          'city', o.city,
          'state', o.state,
          'verification_status', o.verification_status
        ) as organization,
        ${
          currentUserId
            ? sql`EXISTS (SELECT 1 FROM job_applications ja WHERE ja.job_id = j.id AND ja.applicant_id = ${currentUserId})`
            : sql`false`
        } as has_applied,
        ${
          currentUserId
            ? sql`EXISTS (SELECT 1 FROM saved_jobs sj WHERE sj.job_id = j.id AND sj.user_id = ${currentUserId})`
            : sql`false`
        } as is_saved,
        ${
          currentUserId
            ? sql`(SELECT ja.status FROM job_applications ja WHERE ja.job_id = j.id AND ja.applicant_id = ${currentUserId} LIMIT 1)`
            : sql`NULL`
        } as user_application_status
      FROM jobs j
      JOIN organizations o ON j.organization_id = o.id
      WHERE j.status = 'published'
    `;

    if (query) {
      const searchPattern = `%${query}%`;
      queryBuilder = sql`${queryBuilder} AND (
        j.title ILIKE ${searchPattern} OR
        j.description ILIKE ${searchPattern} OR
        j.profession ILIKE ${searchPattern} OR
        j.specialization ILIKE ${searchPattern} OR
        o.name ILIKE ${searchPattern} OR
        j.city ILIKE ${searchPattern}
      )`;
    }

    if (opportunityType && opportunityType !== "All") {
      queryBuilder = sql`${queryBuilder} AND j.opportunity_type = ${opportunityType}`;
    }

    if (profession && profession !== "All") {
      queryBuilder = sql`${queryBuilder} AND j.profession ILIKE ${`%${profession}%`}`;
    }

    if (specialization && specialization !== "All") {
      queryBuilder = sql`${queryBuilder} AND j.specialization ILIKE ${`%${specialization}%`}`;
    }

    if (employmentType && employmentType !== "All") {
      queryBuilder = sql`${queryBuilder} AND j.employment_type = ${employmentType}`;
    }

    if (workMode && workMode !== "All") {
      queryBuilder = sql`${queryBuilder} AND j.work_mode = ${workMode}`;
    }

    if (city) {
      queryBuilder = sql`${queryBuilder} AND j.city ILIKE ${`%${city}%`}`;
    }

    if (location) {
      queryBuilder = sql`${queryBuilder} AND (j.location ILIKE ${`%${location}%`} OR j.city ILIKE ${`%${location}%`})`;
    }

    if (verifiedOnly) {
      queryBuilder = sql`${queryBuilder} AND o.verification_status = 'verified'`;
    }

    // Recommendation sorting
    if (recommended && (userProfession || userSpecialization)) {
      queryBuilder = sql`${queryBuilder} ORDER BY 
        (CASE WHEN j.profession ILIKE ${`%${userProfession}%`} THEN 1 ELSE 0 END +
         CASE WHEN j.specialization ILIKE ${`%${userSpecialization}%`} THEN 2 ELSE 0 END) DESC,
        j.is_featured DESC,
        j.published_at DESC`;
    } else if (sort === "salary_desc") {
      queryBuilder = sql`${queryBuilder} ORDER BY j.salary_max DESC NULLS LAST, j.published_at DESC`;
    } else if (sort === "deadline") {
      queryBuilder = sql`${queryBuilder} ORDER BY j.application_deadline ASC NULLS LAST`;
    } else if (sort === "popular") {
      queryBuilder = sql`${queryBuilder} ORDER BY j.views_count DESC, j.applicant_count DESC`;
    } else {
      queryBuilder = sql`${queryBuilder} ORDER BY j.is_featured DESC, j.published_at DESC`;
    }

    queryBuilder = sql`${queryBuilder} LIMIT ${pageSize} OFFSET ${offset}`;

    const jobsResult: any = await queryBuilder.execute(database);

    // Get total count
    let countQuery = sql`
      SELECT COUNT(*) as total 
      FROM jobs j
      JOIN organizations o ON j.organization_id = o.id
      WHERE j.status = 'published'
    `;
    if (query) {
      const searchPattern = `%${query}%`;
      countQuery = sql`${countQuery} AND (
        j.title ILIKE ${searchPattern} OR
        j.description ILIKE ${searchPattern} OR
        j.profession ILIKE ${searchPattern} OR
        j.specialization ILIKE ${searchPattern} OR
        o.name ILIKE ${searchPattern} OR
        j.city ILIKE ${searchPattern}
      )`;
    }
    if (opportunityType && opportunityType !== "All") {
      countQuery = sql`${countQuery} AND j.opportunity_type = ${opportunityType}`;
    }
    if (profession && profession !== "All") {
      countQuery = sql`${countQuery} AND j.profession ILIKE ${`%${profession}%`}`;
    }
    if (employmentType && employmentType !== "All") {
      countQuery = sql`${countQuery} AND j.employment_type = ${employmentType}`;
    }

    const countResult: any = await countQuery.execute(database);
    const total = parseInt(countResult.rows[0]?.total || "0", 10);

    return NextResponse.json({
      jobs: jobsResult.rows,
      total,
      page,
      pageSize,
      hasMore: offset + jobsResult.rows.length < total,
    });
  } catch (error: any) {
    console.error("Failed to fetch jobs:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const currentUserId = session.user.id;
    const body = await req.json();

    const {
      organization_id,
      title,
      opportunity_type = "job",
      employment_type = "full_time",
      work_mode = "onsite",
      location,
      city,
      state,
      country = "India",
      salary_min,
      salary_max,
      salary_currency = "INR",
      salary_period = "yearly",
      is_salary_negotiable = true,
      is_salary_visible = true,
      profession,
      specialization,
      experience_min = 0,
      experience_max,
      skills = [],
      qualifications = [],
      description,
      responsibilities,
      requirements,
      benefits = [],
      application_questions = [],
      application_deadline,
      status = "published",
    } = body;

    if (!title || !description || !organization_id) {
      return NextResponse.json({ error: "Title, description, and organization are required" }, { status: 400 });
    }

    // Verify recruiter membership
    const memberCheck: any = await sql`
      SELECT role FROM organization_members 
      WHERE organization_id = ${organization_id} AND user_id = ${currentUserId}
      LIMIT 1
    `.execute(database);

    const isMember = memberCheck.rows?.length > 0;
    // Allow creator or owner/admin/recruiter
    if (!isMember) {
      const orgCheck: any = await sql`
        SELECT created_by FROM organizations WHERE id = ${organization_id} LIMIT 1
      `.execute(database);
      if (orgCheck.rows?.[0]?.created_by !== currentUserId) {
        return NextResponse.json({ error: "Forbidden: You are not authorized to post for this organization" }, { status: 403 });
      }
    }

    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;

    const insertResult: any = await sql`
      INSERT INTO jobs (
        organization_id, recruiter_id, title, slug, opportunity_type, employment_type,
        work_mode, location, city, state, country, salary_min, salary_max, salary_currency,
        salary_period, is_salary_negotiable, is_salary_visible, profession, specialization,
        experience_min, experience_max, skills, qualifications, description, responsibilities,
        requirements, benefits, application_questions, application_deadline, status
      ) VALUES (
        ${organization_id}, ${currentUserId}, ${title}, ${slug}, ${opportunity_type}, ${employment_type},
        ${work_mode}, ${location || null}, ${city || null}, ${state || null}, ${country},
        ${salary_min || null}, ${salary_max || null}, ${salary_currency}, ${salary_period},
        ${is_salary_negotiable}, ${is_salary_visible}, ${profession || null}, ${specialization || null},
        ${experience_min}, ${experience_max || null}, ${skills}, ${qualifications}, ${description},
        ${responsibilities || null}, ${requirements || null}, ${benefits},
        ${JSON.stringify(application_questions)}::JSONB,
        ${application_deadline ? new Date(application_deadline) : null},
        ${status}
      )
      RETURNING id, slug
    `.execute(database);

    const createdJob = insertResult.rows[0];

    return NextResponse.json({
      success: true,
      jobId: createdJob.id,
      slug: createdJob.slug,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create job:", error);
    return NextResponse.json({ error: error.message || "Failed to create job" }, { status: 500 });
  }
}
