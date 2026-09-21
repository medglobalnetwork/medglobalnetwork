"use client";

import * as React from "react";
import { 
  Grid3X3, 
  Film, 
  Bookmark, 
  Tag, 
  Pin, 
  Play, 
  Heart, 
  MessageCircle, 
  Share2, 
  X, 
  ChevronLeft, 
  ChevronRight,
  SlidersHorizontal,
  Eye,
  CheckCircle2
} from "lucide-react";

export interface MediaPost {
  id: string;
  type: "post" | "reel" | "tagged" | "saved";
  mediaUrl: string;
  caption: string;
  likes: number;
  commentsCount: number;
  views?: string;
  isPinned?: boolean;
  isVideo?: boolean;
  timestamp: string;
  tags?: string[];
  comments?: Array<{
    id: string;
    author: string;
    avatar?: string;
    text: string;
    time: string;
  }>;
}

const SAMPLE_POSTS: MediaPost[] = [
  {
    id: "p1",
    type: "post",
    mediaUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80",
    caption: "Post-op ACL Rehabilitation Phase 2: Restoring active knee flexion and quadriceps activation with eccentric loading protocols. 🦵⚡",
    likes: 342,
    commentsCount: 28,
    views: "2.4K",
    isPinned: true,
    isVideo: false,
    timestamp: "2 days ago",
    tags: ["#ACLRehab", "#SportsPhysio", "#KneeRecovery"],
    comments: [
      { id: "c1", author: "Dr. Ananya Sharma", text: "Great protocol! At what week did you introduce open chain?", time: "1d ago" },
      { id: "c2", author: "Dr. Rajesh V.", text: "Clean execution and clear gait mechanics.", time: "18h ago" }
    ]
  },
  {
    id: "p2",
    type: "reel",
    mediaUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80",
    caption: "Cervical Spine Mobilization Masterclass: Segmental C5-C6 glide techniques to relieve acute radiculopathy symptoms. 🧠👨‍⚕️",
    likes: 819,
    commentsCount: 54,
    views: "8.1K",
    isPinned: true,
    isVideo: true,
    timestamp: "4 days ago",
    tags: ["#CervicalSpine", "#ManualTherapy", "#SpineCare"],
    comments: [
      { id: "c3", author: "Physio Vikas", text: "Very smooth technique doctor!", time: "3d ago" }
    ]
  },
  {
    id: "p3",
    type: "post",
    mediaUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80",
    caption: "Ergonomic Desk Setup for Tech Workers: 5 simple adjustments to eliminate lower back & neck fatigue during prolonged sitting. 💻🪑",
    likes: 512,
    commentsCount: 42,
    views: "4.7K",
    isPinned: false,
    isVideo: false,
    timestamp: "1 week ago",
    tags: ["#Ergonomics", "#PosturalHealth", "#WorkplaceWellness"],
    comments: []
  },
  {
    id: "p4",
    type: "reel",
    mediaUrl: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&auto=format&fit=crop&q=80",
    caption: "Dry Needling for Trapezius Trigger Points: Immediate myofascial release and range of motion improvement demonstration. 🎯",
    likes: 1240,
    commentsCount: 89,
    views: "12.3K",
    isPinned: false,
    isVideo: true,
    timestamp: "2 weeks ago",
    tags: ["#DryNeedling", "#MyofascialRelease", "#Physiotherapy"],
    comments: []
  },
  {
    id: "p5",
    type: "post",
    mediaUrl: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=80",
    caption: "Clinical Workshop on Sports Biomechanics & Gait Analysis: Facilitating 30+ young clinicians on 3D motion capture interpretation. 🏃‍♂️📊",
    likes: 478,
    commentsCount: 31,
    views: "3.2K",
    isPinned: false,
    isVideo: false,
    timestamp: "3 weeks ago",
    tags: ["#Biomechanics", "#GaitAnalysis", "#ContinuingEducation"],
    comments: []
  },
  {
    id: "p6",
    type: "reel",
    mediaUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80",
    caption: "Shoulder Impingement vs Rotator Cuff Tendinopathy: Differential clinical tests in under 60 seconds! 🩺",
    likes: 950,
    commentsCount: 63,
    views: "9.8K",
    isPinned: false,
    isVideo: true,
    timestamp: "1 month ago",
    tags: ["#ShoulderRehab", "#ClinicalDifferential", "#OrthoPhysio"],
    comments: []
  }
];

interface ProfileContentGridProps {
  userId: string;
  isOwnProfile?: boolean;
}

export function ProfileContentGrid({ userId, isOwnProfile }: ProfileContentGridProps) {
  const [activeTab, setActiveTab] = React.useState<"posts" | "reels" | "saved" | "tagged">("posts");
  const [sortBy, setSortBy] = React.useState<"latest" | "popular" | "oldest">("latest");
  const [selectedPost, setSelectedPost] = React.useState<MediaPost | null>(null);
  const [commentInput, setCommentInput] = React.useState("");

  // Filter posts based on active tab
  const filteredPosts = React.useMemo(() => {
    let list = [...SAMPLE_POSTS];
    if (activeTab === "reels") {
      list = list.filter((p) => p.type === "reel" || p.isVideo);
    } else if (activeTab === "saved") {
      list = list.filter((p) => p.type === "saved" || p.isPinned);
    } else if (activeTab === "tagged") {
      list = list.filter((p) => p.type === "tagged");
    }

    if (sortBy === "popular") {
      list.sort((a, b) => b.likes - a.likes);
    } else if (sortBy === "oldest") {
      list.reverse();
    }
    return list;
  }, [activeTab, sortBy]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !selectedPost) return;

    const newComment = {
      id: `c-${Date.now()}`,
      author: "You",
      text: commentInput.trim(),
      time: "Just now",
    };

    setSelectedPost({
      ...selectedPost,
      commentsCount: selectedPost.commentsCount + 1,
      comments: [...(selectedPost.comments || []), newComment],
    });
    setCommentInput("");
  };

  return (
    <div className="rounded-3xl bg-white border border-[#e8e6e3] shadow-sm overflow-hidden mb-6">
      {/* Tab Navigation Strip */}
      <div className="flex items-center justify-between border-b border-[#f0efee] px-4 sm:px-6">
        <div className="flex items-center gap-1 sm:gap-4 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("posts")}
            className={`inline-flex items-center gap-2 py-4 px-2 sm:px-3 text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 ${
              activeTab === "posts"
                ? "border-[#1769c2] text-[#1769c2]"
                : "border-transparent text-[#77716b] hover:text-[#171717]"
            }`}
          >
            <Grid3X3 className="h-4 w-4" />
            <span>Posts</span>
            <span className="rounded-full bg-[#f0efee] px-2 py-0.5 text-[10px] font-bold text-[#5d5854]">
              142
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("reels")}
            className={`inline-flex items-center gap-2 py-4 px-2 sm:px-3 text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 ${
              activeTab === "reels"
                ? "border-[#1769c2] text-[#1769c2]"
                : "border-transparent text-[#77716b] hover:text-[#171717]"
            }`}
          >
            <Film className="h-4 w-4" />
            <span>Reels</span>
            <span className="rounded-full bg-[#f0efee] px-2 py-0.5 text-[10px] font-bold text-[#5d5854]">
              38
            </span>
          </button>

          {isOwnProfile && (
            <button
              type="button"
              onClick={() => setActiveTab("saved")}
              className={`inline-flex items-center gap-2 py-4 px-2 sm:px-3 text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 ${
                activeTab === "saved"
                  ? "border-[#1769c2] text-[#1769c2]"
                : "border-transparent text-[#77716b] hover:text-[#171717]"
              }`}
            >
              <Bookmark className="h-4 w-4" />
              <span>Saved</span>
              <span className="rounded-full bg-[#f0efee] px-2 py-0.5 text-[10px] font-bold text-[#5d5854]">
                19
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab("tagged")}
            className={`inline-flex items-center gap-2 py-4 px-2 sm:px-3 text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 ${
              activeTab === "tagged"
                ? "border-[#1769c2] text-[#1769c2]"
                : "border-transparent text-[#77716b] hover:text-[#171717]"
            }`}
          >
            <Tag className="h-4 w-4" />
            <span>Tagged</span>
            <span className="rounded-full bg-[#f0efee] px-2 py-0.5 text-[10px] font-bold text-[#5d5854]">
              12
            </span>
          </button>
        </div>

        {/* Sort selector */}
        <div className="hidden sm:flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-[#77716b]" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-lg border border-[#ded8d1] bg-white px-2.5 py-1 text-xs font-semibold text-[#5d5854] focus:outline-none focus:ring-1 focus:ring-[#1769c2]"
          >
            <option value="latest">Latest</option>
            <option value="popular">Most Popular</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      {/* 3-Column Instagram-Style Grid */}
      <div className="p-4 sm:p-6">
        {filteredPosts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-[#77716b]">No media items found in this section.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="group relative aspect-4/5 sm:aspect-square w-full rounded-2xl overflow-hidden cursor-pointer bg-black/5 shadow-xs transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                {/* Image Thumbnail */}
                <img
                  src={post.mediaUrl}
                  alt={post.caption}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20 opacity-80 group-hover:opacity-90 transition-opacity" />

                {/* Top Badges: Pinned / Video */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                  {post.isPinned ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-white/10 shadow-xs">
                      <Pin className="h-3 w-3 fill-amber-300" />
                      <span>Pinned</span>
                    </span>
                  ) : <span />}

                  {post.isVideo && (
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10 shadow-xs">
                      <Play className="h-3 w-3 fill-white ml-0.5" />
                    </span>
                  )}
                </div>

                {/* Bottom Stats: Views & Engagement */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between text-white">
                  {post.views ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold drop-shadow-md">
                      <Play className="h-3 w-3 fill-white" />
                      <span>{post.views}</span>
                    </span>
                  ) : (
                    <span />
                  )}

                  {/* Hover stats */}
                  <div className="flex items-center gap-2 text-[11px] font-bold opacity-90 group-hover:opacity-100 transition-opacity">
                    <span className="inline-flex items-center gap-0.5">
                      <Heart className="h-3 w-3 fill-white" /> {post.likes}
                    </span>
                    <span className="inline-flex items-center gap-0.5">
                      <MessageCircle className="h-3 w-3 fill-white" /> {post.commentsCount}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Post Viewer Modal / Lightbox */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-6 animate-fade-in">
          <div className="relative flex flex-col md:flex-row w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            {/* Close trigger */}
            <button
              type="button"
              onClick={() => setSelectedPost(null)}
              className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Left Image / Video Display */}
            <div className="relative md:w-3/5 bg-black flex items-center justify-center min-h-[280px] sm:min-h-[420px]">
              <img
                src={selectedPost.mediaUrl}
                alt={selectedPost.caption}
                className="max-h-[70vh] w-full object-contain"
              />
              {selectedPost.isVideo && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/30 backdrop-blur-md text-white shadow-xl hover:scale-110 transition cursor-pointer">
                    <Play className="h-7 w-7 fill-white ml-1" />
                  </div>
                </div>
              )}
            </div>

            {/* Right Details, Captions & Comments */}
            <div className="flex flex-col md:w-2/5 p-4 sm:p-6 justify-between bg-white overflow-y-auto">
              <div className="space-y-4">
                {/* Author row */}
                <div className="flex items-center gap-3 pb-3 border-b border-[#f0efee]">
                  <div className="h-10 w-10 rounded-full bg-[#1769c2] text-white flex items-center justify-center font-bold text-sm">
                    MGN
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-bold text-[#171717]">Professional Clinician</p>
                      <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 fill-blue-500 text-white" />
                    </div>
                    <p className="text-[11px] text-[#77716b]">{selectedPost.timestamp}</p>
                  </div>
                </div>

                {/* Caption */}
                <p className="text-xs sm:text-sm text-[#171717] leading-relaxed">
                  {selectedPost.caption}
                </p>

                {/* Tags */}
                {selectedPost.tags && selectedPost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPost.tags.map((t, idx) => (
                      <span key={idx} className="text-[11px] font-semibold text-[#1769c2]">
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Comments section */}
                <div className="pt-3 border-t border-[#f0efee]">
                  <p className="text-xs font-bold text-[#5d5854] mb-2.5">
                    Comments ({selectedPost.commentsCount})
                  </p>
                  <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
                    {selectedPost.comments && selectedPost.comments.length > 0 ? (
                      selectedPost.comments.map((c) => (
                        <div key={c.id} className="text-xs bg-[#f8f7f6] p-2.5 rounded-xl">
                          <span className="font-bold text-[#171717]">{c.author}: </span>
                          <span className="text-[#5d5854]">{c.text}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-[#a09890] italic">No comments yet. Be the first to start the clinical discussion!</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Toolbar & Add Comment Form */}
              <div className="pt-4 border-t border-[#f0efee] mt-4 space-y-3">
                <div className="flex items-center justify-between text-[#5d5854]">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedPost({
                          ...selectedPost,
                          likes: selectedPost.likes + 1,
                        })
                      }
                      className="flex items-center gap-1 text-xs font-bold hover:text-red-600 transition"
                    >
                      <Heart className="h-4 w-4" />
                      <span>{selectedPost.likes}</span>
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-1 text-xs font-bold hover:text-[#1769c2] transition"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>{selectedPost.commentsCount}</span>
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-1 text-xs font-bold hover:text-[#1769c2] transition"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                  {selectedPost.views && (
                    <span className="text-[11px] font-semibold text-[#77716b]">
                      {selectedPost.views} views
                    </span>
                  )}
                </div>

                {/* Comment input form */}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a clinical comment..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    className="flex-1 rounded-xl border border-[#ded8d1] px-3 py-1.5 text-xs text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#1769c2]"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-[#1769c2] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#12569f] transition"
                  >
                    Post
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
