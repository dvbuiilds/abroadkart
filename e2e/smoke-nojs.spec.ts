import { test, expect } from "@playwright/test";

// Runs only in the `chromium-nojs` project (JavaScript disabled).
// Proves that the server-rendered HTML already contains the content.
test("about page content is present in the HTML without JavaScript", async ({
  page,
}) => {
  const response = await page.goto("/about");
  expect(response?.status()).toBe(200);

  const html = await page.content();
  expect(html).toContain("About Us");
  expect(html).toContain("One-Stop Solution for Studying Abroad");
});
