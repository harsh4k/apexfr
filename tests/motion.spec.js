// The scroll-driven background must behave like video: while the page
// scrolls, the canvas should change on (almost) every animation frame, and it
// must never stay blank.
import { test, expect } from "@playwright/test";
import { open } from "./helpers.js";

async function canvasSignatureSeries(page, frames, stepPx) {
  return page.evaluate(async ({ frames, stepPx }) => {
    const src = document.getElementById("stage");
    const probe = document.createElement("canvas");
    probe.width = 48; probe.height = 27;
    const ctx = probe.getContext("2d", { willReadFrequently: true });
    const sig = () => {
      ctx.drawImage(src, 0, 0, 48, 27);
      const d = ctx.getImageData(0, 0, 48, 27).data;
      let h = 0;
      for (let i = 0; i < d.length; i += 4) h = (h * 31 + d[i] + d[i + 1] * 3 + d[i + 2] * 7) % 1e9;
      return h;
    };
    const out = [];
    for (let i = 0; i < frames; i++) {
      window.scrollBy(0, stepPx);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      out.push(sig());
    }
    return out;
  }, { frames, stepPx });
}

test("background is painted, not blank", async ({ page }) => {
  await open(page, "index.html");
  const lit = await page.evaluate(() => {
    const c = document.getElementById("stage");
    const p = document.createElement("canvas");
    p.width = 32; p.height = 18;
    const x = p.getContext("2d");
    x.drawImage(c, 0, 0, 32, 18);
    const d = x.getImageData(0, 0, 32, 18).data;
    let sum = 0;
    for (let i = 0; i < d.length; i += 4) sum += d[i] + d[i + 1] + d[i + 2];
    return sum / (d.length / 4) / 3;
  });
  expect(lit, "average canvas brightness").toBeGreaterThan(8);
});

for (const file of ["index.html", "services.html"]) {
  test(`scrubbing ${file} changes the picture on most frames`, async ({ page }, info) => {
    test.skip(info.project.name === "mobile", "touch scrolling is covered on desktop sizes");
    await open(page, file);
    // wait for the sharp frames of the first chapter
    await page.waitForTimeout(2500);
    const series = await canvasSignatureSeries(page, 40, 14);
    let changes = 0;
    for (let i = 1; i < series.length; i++) if (series[i] !== series[i - 1]) changes++;
    expect(changes / (series.length - 1), `frames that changed: ${changes}/${series.length - 1}`).toBeGreaterThan(0.8);
  });
}

test("navigating between pages keeps the curtain transition working", async ({ page }, info) => {
  test.skip((page.viewportSize()?.width ?? 0) < 900, "nav links are inside the menu on small screens");
  await open(page, "index.html");
  await page.locator('.nav__links a[href="pricing.html"]').click();
  await page.waitForURL("**/pricing.html");
  await page.waitForFunction(() => !document.body.classList.contains("is-loading"));
  await expect(page.locator('.nav__links a[aria-current="page"]')).toHaveAttribute("href", "pricing.html");
});
