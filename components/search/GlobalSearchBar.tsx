"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  X,
  Loader2,
  Users,
  Briefcase,
  GraduationCap,
  Sparkles,
  History,
  TrendingUp,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Crown,
  Compass,
} from "lucide-react";
import { DEFAULT_BLANK_AVATAR } from "@/lib/avatar";
import { UserAvatar } from "@/components/UserAvatar";
import { MemberBadge } from "@/modules/network/components/MemberBadge";

type SearchCategory = "all" | "people" | "jobs" | "courses" | "communities";

interface SearchResults {
  people: Array<{
    user_id: string;
    id: string;
    name: string;
    email: string;
    image: string | null;
    username: string | null;
    member_id: string | null;
    is_founding_member: boolean;
    profession: string | null;
    specialization: string | null;
    designation: string | null;
    organization: string | null;
    city: string | null;
    state: string | null;
    primary_degree: string | null;
    registration_verified: boolean;
  }>;
  jobs: Array<{
    id: string;
    title: string;
    organization_name: string | null;
    location: string | null;
    city: string | null;
    state: string | null;
    opportunity_type: string | null;
    employment_type: string | null;
  }>;
  courses: Array<{
    id: string;
    title: string;
    slug: string;
    thumbnail: string | null;
    category: string | null;
    profession: string | null;
    level: string | null;
    duration_minutes: number | null;
    is_free: boolean;
  }>;
  communities: Array<{
    id: string;
    slug: string;
    name: string;
    description: string | null;
    specialty: string | null;
    cover_url: string | null;
    member_count: number | null;
  }>;
}

const POPULAR_SPECIALTIES = [
  "Cardiology",
  "Physiotherapy",
  "Orthopedics",
  "Neurology",
  "Pediatrics",
  "Radiology",
  "Dermatology",
  "General Medicine",
];

const QUICK_SHORTCUTS = [
  { label: "Clinicians & Doctors", href: "/network", icon: Users, color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40" },
  { label: "Healthcare Jobs", href: "/opportunities", icon: Briefcase, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40" },
  { label: "Clinical Courses", href: "/learn", icon: GraduationCap, color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40" },
  { label: "Medical Circles", href: "/network/communities", icon: Compass, color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40" },
];

const RECENT_SEARCHES_KEY = "mgn_recent_searches_v2";

export function GlobalSearchBar({
  className = "",
  placeholder = "Search doctors, specialties, jobs, courses...",
  isMobile = false,
  onCloseMobile,
}: {
  className?: string;
  placeholder?: string;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<SearchCategory>("all");
  const [isOpen, setIsOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);
  const [results, setResults] = React.useState<SearchResults>({
    people: [],
    jobs: [],
    courses: [],
    communities: [],
  });

  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null);

  // Load recent searches from localStorage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      }
    } catch {}
  }, []);

  // Save term to recent searches
  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 5);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const removeRecentSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s !== term);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {}
  };

  // Close when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut: Cmd/Ctrl + K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch results when query changes
  React.useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const trimmed = query.trim();
    if (!trimmed) {
      setResults({ people: [], jobs: [], courses: [], communities: [] });
      setLoading(false);
      return;
    }

    setLoading(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}&limit=6`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setResults({
            people: data.people || [],
            jobs: data.jobs || [],
            courses: data.courses || [],
            communities: data.communities || [],
          });
        }
      } catch (err) {
        console.error("Global search error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    saveRecentSearch(trimmed);
    setIsOpen(false);
    onCloseMobile?.();

    if (activeTab === "people") {
      router.push(`/network?q=${encodeURIComponent(trimmed)}`);
    } else if (activeTab === "jobs") {
      router.push(`/opportunities?query=${encodeURIComponent(trimmed)}`);
    } else if (activeTab === "courses") {
      router.push(`/learn?q=${encodeURIComponent(trimmed)}`);
    } else if (activeTab === "communities") {
      router.push(`/network/communities?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push(`/network?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleSelectRecent = (term: string) => {
    setQuery(term);
    setIsOpen(true);
  };

  const handleSelectShortcut = (href: string) => {
    setIsOpen(false);
    onCloseMobile?.();
    router.push(href);
  };

  const totalResultsCount =
    results.people.length + results.jobs.length + results.courses.length + results.communities.length;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input Box */}
      <form onSubmit={handleSubmit} className="relative flex w-full items-center">
        <div className="pointer-events-none absolute left-3.5 flex items-center justify-center text-[#77716b] dark:text-[#8b949e]">
          {loading ? (
            <Loader2 className="h-4.5 w-4.5 animate-spin text-[#0f4c81] dark:text-[#388bfd]" />
          ) : (
            <Search className="h-4.5 w-4.5 stroke-[2]" />
          )}
        </div>

        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          aria-label="Global unified search"
          className="h-10 w-full rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-[#f8f7f6] dark:bg-[#161b22] pl-10 pr-16 text-xs text-[#171717] dark:text-[#f0f6fc] placeholder:text-[#8a8784] dark:placeholder:text-[#8b949e] transition-all focus:border-[#0f4c81] dark:focus:border-[#388bfd] focus:bg-white dark:focus:bg-[#1c2128] focus:outline-none focus:ring-4 focus:ring-[#0f4c81]/10 dark:focus:ring-[#388bfd]/20"
        />

        <div className="absolute right-2.5 flex items-center gap-1">
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200/70 dark:bg-slate-700 text-[#5d5854] dark:text-[#8b949e] hover:bg-slate-300 dark:hover:bg-slate-600 transition"
              title="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          ) : (
            !isMobile && (
              <kbd className="pointer-events-none hidden sm:inline-flex items-center rounded-lg border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#21262d] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#8a8784] dark:text-[#8b949e] shadow-2xs select-none">
                ⌘K
              </kbd>
            )
          )}
        </div>
      </form>

      {/* Dropdown Menu Overlay */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-3xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-2xl animate-in fade-in-50 zoom-in-95 duration-150 max-h-[80vh] flex flex-col">
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 border-b border-[#f0efee] dark:border-[#21262d] bg-[#fcfbf9] dark:bg-[#1c2128] px-3 py-2 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === "all"
                  ? "bg-[#0f4c81] dark:bg-[#388bfd] text-white shadow-2xs"
                  : "text-[#5d5854] dark:text-[#8b949e] hover:bg-white dark:hover:bg-[#21262d] hover:text-[#171717] dark:hover:text-[#f0f6fc]"
              }`}
            >
              All {query && totalResultsCount > 0 && `(${totalResultsCount})`}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("people")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === "people"
                  ? "bg-[#0f4c81] dark:bg-[#388bfd] text-white shadow-2xs"
                  : "text-[#5d5854] dark:text-[#8b949e] hover:bg-white dark:hover:bg-[#21262d] hover:text-[#171717] dark:hover:text-[#f0f6fc]"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>People</span>
              {query && results.people.length > 0 && (
                <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">
                  {results.people.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("jobs")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === "jobs"
                  ? "bg-[#0f4c81] dark:bg-[#388bfd] text-white shadow-2xs"
                  : "text-[#5d5854] dark:text-[#8b949e] hover:bg-white dark:hover:bg-[#21262d] hover:text-[#171717] dark:hover:text-[#f0f6fc]"
              }`}
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>Jobs</span>
              {query && results.jobs.length > 0 && (
                <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">
                  {results.jobs.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("courses")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === "courses"
                  ? "bg-[#0f4c81] dark:bg-[#388bfd] text-white shadow-2xs"
                  : "text-[#5d5854] dark:text-[#8b949e] hover:bg-white dark:hover:bg-[#21262d] hover:text-[#171717] dark:hover:text-[#f0f6fc]"
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Courses</span>
              {query && results.courses.length > 0 && (
                <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">
                  {results.courses.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("communities")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === "communities"
                  ? "bg-[#0f4c81] dark:bg-[#388bfd] text-white shadow-2xs"
                  : "text-[#5d5854] dark:text-[#8b949e] hover:bg-white dark:hover:bg-[#21262d] hover:text-[#171717] dark:hover:text-[#f0f6fc]"
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Circles</span>
              {query && results.communities.length > 0 && (
                <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">
                  {results.communities.length}
                </span>
              )}
            </button>
          </div>

          {/* Body Section */}
          <div className="overflow-y-auto p-3 sm:p-4 space-y-4 divide-y divide-[#f5f4f3] dark:divide-[#21262d]">
            {/* STATE 1: EMPTY QUERY (DISCOVERY, RECENT, SHORTCUTS) */}
            {!query.trim() && (
              <div className="space-y-4 pt-1">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase text-[#77716b] dark:text-[#8b949e] flex items-center gap-1.5">
                        <History className="size-3" />
                        <span>Recent Searches</span>
                      </span>
                      <button
                        type="button"
                        onClick={clearAllRecent}
                        className="text-[11px] font-semibold text-[#0f4c81] dark:text-[#388bfd] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] rounded cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {recentSearches.map((term, i) => (
                        <div
                          key={i}
                          onClick={() => handleSelectRecent(term)}
                          role="button"
                          tabIndex={0}
                          className="group inline-flex items-center gap-1.5 rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#f8f7f6] dark:bg-[#21262d] px-3 py-1.5 text-xs font-medium text-[#171717] dark:text-[#f0f6fc] hover:border-[#0f4c81] dark:hover:border-[#388bfd] hover:bg-white dark:hover:bg-[#262b35] transition cursor-pointer"
                        >
                          <Search className="size-3 text-[#77716b] dark:text-[#8b949e] group-hover:text-[#0f4c81] dark:group-hover:text-[#388bfd]" />
                          <span>{term}</span>
                          <button
                            type="button"
                            onClick={(e) => removeRecentSearch(e, term)}
                            className="ml-0.5 rounded-full p-0.5 text-[#77716b] dark:text-[#8b949e] hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-[#171717] dark:hover:text-[#f0f6fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] cursor-pointer"
                          >
                            <X className="size-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Specialties */}
                <div>
                  <span className="text-[11px] font-bold uppercase text-[#77716b] dark:text-[#8b949e] flex items-center gap-1.5 mb-2">
                    <TrendingUp className="size-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Popular Specialties & Disciplines</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_SPECIALTIES.map((spec, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setQuery(spec);
                          saveRecentSearch(spec);
                        }}
                        className="rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#21262d] px-3 py-1.5 text-xs font-semibold text-[#171717] dark:text-[#f0f6fc] hover:border-[#0f4c81] dark:hover:border-[#388bfd] hover:bg-[#eef5fc] dark:hover:bg-[#1f2d42] hover:text-[#0f4c81] dark:hover:text-[#58a6ff] transition shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] cursor-pointer"
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Platform Hubs */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold uppercase text-[#77716b] dark:text-[#8b949e] flex items-center gap-1.5 mb-2">
                    <Sparkles className="size-3 text-amber-500" />
                    <span>Quick Navigators</span>
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {QUICK_SHORTCUTS.map((sc, i) => {
                      const Icon = sc.icon;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSelectShortcut(sc.href)}
                          className="flex flex-col items-start gap-1 rounded-2xl border border-[#ded8d1] dark:border-[#30363d] p-3 text-left transition hover:border-[#0f4c81] dark:hover:border-[#388bfd] hover:bg-[#fcfbf9] dark:hover:bg-[#21262d] hover:shadow-xs cursor-pointer"
                        >
                          <div className={`flex h-7 w-7 items-center justify-center rounded-xl ${sc.color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mt-1">{sc.label}</span>
                          <span className="text-[10px] text-[#77716b] dark:text-[#8b949e] flex items-center gap-0.5">
                            <span>Explore</span>
                            <ArrowRight className="h-2.5 w-2.5" />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STATE 2: LOADING */}
            {query.trim() && loading && (
              <div className="py-12 text-center text-xs text-[#77716b] dark:text-[#8b949e]">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#0f4c81] dark:text-[#388bfd] mb-2" />
                <p className="font-semibold text-[#171717] dark:text-[#f0f6fc]">Searching healthcare network...</p>
                <p className="text-[11px] text-[#8a8784] dark:text-[#8b949e]">Looking across doctors, jobs, courses, and circles</p>
              </div>
            )}

            {/* STATE 3: NO RESULTS */}
            {query.trim() && !loading && totalResultsCount === 0 && (
              <div className="py-10 text-center text-xs">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-[#77716b] dark:text-[#8b949e]">
                  <Search className="h-5 w-5" />
                </div>
                <p className="font-bold text-[#171717] dark:text-[#f0f6fc]">No results found for &ldquo;{query}&rdquo;</p>
                <p className="mt-1 text-[11px] text-[#77716b] dark:text-[#8b949e]">
                  Try searching by doctor name, specialty (e.g. Cardiology), hospital, or job role.
                </p>
              </div>
            )}

            {/* STATE 4: LIVE RESULTS */}
            {query.trim() && !loading && totalResultsCount > 0 && (
              <div className="space-y-4 pt-1">
                {/* 1. PEOPLE RESULTS */}
                {(activeTab === "all" || activeTab === "people") && results.people.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase text-[#0f4c81] dark:text-[#58a6ff] flex items-center gap-1.5">
                        <Users className="size-3.5" />
                        <span>Doctors & Clinicians ({results.people.length})</span>
                      </span>
                      <Link
                        href={`/network?q=${encodeURIComponent(query)}`}
                        onClick={() => {
                          setIsOpen(false);
                          saveRecentSearch(query);
                          onCloseMobile?.();
                        }}
                        className="text-[11px] font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:underline inline-flex items-center gap-0.5"
                      >
                        <span>View All</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>

                    <div className="space-y-1.5">
                      {results.people.map((p) => {
                        const targetUrl = p.username ? `/profile/${p.username}` : `/profile/${p.user_id}`;
                        return (
                          <Link
                            key={p.user_id}
                            href={targetUrl}
                            onClick={() => {
                              setIsOpen(false);
                              saveRecentSearch(query);
                              onCloseMobile?.();
                            }}
                            className="flex items-center gap-3 rounded-2xl border border-transparent p-2.5 transition hover:border-[#cbdff7] dark:hover:border-[#30363d] hover:bg-[#f4f8fe] dark:hover:bg-[#1c2433]"
                          >
                            <UserAvatar
                              src={p.image}
                              name={p.name}
                              email={p.email}
                              userId={p.user_id}
                              size="md"
                              className="h-10 w-10 shrink-0 text-sm"
                            />

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc] truncate">{p.name}</span>
                                {p.registration_verified && (
                                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#16804d] dark:text-[#2ea043]" />
                                )}
                                {p.is_founding_member && (
                                  <Crown className="h-3.5 w-3.5 shrink-0 text-amber-500 fill-amber-500" />
                                )}
                              </div>

                              <p className="text-[11px] text-[#5d5854] dark:text-[#8b949e] truncate">
                                {p.designation || p.specialization || p.profession || "Healthcare Professional"}
                                {p.organization ? ` • ${p.organization}` : ""}
                              </p>

                              <div className="flex items-center gap-2 mt-0.5">
                                {p.member_id && (
                                  <MemberBadge
                                    memberId={p.member_id}
                                    isFoundingMember={p.is_founding_member}
                                    size="xs"
                                    showCopy={false}
                                  />
                                )}
                                {p.city && (
                                  <span className="text-[10px] text-[#8a8784] dark:text-[#8b949e] flex items-center gap-0.5">
                                    <MapPin className="h-2.5 w-2.5" />
                                    {p.city}
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. JOBS RESULTS */}
                {(activeTab === "all" || activeTab === "jobs") && results.jobs.length > 0 && (
                  <div className="space-y-2 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <Briefcase className="size-3.5" />
                        <span>Opportunities & Jobs ({results.jobs.length})</span>
                      </span>
                      <Link
                        href={`/opportunities?query=${encodeURIComponent(query)}`}
                        onClick={() => {
                          setIsOpen(false);
                          saveRecentSearch(query);
                          onCloseMobile?.();
                        }}
                        className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-0.5"
                      >
                        <span>View All</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>

                    <div className="space-y-1.5">
                      {results.jobs.map((job) => (
                        <Link
                          key={job.id}
                          href={`/opportunities/jobs/${job.id}`}
                          onClick={() => {
                            setIsOpen(false);
                            saveRecentSearch(query);
                            onCloseMobile?.();
                          }}
                          className="flex items-center gap-3 rounded-2xl border border-transparent p-2.5 transition hover:border-emerald-200 dark:hover:border-emerald-800/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold">
                            <Briefcase className="h-5 w-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc] truncate">{job.title}</p>
                            <p className="text-[11px] text-[#5d5854] dark:text-[#8b949e] truncate">
                              {job.organization_name || "Healthcare Institution"}
                              {job.location || job.city ? ` • ${job.city || job.location}` : ""}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {job.employment_type && (
                                <span className="rounded-full bg-emerald-100/80 dark:bg-emerald-950/60 px-2 py-0.2 text-[9px] font-bold text-emerald-800 dark:text-emerald-300">
                                  {job.employment_type}
                                </span>
                              )}
                              {job.opportunity_type && (
                                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.2 text-[9px] font-medium text-slate-700 dark:text-slate-300">
                                  {job.opportunity_type}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. COURSES RESULTS */}
                {(activeTab === "all" || activeTab === "courses") && results.courses.length > 0 && (
                  <div className="space-y-2 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                        <GraduationCap className="size-3.5" />
                        <span>Courses & CME ({results.courses.length})</span>
                      </span>
                      <Link
                        href={`/learn?q=${encodeURIComponent(query)}`}
                        onClick={() => {
                          setIsOpen(false);
                          saveRecentSearch(query);
                          onCloseMobile?.();
                        }}
                        className="text-[11px] font-bold text-purple-700 dark:text-purple-400 hover:underline inline-flex items-center gap-0.5"
                      >
                        <span>View All</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>

                    <div className="space-y-1.5">
                      {results.courses.map((c) => (
                        <Link
                          key={c.id}
                          href={`/learn/course/${c.slug || c.id}`}
                          onClick={() => {
                            setIsOpen(false);
                            saveRecentSearch(query);
                            onCloseMobile?.();
                          }}
                          className="flex items-center gap-3 rounded-2xl border border-transparent p-2.5 transition hover:border-purple-200 dark:hover:border-purple-800/50 hover:bg-purple-50/50 dark:hover:bg-purple-950/20"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 font-bold overflow-hidden">
                            {c.thumbnail ? (
                              <img src={c.thumbnail} alt={c.title} className="h-full w-full object-cover" />
                            ) : (
                              <GraduationCap className="h-5 w-5" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc] truncate">{c.title}</p>
                            <p className="text-[11px] text-[#5d5854] dark:text-[#8b949e] truncate">
                              {c.category || "Clinical Medicine"}
                              {c.level ? ` • ${c.level}` : ""}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="rounded-full bg-purple-100 dark:bg-purple-950/60 px-2 py-0.2 text-[9px] font-bold text-purple-800 dark:text-purple-300">
                                {c.is_free ? "Free" : "CME Certified"}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. COMMUNITIES RESULTS */}
                {(activeTab === "all" || activeTab === "communities") && results.communities.length > 0 && (
                  <div className="space-y-2 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                        <Compass className="size-3.5" />
                        <span>Medical Circles ({results.communities.length})</span>
                      </span>
                      <Link
                        href={`/network/communities?q=${encodeURIComponent(query)}`}
                        onClick={() => {
                          setIsOpen(false);
                          saveRecentSearch(query);
                          onCloseMobile?.();
                        }}
                        className="text-[11px] font-bold text-amber-800 dark:text-amber-400 hover:underline inline-flex items-center gap-0.5"
                      >
                        <span>View All</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>

                    <div className="space-y-1.5">
                      {results.communities.map((comm) => (
                        <Link
                          key={comm.id}
                          href={`/network/communities/${comm.slug}`}
                          onClick={() => {
                            setIsOpen(false);
                            saveRecentSearch(query);
                            onCloseMobile?.();
                          }}
                          className="flex items-center gap-3 rounded-2xl border border-transparent p-2.5 transition hover:border-amber-200 dark:hover:border-amber-800/50 hover:bg-amber-50/50 dark:hover:bg-amber-950/20"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold">
                            <Compass className="h-5 w-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc] truncate">{comm.name}</p>
                            <p className="text-[11px] text-[#5d5854] dark:text-[#8b949e] truncate">
                              {comm.specialty || comm.description || "Medical Group"}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-[#8a8784] dark:text-[#8b949e]">
                                {comm.member_count || 0} members
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Search Action */}
          {query.trim() && (
            <div className="border-t border-[#f0efee] dark:border-[#21262d] bg-[#fcfbf9] dark:bg-[#1c2128] px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-[#77716b] dark:text-[#8b949e]">
                Press <kbd className="rounded border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#21262d] px-1 py-0.5 font-mono text-[10px] text-[#171717] dark:text-[#f0f6fc]">Enter ↵</kbd> to view full results
              </span>
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:underline cursor-pointer"
              >
                <span>Search all results for &ldquo;{query}&rdquo;</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
