import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/auth";
import { sql } from "kysely";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawQuery = searchParams.get("q") || searchParams.get("query") || "";
    const query = rawQuery.trim();
    const type = searchParams.get("type") || "all";
    const limit = Math.min(parseInt(searchParams.get("limit") || "6", 10), 20);

    if (!query) {
      return NextResponse.json({
        query: "",
        counts: { people: 0, jobs: 0, courses: 0, communities: 0, total: 0 },
        results: { people: [], jobs: [], courses: [], communities: [] },
      });
    }

    const searchPattern = `%${query}%`;
    const cleanUsernamePattern = query.replace(/^@/, "").toLowerCase();

    // 1. Search People (Clinicians, Doctors, Healthcare Specialists)
    let people: any[] = [];
    if (type === "all" || type === "people") {
      try {
        const res: any = await sql`
          SELECT 
            u.id as user_id,
            COALESCE(pp.id, u.id) as id,
            u.name,
            u.email,
            COALESCE(u.image, mi.profile_photo_url) as image,
            pp.username,
            pp.member_id,
            pp.is_founding_member,
            pp.profession,
            pp.specialization,
            pp.designation,
            pp.organization,
            pp.city,
            pp.state,
            pp.primary_degree,
            pp.registration_verified,
            pp.identity_verified
          FROM "user" u
          LEFT JOIN professional_profiles pp ON pp.user_id = u.id
          LEFT JOIN mgn_identities mi ON mi.user_id = u.id
          WHERE 
            (
              u.name ILIKE ${searchPattern} OR
              u.email ILIKE ${searchPattern} OR
              pp.username ILIKE ${searchPattern} OR
              pp.username = ${cleanUsernamePattern} OR
              pp.member_id ILIKE ${searchPattern} OR
              pp.profession ILIKE ${searchPattern} OR
              pp.specialization ILIKE ${searchPattern} OR
              pp.organization ILIKE ${searchPattern} OR
              pp.city ILIKE ${searchPattern} OR
              pp.primary_degree ILIKE ${searchPattern}
            )
            AND (pp.profile_visibility IS NULL OR pp.profile_visibility <> 'private')
          ORDER BY 
            (CASE WHEN pp.is_founding_member = true THEN 1 ELSE 2 END),
            (CASE WHEN u.name ILIKE ${query} THEN 1 WHEN u.name ILIKE ${query + "%"} THEN 2 ELSE 3 END),
            u.name ASC
          LIMIT ${limit}
        `.execute(database);
        people = res.rows || [];
      } catch (err) {
        console.error("Search people error:", err);
      }
    }

    // 2. Search Jobs & Opportunities
    let jobs: any[] = [];
    if (type === "all" || type === "jobs") {
      try {
        const res: any = await sql`
          SELECT 
            j.id,
            j.title,
            j.organization_name,
            j.location,
            j.city,
            j.state,
            j.opportunity_type,
            j.employment_type,
            j.profession_tag,
            j.specialization_tag,
            j.created_at
          FROM opportunities j
          WHERE 
            j.status = 'published' AND
            (
              j.title ILIKE ${searchPattern} OR
              j.organization_name ILIKE ${searchPattern} OR
              j.location ILIKE ${searchPattern} OR
              j.city ILIKE ${searchPattern} OR
              j.profession_tag ILIKE ${searchPattern} OR
              j.specialization_tag ILIKE ${searchPattern} OR
              j.description ILIKE ${searchPattern}
            )
          ORDER BY j.created_at DESC
          LIMIT ${limit}
        `.execute(database);
        jobs = res.rows || [];
      } catch (err) {
        console.error("Search jobs error:", err);
      }
    }

    // 3. Search Courses & Learn Ecosystem
    let courses: any[] = [];
    if (type === "all" || type === "courses") {
      try {
        const res: any = await sql`
          SELECT 
            c.id,
            c.title,
            c.slug,
            c.thumbnail,
            c.category,
            c.profession,
            c.level,
            c.duration_minutes,
            c.price,
            c.is_free,
            c.rating_avg,
            c.enrollment_count
          FROM courses c
          WHERE 
            c.status = 'published' AND
            (
              c.title ILIKE ${searchPattern} OR
              c.short_description ILIKE ${searchPattern} OR
              c.description ILIKE ${searchPattern} OR
              c.category ILIKE ${searchPattern} OR
              c.profession ILIKE ${searchPattern} OR
              c.specialization ILIKE ${searchPattern}
            )
          ORDER BY c.enrollment_count DESC, c.created_at DESC
          LIMIT ${limit}
        `.execute(database);
        courses = res.rows || [];
      } catch (err) {
        console.error("Search courses error:", err);
      }
    }

    // 4. Search Communities
    let communities: any[] = [];
    if (type === "all" || type === "communities") {
      try {
        const res: any = await sql`
          SELECT 
            c.id,
            c.slug,
            c.name,
            c.description,
            c.specialty,
            c.cover_url,
            c.member_count,
            c.post_count
          FROM communities c
          WHERE 
            c.visibility <> 'private' AND
            (
              c.name ILIKE ${searchPattern} OR
              c.specialty ILIKE ${searchPattern} OR
              c.description ILIKE ${searchPattern} OR
              c.slug ILIKE ${searchPattern}
            )
          ORDER BY c.member_count DESC
          LIMIT ${limit}
        `.execute(database);
        communities = res.rows || [];
      } catch (err) {
        console.error("Search communities error:", err);
      }
    }

    const counts = {
      people: people.length,
      jobs: jobs.length,
      courses: courses.length,
      communities: communities.length,
      total: people.length + jobs.length + courses.length + communities.length,
    };

    return NextResponse.json({
      query,
      counts,
      results: {
        people,
        jobs,
        courses,
        communities,
      },
    });
  } catch (error: any) {
    console.error("Unified search error:", error);
    return NextResponse.json({ error: error.message || "Failed to search" }, { status: 500 });
  }
}
