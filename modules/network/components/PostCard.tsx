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

  // Text truncation logic (Instagram / LinkedIn style: first 180 chars, then "...see more")
  const isLongContent = (post.content?.length ?? 0) > 220;
  const displayContent =
    isLongContent && !isExpandedText
      ? `${post.content.slice(0, 200)}...`
      : post.content;

  // Video Play / Pause / Replay toggle
  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (hasEnded) {
      handleReplayVideo();
      return;
    }
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    setHasEnded(true);
  };

  const handleReplayVideo = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().catch(() => {});
    setIsPlaying(true);
    setHasEnded(false);
  };

  // Autoplay video when card scrolls into view (Muted, Instagram style)
  React.useEffect(() => {
    const el = videoRef.current;
    if (!el || !isVideoPost) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            el.play().then(() => setIsPlaying(true)).catch(() => {});
          } else {
            el.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: [0, 0.6, 1.0] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isVideoPost]);

  const handleReact = async (nextLiked: boolean) => {
    if (likeLoading) return;
    setLikeLoading(true);
    setReacted(nextLiked);
    setReactionCount((c) => (nextLiked ? c + 1 : Math.max(0, c - 1)));

    try {
      const res = await fetch(`/api/network/posts/${post.id}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ type: "like" }),
      });
      if (res.ok) {
        const data = await res.json();
        setReacted(data.user_reacted);
        setReactionCount(data.reaction_count);
      }
    } catch (err) {
      console.error("React failed:", err);
    } finally {
      setLikeLoading(false);
    }
  };

  const loadComments = async () => {
    if (!showComments && !commentsLoaded) {
      try {
        const res = await fetch(`/api/network/posts/${post.id}/comments`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setComments(data.comments ?? []);
          setCommentsLoaded(true);
        }
      } catch (err) {
        console.error(err);
      }
    }
    setShowComments((prev) => !prev);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || commentLoading) return;
    setCommentLoading(true);

    try {
      const res = await fetch(`/api/network/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: commentText.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        const newC: PostComment = data.comment ?? {
          id: `tmp-${Date.now()}`,
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
      className="rounded-none sm:rounded-3xl border-y sm:border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-3.5 sm:p-5 shadow-none sm:shadow-2xs transition hover:border-[#cbc6bf] dark:hover:border-[#484f58] relative overflow-hidden"
    >
      {/* 1. Header: Author info, Timestamp */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Avatar */}
          <button
            type="button"
            onClick={() => router.push(`/profile/${author?.user_id ?? post.author_id}`)}
            className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] dark:focus-visible:ring-[#388bfd] rounded-full cursor-pointer"
          >
            <div
              className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full text-xs sm:text-sm font-bold text-[#3f3f3c] overflow-hidden border border-[#ded8d1] dark:border-[#30363d] shadow-2xs"
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
                className="text-xs sm:text-sm md:text-base font-bold text-[#171717] dark:text-[#f0f6fc] hover:text-[#0f4c81] dark:hover:text-[#388bfd] transition truncate text-left cursor-pointer"
              >
                {author?.name ?? "Healthcare Professional"}
              </button>
              {isVerified && <VerificationBadge size="sm" />}
            </div>

            <p className="text-[11px] sm:text-xs text-[#77716b] dark:text-[#8b949e] truncate font-medium mt-0.5">
              {author?.profession || "Healthcare Professional"}
              {author?.specialization ? ` · ${author.specialization}` : ""}
              {author?.organization ? ` · ${author.organization}` : ""}
            </p>

            <time
              dateTime={new Date(post.created_at).toISOString()}
              title={formatExactDateTime(post.created_at)}
              className="text-[10px] sm:text-[11px] text-[#8a8784] dark:text-[#8b949e] font-medium block mt-0.5 hover:text-[#171717] dark:hover:text-[#f0f6fc] transition cursor-default"
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
            className="p-1.5 rounded-lg text-[#a09890] dark:text-[#8b949e] hover:bg-[#f8f7f6] dark:hover:bg-[#21262d] hover:text-rose-600 transition cursor-pointer"
          >
            {reported ? (
              <span className="text-[10px] sm:text-xs font-bold text-rose-600 dark:text-rose-400">Reported</span>
            ) : (
              <span className="text-xs sm:text-sm">🚩</span>
            )}
          </button>
        </div>
      </div>

      {/* 2. Text Content (Above Media, LinkedIn/Instagram Style) */}
      {post.content && post.content.trim() && (
        <div className="mt-3">
          <p className="whitespace-pre-line text-xs sm:text-sm md:text-[15px] leading-relaxed text-[#171717] dark:text-[#f0f6fc]">
            {displayContent}
          </p>
          {isLongContent && (
            <button
              type="button"
              onClick={() => setIsExpandedText((prev) => !prev)}
              className="mt-1 text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:underline cursor-pointer"
            >
              {isExpandedText ? "Show less" : "See more"}
            </button>
          )}
        </div>
      )}

      {/* 3. Rich Media Container (Instagram / LinkedIn Feed Experience) */}
      {mediaUrls.length > 0 && (
        <div className="mt-3 rounded-xl sm:rounded-2xl overflow-hidden border border-[#ded8d1] dark:border-[#30363d] bg-[#0c0d0e] shadow-2xs">
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
            <div className="p-4 sm:p-5 flex items-center justify-between gap-4 bg-[#f8f7f6] dark:bg-[#1c2128]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 shadow-2xs">
                  <FileText className="h-6 w-6 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-[#171717] dark:text-[#f0f6fc] truncate">
                    Clinical Document Attachment
                  </p>
                  <p className="text-[11px] text-[#77716b] dark:text-[#8b949e] truncate">
                    PDF / Healthcare Document
                  </p>
                </div>
              </div>
              <a
                href={mediaUrls[0]}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] dark:bg-[#388bfd] px-3.5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#0c3c66] dark:hover:bg-[#58a6ff] transition"
              >
                <span>View</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          ) : isImagePost ? (
            /* C. Photo/Image Gallery */
            mediaUrls.length === 1 ? (
              <div
                onClick={() => setSelectedImage(mediaUrls[0])}
                className="relative max-h-[520px] w-full cursor-pointer overflow-hidden bg-black flex items-center justify-center group"
              >
                <img
                  src={mediaUrls[0]}
                  alt="Post attachment"
                  className="max-h-[520px] w-full object-contain group-hover:scale-101 transition duration-200"
                />
                <div className="absolute top-3 right-3 rounded-full bg-black/60 p-1.5 text-white opacity-0 group-hover:opacity-100 transition shadow">
                  <Maximize2 className="h-4 w-4" />
                </div>
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
      <div className="mt-4 flex items-center justify-between border-t border-[#ded8d1] dark:border-[#30363d] pt-3 text-xs sm:text-sm">
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
            className={`flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-1.5 font-bold transition active:scale-95 text-xs sm:text-sm cursor-pointer ${
              showComments
                ? "bg-[#eef5fc] dark:bg-[#1f2d42] text-[#0f4c81] dark:text-[#58a6ff]"
                : "text-[#5d5854] dark:text-[#8b949e] hover:bg-[#f5f4f2] dark:hover:bg-[#21262d] hover:text-[#171717] dark:hover:text-[#f0f6fc]"
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
            className="flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-1.5 font-bold text-[#5d5854] dark:text-[#8b949e] hover:bg-[#f5f4f2] dark:hover:bg-[#21262d] hover:text-[#171717] dark:hover:text-[#f0f6fc] transition active:scale-95 text-xs sm:text-sm cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="h-4 w-4 text-[#16804d] dark:text-[#2ea043]" />
                <span className="text-[#16804d] dark:text-[#2ea043]">Copied!</span>
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
          className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 font-bold transition active:scale-95 text-xs sm:text-sm cursor-pointer ${
            saved
              ? "text-[#0f4c81] dark:text-[#58a6ff] bg-[#eef5fc] dark:bg-[#1f2d42]"
              : "text-[#5d5854] dark:text-[#8b949e] hover:bg-[#f5f4f2] dark:hover:bg-[#21262d] hover:text-[#171717] dark:hover:text-[#f0f6fc]"
          }`}
        >
          {saved ? (
            <BookmarkCheck className="h-4 w-4 fill-[#0f4c81] dark:fill-[#58a6ff]" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span>
        </button>
      </div>

      {/* 5. Expandable Comments Section */}
      {showComments && (
        <div className="mt-3.5 space-y-3 border-t border-[#ded8d1] dark:border-[#30363d] pt-3.5 animate-in fade-in duration-200">
          {/* Add Comment Input */}
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a clinical comment or insight..."
              className="h-9 flex-1 rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] px-3 text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] placeholder:text-[#8a8784] dark:placeholder:text-[#8b949e] focus:border-[#0f4c81] dark:focus:border-[#388bfd] focus:outline-none focus:ring-1 focus:ring-[#0f4c81] dark:focus:ring-[#388bfd]"
            />
            <button
              type="submit"
              disabled={commentLoading || !commentText.trim()}
              className="rounded-xl bg-[#0f4c81] dark:bg-[#388bfd] px-4 py-1.5 text-xs sm:text-sm font-bold text-white transition hover:bg-[#0c3c66] dark:hover:bg-[#58a6ff] disabled:opacity-50 shadow-2xs cursor-pointer"
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
                  className="rounded-2xl bg-[#faf9f8] dark:bg-[#1c2128] p-3 text-xs sm:text-[13px] border border-[#ded8d1] dark:border-[#30363d]"
                >
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => router.push(`/profile/${c.author?.user_id || c.author_id}`)}
                      className="font-bold text-[#171717] dark:text-[#f0f6fc] hover:text-[#0f4c81] dark:hover:text-[#388bfd] hover:underline text-left cursor-pointer"
                    >
                      {c.author?.name || "Healthcare Professional"}
                    </button>
                    <time
                      dateTime={new Date(c.created_at).toISOString()}
                      title={formatExactDateTime(c.created_at)}
                      className="text-[10px] text-[#8a8784] dark:text-[#8b949e] font-medium"
                    >
                      {formatContentTimestamp(c.created_at)}
                    </time>
                  </div>
                  <p className="mt-1 text-[#44403c] dark:text-[#c9d1d9] leading-relaxed">{c.content}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-xs text-[#8a8784] dark:text-[#8b949e] py-2">
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
              className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black transition cursor-pointer"
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
