import { clerkSetup } from "@clerk/testing/playwright";
import { test as setup } from "@playwright/test";

/**
 * Obtains a Clerk Testing Token for auth-gated e2e projects.
 * Requires test instance keys (pk_test_ / sk_test_).
 */
setup.describe.configure({ mode: "serial" });

setup("clerk testing token", async () => {
  process.env.CLERK_PUBLISHABLE_KEY ??=
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const publishable = process.env.CLERK_PUBLISHABLE_KEY;
  const secret = process.env.CLERK_SECRET_KEY;

  if (!publishable || !secret) {
    setup.skip(
      true,
      "Clerk keys missing — set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY for auth e2e"
    );
    return;
  }

  if (!publishable.startsWith("pk_test_") || !secret.startsWith("sk_test_")) {
    setup.skip(
      true,
      "Auth e2e requires Clerk *test* keys (pk_test_ / sk_test_), not production"
    );
    return;
  }

  await clerkSetup();
});
