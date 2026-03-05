/**
 * Viewport detection utilities for Midnight Satin responsive system.
 * Use for SSR-safe or non-hook contexts.
 * @see Linear THE-45
 */

import { BREAKPOINTS, type ViewportSize } from "./constants";

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
