import { NovelCard } from "./novel-card";
import { EmptyState } from "./empty-state";
import type { FeaturedNovel } from "@/lib/content";

interface HighSocietySectionProps {
  novels: FeaturedNovel[];
  loading?: boolean;
}

/**
 * High Society: horizontally scrollable trending novels.
 * Empty state: "Nothing in high society yet"
 * Matches reference/midnight_satin_home.html.
 */
export function HighSocietySection({ novels, loading }: HighSocietySectionProps) {
  if (loading) {
    return (
      <section className="mb-10 pl-6">
        <div className="flex items-center justify-between mb-6 pr-6">
          <h2 className="font-header text-sm tracking-[0.15em] text-white/90">High Society</h2>
        </div>
        <div className="flex overflow-x-auto gap-5 pb-8 no-scrollbar pr-6 snap-x snap-mandatory">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col w-[130px] shrink-0 snap-start">
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
      <section className="mb-10 px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-header text-sm tracking-[0.15em] text-white/90">High Society</h2>
        </div>
        <EmptyState message="Nothing in high society yet" className="py-8" />
      </section>
    );
  }

  return (
    <section className="mb-10 pl-6">
      <div className="flex items-center justify-between mb-6 pr-6">
        <h2 className="font-header text-sm tracking-[0.15em] text-white/90">High Society</h2>
      </div>
      <div className="flex overflow-x-auto gap-5 pb-8 no-scrollbar pr-6 snap-x snap-mandatory">
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
            className="snap-start"
          />
        ))}
        {/* Coming Soon placeholder per reference design */}
        <div className="flex flex-col w-[130px] shrink-0 snap-start group cursor-default">
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
