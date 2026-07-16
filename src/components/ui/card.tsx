import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type CardProps = Omit<ComponentPropsWithoutRef<"div">, "className"> & {
  className?: string;
  /** When true (default), renders `.overlay-sheen` for hover gold sheen. */
  sheen?: boolean;
  children?: ReactNode;
};

/**
 * Surface card — Pencil: `MS · Card chrome` / `surfaceCard`.
 * Applies `.card` from globals; optional `.overlay-sheen` child.
 */
export function Card({
  className = "",
  sheen = true,
  children,
  ...props
}: CardProps) {
  return (
    <div className={`card ${className}`.trim()} {...props}>
      {sheen ? <div className="overlay-sheen" aria-hidden /> : null}
      {children}
    </div>
  );
}
