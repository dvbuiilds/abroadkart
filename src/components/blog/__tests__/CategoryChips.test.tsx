import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { CategoryChips } from "../CategoryChips";
import { counsellingCategory, visaCategory } from "./fixtures";

const categories = [counsellingCategory, visaCategory];

describe("CategoryChips", () => {
  it("sits inside a labelled navigation", () => {
    render(<CategoryChips categories={categories} />);
    expect(screen.getByRole("navigation", { name: "Blog categories" })).toBeInTheDocument();
  });

  it("starts with an All link to the index", () => {
    render(<CategoryChips categories={categories} />);
    const nav = screen.getByRole("navigation", { name: "Blog categories" });
    expect(within(nav).getByRole("link", { name: "All" })).toHaveAttribute("href", "/blogs");
  });

  it("links each category to its archive", () => {
    render(<CategoryChips categories={categories} />);
    const nav = screen.getByRole("navigation", { name: "Blog categories" });
    expect(within(nav).getByRole("link", { name: /Visa/ })).toHaveAttribute(
      "href",
      "/blogs/category/visa"
    );
  });

  it("marks All as the current page when no category is active", () => {
    render(<CategoryChips categories={categories} />);
    expect(screen.getByRole("link", { name: "All" })).toHaveAttribute("aria-current", "page");
  });

  it("marks the active category as the current page and All as not", () => {
    render(<CategoryChips categories={categories} activeSlug="visa" />);
    expect(screen.getByRole("link", { name: /Visa/ })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "All" })).not.toHaveAttribute("aria-current");
  });

  it("shows the post count next to each category", () => {
    render(<CategoryChips categories={categories} />);
    expect(screen.getByRole("link", { name: /Counselling/ })).toHaveTextContent("20");
    expect(screen.getByRole("link", { name: /Visa/ })).toHaveTextContent("7");
  });

  it("lays out All and every category chip the same way, with a border", () => {
    render(<CategoryChips categories={categories} activeSlug="visa" />);
    const nav = screen.getByRole("navigation", { name: "Blog categories" });
    for (const link of within(nav).getAllByRole("link")) {
      expect(link).toHaveClass("inline-flex", "items-center", "border");
    }
  });

  it("renders the post count in gray-500, which meets text contrast", () => {
    render(<CategoryChips categories={categories} />);
    const count = screen.getByRole("link", { name: /Counselling/ }).querySelector("span");
    expect(count).toHaveClass("text-gray-500");
    expect(count).not.toHaveClass("text-gray-400");
  });
});
