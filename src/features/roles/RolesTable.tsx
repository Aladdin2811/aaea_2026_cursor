import { useMemo, type ReactNode } from "react";
import { type RolesRow } from "../../api/apiRoles";
import {
  DataTable,
  type DataTableColumn,
} from "../../components/ui/data-table";
import { TableStatusBadge } from "../../components/ui/TableStatusBadge";
import { formatOptionalText, stringValue } from "../../lib/displayValue";
import { useFetchRoles } from "./useRoles";

const columns: DataTableColumn<RolesRow>[] = [
  {
    id: "role_name",
    header: "اسم الصلاحية",
    className: "min-w-44",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 font-medium text-slate-900">
        {formatOptionalText(row.role_name)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.role_name),
  },
  {
    id: "description",
    header: "الوصف",
    className: "min-w-56 max-w-md",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 whitespace-normal break-words text-slate-800">
        {formatOptionalText(row.description)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.description),
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
      عدد الصلاحيات:{" "}
      <span className="font-medium tabular-nums text-slate-800">{n}</span>
    </p>
  );
}

export default function RolesTable() {
  const { isLoading, data, error, isError } = useFetchRoles();
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
      <DataTable<RolesRow>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل بيانات الصلاحيات…"
        emptyMessage="لا توجد صلاحيات مسجّلة للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          !isLoading && rows.length > 0 ? (
            <ToolbarCount n={rows.length} />
          ) : null
        }
        caption="جدول الصلاحيات"
        density="comfortable"
        minTableWidth="100%"
      />
    </div>
  );
}
