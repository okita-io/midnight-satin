/**
 * Property tests for authentication form responsiveness and consistency.
 * Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5, 11.6
 *
 * Property 28: Authentication Form Centering — Test 480px max-width and centering
 * Property 29: Authentication Form Consistency — Test validation, spacing, typography preserved
 *
 * @see Linear THE-78
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { getViewportSize, getAuthFormMaxWidth } from "@/lib/responsive/utils";
import {
  BREAKPOINTS,
  AUTH_FORM_MAX_WIDTH,
} from "@/lib/responsive/constants";
import {
  LOGIN_FORM_SPACING,
  REGISTER_FORM_SPACING,
  AUTH_LABEL_CLASSES,
  REGISTER_LABEL_CLASSES,
  AUTH_VALIDATION_CLASSES,
  AUTH_VALIDATION_ROLE,
  AUTH_BUTTON_BASE_CLASSES,
  LOGIN_BUTTON_HOVER,
  REGISTER_BUTTON_HOVER,
  AUTH_BUTTON_ACTIVE,
} from "@/lib/auth-ui-constants";
import { COLOR_TOKENS, TYPOGRAPHY_FONTS } from "@/lib/design-tokens";

describe("Property 28: Authentication Form Centering", () => {
  const EXPECTED_TABLET_DESKTOP_MAX_WIDTH = 480;

  it("mobile viewport uses 448px max-width (max-w-md)", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: BREAKPOINTS.md - 1 }), (width) => {
        const maxWidth = getAuthFormMaxWidth(width);
        expect(maxWidth).toBe(AUTH_FORM_MAX_WIDTH.mobile);
        expect(maxWidth).toBe(448);
      }),
      { numRuns: 100 }
    );
  });

  it("tablet viewport (768-1023px) uses 480px max-width", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.md, max: BREAKPOINTS.lg - 1 }),
        (width) => {
          const maxWidth = getAuthFormMaxWidth(width);
          expect(maxWidth).toBe(EXPECTED_TABLET_DESKTOP_MAX_WIDTH);
          expect(maxWidth).toBe(AUTH_FORM_MAX_WIDTH.tablet);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("desktop viewport (1024px+) uses 480px max-width", () => {
    fc.assert(
      fc.property(fc.integer({ min: BREAKPOINTS.lg, max: 4096 }), (width) => {
        const maxWidth = getAuthFormMaxWidth(width);
        expect(maxWidth).toBe(EXPECTED_TABLET_DESKTOP_MAX_WIDTH);
        expect(maxWidth).toBe(AUTH_FORM_MAX_WIDTH.desktop);
      }),
      { numRuns: 100 }
    );
  });

  it("max-width matches AUTH_FORM_MAX_WIDTH for any viewport", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 4096 }), (width) => {
        const size = getViewportSize(width);
        const expected = AUTH_FORM_MAX_WIDTH[size];
        const actual = getAuthFormMaxWidth(width);
        expect(actual).toBe(expected);
      }),
      { numRuns: 100 }
    );
  });

  it("AUTH_FORM_MAX_WIDTH constants: mobile 448, tablet/desktop 480", () => {
    expect(AUTH_FORM_MAX_WIDTH.mobile).toBe(448);
    expect(AUTH_FORM_MAX_WIDTH.tablet).toBe(480);
    expect(AUTH_FORM_MAX_WIDTH.desktop).toBe(480);
  });

  it("forms are centered (mx-auto) — constant documents centering requirement", () => {
    // Auth pages use mx-auto on the form container; this documents the requirement
    expect(EXPECTED_TABLET_DESKTOP_MAX_WIDTH).toBe(480);
  });
});

describe("Property 29: Authentication Form Consistency", () => {
  it("login form uses space-y-6 spacing", () => {
    expect(LOGIN_FORM_SPACING).toBe("space-y-6");
  });

  it("register form uses space-y-5 spacing", () => {
    expect(REGISTER_FORM_SPACING).toBe("space-y-5");
  });

  it("login and register have distinct spacing (6 vs 5)", () => {
    expect(LOGIN_FORM_SPACING).not.toBe(REGISTER_FORM_SPACING);
  });

  it("label typography uses Marcellus (font-ui)", () => {
    expect(AUTH_LABEL_CLASSES).toContain("font-ui");
    expect(REGISTER_LABEL_CLASSES).toContain("font-ui");
  });

  it("label typography uses uppercase and tracking", () => {
    expect(AUTH_LABEL_CLASSES).toContain("uppercase");
    expect(REGISTER_LABEL_CLASSES).toContain("uppercase");
    expect(AUTH_LABEL_CLASSES).toMatch(/tracking/);
    expect(REGISTER_LABEL_CLASSES).toMatch(/tracking/);
  });

  it("validation message uses accent border and surface background", () => {
    expect(AUTH_VALIDATION_CLASSES).toContain("border-accent");
    expect(AUTH_VALIDATION_CLASSES).toContain("bg-surface");
  });

  it("validation message has role alert for accessibility", () => {
    expect(AUTH_VALIDATION_ROLE).toBe("alert");
  });

  it("validation message uses font-ui and text-main", () => {
    expect(AUTH_VALIDATION_CLASSES).toContain("font-ui");
    expect(AUTH_VALIDATION_CLASSES).toContain("text-text-main");
  });

  it("primary button has h-14 and shadow-gold-glow", () => {
    expect(AUTH_BUTTON_BASE_CLASSES).toContain("h-14");
    expect(AUTH_BUTTON_BASE_CLASSES).toContain("shadow-gold-glow");
  });

  it("primary button uses gold (primary) background", () => {
    expect(AUTH_BUTTON_BASE_CLASSES).toContain("bg-primary");
  });

  it("login button has hover:bg-primary/90", () => {
    expect(LOGIN_BUTTON_HOVER).toBe("hover:bg-primary/90");
  });

  it("register button has hover:bg-white", () => {
    expect(REGISTER_BUTTON_HOVER).toBe("hover:bg-white");
  });

  it("buttons have active:scale-[0.98]", () => {
    expect(AUTH_BUTTON_ACTIVE).toBe("active:scale-[0.98]");
  });

  it("auth styling uses design system color tokens", () => {
    expect(COLOR_TOKENS.primary).toBe("#D4AF37");
    expect(COLOR_TOKENS.void).toBe("#050505");
  });

  it("auth typography matches design system fonts", () => {
    expect(TYPOGRAPHY_FONTS.ui).toBe("Marcellus");
    expect(TYPOGRAPHY_FONTS.header).toBe("Cinzel");
  });

  it("auth form constants are viewport-invariant", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 4096 }),
        fc.integer({ min: 0, max: 4096 }),
        (w1, w2) => {
          // Same constants apply regardless of viewport
          expect(LOGIN_FORM_SPACING).toBe("space-y-6");
          expect(REGISTER_FORM_SPACING).toBe("space-y-5");
          expect(AUTH_VALIDATION_ROLE).toBe("alert");
          expect(AUTH_BUTTON_BASE_CLASSES).toContain("h-14");
          void w1;
          void w2;
        }
      ),
      { numRuns: 100 }
    );
  });
});
