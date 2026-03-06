"use client";

import Link from "next/link";
import type { LibraryNovelItem } from "@/app/actions/profile";
import { novelDetailPath, readingRoomPath } from "@/lib/navigation";

interface LibraryNovelCardProps {
  item: LibraryNovelItem;
}

/**
 * LibraryNovelCard: Compact novel card with cover, title, author, last-read chapter,
 * and Resume / View Details CTA. Req 18.6.
 */
export function LibraryNovelCard({ item }: LibraryNovelCardProps) {
  const { novelId, title, authorName, coverImageUrl, chapterNumber, chapterTitle, chapterId, isFinished } = item;

  const href = isFinished ? novelDetailPath(novelId) : readingRoomPath(novelId, chapterId);
  const ariaLabel = isFinished
    ? `View ${title} details`
    : `Resume ${title}, ${chapterTitle}`;

  return (
    <Link
      href={href}
      className="bg-surface border border-white/5 hover:border-primary/30 p-4 rounded-sm flex gap-4 shadow-card-depth relative overflow-hidden group block transition-colors"
      aria-label={ariaLabel}
    >
      <div className="absolute inset-0 bg-gold-sheen opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Cover */}
      <div className="w-[64px] h-[96px] shrink-0 rounded-sm overflow-hidden shadow-lg shadow-black/50 relative bg-surface-highlight">
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-text-muted opacity-50 text-2xl">
            auto_stories
          </span>
        )}
        {!isFinished && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
            <div
              className="h-full bg-primary"
              style={{ width: `${item.scrollPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col justify-center flex-1 min-w-0">
        <span className="text-[10px] text-primary/80 font-ui uppercase tracking-wider mb-0.5">
          {isFinished ? "Completed" : `Ch. ${chapterNumber}`}
        </span>
        <h3 className="font-display font-bold italic text-base text-white truncate pr-2 mb-0.5">
          {title}
        </h3>
        <p className="font-ui text-xs text-text-muted truncate mb-3">
          {authorName}
        </p>
        <div className="flex gap-2">
          {isFinished ? (
            <span className="text-[10px] font-ui text-primary uppercase tracking-widest group-hover:text-white transition-colors">
              View Details
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-ui text-primary uppercase tracking-widest group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-sm">play_circle</span>
              Resume
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
