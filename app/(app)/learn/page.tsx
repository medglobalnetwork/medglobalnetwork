"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  FileText,
  Flame,
  GraduationCap,
  HeartPulse,
  Layers,
  MessageSquare,
  PlayCircle,
  Plus,
  Radio,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Target,
  Users,
  Video,
  ChevronRight,
  ExternalLink,
  Bookmark,
  Share2,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { CourseCard } from "@/modules/learn/components/CourseCard";
import { StudentNavHeader } from "@/modules/learn/components/StudentNavHeader";
import {
  Course,
  CourseEnrollment,
  LiveSession,
  WeakTopicRecord,
  StudentNoteItem,
  BookItem,
  MindMapItem,
  RecommendationFeedSection,
} from "@/modules/learn/types";

export default function StudentDashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [continueLearning, setContinueLearning] = React.useState<CourseEnrollment[]>([]);
  const [recommendations, setRecommendations] = React.useState<RecommendationFeedSection[]>([]);
  const [upcomingLectures, setUpcomingLectures] = React.useState<LiveSession[]>([]);
  const [weakTopics, setWeakTopics] = React.useState<WeakTopicRecord[]>([]);
  const [recentBooks, setRecentBooks] = React.useState<BookItem[]>([]);
  const [recentMindMaps, setRecentMindMaps] = React.useState<MindMapItem[]>([]);
  const [communityNotes, setCommunityNotes] = React.useState<StudentNoteItem[]>([]);
  const [enrolledSummary, setEnrolledSummary] = React.useState({
    in_progress_count: 0,
    completed_count: 0,
    total_enrolled: 0,
    average_progress: 0,
    learning_streak_days: 0,
  });

  const [searchQuery, setSearchQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!isPending && !session) router.replace("/");
  }, [isPending, router, session]);

  React.useEffect(() => {
    if (!session?.user) return;

    const loadDashboard = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/learn/dashboard");
        if (res.ok) {
          const data = await res.json();
          setContinueLearning(data.continue_learning || []);
          setRecommendations(data.recommendations || []);
          setUpcomingLectures(data.upcoming_lectures || []);
          setWeakTopics(data.weak_topics || []);
          setRecentBooks(data.recent_resources?.books || []);
          setRecentMindMaps(data.recent_resources?.mind_maps || []);
          setCommunityNotes(data.community_notes || []);
          if (data.enrolled_summary) setEnrolledSummary(data.enrolled_summary);
        }
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, [session?.user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/learn/explore?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleOpenAskAI = (contextText?: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("open-mgn-ask-ai", {
          detail: contextText ? { selectedText: contextText } : undefined,
        })
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f8] dark:bg-[#0d1117] text-[#171717] dark:text-[#f0f6fc] pb-24">
      <StudentNavHeader activeTab="dashboard" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* ───────────────────────────────────────────── */}
        {/* WELCOME & LEARNING-FIRST HERO */}
        {/* ───────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-[#0f4c81] via-[#155e9c] to-[#1c6eb8] dark:from-[#112233] dark:via-[#162f4a] dark:to-[#1a3b5c] rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
            <Brain className="size-64 text-white" />
          </div>

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold text-white">
              <Sparkles className="size-3.5 text-amber-300" />
              <span>Personalized Medical Learning Home</span>
              {enrolledSummary.learning_streak_days > 0 && (
                <span className="flex items-center gap-1 ml-2 text-amber-300 font-bold">
                  <Flame className="size-3.5 fill-amber-300" /> {enrolledSummary.learning_streak_days} Day Streak
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, {session?.user?.name?.split(" ")[0] || "Scholar"} 👋
            </h1>

            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              Resume your active coursework, tackle adaptive clinical MCQs, explore verified mind maps, and discuss medical notes with your peers.
            </p>

            {/* Quick Global Search Bar */}
            <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-lg pt-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#77716b]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses, clinical topics, mind maps, or questions..."
                  className="w-full bg-white text-[#171717] pl-10 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium placeholder:text-[#9c958f] shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-[#0f4c81] font-bold text-xs sm:text-sm rounded-2xl transition shrink-0 cursor-pointer shadow-sm"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* ───────────────────────────────────────────── */}
        {/* QUICK NAVIGATION TILES */}
        {/* ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href="/learn/my-learning"
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] hover:border-[#0f4c81] dark:hover:border-[#58a6ff] hover:shadow-sm transition group"
          >
            <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#0f4c81] dark:text-[#58a6ff] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <GraduationCap className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate text-[#171717] dark:text-[#f0f6fc]">My Learning</p>
              <p className="text-[10px] text-[#77716b] dark:text-[#8b949e]">{enrolledSummary.total_enrolled} enrolled</p>
            </div>
          </Link>

          <Link
            href="/learn/practice"
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] hover:border-[#0f4c81] dark:hover:border-[#58a6ff] hover:shadow-sm transition group"
          >
            <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <CheckCircle2 className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate text-[#171717] dark:text-[#f0f6fc]">MCQ Practice</p>
              <p className="text-[10px] text-[#77716b] dark:text-[#8b949e]">Adaptive & Mocks</p>
            </div>
          </Link>

          <Link
            href="/learn/mind-maps"
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] hover:border-[#0f4c81] dark:hover:border-[#58a6ff] hover:shadow-sm transition group"
          >
            <div className="size-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <Brain className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate text-[#171717] dark:text-[#f0f6fc]">Mind Maps</p>
              <p className="text-[10px] text-[#77716b] dark:text-[#8b949e]">Interactive Trees</p>
            </div>
          </Link>

          <Link
            href="/learn/books"
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] hover:border-[#0f4c81] dark:hover:border-[#58a6ff] hover:shadow-sm transition group"
          >
            <div className="size-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <BookOpen className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate text-[#171717] dark:text-[#f0f6fc]">Medical Books</p>
              <p className="text-[10px] text-[#77716b] dark:text-[#8b949e]">Free & Licensed</p>
            </div>
          </Link>

          <Link
            href="/learn/notes"
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] hover:border-[#0f4c81] dark:hover:border-[#58a6ff] hover:shadow-sm transition group"
          >
            <div className="size-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <FileText className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate text-[#171717] dark:text-[#f0f6fc]">Notes & Shared</p>
              <p className="text-[10px] text-[#77716b] dark:text-[#8b949e]">Study Feed</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => handleOpenAskAI()}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-tr from-[#0f4c81]/10 to-[#1769c2]/10 dark:from-[#0f4c81]/30 dark:to-[#1769c2]/30 border border-[#0f4c81]/30 dark:border-[#58a6ff]/40 hover:shadow-sm transition group text-left cursor-pointer"
          >
            <div className="size-10 rounded-xl bg-gradient-to-tr from-[#0f4c81] to-[#1769c2] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <Sparkles className="size-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate text-[#0f4c81] dark:text-[#58a6ff]">Ask AI</p>
              <p className="text-[10px] text-[#77716b] dark:text-[#8b949e]">Medical Assistant</p>
            </div>
          </button>
        </div>

        {/* ───────────────────────────────────────────── */}
        {/* 1. CONTINUE LEARNING SECTION */}
        {/* ───────────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PlayCircle className="size-5 text-[#0f4c81] dark:text-[#58a6ff]" />
              <h2 className="text-lg font-bold text-[#171717] dark:text-[#f0f6fc]">
                Continue Learning
              </h2>
            </div>
            <Link
              href="/learn/my-learning"
              className="text-xs font-semibold text-[#0f4c81] dark:text-[#58a6ff] hover:underline flex items-center gap-1"
            >
              View all enrolled <ChevronRight className="size-3.5" />
            </Link>
          </div>

          {continueLearning.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {continueLearning.slice(0, 3).map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-2xl p-4 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0f4c81] dark:text-[#58a6ff]">
                        {enrollment.course?.category || "Medical"}
                      </span>
                      <span className="text-[11px] font-bold text-[#16804d] dark:text-[#2ea043]">
                        {enrollment.progress_percentage}% completed
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc] line-clamp-1">
                      {enrollment.course?.title || "Enrolled Course"}
                    </h3>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#f0efee] dark:bg-[#21262d] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#0f4c81] dark:bg-[#58a6ff] h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(enrollment.progress_percentage, 5)}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-4 mt-2 border-t border-[#f0efee] dark:border-[#21262d] flex items-center justify-between">
                    <span className="text-[11px] text-[#77716b] dark:text-[#8b949e]">
                      {enrollment.last_accessed_at ? "Recently accessed" : "Resume lesson"}
                    </span>
                    <Link
                      href={
                        enrollment.last_lesson_id
                          ? `/learn/lesson/${enrollment.last_lesson_id}`
                          : `/learn/course/${enrollment.course_id}`
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0f4c81] hover:bg-[#0d3f6c] text-white text-xs font-bold transition shadow-xs"
                    >
                      Continue <ArrowRight className="size-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-2xl p-8 text-center space-y-3">
              <div className="size-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-[#0f4c81] dark:text-[#58a6ff] flex items-center justify-center mx-auto">
                <BookOpen className="size-6" />
              </div>
              <h3 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">
                No Active Courses Yet
              </h3>
              <p className="text-xs text-[#77716b] dark:text-[#8b949e] max-w-md mx-auto">
                Start learning by exploring verified courses, clinical lecture series, and structured learning paths created by medical educators.
              </p>
              <Link
                href="/learn/explore"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0f4c81] hover:bg-[#0d3f6c] text-white text-xs font-bold transition shadow-xs mt-2"
              >
                Explore Courses <ArrowRight className="size-3.5" />
              </Link>
            </div>
          )}
        </section>

        {/* ───────────────────────────────────────────── */}
        {/* 2. ADAPTIVE WEAK TOPICS ALERT (IF ANY) */}
        {/* ───────────────────────────────────────────── */}
        {weakTopics.length > 0 && (
          <section className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-rose-950/30 border border-amber-300/40 dark:border-amber-700/40 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="size-5 text-amber-600 dark:text-amber-400" />
                <h2 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">
                  Adaptive Focus: Strengthen Weak Areas
                </h2>
              </div>
              <Link
                href="/learn/practice?tab=weak_areas"
                className="text-xs font-bold text-amber-700 dark:text-amber-300 hover:underline"
              >
                View full breakdown →
              </Link>
            </div>

            <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
              Based on your actual MCQ attempts, our system identified areas where accuracy is below 65%. Here are targeted remediation resources:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {weakTopics.slice(0, 2).map((topic, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc]">
                      {topic.subject} → {topic.topic}
                    </span>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                      {topic.accuracy}% accuracy
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {topic.recommendations?.mind_map_id && (
                      <Link
                        href={`/learn/mind-maps?id=${topic.recommendations.mind_map_id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-[11px] font-semibold hover:bg-purple-100 transition"
                      >
                        🧠 View Mind Map
                      </Link>
                    )}
                    <Link
                      href={`/learn/practice?subject=${encodeURIComponent(topic.subject)}&topic=${encodeURIComponent(topic.topic)}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold hover:bg-emerald-100 transition"
                    >
                      📝 20 MCQ Practice
                    </Link>
                    <Link
                      href={`/learn/notes?topic=${encodeURIComponent(topic.topic)}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-[11px] font-semibold hover:bg-blue-100 transition"
                    >
                      📚 Revision Notes
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ───────────────────────────────────────────── */}
        {/* 3. UPCOMING LECTURES & LIVE CLASSES */}
        {/* ───────────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="size-5 text-rose-600 dark:text-rose-400 animate-pulse" />
              <h2 className="text-lg font-bold text-[#171717] dark:text-[#f0f6fc]">
                Upcoming Lectures & Live Classes
              </h2>
            </div>
            <Link
              href="/learn/calendar"
              className="text-xs font-semibold text-[#0f4c81] dark:text-[#58a6ff] hover:underline flex items-center gap-1"
            >
              Full Schedule <ChevronRight className="size-3.5" />
            </Link>
          </div>

          {upcomingLectures.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingLectures.map((session) => (
                <div
                  key={session.id}
                  className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-2xl p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-[10px] font-extrabold uppercase">
                        <Radio className="size-3" /> Live Class
                      </span>
                      <span className="text-[11px] text-[#77716b] dark:text-[#8b949e] flex items-center gap-1">
                        <Clock className="size-3" /> {session.duration_minutes} min
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc] line-clamp-2">
                      {session.title}
                    </h3>
                    <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
                      {new Date(session.scheduled_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#f0efee] dark:border-[#21262d] flex items-center justify-between">
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      Registration Open
                    </span>
                    <Link
                      href={`/learn/live/${session.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0f4c81] hover:bg-[#0d3f6c] text-white text-xs font-bold transition"
                    >
                      Join Class
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-2xl p-6 text-center">
              <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
                No upcoming live classes scheduled for today. Check the central learning calendar for upcoming webinars and faculty rounds.
              </p>
            </div>
          )}
        </section>

        {/* ───────────────────────────────────────────── */}
        {/* 4. RECOMMENDATION ENGINE FEED */}
        {/* ───────────────────────────────────────────── */}
        {recommendations.map((section, idx) => (
          <section key={idx} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#171717] dark:text-[#f0f6fc]">
                  {section.title}
                </h2>
                {section.subtitle && (
                  <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
                    {section.subtitle}
                  </p>
                )}
              </div>
              <Link
                href="/learn/explore"
                className="text-xs font-semibold text-[#0f4c81] dark:text-[#58a6ff] hover:underline flex items-center gap-1"
              >
                Explore More <ChevronRight className="size-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {section.items.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </section>
        ))}

        {/* ───────────────────────────────────────────── */}
        {/* 5. VERIFIED COMMUNITY SHARED NOTES FEED */}
        {/* ───────────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="size-5 text-[#0f4c81] dark:text-[#58a6ff]" />
              <h2 className="text-lg font-bold text-[#171717] dark:text-[#f0f6fc]">
                Study Community & Shared Notes
              </h2>
            </div>
            <Link
              href="/learn/notes?tab=shared"
              className="text-xs font-semibold text-[#0f4c81] dark:text-[#58a6ff] hover:underline flex items-center gap-1"
            >
              Browse all notes <ChevronRight className="size-3.5" />
            </Link>
          </div>

          {communityNotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {communityNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-2xl p-5 shadow-2xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300">
                        {note.note_type}
                      </span>
                      <span className="text-[11px] text-[#77716b] dark:text-[#8b949e]">
                        {note.subject || "Clinical"}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc] line-clamp-1">
                      {note.title}
                    </h3>
                    <p className="text-xs text-[#5d5854] dark:text-[#8b949e] line-clamp-2">
                      {note.content}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#f0efee] dark:border-[#21262d] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-[#77716b] dark:text-[#8b949e]">
                      <ShieldCheck className="size-3.5 text-blue-500" />
                      <span>{note.author_name || "Verified Scholar"}</span>
                    </div>
                    <Link
                      href={`/learn/notes?id=${note.id}`}
                      className="font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:underline"
                    >
                      Read Note →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-2xl p-6 text-center space-y-2">
              <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
                No public notes published yet. Be the first scholar to share high-yield notes with your peers!
              </p>
              <Link
                href="/learn/notes"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:underline"
              >
                Create Study Note <ChevronRight className="size-3" />
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
