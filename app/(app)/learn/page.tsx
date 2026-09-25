"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  Award,
  BookOpen,
  Bone,
  Brain,
  CheckCircle2,
  Clock,
  FlaskConical,
  GraduationCap,
  HeartPulse,
  PlayCircle,
  PlusCircle,
  Search,
  Sparkles,
  Star,
  Stethoscope,
  Syringe,
  TrendingUp,
  Users,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { CourseCard } from "@/modules/learn/components/CourseCard";
import { Course, CourseEnrollment } from "@/modules/learn/types";

export default function LearnPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [recommendedCourses, setRecommendedCourses] = React.useState<Course[]>([]);
  const [popularCourses, setPopularCourses] = React.useState<Course[]>([]);
  const [continueLearning, setContinueLearning] = React.useState<CourseEnrollment[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!isPending && !session) router.replace("/");
  }, [isPending, router, session]);

  React.useEffect(() => {
    if (!session?.user) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch recommended courses
        const recRes = await fetch("/api/learn/courses?recommended=true&pageSize=4");
        const recData = await recRes.json();
        if (recRes.ok && Array.isArray(recData.courses)) {
          setRecommendedCourses(recData.courses);
        }

        // 2. Fetch popular courses
        const popRes = await fetch("/api/learn/courses?sort=popular&pageSize=8");
        const popData = await popRes.json();
        if (popRes.ok && Array.isArray(popData.courses)) {
          setPopularCourses(popData.courses);
        }

        // 3. Fetch user's my-learning enrollments
        const myRes = await fetch("/api/learn/my-learning");
        const myData = await myRes.json();
        if (myRes.ok && myData.inProgress) {
          setContinueLearning(myData.inProgress);
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
      router.push(`/learn/courses?query=${encodeURIComponent(searchQuery.trim())}`);
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
    { name: "Cardiology", icon: HeartPulse, count: "ECG & Vascular", color: "from-rose-500/10 to-pink-500/10 text-rose-600 border-rose-200" },
    { name: "Physiotherapy", icon: Activity, count: "Rehab & Ortho", color: "from-blue-500/10 to-cyan-500/10 text-[#1769c2] border-blue-200" },
    { name: "Medicine", icon: Stethoscope, count: "Internal & Critical", color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-200" },
    { name: "Orthopedics", icon: Bone, count: "Joints & Trauma", color: "from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-200" },
    { name: "Neurology", icon: Brain, count: "Brain & Spine", color: "from-purple-500/10 to-indigo-500/10 text-purple-600 border-purple-200" },
    { name: "Clinical Research", icon: FlaskConical, count: "Trials & GCP", color: "from-teal-500/10 to-emerald-500/10 text-teal-600 border-teal-200" },
    { name: "Nursing", icon: Syringe, count: "ICU & Acute Care", color: "from-sky-500/10 to-blue-500/10 text-sky-600 border-sky-200" },
  ];

  const allDisplayCourses = popularCourses;
  
  const filteredTabCourses = React.useMemo(() => {
    if (activeTab === "all") return allDisplayCourses;
    if (activeTab === "free") return allDisplayCourses.filter((c) => c.is_free);
    if (activeTab === "top_rated") return allDisplayCourses.filter((c) => (c.rating_avg || 0) >= 4.8);
    return allDisplayCourses.filter((c) => c.category?.toLowerCase() === activeTab.toLowerCase());
  }, [activeTab, allDisplayCourses]);

  const featuredCourse = recommendedCourses[0] || popularCourses[0] || null;

  if (isPending || !session) {
    return (
      <main className="min-h-dvh bg-[#f8f7f5] p-6">
        <div className="mx-auto max-w-7xl space-y-6 animate-pulse">
          <div className="h-44 rounded-3xl bg-white shadow-xs" />
          <div className="h-28 rounded-2xl bg-white shadow-xs" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="h-64 rounded-2xl bg-white shadow-xs" />
            <div className="h-64 rounded-2xl bg-white shadow-xs" />
            <div className="h-64 rounded-2xl bg-white shadow-xs" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[#f8f7f5] pb-36 text-[#171717]">
      {/* 1. HERO SEARCH & ACCREDITATION BANNER */}
      <section className="relative overflow-hidden border-b border-[#e8e6e3] bg-gradient-to-br from-[#0d3b66] via-[#1769c2] to-[#0f4c81] text-white">
        {/* Subtle Background Mesh & Highlights */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 size-96 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="max-w-3xl space-y-4">
            {/* Live Trust Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md shadow-xs">
                <Sparkles className="size-3.5 text-amber-300" /> Accredited CME Masterclasses
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-bold text-emerald-200 border border-emerald-400/30">
                <ShieldCheck className="size-3.5" /> Verified Faculty
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-white/90">
                <GraduationCap className="size-3.5" /> Instant Digital Certificate
              </span>
            </div>

            <h1 className="text-2xl font-black text-white sm:text-4xl lg:text-5xl leading-tight text-balance">
              Elevate Your Healthcare Expertise
            </h1>
            <p className="text-xs text-white/85 sm:text-sm max-w-2xl leading-relaxed text-pretty">
              Clinical case masterclasses, interactive diagnostics, and accredited CME certifications taught by India’s senior medical faculty & specialists.
            </p>

            {/* Premium Search Bar */}
            <form onSubmit={handleSearch} className="pt-2">
              <div className="relative flex items-center rounded-2xl bg-white p-1.5 shadow-xl ring-1 ring-black/10 transition-all focus-within:ring-2 focus-within:ring-white">
                <Search className="h-5 w-5 text-[#8a8784] ml-3 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search masterclasses e.g. '12-Lead ECG', 'ACL Rehab', 'POCUS', 'Ventilation'..."
                  className="h-11 w-full bg-transparent px-3 text-xs text-[#171717] placeholder:text-[#8a8784] focus:outline-none sm:text-sm"
                />
                <button
                  type="submit"
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#1769c2] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#12569f]"
                >
                  <span>Search</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>

            {/* Quick Query Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
              <span className="text-white/60 font-medium">Popular Searches:</span>
              {quickFilterQueries.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => router.push(`/learn/courses?query=${encodeURIComponent(item.query)}`)}
                  className="rounded-lg bg-white/10 px-2.5 py-1 text-white hover:bg-white/20 transition backdrop-blur-xs font-medium"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Navigation Action Bar */}
          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-white/15 pt-5 text-xs">
            <button
              type="button"
              onClick={() => router.push("/learn/courses")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3.5 py-1.5 font-bold text-white hover:bg-white/25 transition backdrop-blur-xs shadow-xs"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Browse Full Catalog</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={() => router.push("/learn/my-learning")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-1.5 font-semibold text-white/90 hover:bg-white/20 hover:text-white transition"
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span>My Learning Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/learn/instructor")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 text-[#171717] px-3.5 py-1.5 font-bold hover:bg-amber-300 transition shadow-xs"
            >
              <PlusCircle className="h-3.5 w-3.5 text-[#171717]" />
              <span>Teach on MGN Learn (Instructor Studio)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
        {/* -------------------------------------------------------------
            2. CONTINUE LEARNING WIDGET (If User Has In-Progress Courses)
            ------------------------------------------------------------- */}
        {continueLearning.length > 0 && (
          <section aria-label="Continue Learning" className="rounded-3xl border border-[#ded8d1] bg-white p-6 shadow-xs">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef5fc] text-[#1769c2]">
                  <PlayCircle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#171717]">Continue Learning</h2>
                  <p className="text-xs text-[#77716b]">Pick up right where you left off</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => router.push("/learn/my-learning")}
                className="text-xs font-bold text-[#1769c2] hover:underline flex items-center gap-1"
              >
                <span>View All ({continueLearning.length})</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {continueLearning.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={() => router.push(`/learn/course/${item.course_id}`)}
                  className="group flex cursor-pointer flex-col justify-between rounded-2xl border border-[#e8e6e3] bg-[#fcfbf9] p-4 transition-all hover:border-[#1769c2] hover:bg-white hover:shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-[#eef5fc] px-2 py-0.5 text-[10px] font-bold text-[#1769c2]">
                        {item.course?.category || "Medical"}
                      </span>
                      <span className="text-xs font-bold text-[#1769c2]">
                        {item.progress_percentage}% completed
                      </span>
                    </div>

                    <h3 className="mt-2 text-sm font-bold text-[#171717] group-hover:text-[#1769c2] line-clamp-1">
                      {item.course?.title}
                    </h3>
                    <p className="text-xs text-[#77716b] truncate mt-0.5">
                      Faculty: {item.course?.instructor?.name || "Senior Faculty"}
                    </p>
                  </div>

                  <div className="mt-4">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e8e6e3]">
                      <div
                        className="h-full rounded-full bg-[#1769c2] transition-all"
                        style={{ width: `${item.progress_percentage}%` }}
                      />
                    </div>
                    <button
                      type="button"
                      className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#eef5fc] py-2 text-xs font-bold text-[#1769c2] group-hover:bg-[#1769c2] group-hover:text-white transition"
                    >
                      <PlayCircle className="h-3.5 w-3.5" />
                      <span>Resume Masterclass</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* -------------------------------------------------------------
            3. FEATURED SPOTLIGHT CLINICAL MASTERCLASS
            ------------------------------------------------------------- */}
        {featuredCourse ? (
          <section aria-label="Featured Spotlight Masterclass">
            <div className="relative overflow-hidden rounded-3xl border border-[#ded8d1] bg-gradient-to-r from-[#1769c2] to-[#0d3b66] text-white shadow-md">
              <div className="grid grid-cols-1 gap-6 p-6 sm:p-8 lg:grid-cols-12 lg:items-center">
                <div className="space-y-4 lg:col-span-7">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-black text-[#171717] uppercase">
                      ★ Featured Masterclass
                    </span>
                    {featuredCourse.rating_avg ? (
                      <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                        {featuredCourse.rating_avg.toFixed(1)} / 5.0 ({featuredCourse.rating_count || 0} Reviews)
                      </span>
                    ) : null}
                    {featuredCourse.certificate_enabled && (
                      <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-200">
                        Accredited Certificate
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl font-black text-white sm:text-2xl lg:text-3xl leading-snug text-balance">
                    {featuredCourse.title}
                  </h2>

                  <p className="text-xs text-white/90 sm:text-sm leading-relaxed max-w-xl text-pretty">
                    {featuredCourse.short_description || featuredCourse.description}
                  </p>

                  {featuredCourse.instructor && (
                    <div className="flex items-center gap-3 pt-1">
                      {featuredCourse.instructor.image && (
                        <img
                          src={featuredCourse.instructor.image}
                          alt={featuredCourse.instructor.name}
                          className="h-10 w-10 rounded-full border border-white/30 object-cover ring-2 ring-white/20"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-white">{featuredCourse.instructor.name}</p>
                          <ShieldCheck className="h-3.5 w-3.5 text-blue-300" />
                        </div>
                        <p className="text-[11px] text-white/80">
                          {[featuredCourse.instructor.profession, featuredCourse.instructor.organization].filter(Boolean).join(" • ")}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => router.push(`/learn/course/${featuredCourse.id}`)}
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-[#1769c2] shadow-sm hover:bg-[#eef5fc] transition"
                    >
                      <PlayCircle className="h-4 w-4 text-[#1769c2]" />
                      <span>{featuredCourse.is_free ? "Enroll Free & Start Learning" : `Enroll for ₹${featuredCourse.price}`}</span>
                    </button>
                    {featuredCourse.duration_minutes && (
                      <span className="text-xs text-white/80 font-medium">⏱ {Math.round(featuredCourse.duration_minutes / 60)} Hours Duration</span>
                    )}
                  </div>
                </div>

                {/* Video Preview Thumbnail */}
                {featuredCourse.thumbnail && (
                  <div className="relative lg:col-span-5">
                    <div
                      onClick={() => router.push(`/learn/course/${featuredCourse.id}`)}
                      className="group relative aspect-video cursor-pointer overflow-hidden rounded-2xl border border-white/20 shadow-xl"
                    >
                      <img
                        src={featuredCourse.thumbnail}
                        alt={featuredCourse.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/30 transition">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#1769c2] shadow-lg group-hover:scale-110 transition">
                          <PlayCircle className="h-7 w-7 fill-[#1769c2] text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        ) : null}

        {/* -------------------------------------------------------------
            4. CLINICAL SPECIALTY EXPLORER
            ------------------------------------------------------------- */}
        <section aria-label="Explore by Specialty">
          <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#1769c2]">
                <Sparkles className="size-3.5" />
                <span>Specialty Pathways</span>
              </div>
              <h2 className="mt-1 text-xl font-bold text-[#171717] text-balance">
                Explore by Clinical Specialty
              </h2>
              <p className="text-xs text-[#77716b] text-pretty">
                Curated clinical curriculum tailored for your discipline and clinical practice
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/learn/courses")}
              className="text-xs font-bold text-[#1769c2] hover:underline inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2]"
            >
              <span>View All Disciplines</span>
              <ArrowRight className="size-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {specialties.map((cat) => {
              const IconComp = cat.icon;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => router.push(`/learn/courses?category=${encodeURIComponent(cat.name)}`)}
                  className="group relative flex flex-col items-center justify-center rounded-2xl border border-[#ded8d1] bg-white p-4 text-center shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-[#1769c2] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2]"
                >
                  <div className={`flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${cat.color} border transition-all duration-200 group-hover:scale-110`}>
                    <IconComp className="size-6" />
                  </div>
                  <p className="mt-3 text-xs font-bold text-[#171717] group-hover:text-[#1769c2] transition-colors">
                    {cat.name}
                  </p>
                  <p className="text-[10px] text-[#77716b] mt-0.5">{cat.count}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* -------------------------------------------------------------
            5. MASTERCLASSES CATALOG WITH INTERACTIVE TABS
            ------------------------------------------------------------- */}
        <section aria-label="Curated Masterclasses">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#1769c2]">
                <Award className="size-3.5" />
                <span>Accredited Catalog</span>
              </div>
              <h2 className="mt-1 text-xl font-bold text-[#171717] text-balance">
                Popular Clinical Courses & CME Modules
              </h2>
              <p className="text-xs text-[#77716b] text-pretty">
                Accredited clinical certifications trusted by hospitals and practicing clinicians
              </p>
            </div>

            {/* Interactive Filter Tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: "all", label: "All Courses" },
                { id: "free", label: "Free CME" },
                { id: "top_rated", label: "★ Top Rated" },
                { id: "Cardiology", label: "Cardiology" },
                { id: "Physiotherapy", label: "Physiotherapy" },
                { id: "Medicine", label: "Medicine" },
                { id: "Nursing", label: "Nursing" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-[#1769c2] text-white shadow-xs"
                      : "bg-white border border-[#ded8d1] text-[#77716b] hover:bg-[#f5f4f3] hover:text-[#171717]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Courses Grid */}
          {filteredTabCourses.length > 0 ? (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTabCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : !isLoading ? (
            <div className="rounded-3xl border border-dashed border-[#ded8d1] bg-white p-12 text-center">
              <GraduationCap className="mx-auto h-12 w-12 text-[#a09890]" />
              <h3 className="mt-3 text-base font-bold text-[#171717]">No Courses in this Category Yet</h3>
              <p className="mt-1 text-xs text-[#77716b] max-w-sm mx-auto">
                Accredited CME masterclasses and clinical training modules are being added soon. Are you a healthcare educator?
              </p>
              <button
                type="button"
                onClick={() => router.push("/learn/instructor")}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#1769c2] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#12569f] transition"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Teach on MGN Learn</span>
              </button>
            </div>
          ) : null}

          {/* Catalog Footer Link */}
          {allDisplayCourses.length > 0 && (
            <div className="mt-8 flex items-center justify-center">
              <button
                type="button"
                onClick={() => router.push("/learn/courses")}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#ded8d1] bg-white px-6 py-3 text-xs font-bold text-[#1769c2] shadow-xs hover:border-[#1769c2] hover:bg-[#eef5fc] transition"
              >
                <span>Explore All {allDisplayCourses.length}+ Accredited Courses</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </section>

        {/* -------------------------------------------------------------
            6. INSTRUCTOR INVITATION & CME RECOGNITION STRIP
            ------------------------------------------------------------- */}
        <section aria-label="Teach with Us">
          <div className="rounded-3xl border border-[#ded8d1] bg-gradient-to-br from-white via-white to-[#eef5fc] p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef5fc] px-3 py-1 text-[11px] font-bold text-[#1769c2]">
                  <GraduationCap className="h-3.5 w-3.5" /> For Medical Faculty & Senior Clinicians
                </span>
                <h3 className="text-lg font-bold text-[#171717] sm:text-xl">
                  Teach & Share Clinical Knowledge on MGN Learn
                </h3>
                <p className="text-xs text-[#77716b] leading-relaxed">
                  Publish accredited video modules, clinical case quizzes, and certified CME masterclasses. Reach thousands of verified doctors and clinicians across India.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/learn/instructor")}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1769c2] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#12569f] transition"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Open Instructor Studio</span>
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/learn/courses")}
                  className="rounded-xl border border-[#ded8d1] bg-white px-4 py-2.5 text-xs font-semibold text-[#171717] hover:bg-[#f5f4f3] transition"
                >
                  View Guidelines
                </button>
              </div>
            </div>

            {/* 4 Trust Checkmarks */}
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[#f0efee] pt-6 sm:grid-cols-4 text-xs">
              <div className="flex items-center gap-2 text-[#44403c]">
                <CheckCircle2 className="h-4 w-4 text-[#15803d] shrink-0" />
                <span className="font-semibold">Accredited CME Credits</span>
              </div>
              <div className="flex items-center gap-2 text-[#44403c]">
                <CheckCircle2 className="h-4 w-4 text-[#15803d] shrink-0" />
                <span className="font-semibold">NMC Council Verified</span>
              </div>
              <div className="flex items-center gap-2 text-[#44403c]">
                <CheckCircle2 className="h-4 w-4 text-[#15803d] shrink-0" />
                <span className="font-semibold">Interactive Quizzing</span>
              </div>
              <div className="flex items-center gap-2 text-[#44403c]">
                <CheckCircle2 className="h-4 w-4 text-[#15803d] shrink-0" />
                <span className="font-semibold">Instant Digital Certificate</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
