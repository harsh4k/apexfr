// Visual regression: the top of every page and the footer, per viewport.
// The live clock and marquee are masked; the layout is what these
// screenshots guard. Refresh baselines with `npm run test:update`.
import { test, expect } from "@playwright/test";
import { PAGES, open, scrollTo } from "./helpers.js";

// Transitions are switched off so every reveal is already at its end state.
// The footage canvas is hidden (not masked: a full-screen mask would cover
// the whole page), leaving the layout on the plain page colour.
const FREEZE = "*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}" +
  "#stage,.hud{visibility:hidden!important}";
// Settle on state, not time: every animated element on screen has arrived.
const settled = (page) => page.waitForFunction(() => {
  const vh = innerHeight;
  return [...document.querySelectorAll("[data-split], [data-reveal]")].every((el) => {
    const r = el.getBoundingClientRect();
    if (!r.height) return true;
    const seen = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
    const clearlyOn = seen / r.height >= 0.25 || (seen > 0 && r.height > vh * 0.5);
    return !clearlyOn || el.dataset.state === "in";
  }) && document.fonts.status === "loaded";
}, null, { timeout: 20_000 });
const masks = (page) => [page.locator("#clock"), page.locator(".marquee")];

for (const { file, name } of PAGES) {
  test(`${name} — first screen`, async ({ page }) => {
    await open(page, file);
    await page.addStyleTag({ content: FREEZE });
    await settled(page);
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot(`${name}-top.png`, { mask: masks(page) });
  });
}

test("footer", async ({ page }) => {
  await open(page, "index.html");
  await page.addStyleTag({ content: FREEZE });
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  await scrollTo(page, h, 300);
  await settled(page);
  await page.waitForTimeout(300);
  await expect(page.locator("#footer")).toHaveScreenshot("footer.png", { mask: masks(page) });
});
