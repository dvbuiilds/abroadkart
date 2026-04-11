import { getKeystonePublicUrl } from "./keystonePublicUrl";

/**
 * Origins allowed for Clerk JWT verification and authenticateRequest (subdomain cookie leak protection).
 */
export function getClerkAuthorizedParties(): string[] {
  const set = new Set<string>();
  for (const o of [
    process.env.FRONTEND_URL,
    process.env.KEYSTONE_PUBLIC_URL,
    "http://localhost:3000",
    getKeystonePublicUrl(),
  ]) {
    if (!o) continue;
    set.add(o.replace(/\/+$/, ""));
  }
  return Array.from(set);
}
