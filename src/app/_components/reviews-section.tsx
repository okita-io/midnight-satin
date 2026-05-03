import { ReviewCard, type ReviewCardData } from "./review-card";
import { NovelReviewComposer, type MyNovelReviewDraft } from "./novel-review-composer";
import { SectionViewAllLink } from "./section-view-all";

const PREVIEW_LIMIT = 5;

export interface ReviewsSectionProps {
  novelId: string;
  isAuthenticated: boolean;
  preview: ReviewCardData[];
  myReview: MyNovelReviewDraft | null;
}

export function ReviewsSection({
  novelId,
  isAuthenticated,
  preview,
  myReview,
}: ReviewsSectionProps) {
  const returnPath = `/novel/${novelId}`;
  const reviewsHref = `/novel/${novelId}/reviews`;

  return (
    <section className="mb-10 xs:mb-12 md:mb-0">
      <div className="mb-4 xs:mb-6">
        <h3 className="text-text-muted text-sm uppercase tracking-[0.2em] font-medium border-b border-primary/20 pb-2">
          Reviews
        </h3>
      </div>

      {preview.length === 0 ? (
        <>
          <p className="text-sm text-text-muted/80 font-body mb-4 pl-0.5">
            No reviews yet. Be the first to share your thoughts.
          </p>
          <div className="flex justify-end mb-4">
            <SectionViewAllLink href={reviewsHref} />
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {preview.slice(0, PREVIEW_LIMIT).map((r) => (
              <ReviewCard key={r.id} review={r} variant="compact" />
            ))}
          </div>
          <div className="flex justify-end mt-3 xs:mt-4 mb-1">
            <SectionViewAllLink href={reviewsHref} />
          </div>
        </>
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
