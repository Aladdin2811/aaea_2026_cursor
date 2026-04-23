import { useMemo, type ReactNode } from "react";
import { type ExpertsBasicSalariesRow } from "../../../api/apiExpertsBasicSalaries";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
// import { TableStatusBadge } from "../../../components/ui/TableStatusBadge";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import DecimalConverter from "../../../utils/DecimalConverter";
import { useFetchExpertsBasicSalaries } from "./useExpertsBasicSalaries";

const columns: DataTableColumn<ExpertsBasicSalariesRow>[] = [
  // {
  //   id: "nature",
  //   header: "طبيعة العمل",
  //   className: "min-w-36",
  //   thClassName: "!whitespace-normal",
  //   cell: (row) => (
  //     <span className="block min-w-0 text-slate-900">
  //       {formatOptionalText(row.job_nature?.job_nature_name)}
  //     </span>
  //   ),
  //   getSortValue: (r) => stringValue(r.job_nature?.job_nature_name),
  // },
  {
    id: "category",
    header: "الفئة",
    className: "min-w-32",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 text-slate-900">
        {formatOptionalText(row.job_category?.job_category_name)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.job_category?.job_category_name),
  },
  {
    id: "grade",
    header: "الدرجة",
    className: "min-w-32",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 text-slate-900">
        {formatOptionalText(row.job_grade?.job_grade_name)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.job_grade?.job_grade_name),
  },
  {
    id: "maximum",
    header: "الحد الأقصى",
    className: "min-w-28",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <DecimalConverter
        number={row.maximum}
        className="tabular-nums text-slate-900"
      />
    ),
    getSortValue: (r) => r.maximum ?? -Infinity,
    contentAlign: "center",
  },
  {
    id: "notes",
    header: "ملاحظات",
    className: "min-w-40 max-w-md",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 whitespace-normal break-words text-slate-800">
        {formatOptionalText(row.notes)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.notes),
  },
  // {
  //   id: "status",
  //   header: "التفعيل",
  //   className: "min-w-20",
  //   thClassName: "!whitespace-normal text-center",
  //   cell: (row) => <TableStatusBadge value={row.status} />,
  //   getSortValue: (r) => stringValue(r.status),
  //   contentAlign: "center",
  // },
];

function ToolbarCount({ n }: { n: number }): ReactNode {
  return (
    <p className="text-sm text-slate-600">
      عدد السجلات:{" "}
      <DecimalConverter
        number={n}
        decimalPlaces={0}
        className="inline font-medium tabular-nums text-slate-800"
      />
    </p>
  );
}

export default function ExpertsBasicSalariesTable() {
  const { isLoading, data, error, isError } = useFetchExpertsBasicSalaries();
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
      <DataTable<ExpertsBasicSalariesRow>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل المكافآت الأساسية للخبراء…"
        emptyMessage="لا توجد بيانات مسجّلة للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          !isLoading && rows.length > 0 ? (
            <ToolbarCount n={rows.length} />
          ) : null
        }
        caption="جدول المكافآت الأساسية للخبراء"
        maxHeight="min(70dvh, 640px)"
        density="compact"
        minTableWidth="min(100%, 900px)"
      />
    </div>
  );
}
