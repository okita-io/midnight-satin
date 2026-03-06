/**
 * Property tests for Reading Room responsiveness and component preservation.
 * Validates: Requirements 6.1, 6.2, 6.3, 6.7, 6.8, 7.1, 7.5, 7.6, 7.7
 *
 * Property 16: Reading Room Text Centering — Test max-width and centering
 * Property 17: Reading Room Component Preservation — Test Veil, blur, unlock preserved
 * Property 18: Comments Sidebar Desktop Rendering — Test sidebar desktop, below mobile/tablet
 * Property 19: Comments Styling Consistency — Test comment styling preserved
 *
 * @see Linear THE-63
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  getViewportSize,
  getChapterContentMaxWidth,
  isCommentsSidebarVisible,
  isCommentsSectionPrimary,
} from "@/lib/responsive/utils";
import {
  BREAKPOINTS,
  CHAPTER_CONTENT_MAX_WIDTH,
} from "@/lib/responsive/constants";
import {
  BLUR_LEVELS,
  FREE_PREVIEW_PARAGRAPHS,
} from "@/app/_components/reading-room/chapter-content";
import {
  COMMENTS_HEADER_TITLE,
  COMMENTS_HEADER_CLASSES,
  COMMENT_AUTHOR_CLASSES,
  COMMENT_CONTENT_CLASSES,
} from "@/lib/comments-ui-constants";
import { COLOR_TOKENS, TYPOGRAPHY_FONTS } from "@/lib/design-tokens";

describe("Property 16: Reading Room Text Centering", () => {
  it("mobile viewport has no max-width constraint", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: BREAKPOINTS.md - 1 }),
        (width) => {
          const maxWidth = getChapterContentMaxWidth(width);
          expect(maxWidth).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("tablet viewport (768-1023px) uses 680px max-width", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.md, max: BREAKPOINTS.lg - 1 }),
        (width) => {
          const maxWidth = getChapterContentMaxWidth(width);
          expect(maxWidth).toBe(680);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("desktop viewport (1024px+) uses 720px max-width", () => {
    fc.assert(
      fc.property(fc.integer({ min: BREAKPOINTS.lg, max: 4096 }), (width) => {
        const maxWidth = getChapterContentMaxWidth(width);
        expect(maxWidth).toBe(720);
      }),
      { numRuns: 100 }
    );
  });

  it("max-width matches CHAPTER_CONTENT_MAX_WIDTH for any viewport", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 4096 }), (width) => {
        const size = getViewportSize(width);
        const expected = CHAPTER_CONTENT_MAX_WIDTH[size];
        const actual = getChapterContentMaxWidth(width);
        expect(actual).toBe(expected);
      }),
      { numRuns: 100 }
    );
  });

  it("CHAPTER_CONTENT_MAX_WIDTH constants are correct", () => {
    expect(CHAPTER_CONTENT_MAX_WIDTH.mobile).toBeNull();
    expect(CHAPTER_CONTENT_MAX_WIDTH.tablet).toBe(680);
    expect(CHAPTER_CONTENT_MAX_WIDTH.desktop).toBe(720);
  });
});

describe("Property 17: Reading Room Component Preservation", () => {
  it("blur levels follow design: 1px/60%, 3px/40%, 6px/20%", () => {
    expect(BLUR_LEVELS).toHaveLength(3);
    expect(BLUR_LEVELS[0]).toEqual({
      blur: "blur-[1px]",
      opacity: "opacity-60",
    });
    expect(BLUR_LEVELS[1]).toEqual({
      blur: "blur-[3px]",
      opacity: "opacity-40",
    });
    expect(BLUR_LEVELS[2]).toEqual({
      blur: "blur-[6px]",
      opacity: "opacity-20",
    });
  });

  it("free preview paragraphs is 5 per Req 4.1", () => {
    expect(FREE_PREVIEW_PARAGRAPHS).toBe(5);
  });

  it("blur levels have distinct blur values in ascending order", () => {
    const blurPx = BLUR_LEVELS.map((l) =>
      parseInt(l.blur.replace("blur-[", "").replace("px]", ""), 10)
    );
    expect(blurPx[0]).toBeLessThan(blurPx[1]);
    expect(blurPx[1]).toBeLessThan(blurPx[2]);
    expect(blurPx).toEqual([1, 3, 6]);
  });

  it("opacity decreases with blur (60% -> 40% -> 20%)", () => {
    const opacities = BLUR_LEVELS.map((l) =>
      parseInt(l.opacity.replace("opacity-", ""), 10)
    );
    expect(opacities[0]).toBeGreaterThan(opacities[1]);
    expect(opacities[1]).toBeGreaterThan(opacities[2]);
    expect(opacities).toEqual([60, 40, 20]);
  });
});

describe("Property 18: Comments Sidebar Desktop Rendering", () => {
  it("sidebar visible only on desktop (1024px+)", () => {
    fc.assert(
      fc.property(fc.integer({ min: BREAKPOINTS.lg, max: 4096 }), (width) => {
        expect(isCommentsSidebarVisible(width)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it("sidebar hidden on mobile (< 768px)", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: BREAKPOINTS.md - 1 }), (width) => {
        expect(isCommentsSidebarVisible(width)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it("sidebar hidden on tablet (768-1023px)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.md, max: BREAKPOINTS.lg - 1 }),
        (width) => {
          expect(isCommentsSidebarVisible(width)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("comments section is primary on mobile/tablet, sidebar on desktop", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 4096 }), (width) => {
        const sectionPrimary = isCommentsSectionPrimary(width);
        const sidebarVisible = isCommentsSidebarVisible(width);
        expect(sectionPrimary).toBe(!sidebarVisible);
      }),
      { numRuns: 100 }
    );
  });

  it("sidebar visibility matches lg breakpoint exactly", () => {
    expect(isCommentsSidebarVisible(BREAKPOINTS.lg - 1)).toBe(false);
    expect(isCommentsSidebarVisible(BREAKPOINTS.lg)).toBe(true);
  });
});

describe("Property 19: Comments Styling Consistency", () => {
  it("comments header title is consistent", () => {
    expect(COMMENTS_HEADER_TITLE).toBe("Thoughts from the Boudoir");
  });

  it("comments header uses font-heading and primary gold", () => {
    expect(COMMENTS_HEADER_CLASSES).toContain("font-heading");
    expect(COMMENTS_HEADER_CLASSES).toContain("text-primary");
  });

  it("comment author uses font-heading", () => {
    expect(COMMENT_AUTHOR_CLASSES).toContain("font-heading");
  });

  it("comment content uses font-body and italic", () => {
    expect(COMMENT_CONTENT_CLASSES).toContain("font-body");
    expect(COMMENT_CONTENT_CLASSES).toContain("italic");
  });

  it("comment styling uses design system color tokens", () => {
    expect(COLOR_TOKENS.primary).toBe("#D4AF37");
    expect(COLOR_TOKENS.void).toBe("#050505");
    expect(COLOR_TOKENS.text).toBe("#EAEAEA");
  });

  it("comment typography matches design system fonts", () => {
    expect(TYPOGRAPHY_FONTS.header).toBe("Cinzel");
    expect(TYPOGRAPHY_FONTS.body).toBe("Literata");
    expect(TYPOGRAPHY_FONTS.ui).toBe("Marcellus");
  });

  it("comments styling constants are viewport-invariant", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 4096 }),
        fc.integer({ min: 0, max: 4096 }),
        (w1, w2) => {
          // Same constants apply regardless of viewport
          expect(COMMENTS_HEADER_TITLE).toBe("Thoughts from the Boudoir");
          expect(COMMENTS_HEADER_CLASSES).toContain("text-primary");
          expect(COMMENT_AUTHOR_CLASSES).toContain("font-heading");
          void w1;
          void w2;
        }
      ),
      { numRuns: 100 }
    );
  });
});
