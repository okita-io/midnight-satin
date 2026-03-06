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

  return (
    <div className="relative w-full min-h-[280px]">
      {/* Mobile: stacked overlay layout */}
      <div className="relative h-[55vh] xs:h-[60vh] sm:h-[65vh] w-full overflow-hidden md:hidden">
        {cover}
        <div className="absolute bottom-0 left-0 w-full px-4 xs:px-6 pb-6 xs:pb-8 flex flex-col gap-2 xs:gap-3">
          {metadata}
        </div>
      </div>

      {/* Tablet/Desktop: two-column layout 40% cover (sticky), 60% metadata (THE-57) */}
      <div className="hidden md:flex md:min-h-[65vh] md:gap-12 lg:gap-16 md:items-stretch px-4 xs:px-6">
        {/* Cover column: 40%, sticky, parallax preserved */}
        <div className="md:w-[40%] md:flex-shrink-0 md:sticky md:top-0 md:self-start">
          <div className="relative aspect-[2/3] min-h-[320px] w-full overflow-hidden rounded-sm">
            {cover}
          </div>
        </div>
        {/* Metadata column: 60% */}
        <div className="md:w-[60%] md:flex md:flex-col md:justify-center md:py-8">
          <div className="flex flex-col gap-2 xs:gap-3">
            {metadata}
          </div>
        </div>
      </div>
    </div>
  );
}
