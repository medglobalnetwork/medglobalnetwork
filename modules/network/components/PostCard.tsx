"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { NetworkPost, PostComment } from "../types";
import { VerificationBadge } from "./VerificationBadge";
import { getProfessionColor } from "../lib/network-data";
import { formatContentTimestamp, formatExactDateTime } from "@/lib/date";
import PulseHeart from "@/components/ui/PulseHeart";
import {
  MessageSquare,
  Share2,
  Bookmark,
  BookmarkCheck,
  FileText,
  ExternalLink,
  Maximize2,
  Play,
  Film,
  Sparkles,
  MoreHorizontal,
  X,
  Eye,
  Check,
  Volume2,
  VolumeX,
  RotateCcw,
} from "lucide-react";

const POST_TYPE_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  text: { label: "Post", color: "#77716b", bg: "#f5f4f3" },
  image: { label: "Photo", color: "#0369a1", bg: "#e0f2fe" },
  video: { label: "Video", color: "#7c3aed", bg: "#ede9fe" },
  document: { label: "Document", color: "#0d9488", bg: "#ccfbf1" },
  poll: { label: "Poll", color: "#6d28d9", bg: "#f3e8ff" },
  research: { label: "Research", color: "#0e7490", bg: "#e0f2fe" },
  achievement: { label: "Achievement", color: "#b45309", bg: "#fef3c7" },
  question: { label: "Question", color: "#15803d", bg: "#dcfce7" },
  job: { label: "Opportunity", color: "#0f4c81", bg: "#eef5fc" },
  event: { label: "Event", color: "#be185d", bg: "#fce7f3" },
};

interface PostCardProps {
  post: NetworkPost;
  currentUserId?: string;
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const router = useRouter();
  const [reacted, setReacted] = React.useState(post.user_reacted ?? false);
  const [reactionCount, setReactionCount] = React.useState(post.reaction_count || 0);
  const [likeLoading, setLikeLoading] = React.useState(false);
  const [showComments, setShowComments] = React.useState(false);
  const [saved, setSaved] = React.useState(post.user_saved ?? false);
  const [comments, setComments] = React.useState<PostComment[]>([]);
  const [commentText, setCommentText] = React.useState("");
  const [commentLoading, setCommentLoading] = React.useState(false);
  const [commentsLoaded, setCommentsLoaded] = React.useState(false);
  const [reported, setReported] = React.useState(false);
  const [isExpandedText, setIsExpandedText] = React.useState(false);
  const [copiedLink, setCopiedLink] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  // Video autoplay & playback management
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(true);
  const [hasEnded, setHasEnded] = React.useState(false);

  const author = post.author;
  const isVerified =
    author?.identity_verified ||
    author?.education_verified ||
    author?.registration_verified;
  const avatarColor = getProfessionColor(author?.profession);
  const initials = (author?.name || "U")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const badge = POST_TYPE_BADGE[post.post_type] ?? POST_TYPE_BADGE.text;

  // Media list parsing
  const mediaUrls = Array.isArray(post.media_urls)
    ? post.media_urls.filter((u) => typeof u === "string" && u.trim().length > 0)
    : [];

  const isVideoPost =
    post.post_type === "video" ||
    mediaUrls.some((u) => u.match(/\.(mp4|webm|mov|m4v|mkv)$/i) || u.includes("video"));

  const isDocumentPost =
    post.post_type === "document" ||
    mediaUrls.some((u) => u.match(/\.(pdf|doc|docx|ppt|pptx|xls|xlsx)$/i));

  const isImagePost =
    (post.post_type === "image" || (!isVideoPost && !isDocumentPost)) && mediaUrls.length > 0;

  // Autoplay video when scrolled into viewport; pause when out of view
  React.useEffect(() => {
    if (!isVideoPost || !videoRef.current) return;

    const el = videoRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
            if (!hasEnded) {
              el.play()
                .then(() => setIsPlaying(true))
                .catch(() => {
                  // Browser policy fallback
                  setIsPlaying(false);
                });
            }
          } else {
            el.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: [0, 0.4, 0.8] }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [isVideoPost, hasEnded]);

  const handleVideoEnded = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setIsPlaying(false);
    setHasEnded(true);
  };

  const handleReplayVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current
        .play()
        .then(() => {
          setHasEnded(false);
          setIsPlaying(true);
        })
        .catch(() => {});
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    if (!nextMuted) {
      videoRef.current.volume = 1.0;
    }
    setIsMuted(nextMuted);
  };

  // Truncation check
  const isLongContent = (post.content || "").length > 280;
  const displayContent = isLongContent && !isExpandedText
    ? post.content.slice(0, 280).trim() + "..."
    : post.content;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleReact = async (..._args: unknown[]) => {
    const wasReacted = reacted;
    const previousCount = reactionCount;

    setReacted(!wasReacted);
    setReactionCount((c) => (wasReacted ? Math.max(0, c - 1) : c + 1));

    setLikeLoading(true);
    try {
      if (wasReacted) {
        const res = await fetch(`/api/network/posts/${post.id}/reactions`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to remove like");
      } else {
        const res = await fetch(`/api/network/posts/${post.id}/reactions`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reactionType: "like" }),
        });
        if (!res.ok) throw new Error("Failed to add like");
      }
    } catch (err) {
      console.error("Reaction failed:", err);
      setReacted(wasReacted);
      setReactionCount(previousCount);
    } finally {
      setLikeLoading(false);
    }
  };

  const loadComments = async () => {
    setShowComments((s) => !s);
    if (!commentsLoaded) {
      try {
        const res = await fetch(`/api/network/posts/${post.id}/comments`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setComments(data.data ?? []);
          setCommentsLoaded(true);
        }
      } catch (err) {
        console.error("Failed to load comments:", err);
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setCommentLoading(true);
    try {
      const res = await fetch(`/api/network/posts/${post.id}/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText.trim() }),
      });

      if (res.ok) {
        const newC: PostComment = {
          id: String(Date.now()),
          post_id: post.id,
          author_id: currentUserId ?? "",
          content: commentText.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          author: {
            id: currentUserId ?? "",
            user_id: currentUserId ?? "",
            name: "You",
            email: "",
            identity_verified: true,
            education_verified: false,
            registration_verified: false,
            experience_verified: false,
          },
        };
        setComments((prev) => [...prev, newC]);
        setCommentText("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      const postUrl = `${window.location.origin}/feed#post-${post.id}`;
      navigator.clipboard.writeText(postUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  const handleToggleSave = () => {
    setSaved((prev) => !prev);
  };

  const handleReport = () => {
    if (confirm("Report this post for healthcare community guidelines review?")) {
      setReported(true);
      alert("Post reported to MGN moderation team.");
    }
  };

  return (
    <article
      id={`post-${post.id}`}
      className="rounded-none sm:rounded-3xl border-y sm:border border-[#f0efee] sm:border-[#e8e6e3] bg-white p-3.5 sm:p-5 shadow-none sm:shadow-xs transition hover:border-[#ded8d1] relative overflow-hidden"
    >
      {/* 1. Header: Author info, Post Type Badge, Timestamp */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Avatar */}
          <button
            type="button"
            onClick={() => router.push(`/profile/${author?.user_id ?? post.author_id}`)}
            className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] rounded-full"
          >
            <div
              className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full text-sm font-bold text-[#3f3f3c] overflow-hidden border border-[#e8e6e3] shadow-2xs"
              style={{ background: avatarColor }}
            >
              {author?.image ? (
                <img
                  src={author.image}
                  alt={author.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
          </button>

          {/* Author Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => router.push(`/profile/${author?.user_id ?? post.author_id}`)}
                className="text-sm font-bold text-[#171717] hover:text-[#0f4c81] transition truncate text-left"
              >
                {author?.name ?? "Healthcare Professional"}
              </button>
              {isVerified && <VerificationBadge size="sm" />}

              {post.post_type !== "text" && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border shadow-2xs"
                  style={{
                    backgroundColor: badge.bg,
                    borderColor: badge.color + "30",
                    color: badge.color,
                  }}
                >
                  {post.post_type === "video" ? (
                    <Film className="h-3 w-3 stroke-[2.2]" />
                  ) : post.post_type === "document" ? (
                    <FileText className="h-3 w-3 stroke-[2.2]" />
                  ) : null}
                  {badge.label}
                </span>
              )}
            </div>

            <p className="text-[11px] text-[#77716b] truncate font-medium mt-0.5">
              {author?.profession || "Healthcare Professional"}
              {author?.specialization ? ` · ${author.specialization}` : ""}
              {author?.organization ? ` · ${author.organization}` : ""}
            </p>

            <time
              dateTime={new Date(post.created_at).toISOString()}
              title={formatExactDateTime(post.created_at)}
              className="text-[11px] text-[#8a8784] font-medium block mt-0.5 hover:text-[#171717] transition cursor-default"
            >
              {formatContentTimestamp(post.created_at)}
            </time>
          </div>
        </div>

        {/* Top Right: Report & Options */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleReport}
            title={reported ? "Reported" : "Report post"}
            disabled={reported}
            className="p-1.5 rounded-lg text-[#a09890] hover:bg-[#f8f7f6] hover:text-rose-600 transition"
          >
            {reported ? (
              <span className="text-[10px] font-bold text-rose-600">Reported</span>
            ) : (
              <span className="text-xs">🚩</span>
            )}
          </button>
        </div>
      </div>

      {/* 2. Text Content (Above Media, LinkedIn/Instagram Style) */}
      {post.content && post.content.trim() && (
        <div className="mt-3">
          <p className="whitespace-pre-line text-sm leading-relaxed text-[#171717]">
            {displayContent}
          </p>
          {isLongContent && (
            <button
              type="button"
              onClick={() => setIsExpandedText((prev) => !prev)}
              className="mt-1 text-xs font-bold text-[#0f4c81] hover:underline"
            >
              {isExpandedText ? "Show less" : "See more"}
            </button>
          )}
        </div>
      )}

      {/* 3. Rich Media Container (Instagram / LinkedIn Feed Experience) */}
      {mediaUrls.length > 0 && (
        <div className="mt-3 rounded-xl sm:rounded-2xl overflow-hidden border border-[#f0efee] sm:border-[#e8e6e3] bg-[#0c0d0e] shadow-2xs">
          {/* A. Video Post */}
          {isVideoPost ? (
            <div className="relative w-full bg-black flex items-center justify-center overflow-hidden group">
              <video
                ref={videoRef}
                src={mediaUrls[0]}
                controls
                playsInline
                muted={isMuted}
                preload="metadata"
                onVolumeChange={(e) => {
                  setIsMuted(e.currentTarget.muted || e.currentTarget.volume === 0);
                }}
                onEnded={handleVideoEnded}
                onPlay={() => {
                  setIsPlaying(true);
                  setHasEnded(false);
                }}
                onPause={() => setIsPlaying(false)}
                className="w-full max-h-[520px] object-contain rounded-xl sm:rounded-2xl bg-black focus:outline-none"
              />

              {/* Replay Overlay when video finishes */}
              {hasEnded && (
                <div
                  onClick={handleReplayVideo}
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/65 cursor-pointer backdrop-blur-xs transition animate-in fade-in"
                >
                  <button
                    type="button"
                    className="flex h-13 w-13 items-center justify-center rounded-full bg-white/25 text-white hover:bg-white/40 transition hover:scale-105 shadow-lg"
                  >
                    <RotateCcw className="h-6 w-6 stroke-[2.5]" />
                  </button>
                  <span className="mt-2 text-xs font-bold text-white tracking-wide">
                    Watch Again
                  </span>
                </div>
              )}

              {/* Quick Volume / Mute Button Overlay (Top-Right position avoiding native player bar) */}
              <button
                type="button"
                onClick={handleToggleMute}
                aria-label={isMuted ? "Unmute video sound" : "Mute video sound"}
                className="absolute top-3 right-3 z-20 flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1.5 text-white hover:bg-black/90 transition backdrop-blur-md shadow-md active:scale-95 cursor-pointer border border-white/10"
              >
                {isMuted ? (
                  <>
                    <VolumeX className="h-4 w-4 stroke-[2.2] text-rose-300" />
                    <span className="text-[11px] font-semibold text-white/95">Tap for sound</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4 stroke-[2.2] text-emerald-400" />
                    <span className="text-[11px] font-semibold text-emerald-300">Sound on</span>
                  </>
                )}
              </button>
            </div>
          ) : isDocumentPost ? (
            /* B. Document Post */
            <div className="p-4 bg-[#f8fafd] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eef5fc] text-[#0f4c81] border border-[#d6e7f7]">
                  <FileText className="h-6 w-6 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#171717] truncate">
                    Clinical Document / Paper
                  </p>
                  <p className="text-[11px] text-[#77716b] truncate">
                    {mediaUrls[0].split("/").pop() || "Document.pdf"}
                  </p>
                </div>
              </div>
              <a
                href={mediaUrls[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] px-3.5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#0c3c66] transition shrink-0"
              >
                <span>View File</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          ) : isImagePost ? (
            /* C. Image / Photo Gallery (Single or Multi-Grid) */
            mediaUrls.length === 1 ? (
              <div
                onClick={() => setSelectedImage(mediaUrls[0])}
                className="relative w-full max-h-[540px] bg-slate-900 cursor-pointer group flex items-center justify-center overflow-hidden"
              >
                <img
                  src={mediaUrls[0]}
                  alt="Post media"
                  className="w-full max-h-[540px] object-contain transition duration-200 group-hover:scale-[1.01]"
                />
                <div className="absolute top-3 right-3 rounded-full bg-black/50 p-1.5 text-white opacity-0 group-hover:opacity-100 transition backdrop-blur-xs">
                  <Maximize2 className="h-4 w-4" />
                </div>
              </div>
            ) : mediaUrls.length === 2 ? (
              <div className="grid grid-cols-2 gap-1 bg-black">
                {mediaUrls.slice(0, 2).map((url, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedImage(url)}
                    className="relative aspect-square cursor-pointer overflow-hidden group"
                  >
                    <img
                      src={url}
                      alt={`Post attachment ${i + 1}`}
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-200"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1 bg-black">
                {mediaUrls.slice(0, 4).map((url, i) => {
                  const isFourth = i === 3 && mediaUrls.length > 4;
                  return (
                    <div
                      key={i}
                      onClick={() => setSelectedImage(url)}
                      className="relative aspect-square cursor-pointer overflow-hidden group"
                    >
                      <img
                        src={url}
                        alt={`Post attachment ${i + 1}`}
                        className="h-full w-full object-cover group-hover:scale-105 transition duration-200"
                      />
                      {isFourth && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-base font-bold backdrop-blur-xs">
                          +{mediaUrls.length - 3} more
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          ) : null}
        </div>
      )}

      {/* 4. Action Bar (Instagram / LinkedIn Style: Like, Comment, Share, Save) */}
      <div className="mt-4 flex items-center justify-between border-t border-[#f0efee] pt-3 text-xs">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Like — PulseHeart */}
          <PulseHeart
            liked={reacted}
            count={reactionCount}
            onChange={handleReact}
            showCount={reactionCount > 0}
            icon="heart"
            idleOutline
            size={18}
            corner={18}
            likedColor="#e11d48"
            idleColor="#77716b"
            pillColor="#f5f4f2"
            textColor="#171717"
            duration={520}
            dotSize={0.25}
            overshoot={1.6}
            beat={2.5}
            rollDuration={320}
            label="Like"
            className="!rounded-xl"
          />

          {/* Comment */}
          <button
            type="button"
            onClick={loadComments}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold transition active:scale-95 ${
              showComments
                ? "bg-[#eef5fc] text-[#0f4c81]"
                : "text-[#5d5854] hover:bg-[#f5f4f2] hover:text-[#171717]"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>
              {post.comment_count + comments.length > 0
                ? post.comment_count + comments.length
                : "Comment"}
            </span>
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold text-[#5d5854] hover:bg-[#f5f4f2] hover:text-[#171717] transition active:scale-95"
          >
            {copiedLink ? (
              <>
                <Check className="h-4 w-4 text-[#16804d]" />
                <span className="text-[#16804d]">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>

        {/* Save / Bookmark Button */}
        <button
          type="button"
          onClick={handleToggleSave}
          title={saved ? "Saved to your bookmarks" : "Save post"}
          className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 font-bold transition active:scale-95 ${
            saved
              ? "text-[#0f4c81] bg-[#eef5fc]"
              : "text-[#5d5854] hover:bg-[#f5f4f2] hover:text-[#171717]"
          }`}
        >
          {saved ? (
            <BookmarkCheck className="h-4 w-4 fill-[#0f4c81]" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span>
        </button>
      </div>

      {/* 5. Expandable Comments Section */}
      {showComments && (
        <div className="mt-3.5 space-y-3 border-t border-[#f0efee] pt-3.5 animate-in fade-in duration-200">
          {/* Add Comment Input */}
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a clinical comment or insight..."
              className="h-9 flex-1 rounded-xl border border-[#ded8d1] px-3 text-xs text-[#171717] placeholder:text-[#8a8784] focus:border-[#0f4c81] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
            />
            <button
              type="submit"
              disabled={commentLoading || !commentText.trim()}
              className="rounded-xl bg-[#0f4c81] px-4 py-1.5 text-xs font-bold text-white transition hover:bg-[#0c3c66] disabled:opacity-50 shadow-2xs"
            >
              {commentLoading ? "…" : "Post"}
            </button>
          </form>

          {/* Comments List */}
          {comments.length > 0 ? (
            <ul className="space-y-2.5 pt-1">
              {comments.map((c) => (
                <li
                  key={c.id}
                  className="rounded-2xl bg-[#faf9f8] p-3 text-xs border border-[#f0efee]"
                >
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => router.push(`/profile/${c.author?.user_id || c.author_id}`)}
                      className="font-bold text-[#171717] hover:text-[#0f4c81] hover:underline text-left"
                    >
                      {c.author?.name || "Healthcare Professional"}
                    </button>
                    <time
                      dateTime={new Date(c.created_at).toISOString()}
                      title={formatExactDateTime(c.created_at)}
                      className="text-[10px] text-[#8a8784] font-medium"
                    >
                      {formatContentTimestamp(c.created_at)}
                    </time>
                  </div>
                  <p className="mt-1 text-[#44403c] leading-relaxed">{c.content}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-xs text-[#8a8784] py-2">
              No comments yet. Be the first to share your thoughts!
            </p>
          )}
        </div>
      )}

      {/* 6. Image Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl">
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black transition"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={selectedImage}
              alt="Enlarged media"
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </article>
  );
}
