import type { ComponentPropsWithoutRef } from "react";

/** MS · Form · Text field + label — input chrome */
export const FORM_FIELD_INPUT_CLASSNAME =
  "block w-full h-14 rounded-none border border-surface-highlight bg-surface-highlight px-4 font-ui text-[15px] text-text-main placeholder:text-text-muted/65 focus:border-primary focus:outline-none focus:ring-0 transition-colors duration-300 disabled:opacity-70";

export type TextInputProps = Omit<ComponentPropsWithoutRef<"input">, "className"> & {
  className?: string;
};

/**
 * Bare form input — Pencil: `MS · Form · Text field + label` input styles.
 */
export function TextInput({ className = "", ...props }: TextInputProps) {
  return (
    <input
      className={`${FORM_FIELD_INPUT_CLASSNAME} ${className}`.trim()}
      {...props}
    />
  );
}
