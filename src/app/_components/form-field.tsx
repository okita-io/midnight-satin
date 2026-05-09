import type { InputHTMLAttributes } from "react";

export const FORM_FIELD_LABEL_CLASSNAME =
  "block font-ui text-[10px] uppercase tracking-[0.15em] text-text-muted ml-1";

export const FORM_FIELD_INPUT_CLASSNAME =
  "block w-full h-14 rounded-none border border-surface-highlight bg-surface-highlight px-4 font-ui text-text-main placeholder:text-text-muted/60 focus:border-primary focus:outline-none focus:ring-0 transition-colors duration-300 disabled:opacity-70";

export type FormFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
  id: string;
  label: string;
  className?: string;
};

export function FormField({ id, label, className = "", ...inputProps }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={FORM_FIELD_LABEL_CLASSNAME}>
        {label}
      </label>
      <input id={id} className={`${FORM_FIELD_INPUT_CLASSNAME} ${className}`.trim()} {...inputProps} />
    </div>
  );
}

