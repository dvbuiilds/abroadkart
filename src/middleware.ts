import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Only CRM areas need a session. Every other path falls through to Next's
 * normal routing, so unknown URLs (including legacy WordPress URLs) return 404
 * instead of redirecting to sign-in. A new CRM route must be added here.
 */
const PROTECTED_PREFIXES = [
  "/consultant",
  "/fulfilment",
  "/admin",
  "/dashboard",
  "/api/consultant",
  "/api/graphql",
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Static pages that keep the trailing-slash redirect. Everything else with a
 * trailing slash passes through, so legacy WordPress post URLs return a bare
 * 404 (next.config sets skipTrailingSlashRedirect for this reason).
 */
const SLASH_NORMALISED_PAGES = [
  "/about",
  "/contact",
  "/privacy-policy",
  "/terms",
  "/blogs",
  "/sign-in",
  "/sign-up",
  "/forgot-password",
];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.endsWith("/") && SLASH_NORMALISED_PAGES.includes(pathname.slice(0, -1))) {
    const target = new URL(pathname.slice(0, -1) + request.nextUrl.search, request.url);
    return NextResponse.redirect(target, 308);
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const signIn = new URL("/sign-in", request.url);
    const dest = request.nextUrl.pathname + request.nextUrl.search;
    signIn.searchParams.set("callbackUrl", dest);
    return NextResponse.redirect(signIn);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
    "/admin",
    "/admin/(.*)",
  ],
};
