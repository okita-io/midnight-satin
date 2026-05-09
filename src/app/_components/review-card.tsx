import { formatShortAgo } from "@/lib/format";
import { StarRowDisplay } from "./star-row-display";

export interface ReviewCardData {
  id: string;
  content: string;
  likeCount: number;
  starRating: number;
  createdAt: Date | string;
  readerDisplayName: string | null;
}

interface ReviewCardProps {
  review: ReviewCardData;
  /** Novel detail preview: full width, clamped body. Reviews page: full text. */
  variant?: "compact" | "full";
}

export function ReviewCard({ review, variant = "compact" }: ReviewCardProps) {
  const created =
    typeof review.createdAt === "string"
      ? new Date(review.createdAt)
      : review.createdAt;
  const when = formatShortAgo(created);
  const name = review.readerDisplayName?.trim() || "Reader";

  return (
    <article
      className="w-full flex flex-col rounded-sm border border-primary/15 bg-white/[0.02] p-4 backdrop-blur-sm"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-ui text-xs uppercase tracking-widest text-primary/90 truncate">
          {name}
        </span>
        <span className="text-[10px] text-text-muted whitespace-nowrap font-ui uppercase tracking-wider">
          {when}
        </span>
      </div>
      <StarRowDisplay
        value={review.starRating}
        size={16}
        className="mb-2"
        ariaLabel={`${review.starRating} out of 5 stars`}
      />
      <p
        className={`font-body text-sm text-text-main/90 leading-relaxed flex-1 ${
          variant === "compact" ? "line-clamp-6" : "whitespace-pre-wrap"
        }`}
      >
        {review.content}
      </p>
      <div className="mt-3 flex items-center gap-1 text-text-muted/80">
        <span
          className="material-symbols-outlined text-base text-primary/50"
          style={{ fontVariationSettings: "'FILL' 0" }}
          aria-hidden
        >
          favorite
        </span>
        <span className="text-[10px] font-ui uppercase tracking-wider">
          {review.likeCount} helpful
        </span>
      </div>
    </article>
  );
}
