import { useMemo, type ReactNode } from "react";
import { type WorldClassificationRow } from "../../../api/apiWorldClassifications";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import { TableStatusBadge } from "../../../components/ui/TableStatusBadge";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import { useFetchWorldClassifications } from "./useWorldClassifications";

const columns: DataTableColumn<WorldClassificationRow>[] = [
  {
    id: "name",
    header: "اسم التصنيف",
    className: "min-w-48",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 font-medium text-slate-900">
        {formatOptionalText(row.world_classification_name)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.world_classification_name),
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
      عدد التصنيفات:{" "}
      <span className="font-medium tabular-nums text-slate-800">{n}</span>
    </p>
  );
}

export default function WorldClassificationsTable() {
  const { isLoading, data, error, isError } = useFetchWorldClassifications();
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
      <DataTable<WorldClassificationRow>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل تصنيف دول العالم…"
        emptyMessage="لا توجد تصنيفات مسجّلة للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          !isLoading && rows.length > 0 ? (
            <ToolbarCount n={rows.length} />
          ) : null
        }
        caption="جدول تصنيف دول العالم"
        maxHeight="min(70dvh, 600px)"
        density="comfortable"
        minTableWidth="100%"
      />
    </div>
  );
}
