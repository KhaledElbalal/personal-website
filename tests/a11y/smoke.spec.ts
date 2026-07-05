import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Routes to scan. Extend this list as the designed pages (design/) land.
const ROUTES = ["/"];

for (const route of ROUTES) {
  test(`a11y: ${route} has no detectable axe violations`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test("skip link is the first keyboard stop and targets main", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const focused = page.locator(":focus");
  await expect(focused).toHaveText(/skip to content/i);
  await expect(focused).toHaveAttribute("href", "#main-content");
});
