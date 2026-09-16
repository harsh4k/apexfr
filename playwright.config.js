// Playwright runs against the static site served by scripts/serve.mjs.
// No browser download: it drives an existing Chrome build (PW_CHROME overrides).
import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const candidates = [
  process.env.PW_CHROME,
  join(homedir(), ".cache/puppeteer/chrome/win64-152.0.7977.75/chrome-win64/chrome.exe"),
  join(homedir(), ".claude-server-commander/puppeteer-cache/chrome/win64-152.0.7977.82/chrome-win64/chrome.exe"),
].filter(Boolean);
const executablePath = candidates.find((p) => existsSync(p));
const launchOptions = executablePath ? { executablePath } : {};
const PORT = 4173;

export default defineConfig({
  testDir: "tests",
  timeout: 60_000,
  expect: { timeout: 10_000, toHaveScreenshot: { maxDiffPixelRatio: 0.03, animations: "disabled" } },
  fullyParallel: true,
  updateSnapshots: "missing",
  workers: process.env.PW_WORKERS ? Number(process.env.PW_WORKERS) : 10,
  reporter: [["list"], ["html", { open: "never" }]],
  snapshotPathTemplate: "tests/__screens__/{projectName}/{testFilePath}/{arg}{ext}",
  use: {
    baseURL: `http://localhost:${PORT}`,
    launchOptions,
    trace: "retain-on-failure",
  },
  webServer: {
    command: `node scripts/serve.mjs`,
    env: { PORT: String(PORT) },
    url: `http://localhost:${PORT}/index.html`,
    reuseExistingServer: true,
  },
  // Layout + visual suites run at every size; behaviour suites where they
  // differ (desktop pointer vs touch phone). Keeps the gate under 4 minutes.
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, launchOptions } },
    { name: "laptop", testMatch: /(pages|visual|motion).spec/, use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 680 }, launchOptions } },
    { name: "tablet", testMatch: /(pages|visual).spec/, use: { ...devices["Desktop Chrome"], viewport: { width: 820, height: 1180 }, hasTouch: true, launchOptions } },
    { name: "mobile", testMatch: /(pages|visual|interactions).spec/, use: { ...devices["Pixel 7"], launchOptions } },
    { name: "small", testMatch: /(pages|visual).spec/, use: { ...devices["Pixel 7"], viewport: { width: 360, height: 640 }, launchOptions } },
  ],
});
