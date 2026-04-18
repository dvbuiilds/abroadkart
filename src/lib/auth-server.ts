/**
 * Server-side helpers for better-auth (session + JWT).
 */
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { getAuth } from "@app/lib/auth";

function resolveBaseUrl(requestOrigin?: string): string {
  const fromEnv =
    process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  if (requestOrigin) return requestOrigin.replace(/\/+$/, "");
  return "http://localhost:3000";
}

/**
 * Mint a JWT for GraphQL / Keystone using the incoming request cookies.
 */
export async function getBetterAuthJwtFromCookieHeader(
  cookieHeader: string,
  requestOrigin: string,
): Promise<string | null> {
  const base = resolveBaseUrl(requestOrigin);
  const tokenRes = await getAuth().handler(
    new Request(new URL("/api/auth/token", base), {
      method: "GET",
      headers: { cookie: cookieHeader },
    }),
  );
  if (!tokenRes.ok) return null;
  const json = (await tokenRes.json()) as { token?: string };
  return json.token ?? null;
}

export async function getBetterAuthJwtFromNextRequest(
  req: NextRequest,
): Promise<string | null> {
  const cookie = req.headers.get("cookie") ?? "";
  const origin = req.nextUrl.origin;
  return getBetterAuthJwtFromCookieHeader(cookie, origin);
}

export async function getBetterAuthJwtFromHeaders(): Promise<string | null> {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const origin = `${proto}://${host}`;
  return getBetterAuthJwtFromCookieHeader(cookie, origin);
}

export async function getAuthSessionFromHeaders() {
  const h = await headers();
  return getAuth().api.getSession({ headers: h });
}
