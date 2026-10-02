"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { listenForPushes, routeForPush, type IncomingPush } from "@/lib/push-client";
import { triggerHaptic } from "@/lib/native-mobile";

const DISMISS_AFTER_MS = 6000;

function initials(name?: string | null): string {
  if (!name) return "M";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Shows a native push that arrived while the app was in the foreground.
 * Tap routes to the entity; the tray notification handles the background case.
 */
export function PushToast() {
  const router = useRouter();
  const [push, setPush] = React.useState<IncomingPush | null>(null);
  const [leaving, setLeaving] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = React.useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setLeaving(true);
    // Let the exit transition run before unmounting the card.
    setTimeout(() => {
      setPush(null);
      setLeaving(false);
    }, 220);
  }, []);

  React.useEffect(() => {
    const stop = listenForPushes(
      (incoming) => {
        setLeaving(false);
        setPush(incoming);
        void triggerHaptic();
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(clear, DISMISS_AFTER_MS);
      },
      // Tapping the tray notification navigates rather than re-showing a toast.
      (incoming) => {
        router.push(routeForPush(incoming));
      }
    );
    return stop;
  }, [clear, router]);

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  if (!push) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex justify-center px-3 pt-3 sm:px-4"
    >
      <div
        className={`pointer-events-auto relative w-full max-w-md overflow-hidden rounded-2xl border border-[#cfe0f5] bg-white shadow-2xl transition-all duration-200 ${
          leaving ? "-translate-y-2 opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        <button
          type="button"
          onClick={() => {
            const target = routeForPush(push);
            clear();
            router.push(target);
          }}
          className="flex w-full items-start gap-3 p-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1769c2]"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#0f4c81] text-[11px] font-bold text-white">
            {initials(push.title)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-bold uppercase tracking-wide text-[#1769c2]">
              {push.title}
            </span>
            <span className="mt-0.5 block line-clamp-3 text-[13px] leading-snug text-[#171717]">
              {push.body}
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={clear}
          aria-label="Dismiss notification"
          className="absolute right-2 top-2 rounded-lg p-1 text-[#94a3b8] transition-colors hover:bg-[#eef5fc] hover:text-[#475569] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2]"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}

export default PushToast;