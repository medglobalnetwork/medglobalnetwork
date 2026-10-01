"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  Presentation,
  PenTool,
  Users,
  MessageSquare,
  HelpCircle,
  BarChart3,
  FileText,
  Settings,
  CircleDot,
  Radio,
  Clock,
  CheckCircle2,
  X,
  Volume2,
  VolumeX,
  UserPlus,
  UserX,
  Shield,
  Plus,
  Send,
  Trash2,
  Sparkles,
  Award,
  Download,
  AlertTriangle,
  Play,
  Pause,
  Maximize,
  Pin,
} from "lucide-react";
import {
  LiveSessionRecord,
  LiveChatMessageRecord,
  LiveHandRaiseRecord,
  LiveSpeakerRecord,
  LiveVoiceDoubtRecord,
  LiveQuestionRecord,
  LivePollRecord,
  LivePresenceRecord,
  LiveAttendanceRecord,
  LiveResourceRecord,
} from "@/modules/learn/lib/live-classroom-db";
import { LiveWhiteboard } from "./LiveWhiteboard";

interface InstructorLiveRoomProps {
  session: LiveSessionRecord;
  currentUser: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

type ClassroomTab = "chat" | "participants" | "hands" | "doubts" | "qa" | "polls" | "resources" | "attendance";
type DisplayMode = "camera" | "screen" | "whiteboard" | "presentation";

export function InstructorLiveRoom({ session: initialSession, currentUser }: InstructorLiveRoomProps) {
  const router = useRouter();
  const [session, setSession] = React.useState<LiveSessionRecord>(initialSession);
  const [activeTab, setActiveTab] = React.useState<ClassroomTab>("chat");
  const [displayMode, setDisplayMode] = React.useState<DisplayMode>("camera");

  // Media Controls State
  const [isMicOn, setIsMicOn] = React.useState(true);
  const [isCameraOn, setIsCameraOn] = React.useState(true);
  const [isScreenSharing, setIsScreenSharing] = React.useState(false);
  const [isRecording, setIsRecording] = React.useState(false);
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0);

  // Live Classroom Data Streams
  const [chatMessages, setChatMessages] = React.useState<LiveChatMessageRecord[]>([]);
  const [messageInput, setMessageInput] = React.useState("");
  const [isAnnouncement, setIsAnnouncement] = React.useState(false);

  const [handRaises, setHandRaises] = React.useState<LiveHandRaiseRecord[]>([]);
  const [stageSpeakers, setStageSpeakers] = React.useState<LiveSpeakerRecord[]>([]);
  const [voiceDoubts, setVoiceDoubts] = React.useState<LiveVoiceDoubtRecord[]>([]);
  const [playingDoubtId, setPlayingDoubtId] = React.useState<string | null>(null);

  const [questions, setQuestions] = React.useState<LiveQuestionRecord[]>([]);
  const [answerInputs, setAnswerInputs] = React.useState<Record<string, string>>({});

  const [polls, setPolls] = React.useState<LivePollRecord[]>([]);
  const [newPollQuestion, setNewPollQuestion] = React.useState("");
  const [newPollOptions, setNewPollOptions] = React.useState(["", ""]);
  const [isCreatingPoll, setIsCreatingPoll] = React.useState(false);

  const [presenceList, setPresenceList] = React.useState<LivePresenceRecord[]>([]);
  const [attendanceRoster, setAttendanceRoster] = React.useState<LiveAttendanceRecord[]>([]);
  const [resources, setResources] = React.useState<LiveResourceRecord[]>([]);
  const [newResourceTitle, setNewResourceTitle] = React.useState("");
  const [newResourceUrl, setNewResourceUrl] = React.useState("");
  const [newResourceType, setNewResourceType] = React.useState<"pdf" | "case_study" | "presentation" | "reference">("pdf");

  // Floating Reactions
  const [floatingEmojis, setFloatingEmojis] = React.useState<{ id: string; emoji: string; x: number }[]>([]);

  // Settings & End Class Modals
  const [showSettingsModal, setShowSettingsModal] = React.useState(false);
  const [showEndClassModal, setShowEndClassModal] = React.useState(false);

  // Video Media Refs
  const localVideoRef = React.useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = React.useRef<MediaStream | null>(null);
  const screenStreamRef = React.useRef<MediaStream | null>(null);
  const doubtAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const chatScrollRef = React.useRef<HTMLDivElement | null>(null);

  // Initialize Local Media Stream
  React.useEffect(() => {
    let localStream: MediaStream | null = null;
    const initCamera = async () => {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        mediaStreamRef.current = localStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
      } catch (err) {
        console.warn("Could not access camera/mic automatically:", err);
      }
    };
    initCamera();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Timer & Heartbeat Loop
  React.useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    // Heartbeat Presence every 15 seconds
    const heartbeat = setInterval(async () => {
      try {
        await fetch(`/api/learn/live/sessions/${session.id}/presence`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        console.error("Presence heartbeat error:", err);
      }
    }, 15000);

    return () => {
      clearInterval(timer);
      clearInterval(heartbeat);
    };
  }, [session.id]);

  // Polling for live classroom data
  const fetchData = React.useCallback(async () => {
    try {
      const [chatRes, handsRes, speakersRes, doubtsRes, qaRes, pollsRes, presenceRes, resRes] =
        await Promise.all([
          fetch(`/api/learn/live/sessions/${session.id}/chat?limit=50`),
          fetch(`/api/learn/live/sessions/${session.id}/hand-raise`),
          fetch(`/api/learn/live/sessions/${session.id}/speakers`),
          fetch(`/api/learn/live/sessions/${session.id}/voice-doubts`),
          fetch(`/api/learn/live/sessions/${session.id}/qa`),
          fetch(`/api/learn/live/sessions/${session.id}/polls`),
          fetch(`/api/learn/live/sessions/${session.id}/presence`),
          fetch(`/api/learn/live/sessions/${session.id}/resources`),
        ]);

      if (chatRes.ok) {
        const d = await chatRes.json();
        if (Array.isArray(d.messages)) setChatMessages(d.messages);
      }
      if (handsRes.ok) {
        const d = await handsRes.json();
        if (Array.isArray(d.handRaises)) setHandRaises(d.handRaises);
      }
      if (speakersRes.ok) {
        const d = await speakersRes.json();
        if (Array.isArray(d.speakers)) setStageSpeakers(d.speakers);
      }
      if (doubtsRes.ok) {
        const d = await doubtsRes.json();
        if (Array.isArray(d.doubts)) setVoiceDoubts(d.doubts);
      }
      if (qaRes.ok) {
        const d = await qaRes.json();
        if (Array.isArray(d.questions)) setQuestions(d.questions);
      }
      if (pollsRes.ok) {
        const d = await pollsRes.json();
        if (Array.isArray(d.polls)) setPolls(d.polls);
      }
      if (presenceRes.ok) {
        const d = await presenceRes.json();
        if (Array.isArray(d.presence)) setPresenceList(d.presence);
      }
      if (resRes.ok) {
        const d = await resRes.json();
        if (Array.isArray(d.resources)) setResources(d.resources);
      }
    } catch (err) {
      console.error("Classroom polling error:", err);
    }
  }, [session.id]);

  React.useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Fetch Attendance Roster when attendance tab is open
  React.useEffect(() => {
    if (activeTab === "attendance") {
      const loadAttendance = async () => {
        try {
          const res = await fetch(`/api/learn/live/sessions/${session.id}/attendance`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.attendance)) setAttendanceRoster(data.attendance);
          }
        } catch (err) {
          console.error("Attendance fetch error:", err);
        }
      };
      loadAttendance();
    }
  }, [activeTab, session.id]);

  // Floating reactions poller
  React.useEffect(() => {
    const rxnInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/learn/live/sessions/${session.id}/reactions`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.reactions) && data.reactions.length > 0) {
            data.reactions.forEach((r: any) => {
              for (let i = 0; i < Math.min(r.count, 4); i++) {
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

  // Media Toggle Handlers
  const toggleMic = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !isMicOn;
      });
    }
    setIsMicOn((prev) => !prev);
  };

  const toggleCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !isCameraOn;
      });
    }
    setIsCameraOn((prev) => !prev);
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        screenStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setIsScreenSharing(true);
        setDisplayMode("screen");
        stream.getVideoTracks()[0].onended = () => {
          stopScreenShare();
        };
      } catch (err) {
        console.error("Screen share error:", err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (localVideoRef.current && mediaStreamRef.current) {
      localVideoRef.current.srcObject = mediaStreamRef.current;
    }
    setIsScreenSharing(false);
    setDisplayMode("camera");
  };

  const toggleRecording = async () => {
    try {
      const nextAction = isRecording ? "stop" : "start";
      const res = await fetch(`/api/learn/live/sessions/${session.id}/recording`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: nextAction }),
      });
      if (res.ok) {
        setIsRecording(!isRecording);
      }
    } catch (err) {
      console.error("Recording toggle error:", err);
    }
  };

  // Chat Send Handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    try {
      const res = await fetch(`/api/learn/live/sessions/${session.id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageInput.trim(),
          is_announcement: isAnnouncement,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [...prev, data.message]);
        setMessageInput("");
        setIsAnnouncement(false);
      }
    } catch (err) {
      console.error("Failed to send chat message:", err);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await fetch(`/api/learn/live/sessions/${session.id}/chat?messageId=${messageId}`, {
        method: "DELETE",
      });
      setChatMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  // Hand Raise Actions
  const handleHandAction = async (handRaiseId: string, action: "approved" | "rejected") => {
    try {
      await fetch(`/api/learn/live/sessions/${session.id}/hand-raise`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handRaiseId, status: action }),
      });
      setHandRaises((prev) => prev.filter((h) => h.id !== handRaiseId));
      fetchData();
    } catch (err) {
      console.error("Hand raise action error:", err);
    }
  };

  // Speaker Controls
  const handleRemoveSpeaker = async (userId: string) => {
    try {
      await fetch(`/api/learn/live/sessions/${session.id}/speakers?userId=${userId}`, {
        method: "DELETE",
      });
      setStageSpeakers((prev) => prev.filter((s) => s.user_id !== userId));
    } catch (err) {
      console.error("Remove speaker error:", err);
    }
  };

  // Voice Doubt Audio Playback
  const handlePlayVoiceDoubt = (doubt: LiveVoiceDoubtRecord) => {
    if (playingDoubtId === doubt.id) {
      if (doubtAudioRef.current) {
        doubtAudioRef.current.pause();
      }
      setPlayingDoubtId(null);
    } else {
      if (doubtAudioRef.current) {
        doubtAudioRef.current.pause();
      }
      const audio = new Audio(doubt.audio_url);
      doubtAudioRef.current = audio;
      audio.play();
      setPlayingDoubtId(doubt.id);
      audio.onended = () => setPlayingDoubtId(null);

      // Mark as played
      fetch(`/api/learn/live/sessions/${session.id}/voice-doubts`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doubtId: doubt.id, status: "played" }),
      });
    }
  };

  // Q&A Answer
  const handleAnswerQuestion = async (questionId: string) => {
    const text = answerInputs[questionId];
    if (!text || !text.trim()) return;

    try {
      await fetch(`/api/learn/live/sessions/${session.id}/qa`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, answerText: text.trim() }),
      });
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId
            ? { ...q, is_answered: true, answer_text: text.trim(), answered_by_name: currentUser.name }
            : q
        )
      );
      setAnswerInputs((prev) => ({ ...prev, [questionId]: "" }));
    } catch (err) {
      console.error("Answer question error:", err);
    }
  };

  // Poll Creation
  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = newPollOptions.filter((o) => o.trim().length > 0);
    if (!newPollQuestion.trim() || validOptions.length < 2) return;

    try {
      const res = await fetch(`/api/learn/live/sessions/${session.id}/polls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: newPollQuestion.trim(),
          options: validOptions,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPolls((prev) => [data.poll, ...prev]);
        setNewPollQuestion("");
        setNewPollOptions(["", ""]);
        setIsCreatingPoll(false);
      }
    } catch (err) {
      console.error("Create poll error:", err);
    }
  };

  const handleClosePoll = async (pollId: string) => {
    try {
      await fetch(`/api/learn/live/sessions/${session.id}/polls`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId }),
      });
      setPolls((prev) =>
        prev.map((p) => (p.id === pollId ? { ...p, status: "closed" } : p))
      );
    } catch (err) {
      console.error("Close poll error:", err);
    }
  };

  // Resources Upload
  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResourceTitle.trim() || !newResourceUrl.trim()) return;

    try {
      const res = await fetch(`/api/learn/live/sessions/${session.id}/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newResourceTitle.trim(),
          file_url: newResourceUrl.trim(),
          resource_type: newResourceType,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setResources((prev) => [...prev, data.resource]);
        setNewResourceTitle("");
        setNewResourceUrl("");
      }
    } catch (err) {
      console.error("Add resource error:", err);
    }
  };

  // End Class
  const handleEndClass = async () => {
    try {
      await fetch(`/api/learn/live/sessions/${session.id}/lifecycle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ended" }),
      });
      router.push(`/learn`);
    } catch (err) {
      console.error("End class error:", err);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col bg-[#0d1117] text-slate-100 overflow-hidden select-none">
      {/* ───────────────────────────────────────────── */}
      {/* 1. TOP CONTROL BAR                             */}
      {/* ───────────────────────────────────────────── */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#30363d] bg-[#161b22] px-4">
        {/* Left: Status & Session Info */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex items-center gap-1.5 rounded-full bg-rose-600/20 border border-rose-500/30 px-2.5 py-1 text-xs font-bold text-rose-400">
            <Radio className="size-3.5 animate-pulse" />
            <span>LIVE</span>
          </span>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-slate-100 truncate">{session.title}</h1>
            <div className="flex items-center gap-2 text-[11px] text-[#8b949e]">
              <span>Faculty: {currentUser.name}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {formatTimer(elapsedSeconds)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Presence, Recording & Actions */}
        <div className="flex items-center gap-2">
          {/* Active Participant Counter */}
          <div className="flex items-center gap-1.5 rounded-xl bg-[#21262d] px-3 py-1.5 text-xs font-semibold text-slate-300">
            <Users className="size-3.5 text-[#58a6ff]" />
            <span>{presenceList.length} In Class</span>
          </div>

          {/* Recording Indicator Button */}
          <button
            type="button"
            onClick={toggleRecording}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              isRecording
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse"
                : "bg-[#21262d] text-slate-300 hover:bg-[#30363d]"
            }`}
          >
            <CircleDot className={`size-3.5 ${isRecording ? "text-rose-500" : ""}`} />
            <span>{isRecording ? "REC" : "Record"}</span>
          </button>

          {/* Settings Modal */}
          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="p-2 rounded-xl bg-[#21262d] text-slate-300 hover:bg-[#30363d] transition cursor-pointer"
            title="Classroom Settings"
          >
            <Settings className="size-4" />
          </button>

          {/* End Class Action */}
          <button
            type="button"
            onClick={() => setShowEndClassModal(true)}
            className="rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition cursor-pointer"
          >
            End Class
          </button>
        </div>
      </header>

      {/* ───────────────────────────────────────────── */}
      {/* 2. MAIN CLASSROOM VIEW (Grid layout)           */}
      {/* ───────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: Main Stage (Video, Whiteboard, Presentation) */}
        <main className="relative flex flex-1 flex-col bg-[#090d13] overflow-hidden">
          {/* Main Display Area */}
          <div className="relative flex-1 size-full p-3 flex items-center justify-center overflow-hidden">
            {displayMode === "whiteboard" ? (
              <div className="size-full">
                <LiveWhiteboard sessionId={session.id} isPresenter={true} />
              </div>
            ) : (
              <div className="relative size-full rounded-2xl overflow-hidden bg-[#161b22] border border-[#30363d] flex items-center justify-center">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`size-full object-cover ${!isCameraOn && !isScreenSharing ? "hidden" : ""}`}
                />

                {/* Avatar Fallback if Camera is Off */}
                {!isCameraOn && !isScreenSharing && (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex size-24 items-center justify-center rounded-full bg-[#0f4c81] text-3xl font-black text-white shadow-xl">
                      {currentUser.name[0]}
                    </div>
                    <span className="text-sm font-bold text-slate-300">{currentUser.name} (Faculty)</span>
                    <span className="text-xs text-[#8b949e]">Camera is turned off</span>
                  </div>
                )}

                {/* Stage Speakers Overlay (Multi-speaker grid) */}
                {stageSpeakers.length > 0 && (
                  <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                    {stageSpeakers.map((speaker) => (
                      <div
                        key={speaker.id}
                        className="flex items-center gap-2 rounded-xl bg-black/70 backdrop-blur-md px-3 py-1.5 border border-white/10 text-xs font-semibold text-slate-200"
                      >
                        <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{speaker.user_name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSpeaker(speaker.user_id)}
                          className="ml-1 text-[#8b949e] hover:text-rose-400 transition"
                          title="Remove from stage"
                        >
                          <UserX className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Floating Emojis Layer */}
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
              </div>
            )}
          </div>

          {/* Bottom Floating Control Bar */}
          <div className="h-16 shrink-0 flex items-center justify-center gap-3 border-t border-[#30363d] bg-[#161b22] px-4">
            {/* Mic Toggle */}
            <button
              type="button"
              onClick={toggleMic}
              className={`p-3 rounded-2xl transition cursor-pointer ${
                isMicOn ? "bg-[#21262d] text-slate-200 hover:bg-[#30363d]" : "bg-rose-600 text-white hover:bg-rose-700"
              }`}
              title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
            >
              {isMicOn ? <Mic className="size-5" /> : <MicOff className="size-5" />}
            </button>

            {/* Camera Toggle */}
            <button
              type="button"
              onClick={toggleCamera}
              className={`p-3 rounded-2xl transition cursor-pointer ${
                isCameraOn
                  ? "bg-[#21262d] text-slate-200 hover:bg-[#30363d]"
                  : "bg-rose-600 text-white hover:bg-rose-700"
              }`}
              title={isCameraOn ? "Turn Camera Off" : "Turn Camera On"}
            >
              {isCameraOn ? <Video className="size-5" /> : <VideoOff className="size-5" />}
            </button>

            {/* Screen Share */}
            <button
              type="button"
              onClick={toggleScreenShare}
              className={`p-3 rounded-2xl transition cursor-pointer ${
                isScreenSharing
                  ? "bg-[#0f4c81] text-white"
                  : "bg-[#21262d] text-slate-200 hover:bg-[#30363d]"
              }`}
              title="Share Screen"
            >
              <ScreenShare className="size-5" />
            </button>

            {/* Whiteboard Mode */}
            <button
              type="button"
              onClick={() => setDisplayMode((prev) => (prev === "whiteboard" ? "camera" : "whiteboard"))}
              className={`p-3 rounded-2xl transition cursor-pointer ${
                displayMode === "whiteboard"
                  ? "bg-[#0f4c81] text-white"
                  : "bg-[#21262d] text-slate-200 hover:bg-[#30363d]"
              }`}
              title="Interactive Whiteboard"
            >
              <PenTool className="size-5" />
            </button>
          </div>
        </main>

        {/* Right: Tabbed Interaction & Management Panel */}
        <aside className="flex w-96 flex-col border-l border-[#30363d] bg-[#161b22] shrink-0">
          {/* Tab Navigation */}
          <div className="flex border-b border-[#30363d] overflow-x-auto scrollbar-none">
            {[
              { id: "chat", label: "Chat", icon: MessageSquare, badge: chatMessages.length },
              { id: "hands", label: "Hands", icon: Radio, badge: handRaises.length },
              { id: "doubts", label: "Doubts", icon: Mic, badge: voiceDoubts.length },
              { id: "qa", label: "Q&A", icon: HelpCircle, badge: questions.length },
              { id: "polls", label: "Polls", icon: BarChart3, badge: polls.length },
              { id: "resources", label: "Materials", icon: FileText, badge: resources.length },
              { id: "attendance", label: "Roster", icon: Award, badge: null },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as ClassroomTab)}
                  className={`flex flex-1 items-center justify-center gap-1.5 py-3 px-2 text-xs font-bold transition border-b-2 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "border-[#58a6ff] text-[#58a6ff] bg-[#21262d]/50"
                      : "border-transparent text-[#8b949e] hover:text-slate-200"
                  }`}
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span>{tab.label}</span>
                  {tab.badge !== null && tab.badge > 0 && (
                    <span className="rounded-full bg-[#30363d] px-1.5 py-0.2 text-[10px] font-bold text-slate-300">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Contents */}
          <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
            {/* 1. CHAT TAB */}
            {activeTab === "chat" && (
              <div className="flex flex-1 flex-col size-full overflow-hidden">
                <div ref={chatScrollRef} className="flex-1 p-3 space-y-3 overflow-y-auto">
                  {chatMessages.length === 0 ? (
                    <div className="flex size-full flex-col items-center justify-center text-center p-6 text-[#8b949e]">
                      <MessageSquare className="size-8 opacity-30 mb-2" />
                      <p className="text-xs">No chat messages yet</p>
                      <p className="text-[11px] opacity-70">Learner messages and discussions will appear here in real time.</p>
                    </div>
                  ) : (
                    chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`group relative rounded-xl p-2.5 text-xs transition ${
                          msg.is_announcement
                            ? "bg-amber-950/30 border border-amber-800/40 text-amber-200"
                            : msg.user_id === currentUser.id
                            ? "bg-[#0f4c81]/20 border border-[#0f4c81]/40"
                            : "bg-[#21262d]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
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
                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="opacity-0 group-hover:opacity-100 text-[#8b949e] hover:text-rose-400 transition"
                            title="Delete message"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                        <p className="text-slate-300 break-words">{msg.message}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-[#30363d] bg-[#161b22] space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type a message or announcement..."
                      className="flex-1 rounded-xl bg-[#21262d] px-3 py-2 text-xs text-slate-100 placeholder-[#8b949e] border border-[#30363d] focus:outline-none focus:border-[#58a6ff]"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-[#0f4c81] p-2 text-white hover:bg-[#0c3c66] transition cursor-pointer"
                    >
                      <Send className="size-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#8b949e]">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAnnouncement}
                        onChange={(e) => setIsAnnouncement(e.target.checked)}
                        className="rounded border-[#30363d] bg-[#21262d] text-[#0f4c81]"
                      />
                      <span>Pin as Announcement</span>
                    </label>
                  </div>
                </form>
              </div>
            )}

            {/* 2. RAISED HANDS TAB */}
            {activeTab === "hands" && (
              <div className="flex flex-1 flex-col size-full p-3 overflow-y-auto space-y-2">
                <h3 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-2">
                  Students Requesting to Speak ({handRaises.length})
                </h3>
                {handRaises.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center text-center p-6 text-[#8b949e]">
                    <Radio className="size-8 opacity-30 mb-2" />
                    <p className="text-xs">No hands currently raised</p>
                    <p className="text-[11px] opacity-70">When students raise their hand to ask live questions, they will appear here.</p>
                  </div>
                ) : (
                  handRaises.map((hand) => (
                    <div
                      key={hand.id}
                      className="flex items-center justify-between rounded-xl bg-[#21262d] p-3 border border-[#30363d]"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-200">{hand.user_name}</span>
                        <span className="block text-[10px] text-[#8b949e]">Raised hand</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleHandAction(hand.id, "approved")}
                          className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 transition cursor-pointer"
                        >
                          <UserPlus className="size-3" />
                          <span>Invite</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleHandAction(hand.id, "rejected")}
                          className="rounded-lg bg-[#30363d] p-1 text-[#8b949e] hover:text-rose-400 transition cursor-pointer"
                          title="Dismiss"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 3. VOICE DOUBTS TAB */}
            {activeTab === "doubts" && (
              <div className="flex flex-1 flex-col size-full p-3 overflow-y-auto space-y-2">
                <h3 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-2">
                  Recorded Voice Doubts ({voiceDoubts.length})
                </h3>
                {voiceDoubts.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center text-center p-6 text-[#8b949e]">
                    <Mic className="size-8 opacity-30 mb-2" />
                    <p className="text-xs">No voice doubts submitted</p>
                    <p className="text-[11px] opacity-70">Recorded student audio queries will appear here for you to play and explain.</p>
                  </div>
                ) : (
                  voiceDoubts.map((doubt) => (
                    <div
                      key={doubt.id}
                      className="flex flex-col gap-2 rounded-xl bg-[#21262d] p-3 border border-[#30363d]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">{doubt.user_name}</span>
                        <span className="text-[10px] text-[#8b949e]">{doubt.duration_seconds}s audio</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePlayVoiceDoubt(doubt)}
                        className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition cursor-pointer ${
                          playingDoubtId === doubt.id
                            ? "bg-rose-600 text-white"
                            : "bg-[#0f4c81] text-white hover:bg-[#0c3c66]"
                        }`}
                      >
                        {playingDoubtId === doubt.id ? <Pause className="size-4" /> : <Play className="size-4" />}
                        <span>{playingDoubtId === doubt.id ? "Pause Audio" : "Play Voice Query"}</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 4. Q&A TAB */}
            {activeTab === "qa" && (
              <div className="flex flex-1 flex-col size-full p-3 overflow-y-auto space-y-3">
                <h3 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-1">
                  Questions Queue ({questions.length})
                </h3>
                {questions.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center text-center p-6 text-[#8b949e]">
                    <HelpCircle className="size-8 opacity-30 mb-2" />
                    <p className="text-xs">No Q&A questions yet</p>
                    <p className="text-[11px] opacity-70">Learner questions and upvoted topics will show up here.</p>
                  </div>
                ) : (
                  questions.map((q) => (
                    <div
                      key={q.id}
                      className={`rounded-xl p-3 border ${
                        q.is_answered
                          ? "bg-[#1f2937]/50 border-emerald-500/30"
                          : "bg-[#21262d] border-[#30363d]"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-slate-200">{q.user_name}</span>
                        <span className="text-[11px] font-bold text-[#58a6ff]">👍 {q.upvotes}</span>
                      </div>
                      <p className="text-xs text-slate-300 mb-2">{q.question}</p>

                      {q.is_answered ? (
                        <div className="rounded-lg bg-emerald-950/30 border border-emerald-800/40 p-2 text-[11px] text-emerald-300">
                          <span className="font-bold">Faculty Answer: </span>
                          {q.answer_text}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 mt-2">
                          <input
                            type="text"
                            value={answerInputs[q.id] || ""}
                            onChange={(e) =>
                              setAnswerInputs((prev) => ({ ...prev, [q.id]: e.target.value }))
                            }
                            placeholder="Type faculty answer..."
                            className="flex-1 rounded-lg bg-[#161b22] px-2.5 py-1 text-xs text-slate-100 placeholder-[#8b949e] border border-[#30363d]"
                          />
                          <button
                            type="button"
                            onClick={() => handleAnswerQuestion(q.id)}
                            className="rounded-lg bg-[#0f4c81] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#0c3c66] transition cursor-pointer"
                          >
                            Answer
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 5. POLLS TAB */}
            {activeTab === "polls" && (
              <div className="flex flex-1 flex-col size-full p-3 overflow-y-auto space-y-3">
                {!isCreatingPoll ? (
                  <button
                    type="button"
                    onClick={() => setIsCreatingPoll(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f4c81] py-2.5 text-xs font-bold text-white hover:bg-[#0c3c66] transition cursor-pointer"
                  >
                    <Plus className="size-4" />
                    <span>Create Live Quiz / Poll</span>
                  </button>
                ) : (
                  <form onSubmit={handleCreatePoll} className="rounded-2xl bg-[#21262d] p-3 border border-[#30363d] space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-200">New Clinical Poll</h4>
                    <input
                      type="text"
                      value={newPollQuestion}
                      onChange={(e) => setNewPollQuestion(e.target.value)}
                      placeholder="e.g. Which nerve is most commonly affected in carpal tunnel?"
                      className="w-full rounded-xl bg-[#161b22] px-3 py-2 text-xs text-slate-100 border border-[#30363d] placeholder-[#8b949e]"
                    />
                    <div className="space-y-1.5">
                      {newPollOptions.map((opt, i) => (
                        <input
                          key={i}
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const next = [...newPollOptions];
                            next[i] = e.target.value;
                            setNewPollOptions(next);
                          }}
                          placeholder={`Option ${i + 1}`}
                          className="w-full rounded-lg bg-[#161b22] px-2.5 py-1.5 text-xs text-slate-100 border border-[#30363d] placeholder-[#8b949e]"
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewPollOptions((prev) => [...prev, ""])}
                      className="text-[11px] font-bold text-[#58a6ff] hover:underline"
                    >
                      + Add another option
                    </button>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="submit"
                        className="flex-1 rounded-xl bg-[#0f4c81] py-2 text-xs font-bold text-white hover:bg-[#0c3c66] transition cursor-pointer"
                      >
                        Launch Poll
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCreatingPoll(false)}
                        className="rounded-xl bg-[#30363d] px-3 py-2 text-xs font-bold text-slate-300 hover:bg-[#404752] transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Polls List */}
                {polls.map((poll) => (
                  <div key={poll.id} className="rounded-xl bg-[#21262d] p-3 border border-[#30363d] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase rounded-md px-1.5 py-0.5 ${
                        poll.status === "active" ? "bg-emerald-950 text-emerald-300 border border-emerald-800" : "bg-[#30363d] text-slate-300"
                      }`}>
                        {poll.status}
                      </span>
                      {poll.status === "active" && (
                        <button
                          type="button"
                          onClick={() => handleClosePoll(poll.id)}
                          className="text-[11px] font-bold text-rose-400 hover:underline"
                        >
                          Close Poll
                        </button>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-200">{poll.question}</p>
                    <div className="space-y-1.5">
                      {poll.options.map((opt) => (
                        <div key={opt.id} className="space-y-0.5">
                          <div className="flex justify-between text-[11px] text-slate-300">
                            <span>{opt.option_text}</span>
                            <span className="font-bold">{opt.percentage || 0}% ({opt.vote_count})</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-[#161b22] overflow-hidden">
                            <div
                              style={{ width: `${opt.percentage || 0}%` }}
                              className="h-full bg-[#0f4c81] rounded-full transition-all"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 6. MATERIALS & HANDOUTS TAB */}
            {activeTab === "resources" && (
              <div className="flex flex-1 flex-col size-full p-3 overflow-y-auto space-y-3">
                <form onSubmit={handleAddResource} className="rounded-2xl bg-[#21262d] p-3 border border-[#30363d] space-y-2">
                  <h4 className="text-xs font-bold text-slate-200">Attach Material / PDF</h4>
                  <input
                    type="text"
                    value={newResourceTitle}
                    onChange={(e) => setNewResourceTitle(e.target.value)}
                    placeholder="Document title (e.g. ECG Case Handout)"
                    className="w-full rounded-lg bg-[#161b22] px-2.5 py-1.5 text-xs text-slate-100 border border-[#30363d] placeholder-[#8b949e]"
                  />
                  <input
                    type="url"
                    value={newResourceUrl}
                    onChange={(e) => setNewResourceUrl(e.target.value)}
                    placeholder="File URL / PDF link"
                    className="w-full rounded-lg bg-[#161b22] px-2.5 py-1.5 text-xs text-slate-100 border border-[#30363d] placeholder-[#8b949e]"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#0f4c81] py-2 text-xs font-bold text-white hover:bg-[#0c3c66] transition cursor-pointer"
                  >
                    Attach Resource
                  </button>
                </form>

                <div className="space-y-2">
                  {resources.map((res) => (
                    <div
                      key={res.id}
                      className="flex items-center justify-between rounded-xl bg-[#21262d] p-2.5 border border-[#30363d]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="size-4 text-[#58a6ff] shrink-0" />
                        <span className="text-xs font-semibold text-slate-200 truncate">{res.title}</span>
                      </div>
                      <a
                        href={res.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-[#8b949e] hover:text-white transition"
                      >
                        <Download className="size-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. ATTENDANCE ROSTER TAB */}
            {activeTab === "attendance" && (
              <div className="flex flex-1 flex-col size-full p-3 overflow-y-auto space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#8b949e] mb-1">
                  <span>Student</span>
                  <span>Attendance %</span>
                </div>
                {attendanceRoster.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center text-center p-6 text-[#8b949e]">
                    <Award className="size-8 opacity-30 mb-2" />
                    <p className="text-xs">No attendance recorded yet</p>
                    <p className="text-[11px] opacity-70">Heartbeat tracking records student active duration automatically.</p>
                  </div>
                ) : (
                  attendanceRoster.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between rounded-xl bg-[#21262d] p-2.5 border border-[#30363d]"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-200">{att.user_name}</span>
                        <span className="block text-[10px] text-[#8b949e]">
                          {Math.round(att.total_active_seconds / 60)} mins active
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold ${
                            att.is_eligible ? "text-emerald-400" : "text-amber-400"
                          }`}
                        >
                          {att.attendance_percentage}%
                        </span>
                        {att.is_eligible && (
                          <CheckCircle2 className="size-4 text-emerald-400" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ───────────────────────────────────────────── */}
      {/* 3. SETTINGS MODAL                              */}
      {/* ───────────────────────────────────────────── */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#161b22] border border-[#30363d] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100">Live Classroom Settings</h3>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="text-[#8b949e] hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { key: "enable_chat", label: "Enable Live Chat" },
                { key: "enable_reactions", label: "Enable Emoji Reactions" },
                { key: "enable_qa", label: "Enable Q&A Upvoting" },
                { key: "enable_raise_hand", label: "Enable Hand Raise" },
                { key: "enable_voice_doubts", label: "Enable Voice Doubts" },
              ].map((setting) => (
                <label key={setting.key} className="flex items-center justify-between p-2 rounded-xl bg-[#21262d] cursor-pointer">
                  <span>{setting.label}</span>
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    className="rounded border-[#30363d] bg-[#161b22] text-[#0f4c81]"
                  />
                </label>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowSettingsModal(false)}
              className="w-full rounded-2xl bg-[#0f4c81] py-2.5 text-xs font-bold text-white hover:bg-[#0c3c66]"
            >
              Save Settings
            </button>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────── */}
      {/* 4. END CLASS CONFIRMATION MODAL               */}
      {/* ───────────────────────────────────────────── */}
      {showEndClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#161b22] border border-[#30363d] p-6 shadow-2xl text-center space-y-4">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-500">
              <AlertTriangle className="size-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">End Live Classroom?</h3>
              <p className="mt-1 text-xs text-[#8b949e]">
                This will conclude the live lecture for all participants and trigger attendance calculation & recording processing.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleEndClass}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-700 cursor-pointer"
              >
                Yes, End Class
              </button>
              <button
                type="button"
                onClick={() => setShowEndClassModal(false)}
                className="rounded-xl bg-[#21262d] px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-[#30363d] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
