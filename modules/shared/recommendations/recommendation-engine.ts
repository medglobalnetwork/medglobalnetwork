// ============================================================
// MGN Shared Recommendation Engine
// modules/shared/recommendations/recommendation-engine.ts
//
// Personalized discovery signals & scoring for Events, Camps,
// and Research Collaboration Opportunities.
// ============================================================

import { database } from "@/lib/auth";

const db = database as any;

export interface UserSignals {
  userId: string;
  profession?: string | null;
  specialization?: string | null;
  city?: string | null;
  state?: string | null;
  skills?: string[];
  interests?: string[];
}

export class SharedRecommendationEngine {
  /**
   * Fetches user's clinical and geographical profile signals.
   */
  static async getUserSignals(userId: string): Promise<UserSignals> {
    try {
      const profile = await db
        .selectFrom("professional_profiles" as any)
        .select(["profession", "specialization", "city", "state", "skills"])
        .where("user_id", "=", userId)
        .executeTakeFirst() as any;

      const identity = await db
        .selectFrom("mgn_identities" as any)
        .select(["category", "profession_or_type"])
        .where("user_id", "=", userId)
        .executeTakeFirst() as any;

      return {
        userId,
        profession: profile?.profession || identity?.profession_or_type || null,
        specialization: profile?.specialization || identity?.category || null,
        city: profile?.city || null,
        state: profile?.state || null,
        skills: Array.isArray(profile?.skills) ? profile.skills : [],
        interests: [],
      };
    } catch {
      return { userId };
    }
  }

  /**
   * Computes relevance score for an Event based on user signals.
   */
  static scoreEvent(event: any, signals: UserSignals): number {
    let score = 50; // base score

    if (event.status !== "published" && event.status !== "approved") {
      return 0;
    }

    // Location match (in-person)
    if (signals.city && event.city && event.city.toLowerCase() === signals.city.toLowerCase()) {
      score += 30;
    }

    // Category / Tag match
    if (signals.profession && event.category?.toLowerCase().includes(signals.profession.toLowerCase())) {
      score += 25;
    }

    if (signals.specialization && (
      event.title?.toLowerCase().includes(signals.specialization.toLowerCase()) ||
      event.description?.toLowerCase().includes(signals.specialization.toLowerCase())
    )) {
      score += 25;
    }

    // Upcoming bonus (happening within 30 days)
    const now = new Date();
    const eventDate = new Date(event.start_time);
    const diffDays = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays >= 0 && diffDays <= 30) {
      score += 15;
    }

    return score;
  }

  /**
   * Computes relevance score for a Medical Camp.
   */
  static scoreCamp(camp: any, signals: UserSignals): number {
    let score = 50;

    if (camp.status !== "published" && camp.status !== "active" && camp.status !== "approved") {
      return 0;
    }

    // City match is huge for physical camps
    if (signals.city && camp.city && camp.city.toLowerCase() === signals.city.toLowerCase()) {
      score += 40;
    }

    // Services match profession/specialty
    if (signals.profession && camp.services) {
      const servicesStr = Array.isArray(camp.services) ? camp.services.join(" ") : "";
      if (servicesStr.toLowerCase().includes(signals.profession.toLowerCase())) {
        score += 30;
      }
    }

    return score;
  }

  /**
   * Computes relevance score for a Research Project.
   */
  static scoreResearch(project: any, signals: UserSignals): number {
    let score = 50;

    if (project.status !== "active" && project.status !== "recruiting") {
      return 0;
    }

    if (signals.specialization && project.research_area?.toLowerCase().includes(signals.specialization.toLowerCase())) {
      score += 35;
    }

    if (signals.profession && project.abstract?.toLowerCase().includes(signals.profession.toLowerCase())) {
      score += 20;
    }

    if (project.status === "recruiting") {
      score += 15; // prioritize open collaboration
    }

    return score;
  }
}
