import { clerk, setupClerkTestingToken } from "@clerk/testing/playwright";
import { expect, test } from "@playwright/test";
import { expectVisibleInViewport } from "../helpers/visibility";

/**
 * Auth-gated UI visibility (launch-prep 5.8).
 * Guest redirect tests always run. Signed-in flows need:
 *   E2E_CLERK_USER_EMAIL + E2E_CLERK_USER_PASSWORD (Clerk test instance)
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

  test("signed-in Profile and Vault chrome when E2E Clerk user is configured", async ({
    page,
  }) => {
    const email = process.env.E2E_CLERK_USER_EMAIL;
    const password = process.env.E2E_CLERK_USER_PASSWORD;
    test.skip(
      !email || !password,
      "Set E2E_CLERK_USER_EMAIL and E2E_CLERK_USER_PASSWORD for signed-in e2e"
    );

    await page.goto("/");
    await clerk.signIn({
      page,
      signInParams: {
        strategy: "password",
        identifier: email!,
        password: password!,
      },
    });

    await page.goto("/profile");
    await expect(page).not.toHaveURL(/sign-in/);
    await expectVisibleInViewport(
      page.getByRole("heading", { name: /Account/i }).first()
    );
    await expectVisibleInViewport(page.getByRole("button", { name: /Log out/i }));

    await page.goto("/vault");
    await expect(page).not.toHaveURL(/sign-in/);
    // Vault shows credit packs or coming-soon / balance chrome
    await expect(
      page.getByText(/Vault|credits|Dust|Gold|Riches|Treasury|Coming Soon/i).first()
    ).toBeVisible({ timeout: 15_000 });
  });
});
