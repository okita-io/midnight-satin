import type { ComponentPropsWithoutRef } from "react";

export const FIXED_BOTTOM_BAR_CLASSNAME =
  "fixed bottom-0 left-0 right-0 z-50 w-full bg-[#080808] border-t border-[#1F1F1F] shadow-[0_-10px_40px_rgba(0,0,0,0.8)] transition-all duration-300 ease-in-out";

export const FIXED_BOTTOM_BAR_STYLE: React.CSSProperties = {
  paddingBottom: "calc(24px + env(safe-area-inset-bottom, 0px))",
};

export type FixedBottomBarProps = Omit<ComponentPropsWithoutRef<"nav">, "style"> & {
  style?: React.CSSProperties;
};

export function FixedBottomBar({ className = "", style, ...props }: FixedBottomBarProps) {
  return (
    <nav
      {...props}
      className={`${FIXED_BOTTOM_BAR_CLASSNAME} ${className}`.trim()}
      style={{ ...FIXED_BOTTOM_BAR_STYLE, ...style }}
    />
  );
}

export const GRADIENT_HEADER_STRIP_CLASSNAME =
  "pointer-events-none w-full bg-[linear-gradient(180deg,#050505_0%,rgba(5,5,5,0.90)_22%,rgba(5,5,5,0.60)_50%,rgba(5,5,5,0)_100%)]";

export type GradientHeaderStripProps = ComponentPropsWithoutRef<"div"> & {
  heightClassName?: string;
};

export function GradientHeaderStrip({
  className = "",
  heightClassName = "h-24",
  ...props
}: GradientHeaderStripProps) {
  return (
    <div
      {...props}
      className={`${GRADIENT_HEADER_STRIP_CLASSNAME} ${heightClassName} ${className}`.trim()}
    />
  );
}

export type ProgressBarProps = Omit<ComponentPropsWithoutRef<"div">, "children"> & {
  valuePercent: number;
};

export function ProgressBar({ valuePercent, className = "", style, ...props }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, valuePercent));
  return (
    <div
      {...props}
      className={`relative w-full h-1 bg-white/10 rounded-sm overflow-hidden ${className}`.trim()}
      style={style}
      aria-hidden
    >
      <div
        className="absolute left-0 top-0 h-full bg-primary rounded-sm transition-[width] duration-300"
        style={{
          width: `${clamped}%`,
          boxShadow: "0 0 10px rgba(212,175,55,0.5)",
        }}
      />
    </div>
  );
}

