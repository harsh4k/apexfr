// Behaviour of the interactive pieces.
import { test, expect } from "@playwright/test";
import { open } from "./helpers.js";

test("currency switch swaps every price", async ({ page }) => {
  await open(page, "pricing.html");
  const usd = page.locator('.toggle [data-cur="usd"]');
  await usd.scrollIntoViewIfNeeded();
  await usd.click();
  await expect(usd).toHaveAttribute("aria-pressed", "true");
  const prices = await page.locator("#pricing [data-inr]").evaluateAll((els) => els.map((e) => [e.textContent, e.dataset.usd]));
  for (const [shown, want] of prices) expect(shown).toBe(want);
});

test("project brief validates, then confirms", async ({ page }) => {
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
  await expect(page.locator("#briefMsg")).toContainText("Thanks, Test");
});

test("newsletter rejects a bad email", async ({ page }) => {
  await open(page, "index.html");
  const input = page.locator("#newsEmail");
  await input.scrollIntoViewIfNeeded();
  await input.fill("not-an-email");
  await page.locator("#news button[type=submit]").click();
  await expect(page.locator("#newsMsg")).not.toBeEmpty();
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
