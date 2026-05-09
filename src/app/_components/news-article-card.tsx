import Link from "next/link";
import { newsArticlePath } from "@/lib/navigation";
import { getNewsAttribution } from "@/lib/content";
import { MetadataPills } from "./metadata-pills";
import type { NewsArticleSummary } from "@/lib/db/types";

interface NewsArticleCardProps {
  article: NewsArticleSummary;
  className?: string;
}

/**
 * News article card for The Boudoir "THE LATEST" section and the archive page.
 * Gold border distinguishes news cards from novel cards.
 * Reuses MetadataPills for tag styling parity with novel genre tags.
 */
export function NewsArticleCard({ article, className = "" }: NewsArticleCardProps) {
  const href = newsArticlePath(article.slug);
  const attribution = getNewsAttribution(article);

  return (
    <Link
      href={href}
      className={`card border-primary/40 flex flex-col w-[280px] shrink-0 snap-start md:w-full md:shrink md:snap-align-none group ${className}`}
      aria-label={`${article.title} — ${attribution}`}
    >
      <div className="overlay-sheen" aria-hidden />

      {/* Hero image — 16:9 */}
      <div className="relative w-full aspect-video bg-surface-highlight overflow-hidden">
        {article.heroImageUrl ? (
          <img
            src={article.heroImageUrl}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-text-muted opacity-50 text-4xl">
              article
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3
          className="font-display font-semibold italic text-lg text-text-main leading-tight group-hover:text-primary transition-colors"
        >
          {article.title}
        </h3>

        <p className="font-ui text-xs text-text-muted">{attribution}</p>

        <p className="font-body text-sm text-text-muted line-clamp-2 leading-relaxed">
          {article.summary}
        </p>

        <MetadataPills tags={article.tags} />
      </div>
    </Link>
  );
}
