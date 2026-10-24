import { JSDOM } from "jsdom";

const { document: host } = new JSDOM("").window;

/**
 * Visible text of an HTML fragment, with every whitespace run removed.
 *
 * Whitespace is dropped entirely, not collapsed to one space. The WordPress
 * table cells differ from the rendered output only by whitespace between cells,
 * so an exact compare would fail for the 26 table posts by design. Every word
 * and character of text is still compared.
 */
export function comparableText(html: string): string {
  const doc = host.implementation.createHTMLDocument("");
  doc.body.innerHTML = html;
  return (doc.body.textContent ?? "").replace(/\s+/g, "");
}

/** Parses a full page's HTML. Scripts are not run. */
export function parseDocument(html: string): Document {
  return new JSDOM(html).window.document;
}

/** Plain text of an HTML fragment, decoded, with whitespace collapsed for display. */
export function plainText(html: string): string {
  const doc = host.implementation.createHTMLDocument("");
  doc.body.innerHTML = html;
  return (doc.body.textContent ?? "").replace(/\s+/g, " ").trim();
}
