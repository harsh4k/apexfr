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
  workers: 4,
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
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, launchOptions } },
    { name: "laptop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 680 }, launchOptions } },
    { name: "tablet", use: { ...devices["Desktop Chrome"], viewport: { width: 820, height: 1180 }, hasTouch: true, launchOptions } },
    { name: "mobile", use: { ...devices["Pixel 7"], launchOptions } },
  ],
});
