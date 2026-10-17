import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LeadForm } from "../LeadForm";

const mockFetch = vi.fn();

function respondWith(status: number, body: unknown = { ok: true }) {
  mockFetch.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

function sentPayload() {
  return JSON.parse(mockFetch.mock.calls[0][1].body);
}

describe("LeadForm", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    vi.stubGlobal("fetch", mockFetch);
    window.history.pushState({}, "", "/blogs/visa-tips");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete (window as { gtag?: unknown }).gtag;
    window.history.pushState({}, "", "/");
  });

  describe("validation", () => {
    it("blocks submission without an email and does not call the server", async () => {
      const user = userEvent.setup();
      render(<LeadForm sourceSlug="visa-tips" />);

      await user.click(screen.getByRole("button", { name: "Request a callback" }));

      expect(await screen.findByText("Email is required")).toBeInTheDocument();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("shows an error for a malformed email", async () => {
      const user = userEvent.setup();
      render(<LeadForm sourceSlug="visa-tips" />);

      await user.type(screen.getByLabelText(/Email/), "not-an-email");
      await user.click(screen.getByRole("button", { name: "Request a callback" }));

      expect(await screen.findByText("Enter a valid email address")).toBeInTheDocument();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("marks the email input invalid and links the error to it", async () => {
      const user = userEvent.setup();
      render(<LeadForm sourceSlug="visa-tips" />);

      await user.click(screen.getByRole("button", { name: "Request a callback" }));

      const email = await screen.findByLabelText(/Email/);
      expect(email).toHaveAttribute("aria-invalid", "true");
      const error = screen.getByText("Email is required");
      expect(email).toHaveAttribute("aria-describedby", expect.stringContaining(error.id));
    });
  });

  describe("submission", () => {
    it("posts the payload with source and UTM data from the URL", async () => {
      window.history.pushState({}, "", "/blogs/visa-tips?utm_source=google&utm_medium=cpc&utm_campaign=spring");
      respondWith(201, { ok: true, email: "student@example.com" });
      const user = userEvent.setup();
      render(<LeadForm sourceSlug="visa-tips" />);

      await user.type(screen.getByLabelText(/Email/), "student@example.com");
      await user.type(screen.getByLabelText("Name"), "Asha");
      await user.click(screen.getByRole("button", { name: "Request a callback" }));

      await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
      expect(mockFetch.mock.calls[0][0]).toBe("/api/blog-leads");
      expect(mockFetch.mock.calls[0][1].method).toBe("POST");
      expect(sentPayload()).toMatchObject({
        email: "student@example.com",
        name: "Asha",
        sourceSlug: "visa-tips",
        sourceUrl: `${window.location.origin}/blogs/visa-tips`,
        utmSource: "google",
        utmMedium: "cpc",
        utmCampaign: "spring",
      });
    });

    it("shows a success message after a 201", async () => {
      respondWith(201, { ok: true, email: "student@example.com" });
      const user = userEvent.setup();
      render(<LeadForm sourceSlug="visa-tips" />);

      await user.type(screen.getByLabelText(/Email/), "student@example.com");
      await user.click(screen.getByRole("button", { name: "Request a callback" }));

      expect(
        await screen.findByText("Thanks! A counsellor will be in touch soon.")
      ).toBeInTheDocument();
    });

    it("keeps the entered values and shows an alert when the server fails", async () => {
      respondWith(502, { ok: false });
      const user = userEvent.setup();
      render(<LeadForm sourceSlug="visa-tips" />);

      await user.type(screen.getByLabelText(/Email/), "student@example.com");
      await user.click(screen.getByRole("button", { name: "Request a callback" }));

      expect(
        await screen.findByRole("alert")
      ).toHaveTextContent("Something went wrong. Please try again.");
      expect(screen.getByLabelText(/Email/)).toHaveValue("student@example.com");
    });

    it("explains the rate limit when the server returns 429", async () => {
      respondWith(429, { ok: false });
      const user = userEvent.setup();
      render(<LeadForm sourceSlug="visa-tips" />);

      await user.type(screen.getByLabelText(/Email/), "student@example.com");
      await user.click(screen.getByRole("button", { name: "Request a callback" }));

      expect(
        await screen.findByText("Too many attempts — please try again in a few minutes.")
      ).toBeInTheDocument();
    });

    it("records a generate_lead conversion when gtag is available", async () => {
      respondWith(201, { ok: true, email: "student@example.com" });
      const gtag = vi.fn();
      (window as { gtag?: unknown }).gtag = gtag;
      const user = userEvent.setup();
      render(<LeadForm sourceSlug="visa-tips" />);

      await user.type(screen.getByLabelText(/Email/), "student@example.com");
      await user.click(screen.getByRole("button", { name: "Request a callback" }));

      await screen.findByText("Thanks! A counsellor will be in touch soon.");
      expect(gtag).toHaveBeenCalledWith("event", "generate_lead", { source_slug: "visa-tips" });
    });
  });

  describe("honeypot", () => {
    it("is not reachable by users through the accessibility tree", () => {
      render(<LeadForm sourceSlug="visa-tips" />);
      expect(screen.queryByRole("textbox", { name: "Website" })).toBeNull();
    });

    it("is excluded from keyboard focus", () => {
      const { container } = render(<LeadForm sourceSlug="visa-tips" />);
      const trap = container.querySelector<HTMLInputElement>('input[name="website"]');
      expect(trap).not.toBeNull();
      expect(trap).toHaveAttribute("tabindex", "-1");
    });
  });

  it("gives two forms on one page distinct field ids", () => {
    const { container } = render(
      <>
        <LeadForm sourceSlug="a" />
        <LeadForm sourceSlug="b" />
      </>
    );
    const ids = Array.from(container.querySelectorAll<HTMLInputElement>('input[name="email"]')).map(
      (input) => input.id
    );
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
    expect(within(container).getAllByLabelText(/Email/)).toHaveLength(2);
  });
});
