import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

/** Novel-detail section title chrome (Reviews / Synopsis / Chapters / Players). */
export const DETAIL_SECTION_TITLE_CLASSNAME =
  "text-text-muted text-sm uppercase tracking-[0.2em] font-medium border-b border-primary/20 pb-2";

const ROW_CLASSNAME = "flex justify-between items-end";

type DetailSectionHeadingOwnProps<T extends ElementType> = {
  as?: T;
  /** Section title text (or custom node). */
  children: ReactNode;
  /** Optional trailing control (e.g. `SectionViewAllLink` / `SectionViewAllButton`). */
  action?: ReactNode;
  /** Extra classes on the title element. */
  className?: string;
  /** Extra classes on the outer row (ignored when `action` is omitted — title stands alone). */
  rowClassName?: string;
};

export type DetailSectionHeadingProps<T extends ElementType = "h3"> =
  DetailSectionHeadingOwnProps<T> &
    Omit<ComponentPropsWithoutRef<T>, keyof DetailSectionHeadingOwnProps<T>>;

/**
 * Novel detail section heading row — Pencil: `MS · Type · Section title` /
 * `MS · Section label` + optional View all (`sectionHeaderRow`).
 */
export function DetailSectionHeading<T extends ElementType = "h3">({
  as,
  children,
  action,
  className = "",
  rowClassName = "",
  ...rest
}: DetailSectionHeadingProps<T>) {
  const Tag = (as ?? "h3") as ElementType;
  const title = (
    <Tag
      className={`${DETAIL_SECTION_TITLE_CLASSNAME} ${className}`.trim()}
      {...rest}
    >
      {children}
    </Tag>
  );

  if (action == null) return title;

  return (
    <div className={`${ROW_CLASSNAME} ${rowClassName}`.trim()}>
      {title}
      {action}
    </div>
  );
}
