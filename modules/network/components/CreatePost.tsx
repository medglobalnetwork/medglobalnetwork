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
import CallChip from "@/components/ui/CallChip";
import ProgressBar from "@/components/ProgressBar";

interface CreatePostProps {
  userImage?: string;
  userName?: string;
  onPosted?: () => void;
  borderless?: boolean;
  className?: string;
}

export function CreatePost({
  userImage,
  userName,
  onPosted,
  borderless = false,
  className = "",
}: CreatePostProps) {
  const [expanded, setExpanded] = React.useState(false);
  const [content, setContent] = React.useState("");
  const [postType, setPostType] = React.useState<PostType>("text");
  const [posting, setPosting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [mediaUrls, setMediaUrls] = React.useState<string[]>([]);
  const [mediaPreviews, setMediaPreviews] = React.useState<{ url: string; type: string; name: string }[]>([]);
  const [uploadingFileName, setUploadingFileName] = React.useState<string | null>(null);
  const [callStatus, setCallStatus] = React.useState<"idle" | "running" | "done" | "error">("idle");

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [fileAccept, setFileAccept] = React.useState("image/*");

  const { uploadFile, isUploading, progress } = useMediaUpload({
    folder: "posts",
    onSuccess: (result) => {
      setMediaUrls((prev) => [...prev, result.publicUrl]);
      setCallStatus("done");
    },
    onError: (err) => {
      setError(err);
      setCallStatus("error");
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
    setUploadingFileName(file.name);
    setCallStatus("running");
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
      setCallStatus("done");
    } else {
      setCallStatus("error");
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMediaUrls((prev) => prev.filter((_, i) => i !== index));
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
    if (mediaPreviews.length <= 1) {
      setUploadingFileName(null);
      setCallStatus("idle");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && mediaUrls.length === 0) return;
    if (isUploading) {
      setError("Please wait for your media file to finish uploading.");
      return;
    }

    setPosting(true);
    setError(null);

    try {
      let finalPostType: PostType = postType;
      if (mediaUrls.length > 0 && finalPostType === "text") {
        const first = mediaUrls[0];
        if (first.match(/\.(mp4|webm|mov|m4v)$/i)) finalPostType = "video";
        else if (first.match(/\.(pdf|doc|docx)$/i)) finalPostType = "document";
        else finalPostType = "image";
      }

      const res = await fetch("/api/network/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          content: content.trim(),
          post_type: finalPostType,
          media_urls: mediaUrls,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to create post");
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
    <div
      className={
        borderless
          ? `border-0 bg-transparent p-0 shadow-none ${className}`
          : `rounded-none sm:rounded-3xl border-y sm:border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-3.5 sm:p-5 shadow-none sm:shadow-2xs ${className}`
      }
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={fileAccept}
        className="hidden"
        onChange={handleFileSelected}
      />

      <div className="flex items-start gap-3">
        {/* User Avatar */}
        <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eef5fc] dark:bg-[#1f2d42] text-xs sm:text-sm font-bold text-[#0f4c81] dark:text-[#58a6ff] border border-[#ded8d1] dark:border-[#30363d]">
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
              className={`w-full rounded-2xl border px-4 py-3 text-left text-xs sm:text-sm font-medium transition cursor-pointer ${
                borderless
                  ? "border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#1c2128] text-[#64748b] dark:text-[#8b949e] shadow-2xs hover:border-[#0f4c81]/50 dark:hover:border-[#388bfd]/50 hover:bg-[#faf9f8] dark:hover:bg-[#21262d]"
                  : "border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#1c2128] text-[#77716b] dark:text-[#8b949e] hover:border-[#0f4c81]/40 dark:hover:border-[#388bfd]/40 hover:bg-[#faf9f8] dark:hover:bg-[#21262d]"
              }`}
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
                className="w-full resize-none rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#1c2128] p-3 text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] placeholder:text-[#8a8784] dark:placeholder:text-[#8b949e] focus:border-[#0f4c81] dark:focus:border-[#388bfd] focus:outline-none focus:ring-2 focus:ring-[#0f4c81]/20 dark:focus:ring-[#388bfd]/20"
              />

              {/* Uploading progress bar with ProgressBar & CallChip */}
              {(isUploading || uploadingFileName) && (
                <div className="flex flex-col gap-3 rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-[#f8fafd] dark:bg-[#1c2433] p-3.5 animate-fade-in shadow-2xs">
                  <div className="flex items-center justify-between">
                    <CallChip
                      icon={fileAccept.includes("image") ? "image" : fileAccept.includes("video") ? "file" : "file"}
                      name={isUploading ? "Uploading" : callStatus === "done" ? "Attached" : "Upload Failed"}
                      argument={uploadingFileName || "media"}
                      status={isUploading ? "running" : callStatus}
                      expectedMs={2200}
                      showTimer
                      surfaceColor="#ffffff"
                      color="#171717"
                      progressColor="#0f4c81"
                      doneColor="#16804d"
                      errorColor="#ef4444"
                      onRetry={() => {
                        if (fileInputRef.current) fileInputRef.current.click();
                      }}
                    />
                  </div>
                  {isUploading && (
                    <ProgressBar
                      value={progress}
                      label="Uploading file to secure cloud storage"
                      className="w-full"
                    />
                  )}
                </div>
              )}

              {/* Media Preview Grid */}
              {mediaPreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {mediaPreviews.map((m, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-2xl overflow-hidden border border-[#ded8d1] dark:border-[#30363d] bg-[#f8f7f6] dark:bg-[#21262d] aspect-square flex items-center justify-center group"
                    >
                      {m.type === "image" ? (
                        <img
                          src={m.url}
                          alt={m.name}
                          className="h-full w-full object-cover"
                        />
                      ) : m.type === "video" ? (
                        <video
                          src={m.url}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="p-3 text-center">
                          <FileText className="h-8 w-8 mx-auto text-[#0f4c81] dark:text-[#388bfd] mb-1" />
                          <span className="text-[10px] text-[#5d5854] dark:text-[#8b949e] block truncate max-w-[90px]">
                            {m.name}
                          </span>
                        </div>
                      )}

                      {/* Remove media button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(idx)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-black transition cursor-pointer"
                        title="Remove file"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>
              )}
            </div>
          )}

          {/* Action Row */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#f0efee] dark:border-[#21262d] pt-3">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                type="button"
                onClick={() => handleTriggerFileInput("image")}
                className="flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-[#5d5854] dark:text-[#8b949e] hover:bg-[#f0efee] dark:hover:bg-[#21262d] hover:text-[#0f4c81] dark:hover:text-[#58a6ff] transition cursor-pointer"
              >
                <ImageIcon className="h-4 w-4 text-[#0f4c81] dark:text-[#58a6ff]" />
                <span className="hidden sm:inline">Photo</span>
              </button>

              <button
                type="button"
                onClick={() => handleTriggerFileInput("video")}
                className="flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-[#5d5854] dark:text-[#8b949e] hover:bg-[#f0efee] dark:hover:bg-[#21262d] hover:text-[#7c3aed] dark:hover:text-[#a78bfa] transition cursor-pointer"
              >
                <Video className="h-4 w-4 text-[#7c3aed] dark:text-[#a78bfa]" />
                <span className="hidden sm:inline">Video</span>
              </button>

              <button
                type="button"
                onClick={() => handleTriggerFileInput("document")}
                className="flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-[#5d5854] dark:text-[#8b949e] hover:bg-[#f0efee] dark:hover:bg-[#21262d] hover:text-[#16804d] dark:hover:text-[#34d399] transition cursor-pointer"
              >
                <FileText className="h-4 w-4 text-[#16804d] dark:text-[#34d399]" />
                <span className="hidden sm:inline">Document</span>
              </button>
            </div>

            {expanded && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setExpanded(false);
                    setContent("");
                    setMediaUrls([]);
                    setMediaPreviews([]);
                    setUploadingFileName(null);
                  }}
                  className="rounded-xl px-3 py-1.5 text-xs font-semibold text-[#77716b] dark:text-[#8b949e] hover:bg-[#f0efee] dark:hover:bg-[#21262d] hover:text-[#171717] dark:hover:text-[#f0f6fc] transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={posting || isUploading || (!content.trim() && mediaUrls.length === 0)}
                  className="rounded-xl bg-[#0f4c81] dark:bg-[#388bfd] px-4 py-1.5 text-xs font-bold text-white shadow-2xs transition hover:bg-[#0c3c66] dark:hover:bg-[#58a6ff] disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {posting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Posting...</span>
                    </>
                  ) : (
                    <span>Post</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
