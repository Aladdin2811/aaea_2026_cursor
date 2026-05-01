import { Pencil, Plus, Trash2, type LucideIcon } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { type AccountTypeRow } from "../../../api/apiAccountType";
import { useSessionPermissions } from "../../permissions/useSessionPermissions";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import { TableStatusBadge } from "../../../components/ui/TableStatusBadge";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import { downloadExcelXls, printRtlTable } from "../../../lib/tableExport";
import {
  useCreateAccountType,
  useDeleteAccountType,
  useFetchAccountType,
  useUpdateAccountType,
} from "./useAccountType";
import { AccountTypeFormDialog } from "./AccountTypeFormDialog";
import { DeleteAccountTypeConfirmDialog } from "./DeleteAccountTypeConfirmDialog";

function buildColumns({
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
  isMutating,
}: {
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: (row: AccountTypeRow) => void;
  onDelete: (row: AccountTypeRow) => void;
  isMutating: boolean;
}): DataTableColumn<AccountTypeRow>[] {
  const cols: DataTableColumn<AccountTypeRow>[] = [
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

  if (canUpdate || canDelete) {
    cols.unshift({
      id: "actions",
      header: "الإجراءات",
      sortable: false,
      className: "w-28 min-w-28",
      contentAlign: "center",
      cell: (row) => (
        <div className="flex items-center justify-center gap-2">
          {canUpdate ? (
            <IconActionButton
              label="تعديل"
              icon={Pencil}
              tone="neutral"
              disabled={isMutating}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(row);
              }}
            />
          ) : null}
          {canDelete ? (
            <IconActionButton
              label="حذف"
              icon={Trash2}
              tone="danger"
              disabled={isMutating}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(row);
              }}
            />
          ) : null}
        </div>
      ),
    });
  }

  return cols;
}

function ToolbarCount({ n }: { n: number }): ReactNode {
  return (
    <p className="text-sm text-slate-600">
      عدد التصنيفات:{" "}
      <span className="font-medium tabular-nums text-slate-800">{n}</span>
    </p>
  );
}

const EXPORT_HEADERS = ["نوع الحساب", "الحالة"] as const;

function rowExportCells(row: AccountTypeRow): string[] {
  return [formatOptionalText(row.account_type_name), row.status ? "مفعل" : "غير مفعل"];
}

function IconActionButton({
  label,
  icon: Icon,
  tone,
  disabled,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  tone: "neutral" | "danger";
  disabled?: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}) {
  const toneClass =
    tone === "danger"
      ? "border-rose-200 text-rose-700 hover:bg-rose-50"
      : "border-slate-200 text-slate-700 hover:bg-slate-50";
  return (
    <button
      type="button"
      className={`inline-flex size-8 items-center justify-center rounded-lg border bg-white transition ${toneClass} disabled:opacity-50`}
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon className="size-4" strokeWidth={1.8} />
    </button>
  );
}

export default function AccountTypeTable() {
  const navigate = useNavigate();
  const { isLoading, data, error, isError } = useFetchAccountType();
  const { createAccountType, isCreating } = useCreateAccountType();
  const { updateAccountType, isUpdating } = useUpdateAccountType();
  const { deleteAccountType, isDeleting } = useDeleteAccountType();
  const { codeSet, isLoading: permissionsLoading } = useSessionPermissions();
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<AccountTypeRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const rows = data ?? [];
  const canCreate = codeSet.has("table.account_type.create");
  const canUpdate = codeSet.has("table.account_type.update");
  const canDelete = codeSet.has("table.account_type.delete");
  const canPrint = codeSet.has("table.account_type.print");
  const canExport = codeSet.has("table.account_type.export");
  const canManage = canUpdate || canDelete;
  const isMutating = isCreating || isUpdating || isDeleting;
  const columns = buildColumns({
    canUpdate,
    canDelete,
    isMutating,
    onEdit: (row) => {
      setSelected(row);
      setFormMode("edit");
      setFormOpen(true);
    },
    onDelete: (row) => {
      setSelected(row);
      setDeleteOpen(true);
    },
  });
  const toolbar = useMemo(
    () =>
      !isLoading && rows.length > 0 ? (
        <div className="flex w-full items-center justify-between gap-3">
          <ToolbarCount n={rows.length} />
          <div className="flex items-center gap-2">
            {canPrint ? (
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                disabled={rows.length === 0}
                onClick={() =>
                  printRtlTable({
                    documentTitle: "طباعة أنواع الحسابات",
                    caption: "جدول أنواع الحسابات",
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
                    filename: "account_type.xls",
                    sheetName: "account_type",
                    headers: [...EXPORT_HEADERS],
                    rows: rows.map((r) => rowExportCells(r)),
                  })
                }
              >
                تصدير XLS
              </button>
            ) : null}
            {canCreate ? (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                disabled={isMutating}
                onClick={() => {
                  setSelected(null);
                  setFormMode("create");
                  setFormOpen(true);
                }}
              >
                <Plus className="size-4" />
                <span>إضافة</span>
              </button>
            ) : null}
          </div>
        </div>
      ) : null,
    [canCreate, canExport, canPrint, isLoading, isMutating, rows],
  );

  if (isError) {
    return (
      <p dir="rtl" className="text-destructive" role="alert">
        {error instanceof Error ? error.message : "حدث خطأ أثناء التحميل"}
      </p>
    );
  }

  return (
    <div className="space-y-2" dir="rtl">
      {!permissionsLoading && !canManage ? (
        <p className="text-sm text-slate-600">لديك صلاحية عرض فقط لهذه الصفحة.</p>
      ) : null}
      <DataTable<AccountTypeRow>
        data={rows}
        columns={columns}
        isLoading={isLoading || permissionsLoading}
        loadingMessage="جاري تحميل تصنيفات الحسابات…"
        emptyMessage="لا توجد تصنيفات حسابات للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={toolbar}
        caption="جدول تصنيفات الحسابات"
        density="comfortable"
        minTableWidth="100%"
        onRowClick={(row) => {
          navigate(`/settings/general_account/${row.id}`);
        }}
        rowClassName={() => "cursor-pointer"}
      />
      <AccountTypeFormDialog
        open={formOpen}
        mode={formMode}
        initial={formMode === "edit" ? selected : null}
        isSubmitting={isMutating}
        onClose={() => {
          if (isMutating) return;
          setFormOpen(false);
        }}
        onCreate={(input) => {
          createAccountType(input, {
            onSuccess: () => {
              setFormOpen(false);
            },
          });
        }}
        onUpdate={(payload) => {
          updateAccountType(payload, {
            onSuccess: () => {
              setFormOpen(false);
            },
          });
        }}
      />
      <DeleteAccountTypeConfirmDialog
        open={deleteOpen}
        row={selected}
        isDeleting={isDeleting}
        onCancel={() => {
          if (isDeleting) return;
          setDeleteOpen(false);
        }}
        onConfirm={() => {
          if (!selected) return;
          deleteAccountType(selected.id, {
            onSuccess: () => {
              setDeleteOpen(false);
              setSelected(null);
            },
          });
        }}
      />
    </div>
  );
}
