"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { CallModal } from "@/modules/communication/components/CallModal";
import { isNativePlatform } from "@/lib/native-mobile";

/** Raised by lib/push-client when a call push arrives while the app is open. */
export const INCOMING_CALL_EVENT = "mgn-incoming-call";

/**
 * Native gets a foreground FCM push, so a 5 s poll is enough as a safety
 * net. On the web there is no push at all, so polling is the only signal —
 * but it runs at a slower rate and pauses on hidden tabs so it does not
 * cost every visitor a request every few seconds.
 */
const NATIVE_POLL_MS = 5000;
const WEB_POLL_MS = 20000;

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
    // Scheduled rather than called inline: the probe is a network request,
    // and running it in the effect body would render synchronously first.
    const initial = setTimeout(() => void checkForIncoming(), 0);

    const interval = setInterval(
      () => void checkForIncoming(),
      isNativePlatform() ? NATIVE_POLL_MS : WEB_POLL_MS
    );
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
      clearTimeout(initial);
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
