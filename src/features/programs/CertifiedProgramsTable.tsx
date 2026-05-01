import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import type { CertifiedProgramWithRelations } from "../../api/apiCertifiedPrograms";
import { Spinner } from "../../components/ui/Spinner";
import {
  DataTable,
  type DataTableColumn,
} from "../../components/ui/data-table";
import { formatOptionalText, stringValue } from "../../lib/displayValue";
import { downloadExcelXls, printRtlTable } from "../../lib/tableExport";
import { useSessionPermissions } from "../permissions/useSessionPermissions";
import { CertifiedProgramFormDialog } from "./CertifiedProgramFormDialog";
import { DeleteCertifiedProgramConfirmDialog } from "./DeleteCertifiedProgramConfirmDialog";
import {
  useCreateCertifiedProgram,
  useDeleteCertifiedProgram,
  useFetchCertifiedPrograms,
  useUpdateCertifiedProgram,
} from "./useCertifiedPrograms";

type Props = {
  yearId: number | null;
  /** انتظار تحميل السنة الحالية من الإعدادات */
  loadingYearContext?: boolean;
};

function yearCellLabel(row: CertifiedProgramWithRelations): string {
  const y = row.years?.year_num;
  if (y != null && String(y).trim() !== "") return String(y);
  return row.year_id != null ? `#${row.year_id}` : "—";
}

function no3CellLabel(row: CertifiedProgramWithRelations): string {
  const parts = [row.no3?.no3_name, row.no3?.no3_code].filter(
    (x) => x != null && String(x).trim() !== "",
  ) as string[];
  if (parts.length) return parts.join(" — ");
  return row.no3_id != null ? `#${row.no3_id}` : "—";
}

function detailedCellLabel(row: CertifiedProgramWithRelations): string {
  const parts = [row.detailed?.detailed_name, row.detailed?.detailed_code].filter(
    (x) => x != null && String(x).trim() !== "",
  ) as string[];
  if (parts.length) return parts.join(" — ");
  return row.detailed_id != null ? `#${row.detailed_id}` : "—";
}

function ToolbarCount({ n }: { n: number }): ReactNode {
  return (
    <p className="text-sm text-slate-600">
      عدد الأنشطة لهذه السنة:{" "}
      <span className="font-medium tabular-nums text-slate-800">{n}</span>
    </p>
  );
}
const EXPORT_HEADERS = [
  "المعرف",
  "البرنامج / النشاط",
  "الأهداف",
  "السنة",
  "النوع",
  "التفصيلي",
] as const;

export default function CertifiedProgramsTable({
  yearId,
  loadingYearContext = false,
}: Props) {
  const { isLoading, isFetching, data, error, isError } =
    useFetchCertifiedPrograms(yearId);
  const { createCertifiedProgram, isCreating } = useCreateCertifiedProgram();
  const { updateCertifiedProgram, isUpdating } = useUpdateCertifiedProgram();
  const { deleteCertifiedProgram, isDeleting } = useDeleteCertifiedProgram();
  const { codeSet } = useSessionPermissions();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<CertifiedProgramWithRelations | null>(
    null,
  );
  const [pendingDelete, setPendingDelete] =
    useState<CertifiedProgramWithRelations | null>(null);

  const rows = useMemo(() => data ?? [], [data]);
  const isSubmitting = isCreating || isUpdating;
  const canCreate = codeSet.has("table.certified_programs.create");
  const canUpdate = codeSet.has("table.certified_programs.update");
  const canDelete = codeSet.has("table.certified_programs.delete");
  const canPrint = codeSet.has("table.certified_programs.print");
  const canExport = codeSet.has("table.certified_programs.export");
  const listLoading = Boolean(yearId) && (isLoading || isFetching);

  const columns = useMemo<DataTableColumn<CertifiedProgramWithRelations>[]>(
    () => {
      const cols: DataTableColumn<CertifiedProgramWithRelations>[] = [
      {
        id: "id",
        header: "المعرّف",
        className: "w-20 min-w-20",
        thClassName: "!whitespace-normal text-center",
        cell: (row) => (
          <span className="tabular-nums text-sm text-slate-600">{row.id}</span>
        ),
        getSortValue: (r) => r.id,
        contentAlign: "center",
      },
      {
        id: "program_name",
        header: "اسم البرنامج / النشاط",
        className: "min-w-44 max-w-[14rem]",
        thClassName: "!whitespace-normal",
        cell: (row) => (
          <span className="block min-w-0 font-semibold text-slate-900">
            {formatOptionalText(row.program_name)}
          </span>
        ),
        getSortValue: (r) => stringValue(r.program_name),
      },
      {
        id: "objectives",
        header: "الأهداف",
        className: "min-w-48 max-w-md",
        thClassName: "!whitespace-normal",
        cell: (row) => (
          <span
            className="block min-w-0 whitespace-normal break-words text-sm leading-relaxed text-slate-700 line-clamp-3"
            title={row.objectives ?? undefined}
          >
            {formatOptionalText(row.objectives)}
          </span>
        ),
        getSortValue: (r) => stringValue(r.objectives),
      },
      {
        id: "year",
        header: "السنة المحاسبية",
        className: "min-w-32",
        thClassName: "!whitespace-normal",
        cell: (row) => (
          <span className="block min-w-0 text-sm text-slate-800" title={yearCellLabel(row)}>
            {yearCellLabel(row)}
          </span>
        ),
        getSortValue: (r) => stringValue(r.years?.year_num ?? r.year_id),
      },
      {
        id: "no3",
        header: "النوع (no3)",
        className: "min-w-36 max-w-[12rem]",
        thClassName: "!whitespace-normal",
        cell: (row) => (
          <span className="block min-w-0 truncate text-sm text-slate-800" title={no3CellLabel(row)}>
            {no3CellLabel(row)}
          </span>
        ),
        getSortValue: (r) => stringValue(r.no3?.no3_name ?? r.no3_id),
      },
      {
        id: "detailed",
        header: "التفصيلي",
        className: "min-w-36 max-w-[12rem]",
        thClassName: "!whitespace-normal",
        cell: (row) => (
          <span
            className="block min-w-0 truncate text-sm text-slate-800"
            title={detailedCellLabel(row)}
          >
            {detailedCellLabel(row)}
          </span>
        ),
        getSortValue: (r) => stringValue(r.detailed?.detailed_name ?? r.detailed_id),
      },
    ];
      if (canUpdate || canDelete) {
        cols.unshift({
          id: "actions",
          header: "إجراءات",
          className:
            canUpdate && canDelete ? "min-w-[6.5rem] w-[6.5rem]" : "min-w-[3.75rem] w-[3.75rem]",
          thClassName: "!whitespace-normal text-center",
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
      return cols;
    },
    [canDelete, canUpdate, isDeleting, isSubmitting],
  );

  if (loadingYearContext && yearId == null) {
    return (
      <div className="flex min-h-[12rem] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/40" dir="rtl">
        <Spinner size="lg" />
        <p className="text-sm text-slate-600">جاري تحديد السنة المحاسبية…</p>
      </div>
    );
  }

  if (yearId == null) {
    return (
      <div
        className="rounded-2xl border border-amber-200/80 bg-amber-50/50 px-4 py-5 text-center text-sm text-amber-950"
        dir="rtl"
        role="status"
      >
        اختر <strong>السنة المحاسبية</strong> من القائمة أعلاه لعرض الأنشطة المعتمدة المرتبطة بها ولإضافة نشاط جديد ضمن تلك السنة.
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
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {!listLoading && rows.length > 0 ? <ToolbarCount n={rows.length} /> : <span />}
        <div className="flex items-center gap-2">
          {canPrint ? (
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              disabled={rows.length === 0}
              onClick={() =>
                printRtlTable({
                  documentTitle: "طباعة الأنشطة المعتمدة",
                  caption: "جدول الأنشطة المعتمدة",
                  headers: ["#", ...EXPORT_HEADERS],
                  rows: rows.map((r, i) => [
                    String(i + 1),
                    String(r.id),
                    formatOptionalText(r.program_name),
                    formatOptionalText(r.objectives),
                    yearCellLabel(r),
                    no3CellLabel(r),
                    detailedCellLabel(r),
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
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              disabled={rows.length === 0}
              onClick={() =>
                downloadExcelXls({
                  filename: "certified_programs.xls",
                  sheetName: "certified_programs",
                  headers: [...EXPORT_HEADERS],
                  rows: rows.map((r) => [
                    String(r.id),
                    formatOptionalText(r.program_name),
                    formatOptionalText(r.objectives),
                    yearCellLabel(r),
                    no3CellLabel(r),
                    detailedCellLabel(r),
                  ]),
                })
              }
            >
              تصدير XLS
            </button>
          ) : null}
          {canCreate ? (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
              disabled={!yearId || isSubmitting}
              title={!yearId ? "اختر سنة محاسبية أولاً" : undefined}
              onClick={() => {
                setEditing(null);
                setDialogMode("create");
                setDialogOpen(true);
              }}
            >
              <Plus className="size-5 shrink-0" strokeWidth={1.75} />
              نشاط معتمد جديد
            </button>
          ) : null}
        </div>
      </div>

      <DataTable<CertifiedProgramWithRelations>
        data={rows}
        columns={columns}
        isLoading={listLoading}
        loadingMessage="جاري تحميل الأنشطة المعتمدة لهذه السنة…"
        emptyMessage="لا توجد أنشطة معتمدة مسجّلة لهذه السنة. استخدم «نشاط معتمد جديد» للإضافة."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        caption="جدول الأنشطة المعتمدة حسب السنة"
        density="comfortable"
        minTableWidth="100%"
        maxHeight="min(70vh, 36rem)"
        stickyHeader
      />

      <CertifiedProgramFormDialog
        open={dialogOpen}
        mode={dialogMode}
        initial={editing}
        contextYearId={yearId}
        isSubmitting={isSubmitting}
        onClose={() => {
          if (!isSubmitting) {
            setDialogOpen(false);
            setEditing(null);
          }
        }}
        onSubmit={(payload) => {
          if (dialogMode === "create") {
            createCertifiedProgram(
              { ...payload, year_id: yearId },
              {
                onSuccess: () => {
                  setDialogOpen(false);
                  setEditing(null);
                },
              },
            );
          } else if (editing) {
            updateCertifiedProgram(
              { id: editing.id, patch: payload },
              {
                onSuccess: () => {
                  setDialogOpen(false);
                  setEditing(null);
                },
              },
            );
          }
        }}
      />
      <DeleteCertifiedProgramConfirmDialog
        open={pendingDelete != null}
        row={pendingDelete}
        isDeleting={isDeleting}
        onCancel={() => {
          if (!isDeleting) setPendingDelete(null);
        }}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteCertifiedProgram(pendingDelete.id, {
            onSuccess: () => {
              setPendingDelete(null);
            },
          });
        }}
      />
    </div>
  );
}
