import type { ComponentPropsWithoutRef } from "react";

/** Search overlay input chrome */
export const SEARCH_FIELD_CLASSNAME =
  "flex-1 min-w-0 px-3 py-2 rounded-sm bg-surface-highlight border border-white/10 text-text-main font-ui text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary";

export type SearchFieldProps = Omit<
  ComponentPropsWithoutRef<"input">,
  "className" | "type"
> & {
  className?: string;
  type?: "search" | "text";
};

/**
 * Search field — aligns with Boudoir `SearchOverlay` input chrome.
 */
export function SearchField({
  className = "",
  type = "search",
  ...props
}: SearchFieldProps) {
  return (
    <input
      type={type}
      className={`${SEARCH_FIELD_CLASSNAME} ${className}`.trim()}
      {...props}
    />
  );
}
