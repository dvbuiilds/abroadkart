/**
 * Shared Keystone base URL for Next.js → Keystone proxies.
 * See crm_docs/ADMIN_PROXY.md (resolution plan).
 */

const DEFAULT_KEYSTONE_URL = "http://localhost:3001";

export function getKeystoneBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_KEYSTONE_URL?.trim() || DEFAULT_KEYSTONE_URL;
  return raw.replace(/\/+$/, "");
}

/**
 * Prevents NEXT_PUBLIC_KEYSTONE_URL from pointing at this Next app (self-proxy loop).
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
              "Invalid NEXT_PUBLIC_KEYSTONE_URL: must be an absolute URL (e.g. http://localhost:3001).",
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
              "NEXT_PUBLIC_KEYSTONE_URL must not be the same origin as this Next app (that causes a self-proxy loop). Use the Keystone server origin, e.g. http://localhost:3001.",
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
