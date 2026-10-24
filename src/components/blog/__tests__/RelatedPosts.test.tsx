import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RelatedPosts } from "../RelatedPosts";
import { summaryWithImage, summaryWithoutImage, visaCategory } from "./fixtures";

vi.mock("next/image", () => ({
  default: (props: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element -- the mock stands in for next/image
    <img src={props.src} alt={props.alt} />
  ),
}));

describe("RelatedPosts", () => {
  it("renders a Keep reading heading above the cards", () => {
    render(<RelatedPosts posts={[summaryWithImage, summaryWithoutImage]} />);
    expect(screen.getByRole("heading", { level: 2, name: "Keep reading" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(2);
  });

  it("links to the category archive when a category is given", () => {
    render(<RelatedPosts posts={[summaryWithImage]} category={visaCategory} />);
    expect(screen.getByRole("link", { name: /View all in Visa/ })).toHaveAttribute(
      "href",
      "/blogs/category/visa"
    );
  });

  it("renders nothing when there are no related posts", () => {
    const { container } = render(<RelatedPosts posts={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
