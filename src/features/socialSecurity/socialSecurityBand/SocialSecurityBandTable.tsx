import { useMemo, type ReactNode } from "react";
import { type SocialSecurityBandRow } from "../../../api/apiSocialSecurityBand";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import { useFetchSocialSecurityBand } from "./useSocialSecurityBand";

const columns: DataTableColumn<SocialSecurityBandRow>[] = [
  // {
  //   id: "id",
  //   header: "رقم البند",
  //   className: "w-28 min-w-28",
  //   thClassName: "!whitespace-normal text-center",
  //   cell: (row) => (
  //     <span className="block text-center font-medium tabular-nums text-slate-700">
  //       {row.id}
  //     </span>
  //   ),
  //   getSortValue: (r) => r.id,
  //   contentAlign: "center",
  // },
  {
    id: "name",
    header: "اسم بند الضمان الاجتماعي",
    className: "min-w-64",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 font-medium text-slate-900">
        {formatOptionalText(row.social_security_band_name)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.social_security_band_name),
  },
];

function ToolbarCount({ n }: { n: number }): ReactNode {
  return (
    <p className="text-sm text-slate-600">
      عدد البنود:{" "}
      <span className="font-medium tabular-nums text-slate-800">{n}</span>
    </p>
  );
}

export default function SocialSecurityBandTable() {
  const { isLoading, data, error } = useFetchSocialSecurityBand();
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
      <DataTable<SocialSecurityBandRow>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل بنود الضمان الاجتماعي…"
        emptyMessage="لا توجد بنود ضمان اجتماعي مسجّلة للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          !isLoading && rows.length > 0 ? (
            <ToolbarCount n={rows.length} />
          ) : null
        }
        caption="جدول بنود الضمان الاجتماعي"
        density="comfortable"
        minTableWidth="100%"
      />
    </div>
  );
}
