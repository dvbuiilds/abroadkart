// @vitest-environment node
import { describe, it, expect } from "vitest";
import nextConfig from "../../../../next.config";

/**
 * Next normalises trailing slashes before custom redirects. These tests keep the
 * config that makes legacy /slug/ URLs reach their destination in one hop.
 */
describe("redirect hops", () => {
  it("lets the legacy rules handle trailing slashes", () => {
    expect(nextConfig.skipTrailingSlashRedirect).toBe(true);
  });

  it("ends with a catch-all that drops any other trailing slash in one hop", async () => {
    const rules = await nextConfig.redirects!();
    expect(rules[rules.length - 1]).toEqual({
      source: "/:path+/",
      destination: "/:path+",
      permanent: true,
    });
  });

  it("puts the legacy rules before the catch-all, so they win", async () => {
    const rules = (await nextConfig.redirects!()) as Array<{ source: string }>;
    const catchAll = rules.findIndex((r) => r.source === "/:path+/");
    const legacy = rules.findIndex((r) => r.source === "/ms-in-computer-science-usa/");
    expect(legacy).toBeGreaterThanOrEqual(0);
    expect(legacy).toBeLessThan(catchAll);
  });
});
