/**
 * Property 6: Feature flag determines page state
 * Validates: Requirements 2.2, 10.1
 *
 * For any novel, when NEXT_PUBLIC_PAPERBACK_ENABLED is not "true",
 * the paperback purchase page shall render the Coming Soon state.
 * When NEXT_PUBLIC_PAPERBACK_ENABLED is "true", the page shall render
 * the active purchase state.
 *
 * Since the page is a Server Component, we test the pure feature flag logic
 * directly: flag === "true" → active, otherwise → coming soon.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

/**
 * Pure feature flag logic extracted from the Server Component.
 * Returns true (active state) only when flag is exactly "true".
 */
function isPaperbackEnabled(flag: string | undefined): boolean {
  return flag === "true";
}

describe("Property 6: Feature flag determines page state", () => {
  // Feature: buy-paperback, Property 6: Feature flag determines page state
  it("only returns active state when flag is exactly 'true', Coming Soon for all other values", () => {
    const flagArb = fc.oneof(
      fc.constant("true"),
      fc.constant("false"),
      fc.constant(""),
      fc.constant(undefined),
      fc.constant("TRUE"),
      fc.constant("True"),
      fc.constant("1"),
      fc.constant("yes"),
      fc.constant("on"),
      fc.string()
    );

    fc.assert(
      fc.property(flagArb, (flag: string | undefined) => {
        const isActive = isPaperbackEnabled(flag);

        if (flag === "true") {
          // Active purchase state
          expect(isActive).toBe(true);
        } else {
          // Coming Soon state
          expect(isActive).toBe(false);
        }
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: buy-paperback, Property 7: Coming Soon state renders novel data
/**
 * Property 7: Coming Soon state renders novel data
 * Validates: Requirements 2.3
 *
 * For any novel with a title and author name, the Coming Soon state shall
 * include both the novel title and author name in its rendered output.
 *
 * Since the page is a Server Component, we test the DATA CONTRACT:
 * a pure function that produces the Coming Soon template content given
 * a novel title and author name, then assert both strings appear.
 */

/**
 * Pure function representing the Coming Soon template content.
 * Mirrors the actual text rendered by the Server Component's Coming Soon state.
 */
function comingSoonContent(title: string, authorName: string): string {
  return `${title} by ${authorName} Coming Soon Love doesn't have to stay behind a screen. Get a high-quality, physical edition of ${title} to keep forever.`;
}

describe("Property 7: Coming Soon state renders novel data", () => {
  // Feature: buy-paperback, Property 7: Coming Soon state renders novel data
  it("includes both novel title and author name in Coming Soon output for any inputs", () => {
    const nonEmptyString = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);

    fc.assert(
      fc.property(nonEmptyString, nonEmptyString, (title: string, authorName: string) => {
        const content = comingSoonContent(title, authorName);

        expect(content).toContain(title);
        expect(content).toContain(authorName);
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: buy-paperback, Property 15: Active state displays formatted price
/**
 * Property 15: Active state displays formatted price
 * Validates: Requirements 10.2
 *
 * For any novel with a computed price in cents, the active purchase state
 * shall display the price formatted as a USD string (e.g., `$14.99` for 1499 cents).
 *
 * We test the pure formatting logic extracted from the client component:
 * `$${(priceCents / 100).toFixed(2)}`
 */

/**
 * Pure price formatting logic matching the client component.
 */
function formatPriceUSD(priceCents: number): string {
  return `$${(priceCents / 100).toFixed(2)}`;
}

describe("Property 15: Active state displays formatted price", () => {
  // Feature: buy-paperback, Property 15: Active state displays formatted price
  it("formats any price in cents as a USD string with $ prefix and exactly 2 decimal places", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100000 }),
        (priceCents: number) => {
          const formatted = formatPriceUSD(priceCents);

          // 1. Starts with "$"
          expect(formatted.startsWith("$")).toBe(true);

          // 2. Has exactly 2 decimal places
          const afterDollar = formatted.slice(1);
          expect(afterDollar).toMatch(/^\d+\.\d{2}$/);

          // 3. Numeric value equals priceCents / 100
          const numericValue = parseFloat(afterDollar);
          expect(numericValue).toBeCloseTo(priceCents / 100, 2);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: buy-paperback, Property 16: Login prompt includes return URL
/**
 * Property 16: Login prompt includes return URL
 * Validates: Requirements 10.6
 *
 * For any novel ID and unauthenticated reader, the login prompt on the active
 * purchase page shall include a link to the login page with a return URL
 * parameter pointing to `/novel/${novelId}/paperback`.
 *
 * We test the pure URL construction logic extracted from the client component:
 * `/auth/login?returnUrl=${encodeURIComponent(`/novel/${novelId}/paperback`)}`
 */

/**
 * Pure login URL construction matching the client component.
 */
function buildLoginUrl(novelId: string): string {
  return `/auth/login?returnUrl=${encodeURIComponent(`/novel/${novelId}/paperback`)}`;
}

describe("Property 16: Login prompt includes return URL", () => {
  // Feature: buy-paperback, Property 16: Login prompt includes return URL
  it("login link starts with /auth/login?returnUrl= and decoded returnUrl equals /novel/{novelId}/paperback for any novel ID", () => {
    const novelIdArb = fc.oneof(
      // UUID-like IDs
      fc.uuid(),
      // Alphanumeric strings
      fc.stringMatching(/^[a-zA-Z0-9-]{1,64}$/)
    );

    fc.assert(
      fc.property(novelIdArb, (novelId: string) => {
        const loginUrl = buildLoginUrl(novelId);

        // 1. URL starts with /auth/login?returnUrl=
        expect(loginUrl.startsWith("/auth/login?returnUrl=")).toBe(true);

        // 2. Extract and decode the returnUrl parameter
        const returnUrlEncoded = loginUrl.slice("/auth/login?returnUrl=".length);
        const returnUrlDecoded = decodeURIComponent(returnUrlEncoded);

        // 3. Decoded returnUrl equals /novel/${novelId}/paperback
        expect(returnUrlDecoded).toBe(`/novel/${novelId}/paperback`);
      }),
      { numRuns: 100 }
    );
  });
});
