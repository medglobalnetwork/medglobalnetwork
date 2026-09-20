# MGN.life — Master System Architecture & Roadmap

> **Ecosystem Core Principle:**
> **ONE VERIFIED HEALTHCARE PROFESSIONAL IDENTITY CONNECTED TO EVERY MGN MODULE.**
> MGN.life is NOT a dashboard — it is a healthcare professional social ecosystem.

---

## 🧭 Navigation & Modules Hierarchy

```
MGN.life
│
├── 🏠 HOME (Content Discovery & Personalized Mixed Feed)
│   ├── Stories (24-hour expiration, photo/video/text, clinical updates)
│   ├── Quick Links (Compact shortcuts: Network, Learn, Jobs, Events, Camps, Research, Marketplace, Meetings)
│   ├── Create Post (Social composer with clinical tags)
│   ├── For You / Following (Personalized candidate ranking & social graph)
│   └── Infinite Mixed Feed (Post, Professional, Course, Job, Event, Research, Product, Sponsored)
│
├── 👥 NETWORK (Professional Social Graph)
│   ├── Discover Professionals (14 healthcare professions, filters)
│   ├── My Network & Connections (Requests, sent, mutuals)
│   ├── Follow System (Followers, Following)
│   ├── Healthcare Communities (Specialty groups & forums)
│   └── People You May Know (Recommendation widget)
│
├── 📚 LEARN (Healthcare Education Platform)
│   ├── Discover Courses & Videos
│   ├── Course Hierarchy (Course → Modules → Lessons → Quizzes → Progress → Certificate)
│   ├── Clinical Notes & Case Studies
│   ├── MCQs & Assessment System
│   └── My Learning & Verified Certifications
│
├── 💼 OPPORTUNITIES (Career & Field Engagement)
│   ├── Jobs & Internships (Indeed-style healthcare jobs & candidate tracking)
│   ├── Events & CME (Conferences, webinars, workshops)
│   ├── Medical Camps (Dedicated camp management, volunteer registration, certificates)
│   └── Research Collaboration (Research profiles, publications, trials)
│
├── 🛒 MARKETPLACE (Healthcare B2B/B2C Commerce)
│   ├── Categories (Medical equipment, physio rehab, pharma, books, supplies)
│   ├── Buyer Flow (Search → Product/Supplier → Enquiry/RFQ → Cart → Order → Payment)
│   └── Seller Portal (Catalog, inventory, quote requests, orders)
│
├── 💬 MESSAGING & COLLABORATION
│   ├── 1-to-1 Chat & Message Requests
│   ├── Group Clinical Discussions & File Sharing
│   └── Professional Meetings (1:1 mentoring, case review, scheduled webinars)
│
├── 🔔 CENTRAL NOTIFICATIONS (Shared event bus for all modules)
│
├── 🤖 MGN AI (Platform-wide clinical & career intelligence assistant)
│
└── 👤 CANONICAL PROFESSIONAL PROFILE (Shared across all systems)
```

---

## 🗄️ Unified Database Schema Blueprint

```
                              ┌──────────────────────┐
                              │     "user" (Auth)    │
                              └──────────┬───────────┘
                                         │ 1:1
                              ┌──────────▼───────────┐
                              │professional_profiles │
                              │ (Verification Flags) │
                              └──────────┬───────────┘
         ┌──────────────┬────────────────┼────────────────┬──────────────┐
         │              │                │                │              │
  ┌──────▼──────┐┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐┌──────▼──────┐
  │   SOCIAL    ││   CONTENT   │  │  LEARNING   │  │CAREER/OPP.  ││ MARKETPLACE │
  ├─────────────┤├─────────────┤  ├─────────────┤  ├─────────────┤├─────────────┤
  │ connections ││ posts       │  │ courses     │  │ jobs        ││ products    │
  │ conn_reqs   ││ post_media  │  │ modules     │  │ job_appls   ││ sellers     │
  │ follows     ││ post_likes  │  │ lessons     │  │ events      ││ enquiries   │
  │ communities ││ post_comments│ │ enrollments │  │ event_reg   ││ orders      │
  │ comm_members││ stories     │  │ certificates│  │ camps       ││ order_items │
  │ blocks      ││ story_views │  │ assessments │  │ camp_volunts││ reviews     │
  └─────────────┘└─────────────┘  └─────────────┘  │ research    │└─────────────┘
                                                   └─────────────┘
                                         │
                         ┌───────────────┴───────────────┐
                         ▼                               ▼
               ┌───────────────────┐           ┌───────────────────┐
               │   NOTIFICATIONS   │           │  RECOMMENDATION   │
               │   (Central Bus)   │           │  (Unified Engine) │
               └───────────────────┘           └───────────────────┘
```

---

## 🚀 Phased Implementation Roadmap

* **✅ Phase 1: Identity & Authentication (DONE)**
  - Better Auth + Google OAuth + Session management.
  - PostgreSQL schema on Supabase (`user`, `session`, `account`).
  - Account security & profile controls.

* **✅ Phase 2: Social Core & Network (DONE)**
  - Canonical `professional_profiles` with 4-tier verification.
  - Connections (request, accept, ignore, withdraw, remove).
  - Follow / Unfollow system.
  - Posts, likes, comments, report.
  - Specialty Communities (`/network/communities` & `[slug]`).
  - Network Hub (`/network`) & dedicated Connections page (`/network/connections`).

* **⏳ Phase 3: Home & Story System (NEXT)**
  - Instagram-style Stories bar (`stories`, `story_views`, `story_reactions`, 24h expiration).
  - Compact Quick Links navigation strip.
  - Social Post Composer ("What's happening in healthcare?").
  - "For You" & "Following" personalized infinite feed engine (Cursor-based, mixed content candidates).

* **⏳ Phase 4: Healthcare Learn Module**
  - Course discovery, video player, syllabus tree, quizzes, and certificates.

* **⏳ Phase 5: Opportunities (Jobs, Camps, Events, Research)**
  - Clinical jobs & applicant portal.
  - CME conferences & webinars.
  - Field medical camps & volunteer management.
  - Research collaboration & trial publications.

* **⏳ Phase 6: Healthcare Marketplace**
  - Medical/Rehab equipment catalog, direct buy + RFQ/Enquiry flow, seller dashboard.

* **⏳ Phase 7: Real-Time Messaging & Collaboration**
  - 1-to-1 chats, attachments, clinical meeting scheduling.

* **⏳ Phase 8: MGN AI & Advanced Recommendation Engine**
  - Cross-module AI assistant & candidate ranking.
