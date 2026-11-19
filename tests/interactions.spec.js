// Behaviour of the interactive pieces.
import { test, expect } from "@playwright/test";
import { open } from "./helpers.js";

test("currency switch repaints every price from the rate card", async ({ page }) => {
  await open(page, "pricing.html");
  const usd = page.locator('.toggle [data-cur="usd"]');
  await usd.scrollIntoViewIfNeeded();
  await usd.click();
  await expect(usd).toHaveAttribute("aria-pressed", "true");
  const wrong = await page.evaluate(() => [...document.querySelectorAll("[data-price]")]
    .filter((el) => el.textContent !== "$" + PricingRates.usd[el.dataset.price].toLocaleString("en-US"))
    .map((el) => `${el.dataset.price}: ${el.textContent}`));
  expect(wrong).toEqual([]);
});

test("estimator adds pages, extras and rush correctly", async ({ page }) => {
  await open(page, "pricing.html");
  const form = page.locator("#estimator-form");
  await form.scrollIntoViewIfNeeded();
  await page.fill("#estSimple", "4");
  await page.fill("#estStandard", "2");
  await page.locator('[data-step="1"][data-for="advanced"]').click();
  await page.locator('input[name="cms"]').check();
  await page.locator('input[name="rush"]').check();
  const r = await page.evaluate(() => PricingRates.inr);
  const expected = Math.round((r.setup + 4 * r.simple + 2 * r.standard + r.advanced + r.cms) * 1.25);
  await expect(page.locator("#estTotal")).toHaveText("₹" + expected.toLocaleString("en-IN"));
  const href = await page.locator("#estSend").getAttribute("href");
  expect(href).toContain("contact.html?estimate=");
  await page.goto("/" + href);
  await expect(page.locator("#bMsg")).toHaveValue(/7 pages/);
});

test("project brief validates and keeps the user's draft", async ({ page }) => {
  await open(page, "contact.html");
  const form = page.locator("#brief");
  await form.scrollIntoViewIfNeeded();
  await form.locator('button[type="submit"]').click();
  await expect(page.locator("#briefMsg")).toContainText("Add your");
  await expect(page.locator("#bName")).toHaveAttribute("aria-invalid", "true");
  await page.fill("#bName", "Test Person");
  await page.fill("#bEmail", "test@example.com");
  await page.fill("#bMsg", "A small launch site.");
  await form.locator('button[type="submit"]').click();
  await expect(page.locator("#briefMsg")).toContainText("This demo keeps the details on this page.");
  await expect(page.locator("#bMsg")).toHaveValue("A small launch site.");
});

test("newsletter validates a sample address without promising a subscription", async ({ page }) => {
  await open(page, "index.html");
  const input = page.locator("#newsEmail");
  await input.scrollIntoViewIfNeeded();
  await input.fill("not-an-email");
  await page.locator("#news button[type=submit]").click();
  await expect(page.locator("#newsMsg")).toContainText("That email looks off");
  await input.fill("test@example.com");
  await page.locator("#news button[type=submit]").click();
  await expect(page.locator("#newsMsg")).toContainText("This preview stays on this page.");
});

test("mobile menu opens, traps nothing, and closes on Escape", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile", "menu button only exists on small screens");
  await open(page, "index.html");
  const btn = page.locator("#menuBtn");
  await btn.click();
  await expect(btn).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#navLinks a").first()).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(btn).toHaveAttribute("aria-expanded", "false");
});
