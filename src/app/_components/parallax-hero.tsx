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
  startReadingHref?: string;
  /** When true, renders as a tablet cover card (2:3 aspect, rounded, bordered) with metadata overlay inside. */
  tabletGridCells?: boolean;
}

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
  const metadataOverlay = (
    <div className="absolute inset-0 flex flex-col items-center justify-end text-center p-6 z-[5]">
      <span className="font-heading text-[10px] tracking-[0.3em] text-white mb-2 uppercase border-b border-white/40 pb-1 hero-text-shadow">
        Editor&apos;s Pick
      </span>
      <h1 className="text-3xl sm:text-4xl font-display italic font-bold text-white leading-tight gold-text-shadow mt-1">
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
          className="mt-4 bg-primary text-void font-ui font-bold text-sm px-8 py-3 rounded-sm hover:bg-white transition-colors duration-300 shadow-gold-glow uppercase tracking-wider"
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
        <div className="aspect-[2/3] w-full max-w-[320px] mx-auto md:max-w-none rounded-lg overflow-hidden border border-primary/20 shadow-2xl relative">
          {coverImageUrl ? (
            <img
              src={coverImageUrl}
              alt={`${title} cover`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-surface" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-void/60 via-transparent to-transparent" />
          {metadataOverlay}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[65vh] w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: coverImageUrl ? `url(${coverImageUrl})` : undefined,
          backgroundColor: coverImageUrl ? "transparent" : "var(--surface)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-void via-void/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-void/60 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 w-full px-6 pb-12 flex flex-col items-center text-center z-10">
        <span className="text-[10px] tracking-[0.3em] text-white mb-3 uppercase border-b border-white/40 pb-1 hero-text-shadow">
          Editor&apos;s Pick
        </span>
        <h1 className="text-4xl md:text-5xl font-display italic font-bold text-white leading-tight gold-text-shadow">
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
            className="mt-6 bg-primary text-void font-bold text-sm px-8 py-3 rounded-sm hover:bg-white transition-colors duration-300 shadow-gold-glow uppercase tracking-wider"
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
