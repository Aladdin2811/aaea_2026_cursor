import { useMemo, type ReactNode } from "react";
import { type CurrencyRow } from "../../api/apiCurrency";
import {
  DataTable,
  type DataTableColumn,
} from "../../components/ui/data-table";
import { TableStatusBadge } from "../../components/ui/TableStatusBadge";
import { formatOptionalText, stringValue } from "../../lib/displayValue";
import { useFetchCurrency } from "./useCurrency";

const columns: DataTableColumn<CurrencyRow>[] = [
  {
    id: "name",
    header: "اسم العملة",
    className: "min-w-56",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 font-medium text-slate-900">
        {formatOptionalText(row.currency_name)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.currency_name),
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
      عدد العملات:{" "}
      <span className="font-medium tabular-nums text-slate-800">{n}</span>
    </p>
  );
}

export default function CurrencyTable() {
  const { isLoading, data, error, isError } = useFetchCurrency();
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
      <DataTable<CurrencyRow>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل العملات المتعامل بها…"
        emptyMessage="لا توجد عملات مسجّلة للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          !isLoading && rows.length > 0 ? (
            <ToolbarCount n={rows.length} />
          ) : null
        }
        caption="جدول العملات المتعامل بها"
        density="comfortable"
        minTableWidth="100%"
      />
    </div>
  );
}
