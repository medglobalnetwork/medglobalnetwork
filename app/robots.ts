import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/settings/",
          "/reset-password/",
          "/onboarding/status",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/settings/"],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/settings/"],
      },
      {
        userAgent: "GPTBot",
        allow: [
          "/",
          "/events",
          "/camps",
          "/learn/courses",
          "/opportunities/jobs",
          "/dpdp",
          "/privacy",
          "/terms",
          "/disclaimer",
          "/guidelines",
        ],
        disallow: ["/admin/", "/api/", "/settings/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/settings/"],
      },
    ],
    sitemap: "https://mgn.life/sitemap.xml",
  };
}
