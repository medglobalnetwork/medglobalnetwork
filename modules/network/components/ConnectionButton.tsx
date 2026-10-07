"use client";
// modules/network/components/ConnectionButton.tsx
import * as React from "react";
import { UserPlus, Clock, Check, Loader2, UserCheck, X } from "lucide-react";
import type { ConnectionStatus } from "../types";

interface ConnectionButtonProps {
  targetUserId: string;
  initialStatus: ConnectionStatus;
  requestId?: string;
  onStatusChange?: (newStatus: ConnectionStatus) => void;
  onConnectClick?: () => void; // opens the optional modal
  size?: "sm" | "md";
  className?: string;
}

export function ConnectionButton({
  targetUserId,
  initialStatus,
  requestId,
  onStatusChange,
  onConnectClick,
  size = "sm",
  className,
}: ConnectionButtonProps) {
  const [status, setStatus] = React.useState<ConnectionStatus>(initialStatus);
  const [loading, setLoading] = React.useState(false);

  // Sync internal state if initialStatus prop changes from parent
  React.useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  const baseSize =
    size === "sm"
      ? "px-3 py-1.5 text-xs font-bold"
      : "px-4 py-2 text-xs sm:text-sm font-bold";

  const handleAction = async (action: string) => {
    if (loading) return;

    if (action === "connect" && onConnectClick) {
      onConnectClick();
      return;
    }

    const previousStatus = status;

    // Instant optimistic update
    if (action === "connect") {
      setStatus("pending");
      onStatusChange?.("pending");
    } else if (action === "withdraw" || action === "ignore" || action === "disconnect") {
      setStatus("none");
      onStatusChange?.("none");
    } else if (action === "accept") {
      setStatus("connected");
      onStatusChange?.("connected");
    }

    setLoading(true);
    try {
      if (action === "connect") {
        const res = await fetch("/api/network/connections", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ receiverId: targetUserId }),
        });
        const data = await res.json();
        if (!res.ok && !data.success) {
          throw new Error(data.error || "Failed to send request");
        }
        setStatus("pending");
        onStatusChange?.("pending");
      } else if (action === "withdraw" && requestId) {
        const res = await fetch(`/api/network/connections/${requestId}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "withdraw" }),
        });
        if (!res.ok) throw new Error("Failed to withdraw");
      } else if (action === "accept" && requestId) {
        const res = await fetch(`/api/network/connections/${requestId}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "accept" }),
        });
        if (!res.ok) throw new Error("Failed to accept");
      } else if (action === "ignore" && requestId) {
        const res = await fetch(`/api/network/connections/${requestId}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "ignore" }),
        });
        if (!res.ok) throw new Error("Failed to ignore");
      } else if (action === "disconnect" && requestId) {
        const res = await fetch(`/api/network/connections/${requestId}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to disconnect");
      }
    } catch (err) {
      console.error("Connection action failed:", err);
      // Revert on real failure
      setStatus(previousStatus);
      onStatusChange?.(previousStatus);
    } finally {
      setLoading(false);
    }
  };

  if (status === "none") {
    return (
      <button
        type="button"
        onClick={() => handleAction("connect")}
        disabled={loading}
        className={`inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0f4c81] text-white shadow-xs hover:bg-[#0c3c66] transition active:scale-98 disabled:opacity-50 cursor-pointer ${baseSize} ${
          className ?? "w-full"
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="size-3.5 animate-spin shrink-0" />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <UserPlus className="size-3.5 shrink-0" />
            <span>Connect</span>
          </>
        )}
      </button>
    );
  }

  if (status === "pending") {
    return (
      <button
        type="button"
        onClick={() => handleAction("withdraw")}
        disabled={loading}
        title="Request sent. Click to withdraw."
        className={`inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#f8f7f6] dark:bg-[#161b22] text-[#5d5854] dark:text-[#8b949e] transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 cursor-pointer ${baseSize} ${
          className ?? "w-full"
        }`}
      >
        {loading ? (
          <Loader2 className="size-3.5 animate-spin shrink-0" />
        ) : (
          <Clock className="size-3.5 text-amber-600 shrink-0" />
        )}
        <span>Pending</span>
      </button>
    );
  }

  if (status === "received") {
    return (
      <div className={className ? `flex ${className} gap-1.5` : "flex w-full gap-1.5"}>
        <button
          type="button"
          onClick={() => handleAction("accept")}
          disabled={loading}
          className={`flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-[#16804d] text-white hover:bg-[#136c41] transition disabled:opacity-50 cursor-pointer ${baseSize}`}
        >
          {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
          <span>Accept</span>
        </button>
        <button
          type="button"
          onClick={() => handleAction("ignore")}
          disabled={loading}
          className={`flex-1 inline-flex items-center justify-center gap-1 rounded-xl border border-[#ded8d1] bg-[#f8f7f6] text-[#5d5854] hover:bg-[#f0efee] transition disabled:opacity-50 cursor-pointer ${baseSize}`}
        >
          <X className="size-3.5" />
          <span>Ignore</span>
        </button>
      </div>
    );
  }

  if (status === "connected") {
    return (
      <span
        className={
          className ??
          `inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-[#15803d] ${baseSize}`
        }
      >
        <UserCheck className="size-3.5 text-emerald-600 shrink-0" />
        <span>Connected</span>
      </span>
    );
  }

  return null;
}
