import Link from "next/link";
import type { ComponentPropsWithoutRef, Ref } from "react";

/** MS · Button · Secondary outline */
export const BUTTON_SECONDARY_CLASSNAME =
  "text-center rounded-sm border border-primary py-2.5 font-ui text-sm font-semibold text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer active:scale-[0.98] [@media(hover:hover)]:hover:bg-primary [@media(hover:hover)]:hover:text-void";

/** MS · Button · Icon ghost (THE-230) */
export const BUTTON_ICON_GHOST_CLASSNAME =
  "flex items-center justify-center w-10 h-10 rounded-full bg-surface/30 backdrop-blur-md text-white border border-white/10 transition-colors cursor-pointer active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-void [@media(hover:hover)]:hover:bg-surface/50";

/** MS · Gold pill button / `.btn-gold` in globals.css */
export const BUTTON_PRIMARY_CLASSNAME = "btn-gold";

export type ButtonVariant = "primary" | "secondary" | "iconGhost";
export type ButtonLinkVariant = "primary" | "secondary";

const BUTTON_VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: BUTTON_PRIMARY_CLASSNAME,
  secondary: BUTTON_SECONDARY_CLASSNAME,
  iconGhost: BUTTON_ICON_GHOST_CLASSNAME,
};

export type ButtonProps = Omit<ComponentPropsWithoutRef<"button">, "className"> & {
  variant?: ButtonVariant;
  className?: string;
};

/**
 * Native button — Pencil: gold pill / secondary outline / icon ghost.
 */
export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${BUTTON_VARIANT_CLASS[variant]} ${className}`.trim()}
      {...props}
    />
  );
}

export type ButtonLinkProps = Omit<
  ComponentPropsWithoutRef<typeof Link>,
  "className"
> & {
  variant?: ButtonLinkVariant;
  className?: string;
  /** React 19+: ref is a normal prop on function components */
  ref?: Ref<HTMLAnchorElement>;
};

/**
 * Link styled as a button — primary (gold pill) or secondary (outline).
 */
export function ButtonLink({
  variant = "primary",
  className = "",
  ref,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      ref={ref}
      className={`${BUTTON_VARIANT_CLASS[variant]} ${className}`.trim()}
      {...props}
    />
  );
}
