import { expect, test } from "@playwright/test";
import {
  expectClickable,
  expectMainNav,
  isEmptyShelf,
  openFirstLibraryNovel,
} from "../helpers/visibility";

/**
 * Clickability / overlay smoke: critical controls must receive pointer events
 * (not blocked by fixed headers, gradients, or invisible layers).
 */
test.describe("Interactive controls are clickable", () => {
  test("404 Return to Boudoir is clickable and navigates home", async ({
    page,
  }) => {
    await page.goto("/this-page-definitely-does-not-exist");
    const home = page.getByRole("link", { name: "Return to home" });
    await expectClickable(home, "Return to home");
    await home.click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("Library nav tabs are clickable and route correctly", async ({
    page,
  }) => {
    await page.goto("/library");
    await expectMainNav(page);

    const nav = page.getByRole("navigation", { name: "Main navigation" });
    await nav.getByRole("link", { name: "Updates" }).click();
    await expect(page).toHaveURL(/\/updates/);
    await expectMainNav(page);

    await nav.getByRole("link", { name: "Boudoir" }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("Boudoir search and auth controls are clickable when shelf has content", async ({
    page,
  }) => {
    await page.goto("/");
    if (await isEmptyShelf(page)) {
      test.skip(true, "Empty shelf — no header controls");
      return;
    }

    await expectMainNav(page);

    const search = page.getByRole("button", {
      name: "Search novels and authors",
    });
    await expectClickable(search, "Search");
    await search.click();
    await expect(
      page.getByRole("dialog", { name: "Search novels and authors" })
    ).toBeVisible();
    const close = page.getByRole("button", { name: "Close search" });
    await expectClickable(close, "Close search");
    await close.click();

    const signIn = page.getByRole("button", { name: "Sign in" }).first();
    if (await signIn.isVisible().catch(() => false)) {
      await expectClickable(signIn, "Sign in");
    }
  });

  test("Library view toggles and filter are clickable", async ({ page }) => {
    await page.goto("/library");
    await expectMainNav(page);

    const filter = page.getByRole("button", {
      name: "Search and filter catalog",
    });
    if (await filter.isVisible().catch(() => false)) {
      await expectClickable(filter, "Search and filter catalog");
      await filter.click();
      const searchbox = page.getByRole("searchbox", {
        name: "Filter novels by title or author",
      });
      await expect(searchbox).toBeVisible();
    }

    const empty = page.getByText("Your shelf is waiting.");
    if (await empty.isVisible().catch(() => false)) {
      return;
    }

    const grid = page.getByRole("button", { name: "Grid view" });
    const list = page.getByRole("button", { name: "List view" });
    await expectClickable(list, "List view");
    await list.click();
    await expectClickable(grid, "Grid view");
    await grid.click();
  });

  test("Novel Detail back/bookmark and Start Reading are clickable when seeded", async ({
    page,
  }) => {
    const opened = await openFirstLibraryNovel(page);
    test.skip(!opened, "No seeded novels — run npm run db:seed");

    await expectMainNav(page);
    await expectClickable(
      page.getByRole("button", { name: "Go back" }),
      "Go back"
    );
    const bookmark = page.getByRole("button", { name: /bookmark/i }).first();
    await expectClickable(bookmark, "Bookmark");

    const start = page.getByRole("link", { name: "Start Reading" });
    if (await start.isVisible().catch(() => false)) {
      await expectClickable(start, "Start Reading");
      await start.click();
      await expect(page).toHaveURL(/\/read\//);
      await expectClickable(
        page.getByRole("button", { name: "Back to novel" }),
        "Back to novel"
      );
    }
  });

  test("Vault and Profile redirects leave sign-in CTA clickable", async ({
    page,
  }) => {
    await page.goto("/vault");
    await expect(page).toHaveURL(/sign-in/);
    // Clerk root should be the interactive surface (not a blank overlay)
    const clerkRoot = page
      .locator("[data-clerk-component], .cl-signIn-root, .cl-rootBox")
      .first();
    await expect(clerkRoot).toBeVisible({ timeout: 20_000 });
    await expectClickable(clerkRoot, "Clerk sign-in root");
  });
});
