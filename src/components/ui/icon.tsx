import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import { ICON_SET_CLASS } from "@/lib/asset-reusability-constants";

/** Pixel sizes aligned with MS · Icon · Material scale (THE-228). */
export const ICON_SIZE_PX = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
} as const;

export type IconSizeToken = keyof typeof ICON_SIZE_PX;
export type IconSize = IconSizeToken | number;

export type IconTone = "primary" | "muted" | "text" | "inherit" | "white";

const TONE_CLASS: Record<IconTone, string> = {
  primary: "text-primary",
  muted: "text-text-muted",
  text: "text-text",
  inherit: "text-inherit",
  white: "text-white",
};

function resolveSizePx(size: IconSize): number {
  return typeof size === "number" ? size : ICON_SIZE_PX[size];
}

export type IconProps = Omit<ComponentPropsWithoutRef<"span">, "children"> & {
  /** Material Symbols ligature name, e.g. `arrow_back`, `bookmark`. */
  name: string;
  size?: IconSize;
  tone?: IconTone;
  /** When true, sets FILL variation axis to 1 (filled glyph). */
  filled?: boolean;
};

/**
 * Material Symbols wrapper — Pencil: `MS · Icon · Material scale`.
 * Prefer this over ad hoc `material-symbols-outlined` spans.
 */
export function Icon({
  name,
  size = "lg",
  tone = "inherit",
  filled = false,
  className = "",
  style,
  "aria-hidden": ariaHidden,
  ...rest
}: IconProps) {
  const sizePx = resolveSizePx(size);
  const mergedStyle: CSSProperties = {
    fontSize: sizePx,
    fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0",
    ...style,
  };

  const isDecorative = ariaHidden !== false && ariaHidden !== "false" && !rest["aria-label"];

  return (
    <span
      className={`${ICON_SET_CLASS} ${TONE_CLASS[tone]} ${className}`.trim()}
      style={mergedStyle}
      aria-hidden={isDecorative ? true : ariaHidden}
      {...rest}
    >
      {name}
    </span>
  );
}
