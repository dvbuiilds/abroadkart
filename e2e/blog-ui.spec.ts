import { test, expect } from "@playwright/test";

// Requires a running app with blog data imported (see crm_docs/BLOG_PHASE5_UI_PLAN.md §12).
// mba-vs-pgdm-guide has tables, five FAQs and several H2 sections.
const POST = "/blogs/mba-vs-pgdm-guide";
const TOC = 'nav[aria-label="Table of contents"]:visible';

test.describe("post page, desktop", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("a table-of-contents link scrolls below the navbar and is marked current", async ({ page }) => {
    await page.goto(POST);

    const heading = page.locator("article#article-body h2[id]").nth(1);
    const id = await heading.getAttribute("id");
    const link = page.locator(TOC).locator(`a[href="#${id}"]`);
    await link.click();

    await expect
      .poll(async () => (await heading.boundingBox())?.y ?? -1, { timeout: 5000 })
      .toBeGreaterThanOrEqual(64);
    await expect(link).toHaveAttribute("aria-current", "location");
  });

  test("copy link puts the post URL on the clipboard", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto(POST);

    await page.getByRole("button", { name: "Copy link" }).first().click();

    await expect(page.getByRole("button", { name: "Link copied" }).first()).toBeVisible();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toMatch(/\/blogs\/mba-vs-pgdm-guide$/);
  });

  test("the CTA opens the counselling form in a dialog and Escape closes it", async ({ page }) => {
    await page.goto(POST);

    await page.getByRole("button", { name: "Talk to a counsellor" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('input[name="email"]')).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("the sidebar form accepts an email and shows the success message", async ({ page }) => {
    await page.goto(POST);

    const form = page.locator("form:visible").first();
    await form.locator('input[name="email"]').fill(`e2e-${Date.now()}@example.com`);
    await form.getByRole("button", { name: "Request a callback" }).click();

    await expect(page.getByText("Thanks! A counsellor will be in touch soon.")).toBeVisible();
  });
});

test.describe("post page, mobile", () => {
  test.use({ viewport: { width: 393, height: 851 } });

  test("the table of contents opens from its disclosure", async ({ page }) => {
    await page.goto(POST);

    const disclosure = page.locator("details", { hasText: "On this page" });
    await disclosure.locator("summary").click();
    await expect(disclosure.locator("nav")).toBeVisible();
  });

  test("the page does not scroll sideways", async ({ page }) => {
    await page.goto(POST);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("the lead form sits after the article on small screens", async ({ page }) => {
    await page.goto(POST);

    const form = page.locator("form:visible").first();
    await expect(form).toBeVisible();
    const formY = (await form.boundingBox())?.y ?? 0;
    const faqY = (await page.locator("#faq").boundingBox())?.y ?? 0;
    expect(formY).toBeGreaterThan(faqY);
  });
});

test.describe("index and listing pages", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("the category chips show All as the current page", async ({ page }) => {
    await page.goto("/blogs");
    const chips = page.getByRole("navigation", { name: "Blog categories" });
    await expect(chips.getByRole("link", { name: "All" })).toHaveAttribute("aria-current", "page");
  });

  test("pagination moves to page 2", async ({ page }) => {
    await page.goto("/blogs");
    await page.getByRole("navigation", { name: "Pagination" }).getByRole("link", { name: "2", exact: true }).click();

    await expect(page).toHaveURL(/\/blogs\?page=2$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("a page past the last one is not found", async ({ page }) => {
    const response = await page.goto("/blogs?page=99");
    expect(response?.status()).toBe(404);
  });

  test("the draft post is not found", async ({ page }) => {
    // The one draft in the WordPress export (post 21126). It must never render publicly.
    const response = await page.goto("/blogs/f-1-visa-application-timeline-when-to-apply-and-why-it-matters");
    expect(response?.status()).toBe(404);
  });
});
