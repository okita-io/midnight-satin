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
