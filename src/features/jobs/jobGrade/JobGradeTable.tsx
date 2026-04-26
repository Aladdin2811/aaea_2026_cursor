import { useMemo, type ReactNode } from "react";
import { type JobGradeRow } from "../../../api/apiJobGrade";

/** PostgREST قد يعيد علاقة واحدة ككائن أو كمصفوفة */
function firstEmbed<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
// import { TableStatusBadge } from "../../../components/ui/TableStatusBadge";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import { useFetchJobGrade } from "./useJobGrade";

const columns: DataTableColumn<JobGradeRow>[] = [
  {
    id: "name",
    header: "الدرجة الوظيفية",
    className: "min-w-48",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 font-medium text-slate-900">
        {formatOptionalText(row.job_grade_name)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.job_grade_name),
  },
  {
    id: "nature",
    header: "طبيعة العمل",
    className: "min-w-40",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 text-slate-800">
        {formatOptionalText(
          firstEmbed(row.job_nature)?.job_nature_name ?? null,
        )}
      </span>
    ),
    getSortValue: (r) =>
      stringValue(firstEmbed(r.job_nature)?.job_nature_name),
  },
  {
    id: "category",
    header: "الفئة الوظيفية",
    className: "min-w-44",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 text-slate-800">
        {formatOptionalText(
          firstEmbed(row.job_category)?.job_category_name ?? null,
        )}
      </span>
    ),
    getSortValue: (r) =>
      stringValue(firstEmbed(r.job_category)?.job_category_name),
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
      عدد الدرجات الوظيفية:{" "}
      <span className="font-medium tabular-nums text-slate-800">{n}</span>
    </p>
  );
}

export default function JobGradeTable() {
  const { isLoading, data, error, isError } = useFetchJobGrade();
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
      <DataTable<JobGradeRow>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل الدرجات الوظيفية…"
        emptyMessage="لا توجد درجات وظيفية مسجّلة للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          !isLoading && rows.length > 0 ? (
            <ToolbarCount n={rows.length} />
          ) : null
        }
        caption="جدول الدرجات الوظيفية"
        density="comfortable"
        minTableWidth="100%"
      />
    </div>
  );
}
