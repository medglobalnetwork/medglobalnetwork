# MGN.life — Medical Global Network

MGN.life is a specialized digital ecosystem exclusively built for healthcare professionals, doctors, physical therapists, clinicians, and medical faculties.

## 🚀 Key Modules
- **Professional Identity & Network:** Connect with healthcare clinicians, medical specialists, and faculties.
- **Healthcare Learning & CME:** Accredited clinical modules, courses, and certifications.
- **Career & Clinical Opportunities:** Medical job postings, hospital vacancies, and internships.
- **Conferences & Workshops:** Upcoming CME events, webinars, and medical summits.
- **Community Healthcare Camps:** Outreach programs and volunteer opportunities.
- **Clinical Research & Trials:** Multi-center study collaborations and research calls.
- **Healthcare Marketplace:** Verified medical devices, physiotherapy tools, and literature.
- **MGN AI:** Clinical career and learning assistant.

## 🛠️ Tech Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Authentication:** Better Auth (Google OAuth & Email/Password)
- **Database:** Supabase PostgreSQL (via Kysely & pg)

## 📦 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/medglobalnetwork/medglobalnetwork.git
   cd medglobalnetwork
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env.local` and add your database and OAuth credentials:
   ```bash
   cp .env.example .env.local
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.
