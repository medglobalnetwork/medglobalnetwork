"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const courses = [
  { id: 1, title: "Financial Planning 101",  category: "Finance",   duration: "4h 30m", progress: 68, color: "#dbeafe" },
  { id: 2, title: "Investment Strategies",   category: "Investing", duration: "6h 15m", progress: 32, color: "#dcfce7" },
  { id: 3, title: "Tax Optimization",        category: "Tax",       duration: "3h 00m", progress: 0,  color: "#fef9c3" },
  { id: 4, title: "Crypto & DeFi Basics",    category: "Crypto",    duration: "5h 45m", progress: 15, color: "#fce7f3" },
  { id: 5, title: "Wealth Management 101",   category: "Finance",   duration: "3h 20m", progress: 0,  color: "#ede9fe" },
  { id: 6, title: "Stock Market Essentials", category: "Investing", duration: "7h 00m", progress: 50, color: "#cffafe" },
];

const tabs = ["All", "Finance", "Investing", "Tax", "Crypto"];

export default function LearnPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [activeTab, setActiveTab] = React.useState("All");

  React.useEffect(() => {
    if (!isPending && !session) router.replace("/");
  }, [isPending, router, session]);

  if (isPending || !session) return <main className="min-h-screen bg-[#f5f5f4]" />;

  const filtered = courses.filter((c) => activeTab === "All" || c.category === activeTab);
  const inProgress = courses.filter((c) => c.progress > 0 && c.progress < 100);

  return (
    <main className="min-h-screen bg-[#f5f5f4] pb-36 text-[#171717]">
      <div className="mx-auto max-w-4xl px-6 py-6 lg:px-12">

        {/* Page header */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#77716b]">Learning</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Learn</h1>
        </div>

        {/* Continue learning */}
        {inProgress.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-sm font-semibold text-[#171717]">Continue Learning</h2>
            <div className="rounded-2xl border border-[#e8e6e3] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-block rounded-full bg-[#dbeafe] px-2.5 py-0.5 text-[11px] font-semibold text-[#1769c2]">
                    {inProgress[0].category}
                  </span>
                  <h3 className="mt-2 text-base font-semibold text-[#171717]">{inProgress[0].title}</h3>
                  <p className="mt-1 text-sm text-[#77716b]">Module 7 of 12 · 1h 20m remaining</p>
                </div>
                <button className="shrink-0 rounded-xl bg-[#1769c2] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1258a8]">
                  Resume
                </button>
              </div>
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs text-[#77716b]">
                  <span>Progress</span><span>{inProgress[0].progress}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#f0efee]">
                  <div className="h-1.5 rounded-full bg-[#1769c2] transition-all" style={{ width: `${inProgress[0].progress}%` }} />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Category tabs */}
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                activeTab === tab
                  ? "bg-[#1769c2] text-white"
                  : "border border-[#e8e6e3] bg-white text-[#5d5854] hover:border-[#1769c2] hover:text-[#1769c2]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Course grid */}
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((course) => (
            <div key={course.id} className="cursor-pointer rounded-2xl border border-[#e8e6e3] bg-white p-4 shadow-sm transition hover:shadow-md">
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl text-lg" style={{ background: course.color }}>
                  📚
                </span>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-[#77716b]">{course.category}</span>
                  <p className="text-sm font-semibold leading-snug text-[#171717]">{course.title}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-[#77716b]">
                <span>⏱ {course.duration}</span>
                <span>{course.progress > 0 ? `${course.progress}% done` : "Not started"}</span>
              </div>
              {course.progress > 0 && (
                <div className="mt-2 h-1 w-full rounded-full bg-[#f0efee]">
                  <div className="h-1 rounded-full bg-[#1769c2]" style={{ width: `${course.progress}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
