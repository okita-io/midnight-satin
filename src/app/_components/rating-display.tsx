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
        <span
          key={`full-${i}`}
          className="material-symbols-outlined text-primary text-[18px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
          aria-hidden
        >
          star
        </span>
      ))}
      {hasHalf && (
        <span
          className="material-symbols-outlined text-primary/40 text-[18px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
          aria-hidden
        >
          star_half
        </span>
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <span
          key={`empty-${i}`}
          className="material-symbols-outlined text-primary/20 text-[18px]"
          style={{ fontVariationSettings: "'FILL' 0" }}
          aria-hidden
        >
          star
        </span>
      ))}
      {ratingCount > 0 && (
        <span className="text-xs text-text-muted ml-2">
          {formatRatingCount(ratingCount)}
        </span>
      )}
    </div>
  );
}
