"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Plus,
  Radio,
  Sparkles,
  Video,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { StudentNavHeader } from "@/modules/learn/components/StudentNavHeader";
import { StudentCalendarEvent } from "@/modules/learn/types";

export default function StudentCalendarPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [events, setEvents] = React.useState<StudentCalendarEvent[]>([]);
  const [selectedFilter, setSelectedFilter] = React.useState<string>("all");
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!isPending && !session) router.replace("/");
  }, [isPending, router, session]);

  React.useEffect(() => {
    if (!session?.user) return;

    const loadCalendar = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/learn/calendar");
        if (res.ok) {
          const data = await res.json();
          setEvents(data.events || []);
        }
      } catch (err) {
        console.error("Failed to load calendar events:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCalendar();
  }, [session?.user]);

  const filteredEvents = React.useMemo(() => {
    if (selectedFilter === "all") return events;
    return events.filter((e) => e.event_type === selectedFilter);
  }, [events, selectedFilter]);

  return (
    <div className="min-h-screen bg-[#faf9f8] dark:bg-[#0d1117] text-[#171717] dark:text-[#f0f6fc] pb-24">
      <StudentNavHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
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
                Student Learning Calendar 📅
              </h1>
            </div>
            <p className="text-xs text-[#77716b] dark:text-[#8b949e] mt-1 ml-8">
              Integrated schedule for live lectures, clinical workshops, webinars, and exam deadlines.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-2xl p-4 shadow-2xs flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: "All Events" },
            { id: "live_lecture", label: "Live Lectures" },
            { id: "workshop", label: "Workshops" },
            { id: "webinar", label: "Webinars" },
            { id: "exam", label: "Exams & Quizzes" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                selectedFilter === tab.id
                  ? "bg-[#0f4c81] text-white"
                  : "bg-[#f5f4f2] dark:bg-[#21262d] text-[#5d5854] dark:text-[#8b949e] hover:bg-[#e8e6e3]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Calendar Events List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-2xl h-24 animate-pulse"
              />
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="space-y-4">
            {filteredEvents.map((evt) => {
              const date = new Date(evt.scheduled_at);
              const isLive = evt.event_type === "live_lecture" || evt.event_type === "live_class";

              return (
                <div
                  key={evt.id}
                  className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-3xl p-5 shadow-2xs hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    {/* Date Block */}
                    <div className="size-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 text-[#0f4c81] dark:text-[#58a6ff] flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] uppercase font-bold">
                        {date.toLocaleDateString("en-US", { month: "short" })}
                      </span>
                      <span className="text-lg font-extrabold leading-none">
                        {date.toLocaleDateString("en-US", { day: "2-digit" })}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            isLive
                              ? "bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400"
                              : "bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400"
                          }`}
                        >
                          {evt.event_type.replace("_", " ")}
                        </span>
                        <span className="text-[11px] text-[#77716b] flex items-center gap-1">
                          <Clock className="size-3" />
                          {date.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">
                        {evt.title}
                      </h3>

                      <p className="text-xs text-[#77716b]">
                        {evt.instructor_name || "MGN Faculty"} {evt.course_title ? `• ${evt.course_title}` : ""}
                      </p>
                    </div>
                  </div>

                  {/* Action */}
                  {evt.meeting_url || isLive ? (
                    <Link
                      href={evt.meeting_url || `/learn/live/${evt.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0f4c81] hover:bg-[#0d3f6c] text-white text-xs font-bold transition shadow-xs self-start sm:self-auto"
                    >
                      <Radio className="size-3.5 animate-pulse" /> Join Live
                    </Link>
                  ) : (
                    <span className="text-xs text-[#77716b] font-medium self-start sm:self-auto">
                      Scheduled
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-3xl p-12 text-center text-xs text-[#77716b]">
            No learning events scheduled for this filter.
          </div>
        )}
      </div>
    </div>
  );
}
