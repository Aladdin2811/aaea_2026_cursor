import { type ReactNode } from "react";
import { type VacationTypeRow } from "../../../api/apiVacationType";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import { TableStatusBadge } from "../../../components/ui/TableStatusBadge";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import { useFetchVacationType } from "./useVacationType";

const columns: DataTableColumn<VacationTypeRow>[] = [
  {
    id: "name",
    header: "نوع الإجازة",
    className: "min-w-56",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 font-medium text-slate-900">
        {formatOptionalText(row.vacation_type_name)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.vacation_type_name),
  },
  {
    id: "status",
    header: "الحالة",
    className: "min-w-24",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <TableStatusBadge
        value={row.status}
        activeLabel="فعّال"
        inactiveLabel="غير فعّال"
      />
    ),
    getSortValue: (r) => (r.status ? 1 : 0),
    contentAlign: "center",
  },
];

function ToolbarCount({ n }: { n: number }): ReactNode {
  return (
    <p className="text-sm text-slate-600">
      عدد الأنواع:{" "}
      <span className="font-medium tabular-nums text-slate-800">{n}</span>
    </p>
  );
}

export default function VacationTypeTable() {
  const { isLoading, data, error, isError } = useFetchVacationType();
  const rows = data ?? [];

  if (isError) {
    return (
      <p dir="rtl" className="text-destructive" role="alert">
        {error instanceof Error ? error.message : "حدث خطأ أثناء التحميل"}
      </p>
    );
  }

  return (
    <div className="space-y-2" dir="rtl">
      <DataTable<VacationTypeRow>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل أنواع الإجازة…"
        emptyMessage="لا توجد أنواع إجازة مسجّلة للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          !isLoading && rows.length > 0 ? (
            <ToolbarCount n={rows.length} />
          ) : null
        }
        caption="جدول أنواع الإجازة"
        density="comfortable"
        minTableWidth="min(100%, 560px)"
      />
    </div>
  );
}
