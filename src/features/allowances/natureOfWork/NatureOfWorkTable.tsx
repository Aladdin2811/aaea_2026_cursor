import { useMemo, type ReactNode } from "react";
import { type NatureOfWorkRow } from "../../../api/apiNatureOfWork";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import DecimalConverter from "../../../utils/DecimalConverter";
import { useFetchNatureOfWork } from "./useNatureOfWork";

function sortNumericField(v: string | number | null | undefined): number {
  if (v == null || v === "") return -Infinity;
  const n = typeof v === "string" ? Number.parseFloat(v) : v;
  return Number.isFinite(n) ? n : -Infinity;
}

const columns: DataTableColumn<NatureOfWorkRow>[] = [
  {
    id: "name",
    header: "طبيعة العمل",
    className: "min-w-48",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 font-medium text-slate-900">
        {formatOptionalText(row.nature_of_work_name)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.nature_of_work_name),
  },
  {
    id: "amount",
    header: "المبلغ",
    className: "min-w-28",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <DecimalConverter
        number={row.nature_of_work_amount}
        className="tabular-nums text-slate-900"
      />
    ),
    getSortValue: (r) => sortNumericField(r.nature_of_work_amount),
    contentAlign: "center",
  },
];

function ToolbarCount({ n }: { n: number }): ReactNode {
  return (
    <p className="text-sm text-slate-600">
      عدد السجلات:{" "}
      <DecimalConverter
        number={n}
        decimalPlaces={0}
        className="inline font-medium tabular-nums text-slate-800"
      />
    </p>
  );
}

export default function NatureOfWorkTable() {
  const { isLoading, data, error, isError } = useFetchNatureOfWork();
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
      <DataTable<NatureOfWorkRow>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل بدل طبيعة العمل…"
        emptyMessage="لا توجد بيانات مسجّلة للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          !isLoading && rows.length > 0 ? (
            <ToolbarCount n={rows.length} />
          ) : null
        }
        caption="جدول بدل طبيعة العمل"
        density="comfortable"
        minTableWidth="100%"
      />
    </div>
  );
}
