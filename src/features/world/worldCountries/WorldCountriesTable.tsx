import { useMemo, type ReactNode } from "react";
import { type WorldCountryWithRelations } from "../../../api/apiWorldCountries";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import { TableStatusBadge } from "../../../components/ui/TableStatusBadge";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import { useFetchWorldCountries } from "./useWorldCountries";

function pickFirst<T>(e: T | T[] | null | undefined): T | null {
  if (e == null) return null;
  return Array.isArray(e) ? (e[0] ?? null) : e;
}

const columns: DataTableColumn<WorldCountryWithRelations>[] = [
  {
    id: "country",
    header: "اسم الدولة",
    className: "min-w-44",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 font-medium text-slate-900">
        {formatOptionalText(row.world_country_name)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.world_country_name),
  },
  {
    id: "region",
    header: "المنطقة",
    className: "min-w-36",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="text-sm text-slate-700">
        {formatOptionalText(
          pickFirst(row.world_regions)?.world_region_name ?? null,
        )}
      </span>
    ),
    getSortValue: (r) =>
      stringValue(pickFirst(r.world_regions)?.world_region_name),
  },
  {
    id: "classification",
    header: "التصنيف",
    className: "min-w-36",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="text-sm text-slate-700">
        {formatOptionalText(
          pickFirst(row.world_classifications)?.world_classification_name ??
            null,
        )}
      </span>
    ),
    getSortValue: (r) =>
      stringValue(
        pickFirst(r.world_classifications)?.world_classification_name,
      ),
  },
  {
    id: "sort",
    header: "الترتيب",
    className: "min-w-20",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <span className="block text-center font-mono text-sm tabular-nums text-slate-800">
        {row.sort != null ? String(row.sort) : "—"}
      </span>
    ),
    getSortValue: (r) => r.sort ?? -1,
    contentAlign: "center",
  },
  {
    id: "status",
    header: "الحالة",
    className: "min-w-24",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => <TableStatusBadge value={row.status} />,
    getSortValue: (r) => stringValue(r.status),
    contentAlign: "center",
  },
];

function ToolbarCount({ n }: { n: number }): ReactNode {
  return (
    <p className="text-sm text-slate-600">
      عدد الدول:{" "}
      <span className="font-medium tabular-nums text-slate-800">{n}</span>
    </p>
  );
}

export default function WorldCountriesTable() {
  const { isLoading, data, error, isError } = useFetchWorldCountries();
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
      <DataTable<WorldCountryWithRelations>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل بيانات الدول…"
        emptyMessage="لا توجد دول مسجّلة للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          !isLoading && rows.length > 0 ? (
            <ToolbarCount n={rows.length} />
          ) : null
        }
        caption="جدول دول العالم"
        maxHeight="min(70dvh, 600px)"
        density="comfortable"
        minTableWidth="100%"
      />
    </div>
  );
}
