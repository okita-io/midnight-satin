"use client";

import Link from "next/link";
import { authorStudyPath } from "@/lib/navigation";
import type { FollowedAuthorItem } from "@/app/actions/profile";

const HEXAGON_CLIP =
  "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

interface FollowedAuthorsStripProps {
  authors: FollowedAuthorItem[];
}

/**
 * FollowedAuthorsStrip: Horizontally scrollable avatars linking to Author's Study.
 * Req 18.7. THE-80: 6 avatars visible on tablet, 8 on desktop; hexagonal styling.
 */
export function FollowedAuthorsStrip({ authors }: FollowedAuthorsStripProps) {
  if (authors.length === 0) return null;

  return (
    <section className="px-4 xs:px-6 pb-8 md:max-w-[1440px] md:mx-auto">
      <h2 className="font-header text-sm tracking-[0.15em] text-primary uppercase mb-4">
        Authors You Follow
      </h2>
      <div className="flex overflow-x-auto gap-4 md:gap-6 no-scrollbar pb-2">
        {authors.map((author) => (
          <Link
            key={author.id}
            href={authorStudyPath(author.id)}
            className="shrink-0 min-w-14 md:min-w-0 md:flex-[0_0_calc((100%-5*1.5rem)/6)] lg:flex-[0_0_calc((100%-7*1.5rem)/8)] flex flex-col items-center gap-2 group"
            aria-label={`View ${author.name}'s profile`}
          >
            <div className="relative w-14 h-16 md:w-full md:aspect-[8/9] flex-shrink-0 group-hover:scale-105 transition-transform">
              {/* Gold gradient border (hexagonal) */}
              <div
                className="absolute -inset-[2px] bg-gradient-to-b from-primary to-[#8A7018] opacity-100 shadow-gold-glow"
                style={{ clipPath: HEXAGON_CLIP }}
              />
              <div
                className="relative w-full h-full bg-surface overflow-hidden flex items-center justify-center"
                style={{ clipPath: HEXAGON_CLIP }}
              >
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
            </div>
            <span className="font-ui text-[10px] text-text-muted truncate max-w-[60px] md:max-w-[80px] text-center group-hover:text-primary transition-colors">
              {author.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
