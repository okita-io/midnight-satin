/**
 * Property tests for Profile page responsiveness and styling preservation.
 * Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7
 *
 * Property 30: Profile Stats Layout Responsiveness — Test horizontal row tablet/desktop
 * Property 31: Profile Followed Authors Responsiveness — Test 6 avatars tablet, 8 desktop
 * Property 32: Profile Library Grid Responsiveness — Test 2 cols tablet, 3 cols desktop
 * Property 33: Profile Styling Preservation — Test hexagonal avatars, gold accents preserved
 *
 * @see Linear THE-83
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  getViewportSize,
  getProfileStatsUsesHorizontalRow,
  getFollowedAuthorsStripVisibleCount,
  getProfileLibraryGridColumnsForViewport,
} from "@/lib/responsive/utils";
import {
  BREAKPOINTS,
  PROFILE_LIBRARY_GRID_COLUMNS,
  PROFILE_LIBRARY_GRID_GAP,
  FOLLOWED_AUTHORS_STRIP_VISIBLE,
  PROFILE_HEXAGON_CLIP,
} from "@/lib/responsive/constants";
import { COLOR_TOKENS } from "@/lib/design-tokens";

describe("Property 30: Profile Stats Layout Responsiveness", () => {
  it("uses horizontal row for tablet viewport (768-1023px)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.md, max: BREAKPOINTS.lg - 1 }),
        (width) => {
          const usesHorizontal = getProfileStatsUsesHorizontalRow(width);
          expect(usesHorizontal).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("uses horizontal row for desktop viewport (1024px+)", () => {
    fc.assert(
      fc.property(fc.integer({ min: BREAKPOINTS.lg, max: 4096 }), (width) => {
        const usesHorizontal = getProfileStatsUsesHorizontalRow(width);
        expect(usesHorizontal).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it("uses horizontal scroll (not fixed row) for mobile viewport (< 768px)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: BREAKPOINTS.md - 1 }),
        (width) => {
          const usesHorizontal = getProfileStatsUsesHorizontalRow(width);
          expect(usesHorizontal).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("horizontal row layout matches tablet-or-up breakpoint for any viewport", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 4096 }), (width) => {
        const usesHorizontal = getProfileStatsUsesHorizontalRow(width);
        expect(usesHorizontal).toBe(width >= BREAKPOINTS.md);
      }),
      { numRuns: 100 }
    );
  });
});

describe("Property 31: Profile Followed Authors Responsiveness", () => {
  it("returns 6 visible avatars for tablet viewport (768-1023px)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.md, max: BREAKPOINTS.lg - 1 }),
        (width) => {
          const count = getFollowedAuthorsStripVisibleCount(width);
          expect(count).toBe(6);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("returns 8 visible avatars for desktop viewport (1024px+)", () => {
    fc.assert(
      fc.property(fc.integer({ min: BREAKPOINTS.lg, max: 4096 }), (width) => {
        const count = getFollowedAuthorsStripVisibleCount(width);
        expect(count).toBe(8);
      }),
      { numRuns: 100 }
    );
  });

  it("returns 0 for mobile viewport (horizontal scroll, no fixed count)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: BREAKPOINTS.md - 1 }),
        (width) => {
          const count = getFollowedAuthorsStripVisibleCount(width);
          expect(count).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("visible count matches FOLLOWED_AUTHORS_STRIP_VISIBLE for any viewport", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 4096 }), (width) => {
        const size = getViewportSize(width);
        const expected =
          size === "mobile" ? 0 : FOLLOWED_AUTHORS_STRIP_VISIBLE[size];
        const actual = getFollowedAuthorsStripVisibleCount(width);
        expect(actual).toBe(expected);
      }),
      { numRuns: 100 }
    );
  });

  it("FOLLOWED_AUTHORS_STRIP_VISIBLE constants are correct (6 tablet, 8 desktop)", () => {
    expect(FOLLOWED_AUTHORS_STRIP_VISIBLE.tablet).toBe(6);
    expect(FOLLOWED_AUTHORS_STRIP_VISIBLE.desktop).toBe(8);
  });
});

describe("Property 32: Profile Library Grid Responsiveness", () => {
  it("returns 1 column for mobile viewport (< 768px)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: BREAKPOINTS.md - 1 }),
        (width) => {
          const cols = getProfileLibraryGridColumnsForViewport(width);
          expect(cols).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("returns 2 columns for tablet viewport (768-1023px)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.md, max: BREAKPOINTS.lg - 1 }),
        (width) => {
          const cols = getProfileLibraryGridColumnsForViewport(width);
          expect(cols).toBe(2);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("returns 3 columns for desktop viewport (1024px+)", () => {
    fc.assert(
      fc.property(fc.integer({ min: BREAKPOINTS.lg, max: 4096 }), (width) => {
        const cols = getProfileLibraryGridColumnsForViewport(width);
        expect(cols).toBe(3);
      }),
      { numRuns: 100 }
    );
  });

  it("grid columns match PROFILE_LIBRARY_GRID_COLUMNS for any viewport", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 4096 }), (width) => {
        const size = getViewportSize(width);
        const expected = PROFILE_LIBRARY_GRID_COLUMNS[size];
        const actual = getProfileLibraryGridColumnsForViewport(width);
        expect(actual).toBe(expected);
      }),
      { numRuns: 100 }
    );
  });

  it("PROFILE_LIBRARY_GRID_COLUMNS constants are correct (1 mobile, 2 tablet, 3 desktop)", () => {
    expect(PROFILE_LIBRARY_GRID_COLUMNS.mobile).toBe(1);
    expect(PROFILE_LIBRARY_GRID_COLUMNS.tablet).toBe(2);
    expect(PROFILE_LIBRARY_GRID_COLUMNS.desktop).toBe(3);
  });

  it("PROFILE_LIBRARY_GRID_GAP constants match design (24px tablet, 32px desktop)", () => {
    expect(PROFILE_LIBRARY_GRID_GAP.tablet).toBe(24);
    expect(PROFILE_LIBRARY_GRID_GAP.desktop).toBe(32);
  });
});

describe("Property 33: Profile Styling Preservation", () => {
  it("hexagonal avatar clip-path is preserved (FollowedAuthorsStrip)", () => {
    const expected =
      "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";
    expect(PROFILE_HEXAGON_CLIP).toBe(expected);
  });

  it("hexagon clip defines 6 vertices (hexagonal shape)", () => {
    const polygonMatch = PROFILE_HEXAGON_CLIP.match(/[\d.]+%/g);
    expect(polygonMatch).not.toBeNull();
    expect(polygonMatch!.length).toBe(12); // 6 points × 2 (x, y)
  });

  it("primary gold color token is preserved for accents (Req 14.1)", () => {
    expect(COLOR_TOKENS.primary).toBe("#D4AF37");
  });

  it("gold accents are viewport-invariant", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 4096 }),
        fc.integer({ min: 0, max: 4096 }),
        (width1, width2) => {
          expect(COLOR_TOKENS.primary).toBe("#D4AF37");
          expect(COLOR_TOKENS.primary).toBe(COLOR_TOKENS.primary);
        }
      ),
      { numRuns: 50 }
    );
  });

  it("design system gold (#D4AF37) matches primary token across viewports", () => {
    const DESIGN_GOLD = "#D4AF37";
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 4096 }), () => {
        expect(COLOR_TOKENS.primary).toBe(DESIGN_GOLD);
      }),
      { numRuns: 50 }
    );
  });

  it("hexagonal avatars and gold accents constants are viewport-invariant", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 4096 }), () => {
        expect(PROFILE_HEXAGON_CLIP).toContain("polygon");
        expect(PROFILE_HEXAGON_CLIP).toContain("50%");
        expect(COLOR_TOKENS.primary).toBe("#D4AF37");
      }),
      { numRuns: 50 }
    );
  });
});
