/**
 * Veil / locked-chapter content slicing (Req 4.1).
 * Shared by Reading Room UI and the server page so locked bodies are never
 * serialized in full to the client.
 */

/** Free preview paragraphs before the Veil. */
export const FREE_PREVIEW_PARAGRAPHS = 5;

/**
 * Locked content is not fully rendered: only a short blurred teaser
 * (plus The Veil overlay).
 */
export const VEIL_BLURRED_TEASER_PARAGRAPHS = 8;

/** Split chapter body into non-empty paragraphs. */
export function splitChapterParagraphs(content: string): string[] {
  return content.split(/\n\n+/).flatMap((p) => {
    const t = p.trim();
    return t ? [t] : [];
  });
}

/**
 * Content safe to send to the client when a chapter is locked:
 * free preview + blurred teaser only (never the remainder of the chapter).
 */
export function teaserContentForLockedChapter(fullContent: string): string {
  const paragraphs = splitChapterParagraphs(fullContent);
  const end = Math.min(
    paragraphs.length,
    FREE_PREVIEW_PARAGRAPHS + VEIL_BLURRED_TEASER_PARAGRAPHS
  );
  return paragraphs.slice(0, end).join("\n\n");
}
