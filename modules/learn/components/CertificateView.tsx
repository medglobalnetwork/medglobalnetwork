"use client";

import * as React from "react";
import { Award, CheckCircle2, Printer, ShieldCheck } from "lucide-react";
import { Certificate } from "../types";

interface CertificateViewProps {
  certificate: Certificate;
}

export function CertificateView({ certificate }: CertificateViewProps) {
  const meta = certificate.metadata;
  const issueDate = new Date(certificate.issued_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. PRINT / ACTION BAR (Hidden in print) */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ecfdf5] px-3 py-1 text-xs font-bold text-[#047857]">
            <CheckCircle2 className="h-3.5 w-3.5" /> Verified & Active
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1769c2] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#12569f]"
          >
            <Printer className="h-4 w-4" /> Print / Save as PDF
          </button>
        </div>
      </div>

      {/* 2. ACCREDITED CERTIFICATE CANVAS */}
      <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-3xl border-8 border-[#1e3a8a]/20 bg-[#ffffff] p-8 shadow-2xl sm:p-12 print:border-4 print:p-6 print:shadow-none">
        {/* Decorative corner borders */}
        <div className="absolute top-4 left-4 h-12 w-12 border-t-4 border-l-4 border-[#1769c2]" />
        <div className="absolute top-4 right-4 h-12 w-12 border-t-4 border-r-4 border-[#1769c2]" />
        <div className="absolute bottom-4 left-4 h-12 w-12 border-b-4 border-l-4 border-[#1769c2]" />
        <div className="absolute bottom-4 right-4 h-12 w-12 border-b-4 border-r-4 border-[#1769c2]" />

        {/* Content Container */}
        <div className="flex flex-col items-center text-center">
          {/* Organization Logo */}
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1769c2] text-lg font-black text-white shadow-xs">
              M
            </span>
            <div className="text-left">
              <span className="text-base font-black tracking-tight text-[#171717]">
                MGN<span className="text-[#1769c2]">.life</span>
              </span>
              <p className="text-[9px] uppercase tracking-widest text-[#77716b]">
                Medical Global Network
              </p>
            </div>
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-[#1769c2]">
            Certificate of Continuing Professional Development
          </p>

          <p className="mt-4 text-xs italic text-[#77716b]">This is to certify that</p>

          <h1 className="mt-2 text-2xl font-black text-[#171717] sm:text-3xl font-serif">
            {meta?.student_name || "Healthcare Professional"}
          </h1>

          <div className="my-3 h-0.5 w-32 bg-[#1769c2]/30" />

          <p className="max-w-xl text-xs leading-relaxed text-[#5d5854] sm:text-sm">
            has successfully completed all required clinical coursework, modules, and assessments for the accredited program:
          </p>

          <h2 className="mt-3 text-lg font-extrabold text-[#1769c2] sm:text-xl">
            {meta?.course_title || certificate.course?.title}
          </h2>

          {meta?.duration_minutes && (
            <p className="mt-1 text-xs text-[#77716b]">
              Accredited Clinical Duration: {meta.duration_minutes} minutes CME / CPD
            </p>
          )}

          {/* Signatures & Seal Grid */}
          <div className="mt-10 grid w-full grid-cols-1 gap-6 border-t border-[#ded8d1] pt-6 sm:grid-cols-3">
            {/* 1. Issue Date */}
            <div className="flex flex-col items-center justify-center">
              <p className="text-xs font-bold text-[#171717]">{issueDate}</p>
              <div className="mt-1 h-0.5 w-24 bg-[#ded8d1]" />
              <p className="mt-1 text-[10px] text-[#77716b] uppercase">Date of Issuance</p>
            </div>

            {/* 2. Official Seal */}
            <div className="flex flex-col items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-[#1769c2] bg-[#eef5fc] text-[#1769c2] shadow-inner">
                <Award className="h-8 w-8" />
              </div>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-[#1769c2]">
                MGN Verified Accreditation
              </p>
            </div>

            {/* 3. Instructor Signature */}
            <div className="flex flex-col items-center justify-center">
              <p className="text-xs font-bold font-serif italic text-[#171717]">
                {meta?.instructor_name || "Faculty Board"}
              </p>
              <div className="mt-1 h-0.5 w-24 bg-[#ded8d1]" />
              <p className="mt-1 text-[10px] text-[#77716b] uppercase">
                {meta?.instructor_designation || "Lead Instructor"}
              </p>
            </div>
          </div>

          {/* Verification Code Footer */}
          <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-[#f0efee] pt-4 text-[10px] text-[#77716b] sm:flex-row sm:w-full">
            <span>Certificate ID: <strong className="font-mono text-[#171717]">{certificate.certificate_number}</strong></span>
            <span>
              Verify online:{" "}
              <a
                href={`/verify/certificate/${certificate.verification_code}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono font-bold text-[#1769c2] hover:underline"
              >
                {certificate.verification_code}
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
