/**
 * How ArticleBody treats an <a href> from the stored article HTML.
 *
 * - internal: a path on this site, rendered with next/link.
 * - external: another site, rendered with target and rel and an arrow icon.
 * - anchor:   an in-page #fragment, rendered as a plain link.
 * - none:     anything else (mailto, tel, missing href). Left untouched.
 */

export type LinkClassification =
  | { kind: "internal"; href: string }
  | { kind: "external"; href: string }
  | { kind: "anchor"; href: string }
  | { kind: "none" };

const OWN_HOSTS = new Set([
  "abroadkart.com",
  "www.abroadkart.com",
  "app.abroadkart.com",
]);

export function classifyHref(href: string | undefined): LinkClassification {
  if (!href) return { kind: "none" };
  if (href.startsWith("#")) return { kind: "anchor", href };
  if (href.startsWith("//")) return { kind: "external", href };
  if (href.startsWith("/")) return { kind: "internal", href };

  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return { kind: "none" };
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { kind: "none" };
  }

  if (OWN_HOSTS.has(url.hostname)) {
    return {
      kind: "internal",
      href: `${url.pathname}${url.search}${url.hash}`,
    };
  }

  return { kind: "external", href };
}
