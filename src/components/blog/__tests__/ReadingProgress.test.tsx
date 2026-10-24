import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ReadingProgress } from "../ReadingProgress";

describe("ReadingProgress", () => {
  it("is a decorative bar, hidden from assistive technology", () => {
    const { container } = render(<ReadingProgress />);
    const bar = container.querySelector(".reading-progress");
    expect(bar).not.toBeNull();
    expect(bar).toHaveAttribute("aria-hidden", "true");
  });

  it("contains no text, so it cannot affect article text fidelity", () => {
    const { container } = render(<ReadingProgress />);
    expect(container.textContent).toBe("");
  });
});
