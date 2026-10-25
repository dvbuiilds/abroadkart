import { parseBody } from "./dom";

/**
 * Markup-only cleanup: strips class/style attributes and unwraps div/article wrappers
 * (the leftover ChatGPT DOM in one post). Text, headings, ids and hrefs are untouched.
 */
export function sanitizeContent(html: string): string {
  const body = parseBody(html);

  for (const el of Array.from(body.querySelectorAll("div,article"))) {
    el.replaceWith(...Array.from(el.childNodes));
  }
  for (const el of Array.from(body.querySelectorAll("[class],[style]"))) {
    el.removeAttribute("class");
    el.removeAttribute("style");
  }
  return body.innerHTML;
}
