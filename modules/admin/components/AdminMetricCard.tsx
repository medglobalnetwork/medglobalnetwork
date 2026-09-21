"use client";

import React from "react";
import Link from "next/link";

interface AdminMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  icon: React.ReactNode;
  href?: string;
  badge?: string;
  badgeColor?: "blue" | "emerald" | "amber" | "rose" | "purple" | "slate";
}

export function AdminMetricCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  href,
  badge,
  badgeColor = "blue",
}: AdminMetricCardProps) {
  const badgeClasses = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    slate: "bg-slate-700/50 text-slate-300 border-slate-600",
  }[badgeColor];

  const content = (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg backdrop-blur-sm transition-all duration-200 hover:border-slate-700 hover:bg-slate-900 hover:shadow-xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{value}</span>
            {trend && (
              <span
                className={`text-xs font-semibold ${
                  trend.isPositive ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {trend.isPositive ? "↑" : "↓"} {trend.value}
              </span>
            )}
          </div>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800/80 text-blue-400 ring-1 ring-slate-700/50 group-hover:scale-105 group-hover:bg-blue-500/10 group-hover:text-blue-300 transition-transform">
            {icon}
          </div>
          {badge && (
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badgeClasses}`}>
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }

  return content;
}
