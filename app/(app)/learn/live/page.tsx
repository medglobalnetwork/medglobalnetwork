"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import {
  Video,
  Radio,
  Calendar,
  Clock,
  Users,
  PlusCircle,
  PlayCircle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Award,
  BookOpen,
  Filter,
  Search,
  X,
} from "lucide-react";
import { LiveSessionRecord } from "@/modules/learn/lib/live-classroom-db";

export default function LiveClassroomHubPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [liveSessions, setLiveSessions] = React.useState<LiveSessionRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All");
  const [showHostModal, setShowHostModal] = React.useState(false);

  // Host Session Form State
  const [hostTitle, setHostTitle] = React.useState("");
  const [hostDescription, setHostDescription] = React.useState("");
  const [hostCategory, setHostCategory] = React.useState("Cardiology");
  const [hostSpecialty, setHostSpecialty] = React.useState("");
  const [hostDate, setHostDate] = React.useState("");
  const [hostDuration, setHostDuration] = React.useState(60);
  const [isSubmittingHost, setIsSubmittingHost] = React.useState(false);

  React.useEffect(() => {
    if (!isPending && !session) {
      router.replace("/");
    }
  }, [isPending, session, router]);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/learn/live/sessions");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.sessions)) {
          setLiveSessions(data.sessions);
        }
      }
    } catch (err) {
      console.error("Failed to load live sessions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (session?.user) {
      fetchSessions();
    }
  }, [session?.user]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostTitle.trim() || !hostDate) return;

    setIsSubmittingHost(true);
    try {
      const res = await fetch("/api/learn/live/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: hostTitle.trim(),
          description: hostDescription.trim() || null,
          category: hostCategory,
          specialty: hostSpecialty.trim() || null,
          scheduled_at: new Date(hostDate).toISOString(),
          duration_minutes: Number(hostDuration || 60),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setShowHostModal(false);
        setHostTitle("");
        setHostDescription("");
        fetchSessions();
        if (data.sessionId) {
          router.push(`/learn/live/${data.sessionId}`);
        }
      }
    } catch (err) {
      console.error("Failed to host session:", err);
    } finally {
      setIsSubmittingHost(false);
    }
  };

  const handleRegister = async (sessionId: string) => {
    try {
      const res = await fetch("/api/learn/live-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (res.ok) {
        fetchSessions();
        alert("Seat reserved for live classroom!");
      }
    } catch (err) {
      console.error("Registration error:", err);
    }
  };

  const categories = ["All", "Cardiology", "Physiotherapy", "Neurology", "Orthopedics", "Critical Care", "Radiology"];

  const filteredSessions = liveSessions.filter((s) => {
    const matchCategory = selectedCategory === "All" || s.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchQuery =
      !searchQuery.trim() ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.instructor?.name && s.instructor.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchQuery;
  });

  const currentlyLive = filteredSessions.filter((s) => s.status === "live");
  const upcomingSessions = filteredSessions.filter((s) => s.status !== "live" && s.status !== "ended" && s.status !== "cancelled");

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-[#fbfaf9] dark:bg-[#0d1117] text-[#171717] dark:text-[#f0f6fc] pb-16">
      {/* ───────────────────────────────────────────── */}
      {/* 1. HERO HEADER                                 */}
      {/* ───────────────────────────────────────────── */}
      <section className="border-b border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1.5 rounded-full bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/30 px-3 py-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                <Radio className="size-3.5 animate-pulse" />
                <span>MGN Live Classroom</span>
              </span>
              <span className="text-xs font-semibold text-[#77716b] dark:text-[#8b949e]">
                Integrated Live Learning Architecture
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#171717] dark:text-[#f0f6fc]">
              Clinical Masterclasses & Live Rounds
            </h1>
            <p className="mt-1 text-sm text-[#77716b] dark:text-[#8b949e] max-w-2xl">
              Real-time medical lectures with interactive WebRTC streaming, voice doubts, clinical whiteboards, and certified attendance tracking.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            <button
              type="button"
              onClick={() => setShowHostModal(true)}
              className="flex items-center gap-2 rounded-2xl bg-[#0f4c81] dark:bg-[#1f6feb] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#0c3c66] transition cursor-pointer"
            >
              <PlusCircle className="size-4" />
              <span>Host a Live Session</span>
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-8 pt-6 space-y-8">
        {/* ───────────────────────────────────────────── */}
        {/* 2. FILTER & DISCOVERY BAR                     */}
        {/* ───────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-[#0f4c81] text-white dark:bg-[#1f6feb]"
                    : "bg-white dark:bg-[#161b22] text-[#5d5854] dark:text-[#8b949e] border border-[#ded8d1] dark:border-[#30363d] hover:border-[#0f4c81]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[#77716b]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search live sessions..."
              className="w-full rounded-xl bg-white dark:bg-[#161b22] pl-8 pr-3 py-1.5 text-xs text-[#171717] dark:text-[#f0f6fc] border border-[#ded8d1] dark:border-[#30363d] placeholder-[#77716b] focus:outline-none focus:border-[#0f4c81]"
            />
          </div>
        </div>

        {/* ───────────────────────────────────────────── */}
        {/* 3. CURRENTLY LIVE SESSIONS                     */}
        {/* ───────────────────────────────────────────── */}
        {currentlyLive.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-rose-500 animate-ping" />
              <h2 className="text-base sm:text-lg font-black text-[#171717] dark:text-[#f0f6fc]">
                Happening Right Now
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentlyLive.map((session) => (
                <div
                  key={session.id}
                  className="flex flex-col sm:flex-row gap-4 rounded-3xl border-2 border-rose-500/40 bg-white dark:bg-[#161b22] p-5 shadow-md hover:border-rose-500 transition"
                >
                  <div className="relative aspect-video sm:w-56 sm:aspect-[4/3] rounded-2xl overflow-hidden bg-[#161b22] shrink-0">
                    {session.thumbnail ? (
                      <img src={session.thumbnail} alt={session.title} className="size-full object-cover" />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-rose-950/20 text-rose-500">
                        <Video className="size-10" />
                      </div>
                    )}
                    <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
                      <Radio className="size-3 animate-pulse" />
                      <span>ON AIR</span>
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div>
                      <span className="text-[11px] font-bold text-[#0f4c81] dark:text-[#58a6ff]">
                        {session.category} · {session.specialty || "General Medical"}
                      </span>
                      <h3 className="mt-1 text-sm font-bold text-[#171717] dark:text-[#f0f6fc] line-clamp-2">
                        {session.title}
                      </h3>
                      <p className="mt-1 text-xs text-[#77716b] dark:text-[#8b949e] line-clamp-2">
                        {session.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#f0efee] dark:border-[#21262d] flex items-center justify-between">
                      <div className="text-[11px] font-semibold text-[#5d5854] dark:text-[#8b949e]">
                        Faculty: {session.instructor?.name || "Medical Faculty"}
                      </div>
                      <Link
                        href={`/learn/live/${session.id}`}
                        className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-700 shadow-sm transition"
                      >
                        <PlayCircle className="size-4" />
                        <span>Join Live</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ───────────────────────────────────────────── */}
        {/* 4. UPCOMING SCHEDULED SESSIONS                */}
        {/* ───────────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#171717] dark:text-[#f0f6fc]">
                Scheduled Clinical Masterclasses
              </h2>
              <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
                Register in advance to receive reminders and save seats
              </p>
            </div>
          </div>

          {filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-12 text-center shadow-2xs space-y-3">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-[#0f4c81]/10 dark:bg-[#1f6feb]/10 text-[#0f4c81] dark:text-[#58a6ff]">
                <Video className="size-7" />
              </div>
              <h3 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">
                No live sessions currently scheduled
              </h3>
              <p className="text-xs text-[#77716b] dark:text-[#8b949e] max-w-sm">
                There are no upcoming live lectures matching your filter. Host a live clinical round or check back shortly.
              </p>
              <button
                type="button"
                onClick={() => setShowHostModal(true)}
                className="mt-2 rounded-xl bg-[#0f4c81] dark:bg-[#1f6feb] px-4 py-2 text-xs font-bold text-white hover:bg-[#0c3c66] transition cursor-pointer"
              >
                Host a Session
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="group flex flex-col justify-between rounded-3xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-4 shadow-2xs hover:border-[#0f4c81] hover:shadow-md transition"
                >
                  <div>
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#f0efee] dark:bg-[#21262d] mb-3">
                      {session.thumbnail ? (
                        <img src={session.thumbnail} alt={session.title} className="size-full object-cover" />
                      ) : (
                        <div className="flex size-full items-center justify-center bg-[#eef5fc] dark:bg-[#1c2433]">
                          <Video className="size-8 text-[#0f4c81]" />
                        </div>
                      )}
                      <span className="absolute top-2 left-2 rounded-full bg-white/90 dark:bg-[#161b22]/90 backdrop-blur-xs px-2 py-0.5 text-[9px] font-bold text-[#0f4c81] dark:text-[#58a6ff] shadow-2xs">
                        {session.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[#77716b] dark:text-[#8b949e]">
                      <Calendar className="size-3.5" />
                      <span>
                        {new Date(session.scheduled_at).toLocaleDateString("en-IN", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span>· {session.duration_minutes}m</span>
                    </div>

                    <h3 className="mt-1.5 text-sm font-bold text-[#171717] dark:text-[#f0f6fc] line-clamp-2">
                      {session.title}
                    </h3>
                    <p className="mt-1 text-xs text-[#77716b] dark:text-[#8b949e] line-clamp-2">
                      {session.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#f0efee] dark:border-[#21262d] flex items-center justify-between">
                    <div className="text-[11px] font-semibold text-[#5d5854] dark:text-[#8b949e]">
                      {session.instructor?.name || "Medical Faculty"}
                    </div>
                    {session.user_registered ? (
                      <Link
                        href={`/learn/live/${session.id}`}
                        className="rounded-xl bg-[#eef5fc] dark:bg-[#1c2433] px-3.5 py-1.5 text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:bg-[#0f4c81] hover:text-white transition"
                      >
                        Enter Room
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRegister(session.id)}
                        className="rounded-xl bg-[#0f4c81] dark:bg-[#1f6feb] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#0c3c66] transition cursor-pointer"
                      >
                        Reserve Seat
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ───────────────────────────────────────────── */}
      {/* 5. HOST A LIVE SESSION MODAL                   */}
      {/* ───────────────────────────────────────────── */}
      {showHostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#161b22] border border-[#ded8d1] dark:border-[#30363d] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-xl bg-[#0f4c81]/10 text-[#0f4c81] dark:text-[#58a6ff]">
                  <Video className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">
                    Host Live Classroom
                  </h3>
                  <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
                    Schedule a clinical masterclass or patient case round
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHostModal(false)}
                className="p-1 rounded-xl text-[#77716b] hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                  Masterclass Title
                </label>
                <input
                  type="text"
                  required
                  value={hostTitle}
                  onChange={(e) => setHostTitle(e.target.value)}
                  placeholder="e.g. 12-Lead ECG Differential Diagnosis & STEMI Localization"
                  className="w-full rounded-xl bg-[#fbfaf9] dark:bg-[#21262d] px-3 py-2 text-xs text-[#171717] dark:text-[#f0f6fc] border border-[#ded8d1] dark:border-[#30363d] focus:outline-none focus:border-[#0f4c81]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                  Clinical Overview
                </label>
                <textarea
                  rows={2}
                  value={hostDescription}
                  onChange={(e) => setHostDescription(e.target.value)}
                  placeholder="Outline key learning objectives, case findings, or clinical pathways..."
                  className="w-full rounded-xl bg-[#fbfaf9] dark:bg-[#21262d] px-3 py-2 text-xs text-[#171717] dark:text-[#f0f6fc] border border-[#ded8d1] dark:border-[#30363d] focus:outline-none focus:border-[#0f4c81]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                    Category
                  </label>
                  <select
                    value={hostCategory}
                    onChange={(e) => setHostCategory(e.target.value)}
                    className="w-full rounded-xl bg-[#fbfaf9] dark:bg-[#21262d] px-3 py-2 text-xs text-[#171717] dark:text-[#f0f6fc] border border-[#ded8d1] dark:border-[#30363d]"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Physiotherapy">Physiotherapy</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Critical Care">Critical Care</option>
                    <option value="Medicine">General Medicine</option>
                    <option value="Radiology">Radiology</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                    Specialty / Topic
                  </label>
                  <input
                    type="text"
                    value={hostSpecialty}
                    onChange={(e) => setHostSpecialty(e.target.value)}
                    placeholder="e.g. Electrophysiology"
                    className="w-full rounded-xl bg-[#fbfaf9] dark:bg-[#21262d] px-3 py-2 text-xs text-[#171717] dark:text-[#f0f6fc] border border-[#ded8d1] dark:border-[#30363d]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={hostDate}
                    onChange={(e) => setHostDate(e.target.value)}
                    className="w-full rounded-xl bg-[#fbfaf9] dark:bg-[#21262d] px-3 py-2 text-xs text-[#171717] dark:text-[#f0f6fc] border border-[#ded8d1] dark:border-[#30363d]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={240}
                    value={hostDuration}
                    onChange={(e) => setHostDuration(Number(e.target.value))}
                    className="w-full rounded-xl bg-[#fbfaf9] dark:bg-[#21262d] px-3 py-2 text-xs text-[#171717] dark:text-[#f0f6fc] border border-[#ded8d1] dark:border-[#30363d]"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmittingHost}
                  className="flex-1 rounded-2xl bg-[#0f4c81] dark:bg-[#1f6feb] py-2.5 text-xs font-bold text-white hover:bg-[#0c3c66] disabled:opacity-50 transition cursor-pointer"
                >
                  {isSubmittingHost ? "Scheduling..." : "Schedule Masterclass"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowHostModal(false)}
                  className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] px-4 py-2.5 text-xs font-bold text-[#5d5854] dark:text-[#8b949e] hover:bg-black/5"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
