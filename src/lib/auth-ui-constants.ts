/**
 * Shared constants for authentication form UI (login, register).
 * Ensures validation, spacing, and typography consistency across viewports.
 * @see Linear THE-77, THE-78 Property 29
 * @see Requirements 11.4, 11.5, 11.6
 */

/** Login form vertical spacing between fields (space-y-6) — Req 11.5 */
export const LOGIN_FORM_SPACING = "space-y-6" as const;

/** Register form vertical spacing between fields (space-y-5) — Req 11.5 */
export const REGISTER_FORM_SPACING = "space-y-5" as const;

/** Label typography: Marcellus, uppercase, tracking — Req 11.5 */
export const AUTH_LABEL_CLASSES =
  "font-ui text-xs uppercase tracking-widest text-text-muted ml-1" as const;

/** Register form labels use slightly smaller text — Req 11.5 */
export const REGISTER_LABEL_CLASSES =
  "block font-ui text-[10px] uppercase tracking-[0.15em] text-text-muted ml-1" as const;

/** Validation message container: accent border, surface bg — Req 11.6 (same position on all viewports) */
export const AUTH_VALIDATION_CLASSES =
  "rounded border-2 border-accent bg-surface px-3 py-2 font-ui text-sm text-text-main" as const;

/** Validation message must have role="alert" for accessibility */
export const AUTH_VALIDATION_ROLE = "alert" as const;

/** Primary button: h-14, shadow-gold-glow, gold bg — Req 11.4 */
export const AUTH_BUTTON_BASE_CLASSES =
  "w-full h-14 bg-primary text-void font-ui font-bold uppercase tracking-[0.2em] rounded-lg shadow-gold-glow" as const;

/** Login button hover: hover:bg-primary/90 — Req 11.4 */
export const LOGIN_BUTTON_HOVER = "hover:bg-primary/90" as const;

/** Register button hover: hover:bg-white — Req 11.4 */
export const REGISTER_BUTTON_HOVER = "hover:bg-white" as const;

/** Button active state: active:scale-[0.98] — Req 11.4 */
export const AUTH_BUTTON_ACTIVE = "active:scale-[0.98]" as const;
