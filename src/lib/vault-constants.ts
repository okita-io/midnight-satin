/**
 * Shared constants for Vault (credit store) UI.
 * Ensures ribbons, animations, and card styling are preserved across responsive layouts.
 * @see Linear THE-75 Property 27
 * @see Requirements 8.3, 8.5, 10.1-10.7
 */

/** PopularRibbon label text (Req 8.3: "Most Popular" burgundy ribbon) */
export const POPULAR_RIBBON_LABEL = "Most Popular" as const;

/** Coin rain animation duration in ms before URL clear (Req 8.5: defer until after animation) */
export const COIN_RAIN_DURATION_MS = 3000 as const;

/** Number of coin particles in coin rain animation */
export const COIN_RAIN_PARTICLE_COUNT = 12 as const;

/** Popular pack scale factor (1.02x per Req 8.3) */
export const POPULAR_PACK_SCALE = 1.02 as const;
