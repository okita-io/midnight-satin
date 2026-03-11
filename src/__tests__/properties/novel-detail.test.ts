/**
 * Property tests for Novel Detail responsive layout.
 * Validates: Requirements 5.1, 5.4, 5.5, 5.6, 5.8
 *
 * Property 12: Novel Detail Two-Column Layout — Test 2-col layout tablet/desktop
 * Property 13: Novel Detail Cast Preview Responsiveness — Test 4 portraits tablet, 6 desktop
 * Property 14: Novel Detail Chapter List Grid — Test 2-col grid desktop
 * Property 15: Typography Consistency Across Breakpoints — Test font families preserved
 *
 * @see Linear THE-60
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  getViewportSize,
  getNovelDetailUsesTwoColumnLayout,
  getCastPreviewVisibleCount,
  getChapterListColumnsForViewport,
} from "@/lib/responsive/utils";
import {
  BREAKPOINTS,
  CHAPTER_LIST_COLUMNS,
  CAST_PREVIEW_VISIBLE,
} from "@/lib/responsive/constants";
import {
  getTypographyForViewport,
  TYPOGRAPHY_FONTS,
} from "@/lib/design-tokens";

describe("Property 12: Novel Detail Two-Column Layout", () => {
  it("uses stacked layout for tablet viewport (768-1023px)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.md, max: BREAKPOINTS.lg - 1 }),
        (width) => {
          const usesTwoCol = getNovelDetailUsesTwoColumnLayout(width);
          expect(usesTwoCol).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("uses two-column layout for desktop viewport (1024px+)", () => {
    fc.assert(
      fc.property(fc.integer({ min: BREAKPOINTS.lg, max: 4096 }), (width) => {
        const usesTwoCol = getNovelDetailUsesTwoColumnLayout(width);
        expect(usesTwoCol).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it("uses stacked layout for mobile viewport (< 768px)", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: BREAKPOINTS.md - 1 }), (width) => {
        const usesTwoCol = getNovelDetailUsesTwoColumnLayout(width);
        expect(usesTwoCol).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it("two-column layout matches desktop-or-up breakpoint for any viewport", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 4096 }), (width) => {
        const usesTwoCol = getNovelDetailUsesTwoColumnLayout(width);
        expect(usesTwoCol).toBe(width >= BREAKPOINTS.lg);
      }),
      { numRuns: 100 }
    );
  });
});

describe("Property 13: Novel Detail Cast Preview Responsiveness", () => {
  it("shows 4 visible portraits for tablet viewport (768-1023px)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.md, max: BREAKPOINTS.lg - 1 }),
        (width) => {
          const visible = getCastPreviewVisibleCount(width);
          expect(visible).toBe(CAST_PREVIEW_VISIBLE.tablet);
          expect(visible).toBe(4);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("shows 6 visible portraits for desktop viewport (1024px+)", () => {
    fc.assert(
      fc.property(fc.integer({ min: BREAKPOINTS.lg, max: 4096 }), (width) => {
        const visible = getCastPreviewVisibleCount(width);
        expect(visible).toBe(CAST_PREVIEW_VISIBLE.desktop);
        expect(visible).toBe(6);
      }),
      { numRuns: 100 }
    );
  });

  it("cast preview visible count matches CAST_PREVIEW_VISIBLE for tablet and desktop", () => {
    fc.assert(
      fc.property(fc.integer({ min: BREAKPOINTS.md, max: 4096 }), (width) => {
        const size = getViewportSize(width);
        const visible = getCastPreviewVisibleCount(width);
        if (size === "tablet") {
          expect(visible).toBe(4);
        } else {
          expect(visible).toBe(6);
        }
      }),
      { numRuns: 100 }
    );
  });

  it("CAST_PREVIEW_VISIBLE constants are correct", () => {
    expect(CAST_PREVIEW_VISIBLE.tablet).toBe(4);
    expect(CAST_PREVIEW_VISIBLE.desktop).toBe(6);
  });
});

describe("Property 14: Novel Detail Chapter List Grid", () => {
  it("uses 1 column for mobile viewport (< 768px)", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: BREAKPOINTS.md - 1 }), (width) => {
        const cols = getChapterListColumnsForViewport(width);
        expect(cols).toBe(1);
      }),
      { numRuns: 100 }
    );
  });

  it("uses 1 column for tablet viewport (768-1023px)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.md, max: BREAKPOINTS.lg - 1 }),
        (width) => {
          const cols = getChapterListColumnsForViewport(width);
          expect(cols).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("uses 2 columns for desktop viewport (1024px+)", () => {
    fc.assert(
      fc.property(fc.integer({ min: BREAKPOINTS.lg, max: 4096 }), (width) => {
        const cols = getChapterListColumnsForViewport(width);
        expect(cols).toBe(2);
      }),
      { numRuns: 100 }
    );
  });

  it("chapter list columns match CHAPTER_LIST_COLUMNS for any viewport", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 4096 }), (width) => {
        const size = getViewportSize(width);
        const expected = CHAPTER_LIST_COLUMNS[size];
        const actual = getChapterListColumnsForViewport(width);
        expect(actual).toBe(expected);
      }),
      { numRuns: 100 }
    );
  });

  it("CHAPTER_LIST_COLUMNS constants are correct", () => {
    expect(CHAPTER_LIST_COLUMNS.mobile).toBe(1);
    expect(CHAPTER_LIST_COLUMNS.tablet).toBe(1);
    expect(CHAPTER_LIST_COLUMNS.desktop).toBe(2);
  });
});

describe("Property 15: Typography Consistency Across Breakpoints", () => {
  const EXPECTED_FONTS = {
    display: "Playfair Display",
    header: "Cinzel",
    body: "Literata",
    ui: "Marcellus",
    script: "Pinyon Script",
  };

  it("typography tokens match design system fonts", () => {
    expect(TYPOGRAPHY_FONTS.display).toBe(EXPECTED_FONTS.display);
    expect(TYPOGRAPHY_FONTS.header).toBe(EXPECTED_FONTS.header);
    expect(TYPOGRAPHY_FONTS.body).toBe(EXPECTED_FONTS.body);
    expect(TYPOGRAPHY_FONTS.ui).toBe(EXPECTED_FONTS.ui);
    expect(TYPOGRAPHY_FONTS.script).toBe(EXPECTED_FONTS.script);
  });

  it("font families are preserved across any viewport width", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 4096 }),
        fc.integer({ min: 0, max: 4096 }),
        (width1, width2) => {
          const t1 = getTypographyForViewport(width1);
          const t2 = getTypographyForViewport(width2);
          expect(t1.display).toBe(EXPECTED_FONTS.display);
          expect(t1.header).toBe(EXPECTED_FONTS.header);
          expect(t1.body).toBe(EXPECTED_FONTS.body);
          expect(t1.ui).toBe(EXPECTED_FONTS.ui);
          expect(t2.display).toBe(EXPECTED_FONTS.display);
          expect(t2.header).toBe(EXPECTED_FONTS.header);
          expect(t2.body).toBe(EXPECTED_FONTS.body);
          expect(t2.ui).toBe(EXPECTED_FONTS.ui);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("getTypographyForViewport returns same fonts for mobile, tablet, desktop", () => {
    const mobile = getTypographyForViewport(320);
    const tablet = getTypographyForViewport(800);
    const desktop = getTypographyForViewport(1280);
    expect(mobile.display).toBe(tablet.display);
    expect(tablet.display).toBe(desktop.display);
    expect(mobile.body).toBe(tablet.body);
    expect(tablet.body).toBe(desktop.body);
  });
});
