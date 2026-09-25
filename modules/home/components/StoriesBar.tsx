"use client";

import * as React from "react";
import { StoryGroup } from "../types";
import { CreateStoryModal } from "./CreateStoryModal";
import { StoryViewerModal } from "./StoryViewerModal";
import { Plus } from "lucide-react";

interface StoriesBarProps {
  currentUserId?: string;
  currentUserAvatar?: string | null;
  currentUserName?: string;
}

const RING_COLORS = [
  "from-pink-500 via-rose-500 to-amber-500",
  "from-emerald-400 via-teal-500 to-cyan-500",
  "from-blue-600 via-indigo-600 to-cyan-400",
  "from-purple-500 via-pink-500 to-rose-400",
  "from-amber-400 via-orange-500 to-red-500",
  "from-cyan-500 via-blue-500 to-indigo-500",
];

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
      if (!res.ok) {
        setGroups([]);
        return;
      }
      const text = await res.text();
      if (!text) {
        setGroups([]);
        return;
      }
      const data = JSON.parse(text);
      if (data.groups) {
        setGroups(data.groups);
      }
    } catch (err) {
      console.error("Failed to load stories:", err);
      setGroups([]);
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
    <div className="border-0 bg-transparent p-0 shadow-none">
      {/* HORIZONTAL STORIES LIST */}
      <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-1 scrollbar-none touch-pan-x overscroll-x-contain">
        {/* YOUR STORY */}
        <div className="flex shrink-0 flex-col items-center gap-1">
          <div className="relative cursor-pointer">
            <button
              type="button"
              onClick={handleOpenOwnStory}
              className={`flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full p-[2px] sm:p-[2.5px] transition hover:scale-105 ${
                ownStoryGroup
                  ? "bg-gradient-to-tr from-[#1769c2] via-[#0284c7] to-[#38bdf8]"
                  : "bg-slate-100"
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

            {/* Plus Badge */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsCreateOpen(true);
              }}
              title="Add Story"
              className="absolute bottom-0 right-0 flex h-4.5 w-4.5 sm:h-5 sm:w-5 items-center justify-center rounded-full border-2 border-white bg-[#1769c2] text-white shadow-xs transition hover:bg-[#12569f]"
            >
              <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3 stroke-[3]" />
            </button>
          </div>

          <span className="w-14 sm:w-16 truncate text-center text-[10px] sm:text-[11px] font-medium text-[#171717]">
            Your Story
          </span>
        </div>

        {/* LOADING SKELETON */}
        {isLoading && (
          <div className="flex gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex shrink-0 flex-col items-center gap-1 animate-pulse">
                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-[#f0efee]" />
                <div className="h-2 w-10 sm:h-2.5 sm:w-12 rounded bg-[#f0efee]" />
              </div>
            ))}
          </div>
        )}

        {/* PEER STORIES */}
        {!isLoading &&
          peerGroups.map((group, index) => {
            const ringColor = RING_COLORS[index % RING_COLORS.length];

            return (
              <button
                key={group.userId}
                type="button"
                onClick={() => handleOpenPeerStory(group)}
                className="group flex shrink-0 flex-col items-center gap-1 focus:outline-none"
              >
                <div
                  className={`flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full p-[2px] sm:p-[2.5px] transition group-hover:scale-105 ${
                    group.hasUnviewed
                      ? `bg-gradient-to-tr ${ringColor}`
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

                <span className="w-14 sm:w-16 truncate text-center text-[10px] sm:text-[11px] font-medium text-[#171717] group-hover:text-[#1769c2]">
                  {group.userName}
                </span>
              </button>
            );
          })}
      </div>

      {/* CREATE MODAL */}
      <CreateStoryModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onStoryCreated={fetchStories}
        currentUserAvatar={currentUserAvatar}
        currentUserName={currentUserName}
      />

      {/* VIEWER MODAL */}
      <StoryViewerModal
        isOpen={viewerState.isOpen}
        onClose={() => setViewerState({ isOpen: false, groupIndex: 0 })}
        groups={groups}
        initialGroupIndex={viewerState.groupIndex}
        currentUserId={currentUserId}
        onStoryDeleted={fetchStories}
      />
    </div>
  );
}
