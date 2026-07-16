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

/**
 * Assert the control is actionable: visible, enabled, in viewport, not covered
 * by another layer, and passes Playwright's actionability trial click.
 */
export async function expectClickable(locator: Locator, label?: string) {
  const name = label ?? (await locator.getAttribute("aria-label")) ?? "control";
  await expectVisibleInViewport(locator);
  await expect(locator, `${name} should be enabled`).toBeEnabled();

  const handle = await locator.elementHandle();
  expect(handle, `${name} should resolve to an element`).not.toBeNull();
  if (!handle) return;

  const coverage = await handle.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return { ok: false, reason: "zero-size hit target" };
    }
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const top = document.elementFromPoint(x, y);
    if (!top) {
      return { ok: false, reason: "elementFromPoint returned null" };
    }
    const coveredBySelf = el === top || el.contains(top) || top.contains(el);
    if (!coveredBySelf) {
      const tag = top.tagName.toLowerCase();
      const cls = typeof top.className === "string" ? top.className.slice(0, 80) : "";
      const id = top.id ? `#${top.id}` : "";
      return {
        ok: false,
        reason: `hit target covered by <${tag}${id} class="${cls}">`,
      };
    }
    const style = window.getComputedStyle(el);
    if (style.pointerEvents === "none") {
      return { ok: false, reason: "pointer-events: none" };
    }
    return { ok: true, reason: "" };
  });

  expect(coverage.ok, `${name}: ${coverage.reason}`).toBe(true);

  // Playwright actionability without committing the click
  await locator.click({ trial: true });
}

export async function expectMainNav(page: Page) {
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  await expectVisibleInViewport(nav);
  for (const label of ["Boudoir", "Library", "Vault", "Updates", "Profile"] as const) {
    await expectClickable(nav.getByRole("link", { name: label }), `nav:${label}`);
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
  await expectClickable(firstNovel, "first library novel");
  await firstNovel.click();
  await expect(page).toHaveURL(/\/novel\/[^/]+/);
  return true;
}
