import { describe, it, expect } from "vitest";
import { buildToc } from "../toc";
import type { Heading, TocItem } from "../types";

describe("buildToc", () => {
  it("returns empty array for empty input", () => {
    expect(buildToc([])).toEqual([]);
  });

  it("nests H3 under the preceding H2", () => {
    const headings: Heading[] = [
      { level: 2, text: "Section A", id: "section-a" },
      { level: 3, text: "Subsection A.1", id: "subsection-a1" },
      { level: 3, text: "Subsection A.2", id: "subsection-a2" },
      { level: 2, text: "Section B", id: "section-b" },
      { level: 3, text: "Subsection B.1", id: "subsection-b1" },
    ];

    const expected: TocItem[] = [
      {
        level: 2,
        text: "Section A",
        id: "section-a",
        children: [
          { level: 3, text: "Subsection A.1", id: "subsection-a1" },
          { level: 3, text: "Subsection A.2", id: "subsection-a2" },
        ],
      },
      {
        level: 2,
        text: "Section B",
        id: "section-b",
        children: [
          { level: 3, text: "Subsection B.1", id: "subsection-b1" },
        ],
      },
    ];

    expect(buildToc(headings)).toEqual(expected);
  });

  it("drops H4 and H5", () => {
    const headings: Heading[] = [
      { level: 2, text: "Section", id: "section" },
      { level: 3, text: "Subsection", id: "subsection" },
      { level: 4, text: "Should be dropped", id: "h4" },
      { level: 5, text: "Also dropped", id: "h5" },
      { level: 2, text: "Next Section", id: "next" },
    ];

    const expected: TocItem[] = [
      {
        level: 2,
        text: "Section",
        id: "section",
        children: [{ level: 3, text: "Subsection", id: "subsection" }],
      },
      {
        level: 2,
        text: "Next Section",
        id: "next",
      },
    ];

    expect(buildToc(headings)).toEqual(expected);
  });

  it("promotes H3 before any H2 to top level", () => {
    const headings: Heading[] = [
      { level: 3, text: "Orphan H3", id: "orphan" },
      { level: 3, text: "Another orphan", id: "orphan2" },
      { level: 2, text: "First H2", id: "first-h2" },
      { level: 3, text: "Now nested", id: "nested" },
    ];

    const expected: TocItem[] = [
      { level: 3, text: "Orphan H3", id: "orphan" },
      { level: 3, text: "Another orphan", id: "orphan2" },
      {
        level: 2,
        text: "First H2",
        id: "first-h2",
        children: [{ level: 3, text: "Now nested", id: "nested" }],
      },
    ];

    expect(buildToc(headings)).toEqual(expected);
  });

  it("handles a complex hierarchy with multiple nesting levels", () => {
    const headings: Heading[] = [
      { level: 2, text: "Main", id: "main" },
      { level: 3, text: "Sub1", id: "sub1" },
      { level: 3, text: "Sub2", id: "sub2" },
      { level: 2, text: "Main2", id: "main2" },
      { level: 3, text: "Sub2.1", id: "sub21" },
      { level: 4, text: "Dropped", id: "dropped" },
      { level: 3, text: "Sub2.2", id: "sub22" },
    ];

    const expected: TocItem[] = [
      {
        level: 2,
        text: "Main",
        id: "main",
        children: [
          { level: 3, text: "Sub1", id: "sub1" },
          { level: 3, text: "Sub2", id: "sub2" },
        ],
      },
      {
        level: 2,
        text: "Main2",
        id: "main2",
        children: [
          { level: 3, text: "Sub2.1", id: "sub21" },
          { level: 3, text: "Sub2.2", id: "sub22" },
        ],
      },
    ];

    expect(buildToc(headings)).toEqual(expected);
  });

  it("only includes H2 and H3", () => {
    const headings: Heading[] = [
      { level: 1, text: "H1 (dropped)", id: "h1" },
      { level: 2, text: "H2", id: "h2" },
      { level: 3, text: "H3", id: "h3" },
      { level: 6, text: "H6 (dropped)", id: "h6" },
    ];

    const expected: TocItem[] = [
      {
        level: 2,
        text: "H2",
        id: "h2",
        children: [{ level: 3, text: "H3", id: "h3" }],
      },
    ];

    expect(buildToc(headings)).toEqual(expected);
  });
});
