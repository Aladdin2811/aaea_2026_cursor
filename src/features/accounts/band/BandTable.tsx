import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { type BandWithRelations } from "../../../api/apiBand";
import { useSessionPermissions } from "../../permissions/useSessionPermissions";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import { TableStatusBadge } from "../../../components/ui/TableStatusBadge";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import { downloadExcelXls, printRtlTable } from "../../../lib/tableExport";
import { useFetchBand } from "./useBand";
import { useCreateBand, useDeleteBand, useUpdateBand } from "./useBand";
import { BandFormDialog } from "./BandFormDialog";
import { DeleteBandConfirmDialog } from "./DeleteBandConfirmDialog";

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

/** صف يفتح جدول الأنواع: حالة فعّالة وبدون صرف مباشر */
function isBandRowLinkedToNo3(row: BandWithRelations): boolean {
  return row.status === true && row.directexchange === false;
}

function bandRowNo3To(
  row: BandWithRelations,
  babId: string | undefined,
): string | null {
  if (!isBandRowLinkedToNo3(row)) return null;
  const qs =
    babId != null && babId !== ""
      ? `?bab=${encodeURIComponent(babId)}`
      : "";
  return `/settings/no3/${row.id}${qs}`;
}

function buildBandColumns(
  babId: string | undefined,
  canEdit: boolean,
  canDelete: boolean,
  onEdit: (row: BandWithRelations) => void,
  onDelete: (row: BandWithRelations) => void,
): DataTableColumn<BandWithRelations>[] {
  const cols: DataTableColumn<BandWithRelations>[] = [
  {
    id: "name",
    header: "إسم البند",
    className: "min-w-50",
    thClassName: "!whitespace-normal",
    cell: (row) => {
      const name = stringValue(row.band_name);
      const shown = name.trim() === "" ? "—" : name;
      const label = (
        <span className="block min-w-0 whitespace-normal break-words font-medium leading-snug text-slate-900">
          {shown}
        </span>
      );
      const to = bandRowNo3To(row, babId);
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
    getSortValue: (r) => stringValue(r.band_name),
  },
  {
    id: "code",
    header: "الكود",
    className: "min-w-10",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <span className="block font-mono text-sm tabular-nums text-slate-800 [overflow-wrap:anywhere]">
        {formatOptionalText(row.band_code)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.band_code),
    contentAlign: "center",
  },
  // {
  //   id: "bab",
  //   header: "الباب",
  //   cell: (row) => {
  //     const b = pickEmbed(row.bab);
  //     if (b == null) return <span className="text-slate-400">—</span>;
  //     return (
  //       <div className="text-sm text-slate-700">
  //         <span className="me-1 font-mono text-xs text-slate-500">
  //           {formatOptionalText(b.bab_code)}
  //         </span>
  //         <span>{formatOptionalText(b.bab_name)}</span>
  //       </div>
  //     );
  //   },
  //   getSortValue: (r) => {
  //     const b = pickEmbed(r.bab);
  //     return b ? stringValue(b.bab_code) + stringValue(b.bab_name) : "";
  //   },
  // },
  // {
  //   id: "accountType",
  //   header: "تصنيف الحساب",
  //   cell: (row) => (
  //     <span className="text-slate-700">
  //       {formatOptionalText(
  //         stringValue(pickEmbed(row.account_type)?.account_type_name) || null,
  //       )}
  //     </span>
  //   ),
  //   getSortValue: (r) => stringValue(pickEmbed(r.account_type)?.account_type_name),
  // },
  // {
  //   id: "general",
  //   header: "الحساب العام",
  //   cell: (row) => {
  //     const g = pickEmbed(row.general_account);
  //     if (g == null) return <span className="text-slate-400">—</span>;
  //     return (
  //       <div className="line-clamp-2 text-sm text-slate-700">
  //         <span className="me-1 font-mono text-xs text-slate-500">
  //           {formatOptionalText(g.general_account_code)}
  //         </span>
  //         <span>{formatOptionalText(g.general_account_name)}</span>
  //       </div>
  //     );
  //   },
  //   getSortValue: (r) => {
  //     const g = pickEmbed(r.general_account);
  //     return g
  //       ? `${stringValue(g.general_account_code)} ${stringValue(g.general_account_name)}`
  //       : "";
  //   },
  // },
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
  // {
  //   id: "salaries",
  //   header: <ColHead line1="رواتب" line2="مباشرة" />,
  //   className: "min-w-10",
  //   thClassName: "!whitespace-normal text-center leading-tight",
  //   cell: (row) => <TableStatusBadge value={row.salariesdirectpaid} />,
  //   getSortValue: (r) => (r.salariesdirectpaid ? 1 : 0),
  //   contentAlign: "center",
  // },
  {
    id: "journalShow",
    header: <ColHead line1="يظهر" line2="بالقيد" />,
    className: "min-w-10",
    thClassName: "!whitespace-normal text-center leading-tight",
    cell: (row) => <TableStatusBadge value={row.band_journal_show} />,
    getSortValue: (r) => (r.band_journal_show ? 1 : 0),
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
          {canEdit ? <button type="button" className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900" onClick={(e) => { e.stopPropagation(); onEdit(row); }}><Pencil className="size-4" /></button> : null}
          {canDelete ? <button type="button" className="rounded-md p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={(e) => { e.stopPropagation(); onDelete(row); }}><Trash2 className="size-4" /></button> : null}
        </div>
      ),
      getSortValue: () => "",
    });
  }
  return cols;
}

function Toolbar({
  generalAccountId,
  rows,
  canPrint,
  canExport,
  canCreate,
  onAdd,
}: {
  generalAccountId: string | null;
  rows: BandWithRelations[];
  canPrint: boolean;
  canExport: boolean;
  canCreate: boolean;
  onAdd: () => void;
}): ReactNode {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {generalAccountId != null ? (
        <Link
          to={`/settings/bab/${generalAccountId}`}
          className="text-sm font-medium text-emerald-800 underline-offset-2 hover:underline"
        >
          ← العودة إلى الأبواب
        </Link>
      ) : (
        <span
          className="text-sm text-slate-500"
          title="لم يُعثر على معرّف الحساب العام"
        >
          ← العودة إلى الأبواب
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
                documentTitle: "طباعة البنود",
                caption: "جدول البنود",
                headers: ["#", "اسم البند", "الكود", "الحالة"],
                rows: rows.map((r, i) => [
                  String(i + 1),
                  formatOptionalText(r.band_name),
                  formatOptionalText(r.band_code),
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
                filename: "band.xls",
                sheetName: "band",
                headers: ["اسم البند", "الكود", "الحالة"],
                rows: rows.map((r) => [
                  formatOptionalText(r.band_name),
                  formatOptionalText(r.band_code),
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

export default function BandTable() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { isLoading, data, error, isError } = useFetchBand();
  const createMutation = useCreateBand();
  const updateMutation = useUpdateBand();
  const deleteMutation = useDeleteBand();
  const { codeSet } = useSessionPermissions();
  const rows = useMemo(() => data ?? [], [data]);
  const canCreate = codeSet.has("table.band.create");
  const canEdit = codeSet.has("table.band.update");
  const canDelete = codeSet.has("table.band.delete");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<BandWithRelations | null>(null);
  const [deletingRow, setDeletingRow] = useState<BandWithRelations | null>(null);
  const columns = useMemo(
    () =>
      buildBandColumns(
        id,
        canEdit,
        canDelete,
        (row) => setEditingRow(row),
        (row) => setDeletingRow(row),
      ),
    [id, canEdit, canDelete],
  );
  const canPrint = codeSet.has("table.band.print");
  const canExport = codeSet.has("table.band.export");

  /** رابط /settings/bab/ يتوقع `general_account_id` وليس `bab_id` */
  const generalAccountIdForBabPage = useMemo((): string | null => {
    const fromQuery = searchParams.get("ga");
    if (fromQuery != null && fromQuery !== "") return fromQuery;
    const fromRow = rows.find(
      (r) => r.general_account_id != null,
    )?.general_account_id;
    return fromRow != null ? String(fromRow) : null;
  }, [searchParams, rows]);

  if (id == null || id === "") {
    return (
      <div dir="rtl" className="space-y-3 text-slate-700">
        <p>
          لم يُحدَّد الباب. من جدول الأبواب اختر صفّاً، أو استخدم:
          <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 text-sm">
            /settings/band/رقم_الباب
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
      <DataTable<BandWithRelations>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل بيانات البنود…"
        emptyMessage="لا توجد بنود مسجّلة لهذا الباب."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          <Toolbar
            generalAccountId={generalAccountIdForBabPage}
            rows={rows}
            canCreate={canCreate}
            canPrint={canPrint}
            canExport={canExport}
            onAdd={() => setIsCreateOpen(true)}
          />
        }
        caption={`البنود (الباب ${id})`}
        density="comfortable"
        minTableWidth="100%"
        onRowClick={(row) => {
          const to = bandRowNo3To(row, id);
          if (to != null) navigate(to);
        }}
        rowClassName={(row) =>
          bandRowNo3To(row, id) != null ? "cursor-pointer" : undefined
        }
      />
      <BandFormDialog
        open={isCreateOpen}
        mode="create"
        initial={null}
        parentIds={{
          babId: id ? Number(id) : null,
          generalAccountId: generalAccountIdForBabPage ? Number(generalAccountIdForBabPage) : rows[0]?.general_account_id ?? null,
          accountTypeId: rows[0]?.account_type_id ?? null,
        }}
        isSubmitting={createMutation.isPending}
        onClose={() => setIsCreateOpen(false)}
        onCreate={(input) => createMutation.mutate(input, { onSuccess: () => setIsCreateOpen(false) })}
        onUpdate={() => undefined}
      />
      <BandFormDialog
        open={editingRow != null}
        mode="edit"
        initial={editingRow}
        parentIds={{
          babId: id ? Number(id) : null,
          generalAccountId: generalAccountIdForBabPage ? Number(generalAccountIdForBabPage) : rows[0]?.general_account_id ?? null,
          accountTypeId: rows[0]?.account_type_id ?? null,
        }}
        isSubmitting={updateMutation.isPending}
        onClose={() => setEditingRow(null)}
        onCreate={() => undefined}
        onUpdate={(payload) => updateMutation.mutate(payload, { onSuccess: () => setEditingRow(null) })}
      />
      <DeleteBandConfirmDialog
        open={deletingRow != null}
        row={deletingRow}
        isSubmitting={deleteMutation.isPending}
        onClose={() => setDeletingRow(null)}
        onConfirm={(rowId) => deleteMutation.mutate(rowId, { onSuccess: () => setDeletingRow(null) })}
      />
    </div>
  );
}
