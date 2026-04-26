import { useMemo, type ReactNode } from "react";
import { type MonthsRow } from "../../api/apiMonths";
import {
  DataTable,
  type DataTableColumn,
} from "../../components/ui/data-table";
import { stringValue } from "../../lib/displayValue";
import { useFetchMonths } from "./useMonths";

function sortMonthNum(v: string | null | undefined): number {
  if (v == null || v === "") return -Infinity;
  const n = Number.parseInt(String(v).trim(), 10);
  return Number.isFinite(n) ? n : -Infinity;
}

const columns: DataTableColumn<MonthsRow>[] = [
  {
    id: "monthNum",
    header: "رقم الشهر",
    className: "min-w-16 w-20",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <span className="block min-w-0 whitespace-normal break-words font-medium leading-snug text-slate-900">
        {row.month_num != null ? String(row.month_num) : "—"}
      </span>
    ),
    getSortValue: (r) => sortMonthNum(r.month_num),
    contentAlign: "center",
  },
  {
    id: "days",
    header: "عدد الأيام",
    className: "min-w-20",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <span className="block min-w-0 whitespace-normal break-words font-medium leading-snug text-slate-900">
        {row.days_count != null ? String(row.days_count) : "—"}
      </span>
    ),
    getSortValue: (r) => r.days_count ?? -1,
    contentAlign: "center",
  },
  {
    id: "month_name1",
    header: "الشهر (1)",
    className: "min-w-48",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 whitespace-normal break-words font-medium leading-snug text-slate-900">
        {row.month_name1 != null ? String(row.month_name1) : "—"}
      </span>
    ),
    getSortValue: (r) => stringValue(r.month_name1),
  },
  {
    id: "month_name2",
    header: "الشهر (2)",
    className: "min-w-48",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 whitespace-normal break-words font-medium leading-snug text-slate-900">
        {row.month_name2 != null ? String(row.month_name2) : "—"}
      </span>
    ),
    getSortValue: (r) => stringValue(r.month_name2),
  },
  {
    id: "month_name3",
    header: "الشهر (3)",
    className: "min-w-48",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 whitespace-normal break-words font-medium leading-snug text-slate-900">
        {row.month_name3 != null ? String(row.month_name3) : "—"}
      </span>
    ),
    getSortValue: (r) => stringValue(r.month_name3),
  },
  {
    id: "month_name4",
    header: "الشهر (4)",
    className: "min-w-48",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 whitespace-normal break-words font-medium leading-snug text-slate-900">
        {row.month_name4 != null ? String(row.month_name4) : "—"}
      </span>
    ),
    getSortValue: (r) => stringValue(r.month_name4),
  },
  {
    id: "month_name5",
    header: "الشهر (5)",
    className: "min-w-48",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 whitespace-normal break-words font-medium leading-snug text-slate-900">
        {row.month_name5 != null ? String(row.month_name5) : "—"}
      </span>
    ),
    getSortValue: (r) => stringValue(r.month_name5),
  },
];

function ToolbarCount({ n }: { n: number }): ReactNode {
  return (
    <p className="text-sm text-slate-600">
      عدد الأشهر:{" "}
      <span className="font-medium tabular-nums text-slate-800">{n}</span>
    </p>
  );
}

export default function MonthsTable() {
  const { isLoading, data, error, isError } = useFetchMonths();
  const rows = useMemo(() => data ?? [], [data]);

  if (isError) {
    return (
      <p dir="rtl" className="text-destructive" role="alert">
        {error instanceof Error ? error.message : "حدث خطأ أثناء التحميل"}
      </p>
    );
  }

  return (
    <div className="space-y-2" dir="rtl">
      <DataTable<MonthsRow>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل بيانات الأشهر…"
        emptyMessage="لا توجد أشهر مسجّلة للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          !isLoading && rows.length > 0 ? (
            <ToolbarCount n={rows.length} />
          ) : null
        }
        caption="جدول الأشهر"
        density="comfortable"
        minTableWidth="100%"
      />
    </div>
  );
}
