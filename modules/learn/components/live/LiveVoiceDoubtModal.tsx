"use client";

import * as React from "react";
import { Mic, Square, Play, Pause, RotateCcw, Send, X, AlertCircle } from "lucide-react";

interface LiveVoiceDoubtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (audioData: string, durationSeconds: number) => Promise<void>;
}

export function LiveVoiceDoubtModal({
  isOpen,
  onClose,
  onSubmit,
}: LiveVoiceDoubtModalProps) {
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordingTime, setRecordingTime] = React.useState(0);
  const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [permissionError, setPermissionError] = React.useState<string | null>(null);

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = React.useRef<HTMLAudioElement | null>(null);

  // Clean up on unmount / close
  React.useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setRecordingTime(0);
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setIsPlaying(false);
    setIsSubmitting(false);
    setPermissionError(null);
  };

  const startRecording = async () => {
    try {
      setPermissionError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 60) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error("Microphone access error:", err);
      setPermissionError("Please enable microphone permissions in your browser to record a voice doubt.");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const togglePlayback = () => {
    if (!audioUrl) return;
    if (!audioElementRef.current) {
      audioElementRef.current = new Audio(audioUrl);
      audioElementRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSend = async () => {
    if (!audioBlob) return;
    setIsSubmitting(true);
    try {
      // Convert Blob to base64 data URL for fast delivery
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        await onSubmit(base64Data, recordingTime);
        setIsSubmitting(false);
        onClose();
      };
    } catch (err) {
      console.error("Failed to submit voice doubt:", err);
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#161b22] border border-[#ded8d1] dark:border-[#30363d] p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-[#0f4c81]/10 dark:bg-[#58a6ff]/10 text-[#0f4c81] dark:text-[#58a6ff]">
              <Mic className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">
                Ask Voice Doubt
              </h3>
              <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
                Record a voice query for faculty review
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#77716b] hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Permission Warning */}
        {permissionError && (
          <div className="flex items-center gap-2 rounded-2xl bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
            <AlertCircle className="size-4 shrink-0" />
            <span>{permissionError}</span>
          </div>
        )}

        {/* Visual Waveform / Recording Status */}
        <div className="flex flex-col items-center justify-center rounded-2xl bg-[#fbfaf9] dark:bg-[#0d1117] p-8 border border-[#ded8d1] dark:border-[#30363d] space-y-4">
          {/* Animated bars */}
          <div className="flex items-center justify-center gap-1.5 h-16 w-full">
            {[40, 65, 85, 30, 95, 75, 45, 90, 60, 80, 50, 70, 90, 40, 65].map((h, i) => (
              <span
                key={i}
                style={{
                  height: isRecording ? `${Math.max(15, (h * (Math.sin(recordingTime * 2 + i) + 1.2)) / 2)}%` : audioBlob ? `${h}%` : "15%",
                }}
                className={`w-1.5 rounded-full transition-all duration-150 ${
                  isRecording
                    ? "bg-rose-500 shadow-[0_0_8px_#f43f5e]"
                    : audioBlob
                    ? "bg-[#0f4c81] dark:bg-[#58a6ff]"
                    : "bg-[#ded8d1] dark:bg-[#30363d]"
                }`}
              />
            ))}
          </div>

          {/* Timer Display */}
          <div className="text-xl font-mono font-bold text-[#171717] dark:text-[#f0f6fc]">
            00:{recordingTime < 10 ? `0${recordingTime}` : recordingTime} / 01:00
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {!audioBlob ? (
            !isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                className="flex items-center gap-2 rounded-full bg-rose-600 px-6 py-3 font-bold text-white shadow-lg hover:bg-rose-700 transition cursor-pointer"
              >
                <Mic className="size-5" />
                <span>Start Recording</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="flex items-center gap-2 rounded-full bg-slate-900 dark:bg-slate-100 px-6 py-3 font-bold text-white dark:text-slate-900 shadow-lg hover:opacity-90 transition cursor-pointer animate-pulse"
              >
                <Square className="size-5" />
                <span>Stop</span>
              </button>
            )
          ) : (
            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                onClick={togglePlayback}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#eef5fc] dark:bg-[#1c2433] py-3 text-sm font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:bg-[#0f4c81] hover:text-white transition cursor-pointer"
              >
                {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
                <span>{isPlaying ? "Pause Preview" : "Play Preview"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAudioBlob(null);
                  if (audioUrl) URL.revokeObjectURL(audioUrl);
                  setAudioUrl(null);
                  setRecordingTime(0);
                }}
                className="p-3 rounded-2xl border border-[#ded8d1] dark:border-[#30363d] text-[#5d5854] dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
                title="Re-record"
              >
                <RotateCcw className="size-4" />
              </button>

              <button
                type="button"
                onClick={handleSend}
                disabled={isSubmitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0f4c81] dark:bg-[#1f6feb] py-3 text-sm font-bold text-white hover:bg-[#0c3c66] disabled:opacity-50 transition cursor-pointer"
              >
                <Send className="size-4" />
                <span>{isSubmitting ? "Sending..." : "Send Doubt"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
