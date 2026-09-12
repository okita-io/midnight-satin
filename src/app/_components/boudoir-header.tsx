"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { SearchOverlay } from "./search-overlay";
import type { SearchNovelHit, SearchAuthorHit } from "./search-overlay";
import { ClerkAuthControls } from "./clerk-auth-controls";
import { BOUDOIR_BYLINE, BOUDOIR_HEADING } from "@/lib/site-metadata";

const EMPTY_SEARCH_NOVELS: SearchNovelHit[] = [];
const EMPTY_SEARCH_AUTHORS: SearchAuthorHit[] = [];

interface BoudoirHeaderProps {
  /** Novels for search results (by title). Until content layer: empty or mock. */
  searchNovels?: SearchNovelHit[];
  /** Authors for search results (by name). Until content layer: empty or mock. */
  searchAuthors?: SearchAuthorHit[];
}

/**
 * Boudoir masthead: screen kicker, product H1, extractable byline, then chrome.
 * Search opens SearchOverlay. Notification shows badge when unread.
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
      <header
        className="relative z-20 px-4 xs:px-6 pb-5 border-b border-primary/10"
        style={{ paddingTop: "calc(1.5rem + env(safe-area-inset-top, 0px))" }}
      >
        <div className="flex justify-between items-center gap-3">
          <p className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-primary text-xl" aria-hidden>
              menu_book
            </span>
            <span className="font-header text-sm tracking-[0.2em] text-primary">
              The Boudoir
            </span>
          </p>
          <div className="flex items-center gap-3 xs:gap-4 shrink-0">
            <ClerkAuthControls />
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
        <h1 className="font-display italic font-semibold text-3xl xs:text-4xl text-text-main gold-text-shadow leading-tight mt-4">
          {BOUDOIR_HEADING}
        </h1>
        <p className="font-body text-text-muted text-sm mt-3 max-w-xl leading-relaxed">
          {BOUDOIR_BYLINE}{" "}
          <Link
            href="/library"
            className="text-primary underline-offset-2 [@media(hover:hover)]:hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
          >
            Browse the library
          </Link>
          .
        </p>
      </header>

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
