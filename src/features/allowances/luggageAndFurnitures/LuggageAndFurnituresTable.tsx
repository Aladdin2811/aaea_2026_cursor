import { useMemo, type ReactNode } from "react";
import { type LuggageAndFurnituresRow } from "../../../api/apiLuggageAndFurnitures";

function firstEmbed<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function sortNumericField(v: string | number | null | undefined): number {
  if (v == null || v === "") return -Infinity;
  const n = typeof v === "string" ? Number.parseFloat(v) : v;
  return Number.isFinite(n) ? n : -Infinity;
}
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
// import { TableStatusBadge } from "../../../components/ui/TableStatusBadge";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import DecimalConverter from "../../../utils/DecimalConverter";
import { useFetchLuggageAndFurnitures } from "./useLuggageAndFurnitures";

const columns: DataTableColumn<LuggageAndFurnituresRow>[] = [
  {
    id: "category",
    header: "الفئة الوظيفية",
    className: "min-w-40",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 text-slate-900">
        {formatOptionalText(
          firstEmbed(row.job_category)?.job_category_name ?? null,
        )}
      </span>
    ),
    getSortValue: (r) =>
      stringValue(firstEmbed(r.job_category)?.job_category_name),
  },
  {
    id: "social",
    header: "الحالة الاجتماعية",
    className: "min-w-40",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 text-slate-900">
        {formatOptionalText(
          firstEmbed(row.social_situations)?.social_situation_name ?? null,
        )}
      </span>
    ),
    getSortValue: (r) =>
      stringValue(firstEmbed(r.social_situations)?.social_situation_name),
  },
  {
    id: "minimum",
    header: "الحد الأدنى",
    className: "min-w-24",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <DecimalConverter
        number={row.minimum}
        className="tabular-nums text-slate-900"
      />
    ),
    getSortValue: (r) => sortNumericField(r.minimum),
    contentAlign: "center",
  },
  {
    id: "maximum",
    header: "الحد الأقصى",
    className: "min-w-24",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <DecimalConverter
        number={row.maximum}
        className="tabular-nums text-slate-900"
      />
    ),
    getSortValue: (r) => sortNumericField(r.maximum),
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

export default function LuggageAndFurnituresTable() {
  const { isLoading, data, error, isError } = useFetchLuggageAndFurnitures();
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
      <DataTable<LuggageAndFurnituresRow>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل بدل نقل الأمتعة والأثاث…"
        emptyMessage="لا توجد بيانات مسجّلة للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          !isLoading && rows.length > 0 ? (
            <ToolbarCount n={rows.length} />
          ) : null
        }
        caption="جدول بدل نقل الأمتعة والأثاث"
        density="compact"
        minTableWidth="min(100%, 720px)"
      />
    </div>
  );
}
