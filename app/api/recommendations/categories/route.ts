// ============================================================
// MGN Recommendation Engine — Categories Metadata API
// app/api/recommendations/categories/route.ts
// ============================================================

export async function GET() {
  const categories = [
    {
      id: "people-you-may-know",
      name: "People You May Know",
      description: "Professionals relevant to your clinical background and mutual connections.",
      icon: "Users",
    },
    {
      id: "similar-professionals",
      name: "Similar Professionals",
      description: "Doctors, therapists, and specialists with matching clinical focus and skills.",
      icon: "Stethoscope",
    },
    {
      id: "same-organization",
      name: "People From Your Organization",
      description: "Colleagues and practitioners from your hospital, clinic, or institute.",
      icon: "Building2",
    },
    {
      id: "alumni",
      name: "Alumni & Batchmates",
      description: "Graduates and alumni from your medical college or university.",
      icon: "GraduationCap",
    },
    {
      id: "research-connections",
      name: "Research Connections",
      description: "Researchers with similar clinical trials, case studies, and interests.",
      icon: "FlaskConical",
    },
    {
      id: "community-connections",
      name: "Community Connections",
      description: "Active members from your clinical specialty communities.",
      icon: "MessageSquare",
    },
    {
      id: "event-connections",
      name: "Event & CME Attendees",
      description: "Professionals who attended the same conferences, workshops, and CMEs.",
      icon: "Calendar",
    },
    {
      id: "career-connections",
      name: "Career Connections",
      description: "Mentors, recruiters, and peers relevant to your career aspirations.",
      icon: "Briefcase",
    },
    {
      id: "learning-connections",
      name: "Learning Connections",
      description: "Peers enrolled in similar courses and medical certifications.",
      icon: "BookOpen",
    },
    {
      id: "location-based",
      name: "Nearby Healthcare Ecosystem",
      description: "Verified clinicians and specialists in your city and region.",
      icon: "MapPin",
    },
  ];

  return Response.json({ categories });
}
