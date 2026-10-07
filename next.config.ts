import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(self), geolocation=(self), payment=*",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://www.google.com https://www.gstatic.com https://apis.google.com https://*.firebaseapp.com https://static.cloudflareinsights.com https://checkout.razorpay.com https://www.recaptcha.net https://*.recaptcha.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' blob: data: https: http:",
      "font-src 'self' https://fonts.gstatic.com data:",
      "connect-src 'self' https: http: ws: wss: capacitor://localhost https://*.cloudflareinsights.com https://api.razorpay.com https://lumberjack.razorpay.com",
      "worker-src 'self' blob: data: https: capacitor:",
      "frame-src 'self' https://accounts.google.com https://www.google.com https://recaptcha.google.com https://www.recaptcha.net https://*.firebaseapp.com https://api.razorpay.com https://checkout.razorpay.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/admin/recommandations",
        destination: "/admin/recommendations",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
