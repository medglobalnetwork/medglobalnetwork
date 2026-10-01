"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Radio,
  Users,
  Clock,
  LogOut,
  Hand,
  Mic,
  MessageSquare,
  HelpCircle,
  BarChart3,
  FileText,
  StickyNote,
  Award,
  Send,
  Download,
  CheckCircle2,
  AlertCircle,
  ThumbsUp,
  Volume2,
  Sparkles,
  Pin,
  Plus,
} from "lucide-react";
import {
  LiveSessionRecord,
  LiveChatMessageRecord,
  LiveQuestionRecord,
  LivePollRecord,
  LiveResourceRecord,
  LiveNoteRecord,
} from "@/modules/learn/lib/live-classroom-db";
import { LiveVoiceDoubtModal } from "./LiveVoiceDoubtModal";

interface StudentLiveRoomProps {
  session: LiveSessionRecord;
  currentUser: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

type StudentTab = "chat" | "qa" | "polls" | "notes" | "resources";

const EMOJIS = ["❤️", "👍", "👏", "😂", "🔥", "😮"];

export function StudentLiveRoom({ session: initialSession, currentUser }: StudentLiveRoomProps) {
  const router = useRouter();
  const [session, setSession] = React.useState<LiveSessionRecord>(initialSession);
  const [activeTab, setActiveTab] = React.useState<StudentTab>("chat");

  // Interaction States
  const [hasRaisedHand, setHasRaisedHand] = React.useState(false);
  const [isSpeakingOnStage, setIsSpeakingOnStage] = React.useState(false);
  const [isVoiceDoubtOpen, setIsVoiceDoubtOpen] = React.useState(false);

  // Chat Data
  const [chatMessages, setChatMessages] = React.useState<LiveChatMessageRecord[]>([]);
  const [messageInput, setMessageInput] = React.useState("");

  // Q&A Data
  const [questions, setQuestions] = React.useState<LiveQuestionRecord[]>([]);
  const [newQuestionInput, setNewQuestionInput] = React.useState("");

  // Polls Data
  const [polls, setPolls] = React.useState<LivePollRecord[]>([]);
  const [activePoll, setActivePoll] = React.useState<LivePollRecord | null>(null);

  // Notes Data
  const [notes, setNotes] = React.useState<LiveNoteRecord[]>([]);
  const [newNoteInput, setNewNoteInput] = React.useState("");

  // Resources Data
  const [resources, setResources] = React.useState<LiveResourceRecord[]>([]);

  // Attendance & Time tracking
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0);
  const [myAttendanceSeconds, setMyAttendanceSeconds] = React.useState(30);

  // Floating Emojis
  const [floatingEmojis, setFloatingEmojis] = React.useState<{ id: string; emoji: string; x: number }[]>([]);

  // Refs
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const chatScrollRef = React.useRef<HTMLDivElement | null>(null);

  // Heartbeat & Timer
  React.useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
      setMyAttendanceSeconds((prev) => prev + 1);
    }, 1000);

    const heartbeat = setInterval(async () => {
      try {
        await fetch(`/api/learn/live/sessions/${session.id}/presence`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        console.error("Student presence heartbeat error:", err);
      }
    }, 20000);

    return () => {
      clearInterval(timer);
      clearInterval(heartbeat);
    };
  }, [session.id]);

  // Polling for live session updates
  const fetchData = React.useCallback(async () => {
    try {
      const [chatRes, qaRes, pollsRes, resRes, notesRes, handsRes] = await Promise.all([
        fetch(`/api/learn/live/sessions/${session.id}/chat?limit=50`),
        fetch(`/api/learn/live/sessions/${session.id}/qa`),
        fetch(`/api/learn/live/sessions/${session.id}/polls`),
        fetch(`/api/learn/live/sessions/${session.id}/resources`),
        fetch(`/api/learn/live/sessions/${session.id}/notes`),
        fetch(`/api/learn/live/sessions/${session.id}/hand-raise`),
      ]);

      if (chatRes.ok) {
        const d = await chatRes.json();
        if (Array.isArray(d.messages)) setChatMessages(d.messages);
      }
      if (qaRes.ok) {
        const d = await qaRes.json();
        if (Array.isArray(d.questions)) setQuestions(d.questions);
      }
      if (pollsRes.ok) {
        const d = await pollsRes.json();
        if (Array.isArray(d.polls)) {
          setPolls(d.polls);
          const active = d.polls.find((p: any) => p.status === "active");
          setActivePoll(active || null);
        }
      }
      if (resRes.ok) {
        const d = await resRes.json();
        if (Array.isArray(d.resources)) setResources(d.resources);
      }
      if (notesRes.ok) {
        const d = await notesRes.json();
        if (Array.isArray(d.notes)) setNotes(d.notes);
      }
      if (handsRes.ok) {
        const d = await handsRes.json();
        if (Array.isArray(d.handRaises)) {
          const myHand = d.handRaises.find((h: any) => h.user_id === currentUser.id);
          if (myHand) {
            setHasRaisedHand(true);
            if (myHand.status === "approved" || myHand.status === "speaking") {
              setIsSpeakingOnStage(true);
            } else {
              setIsSpeakingOnStage(false);
            }
          } else {
            setHasRaisedHand(false);
            setIsSpeakingOnStage(false);
          }
        }
      }
    } catch (err) {
      console.error("Student polling error:", err);
    }
  }, [session.id, currentUser.id]);

  React.useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Floating Reactions Poller
  React.useEffect(() => {
    const rxnInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/learn/live/sessions/${session.id}/reactions`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.reactions) && data.reactions.length > 0) {
            data.reactions.forEach((r: any) => {
              for (let i = 0; i < Math.min(r.count, 3); i++) {
                const id = Math.random().toString(36);
                const x = 10 + Math.random() * 80;
                setFloatingEmojis((prev) => [...prev, { id, emoji: r.emoji, x }]);
                setTimeout(() => {
                  setFloatingEmojis((prev) => prev.filter((item) => item.id !== id));
                }, 2500);
              }
            });
          }
        }
      } catch (err) {
        // silent
      }
    }, 2000);

    return () => clearInterval(rxnInterval);
  }, [session.id]);

  // Scroll chat down
  React.useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Emoji Click
  const handleSendReaction = async (emoji: string) => {
    const id = Math.random().toString(36);
    const x = 20 + Math.random() * 60;
    setFloatingEmojis((prev) => [...prev, { id, emoji, x }]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((item) => item.id !== id));
    }, 2500);

    try {
      await fetch(`/api/learn/live/sessions/${session.id}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
    } catch (err) {
      console.error("Reaction send error:", err);
    }
  };

  // Hand Raise Toggle
  const toggleRaiseHand = async () => {
    const action = hasRaisedHand ? "lower" : "raise";
    try {
      const res = await fetch(`/api/learn/live/sessions/${session.id}/hand-raise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setHasRaisedHand(!hasRaisedHand);
      }
    } catch (err) {
      console.error("Hand raise error:", err);
    }
  };

  // Chat Send
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    try {
      const res = await fetch(`/api/learn/live/sessions/${session.id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageInput.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [...prev, data.message]);
        setMessageInput("");
      }
    } catch (err) {
      console.error("Chat message send error:", err);
    }
  };

  // Q&A Question Submit
  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionInput.trim()) return;

    try {
      const res = await fetch(`/api/learn/live/sessions/${session.id}/qa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newQuestionInput.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions((prev) => [data.question, ...prev]);
        setNewQuestionInput("");
      }
    } catch (err) {
      console.error("Question submit error:", err);
    }
  };

  const handleVoteQuestion = async (questionId: string) => {
    try {
      const res = await fetch(`/api/learn/live/sessions/${session.id}/qa/${questionId}/vote`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === questionId ? { ...q, upvotes: data.upvotes, has_upvoted: data.has_upvoted } : q
          )
        );
      }
    } catch (err) {
      console.error("Vote question error:", err);
    }
  };

  // Poll Vote
  const handleVotePoll = async (pollId: string, optionId: string) => {
    try {
      const res = await fetch(`/api/learn/live/sessions/${session.id}/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Poll vote error:", err);
    }
  };

  // Note Submit
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteInput.trim()) return;

    const formattedTime = `${Math.floor(elapsedSeconds / 60)}:${
      elapsedSeconds % 60 < 10 ? "0" : ""
    }${elapsedSeconds % 60}`;

    try {
      const res = await fetch(`/api/learn/live/sessions/${session.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp_seconds: elapsedSeconds,
          formatted_time: formattedTime,
          note_text: newNoteInput.trim(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setNotes((prev) => [...prev, data.note]);
        setNewNoteInput("");
      }
    } catch (err) {
      console.error("Save note error:", err);
    }
  };

  // Voice Doubt Submit Callback
  const handleVoiceDoubtSubmit = async (audioData: string, durationSeconds: number) => {
    try {
      await fetch(`/api/learn/live/sessions/${session.id}/voice-doubts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audio_url: audioData,
          duration_seconds: durationSeconds,
        }),
      });
      alert("Voice doubt submitted to faculty!");
    } catch (err) {
      console.error("Voice doubt error:", err);
    }
  };

  const totalExpectedSeconds = (session.duration_minutes || 60) * 60;
  const attendanceRatio = Math.min(100, Math.round((myAttendanceSeconds / totalExpectedSeconds) * 100));
  const isAttendanceEligible = attendanceRatio >= 75;

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col bg-[#0d1117] text-slate-100 overflow-hidden select-none">
      {/* ───────────────────────────────────────────── */}
      {/* 1. TOP STUDENT HEADER                          */}
      {/* ───────────────────────────────────────────── */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#30363d] bg-[#161b22] px-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex items-center gap-1.5 rounded-full bg-rose-600/20 border border-rose-500/30 px-2.5 py-1 text-xs font-bold text-rose-400">
            <Radio className="size-3.5 animate-pulse" />
            <span>LIVE</span>
          </span>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-slate-100 truncate">{session.title}</h1>
            <div className="flex items-center gap-2 text-[11px] text-[#8b949e]">
              <span>Faculty: {session.instructor?.name || "Medical Faculty"}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Users className="size-3 text-[#58a6ff]" />
                {session.live_participant_count || 1} watching
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Attendance Progress Pill */}
          <div className="hidden sm:flex items-center gap-2 rounded-xl bg-[#21262d] px-3 py-1.5 text-xs">
            <Award className={`size-3.5 ${isAttendanceEligible ? "text-emerald-400" : "text-amber-400"}`} />
            <span className="text-[#8b949e]">Attendance:</span>
            <span className={`font-bold ${isAttendanceEligible ? "text-emerald-400" : "text-amber-400"}`}>
              {attendanceRatio}%
            </span>
          </div>

          <button
            type="button"
            onClick={() => router.push("/learn")}
            className="flex items-center gap-1.5 rounded-xl bg-[#21262d] px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-rose-950/40 hover:text-rose-400 transition cursor-pointer"
          >
            <LogOut className="size-3.5" />
            <span>Leave</span>
          </button>
        </div>
      </header>

      {/* ───────────────────────────────────────────── */}
      {/* 2. MAIN CLASSROOM LAYOUT                       */}
      {/* ───────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Left / Top: Live Stream Display */}
        <main className="relative flex flex-1 flex-col bg-[#090d13] overflow-hidden">
          {/* Video Stream Stage */}
          <div className="relative flex-1 size-full p-3 flex items-center justify-center overflow-hidden">
            <div className="relative size-full rounded-2xl overflow-hidden bg-[#161b22] border border-[#30363d] flex items-center justify-center">
              {/* Faculty Stream Tile */}
              <div className="relative size-full flex flex-col items-center justify-center bg-gradient-to-tr from-[#090d13] to-[#161b22]">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex size-24 items-center justify-center rounded-full bg-[#0f4c81] text-3xl font-black text-white shadow-2xl animate-pulse">
                    {session.instructor?.name ? session.instructor.name[0] : "Dr"}
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-bold text-slate-200">
                      {session.instructor?.name || "Medical Faculty"}
                    </span>
                    <span className="block text-xs text-[#8b949e]">
                      {session.instructor?.specialization || session.category || "Clinical Rounds"}
                    </span>
                  </div>
                </div>

                {/* Floating Emojis Overlay */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  {floatingEmojis.map((item) => (
                    <div
                      key={item.id}
                      style={{ left: `${item.x}%` }}
                      className="absolute bottom-4 text-3xl animate-float-fade"
                    >
                      {item.emoji}
                    </div>
                  ))}
                </div>

                {/* On-Stage Mic Active Banner for Student */}
                {isSpeakingOnStage && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 rounded-2xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg animate-bounce">
                    <Mic className="size-4 animate-pulse" />
                    <span>You are live on stage! Microphone is active</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Student Interaction Control Bar */}
          <div className="h-16 shrink-0 flex items-center justify-between border-t border-[#30363d] bg-[#161b22] px-4 gap-2">
            {/* Quick Emoji Reaction Buttons */}
            <div className="flex items-center gap-1 sm:gap-2">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleSendReaction(emoji)}
                  className="rounded-xl p-2 text-xl hover:scale-125 active:scale-95 transition cursor-pointer"
                  title="React"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Interaction Actions */}
            <div className="flex items-center gap-2">
              {/* Raise Hand Button */}
              <button
                type="button"
                onClick={toggleRaiseHand}
                className={`flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
                  hasRaisedHand
                    ? "bg-amber-500 text-slate-950 font-black shadow-lg"
                    : "bg-[#21262d] text-slate-200 hover:bg-[#30363d]"
                }`}
              >
                <Hand className={`size-4 ${hasRaisedHand ? "animate-bounce" : ""}`} />
                <span>{hasRaisedHand ? "Hand Raised" : "Raise Hand"}</span>
              </button>

              {/* Ask Voice Doubt Button */}
              <button
                type="button"
                onClick={() => setIsVoiceDoubtOpen(true)}
                className="flex items-center gap-1.5 rounded-2xl bg-[#0f4c81] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#0c3c66] transition cursor-pointer"
              >
                <Mic className="size-4" />
                <span className="hidden sm:inline">Ask Voice Doubt</span>
              </button>
            </div>
          </div>
        </main>

        {/* Right / Bottom: Student Interaction Tabs */}
        <aside className="flex w-full lg:w-96 flex-col border-t lg:border-t-0 lg:border-l border-[#30363d] bg-[#161b22] shrink-0 h-80 lg:h-auto">
          {/* Tab Headers */}
          <div className="flex border-b border-[#30363d] overflow-x-auto scrollbar-none">
            {[
              { id: "chat", label: "Chat", icon: MessageSquare },
              { id: "qa", label: "Q&A", icon: HelpCircle },
              { id: "polls", label: "Polls", icon: BarChart3 },
              { id: "notes", label: "Notes", icon: StickyNote },
              { id: "resources", label: "Handouts", icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as StudentTab)}
                  className={`flex flex-1 items-center justify-center gap-1.5 py-3 px-2 text-xs font-bold transition border-b-2 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "border-[#58a6ff] text-[#58a6ff] bg-[#21262d]/50"
                      : "border-transparent text-[#8b949e] hover:text-slate-200"
                  }`}
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Body */}
          <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
            {/* 1. CHAT */}
            {activeTab === "chat" && (
              <div className="flex flex-1 flex-col size-full overflow-hidden">
                <div ref={chatScrollRef} className="flex-1 p-3 space-y-2.5 overflow-y-auto">
                  {chatMessages.length === 0 ? (
                    <div className="flex size-full flex-col items-center justify-center text-center p-6 text-[#8b949e]">
                      <MessageSquare className="size-8 opacity-30 mb-2" />
                      <p className="text-xs">No chat messages yet</p>
                      <p className="text-[11px] opacity-70">Say hello to the faculty and classmates!</p>
                    </div>
                  ) : (
                    chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`rounded-xl p-2.5 text-xs ${
                          msg.is_announcement
                            ? "bg-amber-950/30 border border-amber-800/40 text-amber-200"
                            : msg.user_id === currentUser.id
                            ? "bg-[#0f4c81]/20 border border-[#0f4c81]/40"
                            : "bg-[#21262d]"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="font-bold text-slate-200">{msg.user_name}</span>
                          {msg.user_role === "host" && (
                            <span className="rounded-md bg-[#0f4c81] px-1.5 py-0.2 text-[9px] font-bold text-white">
                              Faculty
                            </span>
                          )}
                          {msg.is_announcement && (
                            <span className="rounded-md bg-amber-600 px-1.5 py-0.2 text-[9px] font-bold text-white">
                              Notice
                            </span>
                          )}
                        </div>
                        <p className="text-slate-300 break-words">{msg.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="p-3 border-t border-[#30363d] bg-[#161b22]">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 rounded-xl bg-[#21262d] px-3 py-2 text-xs text-slate-100 placeholder-[#8b949e] border border-[#30363d] focus:outline-none focus:border-[#58a6ff]"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-[#0f4c81] p-2 text-white hover:bg-[#0c3c66] transition cursor-pointer"
                    >
                      <Send className="size-4" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 2. Q&A */}
            {activeTab === "qa" && (
              <div className="flex flex-1 flex-col size-full p-3 overflow-y-auto space-y-3">
                <form onSubmit={handleAskQuestion} className="space-y-2">
                  <input
                    type="text"
                    value={newQuestionInput}
                    onChange={(e) => setNewQuestionInput(e.target.value)}
                    placeholder="Ask faculty a clinical question..."
                    className="w-full rounded-xl bg-[#21262d] px-3 py-2 text-xs text-slate-100 border border-[#30363d] placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff]"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#0f4c81] py-2 text-xs font-bold text-white hover:bg-[#0c3c66] transition cursor-pointer"
                  >
                    Post Question
                  </button>
                </form>

                <div className="space-y-2">
                  {questions.map((q) => (
                    <div
                      key={q.id}
                      className={`rounded-xl p-3 border ${
                        q.is_answered
                          ? "bg-[#1f2937]/50 border-emerald-500/30"
                          : "bg-[#21262d] border-[#30363d]"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-slate-200">{q.user_name}</span>
                        <button
                          type="button"
                          onClick={() => handleVoteQuestion(q.id)}
                          className={`flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-bold transition cursor-pointer ${
                            q.has_upvoted
                              ? "bg-[#0f4c81] text-white"
                              : "bg-[#161b22] text-[#8b949e] hover:text-white"
                          }`}
                        >
                          <ThumbsUp className="size-3" />
                          <span>{q.upvotes}</span>
                        </button>
                      </div>
                      <p className="text-xs text-slate-300">{q.question}</p>
                      {q.is_answered && (
                        <div className="mt-2 rounded-lg bg-emerald-950/30 border border-emerald-800/40 p-2 text-[11px] text-emerald-300">
                          <span className="font-bold">Faculty Answer: </span>
                          {q.answer_text}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. POLLS */}
            {activeTab === "polls" && (
              <div className="flex flex-1 flex-col size-full p-3 overflow-y-auto space-y-3">
                {polls.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center text-center p-6 text-[#8b949e]">
                    <BarChart3 className="size-8 opacity-30 mb-2" />
                    <p className="text-xs">No active polls</p>
                    <p className="text-[11px] opacity-70">When the instructor launches a clinical quiz or poll, it will appear here.</p>
                  </div>
                ) : (
                  polls.map((poll) => (
                    <div key={poll.id} className="rounded-2xl bg-[#21262d] p-3.5 border border-[#30363d] space-y-3">
                      <span className="rounded-md bg-[#0f4c81]/20 border border-[#0f4c81]/40 px-2 py-0.5 text-[10px] font-bold text-[#58a6ff]">
                        {poll.status === "active" ? "Active Quiz" : "Closed"}
                      </span>
                      <h4 className="text-xs font-bold text-slate-200">{poll.question}</h4>

                      <div className="space-y-2">
                        {poll.options.map((opt) => {
                          const isVoted = poll.user_voted_option_id === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              disabled={poll.status !== "active"}
                              onClick={() => handleVotePoll(poll.id, opt.id)}
                              className={`flex w-full flex-col gap-1 rounded-xl p-2.5 text-left text-xs transition border cursor-pointer ${
                                isVoted
                                  ? "bg-[#0f4c81]/30 border-[#0f4c81] text-white"
                                  : "bg-[#161b22] border-[#30363d] text-slate-300 hover:border-[#58a6ff]"
                              }`}
                            >
                              <div className="flex justify-between font-semibold">
                                <span>{opt.option_text}</span>
                                {poll.user_voted_option_id && (
                                  <span className="font-bold text-[#58a6ff]">{opt.percentage || 0}%</span>
                                )}
                              </div>
                              {poll.user_voted_option_id && (
                                <div className="h-1.5 w-full rounded-full bg-[#0d1117] overflow-hidden">
                                  <div
                                    style={{ width: `${opt.percentage || 0}%` }}
                                    className="h-full bg-[#0f4c81] rounded-full"
                                  />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 4. NOTES */}
            {activeTab === "notes" && (
              <div className="flex flex-1 flex-col size-full p-3 overflow-y-auto space-y-3">
                <form onSubmit={handleSaveNote} className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-[#8b949e]">
                    <Clock className="size-3.5 text-[#58a6ff]" />
                    <span>
                      Timestamp: {Math.floor(elapsedSeconds / 60)}:
                      {elapsedSeconds % 60 < 10 ? "0" : ""}
                      {elapsedSeconds % 60}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={newNoteInput}
                    onChange={(e) => setNewNoteInput(e.target.value)}
                    placeholder="e.g. Important clinical diagnostic signs..."
                    className="w-full rounded-xl bg-[#21262d] px-3 py-2 text-xs text-slate-100 border border-[#30363d] placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff]"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#0f4c81] py-2 text-xs font-bold text-white hover:bg-[#0c3c66] transition cursor-pointer"
                  >
                    Save Clinical Note
                  </button>
                </form>

                <div className="space-y-2">
                  {notes.map((note) => (
                    <div key={note.id} className="rounded-xl bg-[#21262d] p-2.5 border border-[#30363d] space-y-1">
                      <span className="inline-block rounded-md bg-[#161b22] px-1.5 py-0.5 text-[10px] font-mono font-bold text-[#58a6ff]">
                        {note.formatted_time}
                      </span>
                      <p className="text-xs text-slate-300">{note.note_text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. RESOURCES */}
            {activeTab === "resources" && (
              <div className="flex flex-1 flex-col size-full p-3 overflow-y-auto space-y-2">
                <h3 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-1">
                  Handouts & Reference Materials ({resources.length})
                </h3>
                {resources.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center text-center p-6 text-[#8b949e]">
                    <FileText className="size-8 opacity-30 mb-2" />
                    <p className="text-xs">No materials uploaded</p>
                    <p className="text-[11px] opacity-70">Faculty handouts will appear here for download during the session.</p>
                  </div>
                ) : (
                  resources.map((res) => (
                    <div
                      key={res.id}
                      className="flex items-center justify-between rounded-xl bg-[#21262d] p-3 border border-[#30363d]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="size-4 text-[#58a6ff] shrink-0" />
                        <span className="text-xs font-semibold text-slate-200 truncate">{res.title}</span>
                      </div>
                      <a
                        href={res.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded-lg bg-[#0f4c81] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#0c3c66] transition"
                      >
                        <Download className="size-3" />
                        <span>Get</span>
                      </a>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Voice Doubt Modal */}
      <LiveVoiceDoubtModal
        isOpen={isVoiceDoubtOpen}
        onClose={() => setIsVoiceDoubtOpen(false)}
        onSubmit={handleVoiceDoubtSubmit}
      />
    </div>
  );
}
