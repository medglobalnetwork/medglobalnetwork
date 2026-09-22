"use client";

import * as React from "react";
import { 
  Grid3X3, 
  Film, 
  Bookmark, 
  Tag, 
  Pin, 
  Play, 
  Heart, 
  MessageCircle, 
  Share2, 
  X, 
  SlidersHorizontal,
  Repeat,
  UserCheck,
  CheckCircle2
} from "lucide-react";

export interface MediaPost {
  id: string;
  type: "post" | "reel" | "tagged" | "saved";
  mediaUrl: string;
  caption: string;
  likes: number;
  commentsCount: number;
  views?: string;
  isPinned?: boolean;
  isVideo?: boolean;
  timestamp: string;
  tags?: string[];
  comments?: Array<{
    id: string;
    author: string;
    avatar?: string;
    text: string;
    time: string;
  }>;
}

import { useRouter } from "next/navigation";

interface ProfileContentGridProps {
  userId: string;
  isOwnProfile?: boolean;
}

export function ProfileContentGrid({ userId, isOwnProfile }: ProfileContentGridProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<"posts" | "reels" | "saved" | "tagged">("posts");
  const [sortBy, setSortBy] = React.useState<"latest" | "popular" | "oldest">("latest");
  const [selectedPost, setSelectedPost] = React.useState<MediaPost | null>(null);
  const [commentInput, setCommentInput] = React.useState("");
  const [posts, setPosts] = React.useState<MediaPost[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Fetch real posts for this user
  React.useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`/api/network/posts?userId=${userId}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.data && Array.isArray(data.data)) {
          const formatted: MediaPost[] = data.data.map((p: any) => {
            let media = "";
            let isVideo = false;
            if (p.media_urls) {
              try {
                const parsed = typeof p.media_urls === "string" ? JSON.parse(p.media_urls) : p.media_urls;
                if (Array.isArray(parsed) && parsed.length > 0) {
                  media = parsed[0];
                  isVideo = media.endsWith(".mp4") || media.endsWith(".webm") || p.post_type === "video";
                }
              } catch {}
            }
            if (!media) {
              // Standard medical card background placeholder if text post
              media = "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80";
            }

            return {
              id: p.id,
              type: isVideo ? "reel" : "post",
              mediaUrl: media,
              caption: p.content,
              likes: p.reaction_count || 0,
              commentsCount: p.comment_count || 0,
              isVideo,
              timestamp: new Date(p.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              }),
            };
          });
          setPosts(formatted);
        } else {
          setPosts([]);
        }
      })
      .catch(() => {
        setPosts([]);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  // Filter posts based on active tab
  const filteredPosts = React.useMemo(() => {
    let list = [...posts];
    if (activeTab === "reels") {
      list = list.filter((p) => p.type === "reel" || p.isVideo);
    } else if (activeTab === "saved") {
      list = list.filter((p) => p.type === "saved" || p.isPinned);
    } else if (activeTab === "tagged") {
      list = list.filter((p) => p.type === "tagged");
    }

    if (sortBy === "popular") {
      list.sort((a, b) => b.likes - a.likes);
    } else if (sortBy === "oldest") {
      list.reverse();
    }
    return list;
  }, [posts, activeTab, sortBy]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !selectedPost) return;

    const newComment = {
      id: `c-${Date.now()}`,
      author: "You",
      text: commentInput.trim(),
      time: "Just now",
    };

    setSelectedPost({
      ...selectedPost,
      commentsCount: selectedPost.commentsCount + 1,
      comments: [...(selectedPost.comments || []), newComment],
    });
    setCommentInput("");
  };

  return (
    <div className="rounded-3xl bg-white border border-[#e8e6e3] shadow-xs overflow-hidden mb-6">
      {/* Instagram 4-Icon Navigation Tabs */}
      <div className="grid grid-cols-4 border-b border-[#e8e6e3] bg-white">
        <button
          type="button"
          onClick={() => setActiveTab("posts")}
          className={`flex items-center justify-center py-3.5 sm:py-4 transition-all border-b-2 ${
            activeTab === "posts"
              ? "border-[#171717] text-[#171717]"
              : "border-transparent text-[#a8a29e] hover:text-[#57534e]"
          }`}
          title="Posts"
        >
          <Grid3X3 className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("reels")}
          className={`flex items-center justify-center py-3.5 sm:py-4 transition-all border-b-2 ${
            activeTab === "reels"
              ? "border-[#171717] text-[#171717]"
              : "border-transparent text-[#a8a29e] hover:text-[#57534e]"
          }`}
          title="Reels"
        >
          <Film className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("saved")}
          className={`flex items-center justify-center py-3.5 sm:py-4 transition-all border-b-2 ${
            activeTab === "saved"
              ? "border-[#171717] text-[#171717]"
              : "border-transparent text-[#a8a29e] hover:text-[#57534e]"
          }`}
          title="Saved & Reposts"
        >
          <Repeat className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tagged")}
          className={`flex items-center justify-center py-3.5 sm:py-4 transition-all border-b-2 ${
            activeTab === "tagged"
              ? "border-[#171717] text-[#171717]"
              : "border-transparent text-[#a8a29e] hover:text-[#57534e]"
          }`}
          title="Tagged"
        >
          <UserCheck className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      </div>

      {/* 3-Column Instagram-Style Media Grid or Clean Empty State */}
      <div className="p-1 sm:p-4">
        {loading ? (
          <div className="grid grid-cols-3 gap-1 sm:gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-square sm:aspect-4/5 w-full rounded-2xl bg-[#f5f4f3] animate-pulse"
              />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-14 sm:py-16 px-4 text-center flex flex-col items-center justify-center">
            <div className="h-14 w-14 rounded-2xl bg-[#f4f8fe] text-[#1769c2] flex items-center justify-center mb-3">
              {activeTab === "posts" && <Grid3X3 className="h-6 w-6" />}
              {activeTab === "reels" && <Film className="h-6 w-6" />}
              {activeTab === "saved" && <Bookmark className="h-6 w-6" />}
              {activeTab === "tagged" && <Tag className="h-6 w-6" />}
            </div>

            <h3 className="text-sm sm:text-base font-bold text-[#171717] mb-1">
              {activeTab === "posts" && (isOwnProfile ? "Share Your First Post" : "No posts yet")}
              {activeTab === "reels" && (isOwnProfile ? "No Clinical Videos Yet" : "No video updates")}
              {activeTab === "saved" && (isOwnProfile ? "No Saved Content" : "Saved items are private")}
              {activeTab === "tagged" && "No Tagged Posts"}
            </h3>

            <p className="text-xs text-[#5d5854] max-w-sm leading-relaxed mb-4">
              {activeTab === "posts" &&
                (isOwnProfile
                  ? "Publish case observations, rehabilitation protocols, or medical insights to engage with the network."
                  : "When this clinician shares clinical observations or research updates, they will appear here.")}
              {activeTab === "reels" &&
                (isOwnProfile
                  ? "Share technique demonstrations, exercise walk-throughs, or surgery clips with peers."
                  : "No short clinical video clips have been published yet.")}
              {activeTab === "saved" &&
                (isOwnProfile
                  ? "Bookmark insightful clinical posts, research links, and discussions to reference later."
                  : "Only the profile owner can view their saved bookmarks.")}
              {activeTab === "tagged" && "Posts and discussions mentioning this profile will appear here."}
            </p>

            {isOwnProfile && (activeTab === "posts" || activeTab === "reels") && (
              <button
                type="button"
                onClick={() => router.push("/network/feed")}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1769c2] hover:bg-[#12569f] px-4 py-2 text-xs font-bold text-white shadow-xs transition active:scale-95"
              >
                <span>Create Post</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 sm:gap-2">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="group relative aspect-square sm:aspect-4/5 w-full overflow-hidden cursor-pointer bg-black/5 transition-transform active:scale-98 rounded-xl sm:rounded-2xl"
              >
                {/* Image Thumbnail */}
                <img
                  src={post.mediaUrl}
                  alt={post.caption}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Dark Vignette Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Pinned Badge (Top Right) */}
                {post.isPinned && (
                  <div className="absolute top-2 right-2 flex items-center justify-center">
                    <Pin className="h-4 w-4 fill-white text-white drop-shadow-md" />
                  </div>
                )}

                {/* Video Icon (Bottom/Top Right) */}
                {post.isVideo && !post.isPinned && (
                  <div className="absolute top-2 right-2 flex items-center justify-center">
                    <Film className="h-4 w-4 text-white drop-shadow-md" />
                  </div>
                )}

                {/* Hover Like & Comment Counts */}
                <div className="absolute inset-0 hidden group-hover:flex items-center justify-center gap-3 text-white text-xs font-bold bg-black/30">
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4 fill-white text-white" /> {post.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4 fill-white text-white" /> {post.commentsCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Post Viewer Modal / Lightbox */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-6 animate-fade-in">
          <div className="relative flex flex-col md:flex-row w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            {/* Close trigger */}
            <button
              type="button"
              onClick={() => setSelectedPost(null)}
              className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Left Image / Video Display */}
            <div className="relative md:w-3/5 bg-black flex items-center justify-center min-h-[280px] sm:min-h-[420px]">
              <img
                src={selectedPost.mediaUrl}
                alt={selectedPost.caption}
                className="max-h-[70vh] w-full object-contain"
              />
              {selectedPost.isVideo && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/30 backdrop-blur-md text-white shadow-xl hover:scale-110 transition cursor-pointer">
                    <Play className="h-7 w-7 fill-white ml-1" />
                  </div>
                </div>
              )}
            </div>

            {/* Right Details, Captions & Comments */}
            <div className="flex flex-col md:w-2/5 p-4 sm:p-6 justify-between bg-white overflow-y-auto">
              <div className="space-y-4">
                {/* Author row */}
                <div className="flex items-center gap-3 pb-3 border-b border-[#f0efee]">
                  <div className="h-10 w-10 rounded-full bg-[#1769c2] text-white flex items-center justify-center font-bold text-sm">
                    MGN
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-bold text-[#171717]">Professional Clinician</p>
                      <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 fill-blue-500 text-white" />
                    </div>
                    <p className="text-[11px] text-[#77716b]">{selectedPost.timestamp}</p>
                  </div>
                </div>

                {/* Caption */}
                <p className="text-xs sm:text-sm text-[#171717] leading-relaxed">
                  {selectedPost.caption}
                </p>

                {/* Tags */}
                {selectedPost.tags && selectedPost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPost.tags.map((t, idx) => (
                      <span key={idx} className="text-[11px] font-semibold text-[#1769c2]">
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Comments section */}
                <div className="pt-3 border-t border-[#f0efee]">
                  <p className="text-xs font-bold text-[#5d5854] mb-2.5">
                    Comments ({selectedPost.commentsCount})
                  </p>
                  <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
                    {selectedPost.comments && selectedPost.comments.length > 0 ? (
                      selectedPost.comments.map((c) => (
                        <div key={c.id} className="text-xs bg-[#f8f7f6] p-2.5 rounded-xl">
                          <span className="font-bold text-[#171717]">{c.author}: </span>
                          <span className="text-[#5d5854]">{c.text}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-[#a09890] italic">No comments yet. Be the first to start the clinical discussion!</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Toolbar & Add Comment Form */}
              <div className="pt-4 border-t border-[#f0efee] mt-4 space-y-3">
                <div className="flex items-center justify-between text-[#5d5854]">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedPost({
                          ...selectedPost,
                          likes: selectedPost.likes + 1,
                        })
                      }
                      className="flex items-center gap-1 text-xs font-bold hover:text-red-600 transition"
                    >
                      <Heart className="h-4 w-4" />
                      <span>{selectedPost.likes}</span>
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-1 text-xs font-bold hover:text-[#1769c2] transition"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>{selectedPost.commentsCount}</span>
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-1 text-xs font-bold hover:text-[#1769c2] transition"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                  {selectedPost.views && (
                    <span className="text-[11px] font-semibold text-[#77716b]">
                      {selectedPost.views} views
                    </span>
                  )}
                </div>

                {/* Comment input form */}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a clinical comment..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    className="flex-1 rounded-xl border border-[#ded8d1] px-3 py-1.5 text-xs text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#1769c2]"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-[#1769c2] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#12569f] transition"
                  >
                    Post
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
