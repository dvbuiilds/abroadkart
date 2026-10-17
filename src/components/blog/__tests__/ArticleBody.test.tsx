import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArticleBody } from "../ArticleBody";
import { articleHtml } from "./fixtures";

/** Collapses whitespace so formatting differences do not count as text changes. */
function normalise(text: string | null) {
  return (text ?? "").replace(/\s+/g, " ").trim();
}

function sourceText(html: string) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return normalise(div.textContent);
}

describe("ArticleBody", () => {
  it("renders exactly the same visible text as the stored HTML", () => {
    const { container } = render(<ArticleBody html={articleHtml} />);
    const article = container.querySelector("article");
    expect(normalise(article?.textContent ?? null)).toBe(sourceText(articleHtml));
  });

  it("renders internal /blogs links as in-app links without a target", () => {
    const { container } = render(<ArticleBody html={articleHtml} />);
    const link = container.querySelector('a[href="/blogs/visa-tips"]');
    expect(link).toHaveTextContent("visa guide");
    expect(link).not.toHaveAttribute("target");
  });

  it("rewrites absolute links to our own host into internal paths", () => {
    const { container } = render(<ArticleBody html={articleHtml} />);
    const link = container.querySelector('a[href="/blogs/gre-or-gmat-which-to-take"]');
    expect(link).toHaveTextContent("GRE or GMAT");
    expect(link).not.toHaveAttribute("target");
  });

  it("opens external links in a new tab with a safe rel and an arrow icon", () => {
    const { container } = render(<ArticleBody html={articleHtml} />);
    const link = container.querySelector('a[href="https://www.aicte-india.org/"]');
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link?.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
  });

  it("wraps every table in a labelled, keyboard-focusable scroll region", () => {
    const { container } = render(<ArticleBody html={articleHtml} />);
    const tables = container.querySelectorAll("table");
    expect(tables).toHaveLength(1);
    const wrapper = tables[0].parentElement;
    expect(wrapper).toHaveClass("table-wrap");
    expect(wrapper).toHaveAttribute("role", "region");
    expect(wrapper).toHaveAttribute("aria-label", "Table");
    expect(wrapper).toHaveAttribute("tabindex", "0");
  });

  it("keeps every heading id from the source", () => {
    const { container } = render(<ArticleBody html={articleHtml} />);
    for (const id of ["decoding-the-terminologies", "beyond-the-label", "small-print"]) {
      expect(container.querySelector(`[id="${id}"]`)).not.toBeNull();
    }
  });

  it("adds an empty deep-link anchor to each identified heading", () => {
    const { container } = render(<ArticleBody html={articleHtml} />);
    const anchor = container.querySelector('h2#decoding-the-terminologies a.heading-anchor');
    expect(anchor).toHaveAttribute("href", "#decoding-the-terminologies");
    expect(anchor).toHaveAttribute("aria-label", "Link to this section");
    expect(anchor?.textContent).toBe("");
  });

  it("leaves legacy anchors without an href untouched", () => {
    const { container } = render(<ArticleBody html={articleHtml} />);
    const anchor = container.querySelector('a[name="_Toc174731195"]');
    expect(anchor).not.toBeNull();
    expect(anchor).not.toHaveAttribute("href");
    expect(anchor).not.toHaveAttribute("target");
  });

  it("renders one article landmark with the body id and no H1", () => {
    const { container } = render(<ArticleBody html={articleHtml} />);
    expect(container.querySelectorAll("article#article-body")).toHaveLength(1);
    expect(container.querySelector("h1")).toBeNull();
  });

  it("uses the body text in the accessibility tree", () => {
    render(<ArticleBody html={articleHtml} />);
    expect(screen.getByText("Beyond the Label")).toBeInTheDocument();
  });
});
