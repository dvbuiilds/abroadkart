import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FaqSection } from "../FaqSection";
import { faqs } from "./fixtures";

describe("FaqSection", () => {
  it("renders a native details element for each question", () => {
    const { container } = render(<FaqSection faqs={faqs} />);
    expect(container.querySelectorAll("details")).toHaveLength(faqs.length);
  });

  it("starts with every item closed", () => {
    const { container } = render(<FaqSection faqs={faqs} />);
    expect(container.querySelectorAll("details[open]")).toHaveLength(0);
  });

  it("keeps every answer in the DOM while closed, so crawlers can read it", () => {
    const { container } = render(<FaqSection faqs={faqs} />);
    for (const faq of faqs) {
      expect(container.textContent).toContain(faq.answer);
    }
  });

  it("titles the section with an H2 that the TOC can link to", () => {
    render(<FaqSection faqs={faqs} />);
    const heading = screen.getByRole("heading", {
      level: 2,
      name: "Frequently Asked Questions",
    });
    expect(heading).toHaveAttribute("id", "faq");
  });

  it("shows questions in the order they were given", () => {
    const { container } = render(<FaqSection faqs={faqs} />);
    const summaries = Array.from(container.querySelectorAll("summary")).map((s) =>
      s.textContent?.trim()
    );
    expect(summaries).toEqual(faqs.map((f) => f.question));
  });

  it("renders HTML answers as formatting, without the source classes", () => {
    const html = [
      {
        order: 0,
        question: "Is it free?",
        answer: '<div class="flex w-full"><p class="p1">Yes, <strong>mostly</strong>.</p><p>Check fees.</p></div>',
      },
    ];
    const { container } = render(<FaqSection faqs={html} />);
    const paragraphs = container.querySelectorAll("details p");
    expect(paragraphs).toHaveLength(2);
    paragraphs.forEach((p) => expect(p).not.toHaveAttribute("class"));
    expect(container.querySelector("details strong")).toHaveTextContent("mostly");
    expect(container.querySelector("details div.flex")).toBeNull();
  });

  it("renders nothing when there are no FAQs", () => {
    const { container } = render(<FaqSection faqs={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
