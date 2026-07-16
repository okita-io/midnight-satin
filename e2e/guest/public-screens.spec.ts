import { expect, test } from "@playwright/test";
import {
  expectMainNav,
  expectVisibleInViewport,
  isEmptyShelf,
  openFirstLibraryNovel,
} from "../helpers/visibility";

test.describe("Guest / public screens", () => {
  test("404 themed not-found is visible", async ({ page }) => {
    await page.goto("/this-page-definitely-does-not-exist");
    await expectVisibleInViewport(page.getByText("Lost in the stacks"));
    await expectVisibleInViewport(
      page.getByRole("heading", {
        name: "This page has slipped into the shadows",
      })
    );
    await expectVisibleInViewport(
      page.getByRole("link", { name: "Return to home" })
    );
  });

  test("Updates archive chrome is visible", async ({ page }) => {
    await page.goto("/updates");
    await expectVisibleInViewport(
      page.getByRole("heading", { name: "The Gazette" })
    );
    await expectMainNav(page);

    const empty = page.getByText("No articles yet. Check back soon.");
    const article = page.getByRole("link").filter({ hasText: /.+/ }).first();
    if (await empty.isVisible().catch(() => false)) {
      await expectVisibleInViewport(empty);
    } else if (await article.isVisible().catch(() => false)) {
      await expectVisibleInViewport(article);
    }
  });

  test("Library catalog chrome is visible", async ({ page }) => {
    await page.goto("/library");
    await expectVisibleInViewport(page.getByText("Library").first());
    await expectMainNav(page);

    const empty = page.getByText("Your shelf is waiting.");
    const catalog = page.getByRole("region", { name: "Library catalog" });
    if (await empty.isVisible().catch(() => false)) {
      await expectVisibleInViewport(empty);
    } else {
      await expectVisibleInViewport(catalog);
      await expectVisibleInViewport(
        page.getByRole("button", { name: "Grid view" })
      );
      await expectVisibleInViewport(
        page.getByRole("button", { name: "List view" })
      );
      const card = catalog.getByRole("link").first();
      await expectVisibleInViewport(card);
    }
  });

  test("Boudoir brand, sections, and nav (or empty shelf)", async ({
    page,
  }) => {
    await page.goto("/");

    if (await isEmptyShelf(page)) {
      await expectVisibleInViewport(
        page.getByText("Your shelf is waiting.")
      );
      return;
    }

    await expectVisibleInViewport(page.getByText("Midnight Satin").first());
    await expectVisibleInViewport(
      page.getByRole("button", { name: "Search novels and authors" })
    );
    await expectMainNav(page);

    const hero = page.getByRole("region", {
      name: "Editor's Choice featured novels",
    });
    if (await hero.isVisible().catch(() => false)) {
      await expectVisibleInViewport(hero);
      await expectVisibleInViewport(page.getByText("Editor's Choice"));
    }

    await expectVisibleInViewport(
      page.getByRole("heading", { name: "Current Affairs" })
    );
    await expectVisibleInViewport(
      page.getByRole("heading", { name: "High Society" })
    );
  });

  test("Novel Detail hero, chapters, and nav when catalog has novels", async ({
    page,
  }) => {
    const opened = await openFirstLibraryNovel(page);
    test.skip(!opened, "No seeded novels in Library — run npm run db:seed");

    await expectVisibleInViewport(page.getByRole("button", { name: "Go back" }));
    await expectVisibleInViewport(
      page.getByRole("button", { name: /bookmark/i }).first()
    );
    await expectVisibleInViewport(page.getByRole("heading").first());
    await expectVisibleInViewport(
      page.getByRole("heading", { name: "Contents" })
    );
    await expectVisibleInViewport(
      page.getByRole("heading", { name: "The Players" })
    );
    await expectMainNav(page);
  });

  test("Reading Room free chapter content without Veil", async ({ page }) => {
    const opened = await openFirstLibraryNovel(page);
    test.skip(!opened, "No seeded novels in Library — run npm run db:seed");

    const startReading = page.getByRole("link", { name: "Start Reading" });
    const freeChapter = page.getByText("Free").first();
    if (await startReading.isVisible().catch(() => false)) {
      await startReading.click();
    } else if (await freeChapter.isVisible().catch(() => false)) {
      // Click the free chapter row / link near the Free label
      const freeLink = page
        .locator("a")
        .filter({ hasText: /Chapter|Free/i })
        .first();
      await freeLink.click();
    } else {
      test.skip(true, "No free chapter CTA on Novel Detail");
    }

    await expect(page).toHaveURL(/\/novel\/[^/]+\/read\/[^/]+/);

    const chapterMain = page.getByRole("main", { name: "Chapter content" });
    await expectVisibleInViewport(chapterMain);
    await expectVisibleInViewport(
      page.getByRole("navigation", { name: "Reading tools" })
    );

    // Veil paywall should not appear for free chapters
    await expect(page.getByText("The Veil is Drawn")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Lift Veil|Sign in to unlock/i })).toHaveCount(0);
  });

  test("Author Study chrome when linked from Novel Detail", async ({
    page,
  }) => {
    const opened = await openFirstLibraryNovel(page);
    test.skip(!opened, "No seeded novels in Library — run npm run db:seed");

    const authorLink = page.locator('a[href^="/author/"]').first();
    test.skip(
      !(await authorLink.isVisible().catch(() => false)),
      "No author link on Novel Detail"
    );

    await authorLink.click();
    await expect(page).toHaveURL(/\/author\/[^/]+/);
    await expectVisibleInViewport(
      page.getByRole("heading", { name: "The Author's Study" })
    );
    await expectVisibleInViewport(page.getByRole("heading").nth(1));
    await expectVisibleInViewport(
      page.getByRole("button", { name: "Follow" })
    );
    await expectMainNav(page);
  });
});
