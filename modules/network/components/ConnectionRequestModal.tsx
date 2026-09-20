"use client";
// modules/network/components/ConnectionRequestModal.tsx
import * as React from "react";

interface ConnectionRequestModalProps {
  targetName: string;
  targetUserId: string;
  onClose: () => void;
  onSent: () => void;
}

const MAX_CHARS = 300;

export function ConnectionRequestModal({
  targetName,
  targetUserId,
  onClose,
  onSent,
}: ConnectionRequestModalProps) {
  const [message, setMessage] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Close on Escape
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSend = async () => {
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/network/connections", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: targetUserId,
          message: message.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send request");
      }
      onSent();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send request");
    } finally {
      setSending(false);
    }
  };

  const remaining = MAX_CHARS - message.length;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-2xl border border-[#e8e6e3] bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#f0efee] px-5 py-4">
          <h2 className="text-sm font-semibold text-[#171717]">
            Connect with {targetName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-[#8a8784] hover:bg-[#f0efee] hover:text-[#171717]"
            aria-label="Close"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <p className="mb-3 text-xs text-[#77716b]">
            Add a personal note to introduce yourself (optional). This helps{" "}
            {targetName.split(" ")[0]} understand why you&apos;d like to connect.
          </p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, MAX_CHARS))}
            placeholder={`Hi ${targetName.split(" ")[0]}, I'd like to connect with you on MGN.life...`}
            rows={4}
            className="block w-full resize-none rounded-xl border border-[#ded8d1] px-3.5 py-3 text-sm text-[#171717] placeholder:text-[#8a8784] focus:border-[#1769c2] focus:outline-none focus:ring-2 focus:ring-[#1769c2]/20"
          />
          <div className="mt-1.5 flex justify-end">
            <span
              className={`text-[11px] ${remaining < 20 ? "text-red-500" : "text-[#8a8784]"}`}
            >
              {remaining} characters remaining
            </span>
          </div>
          {error && (
            <p className="mt-2 text-xs text-red-600">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-[#f0efee] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#ded8d1] px-4 py-2 text-xs font-medium text-[#5d5854] transition hover:bg-[#f8f7f6]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={sending}
            className="rounded-xl bg-[#1769c2] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#12569f] disabled:opacity-50"
          >
            {sending ? "Sending…" : "Send Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
