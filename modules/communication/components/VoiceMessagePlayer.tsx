"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

interface VoiceMessagePlayerProps {
  durationSeconds?: number;
  waveform?: number[];
  audioUrl?: string;
  isMe?: boolean;
}

export function VoiceMessagePlayer({
  durationSeconds = 12,
  waveform = [30, 45, 20, 60, 80, 50, 40, 70, 95, 60, 40, 55, 30, 45, 65, 35, 20],
  audioUrl,
  isMe = false,
}: VoiceMessagePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= durationSeconds) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, durationSeconds]);

  const togglePlay = () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`flex items-center gap-3 p-2 rounded-xl max-w-xs ${
        isMe ? "bg-blue-700/60 text-white" : "bg-[#f5f4f2] text-[#171717]"
      }`}
    >
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => {
            setIsPlaying(false);
            setCurrentTime(0);
          }}
        />
      )}

      <button
        type="button"
        onClick={togglePlay}
        className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center transition ${
          isMe
            ? "bg-white text-[#1769c2] hover:bg-blue-50"
            : "bg-[#1769c2] text-white hover:bg-[#12569f]"
        }`}
        aria-label={isPlaying ? "Pause voice note" : "Play voice note"}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
      </button>

      {/* Waveform bars */}
      <div className="flex-1 flex items-center gap-0.5 h-7">
        {waveform.map((height, idx) => {
          const progress = (currentTime / (durationSeconds || 1)) * waveform.length;
          const isPassed = idx <= progress;
          return (
            <div
              key={idx}
              className={`w-1 rounded-full transition-all duration-150 ${
                isPassed
                  ? isMe
                    ? "bg-white"
                    : "bg-[#1769c2]"
                  : isMe
                  ? "bg-white/40"
                  : "bg-[#ded8d1]"
              }`}
              style={{ height: `${Math.max(20, Math.min(100, height))}%` }}
            />
          );
        })}
      </div>

      <div className="text-[11px] font-mono font-medium shrink-0">
        {formatTime(isPlaying ? currentTime : durationSeconds)}
      </div>
    </div>
  );
}
