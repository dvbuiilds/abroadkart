import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ShareBar } from "../ShareBar";
import { CopyLinkButton } from "../CopyLinkButton";

vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));

const url = "https://abroadkart.com/blogs/visa-tips";
const title = "Visa tips: DS-160 & B1/B2?";

describe("ShareBar", () => {
  it("offers copy link, WhatsApp, LinkedIn and X in that order", () => {
    const { container } = render(<ShareBar url={url} title={title} />);
    const labels = Array.from(container.querySelectorAll("button[aria-label], a[aria-label]")).map(
      (el) => el.getAttribute("aria-label")
    );
    expect(labels).toEqual(["Copy link", "Share on WhatsApp", "Share on LinkedIn", "Share on X"]);
  });

  it("opens each share link in a new tab with a safe rel", () => {
    render(<ShareBar url={url} title={title} />);
    for (const name of ["Share on WhatsApp", "Share on LinkedIn", "Share on X"]) {
      const link = screen.getByRole("link", { name });
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("encodes the title so & and ? do not break the share URL", () => {
    render(<ShareBar url={url} title={title} />);
    const x = new URL(screen.getByRole("link", { name: "Share on X" }).getAttribute("href")!);
    expect(x.searchParams.get("text")).toBe(title);
    expect(x.searchParams.get("url")).toBe(url);
  });

  it("shows a visible label when given", () => {
    render(<ShareBar url={url} title={title} label="Share this article" />);
    expect(screen.getByText("Share this article")).toBeInTheDocument();
  });
});

describe("CopyLinkButton", () => {
  const writeText = vi.fn();

  beforeEach(() => {
    writeText.mockReset().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
  });

  // fireEvent rather than userEvent: userEvent replaces navigator.clipboard on setup.
  it("copies the canonical URL when clicked", async () => {
    render(<CopyLinkButton url={url} />);

    fireEvent.click(screen.getByRole("button", { name: "Copy link" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(url));
  });

  it("confirms the copy in its label", async () => {
    render(<CopyLinkButton url={url} />);

    fireEvent.click(screen.getByRole("button", { name: "Copy link" }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Link copied" })).toBeInTheDocument()
    );
  });
});
