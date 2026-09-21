// ============================================================
// MGN.life Home & Stories System — Database Interface
// modules/home/lib/home-db.ts
// ============================================================

import { database } from "@/lib/auth";
import { Kysely, sql } from "kysely";
import { Story, StoryGroup, CreateStoryInput } from "../types";
import { generateId } from "@/modules/network/lib/network-db";

// ─────────────────────────────────────────────
// TABLE INTERFACES
// ─────────────────────────────────────────────

export interface StoryTable {
  id: string;
  user_id: string;
  media_url: string | null;
  media_type: string;
  caption: string | null;
  background_color: string | null;
  font_style: string | null;
  visibility: string;
  created_at: Date;
  expires_at: Date;
}

export interface StoryViewTable {
  id: string;
  story_id: string;
  viewer_id: string;
  viewed_at: Date;
}

export interface StoryReactionTable {
  id: string;
  story_id: string;
  user_id: string;
  reaction_type: string;
  created_at: Date;
}

export interface StoriesDatabase {
  stories: StoryTable;
  story_views: StoryViewTable;
  story_reactions: StoryReactionTable;
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  professional_profiles: {
    id: string;
    user_id: string;
    specialization: string | null;
    identity_verified: boolean;
    registration_verified: boolean;
  };
}

export const homeDb = database as unknown as Kysely<StoriesDatabase>;

// ─────────────────────────────────────────────
// GET ACTIVE STORY GROUPS
// ─────────────────────────────────────────────
export async function getActiveStoryGroups(currentUserId?: string): Promise<StoryGroup[]> {
  try {
    const now = new Date();

    if (!currentUserId) {
      return [];
    }

    // 1. Determine allowed author IDs: self + followed users + connected peers
    const allowedUserIds = new Set<string>([currentUserId]);

    const [followed, connected] = await Promise.all([
      homeDb
        .selectFrom(sql`follows` as any)
        .select(["following_id as id"])
        .where("follower_id", "=", currentUserId)
        .execute()
        .catch(() => []),
      homeDb
        .selectFrom(sql`connections` as any)
        .select(["user_a_id", "user_b_id"])
        .where((eb: any) =>
          eb.or([
            eb("user_a_id", "=", currentUserId),
            eb("user_b_id", "=", currentUserId),
          ])
        )
        .execute()
        .catch(() => []),
    ]);

    followed.forEach((f: any) => {
      if (f.id) allowedUserIds.add(f.id);
    });

    connected.forEach((c: any) => {
      if (c.user_a_id === currentUserId && c.user_b_id) allowedUserIds.add(c.user_b_id);
      else if (c.user_b_id === currentUserId && c.user_a_id) allowedUserIds.add(c.user_a_id);
    });

    // 2. Query only active non-expired stories from allowed users
    const storiesRaw = await homeDb
      .selectFrom("stories")
      .innerJoin("user", "user.id", "stories.user_id")
      .leftJoin("professional_profiles", "professional_profiles.user_id", "stories.user_id")
      .select([
        "stories.id",
        "stories.user_id as userId",
        "stories.media_url as mediaUrl",
        "stories.media_type as mediaType",
        "stories.caption",
        "stories.background_color as backgroundColor",
        "stories.font_style as fontStyle",
        "stories.visibility",
        "stories.created_at as createdAt",
        "stories.expires_at as expiresAt",
        "user.name as userName",
        "user.image as userAvatar",
        "professional_profiles.specialization as userSpecialization",
        "professional_profiles.identity_verified as identityVerified",
        "professional_profiles.registration_verified as registrationVerified",
      ])
      .where("stories.expires_at", ">", now)
      .where("stories.user_id", "in", Array.from(allowedUserIds))
      .orderBy("stories.created_at", "asc")
      .execute();

    if (storiesRaw.length === 0) {
      return [];
    }

    const storyIds = storiesRaw.map((s) => s.id);

    // Fetch views for current user if logged in
    let viewedStoryIds = new Set<string>();
    if (currentUserId && storyIds.length > 0) {
      const views = await homeDb
        .selectFrom("story_views")
        .select(["story_id"])
        .where("viewer_id", "=", currentUserId)
        .where("story_id", "in", storyIds)
        .execute();
      viewedStoryIds = new Set(views.map((v) => v.story_id));
    }

    // Fetch view counts for all stories
    const viewCountsRaw = await homeDb
      .selectFrom("story_views")
      .select(["story_id", sql<string>`count(*)`.as("count")])
      .where("story_id", "in", storyIds)
      .groupBy("story_id")
      .execute();
    const viewCountMap = new Map<string, number>(
      viewCountsRaw.map((v) => [v.story_id, parseInt(v.count, 10) || 0])
    );

    // Fetch reaction counts
    const reactionCountsRaw = await homeDb
      .selectFrom("story_reactions")
      .select(["story_id", sql<string>`count(*)`.as("count")])
      .where("story_id", "in", storyIds)
      .groupBy("story_id")
      .execute();
    const reactionCountMap = new Map<string, number>(
      reactionCountsRaw.map((r) => [r.story_id, parseInt(r.count, 10) || 0])
    );

    // Fetch user's reactions
    const userReactionsMap = new Map<string, string[]>();
    if (currentUserId && storyIds.length > 0) {
      const userReactions = await homeDb
        .selectFrom("story_reactions")
        .select(["story_id", "reaction_type"])
        .where("user_id", "=", currentUserId)
        .where("story_id", "in", storyIds)
        .execute();
      for (const ur of userReactions) {
        const list = userReactionsMap.get(ur.story_id) || [];
        list.push(ur.reaction_type);
        userReactionsMap.set(ur.story_id, list);
      }
    }

    // Group stories by userId
    const groupMap = new Map<string, StoryGroup>();

    for (const raw of storiesRaw) {
      const hasViewed = viewedStoryIds.has(raw.id);
      const isVerified = Boolean(raw.identityVerified || raw.registrationVerified);

      const storyItem: Story = {
        id: raw.id,
        userId: raw.userId,
        userName: raw.userName || "Healthcare Professional",
        userAvatar: raw.userAvatar,
        userSpecialization: raw.userSpecialization || "Clinician",
        isVerified,
        mediaUrl: raw.mediaUrl,
        mediaType: (raw.mediaType as any) || "text",
        caption: raw.caption,
        backgroundColor: raw.backgroundColor || "#1769c2",
        fontStyle: raw.fontStyle || "sans",
        visibility: (raw.visibility as any) || "public",
        createdAt: raw.createdAt.toISOString(),
        expiresAt: raw.expiresAt.toISOString(),
        hasViewed,
        viewCount: viewCountMap.get(raw.id) || 0,
        reactionCount: reactionCountMap.get(raw.id) || 0,
        userReactions: userReactionsMap.get(raw.id) || [],
      };

      if (!groupMap.has(raw.userId)) {
        groupMap.set(raw.userId, {
          userId: raw.userId,
          userName: raw.userName || "Healthcare Professional",
          userAvatar: raw.userAvatar,
          userSpecialization: raw.userSpecialization || "Clinician",
          isVerified,
          hasUnviewed: !hasViewed,
          stories: [storyItem],
        });
      } else {
        const group = groupMap.get(raw.userId)!;
        group.stories.push(storyItem);
        if (!hasViewed) {
          group.hasUnviewed = true;
        }
      }
    }

    const groups = Array.from(groupMap.values());

    // Sort order:
    // 1. Current user's stories first
    // 2. Users with unviewed stories
    // 3. Users with viewed stories
    groups.sort((a, b) => {
      if (currentUserId) {
        if (a.userId === currentUserId) return -1;
        if (b.userId === currentUserId) return 1;
      }
      if (a.hasUnviewed && !b.hasUnviewed) return -1;
      if (!a.hasUnviewed && b.hasUnviewed) return 1;
      return 0;
    });

    return groups;
  } catch (error) {
    console.error("Error in getActiveStoryGroups:", error);
    return [];
  }
}

// ─────────────────────────────────────────────
// CREATE STORY
// ─────────────────────────────────────────────
export async function createStory(
  userId: string,
  input: CreateStoryInput
): Promise<string> {
  const storyId = generateId();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

  await homeDb
    .insertInto("stories")
    .values({
      id: storyId,
      user_id: userId,
      media_url: input.mediaUrl || null,
      media_type: input.mediaType,
      caption: input.caption || null,
      background_color: input.backgroundColor || "#1769c2",
      font_style: input.fontStyle || "sans",
      visibility: input.visibility || "public",
      created_at: now,
      expires_at: expiresAt,
    })
    .execute();

  return storyId;
}

// ─────────────────────────────────────────────
// MARK STORY VIEWED
// ─────────────────────────────────────────────
export async function markStoryViewed(
  storyId: string,
  viewerId: string
): Promise<void> {
  try {
    const viewId = generateId();
    await homeDb
      .insertInto("story_views")
      .values({
        id: viewId,
        story_id: storyId,
        viewer_id: viewerId,
        viewed_at: new Date(),
      })
      .onConflict((oc) => oc.columns(["story_id", "viewer_id"]).doNothing())
      .execute();
  } catch (err) {
    // Non-blocking: fail silently if already viewed
  }
}

// ─────────────────────────────────────────────
// REACT TO STORY
// ─────────────────────────────────────────────
export async function reactToStory(
  storyId: string,
  userId: string,
  reactionType: string
): Promise<void> {
  try {
    const id = generateId();
    await homeDb
      .insertInto("story_reactions")
      .values({
        id,
        story_id: storyId,
        user_id: userId,
        reaction_type: reactionType,
        created_at: new Date(),
      })
      .onConflict((oc) =>
        oc.columns(["story_id", "user_id", "reaction_type"]).doNothing()
      )
      .execute();
  } catch (err) {
    console.error("Error reacting to story:", err);
  }
}

// ─────────────────────────────────────────────
// DELETE STORY
// ─────────────────────────────────────────────
export async function deleteStory(
  storyId: string,
  userId: string
): Promise<boolean> {
  const res = await homeDb
    .deleteFrom("stories")
    .where("id", "=", storyId)
    .where("user_id", "=", userId)
    .executeTakeFirst();

  return Number(res.numDeletedRows) > 0;
}
