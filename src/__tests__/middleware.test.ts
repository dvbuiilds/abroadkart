// @vitest-environment node
import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import middleware from "../middleware";

const SESSION = "better-auth.session_token=test-session";

function request(path: string, cookie?: string): NextRequest {
  const headers: Record<string, string> = cookie ? { cookie } : {};
  return new NextRequest(new URL(path, "https://abroadkart.com"), { headers });
}

/** A pass-through response has no redirect location and no rewrite target. */
function passesThrough(path: string): boolean {
  const response = middleware(request(path));
  return (
    response.status === 200 &&
    response.headers.get("location") === null
  );
}

function redirectsToSignIn(path: string): boolean {
  const response = middleware(request(path));
  const location = response.headers.get("location");
  return (
    response.status === 307 &&
    location !== null &&
    new URL(location).pathname === "/sign-in" &&
    new URL(location).searchParams.get("callbackUrl") === path
  );
}

describe("legacy WordPress URLs fall through to a normal 404", () => {
  it.each([
    "/mba-vs-pgdm-guide",
    "/mba-vs-pgdm-guide/",
    "/category/visa",
    "/author/admin",
    "/tag/visa",
    "/feed",
    "/blog/some-post",
    "/wp-admin",
    "/wp-login.php",
  ])("%s is not redirected to sign-in", (path) => {
    expect(passesThrough(path)).toBe(true);
  });
});

describe("trailing slashes", () => {
  it.each([
    ["/about/", "/about"],
    ["/contact/", "/contact"],
    ["/blogs/", "/blogs"],
  ])("%s redirects once to %s", (path, target) => {
    const response = middleware(request(path));
    expect(response.status).toBe(308);
    expect(new URL(response.headers.get("location") ?? "").pathname).toBe(target);
  });

  it.each(["/mba-vs-pgdm-guide/", "/category/visa/", "/feed/", "/x/"])(
    "%s is not redirected (legacy URLs 404 directly)",
    (path) => {
      expect(passesThrough(path)).toBe(true);
    },
  );
});

describe("CRM areas still require a session", () => {
  it.each([
    "/consultant",
    "/consultant/students",
    "/fulfilment",
    "/fulfilment/loans",
    "/admin",
    "/admin/keystone",
    "/dashboard",
    "/api/consultant/documents",
    "/api/graphql",
  ])("%s without a cookie redirects to sign-in", (path) => {
    expect(redirectsToSignIn(path)).toBe(true);
  });

  it.each(["/consultant/students", "/dashboard"])(
    "%s with a session cookie passes through",
    (path) => {
      const response = middleware(request(path, SESSION));
      expect(response.headers.get("location")).toBeNull();
    },
  );
});

describe("public routes", () => {
  it.each([
    "/",
    "/about",
    "/contact",
    "/blogs",
    "/blogs/mba-vs-pgdm-guide",
    "/blogs/category/visa",
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/ba/sign-in",
    "/api/auth/session",
    "/api/revalidate",
    "/api/blog-leads",
  ])("%s passes through without a session", (path) => {
    expect(passesThrough(path)).toBe(true);
  });
});
