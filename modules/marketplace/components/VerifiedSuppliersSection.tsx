"use client";

import * as React from "react";
import {
  Building2,
  ShieldCheck,
  Star,
  Clock,
  Phone,
  Mail,
  ArrowRight,
  Sparkles,
  FileCheck,
} from "lucide-react";
import { VERIFIED_SUPPLIERS } from "../data";
import { VerifiedSupplier } from "../types";

interface VerifiedSuppliersSectionProps {
  onDirectInquiry: (supplier: VerifiedSupplier) => void;
}

export function VerifiedSuppliersSection({ onDirectInquiry }: VerifiedSuppliersSectionProps) {
  return (
    <section className="space-y-4 pt-4 border-t border-[#e8e6e3] dark:border-[#30363d]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0f4c81] dark:text-[#388bfd]">
            <Sparkles className="size-3.5" />
            <span>OEM & Distributor Network</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#171717] dark:text-[#f0f6fc]">
            Featured Verified Hospital Equipment Suppliers
          </h2>
        </div>
        <p className="text-xs text-[#77716b] dark:text-[#8b949e] max-w-sm">
          All suppliers are vetted for valid CDSCO manufacturing/import licenses and GST compliance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {VERIFIED_SUPPLIERS.slice(0, 3).map((supplier) => (
          <div
            key={supplier.id}
            className="rounded-2xl border border-[#e8e6e3] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 shadow-2xs hover:shadow-xs transition flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-[#eafaf1] dark:bg-[#16804d]/20 border border-[#16804d]/25 px-2 py-0.5 text-[10px] font-bold text-[#16804d] dark:text-[#2ea043]">
                  <ShieldCheck className="size-3" />
                  {supplier.verifiedBadge}
                </span>

                <div className="flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                  <Star className="size-3 fill-amber-500 text-amber-500" />
                  <span>{supplier.rating}</span>
                  <span className="text-[10px] text-[#77716b] dark:text-[#8b949e]">({supplier.reviewCount})</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">
                  {supplier.name}
                </h3>
                <div className="text-[11px] text-[#77716b] dark:text-[#8b949e] mt-0.5">
                  {supplier.companyType} • Est. {supplier.establishedYear} • {supplier.city}, {supplier.state}
                </div>
              </div>

              <div className="rounded-xl border border-[#e8e6e3] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] p-2.5 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[#77716b] dark:text-[#8b949e]">Hospitals Served:</span>
                  <div className="font-bold text-[#171717] dark:text-[#f0f6fc]">{supplier.hospitalClientsServed}+</div>
                </div>
                <div>
                  <span className="text-[#77716b] dark:text-[#8b949e]">Avg Response:</span>
                  <div className="font-bold text-[#16804d] dark:text-[#2ea043]">{supplier.responseTimeText}</div>
                </div>
              </div>

              <div className="text-[10px] font-mono text-[#77716b] dark:text-[#8b949e] space-y-0.5">
                <div>GST: {supplier.gstNumber}</div>
                <div>CDSCO: {supplier.cdscoRegistration}</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#e8e6e3] dark:border-[#30363d]">
              <button
                type="button"
                onClick={() => onDirectInquiry(supplier)}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#0f4c81] dark:border-[#388bfd] text-[#0f4c81] dark:text-[#388bfd] hover:bg-[#eef5fc] dark:hover:bg-[#0f4c81]/20 py-2 px-3 text-xs font-bold transition active:scale-95"
              >
                <span>Send Direct Inquiry</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
