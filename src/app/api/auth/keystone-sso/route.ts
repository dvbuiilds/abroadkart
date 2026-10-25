/**
 * Redirects to Keystone admin after minting a JWT for the current better-auth session.
 * Unauthenticated users are sent to /ba/sign-in with a return URL.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuth } from "@app/lib/auth";
import { getPublicAppUrl, getPublicAdminUrl } from "@app/lib/public-urls";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = getAuth();
  const base = getPublicAppUrl();

  const redirectTarget =
    request.nextUrl.searchParams.get("redirect_url") ?? "/admin";

  const cookie = request.headers.get("cookie") ?? "";

  const sessionRes = await auth.handler(
    new Request(new URL("/api/auth/get-session", base), {
      method: "GET",
      headers: { cookie },
    }),
  );

  let session: unknown = null;
  try {
    session = await sessionRes.json();
  } catch {
    session = null;
  }

  if (!session) {
    const back = new URL("/api/auth/keystone-sso", base);
    back.searchParams.set("redirect_url", redirectTarget);
    const callbackUrl = encodeURIComponent(back.toString());
    return NextResponse.redirect(
      new URL(`/ba/sign-in?callbackUrl=${callbackUrl}`, base),
    );
  }

  const tokenRes = await auth.handler(
    new Request(new URL("/api/auth/token", base), {
      method: "GET",
      headers: { cookie },
    }),
  );

  if (!tokenRes.ok) {
    return NextResponse.redirect(
      new URL(
        `/ba/sign-in?callbackUrl=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`,
        base,
      ),
    );
  }

  const tokenJson = (await tokenRes.json()) as { token?: string };
  const token = tokenJson.token;
  if (!token) {
    return NextResponse.redirect(
      new URL(
        `/ba/sign-in?callbackUrl=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`,
        base,
      ),
    );
  }

  const keystone = getPublicAdminUrl();
  const dest = `${keystone}/admin/_sso_callback?token=${encodeURIComponent(token)}&redirect=${encodeURIComponent(redirectTarget)}`;
  return NextResponse.redirect(dest);
}
