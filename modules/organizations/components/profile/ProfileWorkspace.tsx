"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  Globe,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Calendar,
  Tent,
  GraduationCap,
  FlaskConical,
  Edit2,
  ExternalLink,
} from "lucide-react";
import { OrganizationRecord, OrgRole, OrgPermission } from "../../types";

interface Props {
  organization: OrganizationRecord;
  userRole?: OrgRole;
  customPermissions?: OrgPermission[];
}

export function ProfileWorkspace({ organization }: Props) {
  const [activeTab, setActiveTab] = useState<"overview" | "departments" | "accreditations">("overview");

  const isVerified = organization.verification_status === "verified";

  return (
    <div className="space-y-6">
      {/* Cover & Brand Header */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800">
        {/* Cover Photo */}
        <div className="h-44 sm:h-56 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 relative">
          {organization.cover_url && (
            <img
              src={organization.cover_url}
              alt="Cover"
              className="size-full object-cover"
            />
          )}
        </div>

        {/* Brand Bar */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-16">
          <div className="flex items-end gap-4">
            <div className="size-24 sm:size-28 rounded-2xl bg-slate-900 border-4 border-slate-950 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl overflow-hidden shrink-0">
              {organization.logo_url ? (
                <img
                  src={organization.logo_url}
                  alt={organization.name}
                  className="size-full object-cover"
                />
              ) : (
                <span>{organization.name.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div className="space-y-1 mb-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">{organization.name}</h1>
                {isVerified && (
                  <span title="Verified Organisation" className="inline-flex items-center">
                    <ShieldCheck className="size-5 text-emerald-400 shrink-0" />
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {organization.organization_type} • {organization.city || "India"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/opportunities/organizations/${organization.id}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
            >
              <span>Public Profile</span>
              <ExternalLink className="size-3.5" />
            </Link>
            <Link
              href={`/org/${organization.id}/settings`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-colors"
            >
              <Edit2 className="size-3.5" />
              <span>Edit Profile</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: About & Verification Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">About Organisation</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {organization.about ||
                organization.description ||
                "No detailed profile description provided yet."}
            </p>

            {organization.specialties && organization.specialties.length > 0 && (
              <div className="pt-3 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Clinical Specialties & Focus Areas
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {organization.specialties.map((s, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-950 text-blue-400 border border-slate-800"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Contact & Regulatory Verification Card */}
        <div className="space-y-6">
          {/* Verification Badge card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              {isVerified ? (
                <ShieldCheck className="size-5 text-emerald-400" />
              ) : (
                <AlertCircle className="size-5 text-amber-400" />
              )}
              <h4 className="text-xs font-bold text-white">
                {isVerified ? "Verified Healthcare Workspace" : "Verification Status"}
              </h4>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">License / Reg:</span>
                <span className="font-mono text-slate-200">
                  {organization.license_number || "Pending"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">GSTIN:</span>
                <span className="font-mono text-slate-200">
                  {organization.gst_number || "Not Registered"}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
            <h4 className="font-bold text-white">Contact & Location</h4>

            {organization.website && (
              <a
                href={organization.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-blue-400 hover:underline"
              >
                <Globe className="size-3.5 shrink-0" />
                <span className="truncate">{organization.website}</span>
              </a>
            )}

            {organization.email && (
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="size-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{organization.email}</span>
              </div>
            )}

            {organization.phone && (
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="size-3.5 text-slate-500 shrink-0" />
                <span>{organization.phone}</span>
              </div>
            )}

            {organization.address && (
              <div className="flex items-start gap-2 text-slate-300 pt-2 border-t border-slate-800">
                <MapPin className="size-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span>
                  {organization.address}, {organization.city}, {organization.state}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
