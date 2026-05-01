import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import type { TransfersWithRelations } from "../../../../api/apiTransfers";
import {
  DataTable,
  type DataTableColumn,
} from "../../../../components/ui/data-table";
import { downloadExcelXls, printRtlTable } from "../../../../lib/tableExport";
import {
  firstRelation,
  formatNumeric,
  textOrDash,
  toNumberOrNull,
} from "../../../../lib/tableUtils";
import { useSessionPermissions } from "../../../permissions/useSessionPermissions";
import { useFetchActivYears } from "../../../years/year/useYears";
import { DeleteTransferConfirmDialog } from "./DeleteTransferConfirmDialog";
import { TransferFormDialog } from "./TransferFormDialog";
import {
  useCreateTransfer,
  useDeleteTransfer,
  useFetchTransfers,
  useUpdateTransfer,
} from "./useTransfers";

const TRANSFER_EXPORT_HEADERS = [
  "الباب",
  "البند",
  "النوع",
  "الحساب التفصيلي",
  "منقول منه",
  "منقول إليه",
  "التاريخ",
  "ملاحظات",
] as const;

function rowCellsForExport(row: TransfersWithRelations): string[] {
  return [
    textOrDash(firstRelation(row.bab)?.bab_name),
    textOrDash(firstRelation(row.band)?.band_name),
    textOrDash(firstRelation(row.no3)?.no3_name),
    textOrDash(firstRelation(row.detailed)?.detailed_name),
    formatNumeric(row.transfer_from),
    formatNumeric(row.transfer_to),
    textOrDash(row.transfer_date),
    textOrDash(row.notes),
  ];
}

function exportTransfersToXls(rows: TransfersWithRelations[]): void {
  downloadExcelXls({
    filename: "transfers.xls",
    sheetName: "transfers",
    headers: [...TRANSFER_EXPORT_HEADERS],
    rows: rows.map((row) => rowCellsForExport(row)),
  });
}

function printTransfersTable(rows: TransfersWithRelations[]): void {
  printRtlTable({
    documentTitle: "طباعة المناقلات",
    caption: "جدول المناقلات",
    headers: ["#", ...TRANSFER_EXPORT_HEADERS],
    rows: rows.map((row, idx) => [String(idx + 1), ...rowCellsForExport(row)]),
  });
}

function Toolbar({
  rows,
  n,
  selectedYearId,
  onYearChange,
  onCreate,
  disableCreate,
  canCreate,
  canPrint,
  canExport,
}: {
  rows: TransfersWithRelations[];
  n: number;
  selectedYearId: number | null;
  onYearChange: (id: number | null) => void;
  onCreate: () => void;
  disableCreate: boolean;
  canCreate: boolean;
  canPrint: boolean;
  canExport: boolean;
}): ReactNode {
  const { isLoading: yearsLoading, data: yearsData } = useFetchActivYears();

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <label
          htmlFor="transfers-year-filter"
          className="text-sm text-slate-700"
        >
          السنة:
        </label>
        <select
          id="transfers-year-filter"
          className="min-w-44 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 focus:border-slate-400 focus:outline-none"
          value={selectedYearId ?? ""}
          onChange={(event) => {
            const v = event.target.value;
            onYearChange(v === "" ? null : Number(v));
          }}
          disabled={yearsLoading}
        >
          <option value="">كل السنوات</option>
          {(yearsData ?? []).map((y) => (
            <option key={y.id} value={y.id}>
              {y.year_num && y.year_num.trim() !== ""
                ? y.year_num
                : `سنة #${y.id}`}
            </option>
          ))}
        </select>
      </div>
      <p className="text-sm text-slate-600">
        عدد السجلات:{" "}
        <span className="font-medium tabular-nums text-slate-800">{n}</span>
      </p>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {canPrint ? (
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="طباعة جدول المناقلات"
            disabled={rows.length === 0}
            onClick={() => printTransfersTable(rows)}
          >
            طباعة
          </button>
        ) : null}
        {canExport ? (
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="تصدير جدول المناقلات إلى ملف XLS"
            disabled={rows.length === 0}
            onClick={() => exportTransfersToXls(rows)}
          >
            تصدير XLS
          </button>
        ) : null}
        {canCreate ? (
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disableCreate}
            onClick={onCreate}
          >
            <Plus className="size-4 shrink-0" strokeWidth={1.75} />
            مناقلة جديدة
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function TransfersTable() {
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<TransfersWithRelations | null>(null);
  const [pendingDelete, setPendingDelete] =
    useState<TransfersWithRelations | null>(null);

  const readyToFetch = selectedYearId != null;
  const { createTransfer, isCreating } = useCreateTransfer();
  const { updateTransfer, isUpdating } = useUpdateTransfer();
  const { deleteTransfer, isDeleting } = useDeleteTransfer();
  const { codeSet } = useSessionPermissions();
  const isSubmitting = isCreating || isUpdating;
  const canCreate = codeSet.has("table.transfers.create");
  const canUpdate = codeSet.has("table.transfers.update");
  const canDelete = codeSet.has("table.transfers.delete");
  const canPrint = codeSet.has("table.transfers.print");
  const canExport = codeSet.has("table.transfers.export");

  const filters = useMemo(
    () => (selectedYearId != null ? { year_id: selectedYearId } : undefined),
    [selectedYearId],
  );

  const { isLoading, data, error, isError } = useFetchTransfers(filters, {
    enabled: readyToFetch,
  });
  const rows = useMemo(() => data ?? [], [data]);
  const columns = useMemo<DataTableColumn<TransfersWithRelations>[]>(() => {
    const cols: DataTableColumn<TransfersWithRelations>[] = [];
    if (canUpdate || canDelete) {
      cols.unshift({
        id: "actions",
        header: "إجراءات",
        width: canUpdate && canDelete ? "6.5rem" : "3.75rem",
        minWidth: canUpdate && canDelete ? "6.5rem" : "3.75rem",
        cell: (row) => (
          <div className="flex items-center justify-center gap-1">
            {canUpdate ? (
              <button
                type="button"
                className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/60 hover:text-emerald-800 disabled:opacity-50"
                aria-label="تعديل"
                disabled={isDeleting || isSubmitting}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditing(row);
                  setDialogMode("edit");
                  setDialogOpen(true);
                }}
              >
                <Pencil className="size-4" strokeWidth={1.75} />
              </button>
            ) : null}
            {canDelete ? (
              <button
                type="button"
                className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-red-200 hover:bg-red-50/60 hover:text-red-800 disabled:opacity-50"
                aria-label="حذف"
                disabled={isDeleting || isSubmitting}
                onClick={(e) => {
                  e.stopPropagation();
                  setPendingDelete(row);
                }}
              >
                <Trash2 className="size-4" strokeWidth={1.75} />
              </button>
            ) : null}
          </div>
        ),
        getSortValue: () => 0,
        contentAlign: "center",
      });
    }
    cols.push({
        id: "bab",
        header: "الباب",
        width: "20%",
        minWidth: "180px",
        cell: (row) => (
          <span className="text-slate-800">
            {textOrDash(firstRelation(row.bab)?.bab_name)}
          </span>
        ),
        getSortValue: (row) => firstRelation(row.bab)?.bab_name ?? "",
      },
      {
        id: "band",
        header: "البند",
        width: "20%",
        minWidth: "180px",
        cell: (row) => (
          <span className="text-slate-800">
            {textOrDash(firstRelation(row.band)?.band_name)}
          </span>
        ),
        getSortValue: (row) => firstRelation(row.band)?.band_name ?? "",
      },
      {
        id: "no3",
        header: "النوع",
        width: "20%",
        minWidth: "180px",
        cell: (row) => (
          <span className="text-slate-800">
            {textOrDash(firstRelation(row.no3)?.no3_name)}
          </span>
        ),
        getSortValue: (row) => firstRelation(row.no3)?.no3_name ?? "",
      },
      {
        id: "detailed",
        header: "الحساب التفصيلي",
        width: "20%",
        minWidth: "180px",
        cell: (row) => (
          <span className="text-slate-800">
            {textOrDash(firstRelation(row.detailed)?.detailed_name)}
          </span>
        ),
        getSortValue: (row) => firstRelation(row.detailed)?.detailed_name ?? "",
      },

      {
        id: "transfer_from",
        header: "منقول منه",
        width: "5%",
        minWidth: "100px",
        cell: (row) => (
          <span
            className="block w-full text-right tabular-nums text-slate-800"
            dir="ltr"
          >
            {formatNumeric(row.transfer_from)}
          </span>
        ),
        getSortValue: (row) => toNumberOrNull(row.transfer_from) ?? -Infinity,
        contentAlign: "start",
      },
      {
        id: "transfer_to",
        header: "منقول إليه",
        width: "5%",
        minWidth: "100px",
        cell: (row) => (
          <span
            className="block w-full text-right tabular-nums text-slate-800"
            dir="ltr"
          >
            {formatNumeric(row.transfer_to)}
          </span>
        ),
        getSortValue: (row) => toNumberOrNull(row.transfer_to) ?? -Infinity,
        contentAlign: "start",
      },
      // {
      //   id: "transfer_date",
      //   header: "التاريخ",
      //   width: "8%",
      //   minWidth: "100px",
      //   cell: (row) => (
      //     <span className="text-slate-700">
      //       {textOrDash(row.transfer_date)}
      //     </span>
      //   ),
      //   getSortValue: (row) => row.transfer_date ?? "",
      //   contentAlign: "center",
      // },
      {
        id: "notes",
        header: "ملاحظات",
        width: "12%",
        minWidth: "150px",
        cell: (row) => (
          <span
            className="line-clamp-2 text-slate-700"
            title={textOrDash(row.notes)}
          >
            {textOrDash(row.notes)}
          </span>
        ),
        getSortValue: (row) => row.notes ?? "",
      });
    return cols;
  }, [canDelete, canUpdate, isDeleting, isSubmitting]);

  if (isError) {
    return (
      <p dir="rtl" className="text-destructive" role="alert">
        {error instanceof Error
          ? error.message
          : "حدث خطأ أثناء تحميل بيانات المناقلات"}
      </p>
    );
  }

  return (
    <div className="space-y-2" dir="rtl">
      <DataTable<TransfersWithRelations>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل بيانات المناقلات…"
        emptyMessage={
          !readyToFetch
            ? "اختر السنة أولاً لعرض بيانات المناقلات."
            : "لا توجد بيانات مناقلات للعرض."
        }
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        indexColumnWidth="0.3rem"
        toolbar={
          <Toolbar
            rows={rows}
            n={rows.length}
            selectedYearId={selectedYearId}
            onYearChange={setSelectedYearId}
            onCreate={() => {
              setEditing(null);
              setDialogMode("create");
              setDialogOpen(true);
            }}
            disableCreate={!readyToFetch || isSubmitting}
            canCreate={canCreate}
            canPrint={canPrint}
            canExport={canExport}
          />
        }
        caption="جدول المناقلات"
        density="comfortable"
        minTableWidth="100%"
        maxHeight="70dvh"
        stickyHeader
      />

      <TransferFormDialog
        open={dialogOpen}
        mode={dialogMode}
        initial={editing}
        contextYearId={selectedYearId}
        isSubmitting={isSubmitting}
        onClose={() => {
          if (!isSubmitting) {
            setDialogOpen(false);
            setEditing(null);
          }
        }}
        onCreate={(input) => {
          createTransfer(input, {
            onSuccess: () => {
              setDialogOpen(false);
              setEditing(null);
            },
          });
        }}
        onUpdate={({ id, patch }) => {
          updateTransfer(
            { id, patch },
            {
              onSuccess: () => {
                setDialogOpen(false);
                setEditing(null);
              },
            },
          );
        }}
      />

      {pendingDelete ? (
        <DeleteTransferConfirmDialog
          open
          accountLabel={textOrDash(
            firstRelation(pendingDelete.all_accounts)?.account_name,
          )}
          dateLabel={textOrDash(pendingDelete.transfer_date)}
          isDeleting={isDeleting}
          onCancel={() => {
            if (!isDeleting) setPendingDelete(null);
          }}
          onConfirm={() => {
            deleteTransfer(pendingDelete.id, {
              onSuccess: () => {
                setPendingDelete(null);
              },
            });
          }}
        />
      ) : null}
    </div>
  );
}
