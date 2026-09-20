"use client";
// modules/network/components/ConnectionButton.tsx
import * as React from "react";
import type { ConnectionStatus } from "../types";

interface ConnectionButtonProps {
  targetUserId: string;
  initialStatus: ConnectionStatus;
  requestId?: string;
  onStatusChange?: (newStatus: ConnectionStatus) => void;
  onConnectClick?: () => void; // opens the modal instead of direct send
  size?: "sm" | "md";
}

export function ConnectionButton({
  targetUserId,
  initialStatus,
  requestId,
  onStatusChange,
  onConnectClick,
  size = "sm",
}: ConnectionButtonProps) {
  const [status, setStatus] = React.useState<ConnectionStatus>(initialStatus);
  const [loading, setLoading] = React.useState(false);

  const sizeClasses =
    size === "sm"
      ? "px-3 py-1.5 text-xs"
      : "px-4 py-2 text-sm";

  const handleAction = async (action: string) => {
    setLoading(true);
    try {
      if (action === "connect" && onConnectClick) {
        // Defer to parent modal
        onConnectClick();
        setLoading(false);
        return;
      }

      if (action === "connect") {
        const res = await fetch("/api/network/connections", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ receiverId: targetUserId }),
        });
        if (res.ok) {
          setStatus("pending");
          onStatusChange?.("pending");
        }
      } else if (action === "withdraw" && requestId) {
        await fetch(`/api/network/connections/${requestId}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "withdraw" }),
        });
        setStatus("none");
        onStatusChange?.("none");
      } else if (action === "accept" && requestId) {
        await fetch(`/api/network/connections/${requestId}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "accept" }),
        });
        setStatus("connected");
        onStatusChange?.("connected");
      } else if (action === "ignore" && requestId) {
        await fetch(`/api/network/connections/${requestId}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "ignore" }),
        });
        setStatus("none");
        onStatusChange?.("none");
      } else if (action === "disconnect") {
        await fetch(`/api/network/connections/${requestId}`, {
          method: "DELETE",
          credentials: "include",
        });
        setStatus("none");
        onStatusChange?.("none");
      }
    } catch (err) {
      console.error("Connection action failed:", err);
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
        className={`rounded-xl bg-[#1769c2] font-semibold text-white transition hover:bg-[#12569f] disabled:opacity-50 ${sizeClasses}`}
      >
        {loading ? "…" : "+ Connect"}
      </button>
    );
  }

  if (status === "pending") {
    return (
      <button
        type="button"
        onClick={() => handleAction("withdraw")}
        disabled={loading}
        title="Click to withdraw request"
        className={`rounded-xl border border-[#ded8d1] font-medium text-[#5d5854] transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 ${sizeClasses}`}
      >
        {loading ? "…" : "Requested"}
      </button>
    );
  }

  if (status === "received") {
    return (
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => handleAction("accept")}
          disabled={loading}
          className={`rounded-xl bg-[#1769c2] font-semibold text-white transition hover:bg-[#12569f] disabled:opacity-50 ${sizeClasses}`}
        >
          {loading ? "…" : "Accept"}
        </button>
        <button
          type="button"
          onClick={() => handleAction("ignore")}
          disabled={loading}
          className={`rounded-xl border border-[#ded8d1] font-medium text-[#5d5854] transition hover:bg-[#f8f7f6] disabled:opacity-50 ${sizeClasses}`}
        >
          Ignore
        </button>
      </div>
    );
  }

  if (status === "connected") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-xl border border-[#ded8d1] font-medium text-[#15803d] ${sizeClasses}`}
      >
        <svg className="h-3 w-3 fill-[#15803d]" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
        Connected
      </span>
    );
  }

  return null;
}
