"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Bookmark,
  ChevronDown,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { PostCard } from "@/modules/network/components/PostCard";
import { EmptyState } from "@/modules/network/components/EmptyState";
import { PostCardSkeleton } from "@/modules/network/components/SkeletonLoader";
import type { NetworkPost } from "@/modules/network/types";

interface HomeFeedProps {
  currentUserId?: string;
  currentUserAvatar?: string | null;
  currentUserName?: string;
}

export function HomeFeed({
  currentUserId,
  currentUserAvatar,
  currentUserName = "You",
}: HomeFeedProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<"for_you" | "following" | "communities">("for_you");
  const [filterType, setFilterType] = React.useState("All Content");
  const [posts, setPosts] = React.useState<NetworkPost[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(false);
  const [recommendedConnected, setRecommendedConnected] = React.useState(false);

  const fetchPosts = React.useCallback(
    async (targetPage = 1, append = false, tab = activeTab) => {
      setIsLoading(true);
      try {
        const feedParam = tab === "following" ? "&feed=following" : "";
        const res = await fetch(`/api/network/posts?page=${targetPage}&pageSize=15${feedParam}`);
        if (!res.ok) {
          setIsLoading(false);
          return;
        }
        const text = await res.text();
        if (!text) {
          setIsLoading(false);
          return;
        }
        const json = JSON.parse(text);
        if (json.data) {
          if (append) {
            setPosts((prev) => [...prev, ...json.data]);
          } else {
            setPosts(json.data);
          }
          setHasMore(Boolean(json.hasMore));
          setPage(targetPage);
        }
      } catch (err) {
        console.error("Failed to load feed posts:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [activeTab]
  );

  React.useEffect(() => {
    fetchPosts(1, false, activeTab);
  }, [fetchPosts, activeTab]);

  return (
    <div className="space-y-5">
      {/* 1. FOR YOU / FOLLOWING / COMMUNITIES FEED TABS */}
      <div className="flex items-center justify-between border-b border-[#ded8d1] pb-1">
        <div className="flex gap-4 sm:gap-6">
          <button
            type="button"
            onClick={() => setActiveTab("for_you")}
            className={`relative pb-3 text-sm font-bold transition ${
              activeTab === "for_you"
                ? "text-[#1769c2]"
                : "text-[#77716b] hover:text-[#171717]"
            }`}
          >
            For You
            {activeTab === "for_you" && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#1769c2]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("following")}
            className={`relative pb-3 text-sm font-bold transition ${
              activeTab === "following"
                ? "text-[#1769c2]"
                : "text-[#77716b] hover:text-[#171717]"
            }`}
          >
            Following
            {activeTab === "following" && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#1769c2]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("communities");
              router.push("/network/communities");
            }}
            className={`relative pb-3 text-sm font-bold transition ${
              activeTab === "communities"
                ? "text-[#1769c2]"
                : "text-[#77716b] hover:text-[#171717]"
            }`}
          >
            Communities
            {activeTab === "communities" && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#1769c2]" />
            )}
          </button>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-1 text-xs font-semibold text-[#5d5854] cursor-pointer hover:text-[#171717]">
          <span>{filterType}</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* 3. FEED CONTENT */}
      {isLoading && posts.length === 0 ? (
        <div className="space-y-4">
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Post Items */}
          {posts.map((post, index) => (
            <React.Fragment key={post.id}>
              <PostCard post={post} currentUserId={currentUserId} />

              {/* SPONSORED / CLINICAL EQUIPMENT WIDGET after 1st post */}
              {index === 0 && (
                <div className="rounded-3xl border border-[#ded8d1] bg-white p-5 shadow-2xs">
                  <div className="flex items-center justify-between text-xs mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-[#1769c2] font-bold">
                        ⚕️
                      </div>
                      <div>
                        <h4 className="font-bold text-[#171717]">PhysioEquip</h4>
                        <p className="text-[10px] text-[#77716b]">Medical Technology Partner</p>
                      </div>
                    </div>
                    <span className="rounded-md bg-[#faf9f8] px-2 py-0.5 text-[10px] font-bold text-[#77716b]">
                      Sponsored
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <h3 className="font-bold text-sm text-[#171717]">
                        Advanced Physiotherapy Equipment for Better Care
                      </h3>
                      <p className="text-xs text-[#5d5854]">
                        Explore top quality rehabilitation & clinical assessment devices for your practice at exclusive practitioner rates.
                      </p>
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => router.push("/marketplace")}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#1769c2] hover:underline"
                        >
                          Learn More <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="h-28 w-44 shrink-0 rounded-2xl bg-[#f0f7ff] flex items-center justify-center p-2 border border-[#dbeafe]">
                      <div className="text-center">
                        <span className="text-3xl">🛋️</span>
                        <p className="text-[10px] font-bold text-[#1769c2] mt-1">Clinical Grade Rehab</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => fetchPosts(page + 1, true)}
                disabled={isLoading}
                className="rounded-xl border border-[#ded8d1] bg-white px-5 py-2 text-xs font-semibold text-[#171717] shadow-2xs hover:bg-[#f8f7f6] disabled:opacity-50"
              >
                {isLoading ? "Loading..." : "Load More Updates"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
