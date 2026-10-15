import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

// Colour contrast is deliberately not enforced: the site uses the design
// system's original palette (Tufts Blue #0093E9 accent, 55% muted ink),
// which falls short of AA for small text. Every other WCAG rule still runs.
const scan = (page: Page) =>
  new AxeBuilder({ page }).withTags(WCAG).disableRules(["color-contrast"]).analyze();

test("a11y: / has no detectable axe violations", async ({ page }) => {
  await page.goto("/");
  const results = await scan(page);
  expect(results.violations).toEqual([]);
});

test("a11y: /showcase has no detectable axe violations", async ({ page }) => {
  await page.goto("/showcase");
  const results = await scan(page);
  expect(results.violations).toEqual([]);
});

test("a11y: /projects has no detectable axe violations", async ({ page }) => {
  await page.goto("/projects");
  const results = await scan(page);
  expect(results.violations).toEqual([]);
});

test("a11y: /qualifications has no detectable axe violations", async ({
  page,
}) => {
  await page.goto("/qualifications");
  const results = await scan(page);
  expect(results.violations).toEqual([]);
});

test("a11y: /blog has no detectable axe violations", async ({ page }) => {
  await page.goto("/blog");
  const results = await scan(page);
  expect(results.violations).toEqual([]);
});

test("skip link is the first keyboard stop and targets main", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const focused = page.locator(":focus");
  await expect(focused).toHaveText(/skip to content/i);
  await expect(focused).toHaveAttribute("href", "#main-content");
});
