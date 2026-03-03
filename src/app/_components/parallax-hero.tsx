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

export function ParallaxHero({
  title,
  authorId,
  authorName,
  coverImageUrl,
  genreTags,
  rating,
  ratingCount,
}: ParallaxHeroProps) {
  return (
    <div className="relative h-[65vh] w-full overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: coverImageUrl ? `url(${coverImageUrl})` : undefined,
          backgroundColor: coverImageUrl ? "transparent" : "var(--surface)",
        }}
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-void via-void/60 to-transparent" />
      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 w-full px-6 pb-8 flex flex-col gap-3">
        <MetadataPills tags={genreTags} />
        <h1 className="text-4xl md:text-5xl font-display italic font-bold text-text-main leading-tight drop-shadow-lg">
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
      </div>
    </div>
  );
}
