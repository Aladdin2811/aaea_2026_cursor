import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../../../lib/cx";

export type DataTableRowProps = HTMLAttributes<HTMLTableRowElement> & {
  children: ReactNode;
  /** مؤشر ترتيب الصف لعرض مُخطّط متناوب */
  index: number;
  /** صف زوجي/فردي */
  striped?: boolean;
  selected?: boolean;
};

export function DataTableRow({
  index,
  striped = true,
  selected = false,
  onClick,
  className,
  children,
  ...rest
}: DataTableRowProps) {
  return (
    <tr
      className={cx(
        "border-b border-slate-100/90 transition-[background-color,box-shadow] last:border-0",
        striped && index % 2 === 1 && "bg-slate-50/70",
        !selected && "hover:bg-slate-100/50",
        selected && "bg-sky-100/50 ring-1 ring-inset ring-sky-300/40",
        className,
      )}
      onClick={onClick}
      {...rest}
    >
      {children}
    </tr>
  );
}
