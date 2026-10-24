import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BlogError } from "../BlogError";

describe("BlogError", () => {
  it("explains the problem and offers a retry", () => {
    render(<BlogError error={new Error("keystone down")} reset={() => {}} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/couldn.t load/i);
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("calls reset when the retry button is pressed", () => {
    const reset = vi.fn();
    render(<BlogError error={new Error("boom")} reset={reset} />);
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("links back to the blog index so the reader has a way forward", () => {
    render(<BlogError error={new Error("boom")} reset={() => {}} />);
    expect(screen.getByRole("link", { name: /all articles/i })).toHaveAttribute("href", "/blogs");
  });

  it("never shows the raw error message to readers", () => {
    render(<BlogError error={new Error("ECONNREFUSED 10.0.0.5:3001")} reset={() => {}} />);
    expect(screen.queryByText(/ECONNREFUSED/)).toBeNull();
  });
});
