"use client";

import Link from "next/link";
import { authorStudyPath } from "@/lib/navigation";
import type { FollowedAuthorItem } from "@/app/actions/profile";

interface FollowedAuthorsStripProps {
  authors: FollowedAuthorItem[];
}

/**
 * FollowedAuthorsStrip: Horizontally scrollable avatars linking to Author's Study.
 * Req 18.7.
 */
export function FollowedAuthorsStrip({ authors }: FollowedAuthorsStripProps) {
  if (authors.length === 0) return null;

  return (
    <section className="px-6 pb-8">
      <h2 className="font-header text-sm tracking-[0.15em] text-white/90 mb-4">
        Authors You Follow
      </h2>
      <div className="flex overflow-x-auto gap-4 no-scrollbar pb-2">
        {authors.map((author) => (
          <Link
            key={author.id}
            href={authorStudyPath(author.id)}
            className="shrink-0 flex flex-col items-center gap-2 group"
            aria-label={`View ${author.name}'s profile`}
          >
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/30 bg-surface-highlight flex items-center justify-center transition-transform group-hover:scale-105">
              {author.avatarUrl ? (
                <img
                  src={author.avatarUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <span
                  className="font-display font-bold italic text-lg text-primary"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {author.name.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <span className="font-ui text-[10px] text-text-muted truncate max-w-[60px] text-center group-hover:text-primary transition-colors">
              {author.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
