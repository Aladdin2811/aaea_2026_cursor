import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import {
  useCallback,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { cx } from "../../../lib/cx";
import { Spinner } from "../Spinner";
import { DataTableCell, DataTableHeadCell } from "./DataTableCell";
import { DataTableRow } from "./DataTableRow";
import type {
  DataTableColumn,
  DataTableDensity,
  DataTableSortDirection,
} from "./types";

export type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowId: (row: T, index: number) => string | number;
  isLoading?: boolean;
  /** إظهار ترقيم تسلسلي من 1 (قبل أعمدتك) */
  showIndex?: boolean;
  indexHeader?: ReactNode;
  /**
   * صف اختياري: يتضمّن الترقيم.
   * مثال: (row) => 10 + (page - 1) * perPage
   */
  getRowIndex?: (row: T, rowIndex: number) => number;
  /** اتجاه الجدول والنص (افتراضي: rtl) */
  dir?: "rtl" | "ltr";
  density?: DataTableDensity;
  /** شريط علوي: فلترة، أزرار تصدير، ... */
  toolbar?: ReactNode;
  /** تعليق للجدول (للوصول) */
  caption?: ReactNode;
  emptyMessage?: ReactNode;
  loadingMessage?: ReactNode;
  className?: string;
  tableClassName?: string;
  /** ارتفاع أقصى مع تمرير عمودي داخل منطقة الجدول */
  maxHeight?: string | number;
  /** تثبيت رأس الأعمدة عند التمرير */
  stickyHeader?: boolean;
  /** مُخطّط متناوب للصفوف */
  striped?: boolean;
  onRowClick?: (row: T, rowIndex: number) => void;
  rowClassName?: (row: T, rowIndex: number) => string | undefined;
  /** تظليل صف: يعاد true عند اختيار/تحديد */
  isRowSelected?: (row: T, rowIndex: number, rowId: string) => boolean;
  /** ميزة ترتيب الأعمدة: إيقاف دفعة واحدة */
  sortable?: boolean;
  /** منطق تفريع إضافي (سجلات اختيارية) */
  footer?: ReactNode;
  /** min-width للعمود الرئيسي عند الضيق */
  minTableWidth?: string;
};

type SortState = {
  columnId: string | null;
  direction: DataTableSortDirection;
};

function toCssLength(value: string | number) {
  return typeof value === "number" ? `${value}px` : value;
}

export function DataTable<T>({
  columns,
  data,
  getRowId,
  isLoading = false,
  showIndex = false,
  indexHeader = "#",
  getRowIndex,
  dir = "rtl",
  density = "comfortable",
  toolbar,
  caption,
  emptyMessage = "لا توجد بيانات للعرض.",
  loadingMessage = "جاري التحميل…",
  className,
  tableClassName,
  maxHeight,
  stickyHeader = true,
  striped = true,
  onRowClick,
  rowClassName,
  isRowSelected,
  sortable: sortEnabled = true,
  footer,
  minTableWidth = "min(100%, 720px)",
}: DataTableProps<T>) {
  const headingId = useId();
  const [sort, setSort] = useState<SortState>({
    columnId: null,
    direction: null,
  });

  const sortableColumns = useMemo(
    () =>
      new Set(
        columns.filter((c) => c.getSortValue && c.sortable !== false).map((c) => c.id),
      ),
    [columns],
  );

  const requestSort = useCallback(
    (columnId: string) => {
      if (!sortEnabled) return;
      if (!sortableColumns.has(columnId)) return;
      setSort((prev) => {
        if (prev.columnId !== columnId) {
          return { columnId, direction: "asc" };
        }
        if (prev.direction === "asc") {
          return { columnId, direction: "desc" };
        }
        if (prev.direction === "desc") {
          return { columnId: null, direction: null };
        }
        return { columnId, direction: "asc" };
      });
    },
    [sortEnabled, sortableColumns],
  );

  const sortedData = useMemo(() => {
    if (!sort.columnId || !sort.direction) return data;
    const col = columns.find((c) => c.id === sort.columnId);
    if (!col?.getSortValue) return data;

    const { direction } = sort;
    return [...data].sort((a, b) => {
      const av = col.getSortValue?.(a);
      const bv = col.getSortValue?.(b);
      const aNull = av == null;
      const bNull = bv == null;
      if (aNull && bNull) return 0;
      if (aNull) return 1;
      if (bNull) return -1;
      if (typeof av === "number" && typeof bv === "number") {
        return direction === "asc" ? av - bv : bv - av;
      }
      const as = String(av);
      const bs = String(bv);
      if (as < bs) return direction === "asc" ? -1 : 1;
      if (as > bs) return direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [columns, data, sort]);

  if (isLoading) {
    return (
      <div
        dir={dir}
        className={cx(
          "rounded-xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/90 p-10 text-center shadow-sm ring-1 ring-slate-200/30",
          className,
        )}
        role="status"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <Spinner size="lg" />
          <p className="max-w-md text-sm leading-relaxed text-slate-600">
            {loadingMessage}
          </p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div
        dir={dir}
        className={cx(
          "rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-10 text-center",
          className,
        )}
        role="status"
      >
        {toolbar ? <div className="mb-4 flex flex-wrap items-center gap-2">{toolbar}</div> : null}
        <p className="text-slate-600">{emptyMessage}</p>
      </div>
    );
  }

  const showSort = sortEnabled && sortableColumns.size > 0;

  /** تمرير أفقي + عمودي في نفس العنصر لتفادي تعارض عجلة الفأرة بين حاويتين متداخلتين (overflow-x-auto + overflow-y-auto). */
  const scrollClassBoth =
    "overflow-auto overscroll-contain [scrollbar-gutter:stable_both-edges] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300/80 [&::-webkit-scrollbar-track]:bg-slate-100/80";

  const tableEl: ReactNode = (
    <table
      className={cx("w-full border-collapse text-slate-800", tableClassName)}
      style={{ minWidth: minTableWidth }}
      aria-rowcount={sortedData.length + 1}
      aria-labelledby={typeof caption === "string" ? headingId : undefined}
    >
      {typeof caption === "string" && caption ? (
        <caption id={headingId} className="sr-only">
          {caption}
        </caption>
      ) : caption != null && caption !== false ? (
        <caption
          className="border-b border-slate-100 bg-slate-50/50 px-3 py-2 text-center text-sm text-slate-600"
        >
          {caption}
        </caption>
      ) : null}
      <thead
        className={cx(
          "bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white shadow-[0_1px_0_0_rgba(0,0,0,0.12)] shadow-emerald-900/20",
          stickyHeader && "sticky top-0 z-20",
        )}
      >
        <tr>
          {showIndex && (
            <DataTableHeadCell
              density={density}
              contentAlign="center"
              className="w-10 min-w-10"
            >
              {indexHeader}
            </DataTableHeadCell>
          )}
          {columns.map((col) => {
            const canSort = showSort && col.sortable !== false && !!col.getSortValue;
            const isActive = sort.columnId === col.id;
            const sortDirection: "asc" | "desc" | null = isActive
              ? (sort.direction ?? null)
              : null;

            return (
              <DataTableHeadCell
                key={col.id}
                style={{
                  minWidth: col.minWidth,
                  maxWidth: col.maxWidth,
                  width: col.width,
                }}
                className={cx("whitespace-nowrap", col.className, col.thClassName)}
                contentAlign={col.contentAlign ?? "start"}
                density={density}
                sortable={!!canSort}
                onSortClick={canSort ? () => requestSort(col.id) : undefined}
              >
                <span className="inline-flex w-full min-w-0 items-center justify-start gap-1">
                  <span className="min-w-0 flex-1 whitespace-normal break-words text-balance">
                    {col.header}
                  </span>
                  {canSort && (
                    <span className="shrink-0 text-white/90" aria-hidden>
                      {sortDirection === "asc" ? (
                        <ChevronUp className="size-4" />
                      ) : sortDirection === "desc" ? (
                        <ChevronDown className="size-4" />
                      ) : (
                        <ChevronsUpDown className="size-4 opacity-50" />
                      )}
                    </span>
                  )}
                </span>
              </DataTableHeadCell>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {sortedData.map((row, rowIndex) => {
          const id = getRowId(row, rowIndex);
          const idStr = String(id);
          const indexValue = getRowIndex ? getRowIndex(row, rowIndex) : rowIndex + 1;
          const selected = isRowSelected?.(row, rowIndex, idStr) ?? false;
          return (
            <DataTableRow
              key={idStr}
              index={rowIndex}
              striped={striped}
              selected={selected}
              onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
              className={rowClassName?.(row, rowIndex)}
            >
              {showIndex && (
                <DataTableCell
                  density={density}
                  contentAlign="center"
                  className="tabular-nums text-slate-500"
                >
                  {indexValue}
                </DataTableCell>
              )}
              {columns.map((col) => (
                <DataTableCell
                  key={col.id}
                  style={{
                    minWidth: col.minWidth,
                    maxWidth: col.maxWidth,
                    width: col.width,
                  }}
                  density={density}
                  contentAlign={col.contentAlign ?? "start"}
                  className={cx("min-w-0", col.tdClassName)}
                >
                  {col.cell(row, rowIndex)}
                </DataTableCell>
              ))}
            </DataTableRow>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <div
      dir={dir}
      className={cx(
        "flex flex-col",
        "rounded-xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-200/20",
        className,
      )}
    >
      {toolbar ? (
        <div
          className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-3 py-2.5 sm:px-4"
        >
          {typeof toolbar === "string" || typeof toolbar === "number" ? (
            <p className="text-sm text-slate-600">{toolbar}</p>
          ) : (
            toolbar
          )}
        </div>
      ) : null}

      <div
        className={maxHeight != null ? scrollClassBoth : "overflow-x-auto"}
        style={maxHeight != null ? { maxHeight: toCssLength(maxHeight) } : undefined}
        role={maxHeight != null ? "region" : undefined}
        tabIndex={maxHeight != null ? 0 : undefined}
        aria-label={
          maxHeight != null
            ? typeof caption === "string"
              ? (caption as string)
              : "جدول البيانات"
            : undefined
        }
      >
        {tableEl}
      </div>

      {footer ? <div className="border-t border-slate-100 px-3 py-2.5 sm:px-4">{footer}</div> : null}
    </div>
  );
}
