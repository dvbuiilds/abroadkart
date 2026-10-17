// @vitest-environment node
import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "fs";
import path from "path";

interface NextRedirect {
  source: string;
  destination: string;
  permanent: true;
}

describe("Legacy redirects", () => {
  let redirects: NextRedirect[];

  beforeAll(() => {
    const filePath = path.join(__dirname, "..", "legacy-redirects.json");
    const content = readFileSync(filePath, "utf-8");
    redirects = JSON.parse(content);
  });

  it("loads the redirects file", () => {
    expect(redirects).toBeDefined();
    expect(Array.isArray(redirects)).toBe(true);
    expect(redirects.length).toBeGreaterThan(0);
  });

  it("all sources start with /", () => {
    for (const rule of redirects) {
      expect(rule.source).toMatch(/^\//);
    }
  });

  it("all rules have permanent: true", () => {
    for (const rule of redirects) {
      expect(rule.permanent).toBe(true);
    }
  });

  it("has no duplicate sources", () => {
    const sources = redirects.map((r) => r.source);
    const unique = new Set(sources);
    expect(unique.size).toBe(sources.length);
  });

  it("has fewer than 1000 rules", () => {
    expect(redirects.length).toBeLessThan(1000);
  });

  it("has no chain (no destination is also a source)", () => {
    const sources = new Set(redirects.map((r) => r.source));
    const destinations = redirects.map((r) => r.destination);
    for (const dest of destinations) {
      if (dest.startsWith("/") && !dest.startsWith("/blogs")) {
        expect(sources.has(dest)).toBe(false);
      }
    }
  });

  it("covers all 110 published post slugs", () => {
    const blogRules = redirects.filter(
      (r) => !r.source.includes(":") && !r.source.includes("*") && r.destination.startsWith("/blogs/")
    );
    expect(blogRules.length).toBeGreaterThanOrEqual(110);
    for (const rule of blogRules) {
      expect(rule.destination).toMatch(/^\/blogs\/[^\/]+$/);
    }
  });

  it("does not include the draft slug", () => {
    const sources = redirects.map((r) => r.source);
    expect(sources).not.toContain("/f-1-visa-application-timeline-when-to-apply-and-why-it-matters");
  });

  it("includes category, author, tag and feed catch-all rules", () => {
    const sources = redirects.map((r) => r.source);
    expect(sources.some((s) => s.includes("category"))).toBe(true);
    expect(sources.some((s) => s.includes("author"))).toBe(true);
    expect(sources.some((s) => s.includes("tag"))).toBe(true);
    expect(sources.some((s) => s === "/feed")).toBe(true);
    expect(sources.some((s) => s === "/blog/:path*")).toBe(true);
  });

  it("has /wp-content/uploads/:path* as the last rule", () => {
    expect(redirects[redirects.length - 1].source).toBe("/wp-content/uploads/:path*");
  });

  it("category, author, and tag rules point to /blogs", () => {
    const categoryRule = redirects.find((r) => r.source === "/category/:c");
    const authorRule = redirects.find((r) => r.source === "/author/:a*");
    const tagRule = redirects.find((r) => r.source === "/tag/:t*");

    expect(categoryRule?.destination).toBe("/blogs/category/:c");
    expect(authorRule?.destination).toBe("/blogs");
    expect(tagRule?.destination).toBe("/blogs");
  });
});
