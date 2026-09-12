import Image from "next/image";
import Link from "next/link";
import type { FeaturedNovel } from "@/lib/content";
import { novelDetailPath } from "@/lib/navigation";
import { readingRoomPath } from "@/lib/navigation";
import { GRID_COLUMNS } from "@/lib/responsive/constants";
import { StarRowDisplay } from "./star-row-display";
import { SectionViewAllLink } from "./section-view-all";

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

  const itemsPerView = "itemsPerView" in props ? props.itemsPerView : undefined;

  if (items.length === 0) return null;

  const body =
    items.length === 1 ? (
      <HeroCarouselSingle item={items[0]} firstChapterId={firstChapterId} />
    ) : (
      <HeroCarouselGrid
        items={items}
        firstChapterId={firstChapterId}
        firstChapterIds={firstChapterIds}
        tabletVisible={itemsPerView?.tablet ?? GRID_COLUMNS.tablet}
        desktopVisible={itemsPerView?.desktop ?? GRID_COLUMNS.desktop}
      />
    );

  return (
    <section className="mb-2" aria-labelledby="editors-choice-heading">
      <div className="flex items-center justify-between px-4 xs:px-6 mb-4 xs:mb-5 md:max-w-[1440px] md:mx-auto">
        <h2
          id="editors-choice-heading"
          className="font-header text-sm tracking-[0.15em] uppercase text-white/90"
        >
          Editor&apos;s Choice
        </h2>
        <SectionViewAllLink href="/library" className="uppercase tracking-wider">
          View All
        </SectionViewAllLink>
      </div>
      {body}
    </section>
  );
}

function HeroCarouselGrid({
  items,
  firstChapterId,
  firstChapterIds,
  tabletVisible,
  desktopVisible,
}: {
  items: FeaturedNovel[];
  firstChapterId?: string;
  firstChapterIds?: Record<string, string>;
  tabletVisible: number;
  desktopVisible: number;
}) {
  return (
    <div className="relative w-full overflow-hidden">
      <div className={heroGridClassName(items.length, tabletVisible, desktopVisible)}>
        {items.map((novel, index) => (
          <HeroCarouselCard
            key={novel.id}
            item={novel}
            firstChapterId={
              firstChapterIds?.[novel.id] ?? (novel.id === items[0].id ? firstChapterId : undefined)
            }
            loading={index === 0 ? "eager" : "lazy"}
            className={heroCardVisibilityClass(index, tabletVisible, desktopVisible)}
          />
        ))}
      </div>
    </div>
  );
}

const TABLET_COL_CLASS = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
} as const;

const DESKTOP_COL_CLASS = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
} as const;

function clampHeroColumns(wanted: number, itemCount: number): 1 | 2 | 3 {
  const n = Math.min(Math.max(wanted, 1), itemCount, 3);
  return n as 1 | 2 | 3;
}

function heroGridClassName(
  itemCount: number,
  tabletVisible: number,
  desktopVisible: number
): string {
  const tablet = clampHeroColumns(tabletVisible, itemCount);
  const desktop = clampHeroColumns(desktopVisible, itemCount);
  return [
    "grid grid-cols-1 gap-4",
    TABLET_COL_CLASS[tablet],
    "md:gap-[24px] md:h-[480px]",
    DESKTOP_COL_CLASS[desktop],
    "lg:gap-8 lg:h-[520px]",
  ].join(" ");
}

function heroCardVisibilityClass(
  index: number,
  tabletVisible: number,
  desktopVisible: number
): string {
  if (index >= desktopVisible) return "hidden";
  if (index >= tabletVisible) return "hidden lg:block";
  return "";
}

/** Bottom-only fade behind title/CTA — transparent until the lower 30%. */
const HERO_OVERLAY_GRADIENT_BOTTOM =
  "absolute inset-x-0 bottom-0 h-[30%] pointer-events-none bg-[linear-gradient(180deg,rgba(5,5,5,0)_0%,rgba(5,5,5,0.55)_45%,#050505_100%)]";
const HERO_OVERLAY_SHEEN =
  "absolute inset-0 pointer-events-none bg-[linear-gradient(45deg,rgba(212,175,55,0.15)_0%,rgba(212,175,55,0)_55%)] opacity-25 mix-blend-overlay";

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
    <div className="relative h-[380px] xs:h-[420px] sm:h-[480px] md:h-[480px] lg:h-[520px] w-full overflow-hidden group">
      <div className="absolute inset-0 bg-void">
        {item.coverImageUrl ? (
          <div className="relative h-full w-full">
            <Image
              src={item.coverImageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
              priority
              unoptimized
            />
          </div>
        ) : (
          <div className="h-full w-full bg-surface-highlight" />
        )}
      </div>
      <div className={HERO_OVERLAY_GRADIENT_BOTTOM} />
      <div className={HERO_OVERLAY_SHEEN} />

      <div className="absolute bottom-0 left-0 right-0 px-6 pb-9 flex flex-col items-center text-center z-10">
        <span className="font-header text-[10px] tracking-[0.4em] text-white mb-2 uppercase hero-text-shadow">
          Editor&apos;s Choice
        </span>
        <h2
          className="font-display italic font-semibold text-[32px] leading-[1.15] text-white mb-1 gold-text-shadow max-w-[310px]"
        >
          {item.title}
        </h2>
        <p className="font-ui text-white text-sm mb-2 hero-text-shadow">
          By {item.authorName}
        </p>
        {item.rating != null && item.ratingCount != null && (
          <div className="flex items-center justify-center gap-1 mb-4">
            <StarRowDisplay value={item.rating} size={18} allowHalf />
            <span className="text-xs text-white/80 ml-2 hero-text-shadow">
              ({item.ratingCount >= 1000 ? `${(item.ratingCount / 1000).toFixed(1)}k` : item.ratingCount} reviews)
            </span>
          </div>
        )}
        <Link
          href={ctaHref}
          className="btn-gold h-11 px-7 inline-flex items-center justify-center text-xs font-medium tracking-[0.25em] active:scale-[0.98]"
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
    </div>
  );
}

function HeroCarouselCard({
  item,
  firstChapterId,
  loading = "lazy",
  className = "",
}: {
  item: FeaturedNovel;
  firstChapterId?: string;
  loading?: "eager" | "lazy";
  className?: string;
}) {
  const ctaHref = firstChapterId
    ? readingRoomPath(item.id, firstChapterId)
    : novelDetailPath(item.id);

  return (
    <Link
      href={ctaHref}
      className={`relative block h-full min-h-[280px] md:min-h-0 overflow-hidden group ${className}`.trim()}
    >
      <div className="absolute inset-0 bg-void">
        {item.coverImageUrl ? (
          <div className="relative h-full w-full">
            <Image
              src={item.coverImageUrl}
              alt=""
              fill
              className="object-cover [@media(hover:hover)]:group-hover:brightness-110 transition-[filter]"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={loading === "eager"}
              unoptimized
            />
          </div>
        ) : (
          <div className="h-full w-full bg-surface-highlight" />
        )}
      </div>
      <div className={HERO_OVERLAY_GRADIENT_BOTTOM} />
      <div className={HERO_OVERLAY_SHEEN} />

      <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 flex flex-col items-center text-center z-10">
        <span className="font-header text-[10px] tracking-[0.4em] text-white mb-2 uppercase">
          Editor&apos;s Choice
        </span>
        <h2
          className="font-display italic font-semibold text-[26px] leading-[1.1] text-white mb-1 gold-text-shadow line-clamp-2 max-w-[310px]"
        >
          {item.title}
        </h2>
        <p className="font-ui text-white/80 text-xs mb-4">
          By {item.authorName}
        </p>
        <span className="btn-gold h-10 px-6 inline-flex items-center justify-center text-[11px] font-medium tracking-[0.25em] active:scale-[0.98]">
          Start Reading
        </span>
      </div>
    </Link>
  );
}
