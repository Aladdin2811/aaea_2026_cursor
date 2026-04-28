import { useMemo, type ReactNode } from "react";
import { type SocialSecurityCategoryRow } from "../../../api/apiSocialSecurityCategory";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import { useFetchSocialSecurityCategory } from "./useSocialSecurityCategory";

const columns: DataTableColumn<SocialSecurityCategoryRow>[] = [
  {
    id: "name",
    header: "اسم الفئة",
    className: "min-w-64",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 font-medium text-slate-900">
        {formatOptionalText(row.social_security_category_name)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.social_security_category_name),
  },
  {
    id: "notes",
    header: "ملاحظات",
    className: "min-w-64",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 text-slate-700">
        {formatOptionalText(row.notes)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.notes),
  },
];

function ToolbarCount({ n }: { n: number }): ReactNode {
  return (
    <p className="text-sm text-slate-600">
      عدد الفئات: <span className="font-medium tabular-nums text-slate-800">{n}</span>
    </p>
  );
}

export default function SocialSecurityCategoryTable() {
  const { isLoading, data, error } = useFetchSocialSecurityCategory();
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
      <DataTable<SocialSecurityCategoryRow>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل فئات الضمان الاجتماعي…"
        emptyMessage="لا توجد فئات للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          !isLoading && rows.length > 0 ? <ToolbarCount n={rows.length} /> : null
        }
        caption="جدول فئات الضمان الاجتماعي"
        density="comfortable"
        minTableWidth="100%"
      />
    </div>
  );
}
