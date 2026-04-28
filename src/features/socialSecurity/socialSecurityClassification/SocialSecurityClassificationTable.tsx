import { useMemo, type ReactNode } from "react";
import { type SocialSecurityClassificationRow } from "../../../api/apiSocialSecurityClassification";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import { useFetchSocialSecurityClassification } from "./useSocialSecurityClassification";

const columns: DataTableColumn<SocialSecurityClassificationRow>[] = [
  {
    id: "name",
    header: "اسم التصنيف",
    className: "min-w-72",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 font-medium text-slate-900">
        {formatOptionalText(row.social_security_classification_name)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.social_security_classification_name),
  },
];

function ToolbarCount({ n }: { n: number }): ReactNode {
  return (
    <p className="text-sm text-slate-600">
      عدد التصنيفات:{" "}
      <span className="font-medium tabular-nums text-slate-800">{n}</span>
    </p>
  );
}

export default function SocialSecurityClassificationTable() {
  const { isLoading, data, error } = useFetchSocialSecurityClassification();
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
      <DataTable<SocialSecurityClassificationRow>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل تصنيفات الضمان الاجتماعي…"
        emptyMessage="لا توجد تصنيفات للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          !isLoading && rows.length > 0 ? <ToolbarCount n={rows.length} /> : null
        }
        caption="جدول تصنيفات الضمان الاجتماعي"
        density="comfortable"
        minTableWidth="100%"
      />
    </div>
  );
}
