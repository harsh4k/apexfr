// UI evidence producer for the agent loop (skill: ui-verification).
// Usage: node scripts/ui-evidence.mjs <taskId> [route ...]
// Starts the static server, opens every route at mobile + desktop, asserts
// structure and overflow, collects console/network failures, and writes
// .agent/evidence/<task>/ui.json with hashed screenshots.
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const task = process.argv[2];
if (!task) { console.error("usage: ui-evidence.mjs <taskId> [routes...]"); process.exit(2); }
const pages = readdirSync("site").filter((f) => f.endsWith(".html") && f !== "404.html");
const routes = process.argv.slice(3).length ? process.argv.slice(3)
  : ["/", ...pages.filter((f) => f !== "index.html").map((f) => `/${f}`)];
const PORT = 4190;
const baseUrl = `http://127.0.0.1:${PORT}`;
const outDir = join(".agent", "evidence", task);
mkdirSync(join(outDir, "shots"), { recursive: true });

const exe = [process.env.PW_CHROME, join(homedir(), ".cache/puppeteer/chrome/win64-152.0.7977.75/chrome-win64/chrome.exe")]
  .filter(Boolean).find((p) => existsSync(p));
const viewports = {
  mobile: { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  desktop: { viewport: { width: 1440, height: 900 } },
};

const server = spawn(process.execPath, ["scripts/serve.mjs"], { env: { ...process.env, PORT: String(PORT) }, stdio: "ignore" });
await new Promise((r) => setTimeout(r, 800));
const startedAt = new Date().toISOString();
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const checks = [];

try {
  for (const route of routes) {
    for (const [vp, opts] of Object.entries(viewports)) {
      const ctx = await browser.newContext(opts);
      const page = await ctx.newPage();
      const consoleErrors = [], failedRequests = [];
      page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
      page.on("pageerror", (e) => consoleErrors.push(e.message));
      page.on("response", (r) => { if (r.status() >= 400) failedRequests.push({ url: r.url(), status: r.status() }); });
      const res = await page.goto(baseUrl + route, { waitUntil: "networkidle" });
      await page.waitForFunction(() => !document.body.classList.contains("is-loading"), null, { timeout: 30000 });
      await page.waitForTimeout(600);
      const a = [];
      a.push({ kind: "custom", target: "document status", expect: 200, actual: res.status(), ok: res.status() === 200 });
      const h1 = await page.locator("h1").count();
      a.push({ kind: "count", target: "h1", expect: 1, actual: h1, ok: h1 === 1 });
      const title = await page.title();
      a.push({ kind: "text", target: "title", expect: "non-empty", actual: title, ok: title.trim().length > 0 });
      const navVisible = await page.locator("#nav").isVisible();
      a.push({ kind: "visible", target: "#nav", expect: true, actual: navVisible, ok: navVisible });
      const vpMeta = await page.locator('meta[name="viewport"]').count();
      a.push({ kind: "count", target: 'meta[name="viewport"]', expect: 1, actual: vpMeta, ok: vpMeta === 1 });
      const ov = await page.evaluate(() => ({ clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
      a.push({ kind: "noOverflow", actual: ov, ok: ov.scrollWidth <= ov.clientWidth + 1 });
      const shot = join("shots", `${route === "/" ? "home" : route.slice(1).replace(/\W+/g, "-")}-${vp}-default.png`);
      await page.screenshot({ path: join(outDir, shot) });
      const sha = createHash("sha256").update(readFileSync(join(outDir, shot))).digest("hex");
      checks.push({ route, viewport: vp, state: "default", settled: "networkidle", consoleErrors, failedRequests, assertions: a, screenshot: shot, screenshotSha256: sha });
      await ctx.close();
    }
  }
} finally {
  await browser.close();
  server.kill();
}

const bad = checks.some((c) => c.consoleErrors.length || c.failedRequests.length || c.assertions.some((x) => !x.ok));
const record = { verdict: bad ? "FAIL" : "PASS", producer: "playwright-script", baseUrl, startedAt, finishedAt: new Date().toISOString(), checks };
writeFileSync(join(outDir, "ui.json"), JSON.stringify(record, null, 2));
console.log(`${record.verdict}: ${checks.length} checks → ${join(outDir, "ui.json")}`);
process.exit(bad ? 1 : 0);
