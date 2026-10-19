import { parseBody } from "./dom";
import { LINK_OVERRIDES } from "./linkOverrides";

const ABSOLUTE_SITE = /^https?:\/\/(?:www\.)?abroadkart\.com(?=\/|$)/i;

/**
 * Points old WordPress links (/<slug>/) at /blogs/<slug>, following the legacy redirect
 * map so each link is one hop. Paths in `overrides` are mapped first, for pages that
 * are not in the export. Unknown internal links go to /blogs and are reported.
 * Only href attributes change.
 */
export function rewriteInternalLinks(
  html: string,
  slugSet: Set<string>,
  redirectMap: Record<string, string>,
  overrides: Record<string, string> = LINK_OVERRIDES,
): { html: string; unknown: string[] } {
  const body = parseBody(html);
  const unknown: string[] = [];

  for (const a of Array.from(body.querySelectorAll("a[href]"))) {
    const href = a.getAttribute("href")!;
    const local = href.replace(ABSOLUTE_SITE, "");
    if (!local.startsWith("/") || local.startsWith("//")) continue;

    const match = /^([^?#]*)([?#].*)?$/.exec(local)!;
    if (Object.prototype.hasOwnProperty.call(overrides, match[1])) {
      a.setAttribute("href", overrides[match[1]]);
      continue;
    }
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
