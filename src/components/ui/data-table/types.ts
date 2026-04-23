import type { ReactNode } from "react";

export type DataTableSortDirection = "asc" | "desc" | null;

export type DataTableDensity = "compact" | "comfortable";

export type DataTableAlign = "start" | "end" | "center";

export type DataTableColumn<T> = {
  id: string;
  header: ReactNode;
  /** محتوى الخلية: يعطى الصف وترتيبه */
  cell: (row: T, rowIndex: number) => ReactNode;
  /** اختياري: قيمة للترتيب الافتراضي */
  getSortValue?: (row: T) => string | number | null | undefined;
  /** إيقاف الترتيب لهذا العمود فقط (افتراضي: مسموح إن وُجد getSortValue) */
  sortable?: boolean;
  headerClassName?: string;
  className?: string;
  thClassName?: string;
  tdClassName?: string;
  minWidth?: string;
  maxWidth?: string;
  width?: string;
  contentAlign?: DataTableAlign;
};
