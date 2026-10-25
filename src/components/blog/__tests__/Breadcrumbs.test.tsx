import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { Breadcrumbs } from "../Breadcrumbs";

const items = [
  { label: "Home", href: "/" },
  { label: "Blogs", href: "/blogs" },
  { label: "How to Fill the DS-160 Form" },
];

describe("Breadcrumbs", () => {
  it("renders inside a labelled breadcrumb navigation", () => {
    render(<Breadcrumbs items={items} />);
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
  });

  it("links every crumb that has an href", () => {
    render(<Breadcrumbs items={items} />);
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(nav).getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(within(nav).getByRole("link", { name: "Blogs" })).toHaveAttribute("href", "/blogs");
  });

  it("marks the last crumb as the current page and does not link it", () => {
    render(<Breadcrumbs items={items} />);
    const current = screen.getByText("How to Fill the DS-160 Form");
    expect(current).toHaveAttribute("aria-current", "page");
    expect(current.closest("a")).toBeNull();
  });

  it("hides the separator icons from assistive technology", () => {
    const { container } = render(<Breadcrumbs items={items} />);
    const separators = container.querySelectorAll("svg[aria-hidden='true']");
    expect(separators).toHaveLength(items.length - 1);
  });
});
