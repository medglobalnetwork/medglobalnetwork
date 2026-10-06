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
  MapPin,
  RefreshCw,
} from "lucide-react";
import { PostCard } from "@/modules/network/components/PostCard";
import { CreatePost } from "@/modules/network/components/CreatePost";
import { EmptyState } from "@/modules/network/components/EmptyState";
import { PostCardSkeleton } from "@/modules/network/components/SkeletonLoader";
import type { NetworkPost } from "@/modules/network/types";
import { useLocationTracking } from "@/lib/use-location-tracking";
import { CitySelectorModal } from "@/components/location/CitySelectorModal";
import { SponsoredBanner } from "@/components/ads/SponsoredBanner";

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
  const [activeTab, setActiveTab] = React.useState<"for_you" | "nearby" | "following" | "communities">("for_you");
  const [filterType, setFilterType] = React.useState("All Content");
  const [posts, setPosts] = React.useState<NetworkPost[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(false);
  const [recommendedConnected, setRecommendedConnected] = React.useState(false);

  const {
    location,
    isLoading: isLocationLoading,
    requestLocation,
    setManualCity,
  } = useLocationTracking();
  const [isCityModalOpen, setIsCityModalOpen] = React.useState(false);

  const fetchPosts = React.useCallback(
    async (targetPage = 1, append = false, tab = activeTab) => {
      setIsLoading(true);
      try {
        let feedParam = "";
        if (tab === "following") {
          feedParam = "&feed=following";
        } else if (tab === "nearby") {
          feedParam = "&feed=nearby";
          if (location?.city) feedParam += `&city=${encodeURIComponent(location.city)}`;
          if (location?.state) feedParam += `&state=${encodeURIComponent(location.state)}`;
          if (location?.lat && location?.lng) feedParam += `&lat=${location.lat}&lng=${location.lng}`;
        }
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
    [activeTab, location?.city, location?.state, location?.lat, location?.lng]
  );

  React.useEffect(() => {
    fetchPosts(1, false, activeTab);
  }, [fetchPosts, activeTab]);

  React.useEffect(() => {
    const handlePullRefresh = () => {
      fetchPosts(1, false, activeTab);
    };
    window.addEventListener("mgn-pull-to-refresh", handlePullRefresh);
    return () => window.removeEventListener("mgn-pull-to-refresh", handlePullRefresh);
  }, [fetchPosts, activeTab]);

  const handlePostCreated = () => {
    fetchPosts(1, false, activeTab);
  };

  return (
    <div className="space-y-5">
      {/* 1. SOCIAL POST COMPOSER */}
      <CreatePost
        onPosted={handlePostCreated}
        userId={currentUserId}
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
                ? "text-[#0f4c81]"
                : "text-[#77716b] hover:text-[#171717]"
            }`}
          >
            For You
            {activeTab === "for_you" && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#0f4c81]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("nearby")}
            className={`relative pb-3 text-sm font-bold transition flex items-center gap-1 ${
              activeTab === "nearby"
                ? "text-[#0f4c81]"
                : "text-[#77716b] hover:text-[#171717]"
            }`}
          >
            <span>📍 Nearby</span>
            {activeTab === "nearby" && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#0f4c81]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("following")}
            className={`relative pb-3 text-sm font-bold transition ${
              activeTab === "following"
                ? "text-[#0f4c81]"
                : "text-[#77716b] hover:text-[#171717]"
            }`}
          >
            Following
            {activeTab === "following" && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#0f4c81]" />
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
                ? "text-[#0f4c81]"
                : "text-[#77716b] hover:text-[#171717]"
            }`}
          >
            Communities
            {activeTab === "communities" && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#0f4c81]" />
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
      {/* DYNAMIC SPONSORED BANNER AD CONFIGURED IN /admin/ads */}
      <SponsoredBanner slot="feed_hero" />

      {/* NEARBY LOCATION BAR (WHEN NEARBY TAB IS ACTIVE) */}
      {activeTab === "nearby" && (
        <div className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-3.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#0f4c81]/10 text-[#0f4c81] dark:bg-[#0f4c81]/25 dark:text-blue-400">
              <MapPin className="size-4.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-bold text-[#171717] dark:text-[#f0f6fc] truncate">
                  {location?.city ? `Local Posts in ${location.city}` : "Detecting local medical feed..."}
                </span>
                {location?.source === "gps" && (
                  <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.2 text-[9px] font-bold">
                    GPS
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#77716b] dark:text-[#8b949e] truncate">
                {location?.state
                  ? `Clinical updates from healthcare practitioners in ${location.city}, ${location.state}`
                  : "Personalized based on your detected location"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={() => setIsCityModalOpen(true)}
              className="rounded-lg px-2.5 py-1 text-xs font-semibold text-[#0f4c81] dark:text-blue-400 hover:bg-[#0f4c81]/10 transition"
            >
              Change City
            </button>
            <button
              type="button"
              onClick={() => requestLocation()}
              disabled={isLocationLoading}
              title="Refresh GPS"
              className="rounded-lg p-1.5 text-[#77716b] hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              <RefreshCw className={`size-3.5 ${isLocationLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              onClick={() => router.push("/suggestions")}
              className="rounded-xl bg-[#0f4c81] px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#0c3c66] transition inline-flex items-center gap-1"
            >
              Hub <ArrowRight className="size-3" />
            </button>
          </div>
        </div>
      )}

      {isLoading && posts.length === 0 ? (
        <div className="space-y-4">
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Post Items */}
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              onDelete={(deletedId) => setPosts((prev) => prev.filter((p) => p.id !== deletedId))}
            />
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

      <CitySelectorModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        currentCity={location?.city}
        onSelectCity={(city) => {
          setManualCity(city.name, city.state, city.lat, city.lng);
        }}
      />
    </div>
  );
}
