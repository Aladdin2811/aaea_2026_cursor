import { useMemo, type ReactNode } from "react";
import { type ContractorsBasicSalariesRow } from "../../../api/apiContractorsBasicSalaries";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
// import { TableStatusBadge } from "../../../components/ui/TableStatusBadge";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import DecimalConverter from "../../../utils/DecimalConverter";
import { useFetchContractorsBasicSalaries } from "./useContractorsBasicSalaries";

const columns: DataTableColumn<ContractorsBasicSalariesRow>[] = [
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
    id: "basic_first",
    header: "أول المربوط",
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
    header: "آخر المربوط",
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
    id: "notes",
    header: "ملاحظات",
    className: "min-w-40 max-w-xs",
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

export default function ContractorsBasicSalariesTable() {
  const { isLoading, data, error, isError } =
    useFetchContractorsBasicSalaries();
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
      <DataTable<ContractorsBasicSalariesRow>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل رواتب المتعاقدين الأساسية…"
        emptyMessage="لا توجد بيانات مسجّلة للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          !isLoading && rows.length > 0 ? (
            <ToolbarCount n={rows.length} />
          ) : null
        }
        caption="جدول الرواتب الأساسية للمتعاقدين"
        density="compact"
        minTableWidth="min(100%, 900px)"
      />
    </div>
  );
}
