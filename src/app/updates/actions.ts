"use server";

import { getNewsArchive } from "@/lib/content";
import type { NewsArticleSummary } from "@/lib/db/types";
import { getSession } from "@/lib/auth/session";

export async function loadMoreArticles(
  cursor: string
): Promise<{ articles: NewsArticleSummary[]; nextCursor: string | null }> {
  // Public action: still touch auth/session per server action guardrails.
  await getSession();
  return getNewsArchive(cursor, 12);
}
