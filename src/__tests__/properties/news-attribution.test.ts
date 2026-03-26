/**
 * Property 6: Attribution logic correctness
 * Validates: Requirements 8.1, 8.2, 8.3, 11.4
 *
 * For any news article, `getNewsAttribution` should return:
 * - "From the Editor" when articleType is editorial or announcement
 * - "Staff" when articleType is ranking or popularity
 * - For campaign: the custom attribution value if non-empty, otherwise "Staff"
 *
 * @see .kiro/specs/news-updates-system/design.md — Correctness Property 6
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { getNewsAttribution } from "@/lib/content";
import type { NewsArticleType } from "@/lib/db/types";

const ARTICLE_TYPES: NewsArticleType[] = [
  "editorial",
  "campaign",
  "ranking",
  "popularity",
  "announcement",
];

describe("Property 6: Attribution logic correctness", () => {
  it("editorial and announcement types always return 'From the Editor'", () => {
    fc.assert(
      fc.property(
        fc.constantFrom<NewsArticleType>("editorial", "announcement"),
        fc.string(),
        (articleType, attribution) => {
          const result = getNewsAttribution({ articleType, attribution });
          expect(result).toBe("From the Editor");
        }
      ),
      { numRuns: 100 }
    );
  });

  it("ranking and popularity types always return 'Staff'", () => {
    fc.assert(
      fc.property(
        fc.constantFrom<NewsArticleType>("ranking", "popularity"),
        fc.string(),
        (articleType, attribution) => {
          const result = getNewsAttribution({ articleType, attribution });
          expect(result).toBe("Staff");
        }
      ),
      { numRuns: 100 }
    );
  });

  it("campaign type returns custom attribution if non-empty, otherwise 'Staff'", () => {
    fc.assert(
      fc.property(
        fc.string(),
        (attribution) => {
          const result = getNewsAttribution({ articleType: "campaign", attribution });
          if (attribution.length > 0) {
            expect(result).toBe(attribution);
          } else {
            expect(result).toBe("Staff");
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("all article types produce a non-empty string attribution", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ARTICLE_TYPES),
        fc.string({ minLength: 0, maxLength: 200 }),
        (articleType, attribution) => {
          const result = getNewsAttribution({ articleType, attribution });
          expect(typeof result).toBe("string");
          expect(result.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
