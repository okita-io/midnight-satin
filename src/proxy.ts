import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Session-required app surfaces (Clerk sign-in).
 * Webhooks, MCP, and public content are intentionally excluded — they use
 * signature/API-key checks or server-action getSession() instead.
 *
 * See docs/AUTH.md § Route matrix.
 */
const isProtectedRoute = createRouteMatcher([
  "/profile(.*)",
  "/admin(.*)",
  "/vault(.*)",
]);

/** Provider callbacks must never require a browser session. */
const isWebhookRoute = createRouteMatcher(["/api/webhooks(.*)"]);

/** Origins allowed to mint/use sessions (omit in local/dev so localhost works). */
const authorizedParties =
  process.env.VERCEL_ENV === "production"
    ? [
        "https://midnightsatin.app",
        "https://beta.midnightsatin.app",
      ]
    : undefined;

export default clerkMiddleware(
  async (auth, req) => {
    if (isWebhookRoute(req)) {
      return;
    }

    if (isProtectedRoute(req)) {
      await auth.protect();
    }
  },
  authorizedParties ? { authorizedParties } : undefined,
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
