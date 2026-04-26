import { type ReactNode, useId } from "react";
import { cx } from "../../lib/cx";

type Props = {
  /** سطر عريض (العنوان) */
  label: string;
  /** سطر ثانٍ أصغر غير إلزامي */
  sublabel?: string;
  children: ReactNode;
  className?: string;
};

/**
 * تلميح بسيط لأيقونات AppHeader — أسفل الأيقونة.
 * `aria-hidden` — يبقى aria-label على الزر.
 */
export function HeaderIconTooltip({
  label,
  sublabel,
  children,
  className,
}: Props) {
  const tipId = useId();

  return (
    <div
      className={cx(
        "group/tooltip relative inline-flex [touch-action:manipulation]",
        className,
      )}
    >
      {children}
      <div
        id={tipId}
        role="tooltip"
        aria-hidden
        className={cx(
          "pointer-events-none absolute left-1/2 top-full z-[60] mt-1.5 w-max max-w-[11.5rem] -translate-x-1/2 select-none",
          "rounded-md border border-slate-600/60 bg-slate-800 px-2.5 py-1.5 text-center shadow-sm",
          "text-xs text-slate-100",
          "opacity-0 transition-opacity duration-150",
          "group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100",
        )}
      >
        <p className="font-medium leading-snug">{label}</p>
        {sublabel ? (
          <p className="mt-0.5 text-[0.7rem] font-normal leading-tight text-slate-300">
            {sublabel}
          </p>
        ) : null}
      </div>
    </div>
  );
}
