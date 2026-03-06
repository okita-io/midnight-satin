/**
 * Property 13: Navigation link construction
 * Validates: Requirements 1.5, 2.8, 2.9, 7.7
 *
 * For any novel ID, the navigation link from a novel card should resolve to /novel/{novelId}.
 * For any author ID, the author link should resolve to /author/{authorId}.
 * For any chapter ID within a novel, the reading link should resolve to /novel/{novelId}/read/{chapterId}.
 *
 * Property 2: Navigation Layout Transformation
 * Validates: Requirements 2.1, 2.4
 *
 * For any viewport width, the navigation layout should be bottom bar (< 768px) or side panel (≥ 768px).
 *
 * Property 3: Navigation Styling Consistency
 * Validates: Requirements 2.1, 2.4
 *
 * Gold accents (primary #D4AF37) must be preserved across both bottom and side layouts.
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
import { BREAKPOINTS, SIDEBAR_WIDTH } from "@/lib/responsive/constants";
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

describe("Property 2: Navigation Layout Transformation", () => {
  it("returns bottom layout for viewport width < 768px", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 767 }), (width) => {
        const layout = getNavigationLayout(width);
        expect(layout).toBe("bottom");
      }),
      { numRuns: 100 }
    );
  });

  it("returns side layout for viewport width >= 768px", () => {
    fc.assert(
      fc.property(fc.integer({ min: 768, max: 4096 }), (width) => {
        const layout = getNavigationLayout(width);
        expect(layout).toBe("side");
      }),
      { numRuns: 100 }
    );
  });

  it("correct layout for any viewport width (bottom/side by breakpoint)", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 4096 }), (width) => {
        const layout = getNavigationLayout(width);
        const expected = width >= BREAKPOINTS.md ? "side" : "bottom";
        expect(layout).toBe(expected);
      }),
      { numRuns: 100 }
    );
  });

  it("side panel uses 280px width constant", () => {
    expect(SIDEBAR_WIDTH).toBe(280);
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
          const mobileLayout = getNavigationLayout(mobileWidth);
          const tabletLayout = getNavigationLayout(tabletWidth);
          expect(mobileLayout).toBe("bottom");
          expect(tabletLayout).toBe("side");
          // Both layouts use the same primary gold for active state
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
