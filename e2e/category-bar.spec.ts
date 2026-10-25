import { test, expect, type Page } from "@playwright/test";
import { categories } from "./helpers/source";

// The category bar must not move between categories, its chips must line up,
// and a chip click must keep the row and the scroll position instead of
// returning to the top of the page.

const BAR = 'nav[aria-label="Blog categories"]';
const ROW = `${BAR} ul`;
const paths = ["/blogs", ...categories.map((category) => `/blogs/category/${category.slug}`)];

async function barTop(page: Page, path: string): Promise<number> {
  await page.goto(path);
  const box = await page.locator(BAR).boundingBox();
  if (!box) throw new Error(`no category bar on ${path}`);
  return Math.round(box.y);
}

for (const width of [393, 768, 1440]) {
  test(`the category bar sits at one height on every listing at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const tops = new Map<string, number>();
    for (const path of paths) tops.set(path, await barTop(page, path));

    expect(new Set(tops.values()).size, JSON.stringify([...tops])).toBe(1);
  });
}

test("All and a category chip share the same top and height", async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 900 });
  await page.goto("/blogs/category/visa");

  const all = await page.getByRole("link", { name: "All" }).boundingBox();
  const counselling = await page.getByRole("link", { name: /Counselling/ }).boundingBox();
  expect(all).not.toBeNull();
  expect(counselling).not.toBeNull();
  expect(Math.round(all!.y)).toBe(Math.round(counselling!.y));
  expect(Math.round(all!.height)).toBe(Math.round(counselling!.height));
});

test("the row keeps its fold after a click, and the page does not reload", async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 900 });
  await page.goto("/blogs/category/visa");

  const row = page.locator(ROW);
  await row.evaluate((el) => {
    el.scrollLeft = el.scrollWidth;
  });
  const before = await row.evaluate((el) => el.scrollLeft);
  expect(before).toBeGreaterThan(0);

  // A marker on window survives a client-side navigation and is lost on a reload.
  await page.evaluate(() => {
    (window as unknown as { __marker: number }).__marker = 1;
  });
  await page.getByRole("link", { name: /Work Experience/ }).click();
  await page.waitForURL("**/blogs/category/work-experience");

  await expect(page.locator(BAR).getByRole("link", { name: /Work Experience/ })).toHaveAttribute(
    "aria-current",
    "page",
  );
  expect(await page.evaluate(() => (window as unknown as { __marker?: number }).__marker)).toBe(1);

  const after = await row.evaluate((el) => {
    const active = el.querySelector<HTMLElement>('[aria-current="page"]')!.getBoundingClientRect();
    const rowBox = el.getBoundingClientRect();
    return {
      scrollLeft: el.scrollLeft,
      activeInside: active.left >= rowBox.left && active.right <= rowBox.right,
    };
  });
  expect(after.scrollLeft).toBeGreaterThan(0);
  expect(after.activeInside).toBe(true);
});

test("a chip click keeps the results in view under the bar, not at the top", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/blogs");
  await page.evaluate(() => window.scrollTo(0, 1200));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(1000);

  await page.locator(BAR).getByRole("link", { name: /Visa/ }).click();
  await page.waitForURL("**/blogs/category/visa");

  const barY = async () => Math.round((await page.locator(BAR).boundingBox())?.y ?? -1);
  await expect.poll(barY, { timeout: 5000 }).toBeGreaterThanOrEqual(74);
  expect(await barY()).toBeLessThanOrEqual(78);
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(300);
});
