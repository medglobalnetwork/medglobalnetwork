"use client";

import * as React from "react";
import { CreateStoryInput, StoryMediaType, StoryVisibility } from "../types";

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryCreated: () => void;
  currentUserAvatar?: string | null;
  currentUserName?: string;
}

const BG_GRADIENTS = [
  { id: "blue", label: "Medical Blue", value: "from-[#0f4c81] to-[#1e3a8a]", hex: "#0f4c81" },
  { id: "teal", label: "Teal Health", value: "from-[#0f766e] to-[#115e59]", hex: "#0f766e" },
  { id: "emerald", label: "Emerald Clinical", value: "from-[#047857] to-[#064e3b]", hex: "#047857" },
  { id: "violet", label: "Royal Violet", value: "from-[#6d28d9] to-[#4c1d95]", hex: "#6d28d9" },
  { id: "coral", label: "Sunset Coral", value: "from-[#e11d48] to-[#9f1239]", hex: "#e11d48" },
  { id: "slate", label: "Dark Slate", value: "from-[#1e293b] to-[#0f172a]", hex: "#1e293b" },
];

const FONT_STYLES = [
  { id: "sans", label: "Modern Bold", className: "font-sans font-bold" },
  { id: "serif", label: "Editorial Serif", className: "font-serif font-semibold italic" },
  { id: "mono", label: "Clinical Mono", className: "font-mono font-medium" },
];

export function CreateStoryModal({
  isOpen,
  onClose,
  onStoryCreated,
  currentUserAvatar,
  currentUserName = "You",
}: CreateStoryModalProps) {
  const [activeTab, setActiveTab] = React.useState<StoryMediaType>("text");
  const [caption, setCaption] = React.useState("");
  const [mediaUrl, setMediaUrl] = React.useState("");
  const [selectedBg, setSelectedBg] = React.useState(BG_GRADIENTS[0]);
  const [selectedFont, setSelectedFont] = React.useState(FONT_STYLES[0]);
  const [visibility, setVisibility] = React.useState<StoryVisibility>("public");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (activeTab === "text" && !caption.trim()) {
      setErrorMsg("Please enter text for your story");
      return;
    }

    if ((activeTab === "image" || activeTab === "video") && !mediaUrl.trim()) {
      setErrorMsg("Please enter a valid media image/video URL");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateStoryInput = {
        mediaType: activeTab,
        caption: caption.trim() || null,
        mediaUrl: mediaUrl.trim() || null,
        backgroundColor: selectedBg.hex,
        fontStyle: selectedFont.id,
        visibility,
      };

      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create story");
      }

      // Reset and close
      setCaption("");
      setMediaUrl("");
      onStoryCreated();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setCaption(prompt);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-[#ded8d1] bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#f0efee] px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-[#171717]">Create Professional Story</h2>
            <p className="text-xs text-[#77716b]">
              Disappears in 24 hours · Visible to {visibility === "public" ? "all healthcare peers" : "connections only"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#77716b] hover:bg-[#f5f4f3] hover:text-[#171717]"
          >
            ✕
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#f0efee] bg-[#faf9f8] px-6">
          <button
            type="button"
            onClick={() => setActiveTab("text")}
            className={`border-b-2 py-2.5 px-4 text-xs font-semibold transition ${
              activeTab === "text"
                ? "border-[#1769c2] text-[#1769c2]"
                : "border-transparent text-[#77716b] hover:text-[#171717]"
            }`}
          >
            ✍️ Text Story
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("image")}
            className={`border-b-2 py-2.5 px-4 text-xs font-semibold transition ${
              activeTab === "image"
                ? "border-[#1769c2] text-[#1769c2]"
                : "border-transparent text-[#77716b] hover:text-[#171717]"
            }`}
          >
            🖼️ Photo / Image
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("video")}
            className={`border-b-2 py-2.5 px-4 text-xs font-semibold transition ${
              activeTab === "video"
                ? "border-[#1769c2] text-[#1769c2]"
                : "border-transparent text-[#77716b] hover:text-[#171717]"
            }`}
          >
            📹 Video URL
          </button>
        </div>

        {/* Content Area & Live Preview */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
              {errorMsg}
            </div>
          )}

          {/* Live Preview Card (Aspect Ratio 9:16 scaled down) */}
          <div className="relative mx-auto flex h-60 w-36 flex-col justify-between overflow-hidden rounded-2xl p-3 shadow-inner border border-black/10">
            {activeTab === "text" ? (
              <div
                className={`absolute inset-0 flex items-center justify-center p-3 text-center text-white bg-gradient-to-br ${selectedBg.value}`}
              >
                <p className={`text-xs leading-snug ${selectedFont.className} line-clamp-6`}>
                  {caption || "Your story preview will appear here..."}
                </p>
              </div>
            ) : mediaUrl ? (
              <div className="absolute inset-0 bg-black">
                {activeTab === "image" ? (
                  <img src={mediaUrl} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-white text-xs">
                    Video Ready
                  </div>
                )}
                {caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-[10px] text-white line-clamp-2">
                    {caption}
                  </div>
                )}
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-[#f0efee] p-2 text-center text-[10px] text-[#77716b]">
                Enter media URL below to preview
              </div>
            )}

            {/* Header Overlay Preview */}
            <div className="relative z-10 flex items-center gap-1">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[9px] font-bold text-white">
                {currentUserName.slice(0, 1)}
              </span>
              <span className="truncate text-[9px] font-medium text-white/90">
                {currentUserName}
              </span>
            </div>
          </div>

          {/* Input Controls */}
          {activeTab === "text" ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1">
                  Story Content
                </label>
                <textarea
                  rows={3}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={300}
                  placeholder="Share a clinical insight, quote, or daily medical update..."
                  className="w-full rounded-xl border border-[#ded8d1] p-3 text-xs text-[#171717] focus:border-[#1769c2] focus:outline-none focus:ring-2 focus:ring-[#1769c2]/20"
                />
                <div className="flex justify-between text-[10px] text-[#77716b]">
                  <span>Supports markdown & medical emojis</span>
                  <span>{caption.length} / 300</span>
                </div>
              </div>

              {/* Quick Prompts */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  "🩺 Clinical Case Note: ",
                  "🔬 Research Discovery: ",
                  "📍 Attending Conference: ",
                  "💡 Practice Tip: ",
                ].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePromptClick(p)}
                    className="rounded-full border border-[#ded8d1] bg-[#f8f7f6] px-2.5 py-1 text-[11px] text-[#5d5854] hover:bg-[#eef5fc] hover:text-[#1769c2]"
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Background Color Picker */}
              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                  Background Theme
                </label>
                <div className="flex gap-2">
                  {BG_GRADIENTS.map((bg) => (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => setSelectedBg(bg)}
                      className={`h-7 w-7 rounded-full bg-gradient-to-br ${bg.value} transition ${
                        selectedBg.id === bg.id
                          ? "ring-2 ring-[#1769c2] ring-offset-2 scale-110"
                          : "opacity-80 hover:opacity-100"
                      }`}
                      title={bg.label}
                    />
                  ))}
                </div>
              </div>

              {/* Typography Style */}
              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                  Typography Style
                </label>
                <div className="flex gap-2">
                  {FONT_STYLES.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSelectedFont(f)}
                      className={`rounded-lg border px-3 py-1 text-xs transition ${
                        selectedFont.id === f.id
                          ? "border-[#1769c2] bg-[#eef5fc] text-[#1769c2] font-semibold"
                          : "border-[#ded8d1] bg-white text-[#77716b] hover:bg-[#f8f7f6]"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1">
                  {activeTab === "image" ? "Image URL" : "Video URL"}
                </label>
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder={
                    activeTab === "image"
                      ? "https://images.unsplash.com/... or direct image link"
                      : "https://example.com/video.mp4"
                  }
                  className="h-10 w-full rounded-xl border border-[#ded8d1] px-3 text-xs text-[#171717] focus:border-[#1769c2] focus:outline-none focus:ring-2 focus:ring-[#1769c2]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1">
                  Caption (Optional)
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={150}
                  placeholder="Add a brief caption or medical context..."
                  className="h-10 w-full rounded-xl border border-[#ded8d1] px-3 text-xs text-[#171717] focus:border-[#1769c2] focus:outline-none focus:ring-2 focus:ring-[#1769c2]/20"
                />
              </div>
            </div>
          )}

          {/* Visibility Controls */}
          <div className="flex items-center justify-between border-t border-[#f0efee] pt-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[#77716b]">Audience:</span>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as StoryVisibility)}
                className="rounded-lg border border-[#ded8d1] bg-white px-2.5 py-1 text-xs text-[#171717] focus:outline-none"
              >
                <option value="public">🌐 Public (All Healthcare Peers)</option>
                <option value="connections">👥 Connections Only</option>
              </select>
            </div>

            <span className="inline-flex items-center gap-1 text-[11px] text-[#77716b]">
              ⏳ 24h Expiry
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#ded8d1] px-4 py-2 text-xs font-semibold text-[#5d5854] hover:bg-[#f8f7f6]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center rounded-xl bg-[#1769c2] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#12569f] disabled:opacity-50"
            >
              {isSubmitting ? "Sharing..." : "Share to Story 🚀"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
