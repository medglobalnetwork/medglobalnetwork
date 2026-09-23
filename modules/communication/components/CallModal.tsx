"use client";

import React, { useState, useEffect } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, User, Volume2, Shield } from "lucide-react";
import { getUserAvatarUrl } from "@/lib/avatar";

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  callType: "VOICE" | "VIDEO";
  peerName: string;
  peerImage?: string | null;
  peerTitle?: string | null;
}

export function CallModal({
  isOpen,
  onClose,
  callType,
  peerName,
  peerImage,
  peerTitle,
}: CallModalProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === "VOICE");
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<"Connecting..." | "Ringing..." | "Connected">("Connecting...");

  useEffect(() => {
    if (!isOpen) {
      setCallDuration(0);
      setCallStatus("Connecting...");
      return;
    }

    const ringTimeout = setTimeout(() => {
      setCallStatus("Ringing...");
    }, 1500);

    const connectTimeout = setTimeout(() => {
      setCallStatus("Connected");
    }, 3500);

    return () => {
      clearTimeout(ringTimeout);
      clearTimeout(connectTimeout);
    };
  }, [isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && callStatus === "Connected") {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, callStatus]);

  if (!isOpen) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const avatar = getUserAvatarUrl(peerImage, peerName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 flex flex-col items-center text-center text-white overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encrypted indicator */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 text-[11px] font-medium text-emerald-400 border border-slate-700/60 mb-6">
          <Shield className="h-3 w-3" />
          <span>End-to-End Encrypted Medical Call</span>
        </div>

        {/* Peer Avatar & Pulse Animation */}
        <div className="relative mb-5">
          {callStatus !== "Connected" && (
            <div className="absolute inset-0 rounded-full animate-ping bg-blue-500/20" />
          )}
          <img
            src={avatar}
            alt={peerName}
            className="h-28 w-28 rounded-full object-cover border-4 border-slate-800 shadow-xl relative z-10"
          />
        </div>

        {/* Name & Title */}
        <h3 className="text-xl font-bold tracking-tight text-white mb-1">{peerName}</h3>
        <p className="text-xs text-slate-400 mb-3">{peerTitle || "Medical Professional"}</p>

        {/* Status / Duration */}
        <div className="text-sm font-semibold mb-8">
          {callStatus === "Connected" ? (
            <span className="text-emerald-400 font-mono tracking-wider">
              {formatTimer(callDuration)}
            </span>
          ) : (
            <span className="text-blue-400 animate-pulse">{callStatus}</span>
          )}
        </div>

        {/* Controls Toolbar */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className={`h-12 w-12 rounded-full flex items-center justify-center transition ${
              isMuted
                ? "bg-rose-500 text-white hover:bg-rose-600"
                : "bg-slate-800 text-slate-200 hover:bg-slate-700"
            }`}
            title={isMuted ? "Unmute Mic" : "Mute Mic"}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          {callType === "VIDEO" && (
            <button
              type="button"
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`h-12 w-12 rounded-full flex items-center justify-center transition ${
                isVideoOff
                  ? "bg-rose-500 text-white hover:bg-rose-600"
                  : "bg-slate-800 text-slate-200 hover:bg-slate-700"
              }`}
              title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
            >
              {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="h-14 w-14 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 active:scale-95 transition shadow-lg shadow-rose-900/40"
            title="End Call"
          >
            <PhoneOff className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
