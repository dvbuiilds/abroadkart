import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/about",
  "/contact",
  "/blogs",
  "/blogs/(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/login",
  "/privacy-policy",
  "/terms",
  "/api/webhooks/clerk",
]);

export default clerkMiddleware(async (auth, req) => {
  // All non-public routes require auth (including /consultant/* and /admin/*)
  // Role-based access (consultantAdmin, consultantAgent) is enforced client-side via RequireRole
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
