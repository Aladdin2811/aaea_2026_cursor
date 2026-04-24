import { useMemo, type ReactNode } from "react";
import { type JobNatureRow } from "../../../api/apiJobNature";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
// import { TableStatusBadge } from "../../../components/ui/TableStatusBadge";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import { useFetchJobNature } from "./useJobNature";

const columns: DataTableColumn<JobNatureRow>[] = [
  {
    id: "name",
    header: "طبيعة العمل",
    className: "min-w-48",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 font-medium text-slate-900">
        {formatOptionalText(row.job_nature_name)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.job_nature_name),
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
  // {
  //   id: "status",
  //   header: "التفعيل",
  //   className: "min-w-24",
  //   thClassName: "!whitespace-normal text-center",
  //   cell: (row) => <TableStatusBadge value={row.status} />,
  //   getSortValue: (r) => stringValue(r.status),
  //   contentAlign: "center",
  // },
];

function ToolbarCount({ n }: { n: number }): ReactNode {
  return (
    <p className="text-sm text-slate-600">
      عدد أنواع طبيعة العمل:{" "}
      <span className="font-medium tabular-nums text-slate-800">{n}</span>
    </p>
  );
}

export default function JobNatureTable() {
  const { isLoading, data, error, isError } = useFetchJobNature();
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
      <DataTable<JobNatureRow>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل أنواع طبيعة العمل…"
        emptyMessage="لا توجد بيانات مسجّلة للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          !isLoading && rows.length > 0 ? (
            <ToolbarCount n={rows.length} />
          ) : null
        }
        caption="جدول طبيعة العمل"
        density="comfortable"
        minTableWidth="100%"
      />
    </div>
  );
}
