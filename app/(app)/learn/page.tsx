"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { CourseCard } from "@/modules/learn/components/CourseCard";
import { EmptyState } from "@/modules/network/components/EmptyState";
import { Course, CourseEnrollment } from "@/modules/learn/types";

export default function LearnPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [recommendedCourses, setRecommendedCourses] = React.useState<Course[]>([]);
  const [popularCourses, setPopularCourses] = React.useState<Course[]>([]);
  const [continueLearning, setContinueLearning] = React.useState<CourseEnrollment[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
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
        if (recRes.ok && recData.courses) {
          setRecommendedCourses(recData.courses);
        }

        // 2. Fetch popular courses
        const popRes = await fetch("/api/learn/courses?sort=popular&pageSize=8");
        const popData = await popRes.json();
        if (popRes.ok && popData.courses) {
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

  if (isPending || !session) {
    return (
      <main className="min-h-screen bg-[#f5f5f4] p-6">
        <div className="mx-auto max-w-7xl space-y-6 animate-pulse">
          <div className="h-28 rounded-3xl bg-white/60" />
          <div className="h-44 rounded-3xl bg-white/60" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="h-56 rounded-2xl bg-white/60" />
            <div className="h-56 rounded-2xl bg-white/60" />
            <div className="h-56 rounded-2xl bg-white/60" />
          </div>
        </div>
      </main>
    );
  }

  const categories = [
    { name: "Physiotherapy", icon: "🏃", count: "Rehab & Ortho" },
    { name: "Medicine", icon: "🩺", count: "Internal & Clinical" },
    { name: "Cardiology", icon: "❤️", count: "ECG & Vascular" },
    { name: "Orthopedics", icon: "🦴", count: "Joints & Trauma" },
    { name: "Neurology", icon: "🧠", count: "Brain & Spine" },
    { name: "Clinical Research", icon: "🔬", count: "Trials & GCP" },
    { name: "Nursing", icon: "💉", count: "Critical Care" },
  ];

  return (
    <main className="min-h-screen bg-[#f5f5f4] pb-36 text-[#171717]">
      {/* 1. HERO SEARCH BANNER */}
      <section className="border-b border-[#ded8d1] bg-gradient-to-br from-[#1769c2] via-[#0f4c81] to-[#1e3a8a] text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold tracking-wide text-white backdrop-blur-xs">
              <span>🎓</span> Accredited Clinical Education
            </span>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-4xl">
              Elevate Your Healthcare Expertise
            </h1>
            <p className="text-xs text-white/80 sm:text-sm">
              Accredited courses, clinical case modules, and verified CME certificates taught by leading medical practitioners.
            </p>

            {/* Search Bar Form */}
            <form onSubmit={handleSearch} className="flex gap-2 pt-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses e.g. 'ACL Rehabilitation', 'ECG', 'Pharmacology'..."
                className="h-11 flex-1 rounded-2xl border border-white/20 bg-white/10 px-4 text-xs text-white placeholder:text-white/60 backdrop-blur-xs focus:bg-white focus:text-[#171717] focus:outline-none sm:text-sm"
              />
              <button
                type="submit"
                className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-white px-5 text-xs font-bold text-[#1769c2] shadow-sm transition hover:bg-[#eef5fc]"
              >
                Search
              </button>
            </form>
          </div>

          {/* Shortcut navigation bar */}
          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4 text-xs">
            <button
              type="button"
              onClick={() => router.push("/learn/courses")}
              className="font-semibold text-white hover:underline"
            >
              Browse All Courses →
            </button>
            <span className="text-white/40">·</span>
            <button
              type="button"
              onClick={() => router.push("/learn/my-learning")}
              className="font-semibold text-white/90 hover:text-white hover:underline"
            >
              My Learning Dashboard
            </button>
            <span className="text-white/40">·</span>
            <button
              type="button"
              onClick={() => router.push("/learn/instructor")}
              className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold text-white hover:bg-white/30"
            >
              + Teach a Course / Instructor Studio
            </button>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
        {/* -------------------------------------------------------------
            2. CONTINUE LEARNING (If user has enrolled courses in progress)
            ------------------------------------------------------------- */}
        {continueLearning.length > 0 && (
          <section aria-label="Continue Learning">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#171717]">Continue Learning</h2>
                <p className="text-xs text-[#77716b]">Pick up right where you left off</p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/learn/my-learning")}
                className="text-xs font-semibold text-[#1769c2] hover:underline"
              >
                View All Enrolled ({continueLearning.length}) →
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {continueLearning.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={() => router.push(`/learn/course/${item.course_id}`)}
                  className="group flex cursor-pointer flex-col justify-between rounded-2xl border border-[#ded8d1] bg-white p-4 shadow-2xs transition hover:border-[#1769c2] hover:shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-[#eef5fc] px-2 py-0.5 text-[10px] font-bold text-[#1769c2]">
                        {item.course?.category || "Medical"}
                      </span>
                      <span className="text-xs font-bold text-[#1769c2]">
                        {item.progress_percentage}%
                      </span>
                    </div>

                    <h3 className="mt-2 text-sm font-bold text-[#171717] group-hover:text-[#1769c2] line-clamp-1">
                      {item.course?.title}
                    </h3>
                    <p className="text-xs text-[#77716b]">Instructor: {item.course?.instructor?.name}</p>
                  </div>

                  <div className="mt-4">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#f0efee]">
                      <div
                        className="h-full rounded-full bg-[#1769c2]"
                        style={{ width: `${item.progress_percentage}%` }}
                      />
                    </div>
                    <button
                      type="button"
                      className="mt-3 w-full rounded-xl bg-[#eef5fc] py-1.5 text-xs font-semibold text-[#1769c2] group-hover:bg-[#1769c2] group-hover:text-white transition"
                    >
                      Resume Learning →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* -------------------------------------------------------------
            3. CLINICAL DOMAINS & CATEGORIES
            ------------------------------------------------------------- */}
        <section aria-label="Categories">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[#171717]">Explore by Specialty</h2>
            <p className="text-xs text-[#77716b]">Curated clinical curriculum tailored for every discipline</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {categories.map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => router.push(`/learn/courses?category=${encodeURIComponent(cat.name)}`)}
                className="group flex flex-col items-center justify-center rounded-2xl border border-[#ded8d1] bg-white p-4 text-center shadow-2xs transition hover:-translate-y-1 hover:border-[#1769c2] hover:shadow-xs"
              >
                <span className="text-2xl transition group-hover:scale-110">{cat.icon}</span>
                <p className="mt-2 text-xs font-bold text-[#171717] group-hover:text-[#1769c2]">
                  {cat.name}
                </p>
                <p className="text-[10px] text-[#77716b]">{cat.count}</p>
              </button>
            ))}
          </div>
        </section>

        {/* -------------------------------------------------------------
            4. RECOMMENDED FOR YOUR PROFESSION
            ------------------------------------------------------------- */}
        {recommendedCourses.length > 0 && (
          <section aria-label="Recommended Courses">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#171717]">Recommended for Your Clinical Practice</h2>
                <p className="text-xs text-[#77716b]">
                  Personalized based on your verified professional specialization
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/learn/courses?sort=rating")}
                className="text-xs font-semibold text-[#1769c2] hover:underline"
              >
                Explore More →
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {recommendedCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </section>
        )}

        {/* -------------------------------------------------------------
            5. POPULAR & ACCREDITED COURSES
            ------------------------------------------------------------- */}
        <section aria-label="Popular Courses">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#171717]">Popular Clinical Courses</h2>
              <p className="text-xs text-[#77716b]">Most enrolled training modules across hospitals & clinics</p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/learn/courses")}
              className="text-xs font-semibold text-[#1769c2] hover:underline"
            >
              View Full Catalog →
            </button>
          </div>

          {popularCourses.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {popularCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : !isLoading ? (
            <EmptyState
              icon="📚"
              title="No published courses yet"
              description="Be the first medical faculty to publish an accredited clinical training module on MGN Learn."
              actionText="+ Teach on MGN Learn"
              onAction={() => router.push("/learn/instructor")}
            />
          ) : null}
        </section>
      </div>
    </main>
  );
}
