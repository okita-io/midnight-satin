import { defineConfig, devices } from "@playwright/test";
import path from "node:path";
import { config as loadEnv } from "dotenv";

// Load local env so webServer / Clerk helpers see the same keys as `npm run dev`.
loadEnv({ path: path.resolve(__dirname, ".env.local") });

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const skipWebServer = Boolean(process.env.PLAYWRIGHT_BASE_URL);
// Always reuse a healthy local server when present (CI may still start its own).
const reuseExistingServer =
  process.env.PLAYWRIGHT_REUSE_SERVER === "0"
    ? false
    : !process.env.CI || process.env.PLAYWRIGHT_REUSE_SERVER === "1";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "clerk-setup",
      testMatch: /global\.setup\.ts/,
    },
    {
      name: "chromium-mobile",
      testMatch: /guest\/.*\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "chromium-desktop",
      testMatch: /guest\/.*\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: "auth-mobile",
      testMatch: /auth\/.*\.spec\.ts/,
      dependencies: ["clerk-setup"],
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: skipWebServer
    ? undefined
    : {
        // Prefer default localhost bind — Next's internal router proxies to
        // localhost:3000; binding only 127.0.0.1 causes socket hang ups.
        command: "npm run dev -- --port 3000",
        url: baseURL,
        reuseExistingServer,
        timeout: 180_000,
      },
});
