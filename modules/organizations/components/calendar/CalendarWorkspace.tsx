"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Filter,
  Briefcase,
  Layers,
  Tent,
  GraduationCap,
  FlaskConical,
  Clock,
  MapPin,
  Sparkles,
} from "lucide-react";
import { OrganizationRecord, OrgRole, OrgPermission } from "../../types";

interface Props {
  organization: OrganizationRecord;
  userRole?: OrgRole;
  customPermissions?: OrgPermission[];
}

export function CalendarWorkspace({ organization }: Props) {
  const [filter, setFilter] = useState<"all" | "jobs" | "events" | "camps" | "learning" | "research">("all");
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/org/${organization.id}/calendar?type=${filter}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => setItems(d.items || []))
      .catch(() => setItems([]))
      .finally(() => setIsLoading(false));
  }, [organization.id, filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-2">
            <Calendar className="size-3.5" />
            <span>Master Organization Schedule</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Central Operations Calendar</h1>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated operational timetable for job application deadlines, webinars, CME conferences, health camps, and live classes.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {[
            { id: "all", label: "All Items" },
            { id: "jobs", label: "Jobs" },
            { id: "events", label: "Events & CME" },
            { id: "camps", label: "Health Camps" },
            { id: "learning", label: "Learning" },
            { id: "research", label: "Research" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === t.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-xs animate-pulse">
            Loading scheduled operations...
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center bg-slate-950/40 rounded-xl border border-slate-800">
            <Calendar className="size-8 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-semibold text-white">No scheduled events found</p>
            <p className="text-xs text-slate-500 mt-1">
              Events, camps, and interview schedules created across the workspace will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {item.type}
                    </span>
                    <span className="font-bold text-white text-sm">{item.title}</span>
                  </div>
                  <p className="text-slate-400 flex items-center gap-2">
                    <Clock className="size-3.5 text-slate-500" />
                    <span>{new Date(item.date).toLocaleString()}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
