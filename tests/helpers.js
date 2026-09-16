// Shared test helpers. PAGES is the single list every suite iterates, so a
// new page gets smoke, layout and visual coverage by adding one line.
import { expect } from "@playwright/test";
import { readdirSync } from "node:fs";

export const PAGES = readdirSync("site")
  .filter((f) => f.endsWith(".html") && f !== "404.html")
  .map((f) => ({ file: f, name: f.replace(".html", "") }));

// Collect console errors, page errors and failed requests for a page.
export function watch(page) {
  const problems = [];
  page.on("console", (m) => { if (m.type() === "error") problems.push(`console: ${m.text()}`); });
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("response", (r) => { if (r.status() >= 400) problems.push(`${r.status()} ${r.url()}`); });
  page.on("requestfailed", (r) => {
    const why = r.failure()?.errorText || "";
    if (!/ERR_ABORTED/.test(why)) problems.push(`failed ${r.url()} ${why}`);
  });
  return problems;
}

// Open a page and wait until the loader/curtain has cleared and fonts are in.
export async function open(page, file) {
  await page.goto(`/${file}`);
  await page.waitForFunction(() => !document.body.classList.contains("is-loading"), null, { timeout: 30_000 });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(400);
}

// Scroll to an absolute y and give the director and reveals time to settle.
export async function scrollTo(page, y, settle = 900) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
  await page.waitForTimeout(settle);
}

// Elements whose text is clipped by their own box or pushed past the viewport.
export async function clippedText(page, selector) {
  return page.evaluate((sel) => {
    const vw = document.documentElement.clientWidth;
    const out = [];
    document.querySelectorAll(sel).forEach((el) => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      if (el.closest("[data-clip-ok]")) return;   // intentional scrollers (e.g. the lamp track)
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || Number(cs.opacity) === 0) return;
      const overflowX = el.scrollWidth - el.clientWidth > 2 && cs.overflowX !== "visible";
      const offscreen = r.right > vw + 1 || r.left < -1;
      if (overflowX || offscreen) out.push(`${sel} "${el.textContent.trim().slice(0, 40)}" r=${Math.round(r.left)}..${Math.round(r.right)} vw=${vw}`);
    });
    return out;
  }, selector);
}

export async function noHorizontalScroll(page) {
  const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  expect(sw, "page must not scroll sideways").toBeLessThanOrEqual(cw + 1);
}
