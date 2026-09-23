// app/(app)/verify/certificate/[code]/page.tsx
"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  ShieldCheck,
  Printer,
  ArrowLeft,
  Calendar,
  Building,
  QrCode,
} from "lucide-react";
import { UnifiedCertificateRecord } from "@/modules/shared/certificates/certificate-service";

export default function PublicCertificateVerificationPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const [certificate, setCertificate] = useState<UnifiedCertificateRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/shared/certificates?code=${encodeURIComponent(code)}`)
      .then(async (r) => {
        if (!r.ok) {
          const err = await r.json();
          throw new Error(err.error || "Certificate not found");
        }
        return r.json();
      })
      .then((d) => setCertificate(d.certificate))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [code]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#1769c2] border-t-transparent" />
        <p className="mt-3 text-xs text-[#5d5854]">Verifying cryptographic certificate record...</p>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <Award className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-[#171717]">Invalid Certificate Code</h2>
        <p className="mt-2 text-xs text-[#5d5854]">
          The verification code <span className="font-mono font-bold text-[#171717]">{code}</span> could not be verified on MedGlobalNetwork.
        </p>
        <Link
          href="/home"
          className="mt-6 inline-block rounded-xl bg-[#1769c2] px-5 py-2 text-xs font-semibold text-white"
        >
          Return to MedGlobalNetwork
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Verification Status Banner */}
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-emerald-700 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-emerald-950">Officially Verified Credential</h4>
            <p className="text-[11px] text-emerald-800">
              This digital certificate has been cryptographically validated against the MedGlobalNetwork registry.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-xl bg-white px-4 py-2 text-xs font-semibold text-[#171717] shadow-xs hover:bg-[#f8f7f6]"
        >
          <Printer className="h-3.5 w-3.5" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      {/* Certificate Formal Document Box */}
      <div className="rounded-3xl border-8 border-[#1769c2]/10 bg-white p-8 sm:p-12 shadow-xl text-center relative overflow-hidden">
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-[#1769c2]/5 pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-emerald-500/5 pointer-events-none" />

        {/* Top Header */}
        <div className="flex flex-col items-center justify-center">
          <img
            src="/logo.png"
            alt="MedGlobalNetwork"
            className="h-8 w-auto object-contain"
          />
          <p className="mt-2 text-[10px] uppercase font-bold tracking-widest text-[#77716b]">
            MedGlobalNetwork · Verified Healthcare Credential
          </p>
        </div>

        {/* Certificate Title */}
        <h2 className="mt-8 text-xs font-bold uppercase tracking-wider text-[#1769c2]">
          Certificate of Completion & Attendance
        </h2>
        <p className="mt-2 text-xs text-[#77716b]">This is to certify that</p>

        {/* Recipient */}
        <h1 className="mt-2 text-2xl sm:text-4xl font-serif font-black text-[#171717]">
          {certificate.recipient_name}
        </h1>

        <p className="mt-3 text-xs text-[#77716b]">has successfully completed and attended</p>

        {/* Program Title */}
        <h3 className="mt-2 text-lg sm:text-xl font-bold text-[#171717] max-w-2xl mx-auto">
          {certificate.title}
        </h3>

        {certificate.subtitle && (
          <p className="mt-1 text-xs font-semibold text-emerald-800">
            {certificate.subtitle}
          </p>
        )}

        {/* Footer info: Issuer & Codes */}
        <div className="mt-12 grid grid-cols-1 gap-6 border-t border-[#f0efee] pt-8 sm:grid-cols-3 text-left">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#77716b]">Issued By</span>
            <p className="text-xs font-bold text-[#171717]">{certificate.issuer_name}</p>
            <p className="text-[10px] text-[#77716b]">Verified Healthcare Authority</p>
          </div>

          <div className="text-center">
            <span className="text-[10px] uppercase tracking-wider text-[#77716b]">Date of Issuance</span>
            <p className="text-xs font-bold text-[#171717]">
              {new Date(certificate.issued_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-[#77716b]">Certificate & Ref Code</span>
            <p className="text-xs font-mono font-bold text-[#171717]">{certificate.certificate_number}</p>
            <p className="text-[10px] font-mono text-[#1769c2]">Verify: {certificate.verification_code}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
