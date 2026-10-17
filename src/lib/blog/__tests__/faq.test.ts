import { describe, it, expect } from "vitest";
import { answerToPlainText, shouldRenderFaqSection } from "../faq";

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

describe("answerToPlainText", () => {
  it("returns plain text unchanged", () => {
    expect(answerToPlainText("An MBA is a degree.")).toBe("An MBA is a degree.");
  });

  it("removes markup and keeps the words", () => {
    expect(answerToPlainText('<p class="p1">Yes, <strong>most</strong> banks.</p>')).toBe(
      "Yes, most banks."
    );
  });

  it("decodes HTML entities", () => {
    expect(answerToPlainText("<p>Tom &amp; Jerry</p>")).toBe("Tom & Jerry");
  });

  it("separates paragraphs so their words do not run together", () => {
    expect(answerToPlainText("<p>First.</p><p>Second.</p>")).toBe("First. Second.");
  });

  it("drops wrapper elements and collapses whitespace", () => {
    expect(answerToPlainText('<div class="x">\n  <span>One</span>   two\n</div>')).toBe(
      "One two"
    );
  });

  it("returns an empty string for empty input", () => {
    expect(answerToPlainText("")).toBe("");
  });
});
