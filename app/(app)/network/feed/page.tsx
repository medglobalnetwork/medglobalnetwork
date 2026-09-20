"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { PostCard } from "@/modules/network/components/PostCard";
import { CreatePost } from "@/modules/network/components/CreatePost";
import { NetworkSidebar } from "@/modules/network/components/NetworkSidebar";
import { EmptyState } from "@/modules/network/components/EmptyState";
import { PostCardSkeleton } from "@/modules/network/components/SkeletonLoader";
import type { NetworkPost } from "@/modules/network/types";

export default function FeedPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [posts, setPosts] = React.useState<NetworkPost[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(false);

  React.useEffect(() => {
    if (!isPending && !session) router.replace("/");
  }, [isPending, router, session]);

  const loadPosts = React.useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/network/posts?page=${p}&pageSize=10`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setPosts((prev) => p === 1 ? (data.data ?? []) : [...prev, ...(data.data ?? [])]);
        setHasMore(data.hasMore ?? false);
      } else {
        if (p === 1) setPosts([]);
        setHasMore(false);
      }
    } catch {
      if (p === 1) setPosts([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (session?.user) loadPosts(1);
  }, [session?.user, loadPosts]);

  if (isPending || !session) {
    return <main className="min-h-screen bg-[#f5f5f4]" />;
  }

  return (
    <main className="min-h-screen bg-[#f5f5f4] pb-36 text-[#171717]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-5 flex items-center gap-3">
          <button type="button" onClick={() => router.push("/network")} className="flex items-center gap-1.5 text-xs font-medium text-[#77716b] hover:text-[#1769c2]">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
            Network
          </button>
          <span className="text-[#ded8d1]">/</span>
          <h1 className="text-lg font-semibold">Professional Feed</h1>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Feed column */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Create post */}
            <CreatePost
              userImage={session.user.image ?? undefined}
              userName={session.user.name ?? undefined}
              onPosted={() => loadPosts(1)}
            />

            {/* Posts */}
            {loading && page === 1 ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => <PostCardSkeleton key={i} />)}
              </div>
            ) : posts.length === 0 ? (
              <EmptyState
                icon="📰"
                title="No posts yet"
                description="Be the first to share a clinical insight, research update, or achievement with your healthcare network."
                actionText="Create a Post"
              />
            ) : (
              <>
                <div className="space-y-4">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} currentUserId={session.user.id} />
                  ))}
                </div>
                {hasMore && (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => { const next = page + 1; setPage(next); loadPosts(next); }}
                      disabled={loading}
                      className="rounded-xl border border-[#ded8d1] bg-white px-6 py-2.5 text-sm font-medium text-[#5d5854] transition hover:bg-[#f8f7f6] disabled:opacity-50"
                    >
                      {loading ? "Loading…" : "Load More"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <NetworkSidebar currentUserId={session.user.id} />
        </div>
      </div>
    </main>
  );
}
