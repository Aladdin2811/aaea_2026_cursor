import { useMemo, type ReactNode } from "react";
import { type YearsRow } from "../../../api/apiYears";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import { TableStatusBadge } from "../../../components/ui/TableStatusBadge";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import { useFetchYears } from "./useYears";

const columns: DataTableColumn<YearsRow>[] = [
  {
    id: "year",
    header: "السنة",
    className: "min-w-32",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 font-mono text-sm font-medium tabular-nums text-slate-900">
        {formatOptionalText(row.year_num)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.year_num),
    contentAlign: "center",
  },
  {
    id: "status",
    header: "الحالة",
    className: "min-w-24",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => <TableStatusBadge value={row.status} />,
    getSortValue: (r) => stringValue(r.status),
    contentAlign: "center",
  },
];

function ToolbarCount({ n }: { n: number }): ReactNode {
  return (
    <p className="text-sm text-slate-600">
      عدد السنوات:{" "}
      <span className="font-medium tabular-nums text-slate-800">{n}</span>
    </p>
  );
}

export default function YearsTable() {
  const { isLoading, data, error, isError } = useFetchYears();
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
      <DataTable<YearsRow>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل بيانات السنوات…"
        emptyMessage="لا توجد سنوات مسجّلة للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          !isLoading && rows.length > 0 ? (
            <ToolbarCount n={rows.length} />
          ) : null
        }
        caption="جدول السنوات المالية"
        maxHeight="min(70dvh, 600px)"
        density="comfortable"
        minTableWidth="100%"
      />
    </div>
  );
}
