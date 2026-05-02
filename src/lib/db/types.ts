/**
 * Midnight Satin Database Types
 * Per design document - maps to Vercel Postgres schema; domain types for auth in design.md.
 */

export interface AuthorProfile {
  id: string;
  name: string;
  avatarUrl: string | null;
  biography: string | null;
  styleTags: string[];
  followerCount: number;
  createdAt: Date;
}

export interface Series {
  id: string;
  title: string;
  authorId: string;
  description: string | null;
  genreTags: string[];
  isComplete: boolean;
  createdAt: Date;
}

export interface Novel {
  id: string;
  title: string;
  seriesId: string | null;
  authorId: string;
  coverImageUrl: string | null;
  synopsis: string | null;
  genreTags: string[];
  rating: number;
  ratingCount: number;
  publicationDate: Date | null;
  isFeatured?: boolean;
  featuredOrder?: number | null;
  createdAt: Date;
}

export interface Chapter {
  id: string;
  novelId: string;
  chapterNumber: number;
  title: string;
  content: string;
  isFree: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CharacterStats {
  age?: string;
  status?: string;
  height?: string;
  occupation?: string;
  zodiacSign?: string;
  bloodType?: string;
  birthday?: string;
  favorites?: string[];
  dislikes?: string[];
}

export interface Character {
  id: string;
  novelId: string;
  name: string;
  roleSubtitle: string | null;
  portraitUrl: string | null;
  description: string | null;
  backstory: string | null;
  stats: CharacterStats;
  secrets: string[];
  endorsementCount: number;
  hasTrophy: boolean;
  createdAt: Date;
}

export interface Reader {
  id: string;
  email: string;
  displayName: string | null;
  creditBalance: number;
  role: "reader" | "admin";
  createdAt: Date;
  lastLoginAt: Date | null;
}

/** Row from readers table (snake_case) for Vercel Postgres queries */
export interface ReaderDbRow {
  id: string;
  email: string;
  password_hash: string;
  display_name: string | null;
  credit_balance: number;
  role: string;
  created_at: Date;
  last_login_at: Date | null;
}

export function readerDbRowToReader(row: ReaderDbRow): Reader {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name ?? null,
    creditBalance: row.credit_balance,
    role: row.role === "admin" ? "admin" : "reader",
    createdAt: new Date(row.created_at),
    lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : null,
  };
}

/** Reader as stored in entity store (includes password hash for round-trip) */
export interface ReaderRow extends Reader {
  passwordHash: string;
}

export interface ReadingProgress {
  readerId: string;
  chapterId: string;
  scrollPercent: number;
  lastReadAt: Date;
}

export type TransactionType =
  | "purchase"
  | "chapter_unlock"
  | "endorsement"
  | "welcome_bonus"
  | "admin_adjustment";

export interface CreditTransaction {
  id: string;
  readerId: string;
  amount: number;
  transactionType: TransactionType;
  relatedEntityId: string | null;
  createdAt: Date;
}

export interface ChapterUnlock {
  readerId: string;
  chapterId: string;
  unlockedAt: Date;
}

export interface AuthorFollow {
  readerId: string;
  authorId: string;
  followedAt: Date;
}

export interface ReaderBookmark {
  readerId: string;
  novelId: string;
  chapterId: string | null;
  createdAt: Date;
}

export interface Comment {
  id: string;
  chapterId: string;
  readerId: string;
  parentCommentId: string | null;
  content: string;
  likeCount: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentLike {
  readerId: string;
  commentId: string;
  createdAt: Date;
}

/** One novel review per reader (enforced by UNIQUE(novel_id, reader_id)). */
export interface NovelReview {
  id: string;
  novelId: string;
  readerId: string;
  content: string;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewLike {
  readerId: string;
  reviewId: string;
  createdAt: Date;
}

export interface CommentThreadPage {
  comments: Comment[];
  nextCursor: string | null;
}

/** Password reset token for email password reset flow. Requirements: 2.3, 7.1 */
export interface PasswordResetToken {
  id: string;
  readerId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
  ipAddress: string | null;
}

/** Event types for password reset security logging */
export type PasswordResetEventType =
  | "request_sent"
  | "link_used"
  | "link_expired"
  | "invalid_token"
  | "rate_limit"
  | "password_changed"
  | "email_failed"
  | "reset_requested"
  | "token_generated"
  | "email_sent"
  | "token_validated"
  | "token_invalid"
  | "token_expired"
  | "token_used"
  | "rate_limited";

/**
 * Allowed reason codes for password reset log entries.
 * Whitelist ensures no sensitive data (email, token, password) is logged. Requirements: 7.4
 */
export type PasswordResetReasonCode =
  | "invalid"
  | "expired"
  | "used"
  | "rate_limited"
  | "email_failed"
  | "resend_error"
  | "token_not_found";

/** Log entry for password reset security events */
export interface PasswordResetLogEntry {
  id: string;
  eventType: PasswordResetEventType;
  readerId: string | null;
  ipAddress: string | null;
  reasonCode: string | null;
  createdAt: Date;
}

/** Entity types used in Property 1: Entity storage round-trip and Property 25, 26 */
export type StorableEntity =
  | AuthorProfile
  | Series
  | Novel
  | Chapter
  | Character
  | ReaderRow
  | ReadingProgress
  | CreditTransaction
  | ChapterUnlock
  | AuthorFollow
  | Comment
  | CommentLike;

// --- News Articles (news-updates-system spec) ---

export type NewsArticleType = 'editorial' | 'campaign' | 'ranking' | 'popularity' | 'announcement';

export type SourcePlatform = 'tiktok' | 'instagram' | 'x' | 'youtube' | 'facebook';

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  articleType: NewsArticleType;
  heroImageUrl: string | null;
  summary: string;
  bodyContent: string;
  tags: string[];
  attribution: string;
  sourceUrl: string | null;
  sourcePlatform: SourcePlatform | null;
  isPublished: boolean;
  isFeatured: boolean;
  featuredOrder: number | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/** List view type — omits bodyContent for performance */
export type NewsArticleSummary = Omit<NewsArticle, 'bodyContent'>;

// --- Paperback Orders (buy-paperback spec) ---

export interface PaperbackOrder {
  id: string;
  readerId: string;
  novelId: string;
  stripeSessionId: string;
  stripePaymentIntentId: string | null;
  amountCents: number;
  currency: string;
  shippingName: string | null;
  shippingAddress: Record<string, unknown> | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
