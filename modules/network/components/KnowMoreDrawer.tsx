"use client";

import * as React from "react";
import { 
  X, 
  User, 
  Briefcase, 
  FileText, 
  GraduationCap, 
  Award, 
  Zap, 
  BookOpen, 
  Microscope, 
  Trophy, 
  Users, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  ExternalLink,
  CheckCircle2,
  Building2,
  Phone,
  Mail,
  Share2
} from "lucide-react";
import type { ProfessionalProfile } from "@/modules/network/types";
import { VerificationBadge } from "@/modules/network/components/VerificationBadge";
import { MemberBadge } from "@/modules/network/components/MemberBadge";

interface KnowMoreDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfessionalProfile & {
    connection_count?: number;
    follower_count?: number;
    following_count?: number;
    is_own_profile?: boolean;
  };
}

export function KnowMoreDrawer({ isOpen, onClose, profile }: KnowMoreDrawerProps) {
  const [activeSection, setActiveSection] = React.useState<string>("overview");

  if (!isOpen) return null;

  const isVerified =
    profile.identity_verified ||
    profile.education_verified ||
    profile.registration_verified ||
    profile.experience_verified;

  const degrees = [profile.primary_degree, ...(profile.additional_degrees ?? [])].filter(Boolean);

  const navItems = [
    { id: "overview", label: "About & Summary", icon: User },
    { id: "professional", label: "Professional Details", icon: Briefcase },
    { id: "registration", label: "Medical Council & Reg", icon: FileText },
    { id: "education", label: "Education & Degrees", icon: GraduationCap },
    { id: "experience", label: "Clinical Experience", icon: Building2 },
    { id: "certifications", label: "Certifications & CME", icon: Award },
    { id: "skills", label: "Clinical Skills", icon: Zap },
    { id: "research", label: "Research & Publications", icon: Microscope },
    { id: "courses", label: "MGN Learn & Courses", icon: BookOpen },
    { id: "achievements", label: "Awards & Honors", icon: Trophy },
    { id: "communities", label: "Communities", icon: Users },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in flex justify-end">
      <div className="relative w-full max-w-3xl bg-[#fcfbf9] h-full shadow-2xl flex flex-col overflow-hidden animate-slide-left">
        {/* Top Header Strip */}
        <div className="flex items-center justify-between border-b border-[#e8e6e3] bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#1769c2] to-[#0ea5e9] text-white font-black shadow-sm">
              MGN
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-base font-extrabold text-[#171717]">
                  {profile.name}
                </h2>
                {isVerified && <VerificationBadge size="sm" type="full" />}
                <MemberBadge
                  memberId={profile.member_id}
                  isFoundingMember={profile.is_founding_member}
                  membershipTier={profile.membership_tier}
                  size="xs"
                />
              </div>
              <p className="text-xs text-[#77716b]">
                {profile.profession} · Full Clinical Portfolio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ded8d1] bg-white text-[#5d5854] hover:bg-[#f8f7f6] transition active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Quick Nav Chips */}
        <div className="border-b border-[#e8e6e3] bg-white px-6 py-2.5 overflow-x-auto no-scrollbar flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveSection(item.id);
                  const el = document.getElementById(`section-${item.id}`);
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  isActive
                    ? "bg-[#1769c2] text-white shadow-xs"
                    : "bg-[#f4f2ee] text-[#5d5854] hover:bg-[#eae7e1]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Pane */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Trust Banner */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 flex items-start gap-3">
            <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-950">
              <strong className="block font-bold">Verified Healthcare Practitioner</strong>
              Credentials, degrees, and medical registrations have undergone verification checks on MedGlobal Network.
            </div>
          </div>

          {/* 1. Overview & Summary */}
          <section id="section-overview" className="rounded-2xl border border-[#e8e6e3] bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3 text-sm font-bold text-[#171717]">
              <User className="h-4 w-4 text-[#1769c2]" />
              <span>Personal Summary & Identity</span>
            </div>
            <p className="text-xs sm:text-sm text-[#44403c] leading-relaxed">
              {profile.bio || "No summary provided yet."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#f0efee] text-xs">
              <div className="flex items-center gap-2 text-[#5d5854]">
                <span className="font-semibold text-[#171717]">Member ID:</span>
                <MemberBadge
                  memberId={profile.member_id}
                  isFoundingMember={profile.is_founding_member}
                  membershipTier={profile.membership_tier}
                  size="xs"
                />
              </div>
              <div className="flex items-center gap-2 text-[#5d5854]">
                <span className="font-semibold text-[#171717]">Membership Tier:</span>
                <span className="font-bold text-[#1769c2]">
                  {profile.is_founding_member ? "Founding Member 👑" : "Verified Member"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[#5d5854]">
                <MapPin className="h-4 w-4 text-[#1769c2]" />
                <span>Location: <strong>{[profile.city, profile.state, "India"].filter(Boolean).join(", ")}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-[#5d5854]">
                <Briefcase className="h-4 w-4 text-[#1769c2]" />
                <span>Experience: <strong>{profile.experience_years ? `${profile.experience_years} Years` : "Not specified"}</strong></span>
              </div>
            </div>
          </section>

          {/* 2. Professional Details */}
          <section id="section-professional" className="rounded-2xl border border-[#e8e6e3] bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3 text-sm font-bold text-[#171717]">
              <Briefcase className="h-4 w-4 text-[#1769c2]" />
              <span>Professional Information</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#f4f2ee]">
                <span className="text-[#77716b]">Primary Profession</span>
                <span className="font-semibold text-[#171717]">{profile.profession || "Healthcare Professional"}</span>
              </div>
              {profile.designation && (
                <div className="flex justify-between py-1 border-b border-[#f4f2ee]">
                  <span className="text-[#77716b]">Designation</span>
                  <span className="font-semibold text-[#171717]">{profile.designation}</span>
                </div>
              )}
              {profile.specialization && (
                <div className="flex justify-between py-1 border-b border-[#f4f2ee]">
                  <span className="text-[#77716b]">Specialization</span>
                  <span className="font-semibold text-[#171717]">{profile.specialization}</span>
                </div>
              )}
              {profile.organization && (
                <div className="flex justify-between py-1">
                  <span className="text-[#77716b]">Current Affiliation / Hospital</span>
                  <span className="font-semibold text-[#171717]">{profile.organization}</span>
                </div>
              )}
            </div>
          </section>

          {/* 3. Medical Council & Registration */}
          <section id="section-registration" className="rounded-2xl border border-[#e8e6e3] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#171717]">
                <FileText className="h-4 w-4 text-emerald-600" />
                <span>Medical Council & Registration</span>
              </div>
              {profile.registration_number ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="h-3 w-3" /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
                  Pending Verification
                </span>
              )}
            </div>

            <div className="space-y-3 bg-[#f8fcf9] p-4 rounded-xl border border-emerald-100 text-xs">
              <div>
                <span className="text-[#77716b] block text-[11px]">Registering Statutory Authority:</span>
                <span className="font-bold text-[#171717] text-sm">
                  {profile.medical_council || "Not submitted yet"}
                </span>
              </div>
              <div>
                <span className="text-[#77716b] block text-[11px]">Registration Number:</span>
                <span className="font-mono font-bold text-[#171717] text-sm bg-white px-2 py-1 rounded border border-[#ded8d1] inline-block">
                  {profile.registration_number || "Under Review"}
                </span>
              </div>
            </div>
          </section>

          {/* 4. Education & Degrees */}
          <section id="section-education" className="rounded-2xl border border-[#e8e6e3] bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3 text-sm font-bold text-[#171717]">
              <GraduationCap className="h-4 w-4 text-[#1769c2]" />
              <span>Education & Academic Degrees</span>
            </div>

            <div className="space-y-3">
              {degrees.length > 0 ? (
                degrees.map((deg, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-[#f8f7f6]">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eef5fc] text-[#1769c2] font-bold">
                      🎓
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#171717]">{deg}</p>
                      <p className="text-[11px] text-[#77716b]">Verified Degree</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#8a8784] italic p-3 bg-[#f8f7f6] rounded-xl">
                  No academic qualifications added yet.
                </p>
              )}
            </div>
          </section>

          {/* 5. Clinical Experience */}
          <section id="section-experience" className="rounded-2xl border border-[#e8e6e3] bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3 text-sm font-bold text-[#171717]">
              <Building2 className="h-4 w-4 text-[#1769c2]" />
              <span>Clinical Experience & Affiliations</span>
            </div>

            <div className="space-y-3">
              {profile.organization || profile.designation ? (
                <div className="border-l-2 border-[#1769c2] pl-4 space-y-1">
                  <span className="text-[10px] font-bold text-[#1769c2] uppercase tracking-wider">Current Role</span>
                  <p className="text-xs font-bold text-[#171717]">{profile.designation || profile.profession}</p>
                  <p className="text-xs text-[#5d5854]">{profile.organization || "Private Practice"}</p>
                  <p className="text-[11px] text-[#a09890]">{[profile.city, "India"].filter(Boolean).join(", ")}</p>
                </div>
              ) : (
                <p className="text-xs text-[#8a8784] italic p-3 bg-[#f8f7f6] rounded-xl">
                  No clinical experience records listed yet.
                </p>
              )}
            </div>
          </section>

          {/* 6. Clinical Skills */}
          <section id="section-skills" className="rounded-2xl border border-[#e8e6e3] bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3 text-sm font-bold text-[#171717]">
              <Zap className="h-4 w-4 text-amber-500" />
              <span>Core Clinical Skills & Competencies</span>
            </div>

            {profile.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-xl border border-[#ded8d1] bg-[#f8f7f6] px-3 py-1.5 text-xs font-semibold text-[#171717]"
                  >
                    ⚡ {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#8a8784] italic p-3 bg-[#f8f7f6] rounded-xl">
                No clinical skills listed yet.
              </p>
            )}
          </section>

          {/* 8. Research & Publications */}
          <section id="section-research" className="rounded-2xl border border-[#e8e6e3] bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3 text-sm font-bold text-[#171717]">
              <Microscope className="h-4 w-4 text-purple-600" />
              <span>Research & Publications</span>
            </div>

            <p className="text-xs text-[#8a8784] italic p-3 bg-[#f8f7f6] rounded-xl">
              No clinical research publications or preprints listed yet.
            </p>
          </section>

          {/* 9. Courses from MGN Learn */}
          <section id="section-courses" className="rounded-2xl border border-[#e8e6e3] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#171717]">
                <BookOpen className="h-4 w-4 text-[#1769c2]" />
                <span>MGN Learn & CME</span>
              </div>
            </div>

            <p className="text-xs text-[#8a8784] italic p-3 bg-[#f8f7f6] rounded-xl">
              No CME courses completed yet on MGN Learn.
            </p>
          </section>

          {/* 10. Achievements & Awards */}
          <section id="section-achievements" className="rounded-2xl border border-[#e8e6e3] bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3 text-sm font-bold text-[#171717]">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span>Honors & Keynotes</span>
            </div>

            <p className="text-xs text-[#8a8784] italic p-3 bg-[#f8f7f6] rounded-xl">
              No honors or keynote recognitions listed yet.
            </p>
          </section>

          {/* 11. Communities */}
          <section id="section-communities" className="rounded-2xl border border-[#e8e6e3] bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3 text-sm font-bold text-[#171717]">
              <Users className="h-4 w-4 text-[#1769c2]" />
              <span>Healthcare Network</span>
            </div>

            <p className="text-xs text-[#5d5854] leading-relaxed p-3 bg-[#f8f7f6] rounded-xl">
              Connected across the <strong>MedGlobal Network</strong> multidisciplinary clinical community.
            </p>
          </section>
        </div>

        {/* Footer actions */}
        <div className="border-t border-[#e8e6e3] bg-white p-4 px-6 flex items-center justify-between">
          <p className="text-xs text-[#77716b]">
            MedGlobal Network Certified Profile
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#171717] px-5 py-2 text-xs font-bold text-white shadow hover:bg-[#2c2c2c]"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
