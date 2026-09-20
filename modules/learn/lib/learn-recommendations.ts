// ============================================================
// MGN.life Phase 4: Learn Ecosystem — Course Recommendations
// modules/learn/lib/learn-recommendations.ts
// ============================================================

import { learnDb } from "./learn-db";
import { Course } from "../types";

export async function getRecommendedCourses(
  userId?: string,
  limit = 6
): Promise<Course[]> {
  try {
    let userProfession: string | null = null;
    let userSpecialization: string | null = null;

    if (userId) {
      const profile = await learnDb
        .selectFrom("professional_profiles")
        .select(["profession", "specialization"])
        .where("user_id", "=", userId)
        .executeTakeFirst();

      if (profile) {
        userProfession = profile.profession;
        userSpecialization = profile.specialization;
      }
    }

    let query = learnDb
      .selectFrom("courses as c")
      .innerJoin("user as u", "u.id", "c.instructor_id")
      .leftJoin("professional_profiles as pp", "pp.user_id", "c.instructor_id")
      .where("c.status", "=", "published");

    // Filter by user's profession / specialization if available
    if (userProfession) {
      query = query.where((eb) =>
        eb.or([
          eb("c.profession", "=", userProfession),
          eb("c.category", "ilike", `%${userProfession}%`),
          userSpecialization ? eb("c.specialization", "=", userSpecialization) : eb.val(false),
        ])
      );
    }

    const raw = await query
      .select([
        "c.id",
        "c.instructor_id",
        "c.organization_id",
        "c.title",
        "c.slug",
        "c.short_description",
        "c.description",
        "c.thumbnail",
        "c.category",
        "c.subcategory",
        "c.profession",
        "c.specialization",
        "c.level",
        "c.language",
        "c.duration_minutes",
        "c.price",
        "c.currency",
        "c.is_free",
        "c.certificate_enabled",
        "c.status",
        "c.enrollment_count",
        "c.rating_avg",
        "c.rating_count",
        "c.published_at",
        "c.created_at",
        "c.updated_at",
        "u.name as instructor_name",
        "u.email as instructor_email",
        "u.image as instructor_image",
        "pp.profession as instructor_profession",
        "pp.specialization as instructor_specialization",
        "pp.designation as instructor_designation",
        "pp.organization as instructor_organization",
        "pp.identity_verified as instructor_identity_verified",
        "pp.education_verified as instructor_education_verified",
        "pp.registration_verified as instructor_registration_verified",
      ])
      .orderBy("c.rating_avg", "desc")
      .orderBy("c.enrollment_count", "desc")
      .limit(limit)
      .execute();

    // If profession-specific yields nothing, fallback to top popular courses
    if (raw.length === 0) {
      const fallback = await learnDb
        .selectFrom("courses as c")
        .innerJoin("user as u", "u.id", "c.instructor_id")
        .leftJoin("professional_profiles as pp", "pp.user_id", "c.instructor_id")
        .where("c.status", "=", "published")
        .select([
          "c.id",
          "c.instructor_id",
          "c.organization_id",
          "c.title",
          "c.slug",
          "c.short_description",
          "c.description",
          "c.thumbnail",
          "c.category",
          "c.subcategory",
          "c.profession",
          "c.specialization",
          "c.level",
          "c.language",
          "c.duration_minutes",
          "c.price",
          "c.currency",
          "c.is_free",
          "c.certificate_enabled",
          "c.status",
          "c.enrollment_count",
          "c.rating_avg",
          "c.rating_count",
          "c.published_at",
          "c.created_at",
          "c.updated_at",
          "u.name as instructor_name",
          "u.email as instructor_email",
          "u.image as instructor_image",
          "pp.profession as instructor_profession",
          "pp.specialization as instructor_specialization",
          "pp.designation as instructor_designation",
          "pp.organization as instructor_organization",
          "pp.identity_verified as instructor_identity_verified",
          "pp.education_verified as instructor_education_verified",
          "pp.registration_verified as instructor_registration_verified",
        ])
        .orderBy("c.enrollment_count", "desc")
        .limit(limit)
        .execute();

      return fallback.map(mapToCourse);
    }

    return raw.map(mapToCourse);
  } catch (err) {
    console.error("Error fetching recommended courses:", err);
    return [];
  }
}

function mapToCourse(r: any): Course {
  return {
    id: r.id,
    instructor_id: r.instructor_id,
    organization_id: r.organization_id,
    title: r.title,
    slug: r.slug,
    short_description: r.short_description,
    description: r.description,
    thumbnail: r.thumbnail,
    category: r.category,
    subcategory: r.subcategory,
    profession: r.profession,
    specialization: r.specialization,
    level: r.level || "all_levels",
    language: r.language || "English",
    duration_minutes: Number(r.duration_minutes) || 0,
    price: Number(r.price) || 0,
    currency: r.currency || "INR",
    is_free: r.is_free,
    certificate_enabled: r.certificate_enabled,
    status: r.status || "published",
    enrollment_count: Number(r.enrollment_count) || 0,
    rating_avg: Number(r.rating_avg) || 0,
    rating_count: Number(r.rating_count) || 0,
    published_at: r.published_at ? r.published_at.toISOString() : null,
    created_at: r.created_at.toISOString(),
    updated_at: r.updated_at.toISOString(),
    instructor: {
      id: r.instructor_id,
      name: r.instructor_name,
      email: r.instructor_email,
      image: r.instructor_image,
      profession: r.instructor_profession,
      specialization: r.instructor_specialization,
      designation: r.instructor_designation,
      organization: r.instructor_organization,
      identity_verified: r.instructor_identity_verified || false,
      education_verified: r.instructor_education_verified || false,
      registration_verified: r.instructor_registration_verified || false,
    },
  };
}
