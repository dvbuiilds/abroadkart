// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { fullPost, summaryWithImage } from "@app/components/blog/__tests__/fixtures";
import type { BlogPost } from "@app/lib/blog/types";
import { buildPostMetadata } from "@app/lib/blog/seo";

const repo = vi.hoisted(() => ({
  getPostBySlugCached: vi.fn(),
  getRelatedPosts: vi.fn(),
  getAllSlugs: vi.fn(),
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

import BlogPostPage, {
  generateMetadata,
  generateStaticParams,
} from "../[slug]/page";

const params = (slug: string) => ({ params: Promise.resolve({ slug }) });

const faqPost: BlogPost = {
  ...fullPost,
  faqs: [
    { order: 0, question: "Can I pay the fee online?", answer: "Yes, most banks allow it." },
    { order: 1, question: "How long does it take?", answer: "About two weeks." },
  ],
  contentHtml: "<h2 id=\"step-one\">Step one</h2><p>Begin the form.</p>",
};

describe("blog post page", () => {
  beforeEach(() => {
    repo.getPostBySlugCached.mockReset();
    repo.getRelatedPosts.mockReset().mockResolvedValue([]);
    repo.getAllSlugs.mockReset();
  });

  describe("status", () => {
    it("is not found when the post does not exist", async () => {
      repo.getPostBySlugCached.mockResolvedValue(null);
      await expect(BlogPostPage(params("missing"))).rejects.toThrow("NEXT_NOT_FOUND");
    });

    it("is not found for a draft, so drafts never render publicly", async () => {
      repo.getPostBySlugCached.mockResolvedValue({ ...fullPost, status: "draft" });
      await expect(BlogPostPage(params(fullPost.slug))).rejects.toThrow("NEXT_NOT_FOUND");
    });
  });

  describe("content", () => {
    it("renders exactly one H1, equal to the post title", async () => {
      repo.getPostBySlugCached.mockResolvedValue(fullPost);
      render(await BlogPostPage(params(fullPost.slug)));

      const headings = screen.getAllByRole("heading", { level: 1 });
      expect(headings).toHaveLength(1);
      expect(headings[0]).toHaveTextContent(fullPost.title);
    });

    it("embeds BlogPosting JSON-LD that parses", async () => {
      repo.getPostBySlugCached.mockResolvedValue(fullPost);
      const { container } = render(await BlogPostPage(params(fullPost.slug)));

      const script = container.querySelector('script[type="application/ld+json"]');
      expect(script).not.toBeNull();
      const json = JSON.parse(script!.textContent ?? "{}");
      expect(json["@graph"].map((node: { "@type": string }) => node["@type"])).toContain(
        "BlogPosting"
      );
    });

    it("shows the FAQ section when the body does not repeat it", async () => {
      repo.getPostBySlugCached.mockResolvedValue(faqPost);
      render(await BlogPostPage(params(faqPost.slug)));

      expect(
        screen.getByRole("heading", { level: 2, name: "Frequently Asked Questions" })
      ).toBeInTheDocument();
    });

    it("hides the FAQ section when the body already contains the first question", async () => {
      repo.getPostBySlugCached.mockResolvedValue({
        ...faqPost,
        contentHtml: `<h2>Intro</h2><p>${faqPost.faqs[0].question}</p>`,
      });
      render(await BlogPostPage(params(faqPost.slug)));

      expect(screen.queryByText("Frequently Asked Questions")).toBeNull();
    });

    it("shows related posts when there are some", async () => {
      repo.getPostBySlugCached.mockResolvedValue(fullPost);
      repo.getRelatedPosts.mockResolvedValue([summaryWithImage]);
      render(await BlogPostPage(params(fullPost.slug)));

      expect(screen.getByRole("heading", { name: "Keep reading" })).toBeInTheDocument();
    });

    it("omits the related section when there are none", async () => {
      repo.getPostBySlugCached.mockResolvedValue(fullPost);
      repo.getRelatedPosts.mockResolvedValue([]);
      render(await BlogPostPage(params(fullPost.slug)));

      expect(screen.queryByRole("heading", { name: "Keep reading" })).toBeNull();
    });
  });

  describe("metadata and static params", () => {
    it("generates metadata from the post", async () => {
      repo.getPostBySlugCached.mockResolvedValue(fullPost);
      expect(await generateMetadata(params(fullPost.slug))).toEqual(buildPostMetadata(fullPost));
    });

    it("returns empty metadata for an unknown slug", async () => {
      repo.getPostBySlugCached.mockResolvedValue(null);
      expect(await generateMetadata(params("missing"))).toEqual({});
    });

    it("pre-renders one route per published slug", async () => {
      repo.getAllSlugs.mockResolvedValue(["a-post", "b-post"]);
      expect(await generateStaticParams()).toEqual([{ slug: "a-post" }, { slug: "b-post" }]);
    });
  });
});
