"use client";

import React, { useEffect, useState } from "react";
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
    action: () => void;
    requireReason?: boolean;
    variant?: "danger" | "warning" | "success" | "primary";
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
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_verification",
          updates: { type, value },
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
                  [type === "identity"
                    ? "identityVerified"
                    : type === "registration"
                    ? "registrationVerified"
                    : "educationVerified"]: value,
                }
              : null
          );
        }
      }
    } catch (err) {
      console.error("Error updating verification:", err);
    }
  };

  const handleToggleFounding = async (userId: string, isFounder: boolean, reason?: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_founding_member",
          userId,
          isFoundingMember: isFounder,
          reason,
        }),
      });
      if (res.ok) {
        fetchUsers();
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser((prev) =>
            prev ? { ...prev, isFoundingMember: isFounder, membershipTier: isFounder ? "FOUNDING_MEMBER" : "MEMBER" } : null
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
              className="h-9 w-9 rounded-full object-cover border border-slate-700 ring-1 ring-slate-800"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-bold text-white text-xs">
              {row.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5 font-bold text-white flex-wrap">
              <span>{row.name}</span>
              {row.registrationVerified && (
                <span title="Council Verified">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400">{row.email}</span>
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
          <span className="font-semibold text-slate-200">{row.profession}</span>
          <p className="text-[11px] text-slate-400">{row.specialization}</p>
        </div>
      ),
    },
    {
      key: "registrationNumber",
      header: "Council Reg #",
      render: (row) =>
        row.registrationNumber ? (
          <div>
            <span className="font-mono text-xs text-blue-300 font-medium">
              {row.registrationNumber}
            </span>
            <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
              {row.medicalCouncil || "State Council"}
            </p>
          </div>
        ) : (
          <span className="text-slate-500 italic">Not Provided</span>
        ),
    },
    {
      key: "status",
      header: "Verification",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.registrationVerified ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
              <CheckCircle className="h-3 w-3" />
              Verified
            </span>
          ) : row.registrationNumber ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
              Pending KYC
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] font-medium text-slate-400">
              Unverified
            </span>
          )}

          {row.adminRoles.length > 0 && (
            <span className="inline-flex items-center rounded-full bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-400">
              {row.adminRoles[0]}
            </span>
          )}
        </div>
      ),
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
          className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-800/80 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:border-slate-700 hover:text-white transition-colors"
        >
          <Eye className="h-3.5 w-3.5" />
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
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          Clinicians & User Directory
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Search, inspect, and manage verified healthcare professionals, credentials, and access roles.
        </p>
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
              {selectedUser.registrationVerified ? (
                <button
                  type="button"
                  onClick={() =>
                    handleToggleVerification(selectedUser.id, "registration", false, "Admin revocation")
                  }
                  className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/20"
                >
                  Revoke Verification Badge
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    handleToggleVerification(selectedUser.id, "registration", true, "Verified by Admin")
                  }
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 shadow-md"
                >
                  Approve & Issue Verification Badge
                </button>
              )}
            </>
          )
        }
      >
        {selectedUser && (
          <div className="space-y-6 text-xs text-slate-300">
            {/* User Profile Card */}
            <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-4">
              {selectedUser.image ? (
                <img
                  src={selectedUser.image}
                  alt={selectedUser.name}
                  className="h-16 w-16 rounded-2xl object-cover border border-slate-700 ring-2 ring-blue-500/20"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 font-black text-white text-xl">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{selectedUser.name}</h3>
                  {selectedUser.registrationVerified && (
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      Council Verified ✓
                    </span>
                  )}
                </div>
                <p className="text-slate-400">{selectedUser.email}</p>
                <p className="mt-1 font-medium text-blue-400">
                  {selectedUser.profession} • {selectedUser.specialization}
                </p>
              </div>
            </div>

            {/* Member ID & Founding Tier */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
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

              <div className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
                <div>
                  <span className="font-semibold text-white">Member ID</span>
                  {editingMemberId ? (
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={customMemberIdInput}
                        onChange={(e) => setCustomMemberIdInput(e.target.value)}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 font-mono text-xs text-white uppercase focus:border-blue-500 focus:outline-none"
                        placeholder="e.g. MGN-FOUNDER-001"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          handleUpdateMemberId(selectedUser.id, customMemberIdInput);
                        }}
                        className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-500"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingMemberId(false)}
                        className="rounded-lg bg-slate-700 px-2 py-1 text-xs text-slate-300 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <p className="font-mono text-sm font-bold text-blue-400">
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
                    className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
                  >
                    Edit ID
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
                <div>
                  <span className="font-semibold text-white">Founding Member Status</span>
                  <p className="text-[11px] text-slate-400">
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
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedUser.isFoundingMember
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {selectedUser.isFoundingMember ? "👑 Founding Member (Active)" : "Make Founding Member"}
                </button>
              </div>
            </div>

            {/* Credential Details */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Medical Council & Credentials
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] text-slate-500">Medical Council</span>
                  <p className="font-semibold text-white">
                    {selectedUser.medicalCouncil || "Not specified"}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">Registration Number</span>
                  <p className="font-mono font-semibold text-blue-300">
                    {selectedUser.registrationNumber || "Not provided"}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">Hospital / Organization</span>
                  <p className="font-semibold text-white">
                    {selectedUser.organization || "Independent Practice"}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">Location</span>
                  <p className="font-semibold text-white">
                    {[selectedUser.city, selectedUser.state].filter(Boolean).join(", ") || "India"}
                  </p>
                </div>
              </div>
            </div>

            {/* Granular Verification Toggles */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Verification Checkpoints
              </h4>

              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
                  <div>
                    <span className="font-semibold text-white">Medical Council Registration</span>
                    <p className="text-[11px] text-slate-400">NMC / State Council registry matching</p>
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
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      selectedUser.registrationVerified
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {selectedUser.registrationVerified ? "Verified ✓" : "Mark Verified"}
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
                  <div>
                    <span className="font-semibold text-white">Identity Verification</span>
                    <p className="text-[11px] text-slate-400">Government ID & Photo match</p>
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
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      selectedUser.identityVerified
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {selectedUser.identityVerified ? "Verified ✓" : "Mark Verified"}
                  </button>
                </div>
              </div>
            </div>

            {/* Administrative Roles (RBAC) */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
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
                      className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                        hasRole
                          ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
                      }`}
                    >
                      {hasRole ? `✓ ${role}` : `+ ${role}`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </AdminDrawer>

      {/* Confirmation Dialog */}
      <AdminConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((p) => ({ ...p, isOpen: false }))}
        onConfirm={() => confirmDialog.action()}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        requireReason={confirmDialog.requireReason}
      />
    </div>
  );
}
