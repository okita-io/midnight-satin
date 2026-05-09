"use client";

import { useReducer, useTransition } from "react";
import { NewsArticleCard } from "@/app/_components/news-article-card";
import { loadMoreArticles } from "./actions";
import type { NewsArticleSummary } from "@/lib/db/types";
import { newsArchiveReducer } from "./news-archive-reducer";

interface NewsArchiveClientProps {
  initialArticles: NewsArticleSummary[];
  initialCursor: string | null;
}

export function NewsArchiveClient({
  initialArticles,
  initialCursor,
}: NewsArchiveClientProps) {
  const [state, dispatch] = useReducer(newsArchiveReducer, {
    articles: initialArticles,
    cursor: initialCursor,
  });
  const [isPending, startTransition] = useTransition();

  function handleLoadMore() {
    const cursor = state.cursor;
    if (!cursor) return;
    startTransition(async () => {
      const { articles: more, nextCursor } = await loadMoreArticles(cursor);
      dispatch({ type: "append", articles: more, cursor: nextCursor });
    });
  }

  if (state.articles.length === 0) {
    return (
      <p className="text-center text-text-muted font-ui text-sm tracking-wider py-16">
        No articles yet. Check back soon.
      </p>
    );
  }

  return (
    <>
      <div className="responsive-grid-1-2-3">
        {state.articles.map((article) => (
          <NewsArticleCard
            key={article.id}
            article={article}
            className="w-full"
          />
        ))}
      </div>

      {state.cursor && (
        <div className="flex justify-center mt-10">
          <button
            onClick={handleLoadMore}
            disabled={isPending}
            className="btn-gold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Loading…" : "Load More"}
          </button>
        </div>
      )}
    </>
  );
}
