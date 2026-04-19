/**
 * Browser-facing origins for Keystone. Prefer PUBLIC_APP_URL / PUBLIC_ADMIN_URL;
 * fall back to legacy env names (Keystone does not read NEXT_PUBLIC_*).
 */

function getKeystonePortFromEnv(): number {
  const p = process.env.PORT;
  if (p) {
    const n = parseInt(p, 10);
    if (Number.isFinite(n)) return n;
  }
  return 3001;
}

export function getPublicAppUrl(): string {
  const explicit = process.env.PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const legacy =
    process.env.FRONTEND_URL?.trim() ||
    process.env.BETTER_AUTH_URL?.trim() ||
    process.env.BETTER_AUTH_ISSUER?.trim();
  if (legacy) return legacy.replace(/\/+$/, "");
  return "http://localhost:3000";
}

export function getPublicAdminUrl(): string {
  const explicit = process.env.PUBLIC_ADMIN_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const legacy = process.env.KEYSTONE_PUBLIC_URL?.trim();
  if (legacy) return legacy.replace(/\/+$/, "");
  return `http://localhost:${getKeystonePortFromEnv()}`;
}
