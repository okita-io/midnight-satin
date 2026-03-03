"use client";

import { useState } from "react";
import { LibraryHeader } from "./library-header";
import { LibraryCatalog } from "./library-catalog";
import type { LibraryCatalogNovel } from "./library-catalog";

interface LibraryClientProps {
  novels: LibraryCatalogNovel[];
}

/**
 * Client wrapper for Library page: manages filter state and renders
 * LibraryHeader + LibraryCatalog. Safe area insets applied.
 */
export function LibraryClient({ novels }: LibraryClientProps) {
  const [filterQuery, setFilterQuery] = useState("");

  return (
    <>
      <LibraryHeader onFilterChange={setFilterQuery} />

      <main className="flex-1 pb-24">
        <LibraryCatalog novels={novels} filterQuery={filterQuery} />
      </main>
    </>
  );
}
