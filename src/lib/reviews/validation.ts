/**
 * Novel review body validation — used on client and server.
 */

export const MAX_NOVEL_REVIEW_LENGTH = 2000;

export type ValidateNovelReviewResult =
  | { valid: true }
  | { valid: false; error: string };

export function isValidStarRating(n: number): boolean {
  return Number.isInteger(n) && n >= 1 && n <= 5;
}

export function validateNovelReviewContent(content: string): ValidateNovelReviewResult {
  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: "Review cannot be empty." };
  }
  if (content.length > MAX_NOVEL_REVIEW_LENGTH) {
    return {
      valid: false,
      error: `Review must be at most ${MAX_NOVEL_REVIEW_LENGTH} characters.`,
    };
  }
  return { valid: true };
}
