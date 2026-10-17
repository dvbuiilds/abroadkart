import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { Pagination } from "../Pagination";

describe("Pagination", () => {
  it("renders nothing when there is only one page", () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} basePath="/blogs" />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("sits inside a labelled navigation", () => {
    render(<Pagination page={2} totalPages={10} basePath="/blogs" />);
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
  });

  it("links page 1 to the bare path, never ?page=1", () => {
    render(<Pagination page={3} totalPages={10} basePath="/blogs" />);
    const nav = screen.getByRole("navigation", { name: "Pagination" });
    expect(within(nav).getByRole("link", { name: "1" })).toHaveAttribute("href", "/blogs");
  });

  it("links other pages with ?page=N", () => {
    render(<Pagination page={3} totalPages={10} basePath="/blogs" />);
    const nav = screen.getByRole("navigation", { name: "Pagination" });
    expect(within(nav).getByRole("link", { name: "4" })).toHaveAttribute("href", "/blogs?page=4");
  });

  it("marks the current page with aria-current", () => {
    render(<Pagination page={3} totalPages={10} basePath="/blogs" />);
    const nav = screen.getByRole("navigation", { name: "Pagination" });
    expect(within(nav).getByRole("link", { name: "3" })).toHaveAttribute("aria-current", "page");
  });

  it("disables Previous on the first page", () => {
    render(<Pagination page={1} totalPages={10} basePath="/blogs" />);
    const prev = screen.getByText("Previous").closest("[aria-disabled]");
    expect(prev).toHaveAttribute("aria-disabled", "true");
    expect(prev?.tagName).not.toBe("A");
  });

  it("disables Next on the last page", () => {
    render(<Pagination page={10} totalPages={10} basePath="/blogs" />);
    const next = screen.getByText("Next").closest("[aria-disabled]");
    expect(next).toHaveAttribute("aria-disabled", "true");
  });

  it("links Previous and Next when they exist", () => {
    render(<Pagination page={5} totalPages={10} basePath="/blogs/category/visa" />);
    expect(screen.getByRole("link", { name: /Previous/ })).toHaveAttribute(
      "href",
      "/blogs/category/visa?page=4"
    );
    expect(screen.getByRole("link", { name: /Next/ })).toHaveAttribute(
      "href",
      "/blogs/category/visa?page=6"
    );
  });

  it("shows gaps as ellipses", () => {
    render(<Pagination page={5} totalPages={10} basePath="/blogs" />);
    expect(screen.getAllByText("…")).toHaveLength(2);
  });
});
