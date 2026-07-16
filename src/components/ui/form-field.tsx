import type { ComponentPropsWithoutRef } from "react";
import { TextInput } from "./text-input";

export const FORM_FIELD_LABEL_CLASSNAME =
  "block font-ui text-[12px] font-normal uppercase tracking-[0.25em] text-text-muted";

export type FormFieldProps = Omit<
  ComponentPropsWithoutRef<"input">,
  "className" | "id"
> & {
  id: string;
  label: string;
  className?: string;
};

/**
 * Labeled form field — Pencil: `MS · Form · Text field + label` (THE-223).
 */
export function FormField({ id, label, className = "", ...inputProps }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={FORM_FIELD_LABEL_CLASSNAME}>
        {label}
      </label>
      <TextInput id={id} className={className} {...inputProps} />
    </div>
  );
}
