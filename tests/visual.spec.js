// Visual regression: the top of every page and the footer, per viewport.
// The canvas footage, live clock and marquee are masked; the layout is what
// these screenshots guard. Refresh baselines with `npm run test:update`.
import { test, expect } from "@playwright/test";
import { PAGES, open, scrollTo } from "./helpers.js";

// Transitions are switched off so every reveal is already at its end state.
const FREEZE = "*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}";
const masks = (page) => [page.locator("#stage"), page.locator("#clock"), page.locator(".marquee"), page.locator(".hud")];

for (const { file, name } of PAGES) {
  test(`${name} — first screen`, async ({ page }) => {
    await open(page, file);
    await page.addStyleTag({ content: FREEZE });
    await page.waitForTimeout(2200);
    await expect(page).toHaveScreenshot(`${name}-top.png`, { mask: masks(page) });
  });
}

test("footer", async ({ page }) => {
  await open(page, "index.html");
  await page.addStyleTag({ content: FREEZE });
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  await scrollTo(page, h, 2200);
  await expect(page.locator("#footer")).toHaveScreenshot("footer.png", { mask: masks(page) });
});
