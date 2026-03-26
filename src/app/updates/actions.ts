"use server";

import { getNewsArchive } from "@/lib/content";
import type { NewsArticleSummary } from "@/lib/db/types";

export async function loadMoreArticles(
  cursor: string
): Promise<{ articles: NewsArticleSummary[]; nextCursor: string | null }> {
  return getNewsArchive(cursor, 12);
}
