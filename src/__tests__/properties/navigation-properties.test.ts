/**
 * Property 13: Navigation link construction
 * Validates: Requirements 1.5, 2.8, 2.9, 7.7
 *
 * For any novel ID, the navigation link from a novel card should resolve to /novel/{novelId}.
 * For any author ID, the author link should resolve to /author/{authorId}.
 * For any chapter ID within a novel, the reading link should resolve to /novel/{novelId}/read/{chapterId}.
 *
 * Property 2: Navigation Layout — always bottom bar
 * Validates: Requirements 2.1, 2.4
 *
 * For any viewport width, the navigation layout is always a bottom bar.
 *
 * Property 3: Navigation Styling Consistency
 * Validates: Requirements 2.1, 2.4
 *
 * Gold accents (primary #D4AF37) must be preserved across all viewports.
 *
 * @see Linear THE-48
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  novelDetailPath,
  authorStudyPath,
  readingRoomPath,
} from "@/lib/navigation";
import { getNavigationLayout } from "@/lib/responsive/utils";
import { BREAKPOINTS } from "@/lib/responsive/constants";
import { COLOR_TOKENS } from "@/lib/design-tokens";

describe("Property 13: Navigation link construction", () => {
  it("novelDetailPath(novelId) produces /novel/{encoded novelId}", () => {
    fc.assert(
      fc.property(fc.uuid(), (novelId) => {
        const path = novelDetailPath(novelId);
        expect(path).toBe(`/novel/${encodeURIComponent(novelId)}`);
        expect(path.startsWith("/novel/")).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it("authorStudyPath(authorId) produces /author/{encoded authorId}", () => {
    fc.assert(
      fc.property(fc.uuid(), (authorId) => {
        const path = authorStudyPath(authorId);
        expect(path).toBe(`/author/${encodeURIComponent(authorId)}`);
        expect(path.startsWith("/author/")).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it("readingRoomPath(novelId, chapterId) produces /novel/{novelId}/read/{chapterId}", () => {
    fc.assert(
      fc.property(fc.uuid(), fc.uuid(), (novelId, chapterId) => {
        const path = readingRoomPath(novelId, chapterId);
        expect(path).toBe(
          `/novel/${encodeURIComponent(novelId)}/read/${encodeURIComponent(chapterId)}`
        );
        expect(path.startsWith("/novel/")).toBe(true);
        expect(path).toContain("/read/");
      }),
      { numRuns: 100 }
    );
  });
});

describe("Property 2: Navigation Layout — always bottom bar", () => {
  it("returns bottom layout for any viewport width", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 4096 }), (width) => {
        const layout = getNavigationLayout(width);
        expect(layout).toBe("bottom");
      }),
      { numRuns: 100 }
    );
  });

  it("returns bottom layout below md breakpoint", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: BREAKPOINTS.md - 1 }), (width) => {
        expect(getNavigationLayout(width)).toBe("bottom");
      }),
      { numRuns: 100 }
    );
  });

  it("returns bottom layout at and above md breakpoint", () => {
    fc.assert(
      fc.property(fc.integer({ min: BREAKPOINTS.md, max: 4096 }), (width) => {
        expect(getNavigationLayout(width)).toBe("bottom");
      }),
      { numRuns: 100 }
    );
  });
});

describe("Property 3: Navigation Styling Consistency", () => {
  const DESIGN_SPEC_PRIMARY = "#D4AF37";

  it("primary gold color token matches design spec", () => {
    expect(COLOR_TOKENS.primary).toBe(DESIGN_SPEC_PRIMARY);
  });

  it("gold accents preserved across any viewport width", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 767 }),
        fc.integer({ min: 768, max: 4096 }),
        (mobileWidth, tabletWidth) => {
          expect(getNavigationLayout(mobileWidth)).toBe("bottom");
          expect(getNavigationLayout(tabletWidth)).toBe("bottom");
          expect(COLOR_TOKENS.primary).toBe(DESIGN_SPEC_PRIMARY);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("primary color is valid hex format", () => {
    expect(COLOR_TOKENS.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
});
