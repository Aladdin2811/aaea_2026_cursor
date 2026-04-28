import { useMemo, type ReactNode } from "react";
import { type SocialSecurityPercentageRow } from "../../../api/apiSocialSecurityPercentage";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import { useFetchSocialSecurityPercentage } from "./useSocialSecurityPercentage";

function formatPercent(value: string | number | null | undefined): string {
  if (value == null || value === "") return "—";
  return `${value}%`;
}

const columns: DataTableColumn<SocialSecurityPercentageRow>[] = [
  {
    id: "percentage",
    header: "سقف النسبة",
    className: "min-w-56",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <span className="block text-center font-medium text-slate-900">
        {formatPercent(row.percentage_limit)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.percentage_limit),
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

export default function SocialSecurityPercentageTable() {
  const { isLoading, data, error } = useFetchSocialSecurityPercentage();
  const rows = useMemo(() => (Array.isArray(data) ? data : []), [data]);
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
      <DataTable<SocialSecurityPercentageRow>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل نسب الضمان الاجتماعي…"
        emptyMessage="لا توجد نسب للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          !isLoading && rows.length > 0 ? <ToolbarCount n={rows.length} /> : null
        }
        caption="جدول نسب الضمان الاجتماعي"
        density="comfortable"
        minTableWidth="100%"
      />
    </div>
  );
}
