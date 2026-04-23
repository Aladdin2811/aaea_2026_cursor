import { useMemo, type ReactNode } from "react";
import { type DocumentTypeRow } from "../../api/apiDocumentType";
import {
  DataTable,
  type DataTableColumn,
} from "../../components/ui/data-table";
import { TableStatusBadge } from "../../components/ui/TableStatusBadge";
import { formatOptionalText, stringValue } from "../../lib/displayValue";
import { useFetchDocumentType } from "./useDocumentType";

/** رأس عمود على سطرين */
function ColHead({
  line1,
  line2,
}: {
  line1: string;
  line2: string;
}): ReactNode {
  return (
    <span className="inline-block w-full min-w-0 text-center text-[0.7rem] font-semibold leading-[1.2] sm:text-xs">
      <span className="block">{line1}</span>
      <span className="block">{line2}</span>
    </span>
  );
}

const columns: DataTableColumn<DocumentTypeRow>[] = [
  {
    id: "name",
    header: "نوع القيد",
    className: "min-w-56",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 font-medium text-slate-900">
        {formatOptionalText(row.document_type_name)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.document_type_name),
  },
  {
    id: "voucherNeed",
    header: <ColHead line1="يتطلب" line2="مستنداً" />,
    className: "min-w-24",
    thClassName: "!whitespace-normal text-center leading-tight",
    cell: (row) => <TableStatusBadge value={row.voucher_need} />,
    getSortValue: (r) => (r.voucher_need ? 1 : 0),
    contentAlign: "center",
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

export default function DocumentTypeTable() {
  const { isLoading, data, error, isError } = useFetchDocumentType();
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
      <DataTable<DocumentTypeRow>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل أنواع القيود…"
        emptyMessage="لا توجد أنواع قيود مسجّلة للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          !isLoading && rows.length > 0 ? (
            <ToolbarCount n={rows.length} />
          ) : null
        }
        caption="جدول أنواع القيود"
        maxHeight="min(70dvh, 600px)"
        density="comfortable"
        minTableWidth="100%"
      />
    </div>
  );
}
