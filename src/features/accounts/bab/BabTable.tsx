import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { type BabWithRelations } from "../../../api/apiBab";
import { useSessionPermissions } from "../../permissions/useSessionPermissions";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import { TableStatusBadge } from "../../../components/ui/TableStatusBadge";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import { downloadExcelXls, printRtlTable } from "../../../lib/tableExport";
import { useFetchBab } from "./useBab";
import { useCreateBab, useDeleteBab, useUpdateBab } from "./useBab";
import { BabFormDialog } from "./BabFormDialog";
import { DeleteBabConfirmDialog } from "./DeleteBabConfirmDialog";

// function embedName<T extends { id: number }>(
//   embed: T | T[] | null | undefined,
//   pick: (x: T) => string,
// ): string {
//   if (embed == null) return "";
//   if (Array.isArray(embed)) return pick(embed[0] as T);
//   return pick(embed);
// }

const BASE_COLUMNS: DataTableColumn<BabWithRelations>[] = [
  {
    id: "name",
    header: "إسم الباب",
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

const EXPORT_HEADERS = ["اسم الباب", "الكود", "له موازنة", "له برامج", "الحالة"] as const;

function rowExportCells(row: BabWithRelations): string[] {
  return [
    formatOptionalText(row.bab_name),
    formatOptionalText(row.bab_code),
    row.havebudget ? "نعم" : "لا",
    row.haveprograms ? "نعم" : "لا",
    row.status ? "مفعل" : "غير مفعل",
  ];
}

function Toolbar({
  generalAccountId,
  rows,
  canCreate,
  canPrint,
  canExport,
  onAdd,
}: {
  generalAccountId: string;
  rows: BabWithRelations[];
  canCreate: boolean;
  canPrint: boolean;
  canExport: boolean;
  onAdd: () => void;
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
      <div className="flex items-center gap-2">
        {canCreate ? (
          <button type="button" className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700 hover:bg-emerald-100" onClick={onAdd}>
            <Plus className="size-4" />
            إضافة
          </button>
        ) : null}
        {canPrint ? (
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            disabled={rows.length === 0}
            onClick={() =>
              printRtlTable({
                documentTitle: "طباعة الأبواب",
                caption: "جدول الأبواب",
                headers: ["#", ...EXPORT_HEADERS],
                rows: rows.map((r, i) => [String(i + 1), ...rowExportCells(r)]),
              })
            }
          >
            طباعة
          </button>
        ) : null}
        {canExport ? (
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            disabled={rows.length === 0}
            onClick={() =>
              downloadExcelXls({
                filename: "bab.xls",
                sheetName: "bab",
                headers: [...EXPORT_HEADERS],
                rows: rows.map((r) => rowExportCells(r)),
              })
            }
          >
            تصدير XLS
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function BabTable() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isLoading, data, error, isError } = useFetchBab();
  const createMutation = useCreateBab();
  const updateMutation = useUpdateBab();
  const deleteMutation = useDeleteBab();
  const { codeSet } = useSessionPermissions();
  const rows = data ?? [];
  const canCreate = codeSet.has("table.bab.create");
  const canEdit = codeSet.has("table.bab.update");
  const canDelete = codeSet.has("table.bab.delete");
  const canPrint = codeSet.has("table.bab.print");
  const canExport = codeSet.has("table.bab.export");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<BabWithRelations | null>(null);
  const [deletingRow, setDeletingRow] = useState<BabWithRelations | null>(null);
  const columns = useMemo(() => {
    const actionColumn: DataTableColumn<BabWithRelations> = {
      id: "actions",
      header: "الإجراءات",
      className: "w-[112px] min-w-[112px]",
      thClassName: "text-center",
      contentAlign: "center",
      cell: (row) => (
        <div className="flex items-center justify-center gap-1">
          {canEdit ? <button type="button" className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900" onClick={(e) => { e.stopPropagation(); setEditingRow(row); }}><Pencil className="size-4" /></button> : null}
          {canDelete ? <button type="button" className="rounded-md p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={(e) => { e.stopPropagation(); setDeletingRow(row); }}><Trash2 className="size-4" /></button> : null}
        </div>
      ),
      getSortValue: () => "",
    };
    return canEdit || canDelete ? [actionColumn, ...BASE_COLUMNS] : BASE_COLUMNS;
  }, [canEdit, canDelete]);

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
        toolbar={
          <Toolbar
            generalAccountId={id}
            rows={rows}
            canCreate={canCreate}
            canPrint={canPrint}
            canExport={canExport}
            onAdd={() => setIsCreateOpen(true)}
          />
        }
        caption={`الأبواب (الحساب العام ${id})`}
        density="comfortable"
        minTableWidth="100%"
        onRowClick={(row) => {
          const ga = row.general_account_id;
          const q =
            ga != null && String(ga) !== ""
              ? `?ga=${encodeURIComponent(String(ga))}`
              : "";
          navigate(`/settings/band/${row.id}${q}`);
        }}
        rowClassName={() => "cursor-pointer"}
      />
      <BabFormDialog
        open={isCreateOpen}
        mode="create"
        initial={null}
        parentIds={{
          generalAccountId: id ? Number(id) : null,
          accountTypeId: rows[0]?.account_type_id ?? null,
        }}
        isSubmitting={createMutation.isPending}
        onClose={() => setIsCreateOpen(false)}
        onCreate={(input) => createMutation.mutate(input, { onSuccess: () => setIsCreateOpen(false) })}
        onUpdate={() => undefined}
      />
      <BabFormDialog
        open={editingRow != null}
        mode="edit"
        initial={editingRow}
        parentIds={{
          generalAccountId: id ? Number(id) : null,
          accountTypeId: rows[0]?.account_type_id ?? null,
        }}
        isSubmitting={updateMutation.isPending}
        onClose={() => setEditingRow(null)}
        onCreate={() => undefined}
        onUpdate={(payload) => updateMutation.mutate(payload, { onSuccess: () => setEditingRow(null) })}
      />
      <DeleteBabConfirmDialog
        open={deletingRow != null}
        row={deletingRow}
        isSubmitting={deleteMutation.isPending}
        onClose={() => setDeletingRow(null)}
        onConfirm={(rowId) => deleteMutation.mutate(rowId, { onSuccess: () => setDeletingRow(null) })}
      />
    </div>
  );
}
