// ============================================================
// MGN.life Home & Stories System — Type Definitions
// modules/home/types.ts
// ============================================================

export type StoryMediaType = "text" | "image" | "video";
export type StoryVisibility = "public" | "connections";

export interface StoryReaction {
  userId: string;
  reactionType: string;
}

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  userSpecialization: string | null;
  isVerified: boolean;
  mediaUrl: string | null;
  mediaType: StoryMediaType;
  caption: string | null;
  backgroundColor: string;
  fontStyle: string;
  visibility: StoryVisibility;
  createdAt: string;
  expiresAt: string;
  hasViewed: boolean;
  viewCount: number;
  reactionCount: number;
  userReactions?: string[];
}

export interface StoryGroup {
  userId: string;
  userName: string;
  userAvatar: string | null;
  userSpecialization: string | null;
  isVerified: boolean;
  hasUnviewed: boolean;
  stories: Story[];
}

export interface CreateStoryInput {
  mediaUrl?: string | null;
  mediaType: StoryMediaType;
  caption?: string | null;
  backgroundColor?: string;
  fontStyle?: string;
  visibility?: StoryVisibility;
}
