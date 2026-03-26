/**
 * Property 9: Navigation path construction
 * Validates: Requirements 4.4, 6.1, 9.1, 10.4
 *
 * For any non-empty slug string, `newsArticlePath(slug)` should produce a string
 * matching the pattern `/updates/{encodedSlug}`, and `newsArchivePath()` should
 * always return `"/updates"`.
 *
 * @see .kiro/specs/news-updates-system/design.md — Correctness Property 9
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { newsArchivePath, newsArticlePath } from "@/lib/navigation";

describe("Property 9: Navigation path construction", () => {
  it("newsArchivePath() always returns '/updates'", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1000 }), () => {
        const path = newsArchivePath();
        expect(path).toBe("/updates");
      }),
      { numRuns: 100 }
    );
  });

  it("newsArticlePath(slug) always starts with '/updates/'", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }),
        (slug) => {
          const path = newsArticlePath(slug);
          expect(path.startsWith("/updates/")).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("newsArticlePath(slug) produces /updates/{encodeURIComponent(slug)}", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }),
        (slug) => {
          const path = newsArticlePath(slug);
          expect(path).toBe(`/updates/${encodeURIComponent(slug)}`);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("special characters in slugs are properly encoded", () => {
    const specialChars = [
      " ", "/", "?", "#", "&", "=", "%", "+", "@", "!",
      "é", "ñ", "ü", "中", "日", "🔥", "<", ">", '"', "'",
    ];
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...specialChars), { minLength: 1, maxLength: 50 }).map(
          (chars) => chars.join("")
        ),
        (slug) => {
          const path = newsArticlePath(slug);
          expect(path).toBe(`/updates/${encodeURIComponent(slug)}`);
          // The encoded part should match encodeURIComponent exactly
          const encodedPart = path.slice("/updates/".length);
          expect(encodedPart).toBe(encodeURIComponent(slug));
        }
      ),
      { numRuns: 100 }
    );
  });
});
