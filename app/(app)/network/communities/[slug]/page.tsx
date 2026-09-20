"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { PostCard } from "@/modules/network/components/PostCard";
import { CreatePost } from "@/modules/network/components/CreatePost";
import { EmptyState } from "@/modules/network/components/EmptyState";
import { PostCardSkeleton } from "@/modules/network/components/SkeletonLoader";
import { SAMPLE_COMMUNITIES, SAMPLE_POSTS } from "@/modules/network/lib/network-data";
import type { Community, NetworkPost } from "@/modules/network/types";

export default function CommunityDetailPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const { data: session, isPending } = authClient.useSession();

  const [community, setCommunity] = React.useState<Community | null>(null);
  const [posts, setPosts] = React.useState<NetworkPost[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [postsLoading, setPostsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"posts" | "about">("posts");

  React.useEffect(() => {
    if (!isPending && !session) router.replace("/");
  }, [isPending, router, session]);

  // Load community
  React.useEffect(() => {
    if (!session?.user || !params.slug) return;
    fetch(`/api/network/communities/${params.slug}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setCommunity(d.data ?? SAMPLE_COMMUNITIES.find((c) => c.slug === params.slug) ?? null))
      .catch(() => setCommunity(SAMPLE_COMMUNITIES.find((c) => c.slug === params.slug) ?? null))
      .finally(() => setLoading(false));
  }, [session?.user, params.slug]);

  // Load posts
  React.useEffect(() => {
    if (!session?.user || !community) return;
    fetch(`/api/network/posts?communityId=${community.id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setPosts(d.data?.length ? d.data : SAMPLE_POSTS.slice(0, 2)))
      .catch(() => setPosts(SAMPLE_POSTS.slice(0, 2)))
      .finally(() => setPostsLoading(false));
  }, [session?.user, community]);

  const handleJoinLeave = async () => {
    if (!community) return;
    const method = community.is_member ? "DELETE" : "POST";
    await fetch(`/api/network/communities/${community.slug}/members`, { method, credentials: "include" });
    setCommunity((prev) => prev ? { ...prev, is_member: !prev.is_member, member_count: prev.member_count + (prev.is_member ? -1 : 1) } : null);
  };

  const SPECIALTY_EMOJI: Record<string, string> = {
    Physiotherapy: "🦴", Cardiology: "❤️", "Medical Students": "🎓",
    "Clinical Research": "🔬", Nursing: "🩺", "Sports Medicine": "🏃",
    Radiology: "🔭", Pediatrics: "👶",
  };

  if (isPending || !session) return <main className="min-h-screen bg-[#f5f5f4]" />;

  if (!loading && !community) {
    return (
      <main className="min-h-screen bg-[#f5f5f4] flex items-center justify-center">
        <EmptyState icon="🔍" title="Community not found" description="This community doesn't exist or has been removed." actionText="Browse Communities" onAction={() => router.push("/network/communities")} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f4] pb-36 text-[#171717]">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <div className="mb-5 flex items-center gap-2 text-xs text-[#77716b]">
          <button type="button" onClick={() => router.push("/network")} className="hover:text-[#1769c2]">Network</button>
          <span>/</span>
          <button type="button" onClick={() => router.push("/network/communities")} className="hover:text-[#1769c2]">Communities</button>
          {community && <><span>/</span><span className="text-[#171717]">{community.name}</span></>}
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-32 rounded-2xl bg-white/60" />
            <div className="h-8 w-1/3 rounded bg-white/60" />
          </div>
        ) : community && (
          <>
            {/* Community Header */}
            <div className="mb-6 overflow-hidden rounded-2xl border border-[#e8e6e3] bg-white shadow-xs">
              {/* Cover banner */}
              <div className="flex h-28 items-center justify-center bg-gradient-to-r from-[#eef5fc] to-[#dbeafe] text-4xl">
                {SPECIALTY_EMOJI[community.specialty ?? ""] ?? "👥"}
              </div>

              <div className="px-5 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl font-bold text-[#171717]">{community.name}</h1>
                      {community.specialty && (
                        <span className="rounded-full border border-[#dbeafe] bg-[#eef5fc] px-2.5 py-0.5 text-xs font-semibold text-[#1769c2]">
                          {community.specialty}
                        </span>
                      )}
                    </div>
                    {community.description && (
                      <p className="mt-1.5 text-sm text-[#77716b]">{community.description}</p>
                    )}
                    <p className="mt-2 text-xs text-[#a09890]">
                      {community.member_count.toLocaleString()} members
                      {community.post_count > 0 ? ` · ${community.post_count.toLocaleString()} posts` : ""}
                      {" · "}{community.visibility === "public" ? "Public community" : "Private community"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleJoinLeave}
                    className={`shrink-0 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                      community.is_member
                        ? "bg-[#eef5fc] text-[#1769c2] hover:bg-[#1769c2] hover:text-white"
                        : "bg-[#1769c2] text-white hover:bg-[#12569f]"
                    }`}
                  >
                    {community.is_member ? "✓ Joined" : "Join Community"}
                  </button>
                </div>

                {/* Sub-tabs */}
                <div className="mt-4 flex gap-0.5 rounded-xl border border-[#e8e6e3] bg-[#f8f7f6] p-1 w-fit">
                  {(["posts", "about"] as const).map((t) => (
                    <button key={t} type="button" onClick={() => setActiveTab(t)}
                      className={`rounded-lg px-4 py-1.5 text-xs font-medium capitalize transition ${activeTab === t ? "bg-white text-[#1769c2] shadow-xs" : "text-[#77716b] hover:text-[#171717]"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content */}
            {activeTab === "posts" && (
              <div className="space-y-4">
                {community.is_member && (
                  <CreatePost
                    userImage={session.user.image ?? undefined}
                    userName={session.user.name ?? undefined}
                    onPosted={() => {}}
                  />
                )}
                {postsLoading ? (
                  <div className="space-y-4">{[1, 2].map((i) => <PostCardSkeleton key={i} />)}</div>
                ) : posts.length === 0 ? (
                  <EmptyState icon="📰" title="No posts yet" description={community.is_member ? "Be the first to post in this community!" : "Join this community to see and create posts."} />
                ) : (
                  posts.map((post) => <PostCard key={post.id} post={post} currentUserId={session.user.id} />)
                )}
              </div>
            )}

            {activeTab === "about" && (
              <div className="rounded-2xl border border-[#e8e6e3] bg-white p-5 shadow-xs">
                <h2 className="mb-3 text-sm font-semibold text-[#171717]">About this Community</h2>
                <p className="text-sm leading-relaxed text-[#5d5854]">{community.description ?? "No description provided."}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 border-t border-[#f0efee] pt-4 text-xs">
                  {community.specialty && <div><span className="text-[#77716b]">Specialty: </span><span className="font-medium text-[#171717]">{community.specialty}</span></div>}
                  <div><span className="text-[#77716b]">Visibility: </span><span className="font-medium text-[#171717] capitalize">{community.visibility}</span></div>
                  <div><span className="text-[#77716b]">Members: </span><span className="font-medium text-[#171717]">{community.member_count.toLocaleString()}</span></div>
                  <div><span className="text-[#77716b]">Join: </span><span className="font-medium text-[#171717] capitalize">{community.join_mode === "open" ? "Open to all" : "Approval required"}</span></div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
