import { useMemo, type ReactNode } from "react";
import { type SocialSecurityBandPercentageWithRelations } from "../../../api/apiSocialSecurityBandPercentage";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import { useFetchSocialSecurityBandPercentage } from "./useSocialSecurityBandPercentage";

function relationItem<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function formatPercent(value: string | number | null | undefined): string {
  if (value == null || value === "") return "—";
  return `${value}%`;
}

const columns: DataTableColumn<SocialSecurityBandPercentageWithRelations>[] = [
  {
    id: "band",
    header: "البند",
    className: "min-w-52",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 font-medium text-slate-900">
        {formatOptionalText(
          relationItem(row.social_security_band)?.social_security_band_name,
        )}
      </span>
    ),
    getSortValue: (r) =>
      stringValue(relationItem(r.social_security_band)?.social_security_band_name),
  },
  {
    id: "category",
    header: "الفئة",
    className: "min-w-52",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 text-slate-700">
        {formatOptionalText(
          relationItem(row.social_security_category)?.social_security_category_name,
        )}
      </span>
    ),
    getSortValue: (r) =>
      stringValue(
        relationItem(r.social_security_category)?.social_security_category_name,
      ),
  },
  {
    id: "classification",
    header: "التصنيف",
    className: "min-w-56",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 text-slate-700">
        {formatOptionalText(
          relationItem(row.social_security_classification)
            ?.social_security_classification_name,
        )}
      </span>
    ),
    getSortValue: (r) =>
      stringValue(
        relationItem(r.social_security_classification)
          ?.social_security_classification_name,
      ),
  },
  {
    id: "percentage",
    header: "النسبة",
    className: "min-w-36",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <span className="block text-center font-medium text-slate-900">
        {formatPercent(row.band_percentage)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.band_percentage),
    contentAlign: "center",
  },
];

function ToolbarCount({ n }: { n: number }): ReactNode {
  return (
    <p className="text-sm text-slate-600">
      عدد السجلات:{" "}
      <span className="font-medium tabular-nums text-slate-800">{n}</span>
    </p>
  );
}

export default function SocialSecurityBandPercentageTable() {
  const { isLoading, data, error } = useFetchSocialSecurityBandPercentage();
  const rows = useMemo(() => data ?? [], [data]);
  const isError = error != null;

  if (isError) {
    return (
      <p dir="rtl" className="text-destructive" role="alert">
        {error instanceof Error ? error.message : "حدث خطأ أثناء التحميل"}
      </p>
    );
  }

  return (
    <div className="space-y-2" dir="rtl">
      <DataTable<SocialSecurityBandPercentageWithRelations>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل نسب بنود الضمان الاجتماعي…"
        emptyMessage="لا توجد بيانات نسب للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          !isLoading && rows.length > 0 ? <ToolbarCount n={rows.length} /> : null
        }
        caption="جدول نسب بنود الضمان الاجتماعي"
        density="comfortable"
        minTableWidth="100%"
      />
    </div>
  );
}
