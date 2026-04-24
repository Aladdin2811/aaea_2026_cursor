import { useMemo, type ReactNode } from "react";
import { type JobTitleRow } from "../../../api/apiJobTitle";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
// import { TableStatusBadge } from "../../../components/ui/TableStatusBadge";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import { useFetchJobTitle } from "./useJobTitle";

const columns: DataTableColumn<JobTitleRow>[] = [
  {
    id: "name",
    header: "المسمى الوظيفي",
    className: "min-w-56",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 font-medium text-slate-900">
        {formatOptionalText(row.job_title_name)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.job_title_name),
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
      عدد المسميات:{" "}
      <span className="font-medium tabular-nums text-slate-800">{n}</span>
    </p>
  );
}

export default function JobTitleTable() {
  const { isLoading, data, error, isError } = useFetchJobTitle();
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
      <DataTable<JobTitleRow>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل المسميات الوظيفية…"
        emptyMessage="لا توجد مسميات وظيفية مسجّلة للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          !isLoading && rows.length > 0 ? (
            <ToolbarCount n={rows.length} />
          ) : null
        }
        caption="جدول المسميات الوظيفية"
        density="comfortable"
        minTableWidth="100%"
      />
    </div>
  );
}
