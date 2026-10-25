// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import type { BlogPostSummary } from "@app/lib/blog/types";
import { counsellingCategory, summaryWithImage, visaCategory } from "@app/components/blog/__tests__/fixtures";

const repo = vi.hoisted(() => ({
  getPostSummaries: vi.fn(),
  getCategories: vi.fn(),
  getCategoryBySlug: vi.fn(),
}));

vi.mock("@app/lib/blog/repository", () => repo);

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("next/image", () => ({
  default: (props: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element -- the mock stands in for next/image
    <img src={props.src} alt={props.alt} />
  ),
}));

import BlogIndexPage, { generateMetadata as indexMetadata } from "../page";
import CategoryPage, { generateMetadata as categoryMetadata } from "../category/[slug]/page";

function posts(count: number): BlogPostSummary[] {
  return Array.from({ length: count }, (_, i) => ({
    ...summaryWithImage,
    id: `p-${i}`,
    slug: `post-${i}`,
    title: `Post ${i}`,
  }));
}

const search = (page?: string) => ({ searchParams: Promise.resolve({ page }) });
const categoryParams = (slug: string, page?: string) => ({
  params: Promise.resolve({ slug }),
  searchParams: Promise.resolve({ page }),
});

describe("blog index page", () => {
  beforeEach(() => {
    repo.getPostSummaries.mockReset();
    repo.getCategories.mockReset().mockResolvedValue([visaCategory, counsellingCategory]);
    repo.getCategoryBySlug.mockReset();
  });

  it("puts the latest post first as a featured card, then a grid of 12", async () => {
    repo.getPostSummaries.mockResolvedValue({ items: posts(13), totalCount: 110 });
    render(await BlogIndexPage(search()));

    expect(repo.getPostSummaries).toHaveBeenCalledWith({ skip: 0, take: 13 });
    expect(screen.getAllByRole("article")).toHaveLength(13);
    expect(screen.getByText("Read article")).toBeInTheDocument();
  });

  it("starts later pages after the featured slot and has no featured card", async () => {
    repo.getPostSummaries.mockResolvedValue({ items: posts(12), totalCount: 110 });
    render(await BlogIndexPage(search("2")));

    expect(repo.getPostSummaries).toHaveBeenCalledWith({ skip: 13, take: 12 });
    expect(screen.queryByText("Read article")).toBeNull();
    expect(screen.getAllByRole("article")).toHaveLength(12);
  });

  it("is not found for a page past the last one", async () => {
    repo.getPostSummaries.mockResolvedValue({ items: [], totalCount: 110 });
    await expect(BlogIndexPage(search("99"))).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("is not found for a malformed page number", async () => {
    await expect(BlogIndexPage(search("abc"))).rejects.toThrow("NEXT_NOT_FOUND");
    expect(repo.getPostSummaries).not.toHaveBeenCalled();
  });

  it("has a single H1 and category chips with All active", async () => {
    repo.getPostSummaries.mockResolvedValue({ items: posts(1), totalCount: 1 });
    render(await BlogIndexPage(search()));

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    const chips = screen.getByRole("navigation", { name: "Blog categories" });
    expect(within(chips).getByRole("link", { name: "All" })).toHaveAttribute("aria-current", "page");
  });

  it("canonicalises page 3 to itself", async () => {
    const meta = await indexMetadata(search("3"));
    expect(meta.alternates?.canonical).toMatch(/\/blogs\?page=3$/);
  });
});

describe("blog category page", () => {
  beforeEach(() => {
    repo.getPostSummaries.mockReset().mockResolvedValue({ items: posts(2), totalCount: 2 });
    repo.getCategories.mockReset().mockResolvedValue([visaCategory]);
    repo.getCategoryBySlug.mockReset().mockResolvedValue(visaCategory);
  });

  it("is not found for an unknown category", async () => {
    repo.getCategoryBySlug.mockResolvedValue(null);
    await expect(CategoryPage(categoryParams("nope"))).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("names the category in the H1 and filters posts by it", async () => {
    render(await CategoryPage(categoryParams("visa")));

    expect(screen.getByRole("heading", { level: 1, name: "Visa" })).toBeInTheDocument();
    expect(repo.getPostSummaries).toHaveBeenCalledWith({
      skip: 0,
      take: 13,
      categorySlug: "visa",
    });
  });

  it("marks its chip as the current page", async () => {
    render(await CategoryPage(categoryParams("visa")));
    const chips = screen.getByRole("navigation", { name: "Blog categories" });
    expect(within(chips).getByRole("link", { name: /Visa/ })).toHaveAttribute("aria-current", "page");
  });

  it("canonicalises to its own path", async () => {
    const meta = await categoryMetadata(categoryParams("visa"));
    expect(meta.alternates?.canonical).toMatch(/\/blogs\/category\/visa$/);
  });
});
