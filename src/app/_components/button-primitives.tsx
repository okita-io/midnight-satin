import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

export const BUTTON_SECONDARY_OUTLINE_CLASSNAME =
  "text-center rounded-sm border border-primary py-2.5 font-ui text-sm font-semibold text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer active:scale-[0.98]";

export const BUTTON_ICON_GHOST_CLASSNAME =
  "flex items-center justify-center w-10 h-10 rounded-full bg-surface/30 backdrop-blur-md text-white border border-white/10 transition-colors cursor-pointer active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-void";

type SecondaryOutlineLinkProps = Omit<
  ComponentPropsWithoutRef<typeof Link>,
  "className"
> & {
  className?: string;
};

export function SecondaryOutlineLink({ className = "", ...props }: SecondaryOutlineLinkProps) {
  return (
    <Link
      {...props}
      className={`${BUTTON_SECONDARY_OUTLINE_CLASSNAME} hover:bg-primary hover:text-void ${className}`.trim()}
    />
  );
}

type IconGhostButtonProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "className"
> & {
  className?: string;
};

export function IconGhostButton({ className = "", ...props }: IconGhostButtonProps) {
  return (
    <button
      {...props}
      type={props.type ?? "button"}
      className={`${BUTTON_ICON_GHOST_CLASSNAME} hover:bg-surface/50 ${className}`.trim()}
    />
  );
}

