import { useMemo, type ReactNode } from "react";
import { type FundingTypeRow } from "../../api/apiFundingType";
import {
  DataTable,
  type DataTableColumn,
} from "../../components/ui/data-table";
import { formatOptionalText, stringValue } from "../../lib/displayValue";
import { useFetchFundingType } from "./useFundingType";

const columns: DataTableColumn<FundingTypeRow>[] = [
  {
    id: "name",
    header: "مصدر التمويل",
    className: "min-w-56",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 font-medium text-slate-900">
        {formatOptionalText(row.funding_type_name)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.funding_type_name),
  },
];

function ToolbarCount({ n }: { n: number }): ReactNode {
  return (
    <p className="text-sm text-slate-600">
      عدد مصادر التمويل:{" "}
      <span className="font-medium tabular-nums text-slate-800">{n}</span>
    </p>
  );
}

export default function FundingTypeTable() {
  const { isLoading, data, error, isError } = useFetchFundingType();
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
      <DataTable<FundingTypeRow>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل مصادر التمويل…"
        emptyMessage="لا توجد مصادر تمويل مسجّلة للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          !isLoading && rows.length > 0 ? (
            <ToolbarCount n={rows.length} />
          ) : null
        }
        caption="جدول مصادر التمويل"
        density="comfortable"
        minTableWidth="100%"
      />
    </div>
  );
}
