"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { NetworkPost, PostComment } from "../types";
import { VerificationBadge } from "./VerificationBadge";
import { getProfessionColor, formatRelativeTime } from "../lib/network-data";
import PulseHeart from "@/components/ui/PulseHeart";

const POST_TYPE_BADGE: Record<string, { label: string; color: string }> = {
  text:        { label: "Post",        color: "#77716b" },
  image:       { label: "Photo",       color: "#0369a1" },
  video:       { label: "Video",       color: "#7c3aed" },
  document:    { label: "Document",   color: "#0369a1" },
  poll:        { label: "Poll",        color: "#6d28d9" },
  research:    { label: "Research",    color: "#0e7490" },
  achievement: { label: "Achievement", color: "#b45309" },
  question:    { label: "Question",    color: "#15803d" },
  job:         { label: "Job",         color: "#1769c2" },
  event:       { label: "Event",       color: "#be185d" },
};

interface PostCardProps {
  post: NetworkPost;
  currentUserId?: string;
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const router = useRouter();
  const [reacted, setReacted] = React.useState(post.user_reacted ?? false);
  const [reactionCount, setReactionCount] = React.useState(post.reaction_count);
  const [likeLoading, setLikeLoading] = React.useState(false);
  const [showComments, setShowComments] = React.useState(false);
  const [saved, setSaved] = React.useState(post.user_saved ?? false);
  const [comments, setComments] = React.useState<PostComment[]>([]);
  const [commentText, setCommentText] = React.useState("");
  const [commentLoading, setCommentLoading] = React.useState(false);
  const [commentsLoaded, setCommentsLoaded] = React.useState(false);
  const [reported, setReported] = React.useState(false);

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleReact = async (..._args: unknown[]) => {
    const wasReacted = reacted;
    const previousCount = reactionCount;

    // Instant optimistic toggle
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
      // Revert on error
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

  const handleReport = () => {
    if (confirm("Report this post for healthcare community guidelines review?")) {
      setReported(true);
      alert("Post reported to MGN moderation team.");
    }
  };

  return (
    <article className="rounded-2xl border border-[#e8e6e3] bg-white p-4 shadow-xs sm:p-5">
      {/* Author header */}
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => router.push(`/profile/${author?.user_id ?? ""}`)}
          className="shrink-0"
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-[#3f3f3c]"
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

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => router.push(`/profile/${author?.user_id ?? ""}`)}
              className="text-sm font-semibold text-[#171717] hover:text-[#1769c2] hover:underline"
            >
              {author?.name ?? "Healthcare Professional"}
            </button>
            {isVerified && <VerificationBadge size="sm" />}
            {post.post_type !== "text" && (
              <span
                className="rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  borderColor: badge.color + "40",
                  background: badge.color + "15",
                  color: badge.color,
                }}
              >
                {badge.label}
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#77716b]">
            {author?.profession}
            {author?.specialization ? ` · ${author.specialization}` : ""}
            {author?.organization ? ` · ${author.organization}` : ""}
          </p>
          <p className="text-[11px] text-[#a09890]">
            {formatRelativeTime(post.created_at)} ago
          </p>
        </div>

        {/* Report post */}
        <button
          type="button"
          onClick={handleReport}
          title="Report post"
          disabled={reported}
          className="text-xs text-[#a09890] hover:text-red-600 transition"
        >
          {reported ? "Reported" : "🚩"}
        </button>
      </div>

      {/* Content */}
      <div className="mt-3.5">
        <p className="whitespace-pre-line text-sm leading-relaxed text-[#171717]">
          {post.content}
        </p>
      </div>

      {/* Action bar */}
      <div className="mt-4 flex items-center gap-0.5 border-t border-[#f5f4f3] pt-3">
        {/* Like — PulseHeart */}
        <PulseHeart
          liked={reacted}
          count={reactionCount}
          onChange={handleReact}
          showCount={reactionCount > 0}
          icon="heart"
          idleOutline
          size={20}
          corner={20}
          likedColor="#e11d48"
          idleColor="#77716b"
          pillColor="#f5f4f3"
          textColor="#171717"
          duration={520}
          dotSize={0.25}
          overshoot={1.6}
          beat={2.5}
          rollDuration={320}
          label="Like"
          className="!rounded-lg"
        />

        {/* Comment */}
        <button
          type="button"
          onClick={loadComments}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#77716b] transition hover:bg-[#f8f7f6] hover:text-[#171717]"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {post.comment_count + comments.length > 0
            ? post.comment_count + comments.length
            : "Comment"}
        </button>

        {/* Share */}
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") {
              navigator.clipboard.writeText(window.location.href);
              alert("Post link copied to clipboard!");
            }
          }}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#77716b] transition hover:bg-[#f8f7f6] hover:text-[#171717]"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          {post.share_count > 0 ? post.share_count : "Share"}
        </button>

        {/* Save */}
        <button
          type="button"
          onClick={() => setSaved(!saved)}
          className={`ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            saved
              ? "text-[#1769c2]"
              : "text-[#77716b] hover:bg-[#f8f7f6] hover:text-[#171717]"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill={saved ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          Save
        </button>
      </div>

      {/* Comment Section (Expandable) */}
      {showComments && (
        <div className="mt-4 border-t border-[#f5f4f3] pt-3 space-y-3">
          {/* Add comment form */}
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a clinical thought or comment..."
              className="h-9 flex-1 rounded-xl border border-[#ded8d1] px-3 text-xs text-[#171717] focus:border-[#1769c2] focus:outline-none"
            />
            <button
              type="submit"
              disabled={commentLoading || !commentText.trim()}
              className="rounded-xl bg-[#1769c2] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#12569f] disabled:opacity-50"
            >
              {commentLoading ? "…" : "Post"}
            </button>
          </form>

          {/* Comments List */}
          {comments.length > 0 && (
            <ul className="space-y-2.5 pt-2">
              {comments.map((c) => (
                <li key={c.id} className="rounded-xl bg-[#f8f7f6] p-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#171717]">
                      {c.author?.name || "Healthcare Professional"}
                    </span>
                    <span className="text-[10px] text-[#a09890]">
                      {formatRelativeTime(c.created_at)} ago
                    </span>
                  </div>
                  <p className="mt-1 text-[#5d5854]">{c.content}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </article>
  );
}
