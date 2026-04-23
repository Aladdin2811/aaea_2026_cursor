import { useMemo, type ReactNode } from "react";
import { type ExpatriateRow } from "../../api/apiExpatriate";
import {
  DataTable,
  type DataTableColumn,
} from "../../components/ui/data-table";
import { formatOptionalText, stringValue } from "../../lib/displayValue";
import { useFetchExpatriate } from "./useExpatriate";

const columns: DataTableColumn<ExpatriateRow>[] = [
  {
    id: "name",
    header: "نوع الاغتراب",
    className: "min-w-56",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 font-medium text-slate-900">
        {formatOptionalText(row.expatriate_name)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.expatriate_name),
  },
];

function ToolbarCount({ n }: { n: number }): ReactNode {
  return (
    <p className="text-sm text-slate-600">
      عدد السجلات:{" "}
      <span className="font-medium tabular-nums text-slate-800">{n}</span>
    </p>
  );
}

export default function ExpatriateTable() {
  const { isLoading, data, error, isError } = useFetchExpatriate();
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
      <DataTable<ExpatriateRow>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل بيانات الاغتراب…"
        emptyMessage="لا توجد بيانات اغتراب مسجّلة للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          !isLoading && rows.length > 0 ? (
            <ToolbarCount n={rows.length} />
          ) : null
        }
        caption="جدول الاغتراب"
        maxHeight="min(70dvh, 600px)"
        density="comfortable"
        minTableWidth="100%"
      />
    </div>
  );
}
