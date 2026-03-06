"use client";

import { LibraryNovelCard } from "./library-novel-card";
import { EmptyState } from "../empty-state";
import type { LibraryNovelItem } from "@/app/actions/profile";

interface LibrarySectionListProps {
  currentlyReading: LibraryNovelItem[];
  finished: LibraryNovelItem[];
}

/**
 * LibrarySectionList: "Currently Reading" and "Finished" sections.
 * Req 18.4, 18.5, 18.6.
 * THE-81: 2-col tablet, 3-col desktop; gap 24px tablet, 32px desktop.
 */
export function LibrarySectionList({
  currentlyReading,
  finished,
}: LibrarySectionListProps) {
  return (
    <section className="px-4 xs:px-6 pb-8">
      {/* Currently Reading */}
      <div className="mb-8">
        <h2 className="font-header text-sm tracking-[0.15em] text-primary uppercase mb-4">
          Currently Reading
        </h2>
        {currentlyReading.length === 0 ? (
          <EmptyState message="No current affairs" className="py-6" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 lg:gap-8">
            {currentlyReading.map((item) => (
              <LibraryNovelCard key={item.novelId} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Finished */}
      <div>
        <h2 className="font-header text-sm tracking-[0.15em] text-primary uppercase mb-4">
          Finished
        </h2>
        {finished.length === 0 ? (
          <EmptyState message="Nothing finished yet" className="py-6" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 lg:gap-8">
            {finished.map((item) => (
              <LibraryNovelCard key={item.novelId} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
