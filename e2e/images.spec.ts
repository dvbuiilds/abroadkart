import { test, expect, type APIRequestContext } from "@playwright/test";
import { published, categories } from "./helpers/source";

// Featured images (plan §7, open item 1). Every post's cover image must load and
// every card image on the listing pages must resolve. The images come from the
// public CDN, so a missing upload or a missing custom domain shows up here.

const EXPECTED_HOST = "cdn.abroadkart.com";

/** Next/image wraps the CDN URL: /_next/image?url=<encoded>&w=...; unwrap it. */
function originalSrc(src: string): string {
  if (!src.startsWith("/_next/image")) return src;
  return new URL(src, "http://local").searchParams.get("url") ?? src;
}

async function expectImageResolves(request: APIRequestContext, src: string) {
  const url = originalSrc(src);
  expect(new URL(url).host, url).toBe(EXPECTED_HOST);
  const response = await request.get(url);
  expect(response.status(), url).toBe(200);
  expect(response.headers()["content-type"], url).toMatch(/^image\//);
}

test.describe("blog images", () => {
  test.describe.configure({ mode: "parallel" });

  for (const post of published) {
    test(`${post.slug}: hero image renders and og:image resolves`, async ({ page, request }) => {
      await page.goto(`/blogs/${post.slug}`, { waitUntil: "load" });

      const hero = page.locator("figure img").first();
      await expect(hero).toBeVisible();
      await expect
        .poll(() => hero.evaluate((img: HTMLImageElement) => img.naturalWidth), {
          message: "hero image did not load",
        })
        .toBeGreaterThan(0);

      const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
      expect(ogImage, "og:image is set").toBeTruthy();
      await expectImageResolves(request, ogImage!);
    });
  }

  test("every card image on /blogs resolves", async ({ page, request }) => {
    await page.goto("/blogs", { waitUntil: "load" });
    const srcs = await collectImageSrcs(page);
    expect(srcs.length, "cards are rendered").toBeGreaterThan(0);
    for (const src of srcs) await expectImageResolves(request, src);
  });

  for (const category of categories) {
    test(`every card image on /blogs/category/${category.slug} resolves`, async ({ page, request }) => {
      await page.goto(`/blogs/category/${category.slug}`, { waitUntil: "load" });
      const srcs = await collectImageSrcs(page);
      for (const src of srcs) await expectImageResolves(request, src);
    });
  }
});

/** Every image in the listing grid, including the ones lazy-loading would skip. */
async function collectImageSrcs(page: import("@playwright/test").Page): Promise<string[]> {
  return page.locator("main img").evaluateAll((imgs) =>
    imgs.map((img) => img.getAttribute("src") ?? "").filter(Boolean),
  );
}
