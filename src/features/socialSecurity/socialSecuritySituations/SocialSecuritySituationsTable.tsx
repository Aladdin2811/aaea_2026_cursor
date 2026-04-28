import { useMemo, type ReactNode } from "react";
import { type SocialSecuritySituationsRow } from "../../../api/apiSocialSecuritySituations";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import { useFetchSocialSecuritySituations } from "./useSocialSecuritySituations";

const columns: DataTableColumn<SocialSecuritySituationsRow>[] = [
  {
    id: "name",
    header: "وضع الضمان الاجتماعي",
    className: "min-w-72",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 font-medium text-slate-900">
        {formatOptionalText(row.social_security_situation_name)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.social_security_situation_name),
  },
];

function ToolbarCount({ n }: { n: number }): ReactNode {
  return (
    <p className="text-sm text-slate-600">
      عدد الأوضاع: <span className="font-medium tabular-nums text-slate-800">{n}</span>
    </p>
  );
}

export default function SocialSecuritySituationsTable() {
  const { isLoading, data, error } = useFetchSocialSecuritySituations();
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
      <DataTable<SocialSecuritySituationsRow>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل أوضاع الضمان الاجتماعي…"
        emptyMessage="لا توجد أوضاع للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          !isLoading && rows.length > 0 ? <ToolbarCount n={rows.length} /> : null
        }
        caption="جدول أوضاع الضمان الاجتماعي"
        density="comfortable"
        minTableWidth="100%"
      />
    </div>
  );
}
