import Link from "next/link";
import { newsArchivePath } from "@/lib/navigation";
import { NewsArticleCard } from "./news-article-card";
import type { NewsArticleSummary } from "@/lib/db/types";

interface TheLatestSectionProps {
  articles: NewsArticleSummary[];
}

/**
 * Gazette strip on The Boudoir. Visually separated from Editor's Choice
 * so news cards are not read as part of the featured novels.
 * "View All" opens the Updates archive.
 */
export function TheLatestSection({ articles }: TheLatestSectionProps) {
  if (articles.length === 0) return null;

  const display = articles.slice(0, 3);

  return (
    <section
      className="mb-8 xs:mb-10 px-4 xs:px-6 md:max-w-[1440px] md:mx-auto pt-8 mt-6"
      aria-labelledby="the-latest-heading"
    >
      <div
        className="h-px mb-8 bg-[linear-gradient(90deg,rgba(212,175,55,0)_0%,rgba(212,175,55,0.4)_50%,rgba(212,175,55,0)_100%)]"
        aria-hidden
      />
      <div className="flex items-center justify-between mb-4 xs:mb-6">
        <h2
          id="the-latest-heading"
          className="font-header text-sm tracking-[0.15em] uppercase text-white/90"
        >
          The Latest
        </h2>
        <Link
          href={newsArchivePath()}
          className="font-ui text-xs tracking-wider uppercase text-primary hover:text-primary/80 transition-colors"
        >
          View All
        </Link>
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 md:hidden">
        {display.map((article) => (
          <NewsArticleCard key={article.id} article={article} />
        ))}
      </div>

      {/* Tablet / Desktop: responsive grid */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
        {display.map((article) => (
          <NewsArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
