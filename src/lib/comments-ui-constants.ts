/**
 * Shared constants for Comments UI (CommentsSection, CommentsSidebar).
 * Ensures styling consistency across mobile bottom sheet and desktop sidebar.
 * @see Linear THE-63 Property 19
 */

/** Header title for comments panel (Req 19.1, design reference) */
export const COMMENTS_HEADER_TITLE = "Thoughts from the Boudoir" as const;

/** CSS classes for comments header - font-heading, gold accent, uppercase */
export const COMMENTS_HEADER_CLASSES =
  "font-heading text-sm tracking-[0.2em] text-primary uppercase" as const;

/** CSS classes for comment author - font-heading, tracking */
export const COMMENT_AUTHOR_CLASSES =
  "font-heading text-xs text-text-main tracking-wider uppercase" as const;

/** CSS classes for comment content - font-body, italic */
export const COMMENT_CONTENT_CLASSES =
  "font-body text-sm leading-relaxed italic" as const;

/** CSS classes for like button - gold accent */
export const COMMENT_LIKE_CLASSES =
  "flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors" as const;
