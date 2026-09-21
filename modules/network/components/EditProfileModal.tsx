"use client";

import * as React from "react";
import { X, Save, Lock, Globe, Users, Eye, Sparkles } from "lucide-react";
import type { ProfessionalProfile } from "@/modules/network/types";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfessionalProfile;
  onSave: (updated: Partial<ProfessionalProfile>) => void;
}

export function EditProfileModal({
  isOpen,
  onClose,
  profile,
  onSave,
}: EditProfileModalProps) {
  const [name, setName] = React.useState(profile.name || "");
  const [designation, setDesignation] = React.useState(profile.designation || "");
  const [profession, setProfession] = React.useState(profile.profession || "Physiotherapy");
  const [organization, setOrganization] = React.useState(profile.organization || "");
  const [bio, setBio] = React.useState(profile.bio || "");
  const [city, setCity] = React.useState(profile.city || "");
  const [state, setState] = React.useState(profile.state || "");
  const [skills, setSkills] = React.useState((profile.skills || []).join(", "));
  const [privacyScope, setPrivacyScope] = React.useState<"public" | "connections" | "private">("public");
  
  // Section visibility toggles
  const [visibility, setVisibility] = React.useState({
    education: true,
    experience: true,
    registration: true,
    certifications: true,
    skills: true,
    research: true,
    courses: true,
    achievements: true,
    communities: true,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedSkills = skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    onSave({
      name,
      designation,
      profession,
      organization,
      bio,
      city,
      state,
      skills: parsedSkills,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#e8e6e3] overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#f0efee] px-6 py-4 bg-[#fcfbf9]">
          <div>
            <h2 className="text-base font-bold text-[#171717]">Edit Profile & Preferences</h2>
            <p className="text-xs text-[#77716b]">Update your visual profile, credentials, and section privacy.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[#ded8d1] text-[#5d5854] hover:bg-[#f8f7f6]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* 1. Basic Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#1769c2]">
              Basic & Professional Info
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#5d5854] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-[#ded8d1] px-3 py-2 text-xs text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#1769c2]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5d5854] mb-1">Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Consultant Physiotherapist"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full rounded-xl border border-[#ded8d1] px-3 py-2 text-xs text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#1769c2]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5d5854] mb-1">Profession Category</label>
                <select
                  value={profession}
                  onChange={(e) => setProfession(e.target.value as any)}
                  className="w-full rounded-xl border border-[#ded8d1] px-3 py-2 text-xs text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#1769c2] bg-white"
                >
                  <option value="Physiotherapy">Physiotherapy</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Surgery">Surgery</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Nursing">Nursing</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5d5854] mb-1">Current Hospital / Clinic</label>
                <input
                  type="text"
                  placeholder="e.g. Apollo Hospital / Private Practice"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full rounded-xl border border-[#ded8d1] px-3 py-2 text-xs text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#1769c2]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5d5854] mb-1">Bio / Professional Summary</label>
              <textarea
                rows={3}
                placeholder="Tell colleagues and patients about your clinical focus..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-xl border border-[#ded8d1] px-3 py-2 text-xs text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#1769c2]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#5d5854] mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-[#ded8d1] px-3 py-2 text-xs text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#1769c2]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5d5854] mb-1">State / Province</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full rounded-xl border border-[#ded8d1] px-3 py-2 text-xs text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#1769c2]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5d5854] mb-1">
                Clinical Skills / Tags (comma separated)
              </label>
              <input
                type="text"
                placeholder="Sports Rehab, Manual Therapy, Dry Needling, Ergonomics"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full rounded-xl border border-[#ded8d1] px-3 py-2 text-xs text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#1769c2]"
              />
            </div>
          </div>

          {/* 2. Privacy Scope */}
          <div className="pt-3 border-t border-[#f0efee] space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#1769c2]">
              Profile Visibility & Scope
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPrivacyScope("public")}
                className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition ${
                  privacyScope === "public"
                    ? "border-[#1769c2] bg-[#eff6ff] text-[#1769c2]"
                    : "border-[#ded8d1] text-[#5d5854] hover:bg-[#f8f7f6]"
                }`}
              >
                <Globe className="h-4 w-4 mb-1" />
                <div className="font-bold">Public</div>
                <div className="text-[10px] opacity-75">Visible to all</div>
              </button>

              <button
                type="button"
                onClick={() => setPrivacyScope("connections")}
                className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition ${
                  privacyScope === "connections"
                    ? "border-[#1769c2] bg-[#eff6ff] text-[#1769c2]"
                    : "border-[#ded8d1] text-[#5d5854] hover:bg-[#f8f7f6]"
                }`}
              >
                <Users className="h-4 w-4 mb-1" />
                <div className="font-bold">Connections</div>
                <div className="text-[10px] opacity-75">Network only</div>
              </button>

              <button
                type="button"
                onClick={() => setPrivacyScope("private")}
                className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition ${
                  privacyScope === "private"
                    ? "border-[#1769c2] bg-[#eff6ff] text-[#1769c2]"
                    : "border-[#ded8d1] text-[#5d5854] hover:bg-[#f8f7f6]"
                }`}
              >
                <Lock className="h-4 w-4 mb-1" />
                <div className="font-bold">Only Me</div>
                <div className="text-[10px] opacity-75">Hidden</div>
              </button>
            </div>
          </div>

          {/* 3. Section Visibility Toggles */}
          <div className="pt-3 border-t border-[#f0efee] space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#1769c2]">
                Show On Profile Toggles
              </h3>
              <span className="text-[11px] text-[#77716b]">Control what appears in Know More</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(visibility).map(([key, val]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 p-2 rounded-xl bg-[#f8f7f6] text-xs font-medium text-[#171717] cursor-pointer hover:bg-[#f0efee]"
                >
                  <input
                    type="checkbox"
                    checked={val}
                    onChange={(e) =>
                      setVisibility((prev) => ({ ...prev, [key]: e.target.checked }))
                    }
                    className="rounded text-[#1769c2] focus:ring-[#1769c2]"
                  />
                  <span className="capitalize">{key}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f0efee]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#ded8d1] px-4 py-2 text-xs font-semibold text-[#5d5854] hover:bg-[#f8f7f6]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1769c2] px-5 py-2 text-xs font-bold text-white shadow hover:bg-[#12569f]"
            >
              <Save className="h-4 w-4" />
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
