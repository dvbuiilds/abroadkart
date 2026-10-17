import { JSDOM } from "jsdom";

// One window for the whole run: creating a JSDOM per call leaks memory across 100+ posts.
const { document: host } = new JSDOM("").window;

/** Parses an HTML fragment into a detached document and returns its <body>. */
export function parseBody(html: string): HTMLElement {
  const doc = host.implementation.createHTMLDocument("");
  doc.body.innerHTML = html;
  return doc.body;
}
