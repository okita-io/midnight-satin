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

/** Chapter list columns (THE-59): mobile/tablet 1, desktop 2 */
export const CHAPTER_LIST_COLUMNS = {
  mobile: 1,
  tablet: 1,
  desktop: 2,
} as const;

/** Cast Gallery grid columns (THE-64): mobile 1 (single card), tablet 2, desktop 3 */
export const CAST_GALLERY_GRID_COLUMNS = {
  mobile: 1,
  tablet: 2,
  desktop: 3,
} as const;

/** Trophy Case grid columns (THE-69): mobile 2, tablet 3, desktop 4 */
export const TROPHY_CASE_GRID_COLUMNS = {
  mobile: 2,
  tablet: 3,
  desktop: 4,
} as const;

/** Vault CreditPackGrid columns (THE-72): mobile 2, tablet 2, desktop 3 */
export const VAULT_GRID_COLUMNS = {
  mobile: 2,
  tablet: 2,
  desktop: 3,
} as const;

/** Vault grid responsive gaps (THE-72): tablet 24px, desktop 32px */
export const VAULT_GRID_GAP = {
  tablet: 24,
  desktop: 32,
} as const;

/** Author's Study two-column layout split (THE-67): 35% biography, 65% bibliography (7fr/13fr) */
export const AUTHORS_STUDY_TWO_COLUMN_SPLIT = {
  biography: 35,
  bibliography: 65,
} as const;

/** Cast Gallery responsive gaps: 24px tablet, 32px desktop (THE-64) */
export const CAST_GALLERY_GRID_GAP = {
  tablet: 24,
  desktop: 32,
} as const;

/** Cast preview (PlayersSection) visible portraits (THE-58): tablet 4, desktop 6 */
export const CAST_PREVIEW_VISIBLE = {
  tablet: 4,
  desktop: 6,
} as const;

/** Followed authors strip visible avatars (THE-80): tablet 6, desktop 8 */
export const FOLLOWED_AUTHORS_STRIP_VISIBLE = {
  tablet: 6,
  desktop: 8,
} as const;

/** Profile library grid columns (THE-81): mobile 1, tablet 2, desktop 3 */
export const PROFILE_LIBRARY_GRID_COLUMNS = {
  mobile: 1,
  tablet: 2,
  desktop: 3,
} as const;

/** Profile library grid responsive gaps (THE-81): tablet 24px, desktop 32px */
export const PROFILE_LIBRARY_GRID_GAP = {
  tablet: 24,
  desktop: 32,
} as const;

/** Profile FollowedAuthorsStrip hexagonal avatar clip-path (THE-80, THE-83) */
export const PROFILE_HEXAGON_CLIP =
  "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

/** Cast preview portrait sizes in px (THE-58): mobile 80, tablet 112, desktop 96 */
export const CAST_PREVIEW_PORTRAIT_SIZE = {
  mobile: 80,
  tablet: 112,
  desktop: 96,
} as const;

/** Book cover aspect ratio (2:3) per design system */
export const BOOK_COVER_ASPECT_RATIO = { width: 2, height: 3 } as const;

/** Cast Gallery character portrait aspect ratio (3:4) per THE-64: aspect-[3/4] */
export const CAST_GALLERY_PORTRAIT_ASPECT_RATIO = { width: 3, height: 4 } as const;

/** Reading content max-width for optimal line length (45-75 chars) */
export const READING_MAX_WIDTH = 720;

/** Chapter content max-width by viewport (THE-61): tablet 680px, desktop 720px; mobile no constraint */
export const CHAPTER_CONTENT_MAX_WIDTH = {
  mobile: null as number | null,
  tablet: 680,
  desktop: 720,
} as const;

/** Comments sidebar visible only on desktop (lg: 1024px+) — THE-62 */
export const COMMENTS_SIDEBAR_BREAKPOINT = "lg" as const;

/** Auth form max-width by viewport (THE-76, THE-78): mobile max-w-md (448px), tablet/desktop 480px */
export const AUTH_FORM_MAX_WIDTH = {
  mobile: 448,
  tablet: 480,
  desktop: 480,
} as const;

/** Shimmer placeholder grid columns (THE-91): mobile 2, tablet 2, desktop 3 per row */
export const SHIMMER_GRID_COLUMNS = {
  mobile: 2,
  tablet: 2,
  desktop: 3,
} as const;

/** Max content width for grid sections on desktop (THE-50) */
export const DESKTOP_MAX_WIDTH = 1440;

/** Navigation sidebar width on tablet/desktop */
export const SIDEBAR_WIDTH = 280;

/**
 * Interaction constants for touch and pointer (THE-86, THE-87).
 * Req 13.5, 13.6, 13.7: cursor pointer on interactive elements, touch feedback preserved.
 */
/** Cursor for interactive elements (buttons, links, role=button) */
export const INTERACTIVE_CURSOR = "cursor-pointer" as const;
/** Common touch/click active scale for icons and small controls */
export const INTERACTIVE_ACTIVE_SCALE = "active:scale-95" as const;
/** Touch-action to reduce tap delay on buttons/links */
export const TOUCH_ACTION_MANIPULATION = "touch-manipulation" as const;

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
