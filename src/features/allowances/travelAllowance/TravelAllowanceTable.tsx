import { useMemo, type ReactNode } from "react";
import { type TravelAllowanceRow } from "../../../api/apiTravelAllowance";

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
import DecimalConverter from "../../../utils/DecimalConverter";
import { useFetchTravelAllowance } from "./useTravelAllowance";

const columns: DataTableColumn<TravelAllowanceRow>[] = [
  {
    id: "nature",
    header: "طبيعة العمل",
    className: "min-w-36",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 text-slate-900">
        {formatOptionalText(firstEmbed(row.job_nature)?.job_nature_name)}
      </span>
    ),
    getSortValue: (r) =>
      stringValue(firstEmbed(r.job_nature)?.job_nature_name),
  },
  {
    id: "category",
    header: "الفئة",
    className: "min-w-32",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 text-slate-900">
        {formatOptionalText(firstEmbed(row.job_category)?.job_category_name)}
      </span>
    ),
    getSortValue: (r) =>
      stringValue(firstEmbed(r.job_category)?.job_category_name),
  },
  {
    id: "grade",
    header: "الدرجة",
    className: "min-w-32",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 text-slate-900">
        {formatOptionalText(firstEmbed(row.job_grade)?.job_grade_name)}
      </span>
    ),
    getSortValue: (r) =>
      stringValue(firstEmbed(r.job_grade)?.job_grade_name),
  },
  {
    id: "region",
    header: "تصنيف المنطقة",
    className: "min-w-36",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 text-slate-900">
        {formatOptionalText(
          firstEmbed(row.world_regions)?.world_region_name,
        )}
      </span>
    ),
    getSortValue: (r) =>
      stringValue(firstEmbed(r.world_regions)?.world_region_name),
  },
  {
    id: "amount",
    header: "المبلغ",
    className: "min-w-28",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <DecimalConverter
        number={row.amount}
        className="tabular-nums text-slate-900"
      />
    ),
    getSortValue: (r) => {
      const a = r.amount;
      if (a == null) return -Infinity;
      const n = typeof a === "string" ? Number.parseFloat(a) : a;
      return Number.isFinite(n) ? n : -Infinity;
    },
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

export default function TravelAllowanceTable() {
  const { isLoading, data, error, isError } = useFetchTravelAllowance();
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
      <DataTable<TravelAllowanceRow>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل تعويض بدل السفر…"
        emptyMessage="لا توجد بيانات مسجّلة للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          !isLoading && rows.length > 0 ? (
            <ToolbarCount n={rows.length} />
          ) : null
        }
        caption="جدول تعويض بدل السفر"
        density="compact"
        minTableWidth="min(100%, 960px)"
      />
    </div>
  );
}
