import { describe, it, expect } from "vitest";
import {
  PAGE_SIZE,
  pageWindow,
  totalPages,
  parsePageParam,
  buildPageList,
} from "../pagination";

describe("PAGE_SIZE", () => {
  it("is 12 posts per page", () => {
    expect(PAGE_SIZE).toBe(12);
  });
});

describe("pageWindow", () => {
  it("page 1 fetches the featured post plus one full page", () => {
    expect(pageWindow(1)).toEqual({ skip: 0, take: 13 });
  });

  it("page 2 starts after the featured post and the first page", () => {
    expect(pageWindow(2)).toEqual({ skip: 13, take: 12 });
  });

  it("page 10 of 110 posts starts at the right offset", () => {
    expect(pageWindow(10)).toEqual({ skip: 1 + 9 * 12, take: 12 });
  });
});

describe("totalPages", () => {
  it("counts the featured post on page 1", () => {
    // 110 posts: page 1 holds 13, the remaining 97 need 9 more pages.
    expect(totalPages(110)).toBe(10);
  });

  it("is 1 when everything fits on page 1", () => {
    expect(totalPages(13)).toBe(1);
    expect(totalPages(1)).toBe(1);
  });

  it("is 1 when there are no posts", () => {
    expect(totalPages(0)).toBe(1);
  });

  it("adds a page as soon as one post spills over", () => {
    expect(totalPages(14)).toBe(2);
  });
});

describe("parsePageParam", () => {
  it("defaults to page 1 when absent", () => {
    expect(parsePageParam(undefined)).toBe(1);
  });

  it("parses positive integers", () => {
    expect(parsePageParam("1")).toBe(1);
    expect(parsePageParam("10")).toBe(10);
  });

  it.each(["0", "-1", "abc", "1.5", "", " 2 ", "2abc"])(
    "rejects %j",
    (raw) => {
      expect(parsePageParam(raw)).toBeNull();
    }
  );
});

describe("buildPageList", () => {
  it("lists every page when there are 7 or fewer", () => {
    expect(buildPageList(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("shows the start, a window and the end", () => {
    expect(buildPageList(5, 10)).toEqual([1, "…", 4, 5, 6, "…", 10]);
  });

  it("collapses the tail when on the first pages", () => {
    expect(buildPageList(1, 10)).toEqual([1, 2, "…", 10]);
  });

  it("collapses the head when on the last pages", () => {
    expect(buildPageList(10, 10)).toEqual([1, "…", 9, 10]);
  });

  it("has no ellipsis when the window touches the start", () => {
    expect(buildPageList(2, 10)).toEqual([1, 2, 3, "…", 10]);
  });
});
