import { setupClerkTestingToken } from "@clerk/testing/playwright";
import { expect, test } from "@playwright/test";
import { expectVisibleInViewport } from "../helpers/visibility";

/**
 * Auth-gated UI visibility (launch-prep 5.8).
 * Guest redirect tests always run. Signed-in flows need Clerk test keys +
 * optional E2E_CLERK_USER_EMAIL / E2E_CLERK_USER_PASSWORD for storageState later.
 */
test.describe("Auth-gated and commerce UI", () => {
  test.beforeEach(async ({ page }) => {
    const publishable =
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ??
      process.env.CLERK_PUBLISHABLE_KEY;
    if (publishable?.startsWith("pk_test_")) {
      await setupClerkTestingToken({ page });
    }
  });

  test("guest hitting /profile is sent to Clerk sign-in (not blank)", async ({
    page,
  }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(/sign-in/);
    // Clerk SignIn mounts inside our themed page
    await expect(
      page.locator("[data-clerk-component], .cl-signIn-root, .cl-rootBox").first()
    ).toBeVisible({ timeout: 20_000 });
  });

  test("guest hitting /vault is sent to Clerk sign-in (not blank)", async ({
    page,
  }) => {
    await page.goto("/vault");
    await expect(page).toHaveURL(/sign-in/);
    await expect(
      page.locator("[data-clerk-component], .cl-signIn-root, .cl-rootBox").first()
    ).toBeVisible({ timeout: 20_000 });
  });

  test("sign-in page renders brandable Clerk form", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(
      page.locator("[data-clerk-component], .cl-signIn-root, .cl-rootBox").first()
    ).toBeVisible({ timeout: 20_000 });
  });

  test("auth prompt copy appears for guest unlock affordances when present", async ({
    page,
  }) => {
    await page.goto("/library");
    const empty = page.getByText("Your shelf is waiting.");
    test.skip(
      await empty.isVisible().catch(() => false),
      "No novels seeded — skip auth-prompt smoke"
    );

    const firstNovel = page
      .getByRole("region", { name: "Library catalog" })
      .getByRole("link")
      .first();
    await firstNovel.click();

    // Bookmark while signed out may open auth prompt or navigate — either is OK
    const bookmark = page.getByRole("button", { name: /bookmark/i }).first();
    if (await bookmark.isVisible().catch(() => false)) {
      await bookmark.click();
    }

    const prompt = page.getByRole("dialog", { name: /sign in to continue/i });
    if (await prompt.isVisible().catch(() => false)) {
      await expectVisibleInViewport(prompt);
      await expectVisibleInViewport(
        prompt.getByRole("button", { name: "Sign in" })
      );
      await expectVisibleInViewport(
        prompt.getByRole("button", { name: "Register" })
      );
    }
  });
});
