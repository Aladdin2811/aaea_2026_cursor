import { useMemo, type ReactNode } from "react";
import { type SocialSecurityCurrencyRow } from "../../../api/apiSocialSecurityCurrency";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import { useFetchSocialSecurityCurrency } from "./useSocialSecurityCurrency";

const columns: DataTableColumn<SocialSecurityCurrencyRow>[] = [
  {
    id: "name",
    header: "اسم العملة",
    className: "min-w-64",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 font-medium text-slate-900">
        {formatOptionalText(row.social_security_currency_name)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.social_security_currency_name),
  },
];

function ToolbarCount({ n }: { n: number }): ReactNode {
  return (
    <p className="text-sm text-slate-600">
      عدد العملات: <span className="font-medium tabular-nums text-slate-800">{n}</span>
    </p>
  );
}

export default function SocialSecurityCurrencyTable() {
  const { isLoading, data, error } = useFetchSocialSecurityCurrency();
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
      <DataTable<SocialSecurityCurrencyRow>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل عملات الضمان الاجتماعي…"
        emptyMessage="لا توجد عملات للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          !isLoading && rows.length > 0 ? <ToolbarCount n={rows.length} /> : null
        }
        caption="جدول عملات الضمان الاجتماعي"
        density="comfortable"
        minTableWidth="100%"
      />
    </div>
  );
}
