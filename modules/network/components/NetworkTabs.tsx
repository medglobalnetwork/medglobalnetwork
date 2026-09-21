"use client";
// modules/network/components/NetworkTabs.tsx
import * as React from "react";
import { LayoutGrid, List } from "lucide-react";

export type NetworkTab =
  | "discover"
  | "connections"
  | "invitations"
  | "following"
  | "communities"
  | "organizations";

interface Tab {
  id: NetworkTab;
  label: string;
  badge?: number;
}

interface NetworkTabsProps {
  activeTab: NetworkTab;
  onChange: (tab: NetworkTab) => void;
  invitationCount?: number;
  viewMode?: "grid" | "list";
  onViewModeChange?: (mode: "grid" | "list") => void;
}

export function NetworkTabs({
  activeTab,
  onChange,
  invitationCount = 0,
  viewMode = "grid",
  onViewModeChange,
}: NetworkTabsProps) {
  const tabs: Tab[] = [
    { id: "discover", label: "Discover" },
    { id: "connections", label: "My Network" },
    {
      id: "invitations",
      label: "Invitations",
      badge: invitationCount > 0 ? invitationCount : undefined,
    },
    { id: "following", label: "Following" },
    { id: "communities", label: "Communities" },
    { id: "organizations", label: "Organizations" },
  ];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-[#e8e6e3] bg-[#f8f7f6] p-1 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`relative flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                isActive
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
          );
        })}
      </div>

      {/* Grid / List View Mode Switcher (visible for discover/connections) */}
      {onViewModeChange && (
        <div className="hidden sm:flex items-center gap-1 rounded-xl border border-[#e8e6e3] bg-[#f8f7f6] p-1">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
              viewMode === "grid"
                ? "bg-white text-[#1769c2] shadow-xs"
                : "text-[#77716b] hover:text-[#171717]"
            }`}
            title="Grid View"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Grid</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
              viewMode === "list"
                ? "bg-white text-[#1769c2] shadow-xs"
                : "text-[#77716b] hover:text-[#171717]"
            }`}
            title="List View"
          >
            <List className="h-3.5 w-3.5" />
            <span>List</span>
          </button>
        </div>
      )}
    </div>
  );
}
