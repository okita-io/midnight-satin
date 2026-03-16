"use client";

import { useState } from "react";

interface LibraryHeaderProps {
  /** Called when filter query changes (for optional catalog filtering) */
  onFilterChange?: (query: string) => void;
}

/**
 * Library header: brand, search/filter input for optional catalog filtering.
 * Matches design: optional filter when search used (Req 1a.5).
 * Safe area insets applied.
 */
export function LibraryHeader({ onFilterChange }: LibraryHeaderProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [query, setQuery] = useState("");

  const handleQueryChange = (value: string) => {
    setQuery(value);
    onFilterChange?.(value);
  };

  const handleClear = () => {
    setQuery("");
    onFilterChange?.("");
    setFilterOpen(false);
  };

  return (
    <div
      className="sticky top-0 left-0 right-0 z-20 flex flex-col bg-void/95 backdrop-blur-md border-b border-primary/10"
      style={{ paddingTop: "calc(1rem + env(safe-area-inset-top, 0px))" }}
    >
      <div className="flex items-center justify-between px-6 py-4 gap-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl" aria-hidden>
            local_library
          </span>
          <span className="font-header text-sm tracking-[0.2em] text-primary">
            Library
          </span>
        </div>
        <button
          type="button"
          onClick={() => setFilterOpen((o) => !o)}
          className={`p-2 rounded-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer active:scale-95 ${
            filterOpen ? "text-primary" : "text-white/80 hover:text-primary"
          }`}
          aria-label={filterOpen ? "Close search" : "Search and filter catalog"}
          aria-expanded={filterOpen}
        >
          <span className="material-symbols-outlined" aria-hidden>
            {filterOpen ? "close" : "search"}
          </span>
        </button>
      </div>

      {filterOpen && (
        <div className="px-4 pb-4">
          <div className="flex gap-2">
            <input
              type="search"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Filter by title or author…"
              className="flex-1 min-w-0 px-3 py-2 rounded-sm bg-surface-highlight border border-white/10 text-text-main font-ui text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Filter novels by title or author"
              autoFocus
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2 text-text-muted hover:text-text-main focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm cursor-pointer active:scale-95"
                aria-label="Clear filter"
              >
                <span className="material-symbols-outlined" aria-hidden>
                  clear
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
