/**
 * Index pagination. Page 1 shows one featured post followed by a grid of
 * PAGE_SIZE posts; later pages show only the grid.
 */

export const PAGE_SIZE = 12;

const FEATURED_SLOTS = 1;

/** The Keystone skip/take window for a 1-based page number. */
export function pageWindow(page: number): { skip: number; take: number } {
  if (page === 1) {
    return { skip: 0, take: FEATURED_SLOTS + PAGE_SIZE };
  }
  return {
    skip: FEATURED_SLOTS + (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  };
}

/** Number of pages for a total post count. Always at least 1. */
export function totalPages(totalCount: number): number {
  return Math.max(1, Math.ceil((totalCount - FEATURED_SLOTS) / PAGE_SIZE));
}

/**
 * Parses the `?page=` query value. Absent means page 1. Anything that is not a
 * positive whole number (including "0", "1.5" and "2abc") is null.
 */
export function parsePageParam(raw: string | undefined): number | null {
  if (raw === undefined) return 1;
  if (!/^[1-9]\d*$/.test(raw)) return null;
  return Number(raw);
}

export type PageItem = number | "…";

/**
 * Items for the pager: every page when there are 7 or fewer, otherwise the
 * first page, the last page, and the current page with one neighbour each
 * side. Gaps are shown as "…".
 */
export function buildPageList(page: number, total: number): PageItem[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const visible = [...new Set([1, total, page - 1, page, page + 1])]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const items: PageItem[] = [];
  visible.forEach((p, i) => {
    if (i > 0 && p - visible[i - 1] > 1) items.push("…");
    items.push(p);
  });
  return items;
}
