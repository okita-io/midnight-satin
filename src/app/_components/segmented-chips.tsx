import type { ComponentPropsWithoutRef } from "react";

export type SegmentedChipOption<T extends string | number> = {
  value: T;
  label: string;
};

export type SegmentedChipsProps<T extends string | number> = Omit<
  ComponentPropsWithoutRef<"div">,
  "children" | "onChange"
> & {
  value: T;
  options: SegmentedChipOption<T>[];
  onChange: (next: T) => void;
  /** Optional group label for assistive tech */
  label?: string;
};

const CHIP_BASE =
  "rounded-sm px-3.5 py-2 font-ui text-[13px] leading-none transition-colors cursor-pointer active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-void";

const CHIP_SELECTED = "bg-surface-highlight border border-primary text-primary font-semibold";
const CHIP_UNSELECTED =
  "bg-white/[0.04] border border-white/15 text-text-muted font-medium [@media(hover:hover)]:hover:bg-white/[0.06] [@media(hover:hover)]:hover:text-text-main";

export function SegmentedChips<T extends string | number>({
  value,
  options,
  onChange,
  label,
  className = "",
  ...props
}: SegmentedChipsProps<T>) {
  return (
    <div
      {...props}
      role="group"
      aria-label={label}
      className={`flex items-center gap-2 ${className}`.trim()}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(opt.value)}
            className={`${CHIP_BASE} ${selected ? CHIP_SELECTED : CHIP_UNSELECTED}`.trim()}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

