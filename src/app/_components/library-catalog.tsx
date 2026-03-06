"use client";

import { useMemo, useState } from "react";
import { NovelCard } from "./novel-card";
import { EmptyState } from "./empty-state";
import { ShimmerPlaceholder } from "./shimmer-placeholder";
export interface LibraryCatalogNovel {
  id: string;
  title: string;
  authorName: string;
  coverImageUrl: string | null;
  rating?: number | null;
  ratingCount?: number;
  /** For desktop expanded list: author biography excerpt */
  authorBio?: string | null;
  /** For desktop expanded list: genre tags */
  genreTags?: string[];
  /** For desktop expanded list: chapter count */
  chapterCount?: number;
}

interface LibraryCatalogProps {
  /** All novels for the catalog (from server) */
  novels: LibraryCatalogNovel[];
  /** Optional filter query (from header search). Filters by title/author. */
  filterQuery?: string;
  /** Whether data is loading */
  loading?: boolean;
}

/**
 * LibraryCatalog: scrollable list/grid of novels with optional filter.
 * Design: cover, title, author, optional rating/count. List and grid views.
 * Empty state: Pinyon Script gold text per design system.
 */
export function LibraryCatalog({
  novels,
  filterQuery = "",
  loading = false,
}: LibraryCatalogProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    if (!filterQuery.trim()) return novels;
    const q = filterQuery.toLowerCase().trim();
    return novels.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.authorName.toLowerCase().includes(q)
    );
  }, [novels, filterQuery]);

  if (loading) {
    return (
      <div className="px-4 xs:px-6 py-8">
        <div className="grid grid-cols-2 gap-3 xs:gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <ShimmerPlaceholder key={i} className="aspect-[2/3] rounded-sm" />
          ))}
        </div>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <EmptyState
          message={
            novels.length === 0
              ? "Your shelf is waiting."
              : "Nothing matches your search."
          }
        />
      </div>
    );
  }

  return (
    <section className="px-4 xs:px-6 pb-8" aria-label="Library catalog">
      {/* View toggle */}
      <div className="flex items-center justify-between mb-4 xs:mb-6">
        <span className="font-ui text-xs text-text-muted">
          {filtered.length} {filtered.length === 1 ? "novel" : "novels"}
        </span>
        <div className="flex gap-1 rounded-sm border border-white/10 p-0.5">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer active:scale-95 ${
              viewMode === "grid"
                ? "bg-primary/20 text-primary"
                : "text-text-muted hover:text-text-main"
            }`}
            aria-label="Grid view"
            aria-pressed={viewMode === "grid"}
          >
            <span className="material-symbols-outlined text-lg" aria-hidden>
              grid_view
            </span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer active:scale-95 ${
              viewMode === "list"
                ? "bg-primary/20 text-primary"
                : "text-text-muted hover:text-text-main"
            }`}
            aria-label="List view"
            aria-pressed={viewMode === "list"}
          >
            <span className="material-symbols-outlined text-lg" aria-hidden>
              view_list
            </span>
          </button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 gap-3 xs:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:gap-8">
          {filtered.map((novel) => (
            <NovelCard
              key={novel.id}
              novel={{
                id: novel.id,
                title: novel.title,
                authorName: novel.authorName,
                coverImageUrl: novel.coverImageUrl,
                rating: novel.rating,
              }}
              className="!w-full"
            />
          ))}
        </div>
      ) : (
        <ul className="space-y-2 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-1 lg:gap-6">
          {filtered.map((novel) => (
            <li key={novel.id}>
              <NovelCard
                novel={{
                  id: novel.id,
                  title: novel.title,
                  authorName: novel.authorName,
                  coverImageUrl: novel.coverImageUrl,
                  rating: novel.rating,
                  ratingCount: novel.ratingCount,
                  authorBio: novel.authorBio,
                  genreTags: novel.genreTags,
                  chapterCount: novel.chapterCount,
                }}
                variant="list"
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
