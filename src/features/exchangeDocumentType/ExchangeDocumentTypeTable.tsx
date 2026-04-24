import { useMemo, type ReactNode } from "react";
import { type ExchangeDocumentTypeRow } from "../../api/apiExchangeDocumentType";
import {
  DataTable,
  type DataTableColumn,
} from "../../components/ui/data-table";
import { formatOptionalText, stringValue } from "../../lib/displayValue";
import { useFetchExchangeDocumentType } from "./useExchangeDocumentType";

const columns: DataTableColumn<ExchangeDocumentTypeRow>[] = [
  {
    id: "name",
    header: "نوع مستند الصرف",
    className: "min-w-56",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 font-medium text-slate-900">
        {formatOptionalText(row.exchange_document_name)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.exchange_document_name),
  },
];

function ToolbarCount({ n }: { n: number }): ReactNode {
  return (
    <p className="text-sm text-slate-600">
      عدد الأنواع:{" "}
      <span className="font-medium tabular-nums text-slate-800">{n}</span>
    </p>
  );
}

export default function ExchangeDocumentTypeTable() {
  const { isLoading, data, error, isError } = useFetchExchangeDocumentType();
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
      <DataTable<ExchangeDocumentTypeRow>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل أنواع مستند الصرف…"
        emptyMessage="لا توجد أنواع مسجّلة للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          !isLoading && rows.length > 0 ? (
            <ToolbarCount n={rows.length} />
          ) : null
        }
        caption="جدول أنواع مستند الصرف"
        density="comfortable"
        minTableWidth="100%"
      />
    </div>
  );
}
