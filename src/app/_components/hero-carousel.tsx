import Link from "next/link";
import type { FeaturedNovel } from "@/lib/content";
import { novelDetailPath } from "@/lib/navigation";
import { readingRoomPath } from "@/lib/navigation";
import { StarIcon } from "./star-primitives";

/** Responsive items-per-view configuration (THE-49). */
export interface ItemsPerView {
  /** Columns on tablet (md: 768px). Default 2. */
  tablet?: number;
  /** Columns on desktop (lg: 1024px). Default 3. */
  desktop?: number;
}

interface HeroCarouselProps {
  /** Featured novel(s) for hero. First item is primary on mobile. */
  items: FeaturedNovel[];
  /** Optional first chapter ID for primary item "Start Reading" CTA. */
  firstChapterId?: string;
  /** Optional map of novelId -> firstChapterId for multi-item CTAs. */
  firstChapterIds?: Record<string, string>;
  /** Responsive columns: tablet (md), desktop (lg). Defaults: tablet 2, desktop 3. */
  itemsPerView?: ItemsPerView;
}

/** Backward-compatible: single featured novel. */
interface HeroCarouselLegacyProps {
  /** @deprecated Use items instead. Single featured novel. */
  featured?: FeaturedNovel;
  firstChapterId?: string;
  items?: never;
  firstChapterIds?: never;
  itemsPerView?: never;
}

type Props = HeroCarouselProps | HeroCarouselLegacyProps;

function isLegacyProps(
  p: Props
): p is HeroCarouselLegacyProps {
  return "featured" in p && p.featured != null && !("items" in p && Array.isArray(p.items));
}

/**
 * Hero carousel: 350px+ height, vignette edges, "Editor's Choice" label, CTA.
 * Multi-item display on tablet (2 cols, 480px) and desktop (3 cols, 520px).
 * Matches reference/midnight_satin_home.html. Requirements 3.1, 3.2 (THE-49).
 */
export function HeroCarousel(props: Props) {
  const items = isLegacyProps(props)
    ? [props.featured!]
    : props.items;
  const firstChapterId = "firstChapterId" in props ? props.firstChapterId : undefined;
  const firstChapterIds = "firstChapterIds" in props ? props.firstChapterIds : undefined;

  if (items.length === 0) return null;

  // Single item: original full-width layout
  if (items.length === 1) {
    return (
      <HeroCarouselSingle
        item={items[0]}
        firstChapterId={firstChapterId}
      />
    );
  }

  // Multi-item: responsive grid
  return (
    <section
      className="relative w-full overflow-hidden"
      aria-label="Editor's Choice featured novels"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-[24px] md:h-[480px] lg:grid-cols-3 lg:gap-8 lg:h-[520px]">
        {items.map((novel, index) => (
          <HeroCarouselCard
            key={novel.id}
            item={novel}
            firstChapterId={
              firstChapterIds?.[novel.id] ?? (novel.id === items[0].id ? firstChapterId : undefined)
            }
            loading={index === 0 ? "eager" : "lazy"}
          />
        ))}
      </div>
    </section>
  );
}

function HeroCarouselSingle({
  item,
  firstChapterId,
}: {
  item: FeaturedNovel;
  firstChapterId?: string;
}) {
  const ctaHref = firstChapterId
    ? readingRoomPath(item.id, firstChapterId)
    : novelDetailPath(item.id);

  return (
    <section className="relative h-[380px] xs:h-[420px] sm:h-[480px] md:h-[480px] lg:h-[520px] w-full overflow-hidden group">
      <div className="absolute inset-0 bg-void">
        {item.coverImageUrl ? (
          <img
            alt=""
            className="h-full w-full object-cover opacity-60"
            src={item.coverImageUrl}
            loading="eager"
            decoding="async"
          />
        ) : (
          <div className="h-full w-full bg-surface-highlight" />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-void via-void/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-void/60 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gold-sheen opacity-30 mix-blend-overlay" />

      <div className="absolute bottom-0 left-0 right-0 p-4 xs:p-6 flex flex-col items-center text-center z-10 pb-8 xs:pb-12">
        <span className="font-header text-[10px] tracking-[0.3em] text-white mb-2 xs:mb-3 uppercase border-b border-white/40 pb-1 hero-text-shadow">
          Editor&apos;s Choice
        </span>
        <h1 className="font-display italic font-bold text-3xl xs:text-4xl leading-tight text-white mb-2 gold-text-shadow">
          {item.title}
        </h1>
        <p className="font-ui text-white text-sm mb-2 tracking-wide hero-text-shadow">
          By {item.authorName}
        </p>
        {item.rating != null && item.ratingCount != null && (
          <div className="flex items-center justify-center gap-1 mb-4">
            {Array.from({ length: 5 }, (_, i) => {
              const full = Math.floor(item.rating!);
              const hasHalf = item.rating! - full >= 0.3;
              const isFull = i < full;
              const isHalf = i === full && hasHalf;
              return (
                <StarIcon
                  key={i}
                  size={18}
                  tone={isFull ? "active" : isHalf ? "half" : "inactive"}
                  variant={isHalf ? "half" : "full"}
                  aria-hidden
                />
              );
            })}
            <span className="text-xs text-white/80 ml-2 hero-text-shadow">
              ({item.ratingCount >= 1000 ? `${(item.ratingCount / 1000).toFixed(1)}k` : item.ratingCount} reviews)
            </span>
          </div>
        )}
        <Link
          href={ctaHref}
          className="bg-primary text-void font-ui font-bold text-sm px-6 xs:px-8 py-2.5 xs:py-3 rounded-sm hover:bg-white transition-colors duration-300 shadow-gold-glow uppercase tracking-wider"
        >
          Start Reading
        </Link>
        {item.genreTags && item.genreTags.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {item.genreTags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs tracking-wider uppercase border border-primary/60 text-primary rounded-sm bg-void/50 backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function HeroCarouselCard({
  item,
  firstChapterId,
  loading = "lazy",
}: {
  item: FeaturedNovel;
  firstChapterId?: string;
  loading?: "eager" | "lazy";
}) {
  const ctaHref = firstChapterId
    ? readingRoomPath(item.id, firstChapterId)
    : novelDetailPath(item.id);

  return (
    <Link
      href={ctaHref}
      className="relative block h-full min-h-[280px] md:min-h-0 overflow-hidden group"
    >
      <div className="absolute inset-0 bg-void">
        {item.coverImageUrl ? (
          <img
            alt=""
            className="h-full w-full object-cover opacity-60 group-hover:opacity-70 transition-opacity"
            src={item.coverImageUrl}
            loading={loading}
            decoding="async"
          />
        ) : (
          <div className="h-full w-full bg-surface-highlight" />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-void via-void/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-void/60 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gold-sheen opacity-30 mix-blend-overlay" />

      <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col items-center text-center z-10 pb-6">
        <span className="font-header text-[10px] tracking-[0.3em] text-primary mb-2 uppercase border-b border-primary/30 pb-1">
          Editor&apos;s Choice
        </span>
        <h2 className="font-display italic font-bold text-xl md:text-2xl leading-tight text-white mb-1 gold-text-shadow line-clamp-2">
          {item.title}
        </h2>
        <p className="font-ui text-text-muted text-xs mb-3 tracking-wide">
          By {item.authorName}
        </p>
        <span className="bg-primary/90 text-void font-ui font-bold text-xs px-4 py-2 rounded-sm group-hover:bg-primary transition-colors uppercase tracking-wider">
          Start Reading
        </span>
      </div>
    </Link>
  );
}
