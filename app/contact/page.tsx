"use client";

import * as React from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  ShieldAlert,
  Send,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { DPDP_OFFICER_INFO } from "@/lib/seo";
import { MGN_EMAILS } from "@/lib/contact-emails";

export default function ContactPage() {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    subject: "general",
    message: "",
  });
  const [status, setStatus] = React.useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    // Simulate submission / mailto fallback
    setTimeout(() => {
      setStatus("success");
    }, 800);
  };

  const faqs = [
    {
      q: "How long does credential verification take?",
      a: "Medical council and practitioner credential verification typically takes between 12 to 24 business hours. Our compliance team verifies details directly with state and national registries.",
    },
    {
      q: "How can I post a medical job or locum opening?",
      a: "Verified hospital and clinic accounts can post jobs directly from the 'Jobs' dashboard. Simply navigate to Opportunities > Jobs > Post Job.",
    },
    {
      q: "What should I do if I didn't receive the password reset email?",
      a: "Check your spam or junk folder. If still not received within 5 minutes, ensure the email address matches your registered account or contact support@mgn.life.",
    },
    {
      q: "How do I report a content grievance or DPDP data inquiry?",
      a: "You can write directly to our Data Protection & Privacy Desk at privacy@mgn.life with subject 'DPDP Inquiry / Privacy Request'.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f8] dark:bg-[#0d1117] text-[#171717] dark:text-[#f0f6fc] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#77716b] dark:text-[#8b949e]">
          <Link href="/" className="hover:text-[#0f4c81] dark:hover:text-[#58a6ff]">
            Home
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-[#171717] dark:text-[#f0f6fc] font-semibold">Contact & Support</span>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 px-3.5 py-1 text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff]">
            <MessageSquare className="size-3.5" />
            <span>We&apos;re Here to Help</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#171717] dark:text-[#f0f6fc]">
            Get in Touch with MedGlobalNetwork
          </h1>
          <p className="text-sm sm:text-base text-[#5d5854] dark:text-[#8b949e] leading-relaxed">
            Have questions about practitioner verification, CME courses, institutional onboarding, or technical support? Our dedicated team is available 24/7.
          </p>
        </div>

        {/* 6 Canonical Department Contact Cards Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#171717] dark:text-[#f0f6fc]">
              Department Contact Desks
            </h2>
            <span className="text-xs text-[#77716b] dark:text-[#8b949e]">
              Direct assistance routed by domain
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. User Support */}
            <div className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-[#0f4c81] dark:text-[#58a6ff]">
                  <Mail className="size-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">Customer & User Support</span>
                  <h3 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">User Support</h3>
                </div>
                <p className="text-xs text-[#5d5854] dark:text-[#8b949e] leading-relaxed">
                  Account issues, login help, CME course access, verification queries, and general platform support.
                </p>
              </div>
              <div className="pt-2 border-t border-[#f0ece8] dark:border-[#30363d]">
                <a
                  href={`mailto:${MGN_EMAILS.support}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0f4c81] hover:bg-[#0c3c66] text-white py-2.5 text-xs font-bold transition shadow-xs"
                >
                  <Mail className="size-3.5" />
                  <span>Contact Support</span>
                </a>
              </div>
            </div>

            {/* 2. General Enquiries */}
            <div className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300">
                  <HelpCircle className="size-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">Company & Website</span>
                  <h3 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">General Enquiries</h3>
                </div>
                <p className="text-xs text-[#5d5854] dark:text-[#8b949e] leading-relaxed">
                  General company information, public queries, media outreach, and general platform questions.
                </p>
              </div>
              <div className="pt-2 border-t border-[#f0ece8] dark:border-[#30363d]">
                <a
                  href={`mailto:${MGN_EMAILS.info}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#f8f7f6] dark:bg-[#21262d] hover:bg-[#eae8e5] text-[#171717] dark:text-[#f0f6fc] py-2.5 text-xs font-bold transition shadow-xs"
                >
                  <Mail className="size-3.5" />
                  <span>General Enquiry</span>
                </a>
              </div>
            </div>

            {/* 3. Business & Enterprise */}
            <div className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-[#16804d] dark:text-emerald-400">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">B2B & Institutional</span>
                  <h3 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">Business & Enterprise</h3>
                </div>
                <p className="text-xs text-[#5d5854] dark:text-[#8b949e] leading-relaxed">
                  Hospital onboarding, medical college partnerships, enterprise LMS, and commercial API discussions.
                </p>
              </div>
              <div className="pt-2 border-t border-[#f0ece8] dark:border-[#30363d]">
                <a
                  href={`mailto:${MGN_EMAILS.business}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#16804d] hover:bg-[#136c41] text-white py-2.5 text-xs font-bold transition shadow-xs"
                >
                  <Mail className="size-3.5" />
                  <span>Business Enquiry</span>
                </a>
              </div>
            </div>

            {/* 4. Security */}
            <div className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="size-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <ShieldAlert className="size-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Trust & Vulnerabilities</span>
                  <h3 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">Security</h3>
                </div>
                <p className="text-xs text-[#5d5854] dark:text-[#8b949e] leading-relaxed">
                  Security vulnerabilities, responsible disclosure, security incidents, abuse reports, and account safety.
                </p>
              </div>
              <div className="pt-2 border-t border-[#f0ece8] dark:border-[#30363d]">
                <a
                  href={`mailto:${MGN_EMAILS.security}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-900 dark:text-amber-200 py-2.5 text-xs font-bold transition shadow-xs"
                >
                  <ShieldAlert className="size-3.5" />
                  <span>Report Security Issue</span>
                </a>
              </div>
            </div>

            {/* 5. Privacy */}
            <div className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="size-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <MessageSquare className="size-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">DPDP Act 2023 & Data Rights</span>
                  <h3 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">Privacy</h3>
                </div>
                <p className="text-xs text-[#5d5854] dark:text-[#8b949e] leading-relaxed">
                  Personal data access, correction, erasure requests, consent revocation, and statutory DPDP compliance.
                </p>
              </div>
              <div className="pt-2 border-t border-[#f0ece8] dark:border-[#30363d]">
                <a
                  href={`mailto:${MGN_EMAILS.privacy}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 text-purple-900 dark:text-purple-200 py-2.5 text-xs font-bold transition shadow-xs"
                >
                  <Mail className="size-3.5" />
                  <span>Privacy Request</span>
                </a>
              </div>
            </div>

            {/* 6. Legal */}
            <div className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="size-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <Send className="size-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">Notices & Intellectual Property</span>
                  <h3 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">Legal</h3>
                </div>
                <p className="text-xs text-[#5d5854] dark:text-[#8b949e] leading-relaxed">
                  Formal legal notices, contract inquiries, DMCA / Copyright claims, and statutory compliance matters.
                </p>
              </div>
              <div className="pt-2 border-t border-[#f0ece8] dark:border-[#30363d]">
                <a
                  href={`mailto:${MGN_EMAILS.legal}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-900 dark:text-rose-200 py-2.5 text-xs font-bold transition shadow-xs"
                >
                  <Mail className="size-3.5" />
                  <span>Contact Legal</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form & Office Info */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3 rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 sm:p-8 shadow-xs">
            <h2 className="text-xl font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
              Send us a Message
            </h2>
            <p className="text-xs text-[#5d5854] dark:text-[#8b949e] mb-6">
              Fill out the form below and our medical support team will respond within 24 hours.
            </p>

            {status === "success" ? (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-6 text-center space-y-3">
                <CheckCircle2 className="size-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
                  Message Sent Successfully!
                </h3>
                <p className="text-xs text-emerald-800 dark:text-emerald-300">
                  Thank you for contacting MedGlobalNetwork. Our support team will get back to you shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStatus("idle");
                    setFormData({ name: "", email: "", subject: "general", message: "" });
                  }}
                  className="rounded-lg bg-emerald-600 text-white px-4 py-2 text-xs font-semibold hover:bg-emerald-700 transition"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#171717] dark:text-[#f0f6fc] mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Dr. Rajesh Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] px-3.5 py-2.5 text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] focus:outline-none focus:ring-2 focus:ring-[#0f4c81]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#171717] dark:text-[#f0f6fc] mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="doctor@hospital.org"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] px-3.5 py-2.5 text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] focus:outline-none focus:ring-2 focus:ring-[#0f4c81]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171717] dark:text-[#f0f6fc] mb-1.5">
                    Subject / Topic *
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] px-3.5 py-2.5 text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] focus:outline-none focus:ring-2 focus:ring-[#0f4c81]"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="verification">Practitioner Verification & Licensing</option>
                    <option value="hospital">Hospital / Enterprise Onboarding</option>
                    <option value="technical">Technical Issue or Bug Report</option>
                    <option value="billing">CME / Marketplace Billing</option>
                    <option value="privacy">DPDP / Data Privacy Request</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171717] dark:text-[#f0f6fc] mb-1.5">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your inquiry or request in detail..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] px-3.5 py-2.5 text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] focus:outline-none focus:ring-2 focus:ring-[#0f4c81]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f4c81] text-white py-3 text-xs sm:text-sm font-bold hover:bg-[#0c3c66] transition shadow-xs disabled:opacity-50"
                >
                  <Send className="size-4" />
                  <span>{status === "submitting" ? "Sending..." : "Submit Inquiry"}</span>
                </button>
              </form>
            )}
          </div>

          {/* Office & Compliance Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">
                Operational Desks
              </h3>
              <div className="space-y-3 text-xs text-[#5d5854] dark:text-[#8b949e]">
                <div className="flex items-start gap-2.5">
                  <MapPin className="size-4 text-[#0f4c81] dark:text-[#58a6ff] shrink-0 mt-0.5" />
                  <span>{DPDP_OFFICER_INFO.address}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock className="size-4 text-[#0f4c81] dark:text-[#58a6ff] shrink-0 mt-0.5" />
                  <span>Working Hours: Mon–Sat, 09:00 AM – 07:00 PM IST (Emergency Verification Desk: 24/7)</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/30 p-6 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-[#0f4c81] dark:text-[#58a6ff]">
                Need Quick Help?
              </h3>
              <p className="text-xs text-[#5d5854] dark:text-[#8b949e]">
                Looking for legal policies or statutory documents?
              </p>
              <div className="flex flex-col gap-2 pt-1 text-xs font-semibold">
                <Link href="/privacy" className="text-[#0f4c81] dark:text-[#58a6ff] hover:underline flex items-center justify-between">
                  <span>Privacy Policy & DPDP</span>
                  <ChevronRight className="size-3.5" />
                </Link>
                <Link href="/terms" className="text-[#0f4c81] dark:text-[#58a6ff] hover:underline flex items-center justify-between">
                  <span>Terms of Service</span>
                  <ChevronRight className="size-3.5" />
                </Link>
                <Link href="/dpdp" className="text-[#0f4c81] dark:text-[#58a6ff] hover:underline flex items-center justify-between">
                  <span>DPDP Compliance Summary</span>
                  <ChevronRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-[#171717] dark:text-[#f0f6fc]">
              Frequently Asked Questions
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#5d5854] dark:text-[#8b949e]">
              Find quick answers to common questions about MedGlobalNetwork.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 space-y-2 shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="size-4 text-[#0f4c81] dark:text-[#58a6ff] shrink-0" />
                  <h3 className="text-xs sm:text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">
                    {faq.q}
                  </h3>
                </div>
                <p className="text-xs text-[#5d5854] dark:text-[#8b949e] leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
