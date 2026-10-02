// ============================================================
// MGN Push Client (foreground handling)
// lib/push-client.ts
//
// Android delivers a push in two cases: app open (foreground event) or
// app closed (system tray). Both need a tap target that routes somewhere.
// ============================================================

import { PushNotifications } from "@capacitor/push-notifications";
import { isNativePlatform } from "@/lib/native-mobile";

export type IncomingPush = {
  id: string;
  title: string;
  body: string;
  data: Record<string, string>;
};

type Handler = (push: IncomingPush) => void;

let installed = false;

/** Maps a notification's `data` payload to an in-app route. */
export function routeForPush(push: IncomingPush): string {
  const { data } = push;

  if (data.kind === "announcement") return "/announcements";
  if (data.kind === "call") return `/messages?callId=${data.callId ?? ""}`;

  switch (data.type) {
    case "message":
      return data.conversationId ? `/messages?conversation=${data.conversationId}` : "/messages";
    case "connection_request":
    case "connection_accepted":
      return "/network";
    case "certificate_issued":
      return "/learn";
    case "event_registered":
    case "event_status_updated":
      return data.entityId ? `/events/${data.entityId}` : "/events";
    case "research_collaboration_request":
    case "research_collaboration_accepted":
    case "research_collaboration_declined":
    case "research_opp_application":
      return "/research";
    default:
      if (data.type?.startsWith("camp_")) {
        return data.entityId ? `/camps/${data.entityId}` : "/camps";
      }
      if (data.entityType === "post" && data.entityId) {
        return `/network/post/${data.entityId}`;
      }
      return "/notifications";
  }
}

/**
 * Subscribes to foreground pushes. Returns a cleanup function.
 *
 * `handler` fires for both a delivery while the app is open and a tap on
 * the tray notification. Pass `onAction` when a tap should navigate
 * somewhere instead of only showing a toast.
 */
export function listenForPushes(handler: Handler, onAction?: Handler): () => void {
  if (!isNativePlatform() || installed) return () => {};
  installed = true;

  const toPush = (notification: any): IncomingPush => ({
    id: notification.id ?? String(Date.now()),
    title: notification.title ?? "MedGlobalNetwork",
    body: notification.body ?? "",
    data: notification.data ?? {},
  });

  const handles: Array<{ remove: () => Promise<void> }> = [];

  void PushNotifications.addListener("pushNotificationReceived", (notification) =>
    handler(toPush(notification))
  ).then((h) => handles.push(h));

  void PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
    const push = toPush(action.notification);

    // A call push opens the incoming-call UI instead of a page: the user
    // has to accept or decline, not just read.
    if (push.data.kind === "call" && push.data.callId && typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("mgn-incoming-call", {
          detail: { callId: push.data.callId },
        })
      );
    }

    if (onAction) {
      onAction(push);
    } else {
      handler(push);
    }
  }).then((h) => handles.push(h));

  return () => {
    installed = false;
    handles.forEach((h) => void h.remove());
    handles.length = 0;
  };
}