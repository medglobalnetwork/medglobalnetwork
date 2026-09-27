"use client";

import * as React from "react";
import Link from "next/link";
import { Users, Briefcase, GraduationCap, ShoppingCart, ArrowRight } from "lucide-react";

export function PlatformFeaturesSection() {
  const features = [
    {
      id: "network",
      icon: Users,
      iconColor: "text-[#0f4c81] bg-[#eef5fc] dark:bg-[#1e293b]",
      title: "Professional Network",
      description: "Connect with verified healthcare professionals, expand your network, and collaborate.",
      linkText: "Explore Network",
      href: "/network",
    },
    {
      id: "jobs",
      icon: Briefcase,
      iconColor: "text-[#16804d] bg-[#ecfdf5] dark:bg-[#064e3b]/30",
      title: "Jobs & Opportunities",
      description: "Discover the right career opportunities and build your future.",
      linkText: "Find Jobs",
      href: "/opportunities/jobs",
    },
    {
      id: "learning",
      icon: GraduationCap,
      iconColor: "text-[#0284c7] bg-[#f0f9ff] dark:bg-[#0c4a6e]/30",
      title: "Learning & Growth",
      description: "Access courses, certifications, and resources to upskill and stay ahead.",
      linkText: "Start Learning",
      href: "/learn",
    },
    {
      id: "marketplace",
      icon: ShoppingCart,
      iconColor: "text-[#0d9488] bg-[#f0fdfa] dark:bg-[#134e4a]/30",
      title: "Marketplace",
      description: "Buy, sell, and discover healthcare products, services, and equipment.",
      linkText: "Explore Marketplace",
      href: "/marketplace",
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-20 bg-white dark:bg-[#0b0f17]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#171717] dark:text-[#f0f6fc]">
            Everything You Need. All in One Platform.
          </h2>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-[#ded8d1]/70 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 sm:p-7 flex flex-col justify-between hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group text-left"
              >
                <div className="space-y-4">
                  <div className={`size-11 rounded-xl flex items-center justify-center ${item.iconColor}`}>
                    <Icon className="size-5.5 stroke-[2]" />
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#171717] dark:text-[#f0f6fc]">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-[13px] text-[#555] dark:text-[#8b949e] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-6">
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-bold text-[#0f4c81] dark:text-[#58a6ff] group-hover:gap-2.5 transition-all"
                  >
                    <span>{item.linkText}</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
