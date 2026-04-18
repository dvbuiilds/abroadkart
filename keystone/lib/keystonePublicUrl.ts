/**
 * Public URL of this Keystone process (used in redirects and CORS).
 */

export function getKeystonePort(): number {
  const p = process.env.PORT;
  if (p) {
    const n = parseInt(p, 10);
    return Number.isFinite(n) ? n : 3001;
  }
  return 3001;
}

export function getKeystonePublicUrl(): string {
  const raw = process.env.KEYSTONE_PUBLIC_URL?.trim();
  if (raw) return raw.replace(/\/+$/, "");
  return `http://localhost:${getKeystonePort()}`;
}
