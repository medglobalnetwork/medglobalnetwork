"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  Plus,
  Users,
  Lock,
  Globe,
  Shield,
  MessageSquare,
  Search,
  X,
  Sparkles,
} from "lucide-react";
import { OrganizationRecord, OrgRole, OrgPermission } from "../../types";
import { hasOrgPermission } from "../../lib/org-permissions";

interface Props {
  organization: OrganizationRecord;
  userRole?: OrgRole;
  customPermissions?: OrgPermission[];
}

export function GroupsWorkspace({ organization, userRole, customPermissions }: Props) {
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [category, setCategory] = useState("Department");
  const [groupType, setGroupType] = useState<"public" | "private" | "org_only" | "approval_required">("org_only");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const canCreate = hasOrgPermission(userRole, customPermissions, "GROUPS_CREATE");

  const loadGroups = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/org/${organization.id}/groups`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        setGroups(data.groups || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, [organization.id]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/org/${organization.id}/groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: groupName,
          category,
          group_type: groupType,
          description: description || undefined,
        }),
      });
      if (res.ok) {
        setIsCreateOpen(false);
        setGroupName("");
        setDescription("");
        loadGroups();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const CATEGORIES = [
    "Department",
    "Academic",
    "Professional",
    "Study",
    "Research",
    "Clinical",
    "Alumni",
    "Staff",
    "Student",
    "Project",
    "Event",
    "Specialty",
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-2">
            <Compass className="size-3.5" />
            <span>Communities & Circles</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Groups & Communities</h1>
          <p className="text-xs text-slate-400 mt-1">
            Build specialized medical study groups, inter-department channels, and clinical interest circles.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="size-4" />
            <span>Create Group</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full p-12 text-center text-slate-500 text-xs animate-pulse">
            Loading groups...
          </div>
        ) : groups.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
            <Compass className="size-8 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-semibold text-white">No groups created yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Create a clinical community, department circle, or student study group.
            </p>
          </div>
        ) : (
          groups.map((g) => (
            <div
              key={g.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {g.category}
                  </span>
                  <span className="text-[11px] text-slate-400 capitalize flex items-center gap-1">
                    {g.group_type === "private" && <Lock className="size-3 text-slate-500" />}
                    {g.group_type === "public" && <Globe className="size-3 text-slate-500" />}
                    {g.group_type === "org_only" && <Shield className="size-3 text-slate-500" />}
                    {g.group_type.replace("_", " ")}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{g.name}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">{g.description || "No description"}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Users className="size-3.5 text-blue-400" />
                  {g.member_count || 1} Members
                </span>
                <Link
                  href={`/org/${organization.id}/communication?contextType=group&contextId=${g.id}`}
                  className="text-blue-400 font-semibold hover:underline flex items-center gap-1"
                >
                  <MessageSquare className="size-3.5" /> Chat
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Create Group / Community</h2>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Group Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pediatric Cardiology Journal Club"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Privacy Type</label>
                  <select
                    value={groupType}
                    onChange={(e) => setGroupType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="org_only">Organisation Only</option>
                    <option value="public">Public</option>
                    <option value="private">Private (Invite only)</option>
                    <option value="approval_required">Approval Required</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Purpose, discussions topics, and community guidelines..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all disabled:opacity-50"
                >
                  {saving ? "Creating..." : "Create Group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
