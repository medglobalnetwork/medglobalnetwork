"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Award,
  BookOpen,
  Bone,
  Brain,
  CheckCircle2,
  Clock,
  Compass,
  GraduationCap,
  HeartPulse,
  PlayCircle,
  PlusCircle,
  Search,
  Sparkles,
  Stethoscope,
  Users,
  Video,
  Calendar,
  ShieldCheck,
  ChevronRight,
  FolderHeart,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { CourseCard } from "@/modules/learn/components/CourseCard";
import {
  Course,
  CourseEnrollment,
  LearningPath,
  LiveSession,
  InstructorProfile,
} from "@/modules/learn/types";

export default function LearnPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [recommendedCourses, setRecommendedCourses] = React.useState<Course[]>([]);
  const [popularCourses, setPopularCourses] = React.useState<Course[]>([]);
  const [continueLearning, setContinueLearning] = React.useState<CourseEnrollment[]>([]);
  const [learningPaths, setLearningPaths] = React.useState<LearningPath[]>([]);
  const [liveSessions, setLiveSessions] = React.useState<LiveSession[]>([]);
  const [instructors, setInstructors] = React.useState<InstructorProfile[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeSpecialty, setActiveSpecialty] = React.useState<string>("All");
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!isPending && !session) router.replace("/");
  }, [isPending, router, session]);

  React.useEffect(() => {
    if (!session?.user) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [recRes, popRes, myRes, pathsRes, liveRes, instRes] = await Promise.all([
          fetch("/api/learn/courses?recommended=true&pageSize=6"),
          fetch("/api/learn/courses?sort=popular&pageSize=8"),
          fetch("/api/learn/my-learning"),
          fetch("/api/learn/paths"),
          fetch("/api/learn/live-sessions"),
          fetch("/api/learn/instructors?limit=4"),
        ]);

        if (recRes.ok) {
          const d = await recRes.json();
          if (Array.isArray(d.courses)) setRecommendedCourses(d.courses);
        }

        if (popRes.ok) {
          const d = await popRes.json();
          if (Array.isArray(d.courses)) setPopularCourses(d.courses);
        }

        if (myRes.ok) {
          const d = await myRes.json();
          if (Array.isArray(d.inProgress)) setContinueLearning(d.inProgress);
        }

        if (pathsRes.ok) {
          const d = await pathsRes.json();
          if (Array.isArray(d.paths)) setLearningPaths(d.paths);
        }

        if (liveRes.ok) {
          const d = await liveRes.json();
          if (Array.isArray(d.sessions)) setLiveSessions(d.sessions);
        }

        if (instRes.ok) {
          const d = await instRes.json();
          if (Array.isArray(d.instructors)) setInstructors(d.instructors);
        }
      } catch (err) {
        console.error("Failed to load learn data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [session?.user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/learn/explore?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleOpenAskAI = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("open-mgn-ask-ai", {
          detail: { specialty: activeSpecialty !== "All" ? activeSpecialty : undefined },
        })
      );
    }
  };

  const quickFilterQueries = [
    { label: "12-Lead ECG", query: "ECG" },
    { label: "ACL Rehab", query: "ACL" },
    { label: "POCUS Ultrasound", query: "POCUS" },
    { label: "Ventilation", query: "Ventilation" },
    { label: "Antimicrobial", query: "Antimicrobial" },
    { label: "Arthroscopy", query: "Arthroscopy" },
  ];

  const specialties = [
    { name: "All", icon: Sparkles },
    { name: "Cardiology", icon: HeartPulse },
    { name: "Physiotherapy", icon: Activity },
    { name: "Medicine", icon: Stethoscope },
    { name: "Orthopedics", icon: Bone },
    { name: "Neurology", icon: Brain },
    { name: "Critical Care", icon: HeartPulse },
  ];

  const displayedCourses = React.useMemo(() => {
    const pool = popularCourses.length > 0 ? popularCourses : recommendedCourses;
    if (activeSpecialty === "All") return pool;
    return pool.filter(
      (c) =>
        c.category?.toLowerCase() === activeSpecialty.toLowerCase() ||
        c.specialization?.toLowerCase() === activeSpecialty.toLowerCase()
    );
  }, [popularCourses, recommendedCourses, activeSpecialty]);

  if (isPending || !session) {
    return (
      <main className="min-h-dvh bg-[#faf9f8] dark:bg-[#0d1117] p-6">
        <div className="mx-auto max-w-7xl space-y-6 animate-pulse">
          <div className="h-48 rounded-3xl bg-[#e8e6e3] dark:bg-[#21262d]" />
          <div className="h-28 rounded-2xl bg-[#e8e6e3] dark:bg-[#21262d]" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="h-64 rounded-2xl bg-[#e8e6e3] dark:bg-[#21262d]" />
            <div className="h-64 rounded-2xl bg-[#e8e6e3] dark:bg-[#21262d]" />
            <div className="h-64 rounded-2xl bg-[#e8e6e3] dark:bg-[#21262d]" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-dvh bg-[#faf9f8] dark:bg-[#0d1117] pb-24 text-[#171717] dark:text-[#f0f6fc]">
      {/* ============================================================= */}
      {/* 1. HERO SEARCH & ACCREDITATION BANNER                          */}
      {/* ============================================================= */}
      <section className="relative overflow-hidden border-b border-[#e8e6e3] dark:border-[#30363d] bg-gradient-to-br from-[#0a2540] via-[#0f4c81] to-[#1769c2] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_60%)] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 size-96 rounded-full bg-blue-400/15 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="max-w-3xl space-y-4">
            {/* Live Trust Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md shadow-2xs">
                <Sparkles className="size-3.5 text-amber-300" /> Professional Healthcare Development
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-bold text-emerald-200 border border-emerald-400/30">
                <ShieldCheck className="size-3.5" /> Verified Medical Faculty
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-white/90">
                <GraduationCap className="size-3.5" /> Verifiable CME Credentials
              </span>
            </div>

            <h1 className="text-2xl font-black text-white sm:text-4xl lg:text-5xl leading-tight text-balance">
              Healthcare Learning & Professional Mastery
            </h1>
            <p className="text-xs text-white/85 sm:text-sm max-w-2xl leading-relaxed text-pretty">
              Evidence-based clinical masterclasses, structured learning tracks, and accredited digital credentials curated by verified medical specialists.
            </p>

            {/* Global Search Bar */}
            <form onSubmit={handleSearch} className="pt-2">
              <div className="relative flex items-center rounded-2xl bg-white p-1.5 shadow-xl ring-1 ring-black/10 transition-all focus-within:ring-2 focus-within:ring-white">
                <Search className="size-5 text-[#8a8784] ml-3 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search masterclasses e.g. '12-Lead ECG', 'ACL Rehab', 'POCUS', 'Ventilation'..."
                  className="h-11 w-full bg-transparent px-3 text-xs text-[#171717] placeholder:text-[#8a8784] focus:outline-none sm:text-sm"
                />
                <button
                  type="submit"
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#0f4c81] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#0c3c66] cursor-pointer"
                >
                  <span>Explore</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </form>

            {/* Quick Query Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
              <span className="text-white/60 font-medium">Quick Topics:</span>
              {quickFilterQueries.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() =>
                    router.push(`/learn/explore?query=${encodeURIComponent(item.query)}`)
                  }
                  className="rounded-lg bg-white/10 px-2.5 py-1 text-white hover:bg-white/20 transition backdrop-blur-xs font-medium cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Action Navigation Bar */}
          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-white/15 pt-5 text-xs">
            <Link
              href="/learn/explore"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-4 py-2 font-bold text-white hover:bg-white/25 transition backdrop-blur-xs shadow-xs"
            >
              <Compass className="size-4" />
              <span>Explore Catalog</span>
            </Link>

            <Link
              href="/learn/my-box"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 font-bold text-white/90 hover:bg-white/20 hover:text-white transition"
            >
              <FolderHeart className="size-4" />
              <span>My Box</span>
            </Link>

            <button
              type="button"
              onClick={handleOpenAskAI}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 text-[#171717] px-4 py-2 font-bold hover:brightness-105 transition shadow-xs cursor-pointer"
            >
              <Sparkles className="size-4 text-[#171717]" />
              <span>Ask Medical AI</span>
            </button>

            <Link
              href="/learn/instructor"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 font-medium text-white/80 hover:bg-white/20 transition ml-auto"
            >
              <PlusCircle className="size-3.5" />
              <span>Teach on MGN</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
        {/* ============================================================= */}
        {/* 2. CONTINUE LEARNING (Real Active Enrollments)                */}
        {/* ============================================================= */}
        {continueLearning.length > 0 && (
          <section
            aria-label="Continue Learning"
            className="rounded-3xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 sm:p-6 shadow-xs"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-[#eef5fc] dark:bg-[#1c2433] text-[#0f4c81] dark:text-[#58a6ff]">
                  <PlayCircle className="size-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">
                    Continue Learning
                  </h2>
                  <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
                    Pick up right where you left off
                  </p>
                </div>
              </div>
              <Link
                href="/learn/my-box"
                className="text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:underline flex items-center gap-1"
              >
                <span>View My Box ({continueLearning.length})</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {continueLearning.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={() =>
                    router.push(
                      item.last_lesson_id
                        ? `/learn/lesson/${item.last_lesson_id}`
                        : `/learn/course/${item.course_id}`
                    )
                  }
                  className="group flex cursor-pointer flex-col justify-between rounded-2xl border border-[#e8e6e3] dark:border-[#30363d] bg-[#fcfbf9] dark:bg-[#1c2128] p-4 transition-all hover:border-[#0f4c81] hover:bg-white dark:hover:bg-[#21262d] hover:shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-[#eef5fc] dark:bg-[#1c2433] px-2.5 py-0.5 text-[10px] font-bold text-[#0f4c81] dark:text-[#58a6ff]">
                        {item.course?.category || "Medical"}
                      </span>
                      <span className="text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff]">
                        {item.progress_percentage}% completed
                      </span>
                    </div>

                    <h3 className="mt-2.5 text-sm font-bold text-[#171717] dark:text-[#f0f6fc] group-hover:text-[#0f4c81] dark:group-hover:text-[#58a6ff] line-clamp-1">
                      {item.course?.title}
                    </h3>
                    <p className="text-xs text-[#77716b] dark:text-[#8b949e] truncate mt-0.5">
                      Faculty: {item.course?.instructor?.name || "Senior Faculty"}
                    </p>
                  </div>

                  <div className="mt-4">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e8e6e3] dark:bg-[#30363d]">
                      <div
                        className="h-full rounded-full bg-[#0f4c81] dark:bg-[#58a6ff] transition-all"
                        style={{ width: `${item.progress_percentage}%` }}
                      />
                    </div>
                    <button
                      type="button"
                      className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#eef5fc] dark:bg-[#1c2433] py-2 text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff] group-hover:bg-[#0f4c81] group-hover:text-white dark:group-hover:bg-[#1f6feb] transition cursor-pointer"
                    >
                      <PlayCircle className="size-4" />
                      <span>Resume Masterclass</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ============================================================= */}
        {/* 3. STRUCTURED LEARNING PATHS (Clinical Tracks)               */}
        {/* ============================================================= */}
        {learningPaths.length > 0 && (
          <section aria-label="Learning Paths" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-[#171717] dark:text-[#f0f6fc]">
                  Curated Healthcare Learning Paths
                </h2>
                <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
                  Structured sequential masterclass tracks designed for clinical mastery
                </p>
              </div>
              <Link
                href="/learn/explore"
                className="text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:underline flex items-center gap-1 self-start sm:self-center"
              >
                <span>View all tracks</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {learningPaths.map((path) => (
                <div
                  key={path.id}
                  onClick={() => router.push(`/learn/explore?category=${encodeURIComponent(path.category)}`)}
                  className="group flex flex-col justify-between rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-4 shadow-2xs hover:border-[#0f4c81] hover:shadow-md transition cursor-pointer"
                >
                  <div>
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-[#f0efee] dark:bg-[#21262d] mb-3">
                      {path.thumbnail ? (
                        <img
                          src={path.thumbnail}
                          alt={path.title}
                          className="size-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center bg-gradient-to-tr from-[#0f4c81]/10 to-[#1769c2]/20">
                          <GraduationCap className="size-8 text-[#0f4c81]" />
                        </div>
                      )}
                      <span className="absolute top-2 left-2 rounded-full bg-white/90 dark:bg-[#161b22]/90 backdrop-blur-xs px-2 py-0.5 text-[9px] font-bold text-[#0f4c81] dark:text-[#58a6ff] shadow-2xs">
                        {path.category}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc] group-hover:text-[#0f4c81] dark:group-hover:text-[#58a6ff] line-clamp-2 leading-snug">
                      {path.title}
                    </h3>
                    <p className="mt-1 text-xs text-[#77716b] dark:text-[#8b949e] line-clamp-2 leading-relaxed">
                      {path.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#f0efee] dark:border-[#21262d] flex items-center justify-between text-[11px] text-[#77716b] dark:text-[#8b949e]">
                    <span>{path.course_count} Modules · {path.duration_hours}h</span>
                    <span className="font-bold text-[#0f4c81] dark:text-[#58a6ff] flex items-center gap-0.5">
                      Explore <ArrowRight className="size-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ============================================================= */}
        {/* 4. LIVE CLINICAL WEBINARS & ROUNDS                           */}
        {/* ============================================================= */}
        {liveSessions.length > 0 && (
          <section aria-label="Live Sessions" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-rose-500 animate-ping" />
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-[#171717] dark:text-[#f0f6fc]">
                    Live Clinical Sessions & Case Rounds
                  </h2>
                  <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
                    Interactive real-time clinical rounds and faculty Q&A
                  </p>
                </div>
              </div>
              <Link
                href="/learn/live"
                className="text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:underline flex items-center gap-1 self-start sm:self-center"
              >
                <span>Live Classroom Hub</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {liveSessions.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row gap-4 rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-4 shadow-2xs hover:border-[#0f4c81] transition"
                >
                  <div className="relative aspect-video sm:w-48 sm:aspect-[4/3] rounded-xl overflow-hidden bg-[#f0efee] dark:bg-[#21262d] shrink-0">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-[#eef5fc] dark:bg-[#1c2433]">
                        <Video className="size-8 text-[#0f4c81]" />
                      </div>
                    )}
                    <span className="absolute top-2 left-2 rounded-full bg-rose-600 px-2 py-0.5 text-[9px] font-bold text-white shadow-2xs">
                      {item.status === "live" ? "ON AIR" : "Live Class"}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] text-[#77716b] dark:text-[#8b949e]">
                        <Calendar className="size-3.5" />
                        <span>
                          {new Date(item.scheduled_at).toLocaleDateString("en-IN", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span>· {item.duration_minutes}m</span>
                      </div>

                      <h3 className="mt-1 text-sm font-bold text-[#171717] dark:text-[#f0f6fc] line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs text-[#77716b] dark:text-[#8b949e] line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#f0efee] dark:border-[#21262d] flex items-center justify-between">
                      <div className="text-[11px] font-semibold text-[#5d5854] dark:text-[#8b949e]">
                        Faculty: {item.instructor?.name || "Medical Faculty"}
                      </div>
                      {item.status === "live" || item.user_registered ? (
                        <Link
                          href={`/learn/live/${item.id}`}
                          className="rounded-xl bg-[#0f4c81] dark:bg-[#1f6feb] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#0c3c66] transition"
                        >
                          Join Live
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={async () => {
                            await fetch("/api/learn/live-sessions", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ sessionId: item.id }),
                            });
                            alert("Registered for live session!");
                            router.push(`/learn/live/${item.id}`);
                          }}
                          className="rounded-xl bg-[#0f4c81] dark:bg-[#1f6feb] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#0c3c66] transition cursor-pointer"
                        >
                          Reserve Seat
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ============================================================= */}
        {/* 5. EXPLORE BY SPECIALTY (Fast Discovery Pills)               */}
        {/* ============================================================= */}
        <section aria-label="Specialty Filter" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black text-[#171717] dark:text-[#f0f6fc]">
              Explore Clinical Disciplines
            </h2>
            <Link
              href="/learn/explore"
              className="text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:underline"
            >
              Multi-filter explore →
            </Link>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {specialties.map((spec) => {
              const Icon = spec.icon;
              const isActive = activeSpecialty === spec.name;
              return (
                <button
                  key={spec.name}
                  type="button"
                  onClick={() => setActiveSpecialty(spec.name)}
                  className={`shrink-0 inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? "border-[#0f4c81] bg-[#0f4c81] text-white shadow-xs"
                      : "border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] text-[#5d5854] dark:text-[#8b949e] hover:border-[#0f4c81]"
                  }`}
                >
                  <Icon className="size-4" />
                  <span>{spec.name}</span>
                </button>
              );
            })}
          </div>

          {/* Courses Grid */}
          {displayedCourses.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4 pt-2">
              {displayedCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-8 text-center">
              <BookOpen className="size-10 mx-auto text-[#8a8784] mb-2" />
              <h3 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">
                No courses published in this specialty yet
              </h3>
              <p className="text-xs text-[#77716b] dark:text-[#8b949e] mt-1 max-w-sm mx-auto">
                Check back soon or explore our other clinical categories.
              </p>
              <button
                type="button"
                onClick={() => setActiveSpecialty("All")}
                className="mt-4 rounded-xl bg-[#0f4c81] px-4 py-2 text-xs font-bold text-white cursor-pointer"
              >
                View All Courses
              </button>
            </div>
          )}
        </section>

        {/* ============================================================= */}
        {/* 6. VERIFIED MEDICAL INSTRUCTORS & FACULTY                     */}
        {/* ============================================================= */}
        {instructors.length > 0 && (
          <section aria-label="Verified Faculty" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-[#171717] dark:text-[#f0f6fc]">
                  Verified Clinical Faculty
                </h2>
                <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
                  Learn directly from accredited hospital consultants and department chairs
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {instructors.map((inst) => (
                <div
                  key={inst.id}
                  className="flex flex-col items-center text-center rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 shadow-2xs hover:border-[#0f4c81] transition"
                >
                  <div className="size-16 rounded-full overflow-hidden bg-[#eef5fc] dark:bg-[#1c2433] flex items-center justify-center font-bold text-[#0f4c81] dark:text-[#58a6ff] text-base border-2 border-white dark:border-[#30363d] shadow-xs">
                    {inst.image ? (
                      <img src={inst.image} alt={inst.name} className="size-full object-cover" />
                    ) : (
                      inst.name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-[#171717] dark:text-[#f0f6fc] flex items-center gap-1 justify-center">
                    {inst.name}
                    <ShieldCheck className="size-3.5 text-[#16804d] dark:text-[#2ea043] shrink-0" />
                  </h3>
                  <p className="text-[11px] font-semibold text-[#0f4c81] dark:text-[#58a6ff] mt-0.5">
                    {inst.designation || inst.profession}
                  </p>
                  <p className="text-[10px] text-[#77716b] dark:text-[#8b949e] truncate max-w-[200px]">
                    {inst.organization || "Medical Faculty"}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
