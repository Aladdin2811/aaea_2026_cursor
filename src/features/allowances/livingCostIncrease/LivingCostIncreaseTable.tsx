import { useMemo, type ReactNode } from "react";
import { type LivingCostIncreaseRow } from "../../../api/apiLivingCostIncrease";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import DecimalConverter from "../../../utils/DecimalConverter";
import { useFetchLivingCostIncrease } from "./useLivingCostIncrease";

const columns: DataTableColumn<LivingCostIncreaseRow>[] = [
  {
    id: "percentage",
    header: "نسبة الزيادة (%)",
    className: "min-w-36",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <DecimalConverter
        number={row.living_cost_increase_percentage}
        minimumFractionDigits={0}
        maximumFractionDigits={4}
        className="tabular-nums font-medium text-slate-900"
      />
    ),
    getSortValue: (r) => r.living_cost_increase_percentage ?? -Infinity,
    contentAlign: "center",
  },
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

export default function LivingCostIncreaseTable() {
  const { isLoading, data, error, isError } = useFetchLivingCostIncrease();
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
      <DataTable<LivingCostIncreaseRow>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل نسب الزيادة في غلاء المعيشة…"
        emptyMessage="لا توجد بيانات مسجّلة للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          !isLoading && rows.length > 0 ? (
            <ToolbarCount n={rows.length} />
          ) : null
        }
        caption="جدول نسبة الزيادة في تعويض غلاء المعيشة"
        density="comfortable"
        minTableWidth="100%"
      />
    </div>
  );
}
