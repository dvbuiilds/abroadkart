import { test, expect } from "@playwright/test";

test("public about page renders its heading inside the main landmark", async ({
  page,
}) => {
  const response = await page.goto("/about");
  expect(response?.status()).toBe(200);

  await expect(page.getByRole("heading", { level: 1, name: "About Us" })).toBeVisible();
  await expect(page.getByRole("main")).toBeVisible();
});
