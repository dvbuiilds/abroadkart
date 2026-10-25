import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CategoryChip } from "../CategoryChip";
import { visaCategory } from "./fixtures";

describe("CategoryChip", () => {
  it("links to the category archive by default", () => {
    render(<CategoryChip category={visaCategory} />);
    expect(screen.getByRole("link", { name: "Visa" })).toHaveAttribute(
      "href",
      "/blogs/category/visa"
    );
  });

  it("renders as a plain label when asked, so it can sit inside another link", () => {
    render(<CategoryChip category={visaCategory} as="span" />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("Visa")).toBeInTheDocument();
  });
});
