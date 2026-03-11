"use client";

/**
 * Wraps main app content. Previously applied sidebar offset on tablet+;
 * now the app always uses a bottom navigation bar so no offset is needed.
 */
export function MainLayoutContainer({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
