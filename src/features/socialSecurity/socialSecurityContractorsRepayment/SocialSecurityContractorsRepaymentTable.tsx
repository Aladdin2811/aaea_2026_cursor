import { useMemo, type ReactNode } from "react";
import { type SocialSecurityContractorsRepaymentRow } from "../../../api/apiSocialSecurityContractorsRepayment";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import { useFetchSocialSecurityContractorsRepayment } from "./useSocialSecurityContractorsRepayment";

const columns: DataTableColumn<SocialSecurityContractorsRepaymentRow>[] = [
  {
    id: "value",
    header: "قيمة السداد",
    className: "min-w-56",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <span className="block text-center font-medium text-slate-900">
        {formatOptionalText(row.contractors_repayment)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.contractors_repayment),
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

export default function SocialSecurityContractorsRepaymentTable() {
  const { isLoading, data, error } = useFetchSocialSecurityContractorsRepayment();
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
      <DataTable<SocialSecurityContractorsRepaymentRow>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل بيانات سداد المتعاقدين…"
        emptyMessage="لا توجد بيانات سداد للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          !isLoading && rows.length > 0 ? <ToolbarCount n={rows.length} /> : null
        }
        caption="جدول سداد المتعاقدين في الضمان الاجتماعي"
        density="comfortable"
        minTableWidth="100%"
      />
    </div>
  );
}
