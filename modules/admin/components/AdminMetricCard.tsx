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
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  }[badgeColor];

  const iconClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-600 group-hover:text-white",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white",
    amber: "bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-600 group-hover:text-white",
    rose: "bg-rose-50 text-rose-600 border-rose-100 group-hover:bg-rose-600 group-hover:text-white",
    purple: "bg-purple-50 text-purple-600 border-purple-100 group-hover:bg-purple-600 group-hover:text-white",
    slate: "bg-slate-100 text-slate-700 border-slate-200 group-hover:bg-slate-200 group-hover:text-slate-900",
  }[badgeColor];

  const content = (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1 pr-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">{title}</p>
          <div className="mt-2 flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{value}</span>
            {trend && (
              <span
                className={`inline-flex items-center text-[11px] font-bold px-1.5 py-0.5 rounded-md border ${
                  trend.isPositive
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                {trend.isPositive ? "↑" : "↓"} {trend.value}
              </span>
            )}
          </div>
          {subtitle && <p className="mt-1.5 text-xs text-slate-500 leading-normal line-clamp-1">{subtitle}</p>}
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-200 group-hover:scale-105 shadow-2xs ${iconClasses}`}>
            {icon}
          </div>
          {badge && (
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${badgeClasses}`}>
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block transition-transform hover:-translate-y-0.5">{content}</Link>;
  }

  return content;
}
