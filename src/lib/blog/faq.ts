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
