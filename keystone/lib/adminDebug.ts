/**
 * Verbose logs for Admin UI / GraphQL troubleshooting.
 * Set KEYSTONE_DEBUG_ADMIN=0 to silence when NODE_ENV=development.
 */
export function isKeystoneAdminDebug(): boolean {
  if (process.env.NODE_ENV !== "development") return false;
  if (process.env.KEYSTONE_DEBUG_ADMIN === "0") return false;
  return true;
}
