import { getChapters } from "@/lib/content";

/**
 * Count the number of words in a string by splitting on whitespace.
 * Returns 0 for empty or whitespace-only strings.
 */
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

/**
 * Fetch all chapters for a novel and sum the word count across all chapter content.
 */
export async function getNovelWordCount(novelId: string): Promise<number> {
  const chapters = await getChapters(novelId);
  return chapters.reduce((total, chapter) => total + countWords(chapter.content), 0);
}
