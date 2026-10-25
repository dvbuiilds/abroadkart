/**
 * Public URL of this Keystone process (used in redirects and CORS).
 */

import { getPublicAdminUrl } from "./publicUrls";

export function getKeystonePort(): number {
  const p = process.env.PORT;
  if (p) {
    const n = parseInt(p, 10);
    return Number.isFinite(n) ? n : 3001;
  }
  return 3001;
}

export function getKeystonePublicUrl(): string {
  return getPublicAdminUrl();
}
