import { test, expect } from "@playwright/test";
import { categories } from "./helpers/source";
import { parseDocument } from "./helpers/text";
// The approved text is the single source for category descriptions (keystone/seeds/blog-import).
import { CATEGORY_DESCRIPTIONS } from "../keystone/seeds/blog-import/categoryDescriptions";

// Every category page must show its approved description in two places: the
// hero intro and <meta name="description">. Without the import re-run the
// pages fall back to "Articles about X.", and this spec fails.

test.describe.configure({ mode: "parallel" });

for (const category of categories) {
  test(`${category.slug} shows its approved description`, async ({ request }) => {
    const approved = CATEGORY_DESCRIPTIONS[category.slug];
    expect(approved, `overlay has ${category.slug}`).toBeTruthy();

    const response = await request.get(`/blogs/category/${category.slug}`);
    expect(response.status()).toBe(200);
    const doc = parseDocument(await response.text());

    const meta = doc.querySelector('meta[name="description"]')?.getAttribute("content");
    expect(meta).toBe(approved);

    const bodyText = doc.body.textContent ?? "";
    expect(bodyText).toContain(approved);
    expect(bodyText).not.toContain(`Articles about ${category.name}.`);
  });
}
