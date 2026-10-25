import { defineConfig, devices } from "@playwright/test";

// E2E runs against `next start`, so `yarn build` must run first.
// Set E2E_BASE_URL to point the suite at another host (e.g. production).
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 4,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /smoke-nojs\.spec\.ts/,
    },
    {
      name: "chromium-nojs",
      use: { ...devices["Desktop Chrome"], javaScriptEnabled: false },
      testMatch: /(crawlability|smoke-nojs)\.spec\.ts/,
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "yarn start",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
