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
  /** Romance Factory story UUID (RF-1 / MS-1). Null for legacy imports. */
  rfStoryId?: string | null;
  createdAt: Date;
}

/** Act-grain provenance stored on chapters.rf_provenance (RF-2 / MS-1). */
export interface ChapterRfActProvenance {
  act_number: number;
  char_start: number;
  char_end: number;
  card_id?: string | null;
  writer_adapter?: string | null;
  base_version?: string | null;
  adapter_version?: string | null;
  editor_version?: string | null;
  judge_version?: string | null;
  editor_card_hit?: number | null;
  judge_score?: number | null;
  revisions?: number | null;
  card?: Record<string, unknown> | null;
}

export interface ChapterRfProvenance {
  provenance_version: string;
  chapter_number: number;
  coordinate_space: string;
  rubric_version?: string | null;
  acts: ChapterRfActProvenance[];
}

export interface Chapter {
  id: string;
  novelId: string;
  chapterNumber: number;
  title: string;
  content: string;
  isFree: boolean;
  /** RF provenance payload (acts + stitch offsets). Null for legacy imports. */
  rfProvenance?: ChapterRfProvenance | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Cast Gallery dossier stats.
 *
 * Romance Factory publish dossiers use the psychology fields
 * (`consciousWant`, `unconsciousNeed`, `wound`, `fear`, `lieTheyBelieve`).
 * Age / height / zodiac-style keys remain optional for hand-authored seed content.
 */
export interface CharacterStats {
  /** RF: conscious_want */
  consciousWant?: string;
  /** RF: unconscious_need */
  unconsciousNeed?: string;
  /** RF: wound */
  wound?: string;
  /** RF: fear */
  fear?: string;
  /** RF: lie_they_believe */
  lieTheyBelieve?: string;
  /** Story role slug (e.g. protagonist) — optional display aid */
  role?: string;
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
  password_hash: string | null;
  display_name: string | null;
  credit_balance: number;
  role: string;
  created_at: Date;
  last_login_at: Date | null;
  clerk_user_id?: string | null;
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
  starRating: number;
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
