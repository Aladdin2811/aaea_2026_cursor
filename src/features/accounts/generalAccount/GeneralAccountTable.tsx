import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { type GeneralAccountWithType } from "../../../api/apiGeneralAccount";
import { useSessionPermissions } from "../../permissions/useSessionPermissions";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import { TableStatusBadge } from "../../../components/ui/TableStatusBadge";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import { downloadExcelXls, printRtlTable } from "../../../lib/tableExport";
import { useFetchGeneralAccount } from "./useGeneralAccount";
import {
  useCreateGeneralAccount,
  useDeleteGeneralAccount,
  useUpdateGeneralAccount,
} from "./useGeneralAccount";
import { GeneralAccountFormDialog } from "./GeneralAccountFormDialog";
import { DeleteGeneralAccountConfirmDialog } from "./DeleteGeneralAccountConfirmDialog";

// function accountTypeName(row: GeneralAccountWithType): string {
//   const t = row.account_type;
//   if (t == null) return "";
//   if (Array.isArray(t)) {
//     return stringValue(t[0]?.account_type_name);
//   }
//   return stringValue(t.account_type_name);
// }

const BASE_COLUMNS: DataTableColumn<GeneralAccountWithType>[] = [
  {
    id: "name",
    header: "اسم الحساب العام",
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

const EXPORT_HEADERS = ["اسم الحساب العام", "الكود", "الحالة", "الوصف"] as const;

function rowExportCells(row: GeneralAccountWithType): string[] {
  return [
    formatOptionalText(row.general_account_name),
    formatOptionalText(row.general_account_code),
    row.status ? "مفعل" : "غير مفعل",
    formatOptionalText(row.description),
  ];
}

function BackLinkToolbar({
  rows,
  canCreate,
  canPrint,
  canExport,
  onAdd,
}: {
  rows: GeneralAccountWithType[];
  canCreate: boolean;
  canPrint: boolean;
  canExport: boolean;
  onAdd: () => void;
}): ReactNode {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link
        to="/settings/account_type"
        className="text-sm font-medium text-emerald-800 underline-offset-2 hover:underline"
      >
        ← العودة إلى تصنيف الحسابات
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
                documentTitle: "طباعة الحسابات العامة",
                caption: "جدول الحسابات العامة",
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
                filename: "general_account.xls",
                sheetName: "general_account",
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

export default function GeneralAccountTable() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isLoading, data, error, isError } = useFetchGeneralAccount();
  const createMutation = useCreateGeneralAccount();
  const updateMutation = useUpdateGeneralAccount();
  const deleteMutation = useDeleteGeneralAccount();
  const { codeSet } = useSessionPermissions();
  const rows = data ?? [];
  const canCreate = codeSet.has("table.general_account.create");
  const canEdit = codeSet.has("table.general_account.update");
  const canDelete = codeSet.has("table.general_account.delete");
  const canPrint = codeSet.has("table.general_account.print");
  const canExport = codeSet.has("table.general_account.export");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<GeneralAccountWithType | null>(null);
  const [deletingRow, setDeletingRow] = useState<GeneralAccountWithType | null>(null);
  const columns = useMemo(() => {
    const actionColumn: DataTableColumn<GeneralAccountWithType> = {
      id: "actions",
      header: "الإجراءات",
      className: "w-[112px] min-w-[112px]",
      thClassName: "text-center",
      contentAlign: "center",
      cell: (row) => (
        <div className="flex items-center justify-center gap-1">
          {canEdit ? (
            <button type="button" className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900" onClick={(e) => { e.stopPropagation(); setEditingRow(row); }}><Pencil className="size-4" /></button>
          ) : null}
          {canDelete ? (
            <button type="button" className="rounded-md p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={(e) => { e.stopPropagation(); setDeletingRow(row); }}><Trash2 className="size-4" /></button>
          ) : null}
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
        toolbar={<BackLinkToolbar rows={rows} canCreate={canCreate} canPrint={canPrint} canExport={canExport} onAdd={() => setIsCreateOpen(true)} />}
        caption={`الحسابات العامة (تصنيف رقم ${id})`}
        density="comfortable"
        minTableWidth="100%"
        onRowClick={(row) => {
          navigate(`/settings/bab/${row.id}`);
        }}
        rowClassName={() => "cursor-pointer"}
      />
      <GeneralAccountFormDialog
        open={isCreateOpen}
        mode="create"
        initial={null}
        accountTypeId={id ? Number(id) : null}
        isSubmitting={createMutation.isPending}
        onClose={() => setIsCreateOpen(false)}
        onCreate={(input) => createMutation.mutate(input, { onSuccess: () => setIsCreateOpen(false) })}
        onUpdate={() => undefined}
      />
      <GeneralAccountFormDialog
        open={editingRow != null}
        mode="edit"
        initial={editingRow}
        accountTypeId={id ? Number(id) : null}
        isSubmitting={updateMutation.isPending}
        onClose={() => setEditingRow(null)}
        onCreate={() => undefined}
        onUpdate={(payload) => updateMutation.mutate(payload, { onSuccess: () => setEditingRow(null) })}
      />
      <DeleteGeneralAccountConfirmDialog
        open={deletingRow != null}
        row={deletingRow}
        isSubmitting={deleteMutation.isPending}
        onClose={() => setDeletingRow(null)}
        onConfirm={(rowId) => deleteMutation.mutate(rowId, { onSuccess: () => setDeletingRow(null) })}
      />
    </div>
  );
}
