import Link from "next/link";
import { authorStudyPath } from "@/lib/navigation";
import { MetadataPills } from "./metadata-pills";
import { RatingDisplay } from "./rating-display";

interface ParallaxHeroProps {
  title: string;
  authorId: string;
  authorName: string;
  coverImageUrl: string | null;
  genreTags: string[];
  rating: number;
  ratingCount: number;
  /** When set, mobile hero shows centered layout with Start Reading button (home-style). */
  startReadingHref?: string;
  /** When true, tablet+ renders cover and metadata as separate grid cells for novel-detail two-column layout. */
  tabletGridCells?: boolean;
}

/**
 * ParallaxHero: Novel Detail cover + metadata. Mobile: stacked overlay.
 * Tablet/Desktop (THE-57): two-column layout 40% cover (sticky), 60% metadata;
 * gap 48px tablet, 64px desktop; parallax effect preserved on cover.
 */
export function ParallaxHero({
  title,
  authorId,
  authorName,
  coverImageUrl,
  genreTags,
  rating,
  ratingCount,
  startReadingHref,
  tabletGridCells = false,
}: ParallaxHeroProps) {
  const cover = (
    <>
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: coverImageUrl ? `url(${coverImageUrl})` : undefined,
          backgroundColor: coverImageUrl ? "transparent" : "var(--surface)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-void via-void/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-void/60 via-transparent to-transparent md:hidden" />
    </>
  );

  const metadata = (
    <>
      <MetadataPills tags={genreTags} />
      <h1 className="text-3xl xs:text-4xl md:text-5xl font-display italic font-bold text-text-main leading-tight drop-shadow-lg">
        {title}
      </h1>
      <p className="text-lg text-text-muted font-display tracking-wide">
        By{" "}
        <Link
          href={authorStudyPath(authorId)}
          className="text-primary border-b border-primary/30 pb-0.5 hover:text-primary/80"
        >
          {authorName}
        </Link>
      </p>
      <RatingDisplay rating={rating} ratingCount={ratingCount} />
    </>
  );

  const mobileHeroContent = startReadingHref ? (
    <div className="absolute inset-0 w-full px-4 xs:px-6 flex flex-col z-10">
      {/* Main content moved up: super text, title, author, rating, button */}
      <div className="flex-1 flex flex-col items-center justify-center text-center pt-8 pb-2">
        <span className="text-[10px] tracking-[0.3em] text-white mb-2 uppercase border-b border-white/40 pb-1 hero-text-shadow">
          Editor&apos;s Pick
        </span>
        <h1 className="text-3xl xs:text-4xl font-display italic font-bold text-white leading-tight gold-text-shadow mt-1">
          {title}
        </h1>
        <p className="text-lg text-white font-display tracking-wide hero-text-shadow mt-2">
          By{" "}
          <Link
            href={authorStudyPath(authorId)}
            className="border-b border-white/40 pb-0.5 hover:text-white/90"
          >
            {authorName}
          </Link>
        </p>
        <div className="flex items-center justify-center gap-1 mt-2 [&_.text-text-muted]:text-white/80 [&_.text-text-muted]:hero-text-shadow">
          <RatingDisplay rating={rating} ratingCount={ratingCount} />
        </div>
        <Link
          href={startReadingHref}
          className="mt-4 bg-primary text-void font-bold text-sm px-8 py-3 rounded-sm hover:bg-white transition-colors duration-300 shadow-gold-glow uppercase tracking-wider"
        >
          Start Reading
        </Link>
      </div>
      {/* Genre tags at bottom of cover */}
      <div className="flex justify-center pt-2 pb-4 shrink-0">
        <MetadataPills tags={genreTags} />
      </div>
    </div>
  ) : (
    <div className="absolute bottom-0 left-0 w-full px-4 xs:px-6 pb-6 xs:pb-8 flex flex-col gap-2 xs:gap-3">
      {metadata}
    </div>
  );

  if (tabletGridCells) {
    return (
      <>
        {/* Mobile: full-width hero */}
        <div className="relative w-full min-h-[280px] md:hidden">
          <div className="relative h-[55vh] xs:h-[60vh] sm:h-[65vh] w-full overflow-hidden">
            {cover}
            {mobileHeroContent}
          </div>
        </div>
        {/* Tablet grid: cover cell with bottom-center overlay (left column) */}
        <div className="hidden md:flex flex-col md:col-start-1 md:row-start-1">
          <div className="relative aspect-[2/3] min-h-[280px] w-full overflow-hidden rounded-lg">
            {cover}
            <div className="absolute inset-0 bg-gradient-to-t from-void via-void/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-void/60 via-transparent to-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-end text-center p-6 z-[5]">
              <span className="font-heading text-[10px] tracking-[0.3em] text-white mb-2 uppercase border-b border-white/40 pb-1 hero-text-shadow">
                Editor&apos;s Pick
              </span>
              <h1 className="text-3xl sm:text-4xl font-display italic font-bold text-white leading-tight gold-text-shadow mt-1">
                {title}
              </h1>
              <p className="text-sm text-white font-display tracking-wide hero-text-shadow mt-2">
                By{" "}
                <Link
                  href={authorStudyPath(authorId)}
                  className="border-b border-white/40 pb-0.5 hover:text-white/90"
                >
                  {authorName}
                </Link>
              </p>
              <div className="flex items-center justify-center gap-1 mt-3 [&_.text-text-muted]:text-white/80 [&_.text-text-muted]:hero-text-shadow">
                <RatingDisplay rating={rating} ratingCount={ratingCount} />
              </div>
              {startReadingHref && (
                <Link
                  href={startReadingHref}
                  className="mt-4 bg-primary text-void font-bold text-sm px-8 py-3 rounded-sm hover:bg-white transition-colors duration-300 shadow-gold-glow uppercase tracking-wider"
                >
                  Start Reading
                </Link>
              )}
              <div className="flex justify-center pt-2 pb-0 shrink-0">
                <MetadataPills tags={genreTags} />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="relative w-full min-h-[280px]">
      {/* Mobile: stacked overlay; when startReadingHref set, use home-style centered layout */}
      <div className="relative h-[55vh] xs:h-[60vh] sm:h-[65vh] w-full overflow-hidden md:hidden">
        {cover}
        {mobileHeroContent}
      </div>

      {/* Tablet/Desktop: two-column layout 40% cover (sticky), 60% metadata (THE-57) */}
      <div className="hidden md:flex md:min-h-[65vh] md:gap-12 lg:gap-16 md:items-stretch px-4 xs:px-6">
        <div className="md:w-[40%] md:flex-shrink-0 md:sticky md:top-0 md:self-start">
          <div className="relative aspect-[2/3] min-h-[320px] w-full overflow-hidden rounded-sm">
            {cover}
          </div>
        </div>
        <div className="md:w-[60%] md:flex md:flex-col md:justify-center md:py-8">
          <div className="flex flex-col gap-2 xs:gap-3">
            {metadata}
          </div>
        </div>
      </div>
    </div>
  );
}
