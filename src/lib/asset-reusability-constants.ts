/**
 * Asset reusability constants for Midnight Satin (THE-90).
 * Single source of truth for reused assets: silk texture, icon set, ornamental divider.
 * Validates: Requirements 14.4, 14.5, 14.6
 */

/** Silk background texture class — reused in layout, reading room, cast gallery. One pattern only. */
export const SILK_BACKGROUND_CLASS = "bg-silk-noise" as const;

/** Icon set class — Material Symbols used app-wide; no duplicate SVG icon sets. */
export const ICON_SET_CLASS = "material-symbols-outlined" as const;

/** Ornamental divider component name — single component, reused in chapter content only. */
export const ORNAMENTAL_DIVIDER_COMPONENT_NAME = "OrnamentalDivider" as const;
