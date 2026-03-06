"use client";

import Link from "next/link";
import { novelDetailPath } from "@/lib/navigation";
import { usePointerDevice } from "@/lib/responsive/hooks";

export interface NovelCardData {
  id: string;
  title: string;
  authorName: string;
  coverImageUrl: string | null;
  rating?: number | null;
  ratingCount?: number;
  /** For expanded list: author biography excerpt */
  authorBio?: string | null;
  /** For expanded list: genre tags */
  genreTags?: string[];
  /** For expanded list: chapter count */
  chapterCount?: number;
}

interface NovelCardProps {
  novel: NovelCardData;
  /** Optional: use compact horizontal layout (e.g. Current Affairs), expanded list (desktop), or list (responsive: compact on mobile/tablet, expanded on desktop) */
  variant?: "default" | "compact" | "list-expanded" | "list";
  /** When true, card fills grid cell (for responsive grid layout on tablet/desktop) */
  fill?: boolean;
  className?: string;
}

/**
 * Reusable novel card. Tapping navigates to Novel Detail.
 * Design: cover 2:3, title Playfair Display, author Marcellus, optional star badge.
 */
export function NovelCard({ novel, variant = "default", fill = false, className = "" }: NovelCardProps) {
  const href = novelDetailPath(novel.id);
  const pointerDevice = usePointerDevice();
  const supportsHover = pointerDevice === "mouse";

  if (variant === "compact") {
    return (
      <Link
        href={href}
        className={`card flex gap-3 xs:gap-4 p-3 xs:p-4 group ${supportsHover ? "catalog-item-hover" : ""} ${className}`}
        aria-label={`${novel.title} by ${novel.authorName}`}
      >
        <div className="overlay-sheen" aria-hidden />
        <div className={`catalog-item-cover w-16 xs:w-20 h-[100px] xs:h-[120px] shrink-0 rounded-sm overflow-hidden shadow-lg bg-surface-highlight relative`}>
          {novel.coverImageUrl ? (
            <img
              src={novel.coverImageUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-text-muted text-3xl">
              auto_stories
            </span>
          )}
        </div>
        <div className="flex flex-col justify-center flex-1 min-w-0">
          <h3 className="font-display font-bold italic text-lg xs:text-xl text-text-main truncate pr-2 mb-1 group-hover:text-primary transition-colors">
            {novel.title}
          </h3>
          <p className="font-ui text-xs text-text-muted">{novel.authorName}</p>
          {novel.rating != null && (
            <div className="flex items-center gap-1 mt-2">
              <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
              <span className="text-[10px] font-ui text-text-main">{novel.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </Link>
    );
  }

  if (variant === "list") {
    return (
      <div className={`relative ${className}`}>
        <div className="lg:hidden">
          <NovelCard novel={novel} variant="compact" />
        </div>
        <div className="hidden lg:block">
          <NovelCard novel={novel} variant="list-expanded" />
        </div>
      </div>
    );
  }

  if (variant === "list-expanded") {
    const bioExcerpt = novel.authorBio
      ? novel.authorBio.slice(0, 120) + (novel.authorBio.length > 120 ? "…" : "")
      : null;
    return (
      <Link
        href={href}
        className={`card flex gap-6 p-4 group h-[240px] ${supportsHover ? "catalog-item-hover" : ""} ${className}`}
        aria-label={`${novel.title} by ${novel.authorName}`}
      >
        <div className="overlay-sheen" aria-hidden />
        <div className="catalog-item-cover w-[160px] h-[240px] shrink-0 rounded-sm overflow-hidden shadow-lg bg-surface-highlight relative">
          {novel.coverImageUrl ? (
            <img
              src={novel.coverImageUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-text-muted text-4xl">
              auto_stories
            </span>
          )}
        </div>
        <div className="flex flex-col justify-center flex-1 min-w-0 py-1">
          <h3 className="font-display font-bold italic text-xl text-text-main mb-1 group-hover:text-primary transition-colors line-clamp-2">
            {novel.title}
          </h3>
          <p className="font-ui text-sm text-text-muted uppercase tracking-wider mb-2">
            {novel.authorName}
          </p>
          {bioExcerpt && (
            <p className="font-body text-sm text-text-muted line-clamp-2 mb-2">
              {bioExcerpt}
            </p>
          )}
          {(novel.genreTags?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {novel.genreTags!.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-ui px-2 py-0.5 rounded-sm border border-primary/30 text-primary/90"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-4 mt-auto">
            {novel.rating != null && (
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
                <span className="text-xs font-ui text-text-main">{novel.rating.toFixed(1)}</span>
                {novel.ratingCount != null && novel.ratingCount > 0 && (
                  <span className="text-[10px] text-text-muted">({novel.ratingCount})</span>
                )}
              </div>
            )}
            {novel.chapterCount != null && novel.chapterCount > 0 && (
              <span className="text-[10px] font-ui text-text-muted">
                {novel.chapterCount} {novel.chapterCount === 1 ? "chapter" : "chapters"}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`flex flex-col ${fill ? "w-full min-w-0" : "w-[110px] xs:w-[130px] shrink-0 snap-start"} group cursor-pointer ${supportsHover ? "catalog-item-hover" : ""} ${className}`}
      aria-label={`${novel.title} by ${novel.authorName}`}
    >
      <div className="catalog-item-cover relative w-full aspect-[2/3] rounded-sm overflow-hidden mb-3 shadow-lg border border-white/5">
        {novel.coverImageUrl ? (
          <img
            src={novel.coverImageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-surface-highlight flex items-center justify-center">
            <span className="material-symbols-outlined text-text-muted opacity-50 text-4xl">
              auto_stories
            </span>
          </div>
        )}
        {novel.rating != null && (
          <div className="absolute top-2 right-2 bg-void/80 backdrop-blur-sm px-1.5 py-0.5 rounded-sm border border-primary/20 flex items-center gap-1">
            <span className="material-symbols-outlined text-[10px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              star
            </span>
            <span className="text-[10px] font-ui text-white">{novel.rating.toFixed(1)}</span>
          </div>
        )}
      </div>
      <h3 className="font-display font-bold italic text-base text-white leading-tight mb-1 truncate group-hover:text-primary transition-colors">
        {novel.title}
      </h3>
      <p className="font-ui text-[11px] text-text-muted truncate">{novel.authorName}</p>
    </Link>
  );
}
