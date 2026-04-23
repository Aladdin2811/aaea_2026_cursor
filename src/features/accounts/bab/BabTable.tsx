import { type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { type BabWithRelations } from "../../../api/apiBab";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import { TableStatusBadge } from "../../../components/ui/TableStatusBadge";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import { useFetchBab } from "./useBab";

// function embedName<T extends { id: number }>(
//   embed: T | T[] | null | undefined,
//   pick: (x: T) => string,
// ): string {
//   if (embed == null) return "";
//   if (Array.isArray(embed)) return pick(embed[0] as T);
//   return pick(embed);
// }

const columns: DataTableColumn<BabWithRelations>[] = [
  {
    id: "name",
    header: "الباب",
    cell: (row) => (
      <span className="min-w-0 font-medium text-slate-900">
        {formatOptionalText(row.bab_name)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.bab_name),
  },
  {
    id: "code",
    header: "الكود",
    cell: (row) => (
      <span className="font-mono tabular-nums text-slate-800">
        {formatOptionalText(row.bab_code)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.bab_code),
    contentAlign: "center",
  },
  // {
  //   id: "accountType",
  //   header: "تصنيف الحساب",
  //   cell: (row) => (
  //     <span className="text-slate-700">
  //       {formatOptionalText(
  //         embedName(row.account_type, (a) => stringValue(a.account_type_name)) || null,
  //       )}
  //     </span>
  //   ),
  //   getSortValue: (r) => embedName(r.account_type, (a) => stringValue(a.account_type_name)),
  // },
  // {
  //   id: "general",
  //   header: "الحساب العام",
  //   cell: (row) => {
  //     const t = row.general_account;
  //     const g = t == null ? null : Array.isArray(t) ? t[0] : t;
  //     if (g == null) {
  //       return <span className="text-slate-400">—</span>;
  //     }
  //     return (
  //       <div className="line-clamp-2 text-sm text-slate-700">
  //         <span className="me-1 font-mono text-xs text-slate-500">
  //           {formatOptionalText(g.general_account_code)}
  //         </span>
  //         <span>{formatOptionalText(g.general_account_name)}</span>
  //       </div>
  //     );
  //   },
  //   getSortValue: (r) =>
  //     embedName(
  //       r.general_account,
  //       (g) => `${stringValue(g.general_account_code)} ${stringValue(g.general_account_name)}`,
  //     ),
  // },
  {
    id: "havebudget",
    header: "له موازنة",
    cell: (row) => <TableStatusBadge value={row.havebudget} />,
    getSortValue: (r) => (r.havebudget ? 1 : 0),
    contentAlign: "center",
    className: "w-20 min-w-20",
  },
  {
    id: "haveprograms",
    header: "له برامج",
    cell: (row) => <TableStatusBadge value={row.haveprograms} />,
    getSortValue: (r) => (r.haveprograms ? 1 : 0),
    contentAlign: "center",
    className: "w-20 min-w-20",
  },
  {
    id: "status",
    header: "الحالة",
    cell: (row) => <TableStatusBadge value={row.status} />,
    getSortValue: (r) => stringValue(r.status),
    contentAlign: "center",
    className: "w-20 min-w-20",
  },
  {
    id: "description",
    header: "الوصف",
    cell: (row) => (
      <span className="line-clamp-2 max-w-xs text-xs text-slate-600">
        {formatOptionalText(row.description)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.description),
  },
];

function Toolbar({
  generalAccountId,
}: {
  generalAccountId: string;
}): ReactNode {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link
        to={`/settings/general_account/${generalAccountId}`}
        className="text-sm font-medium text-emerald-800 underline-offset-2 hover:underline"
      >
        ← العودة إلى الحسابات العامة
      </Link>
      <Link
        to="/settings/account_type"
        className="text-sm text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
      >
        تصنيف الحسابات
      </Link>
    </div>
  );
}

export default function BabTable() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isLoading, data, error, isError } = useFetchBab();
  const rows = data ?? [];

  if (id == null || id === "") {
    return (
      <div dir="rtl" className="space-y-3 text-slate-700">
        <p>
          لم يُحدَّد الحساب العام. من صفحة الحسابات العامة اختر صفّاً، أو من
          الرابط:{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">
            /settings/bab/رقم_الحساب_العام
          </code>
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
      <DataTable<BabWithRelations>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل بيانات الأبواب…"
        emptyMessage="لا توجد أبواب مسجّلة لهذا الحساب العام."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={<Toolbar generalAccountId={id} />}
        caption={`الأبواب (الحساب العام ${id})`}
        maxHeight="min(70dvh, 600px)"
        density="comfortable"
        minTableWidth="100%"
        onRowClick={(row) => {
          const ga = row.general_account_id;
          const q =
            ga != null && String(ga) !== "" ? `?ga=${encodeURIComponent(String(ga))}` : "";
          navigate(`/settings/band/${row.id}${q}`);
        }}
      />
    </div>
  );
}
