import { Pencil, Plus, Trash2, type LucideIcon } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { type MemberRow } from "../../../api/apiMembers";
import { DataTable, type DataTableColumn } from "../../../components/ui/data-table";
import { TableStatusBadge } from "../../../components/ui/TableStatusBadge";
import { downloadExcelXls, printRtlTable } from "../../../lib/tableExport";
import { useSessionPermissions } from "../../permissions/useSessionPermissions";
import { DeleteMemberConfirmDialog } from "./DeleteMemberConfirmDialog";
import { MemberFormDialog } from "./MemberFormDialog";
import {
  useCreateMember,
  useDeleteMember,
  useFetchAllMembers,
  useUpdateMember,
} from "./useMembers";

function sortNumericField(v: string | number | null | undefined): number {
  if (v == null || v === "") return -Infinity;
  const n = typeof v === "string" ? Number.parseFloat(v) : v;
  return Number.isFinite(n) ? n : -Infinity;
}

function buildColumns({
  canUpdate,
  canDelete,
  isMutating,
  onEdit,
  onDelete,
}: {
  canUpdate: boolean;
  canDelete: boolean;
  isMutating: boolean;
  onEdit: (row: MemberRow) => void;
  onDelete: (row: MemberRow) => void;
}): DataTableColumn<MemberRow>[] {
  const cols: DataTableColumn<MemberRow>[] = [
    {
      id: "name",
      header: "الدولة",
      cell: (row) => (
        <span className="min-w-0 font-medium text-slate-900">{row.member_name ?? "—"}</span>
      ),
      getSortValue: (r) => r.member_name ?? "",
    },
    {
      id: "flag",
      header: "العلم",
      cell: (row) => <FlagCell value={row.flag} />,
      getSortValue: (r) => r.flag ?? "",
      contentAlign: "center",
      className: "w-20 min-w-20",
    },
    {
      id: "ratio",
      header: "نسبة المساهمة",
      cell: (row) => (
        <span className="tabular-nums text-slate-800">{row.member_ratio ?? "—"}</span>
      ),
      getSortValue: (r) => sortNumericField(r.member_ratio),
      contentAlign: "end",
    },
    {
      id: "reservation",
      header: "نسبة متحفظ عليها",
      cell: (row) => <span className="tabular-nums">{row.reservation_ratio ?? "—"}</span>,
      getSortValue: (r) => sortNumericField(r.reservation_ratio),
      contentAlign: "end",
    },
    {
      id: "org",
      header: "عضو بالهيئة",
      cell: (row) => (
        <TableStatusBadge
          value={row.org_member}
          activeLabel="عضو بالهيئة"
          inactiveLabel="ليس عضواً"
        />
      ),
      getSortValue: (r) => (r.org_member ? 1 : 0),
      contentAlign: "center",
    },
    {
      id: "notes",
      header: "ملاحظات",
      cell: (row) => <span className="text-slate-600">{row.member_notes || "—"}</span>,
      getSortValue: (r) => r.member_notes ?? "",
      className: "min-w-48",
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

function FlagCell({ value }: { value: string | null }) {
  if (value == null || value === "") {
    return <span className="text-slate-400">—</span>;
  }
  const trimmed = value.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
    return (
      <img
        src={trimmed}
        alt=""
        className="inline-block h-6 max-w-10 rounded-sm object-cover shadow-sm"
        loading="lazy"
        decoding="async"
      />
    );
  }
  return (
    <span className="text-xl leading-none" title={trimmed}>
      {trimmed}
    </span>
  );
}

function ToolbarCount({ n }: { n: number }): ReactNode {
  return (
    <p className="text-sm text-slate-600">
      عدد السجلات: <span className="font-medium tabular-nums text-slate-800">{n}</span>
    </p>
  );
}

const EXPORT_HEADERS = ["الدولة", "نسبة المساهمة", "الحالة"] as const;

function rowExportCells(row: MemberRow): string[] {
  return [
    row.member_name ?? "—",
    row.member_ratio == null ? "—" : String(row.member_ratio),
    row.status ? "مفعل" : "غير مفعل",
  ];
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

export default function MembersTable() {
  const { isLoading, data, error, isError } = useFetchAllMembers();
  const { createMember, isCreating } = useCreateMember();
  const { updateMember, isUpdating } = useUpdateMember();
  const { deleteMember, isDeleting } = useDeleteMember();
  const { codeSet, isLoading: permissionsLoading } = useSessionPermissions();
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<MemberRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const rows = data ?? [];
  const canCreate = codeSet.has("table.members.create");
  const canUpdate = codeSet.has("table.members.update");
  const canDelete = codeSet.has("table.members.delete");
  const canPrint = codeSet.has("table.members.print");
  const canExport = codeSet.has("table.members.export");
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
                    documentTitle: "طباعة الدول الأعضاء",
                    caption: "جدول الدول الأعضاء",
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
                    filename: "members.xls",
                    sheetName: "members",
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
      <DataTable<MemberRow>
        data={rows}
        columns={columns}
        isLoading={isLoading || permissionsLoading}
        loadingMessage="جاري تحميل بيانات الدول الأعضاء بجامعة الدول العربية…"
        emptyMessage="لا توجد بيانات أعضاء للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={toolbar}
        caption="جدول الدول الأعضاء"
        density="comfortable"
        minTableWidth="100%"
      />
      <MemberFormDialog
        open={formOpen}
        mode={formMode}
        initial={formMode === "edit" ? selected : null}
        isSubmitting={isMutating}
        onClose={() => {
          if (isMutating) return;
          setFormOpen(false);
        }}
        onCreate={(input) => {
          createMember(input, {
            onSuccess: () => {
              setFormOpen(false);
            },
          });
        }}
        onUpdate={(payload) => {
          updateMember(payload, {
            onSuccess: () => {
              setFormOpen(false);
            },
          });
        }}
      />
      <DeleteMemberConfirmDialog
        open={deleteOpen}
        row={selected}
        isDeleting={isDeleting}
        onCancel={() => {
          if (isDeleting) return;
          setDeleteOpen(false);
        }}
        onConfirm={() => {
          if (!selected) return;
          deleteMember(selected.id, {
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
