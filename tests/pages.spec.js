// Every page: loads clean, has sound structure, never scrolls sideways and
// never clips a heading, at every scroll depth we sample.
import { test, expect } from "@playwright/test";
import { PAGES, watch, open, scrollTo, clippedText, noHorizontalScroll } from "./helpers.js";

const HEADINGS = "h1, h2, h3, .hero__title .line, .cta__title .line, .page-hero h1";

for (const { file, name } of PAGES) {
  test.describe(name, () => {
    test("loads without errors and has sound structure", async ({ page }) => {
      const problems = watch(page);
      await open(page, file);
      await expect(page).toHaveTitle(/\S/);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("#nav")).toBeVisible();
      await expect(page.locator("#footer .wordmark")).toHaveCount(1);
      const legal = ["privacy", "terms", "refunds", "licence"].includes(name);
      if (legal) await expect(page.locator(`.legal__others a[aria-current="page"]`)).toHaveCount(1);
      else if (name !== "index") await expect(page.locator(`.nav__links a[aria-current="page"]`)).toHaveCount(1);
      await page.waitForTimeout(800);
      expect(problems, problems.join("\n")).toEqual([]);
    });

    test("no clipped headings or sideways scroll at any depth", async ({ page }) => {
      await open(page, file);
      const height = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
      const issues = [];
      for (const f of [0, 0.12, 0.25, 0.4, 0.55, 0.7, 0.85, 1]) {
        await scrollTo(page, Math.round(height * f), 700);
        await noHorizontalScroll(page);
        issues.push(...(await clippedText(page, HEADINGS)).map((s) => `@${f}: ${s}`));
      }
      expect(issues, issues.join("\n")).toEqual([]);
    });

    test("internal links resolve", async ({ page, request }) => {
      await open(page, file);
      const hrefs = await page.evaluate(() => [...new Set([...document.querySelectorAll("a[href]")]
        .map((a) => a.getAttribute("href"))
        .filter((h) => h && !/^(https?:|mailto:|tel:|#)/.test(h))
        .map((h) => h.split("#")[0]))]);
      for (const href of hrefs) {
        const res = await request.get(`/${href}`);
        expect(res.status(), href).toBe(200);
      }
    });
  });
}

test("home hero headline sits fully inside the first screen", async ({ page }) => {
  await open(page, "index.html");
  await page.waitForTimeout(1500);
  const box = await page.evaluate(() => {
    const r = document.querySelector(".hero__title").getBoundingClientRect();
    return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, vh: innerHeight, vw: innerWidth };
  });
  expect(box.top).toBeGreaterThanOrEqual(0);
  expect(box.bottom).toBeLessThanOrEqual(box.vh);
  expect(box.left).toBeGreaterThanOrEqual(0);
  expect(box.right).toBeLessThanOrEqual(box.vw);
});
