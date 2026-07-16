import { expect, type Locator, type Page } from "@playwright/test";

/** Assert locator is visible and intersects the viewport (not merely in DOM). */
export async function expectVisibleInViewport(locator: Locator) {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  expect(box, "expected element bounding box").not.toBeNull();
  if (!box) return;

  const page = locator.page();
  const viewport = page.viewportSize();
  expect(viewport, "expected page viewport").not.toBeNull();
  if (!viewport) return;

  const intersects =
    box.x + box.width > 0 &&
    box.y + box.height > 0 &&
    box.x < viewport.width &&
    box.y < viewport.height;
  expect(intersects, "expected element to intersect viewport").toBe(true);
}

export async function expectMainNav(page: Page) {
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  await expectVisibleInViewport(nav);
  for (const label of ["Boudoir", "Library", "Vault", "Updates", "Profile"] as const) {
    await expectVisibleInViewport(nav.getByRole("link", { name: label }));
  }
}

/** True when Boudoir rendered the empty shelf (no featured novels). */
export async function isEmptyShelf(page: Page): Promise<boolean> {
  return page.getByText("Your shelf is waiting.").isVisible().catch(() => false);
}

/**
 * Open the first catalog novel from Library. Returns false when catalog is empty.
 */
export async function openFirstLibraryNovel(page: Page): Promise<boolean> {
  await page.goto("/library");
  const empty = page.getByText("Your shelf is waiting.");
  if (await empty.isVisible().catch(() => false)) {
    return false;
  }
  const catalog = page.getByRole("region", { name: "Library catalog" });
  await expect(catalog).toBeVisible();
  const firstNovel = catalog.getByRole("link").first();
  await expect(firstNovel).toBeVisible();
  await firstNovel.click();
  await expect(page).toHaveURL(/\/novel\/[^/]+/);
  return true;
}
