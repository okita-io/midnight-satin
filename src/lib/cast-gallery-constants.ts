/**
 * Shared constants for Cast Gallery UI (cast-gallery-modal).
 * Ensures flip, endorsement, and badge interactions are preserved across responsive layouts.
 * @see Linear THE-66 Property 22
 * @see Requirements 5.4, 5.5, 6.1, 6.6
 */

/** Card flip animation duration in ms (Req 5.4: 3D card flip 700ms) */
export const CAST_GALLERY_FLIP_DURATION_MS = 700 as const;

/** Endorsement FAB full size in px (Req 6.1: 64px diameter) */
export const ENDORSEMENT_FAB_SIZE_PX = 64 as const;

/** Endorsement FAB compact size in px (grid cards use smaller FAB) */
export const ENDORSEMENT_FAB_COMPACT_SIZE_PX = 48 as const;

/** Trophy badge threshold - endorsements must exceed this (Req 5.5, 6.6) */
export const TROPHY_BADGE_THRESHOLD = 1000 as const;
