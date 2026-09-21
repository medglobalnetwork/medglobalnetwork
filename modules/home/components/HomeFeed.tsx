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
import { CreatePost } from "@/modules/network/components/CreatePost";
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
        const json = await res.json();
        if (res.ok && json.data) {
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

  const handlePostCreated = () => {
    fetchPosts(1, false, activeTab);
  };

  return (
    <div className="space-y-5">
      {/* 1. SOCIAL POST COMPOSER */}
      <CreatePost
        onPosted={handlePostCreated}
        userImage={currentUserAvatar || undefined}
        userName={currentUserName}
      />

      {/* 2. FOR YOU / FOLLOWING / COMMUNITIES FEED TABS */}
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

              {/* IN-FEED RECOMMENDED CLINICIAN CARD after 2nd post */}
              {index === 1 && (
                <div className="rounded-3xl border border-[#ded8d1] bg-white p-5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-[#f5f4f3] pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Bookmark className="h-4 w-4 text-[#1769c2]" />
                      <span className="text-xs font-bold text-[#171717]">Recommended for You</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-[#77716b]" />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef5fc] font-bold text-[#1769c2] text-sm">
                        DR
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-[#171717]">Dr. Rohan Mehta</h4>
                          <ShieldCheck className="h-4 w-4 fill-[#1769c2]/15 text-[#1769c2]" />
                        </div>
                        <p className="text-xs text-[#77716b]">Orthopedic Surgeon · AIIMS Delhi</p>
                        <p className="text-[11px] text-[#a8a29e] mt-0.5">👥 24 mutual connections</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setRecommendedConnected(true)}
                      className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow-xs ${
                        recommendedConnected
                          ? "border border-[#ded8d1] bg-white text-emerald-700"
                          : "bg-[#1769c2] text-white hover:bg-[#12569f]"
                      }`}
                    >
                      {recommendedConnected ? "Requested" : "Connect"}
                    </button>
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
