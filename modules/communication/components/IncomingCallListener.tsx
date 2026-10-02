"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { CallModal } from "@/modules/communication/components/CallModal";

/** Raised by lib/push-client when a call push arrives while the app is open. */
export const INCOMING_CALL_EVENT = "mgn-incoming-call";

const POLL_MS = 8000;

type IncomingCall = {
  callId: string;
  callType: "VOICE" | "VIDEO";
  peerId: string;
  peerName: string;
  peerImage?: string | null;
  peerTitle?: string | null;
};

/**
 * Watches for calls addressed to this user and shows the incoming-call UI.
 *
 * Two triggers, deliberately:
 *  - a foreground FCM push (instant), and
 *  - a polling fallback (works before FCM credentials exist, and covers
 *    the case where the WebView was suspended when the push landed).
 */
export function IncomingCallListener() {
  const [incoming, setIncoming] = useState<IncomingCall | null>(null);
  const handledRef = useRef<string | null>(null);

  const openCall = useCallback(async (callId: string) => {
    if (handledRef.current === callId) return;
    handledRef.current = callId;

    try {
      const res = await fetch(`/api/calls/${callId}`, { credentials: "include" });
      if (!res.ok) {
        handledRef.current = null;
        return;
      }
      const { call } = await res.json();

      setIncoming({
        callId: call.id,
        callType: call.call_type === "VIDEO" ? "VIDEO" : "VOICE",
        peerId: call.caller_id,
        peerName: call.caller_name ?? "Unknown caller",
        peerImage: call.caller_image ?? null,
        peerTitle: call.caller_title ?? null,
      });
    } catch {
      handledRef.current = null;
    }
  }, []);

  const checkForIncoming = useCallback(async () => {
    if (document.visibilityState !== "visible") return;
    try {
      const res = await fetch("/api/calls", { credentials: "include" });
      if (!res.ok) return;
      const { incoming: ringing } = await res.json();
      if (ringing?.id) void openCall(ringing.id);
    } catch {
      // Offline — the next tick retries.
    }
  }, [openCall]);

  useEffect(() => {
    void checkForIncoming();

    const interval = setInterval(() => void checkForIncoming(), POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void checkForIncoming();
    };
    document.addEventListener("visibilitychange", onVisible);

    const onPush = (event: Event) => {
      const callId = (event as CustomEvent<{ callId?: string }>).detail?.callId;
      if (callId) void openCall(callId);
    };
    window.addEventListener(INCOMING_CALL_EVENT, onPush as EventListener);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener(INCOMING_CALL_EVENT, onPush as EventListener);
    };
  }, [checkForIncoming, openCall]);

  return (
    <CallModal
      isOpen={incoming !== null}
      onClose={() => setIncoming(null)}
      role="callee"
      callId={incoming?.callId ?? null}
      callType={incoming?.callType ?? "VOICE"}
      peerId={incoming?.peerId ?? null}
      peerName={incoming?.peerName ?? ""}
      peerImage={incoming?.peerImage ?? null}
      peerTitle={incoming?.peerTitle ?? null}
    />
  );
}
