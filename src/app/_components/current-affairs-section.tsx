"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AuthPrompt } from "./auth-prompt";
import { EmptyState } from "./empty-state";
import type { CurrentReading } from "@/lib/content";
import { readingRoomPath } from "@/lib/navigation";

interface CurrentAffairsSectionProps {
  /** Current reading for registered reader, or null if none/guest */
  currentReading: CurrentReading | null;
  /** Whether the user is authenticated (View All → profile vs auth prompt) */
  isAuthenticated: boolean;
}

/**
 * Current Affairs: currently reading card with cover, title, author, chapter, progress bar.
 * View All → /profile for registered, auth prompt for guests.
 * Empty state: "No current affairs"
 * Matches reference/midnight_satin_home.html.
 */
export function CurrentAffairsSection({
  currentReading,
  isAuthenticated,
}: CurrentAffairsSectionProps) {
  const [authPromptOpen, setAuthPromptOpen] = useState(false);

  const handleViewAll = () => {
    if (isAuthenticated) {
      return; // Link handles navigation
    }
    setAuthPromptOpen(true);
  };

  return (
    <>
      <section className="px-4 xs:px-6 md:px-6 md:max-w-[1440px] md:mx-auto mb-8 xs:mb-10 relative z-10">
        <div className="flex items-center justify-between mb-4 xs:mb-6">
          <h2 className="font-header text-sm tracking-[0.15em] text-white/90">
            Current Affairs
          </h2>
          {isAuthenticated ? (
            <Link
              href="/profile"
              className="text-[10px] font-ui text-primary uppercase tracking-widest hover:text-white transition-colors"
            >
              View All
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleViewAll}
              className="text-[10px] font-ui text-primary uppercase tracking-widest hover:text-white transition-colors bg-transparent border-none cursor-pointer active:scale-95"
            >
              View All
            </button>
          )}
        </div>

        {!currentReading ? (
          <EmptyState message="No current affairs" className="py-8" />
        ) : (
          <CurrentAffairsCard currentReading={currentReading} />
        )}
      </section>

      <AuthPrompt
        isOpen={authPromptOpen}
        onClose={() => setAuthPromptOpen(false)}
        returnUrl="/profile"
        message="Sign in to view your library and currently reading list."
      />
    </>
  );
}

function CurrentAffairsCard({ currentReading }: { currentReading: CurrentReading }) {
  const { novel, chapterTitle, scrollPercent, chapterId } = currentReading;
  const href = readingRoomPath(novel.id, chapterId);

  return (
    <Link
      href={href}
      className="bg-surface border border-white/5 p-4 rounded-sm flex gap-4 shadow-card-depth relative overflow-hidden group block"
      aria-label={`Resume ${novel.title}, ${chapterTitle}, ${scrollPercent}% complete`}
    >
      <div className="absolute inset-0 bg-gold-sheen opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      {/* Cover */}
      <div className="w-[80px] h-[120px] shrink-0 rounded-sm overflow-hidden shadow-lg shadow-black/50 relative">
        {novel.coverImageUrl ? (
          <Image
            src={novel.coverImageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="80px"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-surface-highlight flex items-center justify-center">
            <span className="material-symbols-outlined text-text-muted opacity-50 text-3xl">
              auto_stories
            </span>
          </div>
        )}
        {/* Progress overlay on image */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div
            className="h-full bg-primary shadow-[0_0_10px_rgba(212,175,55,0.8)] transition-all"
            style={{ width: `${scrollPercent}%` }}
          />
        </div>
      </div>
      {/* Details */}
      <div className="flex flex-col justify-center flex-1 min-w-0">
        <span className="text-[10px] text-primary/80 font-ui uppercase tracking-wider mb-1">
          {chapterTitle}
        </span>
        <h3 className="font-display font-semibold italic text-xl text-white truncate pr-2 mb-1">
          {novel.title}
        </h3>
        <p className="font-ui text-xs text-text-muted mb-4">{novel.authorName}</p>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-[10px] text-text-muted font-ui">
            {Math.round(scrollPercent)}% Complete
          </span>
          <span className="text-primary hover:text-white transition-colors" aria-hidden>
            <span className="material-symbols-outlined text-xl">play_circle</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
