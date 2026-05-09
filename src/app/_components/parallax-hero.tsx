import Image from "next/image";
import Link from "next/link";
import { authorStudyPath } from "@/lib/navigation";
import { MetadataPills } from "./metadata-pills";
import { RatingDisplay } from "./rating-display";

interface ParallaxHeroProps {
  novelId: string;
  title: string;
  authorId: string;
  authorName: string;
  coverImageUrl: string | null;
  genreTags: string[];
  rating: number;
  ratingCount: number;
  startReadingHref?: string;
  /** When true, renders as a tablet cover card (2:3 aspect, rounded, bordered) with metadata overlay inside. */
  tabletGridCells?: boolean;
}

export function ParallaxHero({
  novelId,
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
  /** Sits flush with the cover top; slight negative Y so the art reads as draping over the book edge (fabric bookmark). */
  const paperbackBadge = (
    <Link
      href={`/novel/${novelId}/paperback`}
      className={`absolute z-20 block w-[clamp(4.25rem,22vw,7rem)] touch-manipulation origin-top -translate-y-2 motion-safe:transition-transform hover:scale-[1.03] hover:-translate-y-1 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-void/80 rounded-sm ${
        tabletGridCells ? "left-2 top-0" : "left-3 top-0"
      }`}
      aria-label="Buy the paperback edition"
    >
      <Image
        src="/images/buythebook.svg"
        alt=""
        width={73}
        height={115}
        className="h-auto w-full drop-shadow-[0_4px_14px_rgba(0,0,0,0.55)]"
      />
    </Link>
  );
  const metadataOverlay = (
    <div className="absolute inset-0 flex flex-col items-center justify-end text-center p-6 z-[5]">
      <span className="font-heading text-[10px] tracking-[0.3em] text-white mb-2 uppercase border-b border-white/40 pb-1 hero-text-shadow">
        Editor&apos;s Pick
      </span>
      <h1 className="text-3xl sm:text-4xl font-display italic font-semibold text-white leading-tight gold-text-shadow mt-1">
        {title}
      </h1>
      <p className="text-sm text-white font-ui tracking-wide hero-text-shadow mt-2">
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
          className="btn-gold mt-4 h-11 px-7 inline-flex items-center justify-center text-xs font-medium tracking-[0.25em] active:scale-[0.98]"
        >
          Start Reading
        </Link>
      )}
      <div className="flex flex-wrap gap-2 justify-center mt-4">
        <MetadataPills tags={genreTags} />
      </div>
    </div>
  );

  if (tabletGridCells) {
    return (
      <div className="w-full shrink-0 relative">
        {/* overflow-visible on outer so the paperback ribbon can extend above the cover; image stays clipped */}
        <div className="aspect-[2/3] w-full max-w-[320px] mx-auto md:max-w-none rounded-lg border border-primary/20 shadow-2xl relative overflow-visible">
          <div className="absolute inset-0 overflow-hidden rounded-lg">
            {coverImageUrl ? (
              <Image
                src={coverImageUrl}
                alt={`${title} cover`}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 320px, 90vw"
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-surface" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-void via-void/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-void/60 via-transparent to-transparent" />
          </div>
          {paperbackBadge}
          {metadataOverlay}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[65vh] w-full overflow-visible">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: coverImageUrl ? `url(${coverImageUrl})` : undefined,
          backgroundColor: coverImageUrl ? "transparent" : "var(--surface)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-void via-void/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-void/60 via-transparent to-transparent" />
      {paperbackBadge}
      <div className="absolute bottom-0 left-0 right-0 w-full px-6 pb-12 flex flex-col items-center text-center z-10">
        <span className="text-[10px] tracking-[0.3em] text-white mb-3 uppercase border-b border-white/40 pb-1 hero-text-shadow">
          Editor&apos;s Pick
        </span>
        <h1 className="text-4xl md:text-5xl font-display italic font-semibold text-white leading-tight gold-text-shadow">
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
        <div className="flex items-center justify-center gap-1 mt-3 [&_.text-text-muted]:text-white/80 [&_.text-text-muted]:hero-text-shadow">
          <RatingDisplay rating={rating} ratingCount={ratingCount} />
        </div>
        {startReadingHref && (
          <Link
            href={startReadingHref}
            className="btn-gold mt-6 h-11 px-7 inline-flex items-center justify-center text-xs font-medium tracking-[0.25em] active:scale-[0.98]"
          >
            Start Reading
          </Link>
        )}
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          <MetadataPills tags={genreTags} />
        </div>
      </div>
    </div>
  );
}
