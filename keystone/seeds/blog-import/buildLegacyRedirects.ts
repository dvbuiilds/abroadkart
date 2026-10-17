import path from "node:path";
import type { ImageManifestRow, NextRedirect, WpPost, WpRedirect } from "./types";

const trim = (s: string) => s.replace(/^\/+|\/+$/g, "");

/** legacy slug -> final slug, from redirects.json (source and destination are /<slug>/). */
export function buildRedirectMap(redirects: WpRedirect[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const r of redirects) map[trim(r.source)] = trim(r.destination);
  return map;
}

/**
 * Next.js redirects() rules for the WordPress URLs. Every rule is permanent and
 * a single hop.
 *
 * Page rules are emitted in both forms, /x and /x/. Next redirects /x/ to /x
 * before custom rules run, so a rule for /x alone would make /x/ two hops. Image
 * rules are emitted once, since WordPress upload paths have no trailing slash.
 */
export function buildLegacyRedirects(
  posts: WpPost[],
  redirects: WpRedirect[],
  manifest: ImageManifestRow[],
  cdnUrl: string,
): NextRedirect[] {
  const rules: NextRedirect[] = [];
  const add = (source: string, destination: string) =>
    rules.push({ source, destination, permanent: true });
  const addPage = (source: string, destination: string) => {
    add(source, destination);
    add(`${source}/`, destination);
  };

  const published = posts.filter((p) => p.status === "published");
  const slugs = new Set(published.map((p) => p.slug));
  const redirectMap = buildRedirectMap(redirects);

  for (const slug of [...slugs].sort()) addPage(`/${slug}`, `/blogs/${slug}`);

  for (const r of redirects) {
    const from = trim(r.source);
    const to = redirectMap[from];
    if (slugs.has(from) || !slugs.has(to)) continue;
    addPage(`/${from}`, `/blogs/${to}`);
  }

  addPage("/category/:c", "/blogs/category/:c");
  addPage("/author/:a*", "/blogs");
  addPage("/tag/:t*", "/blogs");
  addPage("/feed", "/blogs");
  addPage("/blog/:path*", "/blogs");

  // Featured images and their resized variants -> the one image on the CDN.
  const renditions = new Map(
    published.map((p) => [p.slug, p.featuredImage?.renditions ?? []]),
  );
  const unsafe = /[()*?{}:]/;
  for (const row of [...manifest].sort((a, b) => a.slug.localeCompare(b.slug))) {
    const dest = `${cdnUrl}/blog/${row.slug}${path.extname(row.stagedPath)}`;
    const sourcePaths = [row.sourcePath, ...(renditions.get(row.slug) ?? []).map((r) => r.sourcePath)];
    for (const sp of sourcePaths) {
      if (unsafe.test(sp)) continue; // falls through to the catch-all below
      add(`/${sp}`, dest);
    }
  }

  add("/wp-content/uploads/:path*", "/blogs");
  return rules;
}
