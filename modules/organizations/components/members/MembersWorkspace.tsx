"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Shield,
  Search,
  MoreVertical,
  Mail,
  Building,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  X,
  AlertCircle,
  Plus,
} from "lucide-react";
import {
  OrganizationRecord,
  OrganizationMemberRecord,
  OrganizationCustomRoleRecord,
  OrganizationDepartmentRecord,
  OrgRole,
  OrgPermission,
} from "../../types";
import { getRoleBadgeClass, getRoleDisplayName, hasOrgPermission } from "../../lib/org-permissions";
import { getUserAvatarUrl } from "@/lib/avatar";

interface MembersWorkspaceProps {
  organization: OrganizationRecord;
  userRole?: OrgRole;
  customPermissions?: OrgPermission[];
}

export function MembersWorkspace({
  organization,
  userRole = "VIEWER",
  customPermissions = [],
}: MembersWorkspaceProps) {
  const [members, setMembers] = useState<OrganizationMemberRecord[]>([]);
  const [customRoles, setCustomRoles] = useState<OrganizationCustomRoleRecord[]>([]);
  const [departments, setDepartments] = useState<OrganizationDepartmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Invite Modal State
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<OrgRole>("HR_RECRUITER");
  const [inviteCustomRoleId, setInviteCustomRoleId] = useState("");
  const [inviteDept, setInviteDept] = useState("");
  const [inviteDesignation, setInviteDesignation] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteError, setInviteError] = useState("");

  // Custom Role Modal State
  const [isCustomRoleModalOpen, setIsCustomRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<OrgPermission[]>([]);
  const [roleSaving, setRoleSaving] = useState(false);

  const canManageMembers = hasOrgPermission(userRole, customPermissions, "MEMBERS_MANAGE");
  const canInvite = hasOrgPermission(userRole, customPermissions, "MEMBERS_INVITE");
  const canManageRoles = hasOrgPermission(userRole, customPermissions, "ROLES_MANAGE");

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/org/${organization.id}/members`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        setMembers(data.members || []);
        setCustomRoles(data.customRoles || []);
        setDepartments(data.departments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [organization.id]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviteLoading(true);
    setInviteError("");
    setInviteSuccess(false);

    try {
      const res = await fetch(`/api/org/${organization.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          custom_role_id: inviteRole === "CUSTOM" ? inviteCustomRoleId : undefined,
          department: inviteDept || undefined,
          designation: inviteDesignation || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setInviteError(data.error || "Failed to send invitation");
      } else {
        setInviteSuccess(true);
        setInviteEmail("");
        loadMembers();
        setTimeout(() => {
          setIsInviteOpen(false);
          setInviteSuccess(false);
        }, 1500);
      }
    } catch (err: any) {
      setInviteError(err.message || "Network error");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCreateCustomRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName) return;
    setRoleSaving(true);
    try {
      const res = await fetch(`/api/org/${organization.id}/roles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRoleName,
          description: newRoleDesc,
          permissions: selectedPermissions,
        }),
      });
      if (res.ok) {
        setIsCustomRoleModalOpen(false);
        setNewRoleName("");
        setNewRoleDesc("");
        setSelectedPermissions([]);
        loadMembers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRoleSaving(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member from the organization?")) return;
    try {
      const res = await fetch(`/api/org/${organization.id}/members?memberId=${memberId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadMembers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const togglePermission = (perm: OrgPermission) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      (m.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.department || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.designation || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const availablePermissions: { category: string; permissions: { key: OrgPermission; label: string }[] }[] = [
    {
      category: "Jobs & Recruitment",
      permissions: [
        { key: "JOBS_VIEW", label: "View Jobs" },
        { key: "JOBS_CREATE", label: "Create Jobs" },
        { key: "JOBS_EDIT", label: "Edit Jobs" },
        { key: "APPLICATIONS_VIEW", label: "View Applications" },
        { key: "APPLICATIONS_MANAGE", label: "Manage Candidates & Pipeline" },
        { key: "INTERVIEWS_MANAGE", label: "Schedule Interviews" },
        { key: "CANDIDATES_MESSAGE", label: "Message Candidates" },
      ],
    },
    {
      category: "Events & CME",
      permissions: [
        { key: "EVENTS_VIEW", label: "View Events" },
        { key: "EVENTS_CREATE", label: "Create Events & Webinars" },
        { key: "CONFERENCES_MANAGE", label: "Manage Multi-Track Conferences" },
        { key: "ATTENDANCE_MANAGE", label: "Manage Attendance & Check-in" },
        { key: "CERTIFICATES_ISSUE", label: "Issue Certificates" },
      ],
    },
    {
      category: "Health Camps",
      permissions: [
        { key: "CAMPS_VIEW", label: "View Camps" },
        { key: "CAMPS_CREATE", label: "Create Medical Camps" },
        { key: "VOLUNTEERS_MANAGE", label: "Manage Volunteer Roster" },
        { key: "CAMP_REPORTS_MANAGE", label: "Publish Camp Reports" },
      ],
    },
    {
      category: "Learning & Research",
      permissions: [
        { key: "LEARNING_VIEW", label: "View Courses" },
        { key: "LEARNING_CREATE", label: "Create LMS Courses" },
        { key: "LIVE_CLASSES_MANAGE", label: "Host Live Classes" },
        { key: "RESEARCH_VIEW", label: "View Research" },
        { key: "RESEARCH_CREATE", label: "Create Research Projects" },
      ],
    },
    {
      category: "Governance & Finance",
      permissions: [
        { key: "MEMBERS_INVITE", label: "Invite Team Members" },
        { key: "BILLING_VIEW", label: "View Billing & Invoices" },
        { key: "ANALYTICS_VIEW", label: "View Operational Analytics" },
        { key: "ORG_SETTINGS", label: "Manage Org Settings" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-2">
            <Users className="size-3.5" />
            <span>Team & Access Control</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Team & Organisation Members</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage operational roles, assign department units, invite clinicians, and create custom permission sets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {canManageRoles && (
            <button
              onClick={() => setIsCustomRoleModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
            >
              <Shield className="size-3.5 text-blue-400" />
              <span>Create Custom Role</span>
            </button>
          )}

          {canInvite && (
            <button
              onClick={() => setIsInviteOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-all"
            >
              <UserPlus className="size-4" />
              <span>Invite Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-500 shrink-0">Filter:</span>
          {["all", "OWNER", "ADMIN", "HR_RECRUITER", "EVENT_MANAGER", "CAMP_MANAGER", "LEARNING_MANAGER", "RESEARCH_MANAGER", "CUSTOM"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                roleFilter === r
                  ? "bg-blue-600 text-white font-bold"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {r === "all" ? "All Roles" : getRoleDisplayName(r)}
            </button>
          ))}
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-xs animate-pulse">
            Loading organisation members...
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="size-8 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-semibold">No members found</p>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery ? "Try refining your search query." : "Invite team members to collaborate."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Member</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Designation</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredMembers.map((m) => {
                  const avatar = getUserAvatarUrl(m.user_id, m.image);
                  const isOwner = m.role === "OWNER";

                  return (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={avatar}
                            alt={m.name || "User"}
                            className="size-9 rounded-full object-cover border border-slate-700 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-white block">
                              {m.name || "Unnamed User"}
                            </span>
                            <span className="text-[11px] text-slate-500 block">
                              {m.email || "No email"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getRoleBadgeClass(
                            m.role
                          )}`}
                        >
                          {m.role === "CUSTOM" && m.custom_role_name
                            ? m.custom_role_name
                            : getRoleDisplayName(m.role)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-300">
                        {m.department || <span className="text-slate-600">—</span>}
                      </td>

                      <td className="px-5 py-4 text-slate-300">
                        {m.designation || <span className="text-slate-600">—</span>}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                          <CheckCircle2 className="size-3" /> Active
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        {canManageMembers && !isOwner && (
                          <button
                            onClick={() => handleRemoveMember(m.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Remove Member"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="size-5 text-blue-400" />
                <h2 className="text-base font-bold text-white">Invite Team Member</h2>
              </div>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            {inviteSuccess ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="size-10 text-emerald-400 mx-auto" />
                <h3 className="text-sm font-bold text-white">Invitation Dispatched</h3>
                <p className="text-xs text-slate-400">
                  The clinician will receive workspace access details and can join instantly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-4">
                {inviteError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
                    {inviteError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    User Email or MGN ID *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="doctor@hospital.org"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Role *
                    </label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as OrgRole)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="ADMIN">Organisation Admin</option>
                      <option value="HR_RECRUITER">HR / Recruiter</option>
                      <option value="EVENT_MANAGER">Event Manager</option>
                      <option value="CAMP_MANAGER">Camp Manager</option>
                      <option value="LEARNING_MANAGER">Learning Manager</option>
                      <option value="RESEARCH_MANAGER">Research Manager</option>
                      <option value="MARKETING_MANAGER">Marketing Manager</option>
                      <option value="FINANCE_MANAGER">Finance Manager</option>
                      <option value="MODERATOR">Moderator</option>
                      <option value="VIEWER">Viewer</option>
                      {customRoles.length > 0 && <option value="CUSTOM">Custom Role...</option>}
                    </select>
                  </div>

                  {inviteRole === "CUSTOM" && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Select Custom Role *
                      </label>
                      <select
                        value={inviteCustomRoleId}
                        onChange={(e) => setInviteCustomRoleId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="">Choose role...</option>
                        {customRoles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Department (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Cardiology, HR"
                      value={inviteDept}
                      onChange={(e) => setInviteDept(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Designation / Title (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Consultant, Talent Lead"
                    value={inviteDesignation}
                    onChange={(e) => setInviteDesignation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsInviteOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {inviteLoading ? "Sending..." : "Send Invitation"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Custom Role Builder Modal */}
      {isCustomRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="size-5 text-blue-400" />
                <h2 className="text-base font-bold text-white">Create Custom Role</h2>
              </div>
              <button
                onClick={() => setIsCustomRoleModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomRole} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Role Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hospital HR, Senior Clinical Recruiter"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Brief description of responsibilities..."
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-4 pt-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Select Granular Permissions
                </p>

                {availablePermissions.map((group) => (
                  <div key={group.category} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold text-blue-400">{group.category}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {group.permissions.map((p) => {
                        const isChecked = selectedPermissions.includes(p.key);
                        return (
                          <label
                            key={p.key}
                            className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer border transition-colors ${
                              isChecked
                                ? "bg-blue-600/15 border-blue-500/40 text-white"
                                : "bg-slate-900 border-slate-800/80 text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePermission(p.key)}
                              className="size-3.5 rounded text-blue-600 focus:ring-0"
                            />
                            <span>{p.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCustomRoleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={roleSaving}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all disabled:opacity-50"
                >
                  {roleSaving ? "Saving..." : "Save Custom Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
