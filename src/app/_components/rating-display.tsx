import { StarRowDisplay } from "./star-row-display";

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
  return (
    <div className="flex items-center gap-1 mt-1">
      <StarRowDisplay value={rating} size={18} allowHalf />
      {ratingCount > 0 && (
        <span className="text-xs text-text-muted ml-2">
          {formatRatingCount(ratingCount)}
        </span>
      )}
    </div>
  );
}
