"use client";
// modules/network/components/CreatePost.tsx
import * as React from "react";
import type { PostType } from "../types";
import { POST_TYPES } from "../types";

interface CreatePostProps {
  userImage?: string;
  userName?: string;
  onPosted?: () => void;
}

export function CreatePost({ userImage, userName, onPosted }: CreatePostProps) {
  const [expanded, setExpanded] = React.useState(false);
  const [content, setContent] = React.useState("");
  const [postType, setPostType] = React.useState<PostType>("text");
  const [posting, setPosting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const initials = (userName || "U")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handlePost = async () => {
    if (!content.trim()) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch("/api/network/posts", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim(), postType }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to post");
      }
      setContent("");
      setPostType("text");
      setExpanded(false);
      onPosted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#e8e6e3] bg-white p-4 shadow-xs">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef5fc] text-sm font-bold text-[#1769c2]">
          {userImage ? (
            <img
              src={userImage}
              alt={userName ?? "You"}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>

        {/* Compose trigger */}
        {!expanded ? (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="flex-1 rounded-xl border border-[#ded8d1] bg-[#f8f7f6] px-4 py-2.5 text-left text-sm text-[#8a8784] transition hover:bg-[#f0efee]"
          >
            Share a clinical insight, case, or achievement…
          </button>
        ) : (
          <div className="flex-1">
            <textarea
              autoFocus
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share a clinical insight, research update, case study, or achievement with your healthcare network…"
              rows={4}
              className="block w-full resize-none rounded-xl border border-[#ded8d1] px-3.5 py-3 text-sm text-[#171717] placeholder:text-[#8a8784] focus:border-[#1769c2] focus:outline-none focus:ring-2 focus:ring-[#1769c2]/20"
            />
          </div>
        )}
      </div>

      {/* Expanded controls */}
      {expanded && (
        <div className="mt-3">
          {/* Post type selector */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            {POST_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setPostType(type.value)}
                className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                  postType === type.value
                    ? "border-[#1769c2] bg-[#eef5fc] text-[#1769c2]"
                    : "border-[#ded8d1] text-[#5d5854] hover:border-[#1769c2] hover:text-[#1769c2]"
                }`}
              >
                <span>{type.emoji}</span>
                {type.label}
              </button>
            ))}
          </div>

          {error && <p className="mb-2 text-xs text-red-600">{error}</p>}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setExpanded(false);
                setContent("");
                setError(null);
              }}
              className="rounded-xl border border-[#ded8d1] px-4 py-2 text-xs font-medium text-[#5d5854] transition hover:bg-[#f8f7f6]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePost}
              disabled={posting || !content.trim()}
              className="rounded-xl bg-[#1769c2] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#12569f] disabled:opacity-50"
            >
              {posting ? "Posting…" : "Post"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
