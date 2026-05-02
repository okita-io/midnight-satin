import Link from "next/link";
import { ReviewCard, type ReviewCardData } from "./review-card";
import { NovelReviewComposer } from "./novel-review-composer";

const PREVIEW_LIMIT = 5;

export interface ReviewsSectionProps {
  novelId: string;
  isAuthenticated: boolean;
  preview: ReviewCardData[];
  myReview: { id: string; content: string } | null;
}

export function ReviewsSection({
  novelId,
  isAuthenticated,
  preview,
  myReview,
}: ReviewsSectionProps) {
  const gridClass =
    "grid grid-flow-col grid-auto-cols-[min(85vw,280px)] md:grid-auto-cols-[280px] gap-4 xs:gap-6 md:gap-6 pb-4 no-scrollbar overflow-x-auto snap-x snap-mandatory";

  const returnPath = `/novel/${novelId}`;

  return (
    <section className="mb-10 xs:mb-12 md:mb-0">
      <div className="flex justify-between items-end mb-4 xs:mb-6">
        <h3 className="text-text-muted text-sm uppercase tracking-[0.2em] font-medium border-b border-primary/20 pb-2">
          Reviews
        </h3>
        <Link
          href={`/novel/${novelId}/reviews`}
          className="text-xs text-primary/70 hover:text-primary cursor-pointer active:scale-95 transition-transform font-ui"
        >
          View All
        </Link>
      </div>

      {preview.length === 0 ? (
        <p className="text-sm text-text-muted/80 font-body mb-6 pl-0.5">
          No reviews yet. Be the first to share your thoughts.
        </p>
      ) : (
        <div className={gridClass}>
          {preview.slice(0, PREVIEW_LIMIT).map((r) => (
            <ReviewCard key={r.id} review={r} variant="carousel" />
          ))}
        </div>
      )}

      <div className="mt-6 xs:mt-8 border-t border-primary/10 pt-6">
        <NovelReviewComposer
          novelId={novelId}
          isAuthenticated={isAuthenticated}
          returnPath={returnPath}
          myReview={myReview}
        />
      </div>
    </section>
  );
}
