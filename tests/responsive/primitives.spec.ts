import { expect, test } from "@playwright/test";

const VIEWPORTS = [
  { name: "iphone-se", width: 375, height: 667 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop-lg", width: 1440, height: 900 },
];

const ROUTES = ["/", "/showcase"];

for (const route of ROUTES) {
  for (const vp of VIEWPORTS) {
    test(`${route} has no horizontal overflow at ${vp.name} (${vp.width}px)`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(route);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      );
      expect(overflow, "page should not scroll horizontally").toBe(false);
    });
  }
}

test("showcase renders every primitive", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/showcase");
  for (const label of [
    "Wordmark",
    "Button",
    "Section Heading",
    "Tag",
    "Nav Link",
    "Social Link",
    "Link Arrow",
    "Blob",
  ]) {
    await expect(
      page.getByRole("heading", { name: label, exact: true }),
    ).toBeVisible();
  }
});
