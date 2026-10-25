import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { TableOfContents } from "../TableOfContents";
import { buildToc } from "@app/lib/blog/toc";
import type { Heading } from "@app/lib/blog/types";

const headings: Heading[] = [
  { level: 2, text: "Decoding the Terminologies", id: "decoding" },
  { level: 3, text: "Beyond the Label", id: "beyond" },
  { level: 4, text: "A detail", id: "detail" },
  { level: 5, text: "Small print", id: "small" },
  { level: 2, text: "Funding Your Studies", id: "funding" },
];

const toc = buildToc(headings);

describe("TableOfContents", () => {
  it("sits inside a labelled navigation", () => {
    render(<TableOfContents items={toc} variant="sidebar" />);
    expect(screen.getByRole("navigation", { name: "Table of contents" })).toBeInTheDocument();
  });

  it("links each entry to its heading with a hash href", () => {
    render(<TableOfContents items={toc} variant="sidebar" />);
    const nav = screen.getByRole("navigation", { name: "Table of contents" });
    expect(within(nav).getByRole("link", { name: "Decoding the Terminologies" })).toHaveAttribute(
      "href",
      "#decoding"
    );
    expect(within(nav).getByRole("link", { name: "Beyond the Label" })).toHaveAttribute(
      "href",
      "#beyond"
    );
  });

  it("nests H3 entries inside their parent H2 list", () => {
    render(<TableOfContents items={toc} variant="sidebar" />);
    const nav = screen.getByRole("navigation", { name: "Table of contents" });
    const nested = nav.querySelector("li > ol > li > a[href='#beyond']");
    expect(nested).not.toBeNull();
  });

  it("does not list H4 or H5 headings", () => {
    render(<TableOfContents items={toc} variant="sidebar" />);
    const nav = screen.getByRole("navigation", { name: "Table of contents" });
    expect(within(nav).queryByText("A detail")).toBeNull();
    expect(within(nav).queryByText("Small print")).toBeNull();
  });

  it("includes the FAQ entry only when it is passed in", () => {
    const { rerender } = render(<TableOfContents items={toc} variant="sidebar" />);
    expect(screen.queryByRole("link", { name: "FAQs" })).toBeNull();

    rerender(
      <TableOfContents items={[...toc, { level: 2, text: "FAQs", id: "faq" }]} variant="sidebar" />
    );
    expect(screen.getByRole("link", { name: "FAQs" })).toHaveAttribute("href", "#faq");
  });

  it("renders the inline variant as a disclosure with the section count", () => {
    const { container } = render(<TableOfContents items={toc} variant="inline" />);
    const details = container.querySelector("details");
    expect(details).not.toBeNull();
    expect(details?.querySelector("summary")).toHaveTextContent("On this page · 2 sections");
    expect(within(details as HTMLElement).getByRole("navigation", { name: "Table of contents" })).toBeInTheDocument();
  });

  it("renders nothing when there are no entries", () => {
    const { container } = render(<TableOfContents items={[]} variant="sidebar" />);
    expect(container).toBeEmptyDOMElement();
  });
});
