"use client";
// modules/network/components/PostCard.tsx
import * as React from "react";
import { useRouter } from "next/navigation";
import type { NetworkPost } from "../types";
import { VerificationBadge } from "./VerificationBadge";
import { getProfessionColor, formatRelativeTime } from "../lib/network-data";

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

  const author = post.author;
  const isVerified = author?.identity_verified || author?.education_verified || author?.registration_verified;
  const avatarColor = getProfessionColor(author?.profession);
  const initials = (author?.name || "U")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const badge = POST_TYPE_BADGE[post.post_type] ?? POST_TYPE_BADGE.text;

  const handleReact = async () => {
    setLikeLoading(true);
    try {
      if (reacted) {
        await fetch(`/api/network/posts/${post.id}/reactions`, {
          method: "DELETE",
          credentials: "include",
        });
        setReacted(false);
        setReactionCount((c) => Math.max(0, c - 1));
      } else {
        await fetch(`/api/network/posts/${post.id}/reactions`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reactionType: "like" }),
        });
        setReacted(true);
        setReactionCount((c) => c + 1);
      }
    } catch (err) {
      console.error("Reaction failed:", err);
    } finally {
      setLikeLoading(false);
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
            {formatRelativeTime(post.created_at)}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mt-3.5">
        <p className="whitespace-pre-line text-sm leading-relaxed text-[#171717]">
          {post.content}
        </p>
      </div>

      {/* Action bar */}
      <div className="mt-4 flex items-center gap-0.5 border-t border-[#f5f4f3] pt-3">
        {/* Like */}
        <button
          type="button"
          onClick={handleReact}
          disabled={likeLoading}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
            reacted
              ? "text-[#1769c2] bg-[#eef5fc]"
              : "text-[#77716b] hover:bg-[#f8f7f6] hover:text-[#1769c2]"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill={reacted ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
            <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
          </svg>
          {reactionCount > 0 ? reactionCount.toLocaleString() : "Like"}
        </button>

        {/* Comment */}
        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
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
          {post.comment_count > 0 ? post.comment_count : "Comment"}
        </button>

        {/* Share */}
        <button
          type="button"
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
    </article>
  );
}
