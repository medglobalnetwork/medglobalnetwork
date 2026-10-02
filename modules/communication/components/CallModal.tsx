"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Shield,
  PhoneIncoming,
} from "lucide-react";
import { getUserAvatarUrl } from "@/lib/avatar";
import { startRingtone, stopRingtone } from "@/lib/ringtone";
import { WebRTCCall, CallPhase, CallPeer } from "../lib/webrtc-call";

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  callType: "VOICE" | "VIDEO";
  peerName: string;
  peerImage?: string | null;
  peerTitle?: string | null;
  /** Peer user id — required to place a real call. */
  peerId?: string | null;
  conversationId?: string | null;
  /** Show accept/decline instead of the outgoing flow. */
  role?: "caller" | "callee";
  /** Pre-existing call to attach to (incoming). */
  callId?: string | null;
  /** Fires once the server-side call exists. */
  onCallStarted?: (callId: string) => void;
  /** Fires when the call finishes, with the connected duration in seconds. */
  onCallEnded?: (callId: string, durationSeconds: number) => void;
}

const PHASE_LABEL: Record<CallPhase, string> = {
  idle: "Preparing call",
  "requesting-media": "Requesting microphone",
  "ringing-out": "Ringing…",
  "ringing-in": "Incoming call",
  connecting: "Connecting…",
  active: "Connected",
  ended: "Call ended",
};

function formatTimer(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function CallModal({
  isOpen,
  onClose,
  callType,
  peerName,
  peerImage,
  peerTitle,
  peerId,
  conversationId,
  role = "caller",
  callId: existingCallId,
  onCallStarted,
  onCallEnded,
}: CallModalProps) {
  const [phase, setPhase] = useState<CallPhase>("idle");
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(callType === "VIDEO");
  const [error, setError] = useState<string | null>(null);

  const engineRef = useRef<WebRTCCall | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const callIdRef = useRef<string | null>(existingCallId ?? null);
  const selfIdRef = useRef<string | null>(null);
  const connectedAtRef = useRef<number | null>(null);
  const onCallEndedRef = useRef(onCallEnded);
  onCallEndedRef.current = onCallEnded;

  /** Ends the server-side call and tears down the peer connection. */
  const hangUp = useCallback(
    async (action: "decline" | "hangup") => {
      const engine = engineRef.current;
      engineRef.current = null;

      stopRingtone();
      await engine?.dispose("local");

      const id = callIdRef.current;
      callIdRef.current = null;

      if (id) {
        await fetch(`/api/calls/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        }).catch(() => {});

        const connectedAt = connectedAtRef.current;
        const durationSeconds = connectedAt
          ? Math.round((Date.now() - connectedAt) / 1000)
          : 0;
        connectedAtRef.current = null;
        onCallEndedRef.current?.(id, durationSeconds);
      }

      onClose();
    },
    [onClose]
  );

  // Reset when the modal opens, and always release media on close/unmount.
  useEffect(() => {
    if (isOpen) {
      setPhase("idle");
      setCallDuration(0);
      setIsMuted(false);
      setVideoOn(callType === "VIDEO");
      setError(null);
      return;
    }

    stopRingtone();
    const engine = engineRef.current;
    engineRef.current = null;
    void engine?.dispose("local");
    callIdRef.current = null;
  }, [isOpen, callType]);

  useEffect(() => {
    return () => {
      stopRingtone();
      void engineRef.current?.dispose("local");
    };
  }, []);

  // Outgoing: create the call, then start the peer connection.
  useEffect(() => {
    if (!isOpen || role !== "caller" || !peerId) return;

    let cancelled = false;

    (async () => {
      try {
        const created = await fetch("/api/calls", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            calleeId: peerId,
            callType,
            conversationId: conversationId ?? undefined,
          }),
        });

        if (cancelled) return;

        if (!created.ok) {
          const body = await created.json().catch(() => ({}));
          throw new Error(body.error ?? "Could not place the call");
        }

        const { call } = await created.json();
        callIdRef.current = call.id;
        onCallStarted?.(call.id);

        const peer: CallPeer = {
          id: peerId,
          name: call.callee_name ?? peerName,
          image: call.callee_image ?? peerImage,
        };

        const engine = new WebRTCCall({
          callId: call.id,
          selfId: selfIdRef.current ?? "",
          peer,
          role: "caller",
          media: callType,
        });
        engineRef.current = engine;

        engine.on("phase", (next) => {
          setPhase(next);
          if (next === "active" && !connectedAtRef.current) {
            connectedAtRef.current = Date.now();
          }
        });
        engine.on("localStream", (stream) => {
          if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        });
        engine.on("remoteStream", (stream) => {
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream;
        });
        engine.on("error", (message) => {
          setError(message);
          void hangUp("hangup");
        });
        engine.on("ended", (reason) => {
          setError(reason === "missed" ? "No answer" : reason === "declined" ? "Call declined" : null);
          void hangUp("hangup");
        });

        await engine.start();
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not place the call");
          onClose();
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, role, peerId, callType, conversationId, peerName, peerImage, hangUp, onClose]);

  // Incoming: attach to the ringing call and ring until answered.
  useEffect(() => {
    if (!isOpen || role !== "callee" || !existingCallId) return;

    startRingtone();
    setPhase("ringing-in");

    const engine = new WebRTCCall({
      callId: existingCallId,
      selfId: selfIdRef.current ?? "",
      peer: { id: peerId ?? "", name: peerName, image: peerImage },
      role: "callee",
      media: callType,
    });
    engineRef.current = engine;

    engine.on("phase", (next) => {
      setPhase(next);
      if (next === "active" && !connectedAtRef.current) {
        connectedAtRef.current = Date.now();
      }
    });
    engine.on("localStream", (stream) => {
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    });
    engine.on("remoteStream", (stream) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream;
    });
    engine.on("ended", () => void hangUp("hangup"));

    // Media is only requested after accept so declining never prompts.
    return () => {
      engineRef.current = null;
      void engine.dispose("local");
      stopRingtone();
    };
  }, [isOpen, role, existingCallId, peerId, peerName, peerImage, callType, hangUp]);

  const handleAccept = async () => {
    const id = callIdRef.current ?? existingCallId;
    if (!id) return;

    stopRingtone();
    callIdRef.current = id;

    const res = await fetch(`/api/calls/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "accept" }),
    }).catch(() => null);

    if (!res || !res.ok) {
      setError("This call is no longer available");
      void hangUp("hangup");
      return;
    }

    try {
      await engineRef.current?.start();
    } catch {
      // The engine already surfaced the media error.
    }
  };

  // Duration timer, only while connected.
  useEffect(() => {
    if (phase !== "active") return;
    const timer = setInterval(() => setCallDuration((d) => d + 1), 1000);
    return () => clearInterval(timer);
  }, [phase]);

  if (!isOpen) return null;

  const avatar = getUserAvatarUrl(peerImage, peerName);
  const isIncoming = role === "callee" && phase === "ringing-in";
  const showVideoArea = callType === "VIDEO" && phase === "active";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${isIncoming ? "Incoming" : "Ongoing"} call with ${peerName}`}
        className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 flex flex-col items-center text-center text-white relative overflow-hidden"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 text-[11px] font-medium text-emerald-400 border border-slate-700/60 mb-6">
          <Shield className="h-3 w-3" />
          <span>Secure peer-to-peer call</span>
        </div>

        {/* Remote video fills the card once media flows. */}
        {showVideoArea && (
          <div className="absolute inset-0">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="h-full w-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          </div>
        )}

        <div className="relative mb-5">
          {!showVideoArea && phase !== "active" && (
            <div className="absolute inset-0 rounded-full animate-ping bg-blue-500/20" />
          )}
          <img
            src={avatar}
            alt={peerName}
            className="h-28 w-28 rounded-full object-cover border-4 border-slate-800 shadow-xl relative z-10"
          />
        </div>

        <h3 className="text-xl font-bold tracking-tight text-white mb-1">{peerName}</h3>
        <p className="text-xs text-slate-400 mb-3">{peerTitle || "Medical Professional"}</p>

        <div className="text-sm font-semibold mb-8 min-h-5">
          {error ? (
            <span className="text-rose-400">{error}</span>
          ) : phase === "active" ? (
            <span className="text-emerald-400 font-mono tracking-wider">
              {formatTimer(callDuration)}
            </span>
          ) : (
            <span className="text-blue-400 animate-pulse">
              {PHASE_LABEL[phase]}
            </span>
          )}
        </div>

        {/* Local self-view */}
        {showVideoArea && (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute top-24 right-4 h-28 w-20 rounded-2xl bg-slate-800 object-cover border border-slate-700 z-10"
          />
        )}

        {isIncoming ? (
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => void hangUp("decline")}
              className="h-14 w-14 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 transition shadow-lg shadow-rose-900/40 flex items-center justify-center"
              aria-label="Decline call"
            >
              <PhoneOff className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => void handleAccept()}
              className="h-14 w-14 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition shadow-lg shadow-emerald-900/40 flex items-center justify-center"
              aria-label="Accept call"
            >
              <PhoneIncoming className="h-6 w-6" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                const next = !isMuted;
                setIsMuted(next);
                engineRef.current?.setMuted(next);
              }}
              className={`h-12 w-12 rounded-full flex items-center justify-center transition ${
                isMuted
                  ? "bg-rose-500 text-white hover:bg-rose-600"
                  : "bg-slate-800 text-slate-200 hover:bg-slate-700"
              }`}
              aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            {callType === "VIDEO" && (
              <button
                type="button"
                onClick={() => {
                  const next = !videoOn;
                  setVideoOn(next);
                  void engineRef.current?.setVideoEnabled(next);
                }}
                className={`h-12 w-12 rounded-full flex items-center justify-center transition ${
                  videoOn
                    ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                    : "bg-rose-500 text-white hover:bg-rose-600"
                }`}
                aria-label={videoOn ? "Turn camera off" : "Turn camera on"}
              >
                {videoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </button>
            )}

            <button
              type="button"
              onClick={() => void hangUp("hangup")}
              className="h-14 w-14 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 active:scale-95 transition shadow-lg shadow-rose-900/40"
              aria-label="End call"
            >
              <PhoneOff className="h-6 w-6" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
