import Link from "next/link";
import type { FeaturedNovel } from "@/lib/content";
import { novelDetailPath } from "@/lib/navigation";
import { readingRoomPath } from "@/lib/navigation";

interface HeroCarouselProps {
  /** Featured novel for hero. First item is primary. */
  featured: FeaturedNovel;
  /** Optional first chapter ID for "Start Reading" CTA. When content layer is ready, use first free/unlocked chapter. */
  firstChapterId?: string;
}

/**
 * Hero carousel: 350px+ height, vignette edges, "Editor's Choice" label, CTA.
 * Matches reference/midnight_satin_home.html.
 */
export function HeroCarousel({ featured, firstChapterId }: HeroCarouselProps) {
  const ctaHref = firstChapterId
    ? readingRoomPath(featured.id, firstChapterId)
    : novelDetailPath(featured.id);

  return (
    <section className="relative h-[380px] xs:h-[420px] sm:h-[480px] w-full overflow-hidden group">
      {/* Background Image */}
      <div className="absolute inset-0 bg-void">
        {featured.coverImageUrl ? (
          <img
            alt=""
            className="h-full w-full object-cover opacity-60"
            src={featured.coverImageUrl}
          />
        ) : (
          <div className="h-full w-full bg-surface-highlight" />
        )}
      </div>
      {/* Vignette & Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-void via-void/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-void/60 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gold-sheen opacity-30 mix-blend-overlay" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 xs:p-6 flex flex-col items-center text-center z-10 pb-8 xs:pb-12">
        <span className="font-header text-[10px] tracking-[0.3em] text-primary mb-2 xs:mb-3 uppercase border-b border-primary/30 pb-1">
          Editor&apos;s Choice
        </span>
        <h1 className="font-display italic font-bold text-3xl xs:text-4xl leading-tight text-white mb-2 gold-text-shadow">
          {featured.title}
        </h1>
        <p className="font-ui text-text-muted text-sm mb-4 xs:mb-6 tracking-wide">
          By {featured.authorName}
        </p>
        <Link
          href={ctaHref}
          className="bg-primary text-void font-ui font-bold text-sm px-6 xs:px-8 py-2.5 xs:py-3 rounded-sm hover:bg-white transition-colors duration-300 shadow-gold-glow uppercase tracking-wider"
        >
          Start Reading
        </Link>
      </div>
    </section>
  );
}
