/**
 * Comment content validation (Req 19.6, 19.12).
 * Max 800 characters — used client and server.
 */

export const MAX_COMMENT_LENGTH = 800;

export type ValidateCommentResult =
  | { valid: true }
  | { valid: false; error: string };

/**
 * Validate comment content for length and non-empty.
 * Server and client use this for consistent validation.
 */
export function validateCommentContent(content: string): ValidateCommentResult {
  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: "Comment cannot be empty." };
  }
  if (content.length > MAX_COMMENT_LENGTH) {
    return {
      valid: false,
      error: `Comment must be at most ${MAX_COMMENT_LENGTH} characters.`,
    };
  }
  return { valid: true };
}
