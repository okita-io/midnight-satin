import type { CSSProperties } from "react";

export type SkeletonProps = {
  /** Optional className for layout (e.g. width/height) */
  className?: string;
  /** Inline style for dimensions */
  style?: CSSProperties;
};

/**
 * Loading skeleton with dark grey and gold gradient shimmer.
 * Pencil / design system loading shell (formerly `ShimmerPlaceholder`).
 */
export function Skeleton({ className = "", style }: SkeletonProps) {
  return (
    <div
      className={`rounded-sm overflow-hidden bg-surface-highlight ${className}`}
      style={style}
      aria-hidden
    >
      <div
        className="h-full w-full animate-shimmer bg-[length:200%_100%]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(26,26,26,0.6) 0%, rgba(212,175,55,0.12) 50%, rgba(26,26,26,0.6) 100%)",
        }}
      />
    </div>
  );
}
