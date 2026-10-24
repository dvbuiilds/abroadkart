import type { WpRedirect } from "./types";

const trim = (s: string) => s.replace(/^\/+|\/+$/g, "");

/** legacy slug -> final slug, from redirects.json (source and destination are /<slug>/). */
export function buildRedirectMap(redirects: WpRedirect[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const r of redirects) map[trim(r.source)] = trim(r.destination);
  return map;
}
