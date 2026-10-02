"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BellOff, Loader2, ArrowLeft, Check } from "lucide-react";

type Notification = {
  id: string;
  type: string;
  entity_type: string | null;
  entity_id: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
  actor_id: string | null;
  actor_name: string | null;
  actor_image: string | null;
};

/** Where a notification's originating entity lives. */
function entityHref(n: Notification): string | null {
  if (!n.entity_type || !n.entity_id) return null;
  switch (n.entity_type) {
    case "event":
      return `/events/${n.entity_id}`;
    case "camp":
      return `/camps/${n.entity_id}`;
    case "course":
      return `/learn/course/${n.entity_id}`;
    case "post":
      return `/network/post/${n.entity_id}`;
    default:
      return null;
  }
}

export default function NotificationsPage() {
  const router = useRouter();
  const [items, setItems] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/network/notifications", {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      setItems(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const markAllRead = React.useCallback(async () => {
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await fetch("/api/network/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
    } catch {
      // Non-critical
    }
  }, []);

  const unread = items.filter((n) => !n.is_read).length;

  return (
    <main className="mx-auto w-full max-w-3xl px-3 py-4 sm:px-6 sm:py-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="rounded-lg p-1.5 text-[#1769c2] transition-colors hover:bg-[#eef5fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2]"
          >
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="text-lg font-bold text-[#171717] dark:text-[#f0f6fc] sm:text-xl">
            Notifications
          </h1>
        </div>
        {unread > 0 && (
          <button
            type="button"
            onClick={() => void markAllRead()}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#1769c2] transition-colors hover:bg-[#eef5fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2]"
          >
            <Check className="size-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-[#64748b]">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[#ded8d1] px-6 py-14 text-center">
          <BellOff className="size-8 text-[#94a3b8]" />
          <p className="text-sm font-semibold text-[#171717] dark:text-[#f0f6fc]">
            Nothing here yet
          </p>
          <p className="text-xs text-[#64748b]">
            Likes, comments, connections and applications will appear here.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => {
            const href = entityHref(n);
            const row = (
              <div
                className={`flex gap-3 rounded-2xl border bg-white p-3.5 shadow-2xs ${
                  n.is_read ? "border-[#e5e0d9]" : "border-[#c9dcf3] bg-[#f8fbff]"
                }`}
              >
                {n.actor_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={n.actor_image}
                    alt=""
                    className="size-9 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#eef5fc] text-[11px] font-bold text-[#1769c2]">
                    M
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] leading-relaxed text-[#171717]">
                    {n.message}
                  </p>
                  <time
                    dateTime={n.created_at}
                    className="mt-1 block text-[11px] text-[#64748b]"
                  >
                    {new Date(n.created_at).toLocaleString(undefined, {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
                {!n.is_read && (
                  <span
                    className="mt-1 size-2 shrink-0 rounded-full bg-[#1769c2]"
                    aria-label="Unread"
                  />
                )}
              </div>
            );

            return (
              <li key={n.id}>
                {href ? (
                  <Link
                    href={href}
                    className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2]"
                  >
                    {row}
                  </Link>
                ) : (
                  row
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}