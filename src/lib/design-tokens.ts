/**
 * Design tokens for Midnight Satin "Tactile Noir Luxury" design system.
 * Single source of truth for color values; used for property tests and consistency checks.
 * @see Requirements 14.1, 14.2
 * @see Linear THE-46
 */

/** Design system color tokens (Requirements 14.1) */
export const COLOR_TOKENS = {
  primary: "#D4AF37",
  void: "#050505",
  surface: "#121212",
  text: "#EAEAEA",
  muted: "#8A8A8A",
  accent: "#800020",
  "surface-highlight": "#1A1A1A",
} as const;

/** Get color tokens for any viewport. Tokens are viewport-invariant (consistent across mobile/tablet/desktop). */
export function getColorTokensForViewport(width: number): typeof COLOR_TOKENS {
  void width; // Viewport-invariant: same tokens for all widths
  return COLOR_TOKENS;
}
