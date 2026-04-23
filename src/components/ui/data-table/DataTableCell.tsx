import type { TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cx } from "../../../lib/cx";
import type { DataTableAlign, DataTableDensity } from "./types";

const alignClass: Record<DataTableAlign, string> = {
  start: "text-start",
  end: "text-end",
  center: "text-center",
};

const densityPadding: Record<DataTableDensity, string> = {
  compact: "px-2.5 py-1.5 text-xs",
  comfortable: "px-3 py-2.5 text-sm",
};

export function DataTableHeadCell({
  contentAlign = "start",
  density = "comfortable",
  className,
  children,
  sortable,
  onSortClick,
  colSpan,
  style,
  scope = "col",
  ...rest
}: Omit<ThHTMLAttributes<HTMLTableCellElement>, "align"> & {
  contentAlign?: DataTableAlign;
  density?: DataTableDensity;
  sortable?: boolean;
  onSortClick?: () => void;
}) {
  return (
    <th
      scope={scope}
      colSpan={colSpan}
      style={style}
      className={cx(
        "border-b border-white/20 bg-transparent font-semibold text-white",
        "not-first:border-s not-first:border-white/10",
        densityPadding[density],
        alignClass[contentAlign],
        sortable && "select-none",
        onSortClick &&
          "cursor-pointer transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white/50 active:bg-white/15",
        className,
      )}
      onClick={onSortClick}
      onKeyDown={
        onSortClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSortClick();
              }
            }
          : undefined
      }
      role={onSortClick ? "button" : undefined}
      tabIndex={onSortClick ? 0 : undefined}
      {...rest}
    >
      {children}
    </th>
  );
}

export function DataTableCell({
  contentAlign = "start",
  density = "comfortable",
  className,
  children,
  ...rest
}: Omit<TdHTMLAttributes<HTMLTableCellElement>, "align"> & {
  contentAlign?: DataTableAlign;
  density?: DataTableDensity;
}) {
  return (
    <td
      className={cx(
        "text-slate-800 align-middle",
        densityPadding[density],
        alignClass[contentAlign],
        className,
      )}
      {...rest}
    >
      {children}
    </td>
  );
}
