"use client";

import { useState, useMemo } from "react";
import { SearchOverlay } from "./search-overlay";
import type { SearchNovelHit, SearchAuthorHit } from "./search-overlay";
import { GradientHeaderStrip } from "./chrome-primitives";

const EMPTY_SEARCH_NOVELS: SearchNovelHit[] = [];
const EMPTY_SEARCH_AUTHORS: SearchAuthorHit[] = [];

interface BoudoirHeaderProps {
  /** Novels for search results (by title). Until content layer: empty or mock. */
  searchNovels?: SearchNovelHit[];
  /** Authors for search results (by name). Until content layer: empty or mock. */
  searchAuthors?: SearchAuthorHit[];
}

/**
 * Boudoir header: brand, search button, notification button.
 * Search opens SearchOverlay. Notification shows badge when unread.
 * Matches reference/midnight_satin_home.html and Requirement 15.5.
 */
export function BoudoirHeader({
  searchNovels = EMPTY_SEARCH_NOVELS,
  searchAuthors = EMPTY_SEARCH_AUTHORS,
}: BoudoirHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const { novels, authors } = useMemo(() => {
    if (!query.trim()) return { novels: [], authors: [] };
    const q = query.toLowerCase();
    return {
      novels: searchNovels.filter(
        (n) =>
          n.title.toLowerCase().includes(q) || n.authorName.toLowerCase().includes(q)
      ),
      authors: searchAuthors.filter((a) => a.name.toLowerCase().includes(q)),
    };
  }, [query, searchNovels, searchAuthors]);

  return (
    <>
      <div
        className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-4 xs:p-6"
        style={{ paddingTop: "calc(1.5rem + env(safe-area-inset-top, 0px))" }}
      >
        <GradientHeaderStrip className="absolute inset-0" />
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl" aria-hidden>
            menu_book
          </span>
          <span className="font-header text-sm tracking-[0.2em] text-primary">
            Midnight Satin
          </span>
        </div>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="text-white/80 hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm cursor-pointer active:scale-95"
            aria-label="Search novels and authors"
          >
            <span className="material-symbols-outlined" aria-hidden>search</span>
          </button>
          <button
            type="button"
            className="text-white/80 hover:text-primary transition-colors relative focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm cursor-pointer active:scale-95"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined" aria-hidden>notifications</span>
            <span
              className="absolute top-0 right-0 size-2 bg-accent rounded-full border border-void"
              aria-hidden
            />
          </button>
        </div>
      </div>

      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => {
          setSearchOpen(false);
          setQuery("");
        }}
        novels={novels}
        authors={authors}
        query={query}
        onQueryChange={setQuery}
      />
    </>
  );
}
