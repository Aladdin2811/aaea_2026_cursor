import { useMemo, type ReactNode } from "react";
import { type JobCategoryRow } from "../../../api/apiJobCategory";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
// import { TableStatusBadge } from "../../../components/ui/TableStatusBadge";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import { useFetchJobCategory } from "./useJobCategory";

function firstEmbed<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function natureLabel(row: JobCategoryRow): string {
  return formatOptionalText(firstEmbed(row.job_nature)?.job_nature_name);
}

const columns: DataTableColumn<JobCategoryRow>[] = [
  {
    id: "name",
    header: "الفئة الوظيفية",
    className: "min-w-48",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 font-medium text-slate-900">
        {formatOptionalText(row.job_category_name)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.job_category_name),
  },
  {
    id: "nature",
    header: "طبيعة العمل",
    className: "min-w-44",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 text-slate-800">{natureLabel(row)}</span>
    ),
    getSortValue: (r) =>
      stringValue(firstEmbed(r.job_nature)?.job_nature_name),
  },
  {
    id: "description",
    header: "الوصف",
    className: "min-w-52 max-w-md",
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
      عدد الفئات الوظيفية:{" "}
      <span className="font-medium tabular-nums text-slate-800">{n}</span>
    </p>
  );
}

export default function JobCategoryTable() {
  const { isLoading, data, error, isError } = useFetchJobCategory();
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
      <DataTable<JobCategoryRow>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل الفئات الوظيفية…"
        emptyMessage="لا توجد فئات وظيفية مسجّلة للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          !isLoading && rows.length > 0 ? (
            <ToolbarCount n={rows.length} />
          ) : null
        }
        caption="جدول الفئات الوظيفية"
        density="comfortable"
        minTableWidth="100%"
      />
    </div>
  );
}
