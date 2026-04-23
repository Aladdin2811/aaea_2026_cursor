import { useMemo, type ReactNode } from "react";
import { type EmployeesBasicSalariesRow } from "../../../api/apiEmployeesBasicSalaries";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
// import { TableStatusBadge } from "../../../components/ui/TableStatusBadge";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import DecimalConverter from "../../../utils/DecimalConverter";
import { useFetchEmployeesBasicSalaries } from "./useEmployeesBasicSalaries";

const columns: DataTableColumn<EmployeesBasicSalariesRow>[] = [
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
    id: "basic_first",
    header: "أول مربوط الراتب الأساسي",
    className: "min-w-24",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <DecimalConverter
        number={row.basic_first_bound}
        className="tabular-nums text-slate-900"
      />
    ),
    getSortValue: (r) => r.basic_first_bound ?? -Infinity,
    contentAlign: "center",
  },
  {
    id: "basic_last",
    header: "آخر مربوط الراتب الأساسي",
    className: "min-w-24",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <DecimalConverter
        number={row.basic_last_bound}
        className="tabular-nums text-slate-900"
      />
    ),
    getSortValue: (r) => r.basic_last_bound ?? -Infinity,
    contentAlign: "center",
  },
  {
    id: "living_cost",
    header: "غلاء المعيشة",
    className: "min-w-24",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <DecimalConverter
        number={row.living_cost}
        className="tabular-nums text-slate-900"
      />
    ),
    getSortValue: (r) => r.living_cost ?? -Infinity,
    contentAlign: "center",
  },
  {
    id: "representation",
    header: "بدل التمثيل",
    className: "min-w-20",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <DecimalConverter
        number={row.representation}
        className="tabular-nums text-slate-900"
      />
    ),
    getSortValue: (r) => r.representation ?? -Infinity,
    contentAlign: "center",
  },
  {
    id: "housing",
    header: "بدل السكن",
    className: "min-w-20",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <DecimalConverter
        number={row.housing}
        className="tabular-nums text-slate-900"
      />
    ),
    getSortValue: (r) => r.housing ?? -Infinity,
    contentAlign: "center",
  },
  {
    id: "living",
    header: "بدل المعيشة",
    className: "min-w-20",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <DecimalConverter
        number={row.living}
        className="tabular-nums text-slate-900"
      />
    ),
    getSortValue: (r) => r.living ?? -Infinity,
    contentAlign: "center",
  },
  {
    id: "total_first",
    header: "أول مربوط إجمالي الراتب",
    className: "min-w-24",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <DecimalConverter
        number={row.total_first_bound}
        className="tabular-nums text-slate-900"
      />
    ),
    getSortValue: (r) => r.total_first_bound ?? -Infinity,
    contentAlign: "center",
  },
  {
    id: "total_last",
    header: "آخر مربوط إجمالي الراتب",
    className: "min-w-24",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <DecimalConverter
        number={row.total_last_bound}
        className="tabular-nums text-slate-900"
      />
    ),
    getSortValue: (r) => r.total_last_bound ?? -Infinity,
    contentAlign: "center",
  },
  {
    id: "bonus_amount",
    header: "قيمة العلاوة",
    className: "min-w-24",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <DecimalConverter
        number={row.bonus_amount}
        className="tabular-nums text-slate-900"
      />
    ),
    getSortValue: (r) => r.bonus_amount ?? -Infinity,
    contentAlign: "center",
  },
  {
    id: "bonus_count",
    header: "عدد العلاوات",
    className: "min-w-20",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <DecimalConverter
        number={row.bonus_count}
        decimalPlaces={0}
        className="tabular-nums text-slate-900"
      />
    ),
    getSortValue: (r) => r.bonus_count ?? -Infinity,
    contentAlign: "center",
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

export default function EmployeesBasicSalariesTable() {
  const { isLoading, data, error, isError } = useFetchEmployeesBasicSalaries();
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
      <DataTable<EmployeesBasicSalariesRow>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل رواتب الموظفين الأساسية…"
        emptyMessage="لا توجد بيانات مسجّلة للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          !isLoading && rows.length > 0 ? (
            <ToolbarCount n={rows.length} />
          ) : null
        }
        caption="جدول الرواتب الأساسية للموظفين"
        maxHeight="min(70dvh, 640px)"
        density="compact"
        minTableWidth="min(100%, 1100px)"
      />
    </div>
  );
}
