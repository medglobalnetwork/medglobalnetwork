import type { MetadataRoute } from "next";
import { EventsService } from "@/modules/events/services/events-service";
import { CampsService } from "@/modules/camps/services/camps-service";
import { searchCourses } from "@/modules/learn/lib/learn-db";
import { ResearchService } from "@/modules/research/services/research-service";
import { database } from "@/lib/auth";
import { sql } from "kysely";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://mgn.life";
  const now = new Date();

  // Static core routes with SEO priority and update frequencies
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/camps`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/opportunities`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/opportunities/jobs`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/opportunities/internships`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/learn`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/learn/courses`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/learn/explore`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/learn/books`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/learn/resources`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/marketplace`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/research`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/research/publications`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/research/opportunities`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/network`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/network/communities`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/create`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/announcements`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.75,
    },
  ];

  // Dynamic entries with defensive error boundaries
  const dynamicRoutes: MetadataRoute.Sitemap = [];

  // 1. Dynamic Events
  try {
    const eventsResult = await EventsService.getEvents({ limit: 50 });
    if (eventsResult?.items && Array.isArray(eventsResult.items)) {
      for (const ev of eventsResult.items) {
        if (ev.id) {
          dynamicRoutes.push({
            url: `${baseUrl}/events/${ev.id}`,
            lastModified: ev.updated_at ? new Date(ev.updated_at) : now,
            changeFrequency: "weekly",
            priority: 0.85,
          });
        }
      }
    }
  } catch {
    // Graceful fallback during static build or if DB is offline
  }

  // 2. Dynamic Camps
  try {
    const campsResult = await CampsService.getCamps({ limit: 50 });
    if (campsResult?.items && Array.isArray(campsResult.items)) {
      for (const camp of campsResult.items) {
        if (camp.id) {
          dynamicRoutes.push({
            url: `${baseUrl}/camps/${camp.id}`,
            lastModified: camp.updated_at ? new Date(camp.updated_at) : now,
            changeFrequency: "weekly",
            priority: 0.85,
          });
        }
      }
    }
  } catch {
    // Graceful fallback during static build or if DB is offline
  }

  // 3. Dynamic Public Courses
  try {
    const coursesResult = await searchCourses({ pageSize: 50 });
    if (coursesResult?.courses && Array.isArray(coursesResult.courses)) {
      for (const course of coursesResult.courses) {
        if (course.id) {
          dynamicRoutes.push({
            url: `${baseUrl}/learn/course/${course.id}`,
            lastModified: course.updated_at ? new Date(course.updated_at) : now,
            changeFrequency: "weekly",
            priority: 0.9,
          });
        }
      }
    }
  } catch {
    // Graceful fallback during static build or if DB is offline
  }

  // 4. Dynamic Research Projects
  try {
    const researchResult = await ResearchService.getProjects({ limit: 50 });
    if (researchResult?.items && Array.isArray(researchResult.items)) {
      for (const project of researchResult.items) {
        if (project.id) {
          dynamicRoutes.push({
            url: `${baseUrl}/research/projects/${project.id}`,
            lastModified: project.updated_at ? new Date(project.updated_at) : now,
            changeFrequency: "weekly",
            priority: 0.85,
          });
        }
      }
    }
  } catch {
    // Graceful fallback during static build or if DB is offline
  }

  // 5. Dynamic Job Openings
  try {
    const jobsResult: any = await sql`
      SELECT id, updated_at FROM jobs WHERE status = 'published' LIMIT 50
    `.execute(database);
    if (jobsResult?.rows && Array.isArray(jobsResult.rows)) {
      for (const job of jobsResult.rows) {
        if (job.id) {
          dynamicRoutes.push({
            url: `${baseUrl}/opportunities/jobs/${job.id}`,
            lastModified: job.updated_at ? new Date(job.updated_at) : now,
            changeFrequency: "weekly",
            priority: 0.85,
          });
        }
      }
    }
  } catch {
    // Graceful fallback during static build or if DB is offline
  }

  return [...staticRoutes, ...dynamicRoutes];
}
