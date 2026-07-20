import Link from "next/link";
import type { ComponentPropsWithoutRef, Ref } from "react";
import { Button, ButtonLink } from "@/components/ui/button";

type SecondaryOutlineLinkProps = Omit<
  ComponentPropsWithoutRef<typeof Link>,
  "className"
> & {
  className?: string;
  /** React 19+: ref is a normal prop on function components */
  ref?: Ref<HTMLAnchorElement>;
};

/** @deprecated Prefer `ButtonLink variant="secondary"` from `@/components/ui`. */
export function SecondaryOutlineLink({
  className = "",
  children,
  ref,
  ...props
}: SecondaryOutlineLinkProps) {
  return (
    <ButtonLink ref={ref} variant="secondary" className={className} {...props}>
      {children}
    </ButtonLink>
  );
}

type IconGhostButtonProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "className"
> & {
  className?: string;
};

/** @deprecated Prefer `Button variant="iconGhost"` from `@/components/ui`. */
export function IconGhostButton({ className = "", ...props }: IconGhostButtonProps) {
  return <Button variant="iconGhost" className={className} {...props} />;
}
