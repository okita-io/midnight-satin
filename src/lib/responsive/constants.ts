/**
 * Responsive system constants for Midnight Satin.
 * Aligns with Tailwind's md: (768px) and lg: (1024px) breakpoints.
 * @see .kiro/specs/midnight-satin-platform/design.md
 * @see Linear THE-45
 */

/** Breakpoint widths in pixels (matches Tailwind defaults) */
export const BREAKPOINTS = {
  /** Mobile: < 768px */
  sm: 640,
  /** Tablet: 768px - 1023px */
  md: 768,
  /** Desktop: 1024px+ */
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

/** Viewport size category for layout decisions */
export type ViewportSize = "mobile" | "tablet" | "desktop";

/** Grid column counts per viewport (progressive enhancement) */
export const GRID_COLUMNS = {
  mobile: 1,
  tablet: 2,
  desktop: 3,
} as const;

/** Library Catalog grid view columns (THE-52): mobile 2, tablet 3, desktop 4 */
export const LIBRARY_GRID_COLUMNS = {
  mobile: 2,
  tablet: 3,
  desktop: 4,
} as const;

/** Library Catalog list view columns (THE-53): mobile 1 (stacked), tablet 2, desktop 1 */
export const LIBRARY_LIST_COLUMNS = {
  mobile: 1,
  tablet: 2,
  desktop: 1,
} as const;

/** Book cover aspect ratio (2:3) per design system */
export const BOOK_COVER_ASPECT_RATIO = { width: 2, height: 3 } as const;

/** Reading content max-width for optimal line length (45-75 chars) */
export const READING_MAX_WIDTH = 720;

/** Max content width for grid sections on desktop (THE-50) */
export const DESKTOP_MAX_WIDTH = 1440;

/** Navigation sidebar width on tablet/desktop */
export const SIDEBAR_WIDTH = 280;

/** Media query strings for use in JS (e.g., matchMedia) */
export const MEDIA_QUERIES = {
  tablet: `(min-width: ${BREAKPOINTS.md}px)`,
  desktop: `(min-width: ${BREAKPOINTS.lg}px)`,
  /** Tablet and up (md+) */
  tabletUp: `(min-width: ${BREAKPOINTS.md}px)`,
  /** Desktop and up (lg+) */
  desktopUp: `(min-width: ${BREAKPOINTS.lg}px)`,
  /** Touch device (coarse pointer) */
  touch: "(pointer: coarse)",
  /** Fine pointer (mouse/stylus) */
  finePointer: "(pointer: fine)",
} as const;
