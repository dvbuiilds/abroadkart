/**
 * Shared Keystone base URL for Next.js → Keystone proxies.
 * See crm_docs/ADMIN_PROXY.md (resolution plan).
 */

import { getPublicAdminUrl } from "./public-urls";

/** Browser-reachable Keystone origin (redirects, client bundle, trusted origins). */
export function getKeystoneBaseUrl(): string {
  return getPublicAdminUrl();
}

/**
 * Server-to-server Keystone origin for Next.js `fetch()` to Keystone (API routes, SSR).
 * In Docker, set `KEYSTONE_INTERNAL_URL=http://keystone:3001` so the nextjs container
 * does not use `localhost` (which points at itself). Falls back to {@link getKeystoneBaseUrl}.
 */
export function getKeystoneInternalUrl(): string {
  const internal = process.env.KEYSTONE_INTERNAL_URL?.trim();
  if (internal) return internal.replace(/\/+$/, "");
  return getKeystoneBaseUrl();
}

/**
 * Prevents PUBLIC_ADMIN_URL (or legacy NEXT_PUBLIC_KEYSTONE_URL) from pointing at this Next app (self-proxy loop).
 * Returns a JSON error Response when misconfigured, otherwise null.
 */
export function keystoneSelfProxyErrorResponse(
  requestOrigin: string,
): Response | null {
  let upstream: URL;
  try {
    upstream = new URL(getKeystoneBaseUrl());
  } catch {
    return new Response(
      JSON.stringify({
        errors: [
          {
            message:
              "Invalid PUBLIC_ADMIN_URL / Keystone URL: must be an absolute URL (e.g. http://localhost:3001).",
          },
        ],
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  if (upstream.origin === requestOrigin) {
    return new Response(
      JSON.stringify({
        errors: [
          {
            message:
              "PUBLIC_ADMIN_URL must not be the same origin as this Next app (that causes a self-proxy loop). Use the Keystone server origin, e.g. http://localhost:3001.",
            extensions: { code: "KEYSTONE_SELF_PROXY" },
          },
        ],
      }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  return null;
}
