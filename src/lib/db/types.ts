/**
 * Midnight Satin Database Types
 * Per design document - maps to Vercel Postgres schema
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

/** Reader as stored in DB (includes password hash for round-trip) */
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

export interface CommentThreadPage {
  comments: Comment[];
  nextCursor: string | null;
}

/** Entity types used in Property 1: Entity storage round-trip */
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
  | AuthorFollow;
