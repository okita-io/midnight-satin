import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

/** Shared styles: 12px Literata (`font-body`), matches novel “The Players” / Reviews chrome. */
export const sectionViewAllClassName =
  "text-xs font-body text-primary/70 hover:text-primary cursor-pointer active:scale-95 transition-transform";

type SectionViewAllLinkProps = Omit<
  ComponentPropsWithoutRef<typeof Link>,
  "className" | "children"
> & {
  href: string;
  className?: string;
  children?: ReactNode;
};

export function SectionViewAllLink({
  href,
  className = "",
  children = "View All",
  ...rest
}: SectionViewAllLinkProps) {
  return (
    <Link
      href={href}
      className={`${sectionViewAllClassName} ${className}`.trim()}
      {...rest}
    >
      {children}
    </Link>
  );
}

type SectionViewAllButtonProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "className" | "children" | "type"
> & {
  className?: string;
  children?: ReactNode;
  type?: "button" | "submit" | "reset";
};

export function SectionViewAllButton({
  className = "",
  children = "View All",
  type = "button",
  ...rest
}: SectionViewAllButtonProps) {
  return (
    <button
      type={type}
      className={`${sectionViewAllClassName} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}
