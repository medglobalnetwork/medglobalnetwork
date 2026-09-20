"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PostCard } from "@/modules/network/components/PostCard";
import { CreatePost } from "@/modules/network/components/CreatePost";
import { PeopleYouMayKnow } from "@/modules/network/components/PeopleYouMayKnow";
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
  const [activeTab, setActiveTab] = React.useState<"for_you" | "following">("for_you");
  const [posts, setPosts] = React.useState<NetworkPost[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(false);

  const fetchPosts = React.useCallback(async (targetPage = 1, append = false) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/network/posts?page=${targetPage}&pageSize=15`);
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
  }, []);

  React.useEffect(() => {
    fetchPosts(1, false);
  }, [fetchPosts]);

  const handlePostCreated = () => {
    fetchPosts(1, false);
  };

  return (
    <div className="space-y-5">
      {/* 1. SOCIAL POST COMPOSER */}
      <CreatePost
        onPosted={handlePostCreated}
        userImage={currentUserAvatar || undefined}
        userName={currentUserName}
      />

      {/* 2. FOR YOU / FOLLOWING FEED TABS */}
      <div className="flex items-center justify-between border-b border-[#ded8d1] pb-1">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("for_you")}
            className={`relative pb-2.5 text-sm font-bold transition ${
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
            className={`relative pb-2.5 text-sm font-bold transition ${
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
        </div>

        <span className="text-[11px] font-medium text-[#77716b]">
          Verified Clinical Feed
        </span>
      </div>

      {/* 3. FEED CONTENT */}
      {isLoading && posts.length === 0 ? (
        <div className="space-y-4">
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      ) : posts.length === 0 ? (
        <div className="space-y-6">
          <EmptyState
            icon="💬"
            title="Your clinical feed is fresh and quiet"
            description="Be the first to share a clinical case, discussion, or connect with peers to see their updates here."
            actionText="Discover Healthcare Peers"
            onAction={() => router.push("/network")}
          />

          {/* Discovery Recommendation */}
          <PeopleYouMayKnow />
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post, index) => (
            <React.Fragment key={post.id}>
              <PostCard post={post} currentUserId={currentUserId} />

              {/* Inject Discovery Carousel after 3rd post */}
              {index === 2 && (
                <div className="my-3">
                  <PeopleYouMayKnow />
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
