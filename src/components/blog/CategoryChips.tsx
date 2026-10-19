"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import type { BlogCategory } from "@app/lib/blog/types";
import { scrollLeftFor } from "@app/lib/blog/chip-scroll";

const chipBase =
  "inline-flex shrink-0 snap-start items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2";
const chipActive = "border-gray-900 bg-gray-900 text-white";
const chipIdle = "border-gray-200 bg-white text-gray-700 hover:border-gray-400";

// Module state survives the soft navigation between chips, so the row can be
// restored after the new page renders. A hard load starts with both unset.
let savedScrollLeft: number | null = null;
let pendingAlign = false;

// 64px fixed navbar plus the 12px top padding of the sticky bar's wrapper.
const STICKY_OFFSET = 76;

/**
 * Horizontal row of category filters. Plain links, so it works without JS.
 * On a chip click the row keeps its scroll position and the results stay in
 * view: the page does not jump to the top, and the row does not return to its
 * first fold.
 */
export function CategoryChips({
  categories,
  activeSlug,
}: {
  categories: BlogCategory[];
  activeSlug?: string;
}) {
  const navRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useLayoutEffect(() => {
    const nav = navRef.current;
    const row = listRef.current;
    if (!nav || !row) return;

    const active = row.querySelector<HTMLElement>('[aria-current="page"]');
    const rowRect = row.getBoundingClientRect();
    const activeRect = active?.getBoundingClientRect();
    const chipLeft = activeRect ? activeRect.left - rowRect.left + row.scrollLeft : null;

    row.scrollLeft = scrollLeftFor({
      saved: savedScrollLeft,
      chipLeft,
      chipWidth: activeRect?.width ?? 0,
      viewport: row.clientWidth,
      max: row.scrollWidth - row.clientWidth,
    });
    savedScrollLeft = null;

    if (pendingAlign) {
      pendingAlign = false;
      const barTop = nav.getBoundingClientRect().top + window.scrollY - STICKY_OFFSET;
      if (window.scrollY >= barTop) window.scrollTo({ top: barTop, behavior: "instant" });
    }
  }, [activeSlug]);

  function rememberRow(event: React.MouseEvent<HTMLElement>) {
    const row = listRef.current;
    const link = (event.target as Element).closest("a");
    if (!row || !link || link.getAttribute("aria-current") === "page") return;
    savedScrollLeft = row.scrollLeft;
    pendingAlign = true;
  }

  return (
    // flow-root stops the list's negative margin from collapsing out of the nav.
    <nav ref={navRef} aria-label="Blog categories" className="flow-root" onClick={rememberRow}>
      <ul
        ref={listRef}
        className="-mx-1 -my-1 flex list-none snap-x gap-2 overflow-x-auto py-1 pl-1 pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <li className="flex">
          <Link
            href="/blogs"
            scroll={false}
            aria-current={activeSlug ? undefined : "page"}
            className={`${chipBase} ${activeSlug ? chipIdle : chipActive}`}
          >
            All
          </Link>
        </li>
        {categories.map((category) => {
          const active = category.slug === activeSlug;
          return (
            <li key={category.slug} className="flex">
              <Link
                href={`/blogs/category/${category.slug}`}
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={`${chipBase} ${active ? chipActive : chipIdle}`}
              >
                {category.name}
                {category.postCount !== undefined && (
                  <span className={`text-xs ${active ? "text-white/60" : "text-gray-500"}`}>
                    {category.postCount}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
