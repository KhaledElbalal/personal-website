import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

test("a11y: / has no detectable axe violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  expect(results.violations).toEqual([]);
});

// The showcase exercises the full brand palette. Tufts/Maya blue fills and
// blue-on-white text fall below WCAG AA (a palette decision, tracked
// separately), so color-contrast is excluded here while all other a11y rules
// (roles, names, headings, aria) stay enforced.
test("a11y: /showcase (structural) has no detectable axe violations", async ({
  page,
}) => {
  await page.goto("/showcase");
  const results = await new AxeBuilder({ page })
    .withTags(WCAG)
    .disableRules(["color-contrast"])
    .analyze();
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
