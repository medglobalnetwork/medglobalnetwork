"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  MapPin,
  Calendar,
  Globe2,
  Building,
  ArrowRight,
  ArrowLeft,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Lock,
  ChevronDown,
  Search,
  Sparkles,
} from "lucide-react";

// ============================================================
// COUNTRY, STATE, CITY GEOGRAPHIC DATA
// ============================================================
interface CountryData {
  name: string;
  code: string;
  flag: string;
  states: {
    name: string;
    cities: string[];
  }[];
}

const GEOGRAPHIC_DATA: CountryData[] = [
  {
    name: "India",
    code: "IN",
    flag: "🇮🇳",
    states: [
      {
        name: "Maharashtra",
        cities: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Thane", "Solapur", "Kolhapur", "Navi Mumbai", "Amravati"],
      },
      {
        name: "Delhi",
        cities: ["New Delhi", "North Delhi", "South Delhi", "West Delhi", "East Delhi", "Dwarka", "Rohini", "Connaught Place"],
      },
      {
        name: "Karnataka",
        cities: ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru", "Belagavi", "Davanagere", "Ballari", "Shivamogga"],
      },
      {
        name: "Tamil Nadu",
        cities: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Vellore", "Erode"],
      },
      {
        name: "Uttar Pradesh",
        cities: ["Lucknow", "Kanpur", "Varanasi", "Noida", "Greater Noida", "Agra", "Prayagraj", "Meerut", "Ghaziabad", "Bareilly", "Gorakhpur"],
      },
      {
        name: "Gujarat",
        cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Gandhinagar", "Jamnagar", "Junagadh"],
      },
      {
        name: "Telangana",
        cities: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Ramagundam", "Secunderabad"],
      },
      {
        name: "West Bengal",
        cities: ["Kolkata", "Howrah", "Durgapur", "Siliguri", "Asansol", "Bardhaman", "Kharagpur"],
      },
      {
        name: "Kerala",
        cities: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Kannur", "Alappuzha", "Palakkad"],
      },
      {
        name: "Rajasthan",
        cities: ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Udaipur", "Ajmer", "Bhilwara", "Alwar"],
      },
      {
        name: "Madhya Pradesh",
        cities: ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna"],
      },
      {
        name: "Bihar",
        cities: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Bihar Sharif"],
      },
      {
        name: "Punjab",
        cities: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Pathankot"],
      },
      {
        name: "Haryana",
        cities: ["Gurugram", "Faridabad", "Panipat", "Ambala", "Karnal", "Rohtak", "Hisar", "Panchkula"],
      },
      {
        name: "Andhra Pradesh",
        cities: ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati", "Kakinada", "Rajahmundry"],
      },
      {
        name: "Odisha",
        cities: ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore"],
      },
      {
        name: "Assam",
        cities: ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Tezpur", "Nagaon", "Tinsukia"],
      },
      {
        name: "Jharkhand",
        cities: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Hazaribagh"],
      },
      {
        name: "Chhattisgarh",
        cities: ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon"],
      },
      {
        name: "Uttarakhand",
        cities: ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rishikesh", "Kashipur"],
      },
      {
        name: "Himachal Pradesh",
        cities: ["Shimla", "Dharamshala", "Solan", "Mandi", "Kullu", "Manali"],
      },
      {
        name: "Goa",
        cities: ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
      },
      {
        name: "Jammu and Kashmir",
        cities: ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Udhampur"],
      },
      {
        name: "Chandigarh",
        cities: ["Chandigarh"],
      },
      {
        name: "Puducherry",
        cities: ["Puducherry", "Karaikal", "Yanam", "Mahe"],
      },
      {
        name: "Other States & UTs",
        cities: ["Agartala", "Shillong", "Imphal", "Kohima", "Aizawl", "Gangtok", "Itanagar", "Leh", "Kargil", "Port Blair", "Silvassa", "Daman"],
      },
    ],
  },
  {
    name: "United States",
    code: "US",
    flag: "🇺🇸",
    states: [
      { name: "California", cities: ["Los Angeles", "San Francisco", "San Diego", "San Jose", "Sacramento"] },
      { name: "New York", cities: ["New York City", "Buffalo", "Rochester", "Albany", "Syracuse"] },
      { name: "Texas", cities: ["Houston", "Austin", "Dallas", "San Antonio", "Fort Worth"] },
      { name: "Florida", cities: ["Miami", "Orlando", "Tampa", "Jacksonville", "Tallahassee"] },
      { name: "Illinois", cities: ["Chicago", "Aurora", "Naperville", "Springfield"] },
      { name: "Massachusetts", cities: ["Boston", "Cambridge", "Worcester", "Springfield"] },
      { name: "Washington", cities: ["Seattle", "Spokane", "Tacoma", "Bellevue"] },
    ],
  },
  {
    name: "United Kingdom",
    code: "GB",
    flag: "🇬🇧",
    states: [
      { name: "England", cities: ["London", "Manchester", "Birmingham", "Leeds", "Liverpool", "Bristol", "Oxford", "Cambridge"] },
      { name: "Scotland", cities: ["Edinburgh", "Glasgow", "Aberdeen", "Dundee"] },
      { name: "Wales", cities: ["Cardiff", "Swansea", "Newport"] },
      { name: "Northern Ireland", cities: ["Belfast", "Derry", "Lisburn"] },
    ],
  },
  {
    name: "United Arab Emirates",
    code: "AE",
    flag: "🇦🇪",
    states: [
      { name: "Dubai", cities: ["Dubai City", "Deira", "Jumeirah", "Downtown Dubai"] },
      { name: "Abu Dhabi", cities: ["Abu Dhabi City", "Al Ain", "Al Dhafra"] },
      { name: "Sharjah", cities: ["Sharjah City", "Khor Fakkan", "Kalba"] },
      { name: "Ajman", cities: ["Ajman City", "Masfout"] },
      { name: "Ras Al Khaimah", cities: ["Ras Al Khaimah City"] },
    ],
  },
  {
    name: "Canada",
    code: "CA",
    flag: "🇨🇦",
    states: [
      { name: "Ontario", cities: ["Toronto", "Ottawa", "Mississauga", "Hamilton"] },
      { name: "British Columbia", cities: ["Vancouver", "Victoria", "Surrey", "Burnaby"] },
      { name: "Quebec", cities: ["Montreal", "Quebec City", "Laval"] },
      { name: "Alberta", cities: ["Calgary", "Edmonton", "Red Deer"] },
    ],
  },
  {
    name: "Australia",
    code: "AU",
    flag: "🇦🇺",
    states: [
      { name: "New South Wales", cities: ["Sydney", "Newcastle", "Wollongong"] },
      { name: "Victoria", cities: ["Melbourne", "Geelong", "Ballarat"] },
      { name: "Queensland", cities: ["Brisbane", "Gold Coast", "Cairns"] },
      { name: "Western Australia", cities: ["Perth", "Fremantle"] },
    ],
  },
  {
    name: "Germany",
    code: "DE",
    flag: "🇩🇪",
    states: [
      { name: "Bavaria", cities: ["Munich", "Nuremberg", "Augsburg"] },
      { name: "Berlin", cities: ["Berlin"] },
      { name: "North Rhine-Westphalia", cities: ["Cologne", "Düsseldorf", "Dortmund"] },
      { name: "Baden-Württemberg", cities: ["Stuttgart", "Heidelberg", "Freiburg"] },
    ],
  },
  {
    name: "Singapore",
    code: "SG",
    flag: "🇸🇬",
    states: [
      { name: "Singapore", cities: ["Central", "Jurong", "Tampines", "Woodlands"] },
    ],
  },
  {
    name: "Other Countries",
    code: "OTHER",
    flag: "🌐",
    states: [
      { name: "International", cities: ["Capital / Major City", "Other City"] },
    ],
  },
];

const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
  { value: "Prefer not to say", label: "Prefer not to say" },
];

export default function PersonalInformationPage() {
  const router = useRouter();

  // User Identity & Basic Profile
  const [userId, setUserId] = React.useState<string>("");
  const [firstName, setFirstName] = React.useState<string>("");
  const [middleName, setMiddleName] = React.useState<string>("");
  const [lastName, setLastName] = React.useState<string>("");
  const [dateOfBirth, setDateOfBirth] = React.useState<string>("");
  const [gender, setGender] = React.useState<string>("");

  // Geographic Dependent Selection
  const [selectedCountry, setSelectedCountry] = React.useState<string>("India");
  const [selectedState, setSelectedState] = React.useState<string>("Maharashtra");
  const [selectedCity, setSelectedCity] = React.useState<string>("Mumbai");
  const [customCity, setCustomCity] = React.useState<string>("");
  const [isCustomCityMode, setIsCustomCityMode] = React.useState<boolean>(false);

  // Country Search Dropdown State
  const [countrySearchQuery, setCountrySearchQuery] = React.useState("");
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = React.useState(false);

  // Form Validation & Interaction States
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSkipping, setIsSkipping] = React.useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = React.useState<"saved" | "saving" | null>(null);
  const [backendError, setBackendError] = React.useState<string | null>(null);

  // 1. Prepopulate from Page 2 registration & previous saved state
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        // Read Page 2 registered user
        const storedUser = localStorage.getItem("mgn_onboarding_registered_user");
        if (storedUser) {
          const userObj = JSON.parse(storedUser);
          if (userObj.userId) setUserId(userObj.userId);
          if (userObj.fullName) {
            const parts = userObj.fullName.trim().split(/\s+/);
            if (parts.length >= 2) {
              setFirstName((prev) => prev || parts[0]);
              setLastName((prev) => prev || parts.slice(1).join(" "));
            } else if (parts.length === 1) {
              setFirstName((prev) => prev || parts[0]);
            }
          }
        }

        // Read Page 4 previously auto-saved progress
        const savedInfo = localStorage.getItem("mgn_onboarding_personal_info");
        if (savedInfo) {
          const parsed = JSON.parse(savedInfo);
          if (parsed.firstName) setFirstName(parsed.firstName);
          if (parsed.middleName) setMiddleName(parsed.middleName);
          if (parsed.lastName) setLastName(parsed.lastName);
          if (parsed.dateOfBirth) setDateOfBirth(parsed.dateOfBirth);
          if (parsed.gender) setGender(parsed.gender);
          if (parsed.country) setSelectedCountry(parsed.country);
          if (parsed.state) setSelectedState(parsed.state);
          if (parsed.city) {
            setSelectedCity(parsed.city);
            if (parsed.isCustomCityMode) {
              setIsCustomCityMode(true);
              setCustomCity(parsed.city);
            }
          }
        }
      } catch (err) {
        console.warn("Could not prepopulate personal info:", err);
      }
    }
  }, []);

  // Compute available states and cities based on selected country
  const currentCountryData = React.useMemo(() => {
    return (
      GEOGRAPHIC_DATA.find((c) => c.name.toLowerCase() === selectedCountry.toLowerCase()) ||
      GEOGRAPHIC_DATA[0]
    );
  }, [selectedCountry]);

  const availableStates = React.useMemo(() => {
    return currentCountryData.states || [];
  }, [currentCountryData]);

  const currentStateData = React.useMemo(() => {
    return (
      availableStates.find((s) => s.name.toLowerCase() === selectedState.toLowerCase()) ||
      availableStates[0] || { name: "", cities: [] }
    );
  }, [availableStates, selectedState]);

  const availableCities = React.useMemo(() => {
    return currentStateData.cities || [];
  }, [currentStateData]);

  // Auto-sync state and city on country change
  const handleCountrySelect = (countryName: string) => {
    setSelectedCountry(countryName);
    setIsCountryDropdownOpen(false);
    setCountrySearchQuery("");

    const countryObj = GEOGRAPHIC_DATA.find((c) => c.name === countryName);
    if (countryObj && countryObj.states.length > 0) {
      const firstState = countryObj.states[0];
      setSelectedState(firstState.name);
      if (firstState.cities.length > 0) {
        setSelectedCity(firstState.cities[0]);
        setIsCustomCityMode(false);
      }
    }
  };

  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    const stateObj = availableStates.find((s) => s.name === stateName);
    if (stateObj && stateObj.cities.length > 0) {
      setSelectedCity(stateObj.cities[0]);
      setIsCustomCityMode(false);
    }
  };

  // 2. Auto-save progress locally
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const finalCity = isCustomCityMode ? customCity.trim() : selectedCity;
      const dataToSave = {
        firstName,
        middleName,
        lastName,
        dateOfBirth,
        gender,
        country: selectedCountry,
        state: selectedState,
        city: finalCity,
        isCustomCityMode,
        updatedAt: Date.now(),
      };
      try {
        localStorage.setItem("mgn_onboarding_personal_info", JSON.stringify(dataToSave));
        setAutoSaveStatus("saved");
      } catch (err) {
        console.warn("Auto-save warning:", err);
      }
    }
  }, [
    firstName,
    middleName,
    lastName,
    dateOfBirth,
    gender,
    selectedCountry,
    selectedState,
    selectedCity,
    customCity,
    isCustomCityMode,
  ]);

  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Validation
  const isFirstNameValid = firstName.trim().length >= 1;
  const isLastNameValid = lastName.trim().length >= 1;
  const isCountryValid = Boolean(selectedCountry.trim());
  const isStateValid = Boolean(selectedState.trim());
  const finalCity = isCustomCityMode ? customCity.trim() : selectedCity.trim();
  const isCityValid = finalCity.length >= 1;

  const isFormValid = isFirstNameValid && isLastNameValid && isCountryValid && isStateValid && isCityValid;

  // Maximum date of birth: must be in the past (at least 15 years old for medical/nursing/allied students)
  const maxDobDate = React.useMemo(() => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 14);
    return today.toISOString().split("T")[0];
  }, []);

  // ─────────────────────────────────────────────
  // SUBMISSION: SAVE & CONTINUE
  // ─────────────────────────────────────────────
  const handleSaveAndContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setBackendError(null);

    setTouched({
      firstName: true,
      lastName: true,
      country: true,
      state: true,
      city: true,
    });

    if (!isFormValid || isSaving) return;

    setIsSaving(true);

    try {
      const payload = {
        userId,
        firstName: firstName.trim(),
        middleName: middleName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: dateOfBirth.trim() || undefined,
        gender: gender || undefined,
        country: selectedCountry,
        state: selectedState,
        city: finalCity,
        isSkip: false,
      };

      const res = await fetch("/api/onboarding/personal-information", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setBackendError(data.error || "Failed to save personal information. Please try again.");
        setIsSaving(false);
        return;
      }

      // Route to Page 5: Identity & Council Verification
      router.push("/onboarding/individual/identity");
    } catch (err: any) {
      console.error("Personal info save network error:", err);
      setBackendError("Network error while saving details. Please try again.");
      setIsSaving(false);
    }
  };

  // ─────────────────────────────────────────────
  // SKIP FOR NOW
  // ─────────────────────────────────────────────
  const handleSkip = async () => {
    if (isSkipping) return;
    setIsSkipping(true);

    try {
      const payload = {
        userId,
        firstName: firstName.trim() || undefined,
        middleName: middleName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        dateOfBirth: dateOfBirth.trim() || undefined,
        gender: gender || undefined,
        country: selectedCountry,
        state: selectedState,
        city: finalCity,
        isSkip: true,
      };

      await fetch("/api/onboarding/personal-information", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});

      // Navigate to identity verification
      router.push("/onboarding/individual/identity");
    } catch {
      router.push("/onboarding/individual/identity");
    }
  };

  // Filter countries by search query
  const filteredCountries = GEOGRAPHIC_DATA.filter((c) =>
    c.name.toLowerCase().includes(countrySearchQuery.toLowerCase())
  );

  return (
    <div className="min-h-dvh bg-white dark:bg-[#0b131e] text-[#1f2937] dark:text-[#f3f4f6] flex flex-col font-sans">
      {/* ─────────────────────────────────────────────
          1. HEADER
          ───────────────────────────────────────────── */}
      <header className="w-full border-b border-slate-100 dark:border-slate-800/80 bg-white/95 dark:bg-[#0b131e]/95 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo on Left */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="MED Global Network Logo"
              className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="text-xl sm:text-[22px] font-black tracking-tight text-[#102D45] dark:text-[#58a6ff] leading-none">
                MED Global Network
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#168B78] dark:text-[#2dd4bf] mt-0.5">
                Healthcare Community
              </span>
            </div>
          </Link>

          {/* Right Header Navigation: Skip Button & Auto-save status */}
          <div className="flex items-center gap-4 text-xs sm:text-sm">
            {autoSaveStatus === "saved" && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-3.5" />
                <span>Progress saved</span>
              </span>
            )}
            <button
              type="button"
              onClick={handleSkip}
              disabled={isSkipping}
              className="text-xs font-semibold text-slate-500 hover:text-[#102D45] dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
            >
              {isSkipping ? "Skipping..." : "Skip for now"}
            </button>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────
          2. MAIN CONTENT AREA
          ───────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center py-8 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl mx-auto space-y-6">
          {/* Breadcrumb Back Link */}
          <div>
            <Link
              href="/onboarding/individual/verify"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#102D45] dark:text-slate-400 dark:hover:text-white transition group"
            >
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Back to Verification</span>
            </Link>
          </div>

          {/* Main Card Container */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#121c2a] p-6 sm:p-9 shadow-md relative overflow-hidden">
            {/* Header inside Card */}
            <div className="space-y-2 pb-6 border-b border-slate-100 dark:border-slate-800 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#168B78]/10 text-[#168B78] dark:bg-teal-950/40 dark:text-[#2dd4bf]">
                <User className="size-3.5" />
                <span>Step 4 of 5 · Profile Details</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102D45] dark:text-white tracking-tight">
                Personal Information
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Let&apos;s get to know you. Add your basic details to create your member profile.
              </p>
            </div>

            {/* Error Alert */}
            {backendError && (
              <div className="mt-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs sm:text-sm text-rose-700 dark:text-rose-300 flex items-start gap-2.5 animate-in fade-in">
                <AlertTriangle className="size-4 shrink-0 text-rose-500 mt-0.5" />
                <span className="leading-relaxed font-medium">{backendError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveAndContinue} className="mt-6 space-y-5 text-left" noValidate>
              {/* Row 1: First Name, Middle Name, Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* First Name */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="firstName"
                    className="block text-xs font-bold text-[#102D45] dark:text-slate-200"
                  >
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onBlur={() => markTouched("firstName")}
                    placeholder="e.g. Aman"
                    className={`w-full rounded-xl border bg-slate-50/50 dark:bg-[#0b131e] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
                      touched.firstName && !isFirstNameValid
                        ? "border-rose-400 focus:ring-rose-400"
                        : "border-slate-300 dark:border-slate-700 focus:ring-[#168B78] focus:border-[#168B78]"
                    }`}
                  />
                  {touched.firstName && !isFirstNameValid && (
                    <p className="text-[11px] text-rose-500 font-medium">First name is required.</p>
                  )}
                </div>

                {/* Middle Name */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="middleName"
                    className="block text-xs font-bold text-[#102D45] dark:text-slate-200"
                  >
                    Middle Name <span className="text-[11px] font-normal text-slate-400">(Optional)</span>
                  </label>
                  <input
                    id="middleName"
                    type="text"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    placeholder="e.g. Kumar"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-[#0b131e] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#168B78] transition-all"
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="lastName"
                    className="block text-xs font-bold text-[#102D45] dark:text-slate-200"
                  >
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onBlur={() => markTouched("lastName")}
                    placeholder="e.g. Verma"
                    className={`w-full rounded-xl border bg-slate-50/50 dark:bg-[#0b131e] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
                      touched.lastName && !isLastNameValid
                        ? "border-rose-400 focus:ring-rose-400"
                        : "border-slate-300 dark:border-slate-700 focus:ring-[#168B78] focus:border-[#168B78]"
                    }`}
                  />
                  {touched.lastName && !isLastNameValid && (
                    <p className="text-[11px] text-rose-500 font-medium">Last name is required.</p>
                  )}
                </div>
              </div>

              {/* Row 2: Date of Birth & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Date of Birth */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="dob"
                    className="block text-xs font-bold text-[#102D45] dark:text-slate-200"
                  >
                    Date of Birth <span className="text-[11px] font-normal text-slate-400">(Optional)</span>
                  </label>
                  <div className="relative">
                    <input
                      id="dob"
                      type="date"
                      max={maxDobDate}
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-[#0b131e] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#168B78] transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                    <Lock className="size-3 text-[#168B78]" />
                    <span>Kept private, never displayed publicly on your profile.</span>
                  </p>
                </div>

                {/* Gender */}
                <div className="space-y-1.5">
                  <label
                    className="block text-xs font-bold text-[#102D45] dark:text-slate-200"
                  >
                    Gender <span className="text-[11px] font-normal text-slate-400">(Optional)</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {GENDER_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setGender(gender === opt.value ? "" : opt.value)}
                        className={`py-2.5 px-2 rounded-xl border text-xs font-semibold text-center transition cursor-pointer ${
                          gender === opt.value
                            ? "border-[#168B78] bg-teal-50 dark:bg-teal-950/50 text-[#168B78] dark:text-[#2dd4bf] ring-1 ring-[#168B78]"
                            : "border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-[#0b131e] text-slate-700 dark:text-slate-300 hover:border-slate-400"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                    <Shield className="size-3 text-[#168B78]" />
                    <span>Used only for healthcare demographics, never made public.</span>
                  </p>
                </div>
              </div>

              {/* Geographic Section Header */}
              <div className="pt-3 pb-1 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-[#168B78]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#102D45] dark:text-slate-200">
                    Location &amp; Region
                  </h3>
                </div>
              </div>

              {/* Row 3: Country, State, City Dependent Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* 1. Country Selector (Searchable) */}
                <div className="space-y-1.5 relative">
                  <label
                    className="block text-xs font-bold text-[#102D45] dark:text-slate-200"
                  >
                    Country <span className="text-rose-500">*</span>
                  </label>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-[#0b131e] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white flex items-center justify-between focus:outline-hidden focus:ring-2 focus:ring-[#168B78] transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-base">{currentCountryData.flag}</span>
                        <span className="font-medium truncate">{selectedCountry}</span>
                      </div>
                      <ChevronDown className="size-4 text-slate-400 shrink-0" />
                    </button>

                    {/* Searchable Country Dropdown Menu */}
                    {isCountryDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#121c2a] border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 p-2 space-y-1 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95">
                        <div className="relative mb-1">
                          <Search className="size-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                          <input
                            type="text"
                            value={countrySearchQuery}
                            onChange={(e) => setCountrySearchQuery(e.target.value)}
                            placeholder="Search country..."
                            className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0b131e] text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-[#168B78]"
                            autoFocus
                          />
                        </div>
                        {filteredCountries.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => handleCountrySelect(c.name)}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 transition cursor-pointer ${
                              selectedCountry === c.name
                                ? "bg-[#168B78]/10 text-[#168B78] font-bold"
                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                          >
                            <span>{c.flag}</span>
                            <span className="truncate">{c.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. State / Province (Dependent on Country) */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="stateSelect"
                    className="block text-xs font-bold text-[#102D45] dark:text-slate-200"
                  >
                    State / Province <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="stateSelect"
                      value={selectedState}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-[#0b131e] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-[#168B78] transition-all cursor-pointer"
                    >
                      {availableStates.map((s) => (
                        <option key={s.name} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 3. City (Dependent on State) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="citySelect"
                      className="block text-xs font-bold text-[#102D45] dark:text-slate-200"
                    >
                      City <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomCityMode(!isCustomCityMode)}
                      className="text-[11px] font-semibold text-[#168B78] hover:underline cursor-pointer"
                    >
                      {isCustomCityMode ? "Select from list" : "Type manually"}
                    </button>
                  </div>

                  {isCustomCityMode ? (
                    <input
                      id="customCity"
                      type="text"
                      value={customCity}
                      onChange={(e) => setCustomCity(e.target.value)}
                      onBlur={() => markTouched("city")}
                      placeholder="Enter your city name"
                      className={`w-full rounded-xl border bg-slate-50/50 dark:bg-[#0b131e] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
                        touched.city && !isCityValid
                          ? "border-rose-400 focus:ring-rose-400"
                          : "border-slate-300 dark:border-slate-700 focus:ring-[#168B78] focus:border-[#168B78]"
                      }`}
                    />
                  ) : (
                    <select
                      id="citySelect"
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-[#0b131e] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-[#168B78] transition-all cursor-pointer"
                    >
                      {availableCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                      <option value="Other">Other City</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Action Buttons: Save & Continue + Skip for Now */}
              <div className="pt-6 space-y-3">
                <button
                  type="submit"
                  disabled={!isFormValid || isSaving}
                  className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all duration-200 ${
                    isFormValid && !isSaving
                      ? "bg-[#102D45] hover:bg-[#0c2235] text-white shadow-md hover:shadow-lg active:scale-98 cursor-pointer ring-2 ring-[#168B78]/30"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                  }`}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="size-4.5 animate-spin" />
                      <span>Saving Information...</span>
                    </>
                  ) : (
                    <>
                      <span>Save &amp; Continue</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleSkip}
                    disabled={isSkipping}
                    className="text-xs font-semibold text-slate-500 hover:text-[#102D45] dark:text-slate-400 dark:hover:text-white transition cursor-pointer py-1"
                  >
                    {isSkipping ? "Navigating to next step..." : "Skip this step for now →"}
                  </button>
                </div>
              </div>
            </form>

            {/* Footer Trust Info */}
            <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-400">
              <Shield className="size-4 text-[#168B78]" />
              <span>You can review or update your personal details at any time from Settings</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
