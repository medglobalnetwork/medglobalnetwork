"use client";

import * as React from "react";
import { StoryGroup } from "../types";
import { CreateStoryModal } from "./CreateStoryModal";
import { StoryViewerModal } from "./StoryViewerModal";
import { Plus, Sparkles } from "lucide-react";

interface StoriesBarProps {
  currentUserId?: string;
  currentUserAvatar?: string | null;
  currentUserName?: string;
}

export function StoriesBar({
  currentUserId,
  currentUserAvatar,
  currentUserName = "You",
}: StoriesBarProps) {
  const [groups, setGroups] = React.useState<StoryGroup[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [viewerState, setViewerState] = React.useState<{
    isOpen: boolean;
    groupIndex: number;
  }>({
    isOpen: false,
    groupIndex: 0,
  });

  const fetchStories = React.useCallback(async () => {
    try {
      const res = await fetch("/api/stories");
      const data = await res.json();
      if (res.ok && data.groups) {
        setGroups(data.groups);
      }
    } catch (err) {
      console.error("Failed to load stories:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  // Find user's own story group if any
  const ownStoryGroupIndex = groups.findIndex((g) => g.userId === currentUserId);
  const ownStoryGroup = ownStoryGroupIndex >= 0 ? groups[ownStoryGroupIndex] : null;

  // Other peers' story groups
  const peerGroups = groups.filter((g) => g.userId !== currentUserId);

  const handleOpenOwnStory = () => {
    if (ownStoryGroup) {
      setViewerState({ isOpen: true, groupIndex: ownStoryGroupIndex });
    } else {
      setIsCreateOpen(true);
    }
  };

  const handleOpenPeerStory = (peerGroup: StoryGroup) => {
    const idx = groups.findIndex((g) => g.userId === peerGroup.userId);
    if (idx >= 0) {
      setViewerState({ isOpen: true, groupIndex: idx });
    }
  };

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-[#ded8d1] bg-white p-3.5 shadow-2xs">
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
          {/* 1. YOUR STORY BUTTON */}
          <div className="flex shrink-0 flex-col items-center gap-1.5">
            <div className="relative cursor-pointer">
              {ownStoryGroup ? (
                // User has active stories: show gradient ring
                <button
                  type="button"
                  onClick={handleOpenOwnStory}
                  className={`flex h-15 w-15 items-center justify-center rounded-full p-[2px] transition hover:scale-105 ${
                    ownStoryGroup.hasUnviewed
                      ? "bg-gradient-to-tr from-[#1769c2] via-[#0284c7] to-[#38bdf8]"
                      : "bg-[#ded8d1]"
                  }`}
                >
                  <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#eef5fc] text-xs font-bold text-[#1769c2]">
                    {currentUserAvatar ? (
                      <img
                        src={currentUserAvatar}
                        alt={currentUserName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      currentUserName.slice(0, 2).toUpperCase()
                    )}
                  </div>
                </button>
              ) : (
                // No active stories: clean avatar with plus badge
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(true)}
                  className="flex h-15 w-15 items-center justify-center rounded-full border-2 border-dashed border-[#1769c2]/50 bg-[#eef5fc] p-0.5 transition hover:border-[#1769c2] hover:scale-105"
                >
                  <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white text-xs font-bold text-[#1769c2]">
                    {currentUserAvatar ? (
                      <img
                        src={currentUserAvatar}
                        alt={currentUserName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      currentUserName.slice(0, 2).toUpperCase()
                    )}
                  </div>
                </button>
              )}

              {/* Plus Badge to Add Story */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCreateOpen(true);
                }}
                title="Add Story"
                className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#1769c2] text-xs font-bold text-white shadow-xs transition hover:bg-[#12569f]"
              >
                <Plus className="h-3 w-3 stroke-[3]" />
              </button>
            </div>

            <span className="w-16 truncate text-center text-[11px] font-semibold text-[#171717]">
              {ownStoryGroup ? "Your Story" : "Add Story"}
            </span>
          </div>

          {/* SKELETON LOADER */}
          {isLoading && (
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex shrink-0 flex-col items-center gap-1.5 animate-pulse">
                  <div className="h-15 w-15 rounded-full bg-[#f0efee]" />
                  <div className="h-2.5 w-12 rounded bg-[#f0efee]" />
                </div>
              ))}
            </div>
          )}

          {/* 2. PEER STORIES */}
          {!isLoading &&
            peerGroups.map((group) => (
              <button
                key={group.userId}
                type="button"
                onClick={() => handleOpenPeerStory(group)}
                className="group flex shrink-0 flex-col items-center gap-1.5 focus:outline-none"
              >
                <div
                  className={`flex h-15 w-15 items-center justify-center rounded-full p-[2px] transition group-hover:scale-105 ${
                    group.hasUnviewed
                      ? "bg-gradient-to-tr from-[#1769c2] via-[#0284c7] to-[#38bdf8]"
                      : "bg-[#ded8d1]"
                  }`}
                >
                  <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#eef5fc] text-xs font-bold text-[#1769c2]">
                    {group.userAvatar ? (
                      <img
                        src={group.userAvatar}
                        alt={group.userName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      group.userName.slice(0, 2).toUpperCase()
                    )}
                  </div>
                </div>

                <span className="w-16 truncate text-center text-[11px] font-semibold text-[#171717] group-hover:text-[#1769c2]">
                  {group.userName.split(" ")[0]}
                </span>
              </button>
            ))}

          {/* EMPTY PEER PROMPT */}
          {!isLoading && peerGroups.length === 0 && (
            <div className="flex items-center gap-2 pl-2 text-xs text-[#77716b]">
              <Sparkles className="h-3.5 w-3.5 text-[#1769c2]" />
              <span>Stories from connections disappear after 24h</span>
            </div>
          )}
        </div>
      </div>

      {/* CREATE STORY MODAL */}
      <CreateStoryModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onStoryCreated={fetchStories}
        currentUserAvatar={currentUserAvatar}
        currentUserName={currentUserName}
      />

      {/* STORY VIEWER MODAL */}
      <StoryViewerModal
        isOpen={viewerState.isOpen}
        onClose={() => setViewerState({ isOpen: false, groupIndex: 0 })}
        groups={groups}
        initialGroupIndex={viewerState.groupIndex}
        currentUserId={currentUserId}
        onStoryDeleted={fetchStories}
      />
    </>
  );
}
