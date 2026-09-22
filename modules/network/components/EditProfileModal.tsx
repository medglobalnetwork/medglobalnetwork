"use client";

import * as React from "react";
import { 
  X, 
  Save, 
  Lock, 
  Globe, 
  Users, 
  Camera, 
  Sparkles, 
  Building2, 
  GraduationCap, 
  Award, 
  MapPin, 
  FileText,
  CheckCircle2,
  Loader2
} from "lucide-react";
import type { ProfessionalProfile } from "@/modules/network/types";
import { ImageSelectorModal } from "@/components/media/ImageSelectorModal";
import { DEFAULT_BLANK_AVATAR } from "@/lib/avatar";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfessionalProfile;
  onSave: (updated: Partial<ProfessionalProfile>) => void;
}

const COVER_PRESETS = [
  { label: "Modern Hospital", url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1600&auto=format&fit=crop&q=80" },
  { label: "Clinical Lab", url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1600&auto=format&fit=crop&q=80" },
  { label: "Surgical Suite", url: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=1600&auto=format&fit=crop&q=80" },
  { label: "Teal Gradient", url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&auto=format&fit=crop&q=80" },
  { label: "Deep Blue Tech", url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&auto=format&fit=crop&q=80" },
  { label: "Wellness Clinic", url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1600&auto=format&fit=crop&q=80" }
];

export function EditProfileModal({
  isOpen,
  onClose,
  profile,
  onSave,
}: EditProfileModalProps) {
  // Visuals
  const [image, setImage] = React.useState(profile.image || "");
  const [coverImageUrl, setCoverImageUrl] = React.useState(profile.cover_image_url || "");
  
  // Basic Identity
  const [name, setName] = React.useState(profile.name || "");
  const [username, setUsername] = React.useState(profile.username || "");
  const [designation, setDesignation] = React.useState(profile.designation || "");
  const [profession, setProfession] = React.useState(profile.profession || "Physiotherapy");
  const [specialization, setSpecialization] = React.useState(profile.specialization || "");
  const [subSpecialization, setSubSpecialization] = React.useState(profile.sub_specialization || "");
  
  // Workplace & Location
  const [organization, setOrganization] = React.useState(profile.organization || "");
  const [experienceYears, setExperienceYears] = React.useState<string>(
    profile.experience_years !== undefined && profile.experience_years !== null
      ? String(profile.experience_years)
      : ""
  );
  const [city, setCity] = React.useState(profile.city || "");
  const [state, setState] = React.useState(profile.state || "");
  const [country, setCountry] = React.useState(profile.country || "India");
  
  // Bio & Summary
  const [bio, setBio] = React.useState(profile.bio || "");
  
  // Credentials
  const [primaryDegree, setPrimaryDegree] = React.useState(profile.primary_degree || "");
  const [additionalDegrees, setAdditionalDegrees] = React.useState(
    (profile.additional_degrees || []).join(", ")
  );
  const [medicalCouncil, setMedicalCouncil] = React.useState(profile.medical_council || "");
  const [registrationNumber, setRegistrationNumber] = React.useState(profile.registration_number || "");
  
  // Skills & Languages
  const [skills, setSkills] = React.useState((profile.skills || []).join(", "));
  const [languages, setLanguages] = React.useState((profile.languages || []).join(", "));
  
  // Privacy Scope
  const [privacyScope, setPrivacyScope] = React.useState<"public" | "connections" | "private">(
    (profile.profile_visibility as any) || "public"
  );

  // Sub-modal triggers
  const [showAvatarSelector, setShowAvatarSelector] = React.useState(false);
  const [showCoverSelector, setShowCoverSelector] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setImage(profile.image || "");
      setCoverImageUrl(profile.cover_image_url || "");
      setName(profile.name || "");
      setUsername(profile.username || "");
      setDesignation(profile.designation || "");
      setProfession(profile.profession || "Physiotherapy");
      setSpecialization(profile.specialization || "");
      setSubSpecialization(profile.sub_specialization || "");
      setOrganization(profile.organization || "");
      setExperienceYears(
        profile.experience_years !== undefined && profile.experience_years !== null
          ? String(profile.experience_years)
          : ""
      );
      setCity(profile.city || "");
      setState(profile.state || "");
      setCountry(profile.country || "India");
      setBio(profile.bio || "");
      setPrimaryDegree(profile.primary_degree || "");
      setAdditionalDegrees((profile.additional_degrees || []).join(", "));
      setMedicalCouncil(profile.medical_council || "");
      setRegistrationNumber(profile.registration_number || "");
      setSkills((profile.skills || []).join(", "));
      setLanguages((profile.languages || []).join(", "));
      setPrivacyScope((profile.profile_visibility as any) || "public");
      setError(null);
      setSaveSuccess(false);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Full Name is required");
      return;
    }

    setIsSaving(true);
    setError(null);

    const parsedSkills = skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedDegrees = additionalDegrees
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedLanguages = languages
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: Partial<ProfessionalProfile> = {
      name: name.trim(),
      username: username.trim().toLowerCase().replace(/^@+/, "").replace(/[^a-z0-9_-]/g, "-") || undefined,
      image: image || undefined,
      cover_image_url: coverImageUrl || undefined,
      designation: designation.trim() || undefined,
      profession: profession || undefined,
      specialization: specialization.trim() || undefined,
      sub_specialization: subSpecialization.trim() || undefined,
      organization: organization.trim() || undefined,
      experience_years: experienceYears ? Number(experienceYears) : undefined,
      city: city.trim() || undefined,
      state: state.trim() || undefined,
      country: country.trim() || "India",
      bio: bio.trim() || undefined,
      primary_degree: primaryDegree.trim() || undefined,
      additional_degrees: parsedDegrees,
      medical_council: medicalCouncil.trim() || undefined,
      registration_number: registrationNumber.trim() || undefined,
      skills: parsedSkills,
      languages: parsedLanguages,
      profile_visibility: privacyScope,
    };

    try {
      const res = await fetch("/api/network/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to save profile");

      // Notify parent & client
      onSave({
        ...payload,
        user_id: profile.user_id,
      });

      // Update localStorage cache
      if (typeof window !== "undefined") {
        if (image) localStorage.setItem("mgn_user_custom_avatar", image);
        if (coverImageUrl) localStorage.setItem(`mgn_cover_${profile.user_id}`, coverImageUrl);
        window.dispatchEvent(new Event("mgn-avatar-updated"));
      }

      setSaveSuccess(true);
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err: any) {
      setError(err.message || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto animate-fade-in">
        <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-[#e8e6e3] overflow-hidden my-auto">
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-[#f0efee] px-6 py-4 bg-[#fcfbf9]">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#171717]">Edit Profile & Media</h2>
              <p className="text-xs text-[#77716b]">Customize your photos, personal identity, credentials, and visibility.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[#ded8d1] text-[#5d5854] hover:bg-[#f8f7f6]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Error / Success Alerts */}
          {error && (
            <div className="mx-6 mt-4 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-semibold text-rose-800">
              {error}
            </div>
          )}

          {saveSuccess && (
            <div className="mx-6 mt-4 flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-bold text-emerald-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Profile updated and published successfully!</span>
            </div>
          )}

          {/* Modal Body Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* 1. VISUAL IDENTITY (COVER BANNER & AVATAR PICTURE) */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#1769c2] flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5" />
                <span>Visual Identity (Photos & Cover Banner)</span>
              </h3>

              {/* Cover Banner Preview & Edit */}
              <div className="relative h-28 sm:h-36 w-full rounded-2xl overflow-hidden border border-[#ded8d1] bg-slate-100 group">
                <img
                  src={coverImageUrl || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&auto=format&fit=crop&q=80"}
                  alt="Cover Banner"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-90 group-hover:opacity-100 transition">
                  <button
                    type="button"
                    onClick={() => setShowCoverSelector(true)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-md px-4 py-2 text-xs font-bold text-[#171717] shadow-lg hover:bg-white transition active:scale-95"
                  >
                    <Camera className="h-4 w-4 text-[#1769c2]" />
                    <span>Change Cover Banner (Upload / URL)</span>
                  </button>
                </div>
              </div>

              {/* Profile Avatar Preview & Edit */}
              <div className="flex items-center gap-4 pt-1">
                <div className="relative h-20 w-20 shrink-0 rounded-full overflow-hidden border-2 border-[#1769c2] shadow-md bg-slate-100">
                  <img
                    src={image || DEFAULT_BLANK_AVATAR}
                    alt={name || "Avatar"}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#171717]">Profile Picture</p>
                  <p className="text-[11px] text-[#77716b]">
                    Upload a local image (R2) or paste a direct web image URL.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAvatarSelector(true)}
                      className="rounded-xl border border-[#ded8d1] bg-[#f8f7f6] px-3 py-1.5 text-xs font-bold text-[#171717] hover:bg-[#eee] transition shadow-2xs"
                    >
                      Change Photo
                    </button>
                    {image && (
                      <button
                        type="button"
                        onClick={() => setImage("")}
                        className="text-xs font-semibold text-rose-600 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. BASIC IDENTITY */}
            <div className="pt-4 border-t border-[#f0efee] space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#1769c2]">
                Name & Professional Designation
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5d5854] mb-1">
                    Full Name (Display Name) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Shubham Patre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-[#ded8d1] px-3.5 py-2.5 text-xs sm:text-sm text-[#171717] focus:border-[#1769c2] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5d5854] mb-1">
                    Profile Handle / Username (GitHub-style URL)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs font-bold text-[#77716b]">@</span>
                    <input
                      type="text"
                      placeholder="e.g. shubham-patre"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                      className="w-full pl-8 rounded-xl border border-[#ded8d1] px-3.5 py-2.5 text-xs sm:text-sm font-mono text-[#171717] focus:border-[#1769c2] focus:outline-none"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-[#77716b]">
                    URL: <span className="font-mono text-[#1769c2]">mgn.life/profile/{username || "username"}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5d5854] mb-1">
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Consultant Cardiologist / Senior PT"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full rounded-xl border border-[#ded8d1] px-3.5 py-2.5 text-xs sm:text-sm text-[#171717] focus:border-[#1769c2] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5d5854] mb-1">
                    Profession Category
                  </label>
                  <select
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="w-full rounded-xl border border-[#ded8d1] px-3.5 py-2.5 text-xs sm:text-sm text-[#171717] focus:border-[#1769c2] focus:outline-none bg-white"
                  >
                    <option value="Doctor">Doctor / Medical Practitioner</option>
                    <option value="Physiotherapist">Physiotherapist / Physical Therapist</option>
                    <option value="Nurse">Nursing Professional</option>
                    <option value="Pharmacist">Pharmacist</option>
                    <option value="Researcher">Medical Researcher</option>
                    <option value="Student">Medical / Allied Health Student</option>
                    <option value="Occupational Therapist">Occupational Therapist</option>
                    <option value="Dietitian">Clinical Dietitian / Nutritionist</option>
                    <option value="Other">Other Healthcare Specialist</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#5d5854] mb-1">
                    Primary Specialization
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sports Medicine, Interventional Cardiology"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full rounded-xl border border-[#ded8d1] px-3.5 py-2.5 text-xs sm:text-sm text-[#171717] focus:border-[#1769c2] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5d5854] mb-1">
                  Bio / Professional Summary
                </label>
                <textarea
                  rows={3}
                  placeholder="Share a concise overview of your clinical focus, treatments, research interests, and patient philosophy..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-xl border border-[#ded8d1] px-3.5 py-2.5 text-xs sm:text-sm text-[#171717] focus:border-[#1769c2] focus:outline-none leading-relaxed"
                />
              </div>
            </div>

            {/* 3. PRACTICE & WORKPLACE */}
            <div className="pt-4 border-t border-[#f0efee] space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#1769c2] flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                <span>Practice & Workplace</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5d5854] mb-1">
                    Current Hospital / Clinic / Workplace
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apollo Hospital / Private Practice"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full rounded-xl border border-[#ded8d1] px-3.5 py-2.5 text-xs sm:text-sm text-[#171717] focus:border-[#1769c2] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5d5854] mb-1">
                    Years of Clinical Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="70"
                    placeholder="e.g. 8"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full rounded-xl border border-[#ded8d1] px-3.5 py-2.5 text-xs sm:text-sm text-[#171717] focus:border-[#1769c2] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5d5854] mb-1">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border border-[#ded8d1] px-3.5 py-2.5 text-xs sm:text-sm text-[#171717] focus:border-[#1769c2] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5d5854] mb-1">State / Province</label>
                  <input
                    type="text"
                    placeholder="e.g. Maharashtra"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full rounded-xl border border-[#ded8d1] px-3.5 py-2.5 text-xs sm:text-sm text-[#171717] focus:border-[#1769c2] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 4. QUALIFICATIONS & REGISTRATIONS */}
            <div className="pt-4 border-t border-[#f0efee] space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#1769c2] flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" />
                <span>Qualifications & Council Registration</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5d5854] mb-1">
                    Primary Degree
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MBBS, MD, MPT, BDS"
                    value={primaryDegree}
                    onChange={(e) => setPrimaryDegree(e.target.value)}
                    className="w-full rounded-xl border border-[#ded8d1] px-3.5 py-2.5 text-xs sm:text-sm text-[#171717] focus:border-[#1769c2] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5d5854] mb-1">
                    Additional Degrees / Fellowships (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Fellowship in Sports Science, DNB"
                    value={additionalDegrees}
                    onChange={(e) => setAdditionalDegrees(e.target.value)}
                    className="w-full rounded-xl border border-[#ded8d1] px-3.5 py-2.5 text-xs sm:text-sm text-[#171717] focus:border-[#1769c2] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5d5854] mb-1">
                    Medical / Professional Council
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Maharashtra Medical Council"
                    value={medicalCouncil}
                    onChange={(e) => setMedicalCouncil(e.target.value)}
                    className="w-full rounded-xl border border-[#ded8d1] px-3.5 py-2.5 text-xs sm:text-sm text-[#171717] focus:border-[#1769c2] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5d5854] mb-1">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MMC-2018-09842"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    className="w-full rounded-xl border border-[#ded8d1] px-3.5 py-2.5 text-xs sm:text-sm text-[#171717] focus:border-[#1769c2] focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 5. SKILLS & LANGUAGES */}
            <div className="pt-4 border-t border-[#f0efee] space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#1769c2]">
                Skills, Specialties & Languages
              </h3>

              <div>
                <label className="block text-xs font-bold text-[#5d5854] mb-1">
                  Clinical Skills / Specialty Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Sports Rehab, Joint Mobilization, Dry Needling, Ergonomics, Post-Op Care"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full rounded-xl border border-[#ded8d1] px-3.5 py-2.5 text-xs sm:text-sm text-[#171717] focus:border-[#1769c2] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5d5854] mb-1">
                  Languages Spoken (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="English, Hindi, Marathi, Gujarati"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  className="w-full rounded-xl border border-[#ded8d1] px-3.5 py-2.5 text-xs sm:text-sm text-[#171717] focus:border-[#1769c2] focus:outline-none"
                />
              </div>
            </div>

            {/* 6. PRIVACY SCOPE */}
            <div className="pt-4 border-t border-[#f0efee] space-y-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#1769c2]">
                Profile Visibility Scope
              </h3>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setPrivacyScope("public")}
                  className={`p-3 rounded-2xl border text-left text-xs font-semibold transition ${
                    privacyScope === "public"
                      ? "border-[#1769c2] bg-[#eff6ff] text-[#1769c2] shadow-2xs"
                      : "border-[#ded8d1] text-[#5d5854] hover:bg-[#f8f7f6]"
                  }`}
                >
                  <Globe className="h-4 w-4 mb-1 text-[#1769c2]" />
                  <div className="font-bold text-[#171717]">Public</div>
                  <div className="text-[10px] text-[#77716b]">Visible to all users</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPrivacyScope("connections")}
                  className={`p-3 rounded-2xl border text-left text-xs font-semibold transition ${
                    privacyScope === "connections"
                      ? "border-[#1769c2] bg-[#eff6ff] text-[#1769c2] shadow-2xs"
                      : "border-[#ded8d1] text-[#5d5854] hover:bg-[#f8f7f6]"
                  }`}
                >
                  <Users className="h-4 w-4 mb-1 text-[#1769c2]" />
                  <div className="font-bold text-[#171717]">Connections Only</div>
                  <div className="text-[10px] text-[#77716b]">Network connections</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPrivacyScope("private")}
                  className={`p-3 rounded-2xl border text-left text-xs font-semibold transition ${
                    privacyScope === "private"
                      ? "border-[#1769c2] bg-[#eff6ff] text-[#1769c2] shadow-2xs"
                      : "border-[#ded8d1] text-[#5d5854] hover:bg-[#f8f7f6]"
                  }`}
                >
                  <Lock className="h-4 w-4 mb-1 text-[#1769c2]" />
                  <div className="font-bold text-[#171717]">Only Me</div>
                  <div className="text-[10px] text-[#77716b]">Hidden from search</div>
                </button>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f0efee]">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="rounded-xl border border-[#ded8d1] px-5 py-2.5 text-xs font-bold text-[#5d5854] hover:bg-[#f8f7f6] transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1769c2] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#12569f] transition active:scale-95 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Avatar Image Selector Modal */}
      <ImageSelectorModal
        isOpen={showAvatarSelector}
        onClose={() => setShowAvatarSelector(false)}
        title="Update Profile Picture"
        description="Choose a high quality photo of yourself (Upload from device or enter web URL)."
        currentImageUrl={image}
        folder="avatars"
        aspectRatio="square"
        onSelect={(newUrl) => setImage(newUrl)}
        onRemove={() => setImage("")}
      />

      {/* Cover Image Selector Modal */}
      <ImageSelectorModal
        isOpen={showCoverSelector}
        onClose={() => setShowCoverSelector(false)}
        title="Update Profile Cover Banner"
        description="Select a professional medical banner or upload an image."
        currentImageUrl={coverImageUrl}
        folder="covers"
        aspectRatio="cover"
        presets={COVER_PRESETS}
        onSelect={(newUrl) => setCoverImageUrl(newUrl)}
        onRemove={() => setCoverImageUrl("")}
      />
    </>
  );
}
