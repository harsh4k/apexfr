// Legal pages: every contents link lands on a section, the pages link to
// each other, and no unexpected placeholder slips through.
import { test, expect } from "@playwright/test";
import { open } from "./helpers.js";

const LEGAL = ["privacy", "terms", "refunds", "licence"];
const KNOWN_PLACEHOLDERS = ["[GSTIN IF REGISTERED]", "[LATE FEE AMOUNT or PERCENTAGE, e.g., 5% per month]"];

for (const name of LEGAL) {
  test(`${name}: contents links resolve and placeholders are known`, async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "content check, one viewport is enough");
    await open(page, `${name}.html`);
    const broken = await page.evaluate(() => [...document.querySelectorAll(".legal__toc a")]
      .map((a) => a.getAttribute("href").slice(1)).filter((id) => !document.getElementById(id)));
    expect(broken).toEqual([]);
    await expect(page.locator(".legal__toc a")).not.toHaveCount(0);
    await expect(page.locator(".legal__others a")).toHaveCount(LEGAL.length);
    const marks = await page.locator("mark.ph").allTextContents();
    for (const m of marks) expect(KNOWN_PLACEHOLDERS).toContain(m);
    await expect(page.locator(".legal")).not.toContainText("Gujarat");
  });
}

test("unknown URLs get the branded 404 page", async ({ page, request }, info) => {
  test.skip(info.project.name !== "desktop", "one viewport is enough");
  const res = await request.get("/no-such-page.html");
  expect(res.status()).toBe(404);
  expect(await res.text()).toContain("Wrong");
});
