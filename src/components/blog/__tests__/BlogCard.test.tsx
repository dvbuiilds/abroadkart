import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { BlogCard } from "../BlogCard";
import { summaryWithImage, summaryWithoutImage } from "./fixtures";

vi.mock("next/image", () => ({
  default: (props: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element -- the mock stands in for next/image
    <img
      src={props.src}
      alt={props.alt}
      width={props.width}
      height={props.height}
      className={props.className}
    />
  ),
}));

describe("BlogCard", () => {
  it("has exactly one link, pointing at the post", () => {
    render(<BlogCard post={summaryWithImage} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "/blogs/how-to-fill-the-ds-160-form");
  });

  it("contains no buttons or other interactive elements", () => {
    const { container } = render(<BlogCard post={summaryWithImage} />);
    expect(container.querySelector("button, input, select, textarea")).toBeNull();
  });

  it("gives the cover image its alt text", () => {
    render(<BlogCard post={summaryWithImage} />);
    expect(screen.getByRole("img", { name: "DS-160 form on a laptop screen" })).toBeInTheDocument();
  });

  it("falls back to the post title for alt text when none is stored", () => {
    render(
      <BlogCard
        post={{ ...summaryWithImage, featuredImageAlt: undefined }}
      />
    );
    expect(
      screen.getByRole("img", { name: "How to Fill the DS-160 Form, Step by Step" })
    ).toBeInTheDocument();
  });

  it("renders a placeholder and no image when the post has no cover", () => {
    const { container } = render(<BlogCard post={summaryWithoutImage} />);
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("GRE or GMAT: Which Should You Take?")).toBeInTheDocument();
  });

  it("uses an h3 heading by default and an h2 when asked", () => {
    const { rerender } = render(<BlogCard post={summaryWithImage} />);
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "How to Fill the DS-160 Form, Step by Step"
    );

    rerender(<BlogCard post={summaryWithImage} headingLevel={2} />);
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });

  it("shows the category as a label, not a link", () => {
    render(<BlogCard post={summaryWithImage} />);
    const card = screen.getByRole("article");
    expect(within(card).getByText("Visa")).toBeInTheDocument();
    expect(within(card).getAllByRole("link")).toHaveLength(1);
  });

  it("shows the excerpt and reading time in the default variant", () => {
    render(<BlogCard post={summaryWithImage} />);
    expect(
      screen.getByText("A walkthrough of every section of the US visa application form.")
    ).toBeInTheDocument();
    expect(screen.getByText("6 min read")).toBeInTheDocument();
  });

  it("the featured variant shows a larger title, the excerpt and a read prompt", () => {
    render(<BlogCard post={summaryWithImage} variant="featured" />);
    expect(screen.getByText("Read article")).toBeInTheDocument();
    expect(
      screen.getByText("A walkthrough of every section of the US visa application form.")
    ).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/blogs/how-to-fill-the-ds-160-form"
    );
  });
});
