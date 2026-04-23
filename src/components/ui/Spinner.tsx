import { cx } from "../../lib/cx";

const sizeMap = {
  sm: "size-6 border-2",
  md: "size-10 border-[3px]",
  lg: "size-[3.25rem] border-[3px]",
} as const;

export type SpinnerSize = keyof typeof sizeMap;

export type SpinnerProps = {
  size?: SpinnerSize;
  className?: string;
};

/**
 * مؤشر تحميل دائري بألوان زمرد/فيروز متناسقة مع رؤوس الجداول والتطبيق.
 */
export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <span
      aria-hidden
      className={cx(
        "inline-block shrink-0 rounded-full border-solid",
        "border-slate-200/90",
        "border-t-emerald-600 border-r-teal-500 border-b-cyan-600/50 border-l-teal-400/60",
        "shadow-[0_0_12px_-2px_rgba(16,185,129,0.35)]",
        "motion-safe:animate-spin",
        "[animation-duration:0.85s]",
        sizeMap[size],
        className,
      )}
    />
  );
}
