"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
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
        borderless={true}
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
      {/* CTA BANNER AD AT START OF FEED */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[#ded8d1] bg-gradient-to-r from-[#0d3b66] via-[#1769c2] to-[#0d9488] p-4.5 sm:p-5 text-white shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-white/20 backdrop-blur-xs px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase text-white">
                Featured · Sponsored
              </span>
              <span className="text-[11px] text-white/80 font-medium">Healthcare Innovation Summit</span>
            </div>
            <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight leading-snug">
              Expand Your Medical Network with 50,000+ Verified Clinicians
            </h3>
            <p className="text-xs text-white/85 line-clamp-2 max-w-xl">
              Connect with leading healthcare specialists, participate in accredited CME webinars, and explore cutting-edge clinical opportunities.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/opportunities")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-[#1769c2] shadow-sm hover:bg-[#f8f7f6] transition active:scale-95"
            >
              Explore Now <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {isLoading && posts.length === 0 ? (
        <div className="space-y-4">
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Post Items */}
          {posts.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={currentUserId} />
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
