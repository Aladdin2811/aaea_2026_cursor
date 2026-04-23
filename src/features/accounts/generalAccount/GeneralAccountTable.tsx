import { type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { type GeneralAccountWithType } from "../../../api/apiGeneralAccount";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import { TableStatusBadge } from "../../../components/ui/TableStatusBadge";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import { useFetchGeneralAccount } from "./useGeneralAccount";

// function accountTypeName(row: GeneralAccountWithType): string {
//   const t = row.account_type;
//   if (t == null) return "";
//   if (Array.isArray(t)) {
//     return stringValue(t[0]?.account_type_name);
//   }
//   return stringValue(t.account_type_name);
// }

const columns: DataTableColumn<GeneralAccountWithType>[] = [
  {
    id: "name",
    header: "اسم الحساب",
    cell: (row) => (
      <span className="min-w-0 font-medium text-slate-900">
        {formatOptionalText(row.general_account_name)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.general_account_name),
  },
  {
    id: "code",
    header: "الكود",
    cell: (row) => (
      <span className="font-mono tabular-nums text-slate-800">
        {formatOptionalText(row.general_account_code)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.general_account_code),
    contentAlign: "center",
  },
  // {
  //   id: "type",
  //   header: "تصنيف الحساب",
  //   cell: (row) => (
  //     <span className="text-slate-700">
  //       {formatOptionalText(accountTypeName(row) || null)}
  //     </span>
  //   ),
  //   getSortValue: (r) => accountTypeName(r),
  // },
  {
    id: "status",
    header: "الحالة",
    cell: (row) => <TableStatusBadge value={row.status} />,
    getSortValue: (r) => stringValue(r.status),
    contentAlign: "center",
    className: "w-24 min-w-24",
  },
  {
    id: "description",
    header: "الوصف",
    cell: (row) => (
      <span className="line-clamp-2 max-w-md text-xs text-slate-600">
        {formatOptionalText(row.description)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.description),
  },
];

function BackLinkToolbar(): ReactNode {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link
        to="/settings/account_type"
        className="text-sm font-medium text-emerald-800 underline-offset-2 hover:underline"
      >
        ← العودة إلى تصنيف الحسابات
      </Link>
    </div>
  );
}

export default function GeneralAccountTable() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isLoading, data, error, isError } = useFetchGeneralAccount();
  const rows = data ?? [];

  if (id == null || id === "") {
    return (
      <div dir="rtl" className="space-y-3 text-slate-700">
        <p>
          لم يُحدَّد نوع الحساب. اختر صفّاً من جدول تصنيف الحسابات للانتقال إلى
          الحسابات التابعة له.
        </p>
        <Link
          to="/settings/account_type"
          className="font-medium text-emerald-800 underline-offset-2 hover:underline"
        >
          الانتقال إلى تصنيف الحسابات
        </Link>
      </div>
    );
  }

  if (isError) {
    return (
      <p dir="rtl" className="text-destructive" role="alert">
        {error instanceof Error ? error.message : "حدث خطأ أثناء التحميل"}
      </p>
    );
  }

  return (
    <div className="space-y-2" dir="rtl">
      <DataTable<GeneralAccountWithType>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل الحسابات العامة…"
        emptyMessage="لا توجد حسابات عامة مسجّلة لهذا التصنيف."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={<BackLinkToolbar />}
        caption={`الحسابات العامة (تصنيف رقم ${id})`}
        maxHeight="min(70dvh, 600px)"
        density="comfortable"
        minTableWidth="100%"
        onRowClick={(row) => {
          navigate(`/settings/bab/${row.id}`);
        }}
      />
    </div>
  );
}
