/**
 * Browser-facing origins. Prefer PUBLIC_APP_URL / PUBLIC_ADMIN_URL; fall back to
 * legacy env names so existing deploys keep working.
 */

export function getPublicAppUrl(): string {
  const explicit = process.env.PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const legacy =
    process.env.BETTER_AUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL?.trim();
  if (legacy) return legacy.replace(/\/+$/, "");
  return "http://localhost:3000";
}

export function getPublicAdminUrl(): string {
  const explicit = process.env.PUBLIC_ADMIN_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const legacy =
    process.env.NEXT_PUBLIC_KEYSTONE_URL?.trim() ||
    process.env.KEYSTONE_PUBLIC_URL?.trim();
  if (legacy) return legacy.replace(/\/+$/, "");
  return "http://localhost:3001";
}
