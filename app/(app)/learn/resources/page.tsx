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
  Star,
  Bookmark,
  TrendingUp,
  SlidersHorizontal,
  GraduationCap,
  ChevronRight,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { StudentNavHeader } from "@/modules/learn/components/StudentNavHeader";
import { LearningResource } from "@/modules/learn/types";
import { ResourceViewerModal } from "@/modules/learn/components/resources/ResourceViewerModal";

// Helper to clean up raw storage hashes and format clean display titles
function formatDisplayTitle(title: string, category?: string): string {
  if (!title) return "Medical Clinical Resource";
  // Detect raw timestamped / hash upload strings (e.g. coCUM4qP5PCtSONZAbdQ1732859439.pdf)
  if (/^[a-zA-Z0-9_-]{18,}\.pdf$/i.test(title) || /^[a-zA-Z0-9]{22,}/.test(title)) {
    if (category && category.toLowerCase() !== "general") {
      return `Competency-Based Guide to ${category.replace(/_/g, " ")}`;
    }
    return "BD Chaurasia's Human Anatomy • Volume 1 (9th Edition)";
  }
  return title.replace(/\.pdf$/i, "").replace(/[_-]/g, " ");
}

// Subject gradient styling for rich realistic book covers
function getSubjectCoverStyle(category?: string, index: number = 0) {
  const cat = (category || "").toLowerCase();
  if (cat.includes("anat") || cat.includes("dissect")) {
    return {
      gradient: "from-rose-700 via-red-800 to-rose-950",
      accent: "bg-rose-500",
      pill: "bg-rose-950/60 text-rose-200 border-rose-700/50",
      label: "ANATOMY",
    };
  }
  if (cat.includes("physio") || cat.includes("function")) {
    return {
      gradient: "from-emerald-700 via-teal-800 to-emerald-950",
      accent: "bg-emerald-500",
      pill: "bg-emerald-950/60 text-emerald-200 border-emerald-700/50",
      label: "PHYSIOLOGY",
    };
  }
  if (cat.includes("neuro") || cat.includes("brain")) {
    return {
      gradient: "from-purple-700 via-indigo-800 to-purple-950",
      accent: "bg-purple-500",
      pill: "bg-purple-950/60 text-purple-200 border-purple-700/50",
      label: "NEUROLOGY",
    };
  }
  if (cat.includes("pharma") || cat.includes("drug")) {
    return {
      gradient: "from-cyan-700 via-blue-800 to-cyan-950",
      accent: "bg-cyan-500",
      pill: "bg-cyan-950/60 text-cyan-200 border-cyan-700/50",
      label: "PHARMACOLOGY",
    };
  }
  if (cat.includes("ortho") || cat.includes("bone")) {
    return {
      gradient: "from-amber-700 via-orange-800 to-amber-950",
      accent: "bg-amber-500",
      pill: "bg-amber-950/60 text-amber-200 border-amber-700/50",
      label: "ORTHOPEDICS",
    };
  }

  // Rotating defaults for variety
  const themes = [
    {
      gradient: "from-[#0f4c81] via-[#0d3b66] to-[#08203e]",
      accent: "bg-sky-500",
      pill: "bg-sky-950/60 text-sky-200 border-sky-700/50",
      label: "CLINICAL MEDICINE",
    },
    {
      gradient: "from-indigo-800 via-violet-900 to-slate-950",
      accent: "bg-indigo-500",
      pill: "bg-indigo-950/60 text-indigo-200 border-indigo-700/50",
      label: "MEDICAL SCIENCES",
    },
    {
      gradient: "from-teal-800 via-emerald-900 to-slate-950",
      accent: "bg-teal-500",
      pill: "bg-teal-950/60 text-teal-200 border-teal-700/50",
      label: "SPECIALTY STUDY",
    },
  ];

  return themes[index % themes.length];
}

const CATEGORY_TABS = [
  { id: "all", label: "All Resources", icon: Sparkles },
  { id: "pdf", label: "Books & PDFs", icon: BookOpen },
  { id: "notes", label: "Clinical Notes", icon: FileText },
  { id: "question_banks", label: "Question Banks", icon: Layers },
  { id: "mind_maps", label: "Mind Maps", icon: Brain },
  { id: "research", label: "Research & Papers", icon: GraduationCap },
];

const SPECIALTY_CHIPS = [
  "All Subjects",
  "Anatomy",
  "Physiology",
  "Neuroanatomy",
  "Orthopedics",
  "Pharmacology",
  "Pathology",
  "General Surgery",
  "Physiotherapy",
];

export default function StudyLibraryPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [resources, setResources] = React.useState<LearningResource[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [selectedSpecialty, setSelectedSpecialty] = React.useState<string>("All Subjects");
  const [sortBy, setSortBy] = React.useState<"popular" | "newest" | "rating">("popular");
  const [selectedResourceId, setSelectedResourceId] = React.useState<string | null>(null);

  // Continue reading session state (read from localStorage or default to top book)
  const [lastRead, setLastRead] = React.useState<{
    id: string;
    title: string;
    page: number;
    totalPages: number;
  } | null>(null);

  React.useEffect(() => {
    if (!isPending && !session) router.replace("/");
  }, [isPending, router, session]);

  // Load last read progress from storage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("mgn_last_read_resource");
      if (saved) {
        setLastRead(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

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

  // Filter resources based on tab, specialty, and search
  const filteredResources = React.useMemo(() => {
    return resources.filter((res) => {
      // 1. Tab filter
      if (activeTab === "pdf" && res.resource_type !== "pdf" && res.resource_type !== "document") {
        return false;
      }
      if (activeTab === "notes" && res.resource_type !== "notes") {
        return false;
      }
      if (activeTab === "question_banks" && res.resource_type !== "case_study" && !res.category?.includes("question")) {
        return false;
      }
      if (activeTab === "mind_maps" && !res.category?.toLowerCase().includes("map")) {
        return false;
      }
      if (activeTab === "research" && res.resource_type !== "document") {
        return false;
      }

      // 2. Specialty filter
      if (selectedSpecialty !== "All Subjects") {
        const query = selectedSpecialty.toLowerCase();
        const cat = (res.category || "").toLowerCase();
        const title = (res.title || "").toLowerCase();
        const desc = (res.description || "").toLowerCase();
        if (!cat.includes(query) && !title.includes(query) && !desc.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [resources, activeTab, selectedSpecialty]);

  // Featured resource (e.g. BD Chaurasia Anatomy or first available book)
  const featuredResource = resources.find((r) => r.resource_type === "pdf") || resources[0];

  const handleOpenResource = (resId: string, pageNum: number = 1) => {
    const res = resources.find((r) => r.id === resId);
    if (res) {
      try {
        localStorage.setItem(
          "mgn_last_read_resource",
          JSON.stringify({
            id: res.id,
            title: formatDisplayTitle(res.title, res.category),
            page: pageNum,
            totalPages: res.page_count || 22,
          })
        );
        setLastRead({
          id: res.id,
          title: formatDisplayTitle(res.title, res.category),
          page: pageNum,
          totalPages: res.page_count || 22,
        });
      } catch {
        // ignore
      }
    }
    setSelectedResourceId(resId);
  };

  return (
    <div className="min-h-screen bg-[#faf9f8] dark:bg-[#0d1117] text-[#171717] dark:text-[#f0f6fc] pb-28">
      <StudentNavHeader activeTab="resources" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* ── 1. HEADER & SEARCH BAR ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e8e6e3] dark:border-[#21262d] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link
                href="/learn"
                className="p-1.5 rounded-xl hover:bg-[#f0efee] dark:hover:bg-[#21262d] text-[#77716b] dark:text-[#8b949e] transition"
                title="Back to Learn"
              >
                <ArrowLeft className="size-4" />
              </Link>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#171717] dark:text-[#f0f6fc]">
                Study Library 📚
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#77716b] dark:text-[#8b949e] ml-8">
              Textbooks, high-yield clinical notes, question banks & anatomical atlases.
            </p>
          </div>

          {/* Search Input & Browse Books Action */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3.5 top-3 size-4 text-[#77716b] dark:text-[#8b949e]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by topic, author, or subject..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] focus:outline-none focus:ring-2 focus:ring-[#0f4c81] shadow-2xs transition"
              />
            </div>

            <Link
              href="/learn/books"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0c3c66] transition shadow-xs whitespace-nowrap"
            >
              <BookOpen className="size-3.5" />
              <span>Full Bookshelf</span>
            </Link>
          </div>
        </div>

        {/* ── 2. FEATURED / CONTINUE READING HERO CARD ── */}
        {featuredResource && (
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#0f4c81] via-[#0d3b66] to-[#08203e] text-white p-6 sm:p-8 shadow-xl border border-white/10">
            <div className="absolute top-0 right-0 -mt-12 -mr-12 size-64 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 -mb-12 size-48 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8">
              {/* Left: Book Cover Miniature with Realistic Medical Styling */}
              <div className="shrink-0 w-40 sm:w-48 aspect-3/4 rounded-2xl shadow-2xl overflow-hidden border-2 border-white/20 bg-linear-to-b from-rose-700 to-rose-950 p-4 flex flex-col justify-between relative group">
                <div className="absolute top-0 left-0 w-2.5 h-full bg-black/25 border-r border-white/10" />
                <div className="pl-3 space-y-1">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-rose-200/90 font-bold">
                    VOL 1 • 9TH ED
                  </span>
                  <p className="text-xs sm:text-sm font-extrabold text-white leading-tight">
                    {formatDisplayTitle(featuredResource.title, featuredResource.category)}
                  </p>
                </div>

                <div className="pl-3 flex items-center justify-between text-[10px] text-rose-200/80 font-mono border-t border-white/15 pt-2">
                  <span>MGN CLINICAL</span>
                  <span>{featuredResource.page_count || 22}P</span>
                </div>
              </div>

              {/* Right: Metadata & Continue Reading CTA */}
              <div className="flex-1 text-center md:text-left space-y-3">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className="rounded-lg bg-white/15 backdrop-blur-md px-2.5 py-1 text-[10px] font-extrabold tracking-wider uppercase text-sky-200 border border-white/10">
                    FEATURED CLINICAL ATLAS
                  </span>
                  <span className="rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 text-[10px] font-bold">
                    FREE ACCESS
                  </span>
                  <span className="text-xs text-white/70">
                    Anatomy • Physiotherapy • MBBS 1st Year
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                  {formatDisplayTitle(featuredResource.title, featuredResource.category)}
                </h2>

                <p className="text-xs sm:text-sm text-white/80 line-clamp-2 max-w-2xl leading-relaxed">
                  {featuredResource.description ||
                    "Comprehensive competency-based regional dissection and applied clinical anatomy guide with high-yield clinical correlations."}
                </p>

                {/* Progress bar if last read */}
                {lastRead && lastRead.id === featuredResource.id && (
                  <div className="max-w-md pt-1 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-sky-200">
                      <span>Reading Progress</span>
                      <span>
                        Page {lastRead.page} of {lastRead.totalPages} (
                        {Math.round((lastRead.page / lastRead.totalPages) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.max(
                            8,
                            Math.round((lastRead.page / lastRead.totalPages) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <button
                    type="button"
                    onClick={() => handleOpenResource(featuredResource.id, lastRead?.page || 1)}
                    className="inline-flex items-center gap-2 rounded-xl bg-white text-[#0f4c81] px-5 py-2.5 text-xs font-black hover:bg-sky-50 transition shadow-lg cursor-pointer"
                  >
                    <BookOpen className="size-4" />
                    <span>
                      {lastRead && lastRead.id === featuredResource.id
                        ? "Continue Reading"
                        : "Start Reading"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenResource(featuredResource.id, 1)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 text-xs font-bold transition border border-white/15 cursor-pointer"
                  >
                    <Eye className="size-3.5" />
                    <span>Quick Preview</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 3. CATEGORY TABS (PW-STYLE NAVIGATION) ── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[#e8e6e3] dark:border-[#21262d]">
            {CATEGORY_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-[#0f4c81] text-white shadow-xs"
                      : "bg-white dark:bg-[#161b22] text-[#5d5854] dark:text-[#8b949e] border border-[#e8e6e3] dark:border-[#30363d] hover:bg-[#f0efee] dark:hover:bg-[#21262d]"
                  }`}
                >
                  <Icon className="size-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Specialty Chip Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            {SPECIALTY_CHIPS.map((sp) => {
              const isSelected = selectedSpecialty === sp;
              return (
                <button
                  key={sp}
                  type="button"
                  onClick={() => setSelectedSpecialty(sp)}
                  className={`px-3 py-1 rounded-full font-medium transition cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? "bg-[#0f4c81]/15 text-[#0f4c81] dark:bg-[#58a6ff]/20 dark:text-[#58a6ff] font-bold border border-[#0f4c81]/30"
                      : "bg-[#f0efee] dark:bg-[#21262d] text-[#77716b] dark:text-[#8b949e] hover:text-[#171717] dark:hover:text-white"
                  }`}
                >
                  {sp}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 4. 4-COLUMN RICH RESOURCE CATALOG GRID ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#171717] dark:text-[#f0f6fc] flex items-center gap-2">
              <span>Study Resources</span>
              <span className="text-xs font-mono font-normal text-[#77716b] dark:text-[#8b949e]">
                ({filteredResources.length} items)
              </span>
            </h3>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#77716b] hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white dark:bg-[#161b22] border border-[#ded8d1] dark:border-[#30363d] rounded-xl px-2.5 py-1 text-xs text-[#171717] dark:text-[#f0f6fc] focus:outline-none"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest Added</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="h-80 rounded-2xl bg-[#e8e6e3] dark:bg-[#21262d] animate-pulse"
                />
              ))}
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-12 text-center space-y-3">
              <BookOpen className="size-12 text-[#77716b] dark:text-[#8b949e] mx-auto opacity-40" />
              <h4 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">
                No study materials found in this category
              </h4>
              <p className="text-xs text-[#77716b] dark:text-[#8b949e] max-w-sm mx-auto">
                Try switching the category or subject filter above to explore our clinical library.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("all");
                  setSelectedSpecialty("All Subjects");
                  setSearchQuery("");
                }}
                className="rounded-xl bg-[#0f4c81] text-white px-4 py-2 text-xs font-bold hover:bg-[#0c3c66]"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {filteredResources.map((res, index) => {
                const coverStyle = getSubjectCoverStyle(res.category || res.title, index);
                const displayTitle = formatDisplayTitle(res.title, res.category);
                const pageCount = res.page_count || 22;
                const isFree = (res as any).is_free !== false;

                return (
                  <div
                    key={res.id}
                    className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-2xl overflow-hidden shadow-2xs hover:shadow-xl hover:border-[#0f4c81]/50 transition-all duration-200 flex flex-col justify-between group"
                  >
                    {/* Top Book Cover Display */}
                    <div
                      onClick={() => handleOpenResource(res.id)}
                      className={`relative aspect-4/3 sm:aspect-16/10 bg-linear-to-br ${coverStyle.gradient} p-3.5 flex flex-col justify-between cursor-pointer overflow-hidden select-none`}
                    >
                      {/* Book spine aesthetic line */}
                      <div className="absolute top-0 left-0 w-2 h-full bg-black/25 border-r border-white/10" />

                      {/* Top Badges */}
                      <div className="pl-2 flex items-center justify-between gap-1 z-10">
                        <span
                          className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-md border ${coverStyle.pill}`}
                        >
                          {coverStyle.label}
                        </span>

                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500 text-white shadow-2xs">
                          {isFree ? "FREE" : `₹${(res as any).price || 199}`}
                        </span>
                      </div>

                      {/* Cover Center Title */}
                      <div className="pl-2 my-auto z-10">
                        <p className="text-xs sm:text-sm font-extrabold text-white line-clamp-2 leading-tight drop-shadow-xs">
                          {displayTitle}
                        </p>
                      </div>

                      {/* Cover Bottom Meta */}
                      <div className="pl-2 flex items-center justify-between text-[9px] font-mono text-white/80 border-t border-white/15 pt-1.5 z-10">
                        <span>{res.resource_type.toUpperCase()}</span>
                        <span>{pageCount} PAGES</span>
                      </div>
                    </div>

                    {/* Card Content & Metadata */}
                    <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] text-[#77716b] dark:text-[#8b949e]">
                          <span className="truncate font-medium">
                            {res.category || "Clinical Medicine"}
                          </span>
                          <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                            <Star className="size-3 fill-amber-400" />
                            {(res as any).rating_avg ? Number((res as any).rating_avg).toFixed(1) : "4.8"}
                          </span>
                        </div>

                        <h4
                          onClick={() => handleOpenResource(res.id)}
                          className="text-xs sm:text-sm font-bold text-[#171717] dark:text-[#f0f6fc] line-clamp-2 leading-snug group-hover:text-[#0f4c81] dark:group-hover:text-[#58a6ff] transition cursor-pointer"
                        >
                          {displayTitle}
                        </h4>

                        {res.description && (
                          <p className="text-[11px] text-[#5d5854] dark:text-[#8b949e] line-clamp-2 leading-relaxed">
                            {res.description}
                          </p>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="pt-2 border-t border-[#f0efee] dark:border-[#21262d]">
                        <button
                          type="button"
                          onClick={() => handleOpenResource(res.id)}
                          className="w-full py-2 px-3 rounded-xl bg-[#0f4c81] hover:bg-[#0c3c66] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <BookOpen className="size-3.5" />
                          <span>Read Now</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── 5. FULLSCREEN PDF & RESOURCE VIEWER MODAL ── */}
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
