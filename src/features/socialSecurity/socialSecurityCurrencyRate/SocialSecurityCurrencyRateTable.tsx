import { useMemo, type ReactNode } from "react";
import { type SocialSecurityCurrencyRateRow } from "../../../api/apiSocialSecurityCurrencyRate";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import { useFetchSocialSecurityCurrencyRate } from "./useSocialSecurityCurrencyRate";

const columns: DataTableColumn<SocialSecurityCurrencyRateRow>[] = [
  {
    id: "rate",
    header: "سعر العملة",
    className: "min-w-56",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <span className="block text-center font-medium text-slate-900">
        {formatOptionalText(row.currency_rate)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.currency_rate),
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

export default function SocialSecurityCurrencyRateTable() {
  const { isLoading, data, error } = useFetchSocialSecurityCurrencyRate();
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
      <DataTable<SocialSecurityCurrencyRateRow>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل أسعار عملة الضمان الاجتماعي…"
        emptyMessage="لا توجد أسعار عملة للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          !isLoading && rows.length > 0 ? <ToolbarCount n={rows.length} /> : null
        }
        caption="جدول أسعار عملة الضمان الاجتماعي"
        density="comfortable"
        minTableWidth="100%"
      />
    </div>
  );
}
