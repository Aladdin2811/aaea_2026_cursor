import { useMemo, type ReactNode } from "react";
import { type SocialSecurityOrganizationContributionRow } from "../../../api/apiSocialSecurityOrganizationContribution";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import { stringValue } from "../../../lib/displayValue";
import { useFetchSocialSecurityOrganizationContribution } from "./useSocialSecurityOrganizationContribution";

function formatPercent(value: string | number | null | undefined): string {
  if (value == null || value === "") return "—";
  return `${value}%`;
}

const columns: DataTableColumn<SocialSecurityOrganizationContributionRow>[] = [
  {
    id: "percentage",
    header: "نسبة المساهمة",
    className: "min-w-56",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <span className="block text-center font-medium text-slate-900">
        {formatPercent(row.organization_contribution_percentage)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.organization_contribution_percentage),
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

export default function SocialSecurityOrganizationContributionTable() {
  const { isLoading, data, error } =
    useFetchSocialSecurityOrganizationContribution();
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
      <DataTable<SocialSecurityOrganizationContributionRow>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل نسب مساهمة الهيئة…"
        emptyMessage="لا توجد نسب مساهمة للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          !isLoading && rows.length > 0 ? (
            <ToolbarCount n={rows.length} />
          ) : null
        }
        caption="جدول مساهمة الهيئة في الضمان الاجتماعي"
        density="comfortable"
        minTableWidth="100%"
      />
    </div>
  );
}
