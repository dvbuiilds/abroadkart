import { describe, it, expect } from "vitest";
import { shouldRenderFaqSection } from "../faq";

const faq = {
  order: 0,
  question: "What is the difference between an MBA and a PGDM?",
  answer: "An MBA is a degree. A PGDM is a diploma.",
};

describe("shouldRenderFaqSection", () => {
  it("is false when the post has no FAQs", () => {
    expect(
      shouldRenderFaqSection({ faqs: [], contentHtml: "<p>Body</p>" })
    ).toBe(false);
  });

  it("is true when FAQs exist and the body does not repeat them", () => {
    expect(
      shouldRenderFaqSection({ faqs: [faq], contentHtml: "<p>Body</p>" })
    ).toBe(true);
  });

  it("is false when the body already contains the first question", () => {
    expect(
      shouldRenderFaqSection({
        faqs: [faq],
        contentHtml: `<h2>FAQ</h2><p>${faq.question}</p><p>${faq.answer}</p>`,
      })
    ).toBe(false);
  });
});
