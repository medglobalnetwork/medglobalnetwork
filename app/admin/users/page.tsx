"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AdminDataTable,
  ColumnDef,
  FacetFilter,
} from "@/modules/admin/components/AdminDataTable";
import { AdminDrawer } from "@/modules/admin/components/AdminDrawer";
import { AdminConfirmDialog } from "@/modules/admin/components/AdminConfirmDialog";
import {
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Award,
  Key,
  Mail,
  MapPin,
  Building,
  Calendar,
  Eye,
  CheckCircle,
  XCircle,
  Folder,
  PauseCircle,
  Trash2,
  Lock,
  Unlock,
  AlertOctagon,
} from "lucide-react";

import { MemberBadge } from "@/modules/network/components/MemberBadge";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  memberId?: string;
  isFoundingMember?: boolean;
  membershipTier?: string;
  profession: string;
  specialization: string;
  designation?: string;
  organization?: string;
  city?: string;
  state?: string;
  medicalCouncil?: string;
  registrationNumber?: string;
  identityVerified: boolean;
  registrationVerified: boolean;
  educationVerified: boolean;
  adminRoles: string[];
  status: string;
  accountStatus?: string;
  statusReason?: string | null;
  banned?: boolean;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(false);
  const [customMemberIdInput, setCustomMemberIdInput] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: (reason?: string) => void;
    requireReason?: boolean;
    variant?: "danger" | "warning" | "success" | "primary";
    confirmLabel?: string;
  }>({
    isOpen: false,
    title: "",
    description: "",
    action: () => {},
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleVerification = async (
    userId: string,
    type: "identity" | "registration" | "education",
    value: boolean,
    reason?: string
  ) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_verification",
          userId,
          type,
          value,
          reason,
        }),
      });
      if (res.ok) {
        fetchUsers();
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser((prev) =>
            prev
              ? {
                  ...prev,
                  ...(type === "registration" && { registrationVerified: value }),
                  ...(type === "identity" && { identityVerified: value }),
                  ...(type === "education" && { educationVerified: value }),
                }
              : null
          );
        }
      }
    } catch (err) {
      console.error("Error updating verification:", err);
    }
  };

  const handleToggleFounding = async (userId: string, isFounding: boolean) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_founding_status",
          userId,
          isFounding,
        }),
      });
      if (res.ok) {
        fetchUsers();
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser((prev) =>
            prev ? { ...prev, isFoundingMember: isFounding } : null
          );
        }
        setConfirmDialog((p) => ({ ...p, isOpen: false }));
      }
    } catch (err) {
      console.error("Error updating founding status:", err);
    }
  };

  const handleUpdateMemberId = async (userId: string, newMemberId: string) => {
    if (!newMemberId.trim()) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_member_id",
          userId,
          memberId: newMemberId.trim().toUpperCase(),
        }),
      });
      if (res.ok) {
        fetchUsers();
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser((prev) =>
            prev ? { ...prev, memberId: newMemberId.trim().toUpperCase() } : null
          );
        }
        setEditingMemberId(false);
      }
    } catch (err) {
      console.error("Error updating member id:", err);
    }
  };

  const handleAssignRole = async (userId: string, role: string, reason?: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "assign_role",
          userId,
          role,
          reason,
        }),
      });
      if (res.ok) {
        fetchUsers();
        setConfirmDialog((p) => ({ ...p, isOpen: false }));
      }
    } catch (err) {
      console.error("Error assigning role:", err);
    }
  };

  const handleModerationAction = async (
    userId: string,
    action: "ban_user" | "suspend_user" | "hold_user" | "activate_user" | "delete_user",
    reason?: string
  ) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, userId, reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Action failed");
        return;
      }
      setConfirmDialog((p) => ({ ...p, isOpen: false }));
      if (action === "delete_user") {
        setDrawerOpen(false);
        setSelectedUser(null);
      }
      await fetchUsers();
      if (selectedUser && selectedUser.id === userId && action !== "delete_user") {
        setSelectedUser((prev) =>
          prev
            ? {
                ...prev,
                accountStatus:
                  action === "ban_user"
                    ? "BANNED"
                    : action === "suspend_user"
                    ? "SUSPENDED"
                    : action === "hold_user"
                    ? "ON_HOLD"
                    : "ACTIVE",
                status:
                  action === "ban_user"
                    ? "banned"
                    : action === "suspend_user"
                    ? "suspended"
                    : action === "hold_user"
                    ? "on_hold"
                    : "active",
                banned: action === "ban_user",
                statusReason: reason || null,
              }
            : null
        );
      }
    } catch (err: any) {
      console.error("Error executing moderation action:", err);
      alert("Network error: " + err.message);
    }
  };

  const columns: ColumnDef<UserRecord>[] = [
    {
      key: "name",
      header: "Clinician / Member",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.image ? (
            <img
              src={row.image}
              alt={row.name}
              className="h-9 w-9 rounded-full object-cover border border-slate-200 ring-2 ring-blue-500/20"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-bold text-white text-xs shadow-xs">
              {row.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5 font-bold text-slate-900 flex-wrap">
              <span>{row.name}</span>
              {row.registrationVerified && (
                <span title="Council Verified">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: "memberId",
      header: "Member ID",
      sortable: true,
      render: (row) => (
        <MemberBadge
          memberId={row.memberId}
          isFoundingMember={row.isFoundingMember}
          membershipTier={row.membershipTier}
          size="xs"
        />
      ),
    },
    {
      key: "profession",
      header: "Profession & Specialty",
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-800">{row.profession}</span>
          <p className="text-[11px] text-slate-500">{row.specialization}</p>
        </div>
      ),
    },
    {
      key: "registrationNumber",
      header: "Council Reg #",
      render: (row) =>
        row.registrationNumber ? (
          <div>
            <span className="font-mono text-xs text-blue-600 font-bold">
              {row.registrationNumber}
            </span>
            <p className="text-[10px] text-slate-500 truncate max-w-[140px]">
              {row.medicalCouncil || "State Council"}
            </p>
          </div>
        ) : (
          <span className="text-slate-400 italic">Not Provided</span>
        ),
    },
    {
      key: "status",
      header: "Governance & Status",
      render: (row) => {
        const accStatus = (row.accountStatus || row.status || "").toUpperCase();
        return (
          <div className="flex flex-wrap items-center gap-1">
            {accStatus === "BANNED" || row.banned ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 border border-rose-300 px-2 py-0.5 text-[10px] font-black text-rose-800">
                <ShieldAlert className="h-3 w-3 text-rose-600" />
                BANNED
              </span>
            ) : accStatus === "SUSPENDED" || accStatus === "RESTRICTED" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 border border-orange-300 px-2 py-0.5 text-[10px] font-bold text-orange-900">
                <Lock className="h-3 w-3 text-orange-600" />
                SUSPENDED
              </span>
            ) : accStatus === "ON_HOLD" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                <PauseCircle className="h-3 w-3 text-amber-600" />
                ON HOLD
              </span>
            ) : accStatus === "REJECTED" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                <XCircle className="h-3 w-3 text-rose-600" />
                Rejected
              </span>
            ) : row.registrationVerified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                <CheckCircle className="h-3 w-3 text-emerald-600" />
                Verified
              </span>
            ) : row.registrationNumber ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                Pending KYC
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                Active
              </span>
            )}

            {row.adminRoles && row.adminRoles.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-purple-50 border border-purple-200 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                {row.adminRoles[0]}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "Action",
      align: "right",
      render: (row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedUser(row);
            setDrawerOpen(true);
          }}
          className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
        >
          <Eye className="h-3.5 w-3.5 text-slate-500" />
          <span>Inspect</span>
        </button>
      ),
    },
  ];

  const filters: FacetFilter[] = [
    {
      key: "profession",
      label: "Professions",
      options: [
        { label: "Doctor / Physician", value: "Doctor / Physician" },
        { label: "Surgeon", value: "Surgeon" },
        { label: "Medical Student / Intern", value: "Medical Student / Intern" },
        { label: "Dentist", value: "Dentist" },
        { label: "Nurse Practitioner", value: "Nurse Practitioner" },
      ],
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
            Clinicians & User Directory Control Plane
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Search, inspect, and manage verified healthcare professionals, credentials, and access roles.
          </p>
        </div>
        <Link
          href="/admin/files"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs rounded-xl w-fit"
        >
          <Folder className="size-4 text-amber-300" />
          <span>Open User File Manager</span>
        </Link>
      </div>

      {/* Main Data Table */}
      <AdminDataTable
        columns={columns}
        data={users}
        isLoading={loading}
        onRefresh={fetchUsers}
        searchPlaceholder="Search by name, email, or registration number..."
        filters={filters}
        onRowClick={(row) => {
          setSelectedUser(row);
          setDrawerOpen(true);
        }}
        title="All Registered Members"
        subtitle={`Total registered accounts: ${users.length}`}
      />

      {/* User Detail & KYC Inspection Drawer */}
      <AdminDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedUser?.name || "Clinician Inspection"}
        subtitle={`User ID: ${selectedUser?.id}`}
        footer={
          selectedUser && (
            <>
              <Link
                href={`/admin/files?userId=${encodeURIComponent(selectedUser.id)}`}
                className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 shadow-2xs inline-flex items-center gap-1.5"
              >
                <Folder className="size-3.5 text-amber-500" />
                <span>Open Folder Explorer</span>
              </Link>

              {selectedUser.registrationVerified ? (
                <button
                  type="button"
                  onClick={() =>
                    handleToggleVerification(selectedUser.id, "registration", false, "Admin revocation")
                  }
                  className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 shadow-2xs"
                >
                  Revoke Verification Badge
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    handleToggleVerification(selectedUser.id, "registration", true, "Verified by Admin")
                  }
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-xs"
                >
                  Approve & Issue Verification Badge
                </button>
              )}
            </>
          )
        }
      >
        {selectedUser && (
          <div className="space-y-6 text-xs text-slate-700">
            {/* User Profile Card */}
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              {selectedUser.image ? (
                <img
                  src={selectedUser.image}
                  alt={selectedUser.name}
                  className="h-16 w-16 rounded-2xl object-cover border border-slate-200 ring-2 ring-blue-500/20 shadow-xs"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 font-black text-white text-xl shadow-xs">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{selectedUser.name}</h3>
                  {selectedUser.registrationVerified && (
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      Council Verified ✓
                    </span>
                  )}
                </div>
                <p className="text-slate-500">{selectedUser.email}</p>
                <p className="mt-1 font-semibold text-blue-600">
                  {selectedUser.profession} • {selectedUser.specialization}
                </p>
              </div>
            </div>

            {/* Member ID & Founding Tier */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  MGN Member Identity & Tier
                </h4>
                {selectedUser.memberId && (
                  <MemberBadge
                    memberId={selectedUser.memberId}
                    isFoundingMember={selectedUser.isFoundingMember}
                    size="sm"
                  />
                )}
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200/90 bg-slate-50/70 p-3">
                <div>
                  <span className="font-bold text-slate-900">Member ID</span>
                  {editingMemberId ? (
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={customMemberIdInput}
                        onChange={(e) => setCustomMemberIdInput(e.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-2 py-1 font-mono text-xs text-slate-900 uppercase focus:border-blue-500 focus:outline-none shadow-2xs"
                        placeholder="e.g. MGN-FOUNDER-001"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          handleUpdateMemberId(selectedUser.id, customMemberIdInput);
                        }}
                        className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-blue-700 shadow-2xs"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingMemberId(false)}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <p className="font-mono text-sm font-bold text-blue-600">
                      {selectedUser.memberId || "Pending Allocation"}
                    </p>
                  )}
                </div>
                {!editingMemberId && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomMemberIdInput(selectedUser.memberId || "");
                      setEditingMemberId(true);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
                  >
                    Edit ID
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200/90 bg-slate-50/70 p-3">
                <div>
                  <span className="font-bold text-slate-900">Founding Member Status</span>
                  <p className="text-[11px] text-slate-500">
                    {selectedUser.isFoundingMember
                      ? "Designated Founding Member with exclusive crown identity"
                      : "Regular Verified Member"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmDialog({
                      isOpen: true,
                      title: selectedUser.isFoundingMember ? "Revoke Founding Member Status" : "Grant Founding Member Status",
                      description: selectedUser.isFoundingMember
                        ? `Are you sure you want to revert ${selectedUser.name} to regular member status?`
                        : `Grant special Founding Member status and ID sequence to ${selectedUser.name}.`,
                      variant: selectedUser.isFoundingMember ? "warning" : "success",
                      requireReason: true,
                      action: () => handleToggleFounding(selectedUser.id, !selectedUser.isFoundingMember),
                    });
                  }}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all shadow-2xs ${
                    selectedUser.isFoundingMember
                      ? "bg-amber-50 text-amber-800 border border-amber-300"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {selectedUser.isFoundingMember ? "👑 Founding Member (Active)" : "Make Founding Member"}
                </button>
              </div>
            </div>

            {/* Credential Details */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Medical Council & Credentials
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400">Medical Council</span>
                  <p className="font-bold text-slate-900">
                    {selectedUser.medicalCouncil || "Not specified"}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400">Registration Number</span>
                  <p className="font-mono font-bold text-blue-600">
                    {selectedUser.registrationNumber || "Not provided"}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400">Hospital / Organization</span>
                  <p className="font-bold text-slate-900">
                    {selectedUser.organization || "Independent Practice"}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400">Location</span>
                  <p className="font-bold text-slate-900">
                    {[selectedUser.city, selectedUser.state].filter(Boolean).join(", ") || "India"}
                  </p>
                </div>
              </div>
            </div>

            {/* Granular Verification Toggles */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Verification Checkpoints
              </h4>

              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-xl border border-slate-200/90 bg-slate-50/70 p-3">
                  <div>
                    <span className="font-bold text-slate-900">Medical Council Registration</span>
                    <p className="text-[11px] text-slate-500">NMC / State Council registry matching</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleVerification(
                        selectedUser.id,
                        "registration",
                        !selectedUser.registrationVerified
                      )
                    }
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold shadow-2xs ${
                      selectedUser.registrationVerified
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {selectedUser.registrationVerified ? "Verified ✓" : "Mark Verified"}
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-200/90 bg-slate-50/70 p-3">
                  <div>
                    <span className="font-bold text-slate-900">Identity Verification</span>
                    <p className="text-[11px] text-slate-500">Government ID & Photo match</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleVerification(
                        selectedUser.id,
                        "identity",
                        !selectedUser.identityVerified
                      )
                    }
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold shadow-2xs ${
                      selectedUser.identityVerified
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {selectedUser.identityVerified ? "Verified ✓" : "Mark Verified"}
                  </button>
                </div>
              </div>
            </div>

            {/* Administrative Roles (RBAC) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Administrative Roles
              </h4>

              <div className="flex flex-wrap gap-2">
                {[
                  "ADMIN",
                  "VERIFICATION_ADMIN",
                  "CONTENT_ADMIN",
                  "RECRUITMENT_ADMIN",
                  "LEARN_ADMIN",
                ].map((role) => {
                  const hasRole = selectedUser.adminRoles.includes(role);
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        setConfirmDialog({
                          isOpen: true,
                          title: hasRole ? `Revoke ${role}` : `Assign ${role}`,
                          description: hasRole
                            ? `Are you sure you want to revoke ${role} from ${selectedUser.name}?`
                            : `Grant ${role} privileges to ${selectedUser.name}. This will be logged in the immutable audit trail.`,
                          variant: hasRole ? "danger" : "primary",
                          requireReason: true,
                          action: () => handleAssignRole(selectedUser.id, role),
                        });
                      }}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-all shadow-2xs ${
                        hasRole
                          ? "bg-purple-50 border-purple-200 text-purple-700"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {hasRole ? `✓ ${role}` : `+ ${role}`}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Account Governance & Moderation Controls */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Account Governance & Safety
                </h4>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                    selectedUser.accountStatus === "BANNED" || selectedUser.status === "banned"
                      ? "bg-rose-100 text-rose-800 border border-rose-300"
                      : selectedUser.accountStatus === "SUSPENDED" || selectedUser.status === "suspended"
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : selectedUser.accountStatus === "ON_HOLD" || selectedUser.status === "on_hold"
                      ? "bg-yellow-100 text-yellow-900 border border-yellow-300"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  Status: {selectedUser.accountStatus || selectedUser.status || "ACTIVE"}
                </span>
              </div>

              {selectedUser.statusReason && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600">
                  <span className="font-bold text-slate-800 block mb-0.5">Administrative Reason:</span>
                  <p className="italic">{selectedUser.statusReason}</p>
                </div>
              )}

              <p className="text-[11px] text-slate-500">
                Enforce platform access controls, place temporary holds, revoke accounts, or execute permanent GDPR-compliant deletions.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {/* Activate / Restore Button (if restricted/banned/hold) */}
                {selectedUser.accountStatus === "BANNED" ||
                selectedUser.status === "banned" ||
                selectedUser.accountStatus === "SUSPENDED" ||
                selectedUser.status === "suspended" ||
                selectedUser.accountStatus === "ON_HOLD" ||
                selectedUser.status === "on_hold" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmDialog({
                        isOpen: true,
                        title: "Re-activate User Account",
                        description: `Restore full access for ${selectedUser.name} (${selectedUser.email}).`,
                        variant: "success",
                        requireReason: true,
                        confirmLabel: "Re-Activate Account",
                        action: (reason) => handleModerationAction(selectedUser.id, "activate_user", reason),
                      });
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 text-xs font-bold transition shadow-xs"
                  >
                    <CheckCircle className="size-3.5" />
                    <span>Re-Activate Account</span>
                  </button>
                ) : (
                  <>
                    {/* Suspend Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmDialog({
                          isOpen: true,
                          title: "Suspend / Restrict Account",
                          description: `Temporarily restrict ${selectedUser.name} from accessing platform features and invalidate active sessions.`,
                          variant: "warning",
                          requireReason: true,
                          confirmLabel: "Suspend Account",
                          action: (reason) => handleModerationAction(selectedUser.id, "suspend_user", reason),
                        });
                      }}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 px-3 py-2 text-xs font-bold transition shadow-2xs"
                    >
                      <PauseCircle className="size-3.5 text-amber-600" />
                      <span>Suspend Account</span>
                    </button>

                    {/* Hold Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmDialog({
                          isOpen: true,
                          title: "Place User on Hold",
                          description: `Place ${selectedUser.name}'s account on administrative hold pending verification review.`,
                          variant: "warning",
                          requireReason: true,
                          confirmLabel: "Put on Hold",
                          action: (reason) => handleModerationAction(selectedUser.id, "hold_user", reason),
                        });
                      }}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-yellow-300 bg-yellow-50 hover:bg-yellow-100 text-yellow-800 px-3 py-2 text-xs font-bold transition shadow-2xs"
                    >
                      <PauseCircle className="size-3.5 text-yellow-600" />
                      <span>Put on Hold</span>
                    </button>
                  </>
                )}

                {/* Ban Account Button */}
                {selectedUser.accountStatus !== "BANNED" && selectedUser.status !== "banned" && (
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmDialog({
                        isOpen: true,
                        title: "Ban User Account",
                        description: `Permanently lock out ${selectedUser.name} (${selectedUser.email}). Active sessions will be terminated immediately.`,
                        variant: "danger",
                        requireReason: true,
                        confirmLabel: "Ban User Account",
                        action: (reason) => handleModerationAction(selectedUser.id, "ban_user", reason),
                      });
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 px-3 py-2 text-xs font-bold transition shadow-2xs"
                  >
                    <ShieldAlert className="size-3.5 text-rose-600" />
                    <span>Ban User</span>
                  </button>
                )}

                {/* Permanent Delete Button */}
                <button
                  type="button"
                  onClick={() => {
                    setConfirmDialog({
                      isOpen: true,
                      title: "PERMANENTLY Delete Account",
                      description: `Are you sure you want to permanently delete ${selectedUser.name} (${selectedUser.email})? All profile data, KYC dossiers, and sessions will be permanently purged. This action CANNOT be undone.`,
                      variant: "danger",
                      requireReason: true,
                      confirmLabel: "Permanently Delete",
                      action: (reason) => handleModerationAction(selectedUser.id, "delete_user", reason),
                    });
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-600 bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 text-xs font-bold transition shadow-xs sm:col-span-2"
                >
                  <Trash2 className="size-3.5" />
                  <span>Delete Account Permanently</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminDrawer>

      {/* Confirmation Dialog */}
      <AdminConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((p) => ({ ...p, isOpen: false }))}
        onConfirm={(reason) => confirmDialog.action(reason)}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        requireReason={confirmDialog.requireReason}
        confirmLabel={confirmDialog.confirmLabel}
      />
    </div>
  );
}
