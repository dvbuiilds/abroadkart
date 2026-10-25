import type { Heading, TocItem } from "./types";

/**
 * Builds a table of contents from a list of headings.
 * - Filters to H2 and H3 only (drops H4, H5, H6, H1).
 * - Nests H3 under the preceding H2.
 * - Promotes orphan H3 (before any H2) to top level.
 */
export function buildToc(headings: Heading[]): TocItem[] {
  const filtered = headings.filter((h) => h.level === 2 || h.level === 3);
  if (filtered.length === 0) return [];

  const result: TocItem[] = [];
  let currentH2: TocItem | null = null;

  for (const heading of filtered) {
    const item: TocItem = {
      level: heading.level,
      text: heading.text,
      id: heading.id,
    };

    if (heading.level === 2) {
      currentH2 = item;
      result.push(item);
    } else if (heading.level === 3) {
      if (currentH2) {
        if (!currentH2.children) currentH2.children = [];
        currentH2.children.push(item);
      } else {
        result.push(item);
      }
    }
  }

  return result;
}
