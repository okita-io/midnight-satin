/**
 * Viewport detection utilities for Midnight Satin responsive system.
 * Use for SSR-safe or non-hook contexts.
 * @see Linear THE-45
 */

import {
  BREAKPOINTS,
  GRID_COLUMNS,
  LIBRARY_GRID_COLUMNS,
  LIBRARY_LIST_COLUMNS,
  CHAPTER_LIST_COLUMNS,
  CAST_PREVIEW_VISIBLE,
  CAST_GALLERY_GRID_COLUMNS,
  TROPHY_CASE_GRID_COLUMNS,
  VAULT_GRID_COLUMNS,
  CHAPTER_CONTENT_MAX_WIDTH,
  AUTH_FORM_MAX_WIDTH,
  PROFILE_LIBRARY_GRID_COLUMNS,
  FOLLOWED_AUTHORS_STRIP_VISIBLE,
  SHIMMER_GRID_COLUMNS,
  type ViewportSize,
} from "./constants";

/** Navigation layout mode: bottom bar (mobile) or side panel (tablet/desktop) */
export type NavigationLayout = "bottom" | "side";

/**
 * Resolve navigation layout from viewport width.
 * Mobile (< 768px): bottom bar. Tablet/Desktop (≥ 768px): side panel.
 * Matches Tailwind md: breakpoint and NavigationBar CSS (md:hidden, hidden md:flex).
 * @see Linear THE-48
 */
export function getNavigationLayout(width: number): NavigationLayout {
  return width >= BREAKPOINTS.md ? "side" : "bottom";
}

/**
 * Resolve viewport size from a given width (e.g., from window.innerWidth).
 * Safe to call in any context; does not access window.
 */
export function getViewportSize(width: number): ViewportSize {
  if (width >= BREAKPOINTS.lg) return "desktop";
  if (width >= BREAKPOINTS.md) return "tablet";
  return "mobile";
}

/**
 * Resolve grid column count for a viewport width.
 * Hero carousel and Boudoir grid sections use: mobile 1, tablet 2, desktop 3.
 * @see Linear THE-51
 */
export function getGridColumnsForViewport(width: number): number {
  return GRID_COLUMNS[getViewportSize(width)];
}

/**
 * Resolve Library Catalog grid view column count for a viewport width.
 * Grid: mobile 2, tablet 3, desktop 4.
 * @see Linear THE-52
 */
export function getLibraryGridColumnsForViewport(width: number): number {
  return LIBRARY_GRID_COLUMNS[getViewportSize(width)];
}

/**
 * Resolve Library Catalog list view column count for a viewport width.
 * List: mobile 1 (stacked), tablet 2, desktop 1.
 * @see Linear THE-53
 */
export function getLibraryListColumnsForViewport(width: number): number {
  return LIBRARY_LIST_COLUMNS[getViewportSize(width)];
}

/**
 * Resolve Novel Detail chapter list column count for a viewport width.
 * Mobile/tablet: 1 column. Desktop: 2 columns.
 * @see Linear THE-59, THE-60
 */
export function getChapterListColumnsForViewport(width: number): number {
  return CHAPTER_LIST_COLUMNS[getViewportSize(width)];
}

/**
 * Resolve Cast Gallery grid column count for a viewport width.
 * Mobile: 1 (single card view). Tablet: 2. Desktop: 3.
 * @see Linear THE-64, THE-66
 */
export function getCastGalleryGridColumnsForViewport(width: number): number {
  return CAST_GALLERY_GRID_COLUMNS[getViewportSize(width)];
}

/**
 * Resolve cast preview (PlayersSection) visible portrait count for a viewport width.
 * Tablet: 4 visible. Desktop: 6 visible. Mobile: horizontal scroll (no fixed visible count; returns 0).
 * @see Linear THE-58, THE-60
 */
export function getCastPreviewVisibleCount(width: number): number {
  const size = getViewportSize(width);
  if (size === "mobile") return 0;
  return CAST_PREVIEW_VISIBLE[size];
}

/**
 * Check if Novel Detail uses two-column layout (cover + metadata).
 * Tablet and desktop (≥ 768px) use two-column layout; mobile uses stacked overlay.
 * @see Linear THE-57, THE-60
 */
export function getNovelDetailUsesTwoColumnLayout(width: number): boolean {
  return width >= BREAKPOINTS.md;
}

/**
 * Check if Author's Study uses two-column layout (35% biography, 65% bibliography).
 * Tablet and desktop (≥ 768px) use two-column layout; mobile uses single column.
 * @see Linear THE-67, THE-70
 */
export function getAuthorStudyUsesTwoColumnLayout(width: number): boolean {
  return width >= BREAKPOINTS.md;
}

/**
 * Resolve Trophy Case grid column count for a viewport width.
 * Mobile: 2. Tablet: 3. Desktop: 4.
 * @see Linear THE-69, THE-70
 */
export function getTrophyCaseGridColumnsForViewport(width: number): number {
  return TROPHY_CASE_GRID_COLUMNS[getViewportSize(width)];
}

/**
 * Resolve Vault CreditPackGrid column count for a viewport width.
 * Mobile: 2. Tablet: 2. Desktop: 3.
 * @see Linear THE-72, THE-75
 */
export function getVaultGridColumnsForViewport(width: number): number {
  return VAULT_GRID_COLUMNS[getViewportSize(width)];
}

/**
 * Resolve Profile library grid column count for a viewport width.
 * Mobile: 1. Tablet: 2. Desktop: 3.
 * @see Linear THE-81, THE-83
 */
export function getProfileLibraryGridColumnsForViewport(width: number): number {
  return PROFILE_LIBRARY_GRID_COLUMNS[getViewportSize(width)];
}

/**
 * Resolve FollowedAuthorsStrip visible avatar count for a viewport width.
 * Tablet: 6 visible. Desktop: 8 visible. Mobile: horizontal scroll (returns 0).
 * @see Linear THE-80, THE-83
 */
export function getFollowedAuthorsStripVisibleCount(width: number): number {
  const size = getViewportSize(width);
  if (size === "mobile") return 0;
  return FOLLOWED_AUTHORS_STRIP_VISIBLE[size];
}

/**
 * Resolve shimmer placeholder grid column count for a viewport width.
 * Mobile: 2. Tablet: 2. Desktop: 3 per row (THE-91, THE-93).
 */
export function getShimmerGridColumnsForViewport(width: number): number {
  return SHIMMER_GRID_COLUMNS[getViewportSize(width)];
}

/**
 * Check if Profile stats row uses horizontal layout (tablet/desktop).
 * Mobile: horizontal scroll. Tablet/Desktop: horizontal row (no wrap).
 * @see Linear THE-83
 */
export function getProfileStatsUsesHorizontalRow(width: number): boolean {
  return width >= BREAKPOINTS.md;
}

/**
 * Check if width is tablet or larger.
 */
export function isTabletOrUp(width: number): boolean {
  return width >= BREAKPOINTS.md;
}

/**
 * Check if width is desktop or larger.
 */
export function isDesktopOrUp(width: number): boolean {
  return width >= BREAKPOINTS.lg;
}

/**
 * Resolve chapter content max-width for a viewport width.
 * Mobile: no constraint (null). Tablet (768-1023px): 680px. Desktop (1024px+): 720px.
 * @see Linear THE-61, THE-63
 */
export function getChapterContentMaxWidth(width: number): number | null {
  return CHAPTER_CONTENT_MAX_WIDTH[getViewportSize(width)];
}

/**
 * Check if CommentsSidebar is visible for a viewport width.
 * Sidebar shows only on desktop (1024px+). Mobile/tablet use CommentsSection bottom sheet.
 * @see Linear THE-62, THE-63
 */
export function isCommentsSidebarVisible(width: number): boolean {
  return width >= BREAKPOINTS.lg;
}

/**
 * Check if CommentsSection (bottom sheet) is the primary comments UI for a viewport.
 * Mobile/tablet use bottom sheet; desktop uses sidebar.
 * @see Linear THE-62, THE-63
 */
export function isCommentsSectionPrimary(width: number): boolean {
  return width < BREAKPOINTS.lg;
}

/**
 * Resolve auth form max-width for a viewport width.
 * Mobile: 448px (max-w-md). Tablet/Desktop (≥ 768px): 480px.
 * Forms are centered with mx-auto.
 * @see Linear THE-76, THE-78
 */
export function getAuthFormMaxWidth(width: number): number {
  return AUTH_FORM_MAX_WIDTH[getViewportSize(width)];
}

/**
 * Check if device has coarse pointer (touch) vs fine (mouse/stylus).
 * Returns null when matchMedia is unavailable (SSR).
 */
export function isTouchDevice(): boolean | null {
  if (typeof window === "undefined" || !window.matchMedia) return null;
  return window.matchMedia("(pointer: coarse)").matches;
}

/**
 * Check if device has fine pointer (mouse/stylus).
 * Returns null when matchMedia is unavailable (SSR).
 */
export function isFinePointerDevice(): boolean | null {
  if (typeof window === "undefined" || !window.matchMedia) return null;
  return window.matchMedia("(pointer: fine)").matches;
}

/** Pointer device type for hover state decisions (matches usePointerDevice hook) */
export type PointerDevice = "touch" | "mouse" | "unknown";

/**
 * Determine whether to apply hover states for a given pointer device.
 * Hover effects (gold glow, brightness, scale) apply only on pointer devices (mouse/stylus).
 * Touch devices should not get hover states to avoid sticky hover on tap.
 * @see Linear THE-54
 */
export function shouldApplyHoverForDevice(device: PointerDevice): boolean {
  return device === "mouse";
}
