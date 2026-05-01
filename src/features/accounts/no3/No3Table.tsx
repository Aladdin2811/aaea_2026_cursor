import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { type No3WithRelations } from "../../../api/apiNo3";
import { useSessionPermissions } from "../../permissions/useSessionPermissions";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import { TableStatusBadge } from "../../../components/ui/TableStatusBadge";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import { downloadExcelXls, printRtlTable } from "../../../lib/tableExport";
import { useFetchNo3 } from "./useNo3";
import {
  useCreateNo3,
  useDeleteNo3,
  useUpdateNo3,
} from "./useNo3";
import { No3FormDialog } from "./No3FormDialog";
import { DeleteNo3ConfirmDialog } from "./DeleteNo3ConfirmDialog";

/** رأس عمود على سطرين (مناسب للعناوين الطويلة) */
function ColHead({
  line1,
  line2,
}: {
  line1: string;
  line2: string;
}): ReactNode {
  return (
    <span className="inline-block w-full min-w-0 text-center text-[0.7rem] font-semibold leading-[1.2] sm:text-xs">
      <span className="block">{line1}</span>
      <span className="block">{line2}</span>
    </span>
  );
}

/** صف يفتح الحسابات التفصيلية: حالة فعّالة وبدون صرف مباشر */
function isNo3RowLinkedToDetailed(row: No3WithRelations): boolean {
  return row.status === true && row.directexchange === false;
}

function no3RowDetailedTo(
  row: No3WithRelations,
  bandId: string | undefined,
  babId: string | null,
): string | null {
  if (!isNo3RowLinkedToDetailed(row)) return null;
  const params = new URLSearchParams();
  if (bandId != null && bandId !== "") params.set("band", bandId);
  if (babId != null && babId !== "") params.set("bab", babId);
  const qs = params.toString();
  return qs.length > 0
    ? `/settings/detailed/${row.id}?${qs}`
    : `/settings/detailed/${row.id}`;
}

function buildNo3Columns(
  bandId: string | undefined,
  babId: string | null,
  canEdit: boolean,
  canDelete: boolean,
  onEdit: (row: No3WithRelations) => void,
  onDelete: (row: No3WithRelations) => void,
): DataTableColumn<No3WithRelations>[] {
  const cols: DataTableColumn<No3WithRelations>[] = [
  {
    id: "name",
    header: "إسم النوع",
    className: "min-w-50",
    thClassName: "!whitespace-normal",
    cell: (row) => {
      const name = stringValue(row.no3_name);
      const shown = name.trim() === "" ? "—" : name;
      const label = (
        <span className="block min-w-0 whitespace-normal break-words font-medium leading-snug text-slate-900">
          {shown}
        </span>
      );
      const to = no3RowDetailedTo(row, bandId, babId);
      if (to == null) return label;
      return (
        <Link
          to={to}
          className="block min-w-0 text-inherit no-underline visited:no-underline outline-none hover:no-underline focus-visible:no-underline"
          onClick={(e) => e.stopPropagation()}
        >
          {label}
        </Link>
      );
    },
    getSortValue: (r) => stringValue(r.no3_name),
  },
  {
    id: "code",
    header: "الكود",
    className: "min-w-10",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <span className="block font-mono text-sm tabular-nums text-slate-800 [overflow-wrap:anywhere]">
        {formatOptionalText(row.no3_code)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.no3_code),
    contentAlign: "center",
  },
  {
    id: "havebudget",
    header: <ColHead line1="له" line2="موازنة" />,
    className: "min-w-10",
    thClassName: "!whitespace-normal text-center leading-tight",
    cell: (row) => <TableStatusBadge value={row.havebudget} />,
    getSortValue: (r) => (r.havebudget ? 1 : 0),
    contentAlign: "center",
  },
  {
    id: "haveprograms",
    header: <ColHead line1="له" line2="برامج" />,
    className: "min-w-10",
    thClassName: "!whitespace-normal text-center leading-tight",
    cell: (row) => <TableStatusBadge value={row.haveprograms} />,
    getSortValue: (r) => (r.haveprograms ? 1 : 0),
    contentAlign: "center",
  },
  {
    id: "directexchange",
    header: <ColHead line1="صرف" line2="مباشر" />,
    className: "min-w-10",
    thClassName: "!whitespace-normal text-center leading-tight",
    cell: (row) => <TableStatusBadge value={row.directexchange} />,
    getSortValue: (r) => (r.directexchange ? 1 : 0),
    contentAlign: "center",
  },
  {
    id: "journalShow",
    header: <ColHead line1="يظهر" line2="بالقيد" />,
    className: "min-w-10",
    thClassName: "!whitespace-normal text-center leading-tight",
    cell: (row) => <TableStatusBadge value={row.no3_journal_show} />,
    getSortValue: (r) => (r.no3_journal_show ? 1 : 0),
    contentAlign: "center",
  },
  {
    id: "status",
    header: "الحالة",
    className: "min-w-10",
    thClassName: "!whitespace-normal text-center leading-tight",
    cell: (row) => <TableStatusBadge value={row.status} />,
    getSortValue: (r) => stringValue(r.status),
    contentAlign: "center",
  },
  {
    id: "description",
    header: "الوصف",
    className: "min-w-40 max-w-sm",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="min-w-0 text-xs leading-snug text-slate-600 [overflow-wrap:anywhere] [word-break:break-word]">
        {formatOptionalText(row.description)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.description),
  },
  ];
  if (canEdit || canDelete) {
    cols.unshift({
      id: "actions",
      header: "الإجراءات",
      className: "w-[112px] min-w-[112px]",
      thClassName: "text-center",
      contentAlign: "center",
      cell: (row) => (
        <div className="flex items-center justify-center gap-1">
          {canEdit ? (
            <button
              type="button"
              className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(row);
              }}
              aria-label="تعديل"
              title="تعديل"
            >
              <Pencil className="size-4" />
            </button>
          ) : null}
          {canDelete ? (
            <button
              type="button"
              className="rounded-md p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(row);
              }}
              aria-label="حذف"
              title="حذف"
            >
              <Trash2 className="size-4" />
            </button>
          ) : null}
        </div>
      ),
      getSortValue: () => "",
    });
  }
  return cols;
}

function Toolbar({
  babIdForBandPage,
  rows,
  canPrint,
  canExport,
  canCreate,
  onAdd,
}: {
  babIdForBandPage: string | null;
  rows: No3WithRelations[];
  canPrint: boolean;
  canExport: boolean;
  canCreate: boolean;
  onAdd: () => void;
}): ReactNode {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {babIdForBandPage != null ? (
        <Link
          to={`/settings/band/${babIdForBandPage}`}
          className="text-sm font-medium text-emerald-800 underline-offset-2 hover:underline"
        >
          ← العودة إلى البنود
        </Link>
      ) : (
        <span
          className="text-sm text-slate-500"
          title="لم يُعثر على معرّف الباب"
        >
          ← العودة إلى البنود
        </span>
      )}
      <Link
        to="/settings/account_type"
        className="text-sm text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
      >
        تصنيف الحسابات
      </Link>
      <div className="flex items-center gap-2">
        {canCreate ? (
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700 hover:bg-emerald-100"
            onClick={onAdd}
          >
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
                documentTitle: "طباعة الأنواع",
                caption: "جدول الأنواع",
                headers: ["#", "اسم النوع", "الكود", "الحالة"],
                rows: rows.map((r, i) => [
                  String(i + 1),
                  formatOptionalText(r.no3_name),
                  formatOptionalText(r.no3_code),
                  r.status ? "مفعل" : "غير مفعل",
                ]),
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
                filename: "no3.xls",
                sheetName: "no3",
                headers: ["اسم النوع", "الكود", "الحالة"],
                rows: rows.map((r) => [
                  formatOptionalText(r.no3_name),
                  formatOptionalText(r.no3_code),
                  r.status ? "مفعل" : "غير مفعل",
                ]),
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

export default function No3Table() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { isLoading, data, error, isError } = useFetchNo3();
  const createMutation = useCreateNo3();
  const updateMutation = useUpdateNo3();
  const deleteMutation = useDeleteNo3();
  const { codeSet } = useSessionPermissions();
  const rows = useMemo(() => data ?? [], [data]);
  const canCreate = codeSet.has("table.no3.create");
  const canEdit = codeSet.has("table.no3.update");
  const canDelete = codeSet.has("table.no3.delete");
  const canPrint = codeSet.has("table.no3.print");
  const canExport = codeSet.has("table.no3.export");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<No3WithRelations | null>(null);
  const [deletingRow, setDeletingRow] = useState<No3WithRelations | null>(null);

  /** `/settings/band/:id` يتوقع `bab_id` */
  const babIdForBandPage = useMemo((): string | null => {
    const fromQuery = searchParams.get("bab");
    if (fromQuery != null && fromQuery !== "") return fromQuery;
    const fromRow = rows.find((r) => r.bab_id != null)?.bab_id;
    return fromRow != null ? String(fromRow) : null;
  }, [searchParams, rows]);

  const columns = useMemo(
    () =>
      buildNo3Columns(
        id,
        babIdForBandPage,
        canEdit,
        canDelete,
        (row) => setEditingRow(row),
        (row) => setDeletingRow(row),
      ),
    [id, babIdForBandPage, canEdit, canDelete],
  );

  if (id == null || id === "") {
    return (
      <div dir="rtl" className="space-y-3 text-slate-700">
        <p>
          لم يُحدَّد البند. من جدول البنود اختر صفّاً، أو استخدم:
          <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 text-sm">
            /settings/no3/رقم_البند
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
      <DataTable<No3WithRelations>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل بيانات الأنواع…"
        emptyMessage="لا توجد أنواع مسجّلة لهذا البند."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          <Toolbar
            babIdForBandPage={babIdForBandPage}
            rows={rows}
            canCreate={canCreate}
            canPrint={canPrint}
            canExport={canExport}
            onAdd={() => setIsCreateOpen(true)}
          />
        }
        caption={`الأنواع (البند ${id})`}
        density="comfortable"
        minTableWidth="100%"
        onRowClick={(row) => {
          const to = no3RowDetailedTo(row, id, babIdForBandPage);
          if (to != null) navigate(to);
        }}
        rowClassName={(row) =>
          no3RowDetailedTo(row, id, babIdForBandPage) != null
            ? "cursor-pointer"
            : undefined
        }
      />
      <No3FormDialog
        open={isCreateOpen}
        mode="create"
        initial={null}
        bandId={id ? Number(id) : null}
        babId={babIdForBandPage ? Number(babIdForBandPage) : null}
        isSubmitting={createMutation.isPending}
        onClose={() => setIsCreateOpen(false)}
        onCreate={(input) => {
          createMutation.mutate(input, {
            onSuccess: () => setIsCreateOpen(false),
          });
        }}
        onUpdate={() => undefined}
      />
      <No3FormDialog
        open={editingRow != null}
        mode="edit"
        initial={editingRow}
        bandId={id ? Number(id) : null}
        babId={babIdForBandPage ? Number(babIdForBandPage) : null}
        isSubmitting={updateMutation.isPending}
        onClose={() => setEditingRow(null)}
        onCreate={() => undefined}
        onUpdate={(payload) => {
          updateMutation.mutate(payload, {
            onSuccess: () => setEditingRow(null),
          });
        }}
      />
      <DeleteNo3ConfirmDialog
        open={deletingRow != null}
        row={deletingRow}
        isSubmitting={deleteMutation.isPending}
        onClose={() => setDeletingRow(null)}
        onConfirm={(rowId) => {
          deleteMutation.mutate(rowId, {
            onSuccess: () => setDeletingRow(null),
          });
        }}
      />
    </div>
  );
}
