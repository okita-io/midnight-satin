import { StarIcon } from "./star-primitives";

interface RatingDisplayProps {
  rating: number;
  ratingCount?: number;
}

function formatRatingCount(count: number): string {
  if (count >= 1000) return `(${(count / 1000).toFixed(1)}k reviews)`;
  if (count > 0) return `(${count} reviews)`;
  return "";
}

export function RatingDisplay({ rating, ratingCount = 0 }: RatingDisplayProps) {
  if (rating <= 0) return null;

  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.25 && rating % 1 < 0.75;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-1 mt-1">
      {Array.from({ length: fullStars }).map((_, i) => (
        <StarIcon
          key={`full-${i}`}
          size={18}
          tone="active"
          aria-hidden
        />
      ))}
      {hasHalf && (
        <StarIcon
          size={18}
          tone="half"
          variant="half"
          aria-hidden
        />
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <StarIcon
          key={`empty-${i}`}
          size={18}
          tone="inactive"
          aria-hidden
        />
      ))}
      {ratingCount > 0 && (
        <span className="text-xs text-text-muted ml-2">
          {formatRatingCount(ratingCount)}
        </span>
      )}
    </div>
  );
}
