"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  FileText,
  FolderHeart,
  Layers,
  Search,
  ShieldCheck,
  Sparkles,
  Download,
  Eye,
  ExternalLink,
  Clock,
  User,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { StudentNavHeader } from "@/modules/learn/components/StudentNavHeader";
import { LearningResource } from "@/modules/learn/types";
import { ResourceViewerModal } from "@/modules/learn/components/resources/ResourceViewerModal";

export default function ResourcesHubPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [resources, setResources] = React.useState<LearningResource[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedResourceId, setSelectedResourceId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isPending && !session) router.replace("/");
  }, [isPending, router, session]);

  React.useEffect(() => {
    if (!session?.user) return;
    const fetchResources = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (searchQuery.trim()) query.set("query", searchQuery.trim());
        const res = await fetch(`/api/learn/resources?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setResources(data.resources || []);
        }
      } catch (err) {
        console.error("Failed to load resources:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, [session?.user, searchQuery]);

  return (
    <div className="min-h-screen bg-[#faf9f8] dark:bg-[#0d1117] text-[#171717] dark:text-[#f0f6fc] pb-24">
      <StudentNavHeader activeTab="resources" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/learn"
                className="p-1.5 rounded-xl hover:bg-[#f0efee] dark:hover:bg-[#21262d] text-[#77716b] dark:text-[#8b949e] transition"
              >
                <ArrowLeft className="size-4" />
              </Link>
              <h1 className="text-2xl font-extrabold text-[#171717] dark:text-[#f0f6fc]">
                Medical Learning Resources Hub 📚
              </h1>
            </div>
            <p className="text-xs text-[#77716b] dark:text-[#8b949e] mt-1 ml-8">
              Access textbooks, interactive anatomical mind maps, question banks, and student study notes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/learn/books"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] px-4 py-2 text-xs font-bold text-white hover:bg-[#0c3c66] transition shadow-xs"
            >
              <BookOpen className="size-3.5" />
              <span>Browse All Books ({resources.filter((r) => r.resource_type === "pdf").length})</span>
            </Link>
          </div>
        </div>

        {/* 4 Core Resource Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Medical Books */}
          <Link
            href="/learn/books"
            className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-2xl p-5 shadow-2xs hover:shadow-md hover:border-[#0f4c81] transition group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="size-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition">
                <BookOpen className="size-5.5" />
              </div>
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc] flex items-center justify-between">
                  <span>Medical Books & Atlases</span>
                  <ArrowRight className="size-3.5 text-[#77716b] group-hover:text-[#0f4c81] transition" />
                </h2>
                <p className="text-[11px] text-[#5d5854] dark:text-[#8b949e] leading-relaxed line-clamp-2">
                  Clinical handbooks, illustrated anatomical atlases, and textbook chapters.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              Open Library →
            </span>
          </Link>

          {/* 2. Interactive Mind Maps */}
          <Link
            href="/learn/mind-maps"
            className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-2xl p-5 shadow-2xs hover:shadow-md hover:border-[#0f4c81] transition group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="size-11 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition">
                <Brain className="size-5.5" />
              </div>
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc] flex items-center justify-between">
                  <span>Interactive Mind Maps</span>
                  <ArrowRight className="size-3.5 text-[#77716b] group-hover:text-[#0f4c81] transition" />
                </h2>
                <p className="text-[11px] text-[#5d5854] dark:text-[#8b949e] leading-relaxed line-clamp-2">
                  Brachial Plexus, Cranial Nerves, and Cardiac pathways.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1">
              Explore Maps →
            </span>
          </Link>

          {/* 3. Question Banks */}
          <Link
            href="/learn/question-banks"
            className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-2xl p-5 shadow-2xs hover:shadow-md hover:border-[#0f4c81] transition group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="size-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#0f4c81] dark:text-[#58a6ff] flex items-center justify-center group-hover:scale-105 transition">
                <Layers className="size-5.5" />
              </div>
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc] flex items-center justify-between">
                  <span>Question Banks & MCQs</span>
                  <ArrowRight className="size-3.5 text-[#77716b] group-hover:text-[#0f4c81] transition" />
                </h2>
                <p className="text-[11px] text-[#5d5854] dark:text-[#8b949e] leading-relaxed line-clamp-2">
                  Curated banks by medical specialty with test generator.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#0f4c81] dark:text-[#58a6ff] flex items-center gap-1">
              Browse MCQs →
            </span>
          </Link>

          {/* 4. Notes & Study Community */}
          <Link
            href="/learn/notes"
            className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-2xl p-5 shadow-2xs hover:shadow-md hover:border-[#0f4c81] transition group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="size-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition">
                <FileText className="size-5.5" />
              </div>
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc] flex items-center justify-between">
                  <span>Clinical Notes & Feed</span>
                  <ArrowRight className="size-3.5 text-[#77716b] group-hover:text-[#0f4c81] transition" />
                </h2>
                <p className="text-[11px] text-[#5d5854] dark:text-[#8b949e] leading-relaxed line-clamp-2">
                  Peer-published verified study summaries with discussions.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
              Open Notes →
            </span>
          </Link>
        </div>

        {/* Live Uploaded Medical Resources & PDFs Section */}
        <div className="space-y-4 pt-4 border-t border-[#ded8d1] dark:border-[#30363d]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h2 className="text-lg font-extrabold text-[#171717] dark:text-[#f0f6fc] flex items-center gap-2">
                <Sparkles className="size-4 text-[#0f4c81] dark:text-[#58a6ff]" />
                <span>Uploaded Medical Materials & Study Books</span>
              </h2>
              <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
                Study guides, research papers, protocols, and textbooks published by verified faculty.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 size-3.5 text-[#77716b]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search PDF books & notes..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] text-xs text-[#171717] dark:text-[#f0f6fc] focus:outline-none focus:ring-2 focus:ring-[#0f4c81]"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-2xl bg-[#e8e6e3] dark:bg-[#21262d] animate-pulse" />
              ))}
            </div>
          ) : resources.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-8 text-center space-y-2">
              <BookOpen className="size-8 text-[#77716b] dark:text-[#8b949e] mx-auto opacity-50" />
              <p className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc]">
                No matching study materials found
              </p>
              <p className="text-[11px] text-[#77716b] dark:text-[#8b949e]">
                Check back soon or explore the full Medical Books library.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {resources.map((res) => (
                <div
                  key={res.id}
                  className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-4 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-md bg-blue-50 dark:bg-blue-950/40 text-[#0f4c81] dark:text-[#58a6ff] px-2 py-0.5 text-[10px] font-bold uppercase">
                        {res.resource_type.toUpperCase()}
                      </span>
                      {res.category && (
                        <span className="text-[10px] text-[#77716b] dark:text-[#8b949e] truncate">
                          {res.category}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-[#171717] dark:text-[#f0f6fc] line-clamp-2">
                      {res.title}
                    </h3>

                    {res.description && (
                      <p className="text-[11px] text-[#5d5854] dark:text-[#8b949e] line-clamp-2 leading-relaxed">
                        {res.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#ded8d1]/60 dark:border-[#30363d]/60 flex items-center justify-between">
                    <div className="text-[10px] text-[#77716b] dark:text-[#8b949e] flex items-center gap-1">
                      <Clock className="size-3" />
                      <span>{new Date(res.created_at).toLocaleDateString()}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedResourceId(res.id)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:underline cursor-pointer"
                    >
                      <Eye className="size-3.5" />
                      <span>Read / View</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Resource Viewer Modal */}
      {selectedResourceId && (
        <ResourceViewerModal
          resourceId={selectedResourceId}
          isOpen={Boolean(selectedResourceId)}
          onClose={() => setSelectedResourceId(null)}
        />
      )}
    </div>
  );
}
