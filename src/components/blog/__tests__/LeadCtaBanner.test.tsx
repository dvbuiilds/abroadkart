import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LeadCtaBanner } from "../LeadCtaBanner";

describe("LeadCtaBanner", () => {
  it("shows the counselling prompt with a button", () => {
    render(<LeadCtaBanner sourceSlug="visa-tips" />);
    expect(screen.getByRole("heading", { name: "Planning to study abroad?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Talk to a counsellor" })).toBeInTheDocument();
  });

  it("opens the lead form in a dialog and closes it with Escape", async () => {
    const user = userEvent.setup();
    render(<LeadCtaBanner sourceSlug="visa-tips" />);

    await user.click(screen.getByRole("button", { name: "Talk to a counsellor" }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog.querySelector('input[name="email"]')).not.toBeNull();

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});
