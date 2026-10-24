import { htmlToDOM, type DOMNode, type Element, type Text } from "html-react-parser";
import type { Faq } from "./types";

/**
 * Whether to render the FAQ section under the article.
 *
 * Some legacy posts already print their first FAQ question in the body. Showing
 * the section again would duplicate the text, so it is hidden in that case.
 */
export function shouldRenderFaqSection(post: {
  faqs: Faq[];
  contentHtml: string;
}): boolean {
  if (post.faqs.length === 0) return false;
  return !post.contentHtml.includes(post.faqs[0].question);
}

const BLOCK_TAGS = new Set([
  "p", "div", "li", "ul", "ol", "br", "h1", "h2", "h3", "h4", "h5", "h6",
  "tr", "td", "th", "table", "section", "blockquote",
]);

function collectText(nodes: DOMNode[], parts: string[]) {
  for (const node of nodes) {
    if (node.type === "text") {
      parts.push((node as Text).data);
    } else if (node.type === "tag") {
      const element = node as Element;
      const isBlock = BLOCK_TAGS.has(element.name);
      if (isBlock) parts.push(" ");
      collectText(element.children as DOMNode[], parts);
      if (isBlock) parts.push(" ");
    }
  }
}

/**
 * The visible text of an FAQ answer. Answers are stored as HTML fragments, so
 * the structured data uses this text, which keeps FAQPage in step with what the
 * reader sees. Paragraph breaks become spaces, and whitespace is collapsed.
 */
export function answerToPlainText(html: string): string {
  if (!html) return "";
  const parts: string[] = [];
  collectText(htmlToDOM(html) as DOMNode[], parts);
  return parts.join("").replace(/\s+/g, " ").trim();
}
