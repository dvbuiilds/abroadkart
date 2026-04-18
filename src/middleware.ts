import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  if (
    pathname === "/about" ||
    pathname === "/contact" ||
    pathname === "/login" ||
    pathname === "/privacy-policy" ||
    pathname === "/terms"
  ) {
    return true;
  }
  if (pathname.startsWith("/blogs")) return true;
  if (pathname.startsWith("/sign-in")) return true;
  if (pathname.startsWith("/sign-up")) return true;
  if (pathname.startsWith("/forgot-password")) return true;
  if (pathname.startsWith("/api/auth")) return true;
  if (pathname.startsWith("/ba")) return true;
  return false;
}

export default function middleware(request: NextRequest) {
  if (isPublicPath(request.nextUrl.pathname)) {
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
