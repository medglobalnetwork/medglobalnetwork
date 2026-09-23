"use client";

import React from "react";
import Link from "next/link";
import {
  Calendar,
  Tent,
  Briefcase,
  FlaskConical,
  User,
  GraduationCap,
  ExternalLink,
  Video,
  Clock,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { RichEntitySharePayload } from "../types";

interface RichEntityCardProps {
  entity: RichEntitySharePayload;
  isMe?: boolean;
}

export function RichEntityCard({ entity, isMe = false }: RichEntityCardProps) {
  const getIcon = () => {
    switch (entity.entityType) {
      case "event":
        return <Calendar className="h-4 w-4 text-[#1769c2]" />;
      case "camp":
        return <Tent className="h-4 w-4 text-emerald-600" />;
      case "job":
        return <Briefcase className="h-4 w-4 text-purple-600" />;
      case "research":
        return <FlaskConical className="h-4 w-4 text-amber-600" />;
      case "course":
        return <GraduationCap className="h-4 w-4 text-indigo-600" />;
      case "meeting":
        return <Video className="h-4 w-4 text-blue-600" />;
      default:
        return <User className="h-4 w-4 text-slate-600" />;
    }
  };

  const getBorderColor = () => {
    switch (entity.entityType) {
      case "event":
        return "border-blue-200 bg-blue-50/50";
      case "camp":
        return "border-emerald-200 bg-emerald-50/50";
      case "job":
        return "border-purple-200 bg-purple-50/50";
      case "research":
        return "border-amber-200 bg-amber-50/50";
      case "meeting":
        return "border-blue-300 bg-blue-50/70";
      default:
        return "border-slate-200 bg-slate-50/50";
    }
  };

  return (
    <div
      className={`rounded-xl border p-3 max-w-sm overflow-hidden transition shadow-2xs ${getBorderColor()} ${
        isMe ? "bg-white text-slate-900 border-white/60" : "text-[#171717]"
      }`}
    >
      {/* Header Badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
          {getIcon()}
          {entity.badge || entity.entityType.toUpperCase()}
        </span>
        {entity.entityType === "event" && (
          <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">
            CME / Event
          </span>
        )}
      </div>

      {/* Image if available */}
      {entity.imageUrl && (
        <div className="relative h-28 w-full rounded-lg overflow-hidden mb-2 bg-slate-200">
          <img
            src={entity.imageUrl}
            alt={entity.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Title */}
      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{entity.title}</h4>

      {/* Subtitle / Location / Date */}
      {entity.subtitle && (
        <p className="text-xs text-slate-600 line-clamp-1 mt-0.5 flex items-center gap-1">
          {entity.subtitle}
        </p>
      )}

      {entity.dateOrLocation && (
        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{entity.dateOrLocation}</span>
        </p>
      )}

      {/* Description */}
      {entity.description && (
        <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">
          {entity.description}
        </p>
      )}

      {/* Meeting specific info */}
      {entity.entityType === "meeting" && entity.meta && (
        <div className="mt-2.5 pt-2 border-t border-blue-200/60 flex items-center justify-between text-xs">
          <span className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
            <Clock className="h-3 w-3 text-blue-600" />
            Calendar Synced
          </span>
          {Boolean(entity.meta.meetingLink) && (
            <a
              href={entity.meta.meetingLink as string}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 bg-blue-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg hover:bg-blue-700 transition"
            >
              Join Call
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )}

      {/* Action link */}
      {entity.entityType !== "meeting" && (
        <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">MGN Canonical Entity</span>
          <Link
            href={entity.url}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#1769c2] hover:underline"
          >
            <span>View Details</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
