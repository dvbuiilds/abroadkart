import { describe, it, expect } from "vitest";
import { classifyHref } from "../links";

describe("classifyHref", () => {
  it("treats a root-relative path as internal", () => {
    expect(classifyHref("/blogs/visa-tips")).toEqual({
      kind: "internal",
      href: "/blogs/visa-tips",
    });
  });

  it("keeps the query and hash on internal paths", () => {
    expect(classifyHref("/blogs?page=2#top")).toEqual({
      kind: "internal",
      href: "/blogs?page=2#top",
    });
  });

  it("rewrites absolute links to our own hosts as internal paths", () => {
    expect(classifyHref("https://abroadkart.com/blogs/visa-tips")).toEqual({
      kind: "internal",
      href: "/blogs/visa-tips",
    });
    expect(classifyHref("https://www.abroadkart.com/about")).toEqual({
      kind: "internal",
      href: "/about",
    });
    expect(classifyHref("http://app.abroadkart.com/contact")).toEqual({
      kind: "internal",
      href: "/contact",
    });
  });

  it("treats other http(s) hosts as external", () => {
    expect(classifyHref("https://www.aicte-india.org/")).toEqual({
      kind: "external",
      href: "https://www.aicte-india.org/",
    });
  });

  it("treats protocol-relative URLs as external", () => {
    expect(classifyHref("//cdn.example.com/x.js")).toEqual({
      kind: "external",
      href: "//cdn.example.com/x.js",
    });
  });

  it("treats fragments as in-page anchors", () => {
    expect(classifyHref("#funding-your-studies")).toEqual({
      kind: "anchor",
      href: "#funding-your-studies",
    });
  });

  it("leaves mailto, tel and missing hrefs untouched", () => {
    expect(classifyHref("mailto:hi@abroadkart.com")).toEqual({ kind: "none" });
    expect(classifyHref("tel:+911234567890")).toEqual({ kind: "none" });
    expect(classifyHref(undefined)).toEqual({ kind: "none" });
    expect(classifyHref("")).toEqual({ kind: "none" });
  });
});
