// =============================================================================
// VCC — Next.js Middleware: Role-Based Access Control (RBAC)
// =============================================================================
// PRD 2: "Stateless JWT mapped to the user's Membership Number with RBAC"
//
// Route protection matrix:
//   /dashboard/*  → Requires authenticated user (any role)
//   /admin/*      → Requires ADMIN_* or SUPER_ADMIN role
//   /api/admin/*  → Requires ADMIN_* or SUPER_ADMIN role
//   Everything else → Public
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { verifyToken, AUTH_COOKIE_NAME, isAdminRole } from "@/lib/auth";

const PUBLIC_PATHS = new Set(["/", "/login", "/api/auth/login", "/api/auth/logout"]);

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  // Static assets and Next.js internals
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/favicon")) return true;
  if (pathname.includes(".")) return true; // Static files (images, fonts, etc.)
  return false;
}

function isAdminPath(pathname: string): boolean {
  return pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
}

function isDashboardPath(pathname: string): boolean {
  return pathname.startsWith("/dashboard") || pathname.startsWith("/api/dashboard");
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Public routes — no auth required
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Extract JWT from cookie
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    // No token — redirect to login for page requests, 401 for API
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify JWT
  const payload = await verifyToken(token);

  if (!payload) {
    // Invalid/expired token
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // RBAC: Admin routes require admin role
  if (isAdminPath(pathname) && !isAdminRole(payload.role)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // RBAC: Dashboard routes require any authenticated role
  if (isDashboardPath(pathname)) {
    // User is authenticated — proceed
    const response = NextResponse.next();
    // Inject user info into request headers for Server Components
    response.headers.set("x-vcc-user-id", payload.userId);
    response.headers.set("x-vcc-membership-no", payload.membershipNo);
    response.headers.set("x-vcc-role", payload.role);
    response.headers.set("x-vcc-display-name", payload.displayName);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
