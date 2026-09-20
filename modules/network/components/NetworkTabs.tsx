"use client";
// modules/network/components/NetworkTabs.tsx
import * as React from "react";
import { useRouter, usePathname } from "next/navigation";

type NetworkTab = "discover" | "connections" | "invitations" | "following";

interface Tab {
  id: NetworkTab;
  label: string;
  badge?: number;
}

interface NetworkTabsProps {
  activeTab: NetworkTab;
  onChange: (tab: NetworkTab) => void;
  invitationCount?: number;
}

export function NetworkTabs({ activeTab, onChange, invitationCount = 0 }: NetworkTabsProps) {
  const tabs: Tab[] = [
    { id: "discover",     label: "Discover" },
    { id: "connections",  label: "My Network" },
    { id: "invitations",  label: "Invitations", badge: invitationCount > 0 ? invitationCount : undefined },
    { id: "following",    label: "Following" },
  ];

  return (
    <div className="flex gap-0.5 overflow-x-auto rounded-xl border border-[#e8e6e3] bg-[#f8f7f6] p-1 scrollbar-none">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`relative flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition ${
            activeTab === tab.id
              ? "bg-white text-[#1769c2] shadow-xs"
              : "text-[#77716b] hover:text-[#171717]"
          }`}
        >
          {tab.label}
          {tab.badge !== undefined && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1769c2] px-1 text-[9px] font-bold text-white">
              {tab.badge > 99 ? "99+" : tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
