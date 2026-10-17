"use client";

import { useEffect } from "react";

const TOC_LINKS = 'nav[aria-label="Table of contents"] a[href^="#"]';

/**
 * Marks the table-of-contents entry for the section currently under the top
 * of the viewport (aria-current="location"). It only changes attributes, so it
 * never re-renders the page, and it renders no markup.
 */
export function TocHighlighter({ ids }: { ids: string[] }) {
  const key = ids.join(" ");

  useEffect(() => {
    const sectionIds = key ? key.split(" ") : [];
    if (sectionIds.length === 0 || typeof IntersectionObserver === "undefined") {
      return;
    }

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    let current: string | null = null;

    const mark = (id: string) => {
      if (id === current) return;
      current = id;
      document.querySelectorAll<HTMLAnchorElement>(TOC_LINKS).forEach((link) => {
        if (link.getAttribute("href") === `#${id}`) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    // A heading becomes "current" when it crosses the band 96px below the top
    // (under the fixed navbar), and stays current until the next one crosses.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) mark(entry.target.id);
        }
      },
      { rootMargin: "-96px 0px -66% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [key]);

  return null;
}
