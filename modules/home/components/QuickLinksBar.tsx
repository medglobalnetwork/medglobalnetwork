"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Calendar,
  FlaskConical,
  GraduationCap,
  ShoppingBag,
  Sparkles,
  Tent,
  Users,
  ArrowRight,
  LayoutGrid,
} from "lucide-react";

// ============================================================
// 3D Vector & Icons8 Ouch Illustrations Matching Mockup
// ============================================================

function Ouch3DIllustration({
  src,
  alt,
  fallback,
}: {
  src: string;
  alt: string;
  fallback: React.ReactNode;
}) {
  const [error, setError] = React.useState(false);

  if (error) {
    return <>{fallback}</>;
  }

  return (
    <div className="relative h-11 w-13 sm:h-13 sm:w-16 flex items-center justify-end select-none">
      <img
        src={src}
        alt={alt}
        className="max-h-full max-w-full object-contain drop-shadow-xs transition-transform duration-300 group-hover:scale-110"
        onError={() => setError(true)}
        loading="lazy"
      />
    </div>
  );
}

function DoctorAvatarsCluster() {
  return (
    <div className="flex items-center -space-x-2 select-none">
      <img
        src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80"
        alt="Doctor"
        className="h-7 w-7 sm:h-8 sm:w-8 rounded-full border-2 border-white object-cover shadow-2xs"
        loading="lazy"
      />
      <img
        src="https://images.unsplash.com/photo-1594824813639-502df613d902?w=100&auto=format&fit=crop&q=80"
        alt="Doctor"
        className="h-7 w-7 sm:h-8 sm:w-8 rounded-full border-2 border-white object-cover shadow-2xs"
        loading="lazy"
      />
      <img
        src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&auto=format&fit=crop&q=80"
        alt="Doctor"
        className="h-7 w-7 sm:h-8 sm:w-8 rounded-full border-2 border-white object-cover shadow-2xs"
        loading="lazy"
      />
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1b64da] text-[10px] font-black text-white border-2 border-white shadow-2xs">
        +
      </div>
    </div>
  );
}

function BooksIllustration({ className = "h-11 w-13 sm:h-12 sm:w-14" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="book-blue" x1="0" y1="0" x2="100" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563eb" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="book-emerald" x1="0" y1="0" x2="100" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="book-teal" x1="0" y1="0" x2="100" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#06b6d4" />
          <stop offset="1" stopColor="#0891b2" />
        </linearGradient>
        <filter id="book-shadow" x="-10%" y="-10%" width="120%" height="130%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodOpacity="0.14" />
        </filter>
      </defs>
      {/* Bottom Book */}
      <g filter="url(#book-shadow)">
        <polygon points="12,50 68,26 92,38 36,62" fill="url(#book-blue)" />
        <polygon points="12,50 36,62 36,69 12,57" fill="#1e40af" />
        <polygon points="36,62 92,38 92,45 36,69" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.5" />
      </g>
      {/* Middle Book */}
      <g filter="url(#book-shadow)">
        <polygon points="14,38 68,16 90,27 36,49" fill="url(#book-teal)" />
        <polygon points="14,38 36,49 36,55 14,44" fill="#0e7490" />
        <polygon points="36,49 90,27 90,33 36,55" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.5" />
      </g>
      {/* Top Book */}
      <g filter="url(#book-shadow)">
        <polygon points="16,26 68,6 88,16 36,36" fill="url(#book-emerald)" />
        <polygon points="16,26 36,36 36,42 16,32" fill="#047857" />
        <polygon points="36,36 88,16 88,22 36,42" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" />
      </g>
    </svg>
  );
}

function JobResumeIllustration({ className = "h-11 w-13 sm:h-12 sm:w-14" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 90 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="job-shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="1" dy="3" stdDeviation="2.5" floodOpacity="0.12" />
        </filter>
        <linearGradient id="lens-grad" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="1" stopColor="#fed7aa" stopOpacity="0.25" />
        </linearGradient>
      </defs>
      {/* Paper Sheet */}
      <g filter="url(#job-shadow)">
        <rect x="18" y="10" width="46" height="58" rx="6" fill="#ffffff" stroke="#f1f5f9" strokeWidth="1" />
        <text x="25" y="24" fill="#0284c7" fontSize="8" fontWeight="bold" fontFamily="system-ui">JOB</text>
        <rect x="25" y="30" width="30" height="3" rx="1.5" fill="#e2e8f0" />
        <rect x="25" y="37" width="24" height="3" rx="1.5" fill="#e2e8f0" />
        <rect x="25" y="44" width="28" height="3" rx="1.5" fill="#e2e8f0" />
        <rect x="25" y="51" width="18" height="3" rx="1.5" fill="#f1f5f9" />
      </g>
      {/* Magnifying Glass */}
      <g filter="url(#job-shadow)">
        <circle cx="58" cy="46" r="13" fill="url(#lens-grad)" stroke="#d97706" strokeWidth="3" />
        <path d="M68 56 L80 68" stroke="#b45309" strokeWidth="4" strokeLinecap="round" />
        <path d="M52 40 A8 8 0 0 1 64 40" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

function CalendarIllustration({ className = "h-11 w-13 sm:h-12 sm:w-14" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 90 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="cal-shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="1" dy="3" stdDeviation="2.5" floodOpacity="0.14" />
        </filter>
      </defs>
      {/* Calendar body */}
      <g filter="url(#cal-shadow)">
        <rect x="18" y="16" width="48" height="50" rx="8" fill="#ffffff" stroke="#f1f5f9" strokeWidth="1" />
        <path d="M18 24 Q18 16 26 16 L58 16 Q66 16 66 24 L66 27 L18 27 Z" fill="#f43f5e" />
        {/* Top Rings */}
        <rect x="26" y="12" width="3" height="7" rx="1.5" fill="#fda4af" />
        <rect x="36" y="12" width="3" height="7" rx="1.5" fill="#fda4af" />
        <rect x="46" y="12" width="3" height="7" rx="1.5" fill="#fda4af" />
        <rect x="56" y="12" width="3" height="7" rx="1.5" fill="#fda4af" />
        {/* Calendar Grid */}
        <circle cx="28" cy="36" r="2.5" fill="#fee2e2" />
        <circle cx="38" cy="36" r="2.5" fill="#fee2e2" />
        <circle cx="48" cy="36" r="2.5" fill="#fee2e2" />
        <circle cx="28" cy="46" r="2.5" fill="#fee2e2" />
        <circle cx="38" cy="46" r="2.5" fill="#fee2e2" />
        <circle cx="48" cy="46" r="2.5" fill="#fee2e2" />
      </g>
      {/* 3D Red Clock Badge */}
      <g filter="url(#cal-shadow)">
        <circle cx="64" cy="54" r="12" fill="#e11d48" />
        <circle cx="64" cy="54" r="10.5" fill="#f43f5e" />
        <path d="M64 48 L64 54 L69 54" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

function MegaphoneIllustration({ className = "h-11 w-13 sm:h-12 sm:w-14" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 90 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="mega-shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="1" dy="3" stdDeviation="2.5" floodOpacity="0.14" />
        </filter>
        <linearGradient id="mega-grad" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#0d9488" />
          <stop offset="1" stopColor="#0f766e" />
        </linearGradient>
      </defs>
      <g filter="url(#mega-shadow)" transform="rotate(-15 45 40)">
        {/* Cone Body */}
        <path d="M28 34 L56 22 L56 58 L28 46 Z" fill="url(#mega-grad)" />
        <ellipse cx="56" cy="40" rx="3.5" ry="18" fill="#14b8a6" />
        <ellipse cx="28" cy="40" rx="2.5" ry="6" fill="#f8fafc" />
        <rect x="20" y="36" width="8" height="8" rx="2" fill="#f1f5f9" />
        {/* Handle */}
        <path d="M34 44 L37 60 A2 2 0 0 1 35 62 L31 62 A2 2 0 0 1 29 60 L31 45" fill="#0f766e" />
      </g>
      {/* Sound Waves */}
      <path d="M66 22 L73 17" stroke="#14b8a6" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M70 36 L79 36" stroke="#14b8a6" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M66 50 L74 56" stroke="#14b8a6" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function ResearchIllustration({ className = "h-11 w-13 sm:h-12 sm:w-14" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 90 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="res-shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="1" dy="3" stdDeviation="2.5" floodOpacity="0.12" />
        </filter>
      </defs>
      {/* Paper with Charts */}
      <g filter="url(#res-shadow)">
        <rect x="18" y="10" width="46" height="58" rx="6" fill="#ffffff" stroke="#f1f5f9" strokeWidth="1" />
        <rect x="25" y="18" width="28" height="3" rx="1.5" fill="#c084fc" />
        <rect x="25" y="24" width="18" height="3" rx="1.5" fill="#e9d5ff" />
        {/* Bar chart */}
        <rect x="25" y="48" width="5" height="12" rx="1.5" fill="#c084fc" />
        <rect x="33" y="40" width="5" height="20" rx="1.5" fill="#9333ea" />
        <rect x="41" y="34" width="5" height="26" rx="1.5" fill="#7c3aed" />
      </g>
      {/* Purple Magnifier */}
      <g filter="url(#res-shadow)">
        <circle cx="56" cy="50" r="11" fill="#fdf4ff" stroke="#7c3aed" strokeWidth="2.5" fillOpacity="0.7" />
        <path d="M64 58 L74 68" stroke="#6b21a8" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M51 45 A6 6 0 0 1 60 45" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

function MarketplaceIllustration({ className = "h-11 w-13 sm:h-12 sm:w-14" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 90 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="cart-shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="1" dy="3" stdDeviation="2.5" floodOpacity="0.14" />
        </filter>
        <linearGradient id="cart-grad" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#38bdf8" />
          <stop offset="1" stopColor="#0284c7" />
        </linearGradient>
      </defs>
      {/* Cart Basket */}
      <g filter="url(#cart-shadow)">
        <path d="M16 26 L23 26 L34 52 L58 52 L67 33 L26 33" stroke="url(#cart-grad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <line x1="28" y1="40" x2="63" y2="40" stroke="#7dd3fc" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="31" y1="46" x2="60" y2="46" stroke="#7dd3fc" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="36" cy="60" r="3.5" fill="#0369a1" />
        <circle cx="56" cy="60" r="3.5" fill="#0369a1" />
      </g>
      {/* Cross Badge */}
      <g filter="url(#cart-shadow)">
        <circle cx="62" cy="24" r="10" fill="#0284c7" />
        <path d="M62 18 L62 30 M56 24 L68 24" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function AIAssistantIllustration({ className = "h-11 w-13 sm:h-12 sm:w-14" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 90 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="ai-shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="1" dy="3" stdDeviation="2.5" floodOpacity="0.14" />
        </filter>
        <linearGradient id="bot-head" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ffffff" />
          <stop offset="1" stopColor="#f3e8ff" />
        </linearGradient>
      </defs>
      {/* Sparkles */}
      <path d="M22 22 L24 16 L26 22 L32 24 L26 26 L24 32 L22 26 L16 24 Z" fill="#c084fc" />
      <path d="M72 18 L73 14 L74 18 L78 19 L74 20 L73 24 L72 20 L68 19 Z" fill="#d8b4fe" />
      {/* Robot Head */}
      <g filter="url(#ai-shadow)">
        <circle cx="50" cy="18" r="3" fill="#a855f7" />
        <line x1="50" y1="21" x2="50" y2="28" stroke="#a855f7" strokeWidth="2" />
        <rect x="28" y="27" width="44" height="34" rx="14" fill="url(#bot-head)" stroke="#e9d5ff" strokeWidth="1" />
        <rect x="24" y="37" width="4" height="12" rx="2" fill="#9333ea" />
        <rect x="72" y="37" width="4" height="12" rx="2" fill="#9333ea" />
        {/* Screen with Eyes */}
        <rect x="34" y="33" width="32" height="22" rx="8" fill="#2e1065" />
        <path d="M39 44 Q43 40 47 44" stroke="#a5f3fc" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M53 44 Q57 40 61 44" stroke="#a5f3fc" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

// ============================================================
// Data Structure
// ============================================================

interface QuickLinkCard {
  id: string;
  title: string;
  description: string;
  actionText: string;
  href: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  cardBg: string;
  cardBorder: string;
  btnBg: string;
  arrowBg: string;
  actionColor: string;
  illustration: React.ReactNode;
}

export function QuickLinksBar() {
  const router = useRouter();

  const cards: QuickLinkCard[] = [
    {
      id: "network",
      title: "Network",
      description: "Connect with verified healthcare professionals, organizations and peers.",
      actionText: "Explore Network",
      href: "/network",
      icon: <Users className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2]" />,
      iconBg: "bg-[#e6f1fe]",
      iconColor: "text-[#1b64da]",
      cardBg: "bg-gradient-to-br from-[#ffffff] via-[#f8fbff] to-[#eef5fe]",
      cardBorder: "border-[#e3effd]",
      btnBg: "bg-[#eef5fe] text-[#1b64da] hover:bg-[#e1edfc]",
      arrowBg: "bg-[#1b64da]",
      actionColor: "text-[#1b64da]",
      illustration: <DoctorAvatarsCluster />,
    },
    {
      id: "learn",
      title: "Learn",
      description: "Access courses, CME, workshops and certifications to grow your skills.",
      actionText: "Start Learning",
      href: "/learn",
      icon: <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2]" />,
      iconBg: "bg-[#dcf4e8]",
      iconColor: "text-[#059669]",
      cardBg: "bg-gradient-to-br from-[#ffffff] via-[#f7fcf9] to-[#edf9f3]",
      cardBorder: "border-[#dff3ea]",
      btnBg: "bg-[#e6f7ef] text-[#059669] hover:bg-[#d6f2e4]",
      arrowBg: "bg-[#059669]",
      actionColor: "text-[#059669]",
      illustration: (
        <Ouch3DIllustration
          src="https://ouch-prod-var-cdn.icons8.com/bo/illustrations/previews/Q7KVSjI2tgY44f0f.webp"
          alt="Learn 3D Books"
          fallback={<BooksIllustration />}
        />
      ),
    },
    {
      id: "jobs",
      title: "Jobs",
      description: "Find career opportunities in hospitals, clinics, NGOs and more.",
      actionText: "Browse Jobs",
      href: "/opportunities/jobs",
      icon: <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2]" />,
      iconBg: "bg-[#fee9cc]",
      iconColor: "text-[#d97706]",
      cardBg: "bg-gradient-to-br from-[#ffffff] via-[#fdfcf9] to-[#fef6ea]",
      cardBorder: "border-[#fcecd7]",
      btnBg: "bg-[#fef4e4] text-[#d97706] hover:bg-[#fde7c7]",
      arrowBg: "bg-[#d97706]",
      actionColor: "text-[#d97706]",
      illustration: (
        <Ouch3DIllustration
          src="https://ouch-prod-var-cdn.icons8.com/rb/illustrations/previews/NfI6wvDSoJyxG93p.webp"
          alt="Jobs 3D Resume"
          fallback={<JobResumeIllustration />}
        />
      ),
    },
    {
      id: "events",
      title: "Events",
      description: "Conferences, CME, workshops and webinars from verified organizers.",
      actionText: "View Events",
      href: "/events",
      icon: <Calendar className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2]" />,
      iconBg: "bg-[#fddde4]",
      iconColor: "text-[#e11d48]",
      cardBg: "bg-gradient-to-br from-[#ffffff] via-[#fdfafb] to-[#feeef1]",
      cardBorder: "border-[#fcdde3]",
      btnBg: "bg-[#ffedf1] text-[#e11d48] hover:bg-[#fcdbe1]",
      arrowBg: "bg-[#e11d48]",
      actionColor: "text-[#e11d48]",
      illustration: (
        <Ouch3DIllustration
          src="https://ouch-prod-var-cdn.icons8.com/vc/illustrations/previews/A8o1OHHEWJfaPDMH.webp"
          alt="Events 3D Calendar"
          fallback={<CalendarIllustration />}
        />
      ),
    },
    {
      id: "camps",
      title: "Camps",
      description: "Health camps, awareness programs and volunteer opportunities.",
      actionText: "Explore Camps",
      href: "/camps",
      icon: <Tent className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2]" />,
      iconBg: "bg-[#d7f2e6]",
      iconColor: "text-[#0d9488]",
      cardBg: "bg-gradient-to-br from-[#ffffff] via-[#f7fcfa] to-[#eaf7f2]",
      cardBorder: "border-[#d9f2e7]",
      btnBg: "bg-[#e3f7f0] text-[#0d9488] hover:bg-[#cff2e5]",
      arrowBg: "bg-[#0d9488]",
      actionColor: "text-[#0d9488]",
      illustration: (
        <Ouch3DIllustration
          src="https://ouch-prod-var-cdn.icons8.com/zb/illustrations/previews/ilqKv6a7vkASd97S.webp"
          alt="Camps 3D Megaphone"
          fallback={<MegaphoneIllustration />}
        />
      ),
    },
    {
      id: "research",
      title: "Research",
      description: "Collaborate, publish and explore research opportunities in healthcare.",
      actionText: "Explore Research",
      href: "/research",
      icon: <FlaskConical className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2]" />,
      iconBg: "bg-[#ece1fd]",
      iconColor: "text-[#7c3aed]",
      cardBg: "bg-gradient-to-br from-[#ffffff] via-[#faf8fe] to-[#f3ecfe]",
      cardBorder: "border-[#eae0fe]",
      btnBg: "bg-[#f3ecfe] text-[#7c3aed] hover:bg-[#e7d8fd]",
      arrowBg: "bg-[#7c3aed]",
      actionColor: "text-[#7c3aed]",
      illustration: (
        <Ouch3DIllustration
          src="https://ouch-prod-var-cdn.icons8.com/vb/illustrations/previews/lFjvmsjzT_j06fYT.webp"
          alt="Research 3D Analytics"
          fallback={<ResearchIllustration />}
        />
      ),
    },
    {
      id: "marketplace",
      title: "Marketplace",
      description: "Discover medical products, services and solutions from verified sellers.",
      actionText: "Visit Marketplace",
      href: "/marketplace",
      icon: <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2]" />,
      iconBg: "bg-[#d9effd]",
      iconColor: "text-[#0284c7]",
      cardBg: "bg-gradient-to-br from-[#ffffff] via-[#f6fbfe] to-[#e8f4fc]",
      cardBorder: "border-[#d6ecfa]",
      btnBg: "bg-[#e4f3fd] text-[#0284c7] hover:bg-[#d2ecfc]",
      arrowBg: "bg-[#0284c7]",
      actionColor: "text-[#0284c7]",
      illustration: (
        <Ouch3DIllustration
          src="https://ouch-prod-var-cdn.icons8.com/vy/illustrations/previews/YBJIK2EohTkSC3W6.webp"
          alt="Marketplace 3D Cart"
          fallback={<MarketplaceIllustration />}
        />
      ),
    },
    {
      id: "ai-assistant",
      title: "AI Assistant",
      description: "Get instant professional support and personalized guidance.",
      actionText: "Ask Now",
      href: "#ai-assistant-section",
      icon: <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2]" />,
      iconBg: "bg-[#f1daf9]",
      iconColor: "text-[#9333ea]",
      cardBg: "bg-gradient-to-br from-[#ffffff] via-[#fbf7fe] to-[#f5eafc]",
      cardBorder: "border-[#eed8fa]",
      btnBg: "bg-[#f7ebfd] text-[#9333ea] hover:bg-[#eed7fb]",
      arrowBg: "bg-[#9333ea]",
      actionColor: "text-[#9333ea]",
      illustration: (
        <Ouch3DIllustration
          src="https://ouch-prod-var-cdn.icons8.com/ho/illustrations/previews/oyVH2QVYjdrAZzBP.webp"
          alt="AI Assistant 3D Robot"
          fallback={<AIAssistantIllustration />}
        />
      ),
    },
  ];

  const handleClick = (href: string) => {
    if (href.startsWith("#")) {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      router.push(href);
    }
  };

  return (
    <div className="relative rounded-3xl border border-[#e8ecf2] bg-white p-4 sm:p-6 lg:p-7 shadow-xs overflow-hidden">
      {/* 1. SECTION HEADER */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6">
        <div>
          {/* Blue accent indicator bar */}
          <div className="h-1.5 w-9 rounded-full bg-[#1b64da] mb-2.5" />
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0f172a]">
            Quick <span className="text-[#1b64da]">Links</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1 font-medium">
            Explore opportunities, learning, and more across the healthcare ecosystem.
          </p>
        </div>

        {/* Right Badge */}
        <div className="self-start sm:self-center">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f0f6ff] text-[#1b64da] border border-[#dbeafe] text-xs font-bold shadow-2xs">
            <LayoutGrid className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Healthcare Ecosystem</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. DESKTOP VIEW: 4 CARDS PER ROW (exact mockup match)        */}
      {/* ============================================================ */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleClick(card.href)}
            className={`group relative flex flex-col justify-between rounded-3xl border ${card.cardBorder} ${card.cardBg} p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer overflow-hidden`}
          >
            <div>
              {/* Top Row: Left squircle icon, Right 3D illustration */}
              <div className="flex items-start justify-between mb-3.5">
                <div
                  className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl shadow-2xs transition-transform duration-200 group-hover:scale-105 ${card.iconBg} ${card.iconColor}`}
                >
                  {card.icon}
                </div>
                <div className="h-12 sm:h-14 flex items-center justify-end transition-transform duration-300 group-hover:scale-105">
                  {card.illustration}
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-base sm:text-lg font-bold text-[#0f172a] tracking-tight group-hover:text-[#1b64da] transition-colors">
                {card.title}
              </h3>
              <p className="mt-1 text-xs text-[#64748b] leading-relaxed line-clamp-2 min-h-[34px]">
                {card.description}
              </p>
            </div>

            {/* Bottom CTA Pill */}
            <div className="mt-4 pt-1">
              <div
                className={`w-full py-2 px-3.5 sm:px-4 rounded-full flex items-center justify-between text-xs font-bold transition-all duration-200 ${card.btnBg}`}
              >
                <span>{card.actionText}</span>
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-white shadow-2xs transition-transform duration-200 group-hover:translate-x-0.5 ${card.arrowBg}`}
                >
                  <ArrowRight className="h-3 w-3 stroke-[2.5]" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ============================================================ */}
      {/* 3. MOBILE VIEW: 3 SQUARE CARDS PER ROW                      */}
      {/* ============================================================ */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5 md:hidden">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleClick(card.href)}
            className={`group relative aspect-square flex flex-col items-center justify-between rounded-2xl border ${card.cardBorder} ${card.cardBg} p-2 text-center transition-all duration-200 active:scale-95 shadow-2xs cursor-pointer overflow-hidden`}
          >
            {/* Top Area: Icon or mini visual */}
            <div className="flex-1 flex items-center justify-center w-full pt-1">
              <div
                className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl shadow-2xs transition-transform duration-200 group-hover:scale-105 ${card.iconBg} ${card.iconColor}`}
              >
                {card.icon}
              </div>
            </div>

            {/* Bottom Area: Compact Title & Action tag */}
            <div className="w-full pb-0.5">
              <h3 className="text-[11px] sm:text-xs font-bold text-[#0f172a] truncate w-full tracking-tight">
                {card.title}
              </h3>
              <span
                className={`text-[9px] font-bold ${card.actionColor} flex items-center justify-center gap-0.5 mt-0.5`}
              >
                <span>Open</span>
                <ArrowRight className="h-2 w-2 stroke-[3]" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
