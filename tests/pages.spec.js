// One health check per page and viewport, on a single page load: loads clean,
// sound structure, headline on the first screen, internal links resolve, and
// no clipped headings or sideways scroll at any scroll depth.
import { test, expect } from "@playwright/test";
import { PAGES, watch, open, scrollTo, clippedText, noHorizontalScroll } from "./helpers.js";

const HEADINGS = "h1, h2, h3, .hero__title .line, .cta__title .line, .page-hero h1";
const LEGAL = ["privacy", "terms", "refunds", "licence"];

for (const { file, name } of PAGES) {
  test(`${name} page health`, async ({ page, request }) => {
    const problems = watch(page);
    await open(page, file);

    // structure
    await expect(page).toHaveTitle(/\S/);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("#nav")).toBeVisible();
    await expect(page.locator("#footer .wordmark")).toHaveCount(1);
    if (LEGAL.includes(name)) await expect(page.locator('.legal__others a[aria-current="page"]')).toHaveCount(1);
    else if (name !== "index") await expect(page.locator('.nav__links a[aria-current="page"]')).toHaveCount(1);

    // headline fully on the first screen, clear of the nav
    const b = await page.evaluate(() => {
      const h = document.querySelector("h1").getBoundingClientRect();
      const n = document.getElementById("nav").getBoundingClientRect();
      return { top: h.top, bottom: h.bottom, left: h.left, right: h.right, nav: n.bottom, vh: innerHeight, vw: document.documentElement.clientWidth };
    });
    expect.soft(b.top, "h1 below the nav").toBeGreaterThanOrEqual(b.nav - 1);
    expect.soft(b.bottom, "h1 inside the first screen").toBeLessThanOrEqual(b.vh + 1);
    expect.soft(b.left, "h1 left edge").toBeGreaterThanOrEqual(-1);
    expect.soft(b.right, "h1 right edge").toBeLessThanOrEqual(b.vw + 1);

    // internal links
    const hrefs = await page.evaluate(() => [...new Set([...document.querySelectorAll("a[href]")]
      .map((a) => a.getAttribute("href"))
      .filter((h) => h && !/^(https?:|mailto:|tel:|#)/.test(h))
      .map((h) => h.split("#")[0].split("?")[0]))]);
    for (const href of hrefs) expect.soft((await request.get(`/${href}`)).status(), href).toBe(200);

    // sweep the page
    const height = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    const issues = [];
    for (const f of [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1]) {
      await scrollTo(page, Math.round(height * f), 300);
      await noHorizontalScroll(page);
      issues.push(...(await clippedText(page, HEADINGS)).map((s) => `@${f}: ${s}`));
    }
    expect.soft(issues, issues.join("\n")).toEqual([]);
    expect(problems, problems.join("\n")).toEqual([]);
  });
}
