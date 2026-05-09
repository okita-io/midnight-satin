import type { ComponentPropsWithoutRef } from "react";

export type StarIconSize = 16 | 18 | 24 | 28;

const STAR_ICON_SIZE_CLASSNAME: Record<StarIconSize, string> = {
  16: "text-[16px]",
  18: "text-[18px]",
  24: "text-[24px]",
  28: "text-[28px]",
};

type StarTone = "active" | "half" | "inactive";

const STAR_TONE_CLASSNAME: Record<StarTone, string> = {
  active: "text-primary",
  half: "text-primary/40",
  inactive: "text-primary/20",
};

export type StarIconProps = Omit<
  ComponentPropsWithoutRef<"span">,
  "children" | "className"
> & {
  size: StarIconSize;
  tone: StarTone;
  variant?: "full" | "half";
  className?: string;
};

export function StarIcon({
  size,
  tone,
  variant = "full",
  className = "",
  style,
  ...props
}: StarIconProps) {
  const fill = tone === "inactive" ? 0 : 1;
  const symbol = variant === "half" ? "star_half" : "star";

  return (
    <span
      {...props}
      className={`material-symbols-outlined ${STAR_ICON_SIZE_CLASSNAME[size]} ${STAR_TONE_CLASSNAME[tone]} ${className}`.trim()}
      style={{
        fontVariationSettings: `'FILL' ${fill}`,
        ...style,
      }}
    >
      {symbol}
    </span>
  );
}

