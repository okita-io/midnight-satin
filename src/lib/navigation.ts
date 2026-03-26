/**
 * Centralized navigation path builders.
 * Property 13 (Navigation link construction) validates these produce correct routes.
 */

/** Novel detail screen: /novel/[novelId] */
export function novelDetailPath(novelId: string): string {
  return `/novel/${encodeURIComponent(novelId)}`;
}

/** Author's Study: /author/[authorId] */
export function authorStudyPath(authorId: string): string {
  return `/author/${encodeURIComponent(authorId)}`;
}

/** Reading Room: /novel/[novelId]/read/[chapterId] */
export function readingRoomPath(novelId: string, chapterId: string): string {
  return `/novel/${encodeURIComponent(novelId)}/read/${encodeURIComponent(chapterId)}`;
}

/** News archive: /updates */
export function newsArchivePath(): string {
  return "/updates";
}

/** News article detail: /updates/[slug] */
export function newsArticlePath(slug: string): string {
  return `/updates/${encodeURIComponent(slug)}`;
}
