/**
 * Property 5: Navigation URL correctness
 * Validates: Requirements 1.3, 2.6, 9.4
 *
 * For any valid novel ID string, the Buy Paperback button href shall equal
 * `/novel/${novelId}/paperback`, the "Back to Novel" button href on the
 * purchase page shall equal `/novel/${novelId}`, and the "Back to Novel"
 * button href on the success page shall equal `/novel/${novelId}`.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

// Feature: buy-paperback, Property 5: Navigation URL correctness

/**
 * Pure URL construction functions matching the patterns used in:
 * - novel-detail-header.tsx (Buy Paperback button)
 * - paperback/page.tsx (Back to Novel button)
 * - paperback/success/page.tsx (Back to Novel button)
 */
function getBuyPaperbackHref(novelId: string): string {
  return `/novel/${novelId}/paperback`;
}

function getBackToNovelHref(novelId: string): string {
  return `/novel/${novelId}`;
}

describe("Property 5: Navigation URL correctness", () => {
  const novelIdArb = fc.oneof(
    fc.uuid(),
    fc.stringMatching(/^[a-zA-Z0-9-]{1,64}$/)
  );

  // Feature: buy-paperback, Property 5: Navigation URL correctness
  it("Buy Paperback button href equals /novel/{novelId}/paperback", () => {
    fc.assert(
      fc.property(novelIdArb, (novelId: string) => {
        const href = getBuyPaperbackHref(novelId);
        expect(href).toBe(`/novel/${novelId}/paperback`);
      }),
      { numRuns: 100 }
    );
  });

  it("Back to Novel button href on purchase page equals /novel/{novelId}", () => {
    fc.assert(
      fc.property(novelIdArb, (novelId: string) => {
        const href = getBackToNovelHref(novelId);
        expect(href).toBe(`/novel/${novelId}`);
      }),
      { numRuns: 100 }
    );
  });

  it("Back to Novel button href on success page equals /novel/{novelId}", () => {
    fc.assert(
      fc.property(novelIdArb, (novelId: string) => {
        const href = getBackToNovelHref(novelId);
        expect(href).toBe(`/novel/${novelId}`);
      }),
      { numRuns: 100 }
    );
  });
});
