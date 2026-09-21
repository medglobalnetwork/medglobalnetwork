"use client";

import * as React from "react";
import {
  BarChart2,
  Camera,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Video,
} from "lucide-react";
import type { PostType } from "../types";

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
    <div className="rounded-3xl border border-[#e8e6e3] bg-white p-5 shadow-2xs">
      <div className="flex items-start gap-3">
        {/* User Avatar */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eef5fc] text-sm font-bold text-[#1769c2]">
          {userImage ? (
            <img
              src={userImage}
              alt={userName ?? "You"}
              className="h-full w-full object-cover"
            />
          ) : (
            initials
          )}
        </div>

        {/* Input area */}
        <div className="flex-1">
          {!expanded ? (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="w-full rounded-2xl border border-[#e8e6e3] bg-[#f8f7f6] px-4 py-3 text-left text-xs font-medium text-[#77716b] transition hover:border-[#1769c2]/40 hover:bg-white"
            >
              What&apos;s happening in healthcare?
            </button>
          ) : (
            <div className="space-y-3">
              <textarea
                autoFocus
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share a clinical case, discussion, research finding, or update with your healthcare network..."
                rows={3}
                className="w-full resize-none rounded-2xl border border-[#ded8d1] p-3 text-xs text-[#171717] placeholder:text-[#8a8784] focus:border-[#1769c2] focus:outline-none focus:ring-2 focus:ring-[#1769c2]/20"
              />

              {error && <p className="text-xs text-red-600">{error}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Action triggers bottom bar */}
      <div className="mt-4 flex items-center justify-between border-t border-[#f5f4f3] pt-3 text-xs">
        <div className="flex flex-wrap items-center gap-4 text-[#5d5854]">
          <button
            type="button"
            onClick={() => {
              setPostType("image");
              setExpanded(true);
            }}
            className={`inline-flex items-center gap-1.5 font-medium transition hover:text-[#1769c2] ${
              postType === "image" && expanded ? "text-[#1769c2] font-bold" : ""
            }`}
          >
            <ImageIcon className="h-4 w-4 text-[#0369a1]" /> Photo
          </button>

          <button
            type="button"
            onClick={() => {
              setPostType("video");
              setExpanded(true);
            }}
            className={`inline-flex items-center gap-1.5 font-medium transition hover:text-[#1769c2] ${
              postType === "video" && expanded ? "text-[#1769c2] font-bold" : ""
            }`}
          >
            <Video className="h-4 w-4 text-[#7c3aed]" /> Video
          </button>

          <button
            type="button"
            onClick={() => {
              setPostType("document");
              setExpanded(true);
            }}
            className={`inline-flex items-center gap-1.5 font-medium transition hover:text-[#1769c2] ${
              postType === "document" && expanded ? "text-[#1769c2] font-bold" : ""
            }`}
          >
            <FileText className="h-4 w-4 text-[#0e7490]" /> Document
          </button>

          <button
            type="button"
            onClick={() => {
              setPostType("poll");
              setExpanded(true);
            }}
            className={`inline-flex items-center gap-1.5 font-medium transition hover:text-[#1769c2] ${
              postType === "poll" && expanded ? "text-[#1769c2] font-bold" : ""
            }`}
          >
            <BarChart2 className="h-4 w-4 text-[#6d28d9]" /> Poll
          </button>
        </div>

        <div className="flex items-center gap-2">
          {expanded && (
            <button
              type="button"
              onClick={() => {
                setExpanded(false);
                setContent("");
                setError(null);
              }}
              className="rounded-xl border border-[#ded8d1] px-3.5 py-1.5 text-xs font-semibold text-[#5d5854] hover:bg-[#faf9f8]"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (!expanded) setExpanded(true);
              else handlePost();
            }}
            disabled={posting || (expanded && !content.trim())}
            className="rounded-xl bg-[#1769c2] px-6 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#12569f] disabled:opacity-50"
          >
            {posting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
