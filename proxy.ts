// ============================================================
// Platform Security Middleware & Route Protection
// middleware.ts
// ============================================================

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_ORIGINS = new Set([
  "https://www.mgn.life",
  "https://mgn.life",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "capacitor://localhost",
  "https://localhost",
  "http://localhost",
]);

function isAllowedOrigin(origin: string): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  try {
    const url = new URL(origin);
    // Allow https subdomains of mgn.life
    if (url.protocol === "https:" && (url.hostname === "mgn.life" || url.hostname.endsWith(".mgn.life"))) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get("origin") || "";
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");

  // 1. Admin API route protection at the edge
  if (pathname.startsWith("/api/admin")) {
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // 2. Admin page route protection at the edge
  if (pathname.startsWith("/admin")) {
    if (!sessionCookie?.value) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. CORS Handling for API routes
  if (pathname.startsWith("/api/")) {
    if (request.method === "OPTIONS") {
      const allowed = isAllowedOrigin(origin);
      const headers = new Headers();

      if (allowed && origin) {
        headers.set("Access-Control-Allow-Origin", origin);
        headers.set("Access-Control-Allow-Credentials", "true");
        headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
        headers.set(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization, X-Requested-With, X-CSRF-Token, Accept, Origin"
        );
        headers.set("Access-Control-Max-Age", "86400");
      }

      return new NextResponse(null, { status: 204, headers });
    }
  }

  const response = NextResponse.next();

  // 4. Security response headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(self), microphone=(self), geolocation=(self)");

  if (pathname.startsWith("/api/")) {
    if (isAllowedOrigin(origin) && origin) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (svg, png, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

export { proxy as middleware };
export default proxy;
