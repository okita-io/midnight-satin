import { NovelCard } from "./novel-card";
import { ShimmerPlaceholder } from "./shimmer-placeholder";
import { EmptyState } from "./empty-state";
import type { FeaturedNovel } from "@/lib/content";

interface HighSocietySectionProps {
  novels: FeaturedNovel[];
  loading?: boolean;
}

/**
 * High Society: 2-col wrapping grid on mobile, 2-col on tablet, 3-col on desktop.
 * Shows the most recent novels + a "Coming Soon" placeholder.
 * Empty state: "Nothing in high society yet"
 * Matches reference/midnight_satin_home.html. THE-50.
 */
export function HighSocietySection({ novels, loading }: HighSocietySectionProps) {
  const sectionClass = "mb-8 xs:mb-10 px-4 xs:px-6 md:max-w-[1440px] md:mx-auto";
  const headerClass = "flex items-center justify-between mb-4 xs:mb-6";
  const gridClass =
    "grid grid-cols-2 gap-3 xs:gap-5 " +
    "md:gap-6 lg:grid-cols-3 lg:gap-8";

  if (loading) {
    return (
      <section className={sectionClass}>
        <div className={headerClass}>
          <h2 className="font-header text-sm tracking-[0.15em] text-white/90">High Society</h2>
        </div>
        <div className={gridClass}>
          {Array.from({ length: 4 }).map((_, i) => (
            <ShimmerPlaceholder
              key={i}
              className="aspect-[2/3] rounded-sm"
            />
          ))}
        </div>
      </section>
    );
  }

  if (novels.length === 0) {
    return (
      <section className={sectionClass}>
        <div className={headerClass}>
          <h2 className="font-header text-sm tracking-[0.15em] text-white/90">High Society</h2>
        </div>
        <EmptyState message="Nothing in high society yet" className="py-8" />
      </section>
    );
  }

  return (
    <section className={sectionClass}>
      <div className={headerClass}>
        <h2 className="font-header text-sm tracking-[0.15em] text-white/90">High Society</h2>
      </div>
      <div className={gridClass}>
        {novels.map((n) => (
          <NovelCard
            key={n.id}
            novel={{
              id: n.id,
              title: n.title,
              authorName: n.authorName,
              coverImageUrl: n.coverImageUrl,
              rating: n.rating > 0 ? n.rating : undefined,
            }}
            fill
          />
        ))}
        <div className="flex flex-col w-full group cursor-default">
          <div className="relative w-full aspect-[2/3] rounded-sm overflow-hidden mb-3 shadow-lg shadow-black/60 border border-white/5 bg-surface-highlight flex items-center justify-center">
            <span className="material-symbols-outlined text-text-muted opacity-50 text-4xl">
              auto_stories
            </span>
          </div>
          <h3 className="font-display font-bold italic text-base text-white leading-tight mb-1 truncate">
            Coming Soon
          </h3>
          <p className="font-ui text-[11px] text-text-muted truncate">Unknown Author</p>
        </div>
      </div>
    </section>
  );
}
