import { parseBody } from "./dom";

const ABSOLUTE_SITE = /^https?:\/\/(?:www\.)?abroadkart\.com(?=\/|$)/i;

/**
 * Points old WordPress links (/<slug>/) at /blogs/<slug>, following the legacy redirect
 * map so each link is one hop. Unknown internal links go to /blogs and are reported.
 * Only href attributes change.
 */
export function rewriteInternalLinks(
  html: string,
  slugSet: Set<string>,
  redirectMap: Record<string, string>,
): { html: string; unknown: string[] } {
  const body = parseBody(html);
  const unknown: string[] = [];

  for (const a of Array.from(body.querySelectorAll("a[href]"))) {
    const href = a.getAttribute("href")!;
    const local = href.replace(ABSOLUTE_SITE, "");
    if (!local.startsWith("/") || local.startsWith("//")) continue;

    const match = /^([^?#]*)([?#].*)?$/.exec(local)!;
    const slug = match[1].replace(/^\/+|\/+$/g, "");
    const suffix = match[2] ?? "";
    const finalSlug = redirectMap[slug] ?? slug;

    if (slugSet.has(finalSlug)) {
      a.setAttribute("href", `/blogs/${finalSlug}${suffix}`);
    } else {
      unknown.push(href);
      a.setAttribute("href", "/blogs");
    }
  }
  return { html: body.innerHTML, unknown };
}
