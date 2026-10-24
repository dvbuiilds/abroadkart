// @vitest-environment node
import { describe, it, expect } from "vitest";
import { buildListingMetadata } from "../seo";

const base = "https://abroadkart.com";

describe("buildListingMetadata", () => {
  it("uses the plain title and path for page 1", () => {
    const meta = buildListingMetadata({
      path: "/blogs",
      title: "Blog",
      description: "Guides",
      page: 1,
    });
    expect(meta.title).toBe("Blog");
    expect(meta.alternates?.canonical).toBe(`${process.env.PUBLIC_APP_URL ?? "http://localhost:3000"}/blogs`);
  });

  it("canonicalises later pages to themselves", () => {
    const meta = buildListingMetadata({
      path: "/blogs",
      title: "Blog",
      description: "Guides",
      page: 3,
    });
    expect(meta.alternates?.canonical).toMatch(/\/blogs\?page=3$/);
    expect(meta.openGraph?.url).toMatch(/\/blogs\?page=3$/);
  });

  it("labels later pages with the page number", () => {
    const meta = buildListingMetadata({
      path: "/blogs",
      title: "Blog",
      description: "Guides",
      page: 2,
    });
    expect(meta.title).toBe("Blog — Page 2");
  });

  it("indexes listing pages", () => {
    const meta = buildListingMetadata({
      path: "/blogs/category/visa",
      title: "Visa",
      description: "Visa guides",
    });
    expect(meta.robots).toBe("index, follow");
  });

  it("builds canonicals for category archives from their path", () => {
    process.env.PUBLIC_APP_URL = base;
    const meta = buildListingMetadata({
      path: "/blogs/category/visa",
      title: "Visa",
      description: "Visa guides",
    });
    expect(meta.alternates?.canonical).toBe(`${base}/blogs/category/visa`);
    delete process.env.PUBLIC_APP_URL;
  });
});
