import { expect, test } from "@playwright/test";

function nums(transform: string) {
  return (transform.match(/-?\d+\.?\d*/g) ?? []).map(Number);
}

test("section-heading blob moves toward and tracks the pointer", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/showcase");
  const blob = page.locator(".follow-blob").first();

  await page.mouse.move(120, 160);
  await page.mouse.move(1100, 640, { steps: 8 });
  await page.waitForTimeout(450);
  const t1 = await blob.evaluate((el) => (el as HTMLElement).style.transform);
  expect(t1).toMatch(/translate\(/);
  expect(Math.max(...nums(t1).map(Math.abs))).toBeGreaterThan(3);

  await page.mouse.move(120, 720, { steps: 8 });
  await page.waitForTimeout(450);
  const t2 = await blob.evaluate((el) => (el as HTMLElement).style.transform);
  expect(t2).not.toBe(t1);
});

test("blob does not follow the cursor under reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/showcase");
  const blob = page.locator(".follow-blob").first();

  await page.mouse.move(120, 160);
  await page.mouse.move(1100, 640, { steps: 8 });
  await page.waitForTimeout(350);
  const t = await blob.evaluate((el) => (el as HTMLElement).style.transform);
  expect(t).toBe("");
});

test("terminal carets have the blink animation applied", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/showcase");
  const name = await page
    .locator('[class*="animate-caret-blink"]')
    .first()
    .evaluate((el) => getComputedStyle(el).animationName);
  expect(name).toBe("caret-blink");
});
