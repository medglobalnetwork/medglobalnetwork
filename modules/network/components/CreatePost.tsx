"use client";

import * as React from "react";
import {
  BarChart2,
  Camera,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Video,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import type { PostType } from "../types";
import { useMediaUpload } from "@/lib/use-media-upload";

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
  const [mediaUrls, setMediaUrls] = React.useState<string[]>([]);
  const [mediaPreviews, setMediaPreviews] = React.useState<{ url: string; type: string; name: string }[]>([]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [fileAccept, setFileAccept] = React.useState("image/*");

  const { uploadFile, isUploading, progress } = useMediaUpload({
    folder: "posts",
    onSuccess: (result) => {
      setMediaUrls((prev) => [...prev, result.publicUrl]);
    },
    onError: (err) => {
      setError(err);
    },
  });

  const initials = (userName || "U")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleTriggerFileInput = (type: "image" | "video" | "document") => {
    setExpanded(true);
    setPostType(type);
    if (type === "image") setFileAccept("image/jpeg,image/png,image/webp,image/gif");
    else if (type === "video") setFileAccept("video/mp4,video/webm,video/quicktime");
    else if (type === "document") setFileAccept("application/pdf");

    setTimeout(() => {
      fileInputRef.current?.click();
    }, 50);
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const localPreview = URL.createObjectURL(file);
    const newPreviewItem = {
      url: localPreview,
      type: file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "document",
      name: file.name,
    };
    setMediaPreviews((prev) => [...prev, newPreviewItem]);

    const result = await uploadFile(file);
    if (result && result.publicUrl) {
      // Replace or ensure canonical URL is stored
      setMediaUrls((prev) => Array.from(new Set([...prev, result.publicUrl])));
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
    setMediaUrls((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePost = async () => {
    if (!content.trim() && mediaUrls.length === 0 && mediaPreviews.length === 0) return;
    setPosting(true);
    setError(null);
    try {
      const finalMediaUrls = mediaUrls.length > 0 ? mediaUrls : mediaPreviews.map((p) => p.url);
      const res = await fetch("/api/network/posts", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          postType: finalMediaUrls.length > 0 ? postType : "text",
          mediaUrls: finalMediaUrls,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to post");
      }
      setContent("");
      setPostType("text");
      setMediaUrls([]);
      setMediaPreviews([]);
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
      <input
        ref={fileInputRef}
        type="file"
        accept={fileAccept}
        className="hidden"
        onChange={handleFileSelected}
      />

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

              {/* Uploading progress bar */}
              {isUploading && (
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-2.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#1769c2] mb-1">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Uploading media...
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-blue-100 overflow-hidden">
                    <div
                      className="h-full bg-[#1769c2] transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Media Previews Thumbnail Grid */}
              {mediaPreviews.length > 0 && (
                <div className="flex flex-wrap gap-2.5 pt-1">
                  {mediaPreviews.map((media, idx) => (
                    <div
                      key={idx}
                      className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl overflow-hidden border border-[#ded8d1] bg-slate-100 group shadow-xs"
                    >
                      {media.type === "image" ? (
                        <img src={media.url} alt="Attachment" className="h-full w-full object-cover" />
                      ) : media.type === "video" ? (
                        <video src={media.url} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full p-2 text-center bg-blue-50">
                          <FileText className="h-6 w-6 text-[#1769c2]" />
                          <span className="text-[9px] font-bold text-[#171717] truncate max-w-[70px] mt-1">
                            {media.name}
                          </span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(idx)}
                        className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white shadow hover:bg-rose-600 transition"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

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
            onClick={() => handleTriggerFileInput("image")}
            className={`inline-flex items-center gap-1.5 font-medium transition hover:text-[#1769c2] ${
              postType === "image" && expanded ? "text-[#1769c2] font-bold" : ""
            }`}
          >
            <ImageIcon className="h-4 w-4 text-[#0369a1]" /> Photo
          </button>

          <button
            type="button"
            onClick={() => handleTriggerFileInput("video")}
            className={`inline-flex items-center gap-1.5 font-medium transition hover:text-[#1769c2] ${
              postType === "video" && expanded ? "text-[#1769c2] font-bold" : ""
            }`}
          >
            <Video className="h-4 w-4 text-[#7c3aed]" /> Video
          </button>

          <button
            type="button"
            onClick={() => handleTriggerFileInput("document")}
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
                setMediaUrls([]);
                setMediaPreviews([]);
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
            disabled={posting || isUploading || (expanded && !content.trim() && mediaPreviews.length === 0)}
            className="rounded-xl bg-[#1769c2] px-6 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#12569f] disabled:opacity-50"
          >
            {posting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
