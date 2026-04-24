import { type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { type AccountTypeRow } from "../../../api/apiAccountType";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import { TableStatusBadge } from "../../../components/ui/TableStatusBadge";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import { useFetchAccountType } from "./useAccountType";

const columns: DataTableColumn<AccountTypeRow>[] = [
  {
    id: "name",
    header: "أنواع الحسابات",
    cell: (row) => (
      <span className="min-w-0 font-medium text-slate-900">
        {formatOptionalText(row.account_type_name)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.account_type_name),
  },
  {
    id: "status",
    header: "الحالة",
    cell: (row) => <TableStatusBadge value={row.status} />,
    getSortValue: (r) => stringValue(r.status),
    contentAlign: "center",
    className: "w-32 min-w-32",
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

export default function AccountTypeTable() {
  const navigate = useNavigate();
  const { isLoading, data, error, isError } = useFetchAccountType();
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
      <DataTable<AccountTypeRow>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل تصنيفات الحسابات…"
        emptyMessage="لا توجد تصنيفات حسابات للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          !isLoading && rows.length > 0 ? (
            <ToolbarCount n={rows.length} />
          ) : null
        }
        caption="جدول تصنيفات الحسابات"
        density="comfortable"
        minTableWidth="100%"
        onRowClick={(row) => {
          navigate(`/settings/general_account/${row.id}`);
        }}
        rowClassName={() => "cursor-pointer"}
      />
    </div>
  );
}
