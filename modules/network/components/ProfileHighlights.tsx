"use client";

import * as React from "react";
import { Plus, X, Sparkles, Film, Image as ImageIcon } from "lucide-react";

export interface HighlightItem {
  id: string;
  title: string;
  coverImage: string;
  storiesCount?: number;
}

interface ProfileHighlightsProps {
  isOwnProfile?: boolean;
  userId: string;
}

export function ProfileHighlights({ isOwnProfile, userId }: ProfileHighlightsProps) {
  const [highlights, setHighlights] = React.useState<HighlightItem[]>([]);
  const [activeHighlight, setActiveHighlight] = React.useState<HighlightItem | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState("");
  const [newImage, setNewImage] = React.useState("");

  // Load custom highlights from localStorage if available
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(`mgn_highlights_${userId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setHighlights(parsed);
          }
        }
      } catch {}
    }
  }, [userId]);

  const handleAddHighlight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: HighlightItem = {
      id: `hl-${Date.now()}`,
      title: newTitle.trim(),
      coverImage:
        newImage.trim() ||
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&auto=format&fit=crop&q=80",
      storiesCount: 1,
    };

    const updated = [newItem, ...highlights];
    setHighlights(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(`mgn_highlights_${userId}`, JSON.stringify(updated));
    }
    setNewTitle("");
    setNewImage("");
    setIsCreating(false);
  };

  // If visitor and no highlights, don't show empty highlight container
  if (!isOwnProfile && highlights.length === 0) {
    return null;
  }

  return (
    <div className="relative py-2">
      {/* Scrollable Highlight Row */}
      <div className="flex items-center gap-3 sm:gap-5 overflow-x-auto pb-2 scrollbar-none">
        {/* + New Highlight Capsule (Only shown on own profile) */}
        {isOwnProfile && (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="group flex flex-col items-center gap-1.5 shrink-0 transition-transform active:scale-95"
          >
            <div className="flex h-16 w-16 sm:h-18 sm:w-18 items-center justify-center rounded-full border-2 border-dashed border-[#1769c2]/50 bg-[#eef5fc] text-[#1769c2] transition group-hover:border-[#1769c2] group-hover:bg-[#dbeafe]">
              <Plus className="h-6 w-6" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-[#171717]">
              New
            </span>
          </button>
        )}

        {/* Existing Highlight Capsules */}
        {highlights.map((hl) => (
          <button
            key={hl.id}
            type="button"
            onClick={() => setActiveHighlight(hl)}
            className="group flex flex-col items-center gap-1.5 shrink-0 transition-transform active:scale-95"
          >
            {/* Gradient Outline Ring Container */}
            <div className="flex h-16 w-16 sm:h-18 sm:w-18 items-center justify-center rounded-full bg-gradient-to-tr from-[#1769c2] via-[#0284c7] to-[#38bdf8] p-[2px] transition group-hover:shadow-md">
              <div className="h-full w-full overflow-hidden rounded-full border-2 border-white bg-slate-100">
                <img
                  src={hl.coverImage}
                  alt={hl.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            </div>
            <span className="text-[11px] sm:text-xs font-medium text-[#171717] max-w-[70px] sm:max-w-[80px] truncate text-center">
              {hl.title}
            </span>
          </button>
        ))}
      </div>

      {/* Highlight Viewer Lightbox */}
      {activeHighlight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-neutral-900 shadow-2xl text-white">
            {/* Top Bar */}
            <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full overflow-hidden border border-white/40">
                  <img
                    src={activeHighlight.coverImage}
                    alt={activeHighlight.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="font-semibold text-sm drop-shadow-md">
                  {activeHighlight.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveHighlight(null)}
                className="rounded-full bg-black/40 p-1.5 text-white/80 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Story Visual Presentation */}
            <div className="relative aspect-[9/16] w-full bg-black flex items-center justify-center">
              <img
                src={activeHighlight.coverImage}
                alt={activeHighlight.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
              <div className="absolute bottom-6 left-6 right-6 text-center space-y-2">
                <p className="text-xs uppercase tracking-widest text-amber-300 font-bold">
                  Clinical Highlight
                </p>
                <h3 className="text-xl font-bold">{activeHighlight.title}</h3>
                <p className="text-xs text-white/80">
                  Shared clinical case insights and healthcare progress milestones.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create New Highlight Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm rounded-3xl border border-[#ded8d1] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#171717]">New Highlight</h3>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="rounded-full p-1 text-[#8a8784] hover:bg-[#f5f4f3] hover:text-[#171717]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddHighlight} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5d5854] mb-1">
                  Highlight Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Surgery Cases, Research 2026"
                  className="w-full rounded-xl border border-[#ded8d1] bg-[#f8f7f6] px-3.5 py-2 text-xs text-[#171717] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769c2]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5d5854] mb-1">
                  Cover Photo URL (optional)
                </label>
                <input
                  type="url"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full rounded-xl border border-[#ded8d1] bg-[#f8f7f6] px-3.5 py-2 text-xs text-[#171717] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769c2]/20"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 rounded-xl border border-[#ded8d1] py-2 text-xs font-semibold text-[#5d5854] hover:bg-[#f8f7f6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#1769c2] py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#12569f]"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
