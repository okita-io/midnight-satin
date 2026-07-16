import type { ComponentPropsWithoutRef, ElementType } from "react";

/**
 * Light typography primitive — Pencil: `MS · Type · *`.
 * Variants map to the catalog typography matrix (one font role each).
 */
export const TEXT_VARIANT_CLASS = {
  /** Playfair — novel / display titles */
  display: "font-display",
  /** Cinzel — section / screen labels */
  section: "font-header",
  /** Literata — prose and long copy */
  body: "font-body",
  /** Marcellus — buttons, metadata, small UI labels */
  ui: "font-ui",
  /** Pinyon — sparse accent moments */
  script: "font-script",
} as const;

export type TextVariant = keyof typeof TEXT_VARIANT_CLASS;

type TextOwnProps<T extends ElementType> = {
  as?: T;
  variant?: TextVariant;
  className?: string;
};

export type TextProps<T extends ElementType = "p"> = TextOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof TextOwnProps<T>>;

export function Text<T extends ElementType = "p">({
  as,
  variant = "body",
  className = "",
  ...rest
}: TextProps<T>) {
  const Tag = (as ?? "p") as ElementType;
  return (
    <Tag
      className={`${TEXT_VARIANT_CLASS[variant]} ${className}`.trim()}
      {...rest}
    />
  );
}
