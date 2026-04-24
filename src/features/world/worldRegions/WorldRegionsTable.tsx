import { useMemo, type ReactNode } from "react";
import { type WorldRegionRow } from "../../../api/apiWorldRegions";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import { TableStatusBadge } from "../../../components/ui/TableStatusBadge";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import { useFetchWorldRegions } from "./useWorldRegions";

const columns: DataTableColumn<WorldRegionRow>[] = [
  {
    id: "name",
    header: "اسم المنطقة",
    className: "min-w-48",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 font-medium text-slate-900">
        {formatOptionalText(row.world_region_name)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.world_region_name),
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
      عدد المناطق:{" "}
      <span className="font-medium tabular-nums text-slate-800">{n}</span>
    </p>
  );
}

export default function WorldRegionsTable() {
  const { isLoading, data, error, isError } = useFetchWorldRegions();
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
      <DataTable<WorldRegionRow>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل تصنيف المناطق…"
        emptyMessage="لا توجد مناطق مسجّلة للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          !isLoading && rows.length > 0 ? (
            <ToolbarCount n={rows.length} />
          ) : null
        }
        caption="جدول تصنيف مناطق العالم"
        density="comfortable"
        minTableWidth="100%"
      />
    </div>
  );
}
