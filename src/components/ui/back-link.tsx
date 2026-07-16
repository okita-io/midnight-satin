"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentPropsWithoutRef } from "react";
import { Icon } from "./icon";

const BACK_CHROME_CLASSNAME =
  "inline-flex items-center gap-1 text-text-muted hover:text-primary transition-colors font-ui text-sm tracking-wide cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-void rounded-sm";

type BackSharedProps = {
  /** Visible label next to the icon. Pass `null` or empty for icon-only. */
  label?: string | null;
  className?: string;
  iconSize?: ComponentPropsWithoutRef<typeof Icon>["size"];
};

export type BackLinkProps = Omit<
  ComponentPropsWithoutRef<typeof Link>,
  "className" | "children"
> &
  BackSharedProps & {
    children?: never;
  };

/**
 * Back / up link — Pencil: `MS · Back · Icon + label` / `backControl`.
 */
export function BackLink({
  href,
  label = "Back",
  className = "",
  iconSize = "lg",
  ...rest
}: BackLinkProps) {
  const showLabel = Boolean(label);
  return (
    <Link
      href={href}
      className={`${BACK_CHROME_CLASSNAME} ${className}`.trim()}
      {...rest}
      aria-label={rest["aria-label"] ?? (showLabel ? undefined : "Go back")}
    >
      <Icon name="arrow_back" size={iconSize} aria-hidden />
      {showLabel ? label : null}
    </Link>
  );
}

export type BackButtonProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "className" | "children" | "type"
> &
  BackSharedProps & {
    type?: "button" | "submit" | "reset";
    /** Used when history is empty (e.g. direct entry). Default `/`. */
    fallbackHref?: string;
    children?: never;
  };

/**
 * Back control that calls `router.back()`, or `fallbackHref` when history is shallow.
 * Pencil: `MS · Back · Icon + label` / `backControl`.
 */
export function BackButton({
  label = "Back",
  className = "",
  iconSize = "lg",
  fallbackHref = "/",
  type = "button",
  onClick,
  ...rest
}: BackButtonProps) {
  const { back, push } = useRouter();
  const showLabel = Boolean(label);

  return (
    <button
      type={type}
      className={`${BACK_CHROME_CLASSNAME} ${className}`.trim()}
      {...rest}
      aria-label={rest["aria-label"] ?? (showLabel ? undefined : "Go back")}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        if (typeof window !== "undefined" && window.history.length > 1) {
          back();
        } else {
          push(fallbackHref);
        }
      }}
    >
      <Icon name="arrow_back" size={iconSize} aria-hidden />
      {showLabel ? label : null}
    </button>
  );
}
