import { NovelCard } from "./novel-card";
import { EmptyState } from "./empty-state";
import type { FeaturedNovel } from "@/lib/content";

interface HighSocietySectionProps {
  novels: FeaturedNovel[];
  loading?: boolean;
}

/**
 * High Society: horizontally scrollable on mobile, CSS Grid on tablet/desktop.
 * Tablet: 2 columns, Desktop: 3 columns, max-width 1440px centered.
 * Empty state: "Nothing in high society yet"
 * Matches reference/midnight_satin_home.html. THE-50.
 */
export function HighSocietySection({ novels, loading }: HighSocietySectionProps) {
  const sectionClass = "mb-8 xs:mb-10 px-4 xs:px-6 md:max-w-[1440px] md:mx-auto";
  const headerClass = "flex items-center justify-between mb-4 xs:mb-6";
  const gridClass =
    "grid grid-flow-col grid-auto-cols-[110px] xs:grid-auto-cols-[130px] gap-3 xs:gap-5 pb-6 xs:pb-8 no-scrollbar overflow-x-auto snap-x snap-mandatory " +
    "md:grid-flow-row md:grid-cols-2 md:gap-6 md:overflow-visible md:snap-none " +
    "lg:grid-cols-3 lg:gap-8";

  if (loading) {
    return (
      <section className={sectionClass}>
        <div className={headerClass}>
          <h2 className="font-header text-sm tracking-[0.15em] text-white/90">High Society</h2>
        </div>
        <div className={gridClass}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col min-w-0 md:w-full snap-start">
              <div className="w-full aspect-[2/3] rounded-sm overflow-hidden mb-3 bg-surface-highlight animate-pulse" />
              <div className="h-4 bg-surface-highlight rounded animate-pulse mb-2 w-3/4" />
              <div className="h-3 bg-surface-highlight rounded animate-pulse w-1/2" />
            </div>
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
            className="snap-start"
          />
        ))}
        <div className="flex flex-col min-w-[110px] xs:min-w-[130px] md:min-w-0 w-full snap-start group cursor-default">
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
