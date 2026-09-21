"use client";

import * as React from "react";
import { StoryGroup, Story } from "../types";
import { VerificationBadge } from "@/modules/network/components/VerificationBadge";
import { Eye, Trash2, X, Heart, ThumbsUp, Sparkles, Flame, Lightbulb } from "lucide-react";

interface StoryViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: StoryGroup[];
  initialGroupIndex?: number;
  currentUserId?: string;
  onStoryDeleted?: (storyId: string) => void;
}

const STORY_DURATION_MS = 5000; // 5 seconds per story

export function StoryViewerModal({
  isOpen,
  onClose,
  groups,
  initialGroupIndex = 0,
  currentUserId,
  onStoryDeleted,
}: StoryViewerModalProps) {
  const [groupIndex, setGroupIndex] = React.useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = React.useState(0);
  const [progress, setProgress] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setGroupIndex(Math.min(initialGroupIndex, Math.max(0, groups.length - 1)));
      setStoryIndex(0);
      setProgress(0);
      setIsPaused(false);
    }
  }, [isOpen, initialGroupIndex, groups.length]);

  const currentGroup = groups[groupIndex];
  const currentStory: Story | undefined = currentGroup?.stories[storyIndex];

  React.useEffect(() => {
    if (isOpen && currentStory) {
      fetch(`/api/stories/${currentStory.id}/view`, { method: "POST" }).catch(() => {});
    }
  }, [isOpen, currentStory?.id]);

  React.useEffect(() => {
    if (!isOpen || isPaused || !currentStory) return;

    const intervalTime = 50;
    const step = (intervalTime / STORY_DURATION_MS) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => Math.min(100, prev + step));
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isOpen, isPaused, currentStory, groupIndex, storyIndex]);

  const handleNext = React.useCallback(() => {
    setProgress(0);
    if (!currentGroup) return;

    if (storyIndex < currentGroup.stories.length - 1) {
      setStoryIndex((i) => i + 1);
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex((g) => g + 1);
      setStoryIndex(0);
    } else {
      onClose();
    }
  }, [currentGroup, storyIndex, groupIndex, groups.length, onClose]);

  // Trigger next story when progress reaches 100%
  React.useEffect(() => {
    if (progress >= 100) {
      handleNext();
    }
  }, [progress, handleNext]);

  const handlePrev = React.useCallback(() => {
    setProgress(0);
    if (storyIndex > 0) {
      setStoryIndex((i) => i - 1);
    } else if (groupIndex > 0) {
      const prevGroup = groups[groupIndex - 1];
      setGroupIndex((g) => g - 1);
      setStoryIndex(prevGroup.stories.length - 1);
    }
  }, [storyIndex, groupIndex, groups]);

  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") onClose();
      if (e.key === " ") setIsPaused((p) => !p);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  const handleReaction = async (reactionType: string) => {
    if (!currentStory) return;
    try {
      await fetch(`/api/stories/${currentStory.id}/reaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reactionType }),
      });
      if (!currentStory.userReactions?.includes(reactionType)) {
        currentStory.reactionCount += 1;
        currentStory.userReactions = [...(currentStory.userReactions || []), reactionType];
      }
    } catch (e) {}
  };

  const handleDeleteStory = async () => {
    if (!currentStory || isDeleting) return;
    if (!confirm("Are you sure you want to delete this story?")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/stories/${currentStory.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onStoryDeleted?.(currentStory.id);
        handleNext();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !currentGroup || !currentStory) return null;

  const getTimeAgo = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const isOwnStory = currentUserId === currentStory.userId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div
        className="relative flex h-[92vh] max-h-[850px] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-[#121212] shadow-2xl"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* 1. TOP PROGRESS BARS */}
        <div className="absolute inset-x-0 top-0 z-30 flex gap-1.5 p-3">
          {currentGroup.stories.map((s, idx) => {
            let widthPercent = 0;
            if (idx < storyIndex) widthPercent = 100;
            else if (idx === storyIndex) widthPercent = progress;

            return (
              <div
                key={s.id}
                className="h-1 flex-1 overflow-hidden rounded-full bg-white/30 backdrop-blur-xs"
              >
                <div
                  className="h-full bg-white transition-all duration-75 ease-linear"
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* 2. USER HEADER */}
        <div className="absolute inset-x-0 top-6 z-30 flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/40 bg-white/20 text-xs font-bold text-white shadow-xs">
              {currentStory.userAvatar ? (
                <img
                  src={currentStory.userAvatar}
                  alt={currentStory.userName}
                  className="h-full w-full object-cover"
                />
              ) : (
                currentStory.userName.slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="leading-tight text-white">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white drop-shadow-sm">
                  {currentStory.userName}
                </span>
                {currentStory.isVerified && <VerificationBadge size="sm" />}
                <span className="text-[10px] text-white/70">· {getTimeAgo(currentStory.createdAt)}</span>
              </div>
              <p className="text-[10px] text-white/80 line-clamp-1">
                {currentStory.userSpecialization || "Clinician"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOwnStory && (
              <button
                type="button"
                onClick={handleDeleteStory}
                disabled={isDeleting}
                title="Delete Story"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white/80 hover:bg-red-600 hover:text-white transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 3. TAP ZONES */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous story"
          className="absolute inset-y-0 left-0 z-20 w-[30%] cursor-pointer focus:outline-none"
        />
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next story"
          className="absolute inset-y-0 right-0 z-20 w-[70%] cursor-pointer focus:outline-none"
        />

        {/* 4. STORY CONTENT */}
        <div className="relative flex flex-1 items-center justify-center">
          {currentStory.mediaType === "text" ? (
            <div
              className="flex h-full w-full items-center justify-center p-8 text-center"
              style={{ backgroundColor: currentStory.backgroundColor || "#0f4c81" }}
            >
              <p
                className={`text-lg leading-relaxed text-white drop-shadow-md sm:text-xl ${
                  currentStory.fontStyle === "serif"
                    ? "font-serif italic font-medium"
                    : currentStory.fontStyle === "mono"
                    ? "font-mono"
                    : "font-sans font-bold"
                }`}
              >
                {currentStory.caption}
              </p>
            </div>
          ) : currentStory.mediaType === "image" ? (
            <div className="relative h-full w-full bg-black">
              {currentStory.mediaUrl && (
                <img
                  src={currentStory.mediaUrl}
                  alt={currentStory.caption || "Story"}
                  className="h-full w-full object-contain"
                />
              )}
              {currentStory.caption && (
                <div className="absolute inset-x-0 bottom-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-5 text-sm text-white">
                  {currentStory.caption}
                </div>
              )}
            </div>
          ) : (
            <div className="relative h-full w-full bg-black flex items-center justify-center">
              {currentStory.mediaUrl && (
                <video
                  src={currentStory.mediaUrl}
                  autoPlay
                  playsInline
                  loop
                  className="h-full w-full object-contain"
                />
              )}
              {currentStory.caption && (
                <div className="absolute inset-x-0 bottom-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-5 text-sm text-white">
                  {currentStory.caption}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 5. BOTTOM REACTION BAR */}
        <div className="absolute inset-x-0 bottom-0 z-30 flex items-center justify-between border-t border-white/10 bg-black/60 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-xs text-white/70">
            <Eye className="h-3.5 w-3.5" />
            <span>{currentStory.viewCount || 0}</span>
            {currentStory.reactionCount > 0 && (
              <span className="ml-1 flex items-center gap-1 text-white/90">
                · <Heart className="h-3 w-3 fill-red-500 text-red-500" /> {currentStory.reactionCount}
              </span>
            )}
          </div>

          {/* Quick Reaction Buttons */}
          <div className="flex items-center gap-1.5">
            {[
              { type: "like", icon: <ThumbsUp className="h-3.5 w-3.5" /> },
              { type: "heart", icon: <Heart className="h-3.5 w-3.5" /> },
              { type: "insightful", icon: <Lightbulb className="h-3.5 w-3.5" /> },
              { type: "fire", icon: <Flame className="h-3.5 w-3.5" /> },
              { type: "sparkles", icon: <Sparkles className="h-3.5 w-3.5" /> },
            ].map((r) => (
              <button
                key={r.type}
                type="button"
                onClick={() => handleReaction(r.type)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:scale-125 hover:bg-white/20 active:scale-95"
              >
                {r.icon}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
