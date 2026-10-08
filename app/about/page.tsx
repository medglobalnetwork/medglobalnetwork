"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  Rocket,
  Eye,
  Heart,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  Share2,
  Globe2,
  Lightbulb,
  Briefcase,
  ShoppingCart,
  ArrowRight,
  Mail,
  ChevronDown,
  Menu,
  X,
  TrendingUp,
} from "lucide-react";
import { LandingFooter } from "@/modules/landing/components/LandingFooter";
import { AuthModal } from "@/modules/landing/components/AuthModal";
import { authClient } from "@/lib/auth-client";

export default function AboutPage() {
  const { data: session } = authClient.useSession();
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<"signin" | "signup">("signup");
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const openAuth = (mode: "signin" | "signup" = "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const stats = [
    {
      number: "10,000+",
      label: "Healthcare Professionals",
      icon: Users,
    },
    {
      number: "50,000+",
      label: "Students Onboarded",
      icon: GraduationCap,
    },
    {
      number: "2,000+",
      label: "Organizations Trust Us",
      icon: Building2,
    },
    {
      number: "5,000+",
      label: "Courses & Learning Resources",
      icon: BookOpen,
    },
    {
      number: "100,000+",
      label: "Connections Made",
      icon: Share2,
    },
    {
      number: "25+",
      label: "Countries Reaching",
      icon: Globe2,
    },
  ];

  const milestones = [
    {
      year: "2018",
      title: "The Idea",
      desc: "MGN was founded with a vision to unify the healthcare community.",
      icon: Lightbulb,
    },
    {
      year: "2019",
      title: "Early Growth",
      desc: "Launched the platform and onboarded our first 10,000+ members.",
      icon: Users,
    },
    {
      year: "2020",
      title: "Building Trust",
      desc: "Introduced verification and advanced features for professionals.",
      icon: ShieldCheck,
    },
    {
      year: "2022",
      title: "Expanding Horizons",
      desc: "Reached 50,000+ members and partnered with leading organizations.",
      icon: Rocket,
    },
    {
      year: "2024",
      title: "Global Impact",
      desc: "Serving a global community and continuing to innovate for the future.",
      icon: Globe2,
    },
  ];

  const team = [
    {
      name: "Dr. Priya Sharma",
      role: "Co-Founder & CEO",
      image: "https://images.unsplash.com/photo-1594824813589-8d1979929851?auto=format&fit=crop&w=600&q=80",
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
      email: "mailto:support@mgn.life",
    },
    {
      name: "Dr. Arjun Patel",
      role: "Co-Founder & CTO",
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80",
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
      email: "mailto:support@mgn.life",
    },
    {
      name: "Rohit Verma",
      role: "Head of Operations",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80",
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
      email: "mailto:business@mgn.life",
    },
    {
      name: "Neha Singh",
      role: "Head of Growth",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
      email: "mailto:business@mgn.life",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto flex h-16 sm:h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="MGN Logo"
                className="h-8 sm:h-9 w-auto object-contain"
              />
              <span className="text-xl sm:text-2xl font-black tracking-tight text-[#0f4c81]">
                MGN
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-8 text-sm font-semibold text-slate-600">
            <Link href="/" className="hover:text-blue-600 transition">
              Home
            </Link>

            {/* Active About Us link with blue bottom line */}
            <div className="relative py-2 text-blue-600 font-bold">
              <span>About Us</span>
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            </div>

            <Link href="/features" className="hover:text-blue-600 transition">
              Features
            </Link>

            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-1 hover:text-blue-600 transition cursor-pointer"
              >
                <span>For Professionals</span>
                <ChevronDown className="size-3.5 text-slate-400 group-hover:text-blue-600 transition" />
              </button>
              <div className="absolute top-full left-0 hidden group-hover:block bg-white border border-slate-100 rounded-2xl p-2 shadow-lg w-52 text-xs">
                <Link href="/signup?role=doctor" className="block px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700">Doctors & Specialists</Link>
                <Link href="/signup?role=student" className="block px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700">Medical Students</Link>
                <Link href="/verify" className="block px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700">Credential Verification</Link>
              </div>
            </div>

            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-1 hover:text-blue-600 transition cursor-pointer"
              >
                <span>For Organizations</span>
                <ChevronDown className="size-3.5 text-slate-400 group-hover:text-blue-600 transition" />
              </button>
              <div className="absolute top-full left-0 hidden group-hover:block bg-white border border-slate-100 rounded-2xl p-2 shadow-lg w-52 text-xs">
                <Link href="/signup?role=hospital" className="block px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700">Hospitals & Clinics</Link>
                <Link href="/signup?role=university" className="block px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700">Medical Colleges</Link>
                <Link href="/pricing" className="block px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700">Enterprise Plans</Link>
              </div>
            </div>

            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-1 hover:text-blue-600 transition cursor-pointer"
              >
                <span>Resources</span>
                <ChevronDown className="size-3.5 text-slate-400 group-hover:text-blue-600 transition" />
              </button>
              <div className="absolute top-full left-0 hidden group-hover:block bg-white border border-slate-100 rounded-2xl p-2 shadow-lg w-52 text-xs">
                <Link href="/learn" className="block px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700">CME Learning Suite</Link>
                <Link href="/opportunities/jobs" className="block px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700">Medical Jobs</Link>
                <Link href="/contact" className="block px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700">Help & Contact</Link>
              </div>
            </div>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {session?.user ? (
              <Link
                href="/home"
                className="rounded-xl bg-[#0f4c81] px-5 py-2 text-xs sm:text-sm font-bold text-white hover:bg-[#0c3c66] transition shadow-xs"
              >
                Dashboard →
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openAuth("signin")}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => openAuth("signup")}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 transition shadow-xs cursor-pointer"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile menu hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-3 animate-in slide-in-from-top-2">
            <Link href="/" className="block py-2 text-sm font-semibold text-slate-700">Home</Link>
            <Link href="/about" className="block py-2 text-sm font-bold text-blue-600">About Us</Link>
            <Link href="/features" className="block py-2 text-sm font-semibold text-slate-700">Features</Link>
            <Link href="/pricing" className="block py-2 text-sm font-semibold text-slate-700">For Organizations</Link>
            <Link href="/learn" className="block py-2 text-sm font-semibold text-slate-700">Resources</Link>
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); openAuth("signin"); }}
                className="w-full text-center py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-800"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); openAuth("signup"); }}
                className="w-full text-center py-2.5 rounded-xl bg-blue-600 font-bold text-xs text-white"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-10 sm:pt-16 pb-16 sm:pb-24">
        {/* Background ambient medical circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-50/40 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-3.5 py-1 text-xs font-bold text-blue-600 shadow-2xs">
                <span>About MGN</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#0f172a] leading-[1.12]">
                Building the Future <br />
                <span className="text-[#0d9488]">of Healthcare</span> <br />
                Together.
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed font-normal">
                MGN is India&apos;s unified healthcare ecosystem connecting professionals, students, organizations, and businesses on a single platform to learn, grow, collaborate, and thrive.
              </p>

              {/* Feature Highlights Pills */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs sm:text-sm font-bold text-slate-700">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-blue-600 stroke-[2.5]" />
                  <span>Trusted</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-teal-600 stroke-[2.5]" />
                  <span>Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="size-4 text-blue-600 stroke-[2.5]" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-teal-600 stroke-[2.5]" />
                  <span>Healthcare Focused</span>
                </div>
              </div>
            </div>

            {/* Right Illustration & Network Nodes */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              {/* Outer circular network orbit rings */}
              <div className="relative w-full max-w-[480px] aspect-square flex items-center justify-center">
                {/* Background Ring SVG */}
                <svg className="absolute inset-0 w-full h-full -z-10 text-blue-100" viewBox="0 0 500 500" fill="none">
                  <circle cx="250" cy="250" r="230" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 6" />
                  <circle cx="250" cy="250" r="180" stroke="currentColor" strokeWidth="1.5" />
                </svg>

                {/* Main Hero Doctor Group Image */}
                <div className="relative w-[340px] sm:w-[400px] h-[340px] sm:h-[400px] rounded-full overflow-hidden border-4 border-white shadow-2xl bg-gradient-to-b from-blue-50 to-teal-50/40">
                  <img
                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80"
                    alt="Healthcare Team"
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
                </div>

                {/* Floating Circular Badge Nodes */}
                {/* 1. Student / Cap (Top Left) */}
                <div className="absolute top-4 left-12 size-12 sm:size-14 rounded-full bg-white border border-blue-100 shadow-lg flex items-center justify-center text-blue-600 animate-bounce duration-1000">
                  <GraduationCap className="size-5 sm:size-6" />
                </div>

                {/* 2. Medical Bag / Briefcase (Top Center) */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 size-12 sm:size-14 rounded-full bg-white border border-blue-100 shadow-lg flex items-center justify-center text-blue-600">
                  <Briefcase className="size-5 sm:size-6" />
                </div>

                {/* 3. Hospital / Organization (Top Right) */}
                <div className="absolute top-6 right-10 size-12 sm:size-14 rounded-full bg-white border border-blue-100 shadow-lg flex items-center justify-center text-blue-600">
                  <Building2 className="size-5 sm:size-6" />
                </div>

                {/* 4. Professionals / Network (Far Left) */}
                <div className="absolute top-1/2 -left-3 -translate-y-1/2 size-12 sm:size-14 rounded-full bg-white border border-blue-100 shadow-lg flex items-center justify-center text-blue-600">
                  <Users className="size-5 sm:size-6" />
                </div>

                {/* 5. Marketplace / Cart (Far Right) */}
                <div className="absolute top-1/2 -right-3 -translate-y-1/2 size-12 sm:size-14 rounded-full bg-white border border-blue-100 shadow-lg flex items-center justify-center text-blue-600">
                  <ShoppingCart className="size-5 sm:size-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OUR MISSION, VISION & VALUES */}
      <section className="py-16 sm:py-20 bg-slate-50/60 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Header */}
            <div className="lg:col-span-4 space-y-4 text-left">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
                Our Mission, <br />
                Vision & Values
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                We are driven by a purpose to create meaningful impact in the healthcare community.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => openAuth("signup")}
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-blue-600 bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-blue-600 hover:bg-blue-50 transition shadow-2xs cursor-pointer"
                >
                  <span>Join Our Mission</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>

            {/* Right 3 Cards */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Our Mission */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm space-y-4 text-left hover:shadow-md transition">
                <div className="size-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Rocket className="size-6 stroke-[2.2]" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Our Mission</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  To connect every healthcare professional, student, and organization with the right opportunities, resources, and networks to grow and make a difference.
                </p>
              </div>

              {/* Card 2: Our Vision */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm space-y-4 text-left hover:shadow-md transition">
                <div className="size-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Eye className="size-6 stroke-[2.2]" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Our Vision</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  To become the world&apos;s most trusted and comprehensive healthcare ecosystem, powering careers, institutions, and businesses for a healthier future.
                </p>
              </div>

              {/* Card 3: Our Values */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm space-y-4 text-left hover:shadow-md transition">
                <div className="size-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Heart className="size-6 stroke-[2.2]" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Our Values</h3>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600 font-medium">
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-purple-500" />
                    <span>Integrity & Trust</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-purple-500" />
                    <span>Innovation & Excellence</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-purple-500" />
                    <span>Collaboration & Growth</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-purple-500" />
                    <span>Inclusivity & Respect</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-purple-500" />
                    <span>Impact & Responsibility</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. STATS COUNTER STRIP */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8 text-center">
            {stats.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex flex-col items-center space-y-2.5">
                  <div className="size-11 sm:size-12 rounded-2xl bg-blue-50/80 text-blue-600 flex items-center justify-center shadow-2xs">
                    <Icon className="size-5 sm:size-6 stroke-[2.2]" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {item.number}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 leading-snug">
                    {item.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. OUR JOURNEY (TIMELINE) */}
      <section className="py-16 sm:py-24 bg-slate-50/50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4 text-left max-w-2xl mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Our Journey
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              From a simple idea to a growing healthcare revolution. Here&apos;s how we got here.
            </p>
          </div>

          {/* Horizontal Desktop Timeline */}
          <div className="relative">
            {/* Connecting Horizontal Line */}
            <div className="hidden lg:block absolute top-7 left-12 right-12 h-0.5 bg-blue-100 -z-0" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6 relative z-10">
              {milestones.map((milestone, idx) => {
                const Icon = milestone.icon;
                return (
                  <div key={idx} className="flex flex-col items-center text-center space-y-3 bg-white lg:bg-transparent p-5 lg:p-0 rounded-2xl border lg:border-none border-slate-100 shadow-xs lg:shadow-none">
                    {/* Node Icon */}
                    <div className="size-14 rounded-2xl bg-blue-50 border-2 border-white shadow-md text-blue-600 flex items-center justify-center">
                      <Icon className="size-6 stroke-[2.2]" />
                    </div>

                    {/* Year */}
                    <span className="text-lg font-black text-slate-900 tracking-tight">
                      {milestone.year}
                    </span>

                    {/* Milestone Title */}
                    <h4 className="text-sm font-bold text-slate-900">
                      {milestone.title}
                    </h4>

                    {/* Description */}
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {milestone.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 6. MEET OUR LEADERSHIP TEAM */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-12">
            {/* Header Column */}
            <div className="lg:col-span-4 space-y-4 text-left">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
                Meet Our <br />
                Leadership Team
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                A passionate team of healthcare professionals, technologists, and visionaries working together to build a better future.
              </p>
              <div className="pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                >
                  <span>View All Team Members</span>
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>

            {/* 4 Team Member Cards */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl border border-slate-100 bg-slate-50/50 p-4 sm:p-5 text-center space-y-3 shadow-2xs hover:shadow-md transition group"
                >
                  {/* Photo */}
                  <div className="w-full aspect-square rounded-2xl overflow-hidden bg-slate-200">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>

                  {/* Name & Role */}
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                      {member.name}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-500">
                      {member.role}
                    </p>
                  </div>

                  {/* Social Icons */}
                  <div className="flex items-center justify-center gap-3 pt-1 text-slate-400">
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 transition"
                      aria-label="LinkedIn"
                    >
                      <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.63 1.63 0 1 0-.01-3.26 1.63 1.63 0 0 0 .01 3.26m1.4 9.74v-8.37H5.06v8.37h2.8z"/>
                      </svg>
                    </a>
                    <a
                      href={member.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-sky-500 transition"
                      aria-label="Twitter"
                    >
                      <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </a>
                    <a
                      href={member.email}
                      className="hover:text-emerald-600 transition"
                      aria-label="Email"
                    >
                      <Mail className="size-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. BOTTOM CTA BANNER */}
      <section className="pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 p-8 sm:p-12 text-white shadow-xl overflow-hidden">
            {/* Background Medical Plus Watermark */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10 text-white pointer-events-none select-none">
              <span className="text-[200px] font-black leading-none">+</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
              {/* Left CTA */}
              <div className="lg:col-span-5 space-y-4 text-left">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                  Be a Part of Our Mission
                </h3>
                <p className="text-xs sm:text-sm text-blue-50 leading-relaxed font-medium">
                  Together, we can build a stronger, smarter, and healthier tomorrow.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => openAuth("signup")}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-xs sm:text-sm font-bold text-blue-600 hover:bg-blue-50 transition shadow-md cursor-pointer"
                  >
                    <span>Get Started – It&apos;s Free</span>
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>

              {/* Right 4 Value Pillars */}
              <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                {/* 1. Connect */}
                <div className="space-y-1.5">
                  <div className="size-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white">
                    <Users className="size-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Connect</h4>
                  <p className="text-[11px] text-blue-100 leading-snug">
                    Build meaningful relationships
                  </p>
                </div>

                {/* 2. Learn */}
                <div className="space-y-1.5">
                  <div className="size-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white">
                    <BookOpen className="size-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Learn</h4>
                  <p className="text-[11px] text-blue-100 leading-snug">
                    Access quality resources
                  </p>
                </div>

                {/* 3. Grow */}
                <div className="space-y-1.5">
                  <div className="size-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white">
                    <TrendingUp className="size-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Grow</h4>
                  <p className="text-[11px] text-blue-100 leading-snug">
                    Advance your career
                  </p>
                </div>

                {/* 4. Thrive */}
                <div className="space-y-1.5">
                  <div className="size-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white">
                    <Sparkles className="size-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Thrive</h4>
                  <p className="text-[11px] text-blue-100 leading-snug">
                    Create a lasting impact
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <LandingFooter onOpenAuth={openAuth} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}
