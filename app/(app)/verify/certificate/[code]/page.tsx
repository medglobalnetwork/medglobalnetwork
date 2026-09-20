"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { CertificateView } from "@/modules/learn/components/CertificateView";
import { Certificate } from "@/modules/learn/types";

export default function CertificateVerificationPage() {
  const params = useParams();
  const router = useRouter();
  const code = params?.code as string;

  const [certificate, setCertificate] = React.useState<Certificate | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!code) return;
    const verify = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/learn/certificates/${code}`);
        const data = await res.json();
        if (res.ok && data.certificate) {
          setCertificate(data.certificate);
        } else {
          setErrorMsg(data.error || "Invalid or revoked certificate code");
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to verify certificate");
      } finally {
        setIsLoading(false);
      }
    };
    verify();
  }, [code]);

  return (
    <main className="min-h-screen bg-[#f5f5f4] p-4 sm:p-8 text-[#171717]">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Verification Banner */}
        <div className="flex items-center justify-between border-b border-[#ded8d1] pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            <div>
              <h1 className="text-sm font-bold text-[#171717]">
                MGN Official Credential Verification System
              </h1>
              <p className="text-[11px] text-[#77716b]">
                Public cryptographic accreditation registry for healthcare institutions & employers.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/learn")}
            className="rounded-xl border border-[#ded8d1] bg-white px-3 py-1.5 text-xs font-semibold text-[#5d5854] hover:bg-[#f8f7f6]"
          >
            Explore MGN Learn
          </button>
        </div>

        {/* State Render */}
        {isLoading ? (
          <div className="h-96 rounded-3xl bg-white/70 animate-pulse border border-[#ded8d1]" />
        ) : errorMsg || !certificate ? (
          <div className="rounded-3xl border border-red-200 bg-white p-10 text-center shadow-xs">
            <span className="text-4xl">❌</span>
            <h2 className="mt-3 text-lg font-bold text-red-600">
              Certificate Verification Failed
            </h2>
            <p className="mt-1 text-xs text-[#77716b]">
              The verification code <strong className="font-mono">{code}</strong> was not found in the official MGN accreditation registry.
            </p>
          </div>
        ) : (
          <CertificateView certificate={certificate} />
        )}
      </div>
    </main>
  );
}
