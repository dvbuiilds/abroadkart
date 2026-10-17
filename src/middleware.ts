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

export default function middleware(request: NextRequest) {
  if (!isProtectedPath(request.nextUrl.pathname)) {
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
