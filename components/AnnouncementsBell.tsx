"use client";

import * as React from "react";
import Link from "next/link";
import { Megaphone } from "lucide-react";

const POLL_MS = 60_000;

/**
 * Unread-announcement bell for the app header. Separate from the notification
 * bell in AppHeader, which already tracks social pings.
 */
export function AnnouncementsBell({ className = "" }: { className?: string }) {
  const [unread, setUnread] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch("/api/announcements", { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && typeof data?.unreadCount === "number") {
          setUnread(data.unreadCount);
        }
      } catch {
        // Offline or unauthenticated — keep the last known count.
      }
    };

    void poll();
    const id = setInterval(poll, POLL_MS);

    const onFocus = () => void poll();
    window.addEventListener("focus", onFocus);
    window.addEventListener("mgn-announcement-read", onFocus as EventListener);

    return () => {
      cancelled = true;
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("mgn-announcement-read", onFocus as EventListener);
    };
  }, []);

  if (unread === 0) return null;

  return (
    <Link
      href="/announcements"
      aria-label={`Announcements (${unread} unread)`}
      className={`relative grid place-items-center rounded-lg p-2 text-[#171717] transition-colors hover:bg-[#eef5fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2] ${className}`}
    >
      <Megaphone className="size-6 stroke-[1.9]" />
      <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
        {unread > 9 ? "9+" : unread}
      </span>
    </Link>
  );
}

export default AnnouncementsBell;