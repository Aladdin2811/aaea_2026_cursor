import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { type VacationsWithRelations } from "../../../api/apiVacations";
import ActiveYearSelect from "../../../components/select/ActiveYearSelect";
import CurrentEmployeesSelect from "../../../components/select/CurrentEmployeesSelect";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import { downloadExcelXls, printRtlTable } from "../../../lib/tableExport";
import { useSessionPermissions } from "../../permissions/useSessionPermissions";
import { useFetchCurrentYear } from "../../years/currentYear/useCurrentYear";
import { DeleteVacationConfirmDialog } from "./DeleteVacationConfirmDialog";
import { VacationFormDialog } from "./VacationFormDialog";
import {
  useCreateVacation,
  useDeleteVacation,
  useFetchVacations,
  useUpdateVacation,
} from "./useVacations";

function firstEmbed<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

/** عرض تاريخ بصيغة `yyyy/mm/dd` (مثال: 2026/04/26). */
function formatDateYmdSlashes(iso: string | null | undefined): string {
  if (iso == null || String(iso).trim() === "") return "—";
  const s = String(iso).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const [y, m, d] = s.slice(0, 10).split("-");
    return `${y}/${m}/${d}`;
  }
  const dt = new Date(s);
  if (Number.isNaN(dt.getTime())) return "—";
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return `${y}/${m}/${d}`;
}

function ToolbarCount({ n }: { n: number }): ReactNode {
  return (
    <p className="text-sm text-slate-600">
      عدد الإجازات:{" "}
      <span className="font-medium tabular-nums text-slate-800">{n}</span>
    </p>
  );
}

const EXPORT_HEADERS = ["من", "إلى", "نوع الإجازة", "عدد الأيام", "ملاحظات"] as const;

type VacationTypeLabel = {
  id: number;
  vacation_type_name: string | null;
};

function vacationTypeRowLabel(
  t: VacationTypeLabel | null | undefined,
  fallbackId: number | null,
): string {
  const name = t?.vacation_type_name;
  if (name != null && String(name).trim() !== "") return String(name).trim();
  if (fallbackId != null) return `نوع #${fallbackId}`;
  return "—";
}

export default function VacationsTable() {
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const [employeeId, setEmployeeId] = useState<number | null>(null);

  const { data: currentYearRow, isLoading: loadingCurrentYear } =
    useFetchCurrentYear();

  const resolvedYearId = useMemo((): number | null => {
    if (selectedYearId != null) return selectedYearId;
    const id = currentYearRow?.year_id;
    if (id != null && id > 0) return id;
    return null;
  }, [selectedYearId, currentYearRow?.year_id]);

  const fetchEnabled = resolvedYearId != null && employeeId != null;

  const filters: { year_id: number; employee_id: number } | undefined =
    fetchEnabled
      ? { year_id: resolvedYearId, employee_id: employeeId! }
      : undefined;

  const { isLoading, isFetching, data, error, isError } = useFetchVacations(
    filters,
    { enabled: fetchEnabled },
  );

  const { createVacation, isCreating } = useCreateVacation();
  const { updateVacation, isUpdating } = useUpdateVacation();
  const { deleteVacation, isDeleting } = useDeleteVacation();
  const { codeSet } = useSessionPermissions();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<VacationsWithRelations | null>(null);
  const [pendingDelete, setPendingDelete] = useState<VacationsWithRelations | null>(
    null,
  );

  const yearContextLoading = selectedYearId == null && loadingCurrentYear;
  const listLoading = fetchEnabled && (isLoading || isFetching);
  const tableLoading = yearContextLoading || listLoading;
  const rows = data ?? [];
  const isSubmitting = isCreating || isUpdating;
  const canCreate = codeSet.has("table.vacations.create");
  const canUpdate = codeSet.has("table.vacations.update");
  const canDelete = codeSet.has("table.vacations.delete");
  const canPrint = codeSet.has("table.vacations.print");
  const canExport = codeSet.has("table.vacations.export");

  const columns = useMemo<DataTableColumn<VacationsWithRelations>[]>(
    () => {
      const cols: DataTableColumn<VacationsWithRelations>[] = [];
      if (canUpdate || canDelete) {
        cols.unshift({
        id: "actions",
        header: "إجراءات",
        className:
          canUpdate && canDelete ? "w-[6.5rem] min-w-[6.5rem]" : "w-[3.75rem] min-w-[3.75rem]",
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
      cols.push({
        id: "from_date",
        header: "من",
        className: "min-w-20",
        thClassName: "!whitespace-normal text-center",
        cell: (row) => (
          <span className="tabular-nums text-slate-800">
            {formatDateYmdSlashes(row.from_date)}
          </span>
        ),
        getSortValue: (r) => stringValue(r.from_date),
        contentAlign: "center",
      },
      {
        id: "to_date",
        header: "إلى",
        className: "min-w-20",
        thClassName: "!whitespace-normal text-center",
        cell: (row) => (
          <span className="tabular-nums text-slate-800">
            {formatDateYmdSlashes(row.to_date)}
          </span>
        ),
        getSortValue: (r) => stringValue(r.to_date),
        contentAlign: "center",
      },
      {
        id: "vacation_type",
        header: "نوع الإجازة",
        className: "min-w-28",
        cell: (row) => {
          const vt = firstEmbed(row.vacation_type) as
            | VacationTypeLabel
            | undefined;
          return (
            <span className="text-slate-800">
              {vacationTypeRowLabel(vt, row.vacation_type_id ?? null)}
            </span>
          );
        },
        getSortValue: (r) =>
          stringValue(firstEmbed(r.vacation_type)?.vacation_type_name),
      },
      {
        id: "days_count",
        header: "عدد الأيام",
        className: "min-w-20",
        thClassName: "!whitespace-normal text-center",
        cell: (row) => (
          <span className="tabular-nums text-slate-800">
            {row.days_count != null && Number.isFinite(row.days_count)
              ? row.days_count
              : "—"}
          </span>
        ),
        getSortValue: (r) => r.days_count ?? -Infinity,
        contentAlign: "center",
      },
      {
        id: "notes",
        header: "ملاحظات",
        className: "min-w-40",
        cell: (row) => (
          <span className="text-slate-700 line-clamp-2 max-w-md">
            {formatOptionalText(row.notes)}
          </span>
        ),
        getSortValue: (r) => stringValue(r.notes),
      });
      return cols;
    },
    [canDelete, canUpdate, isDeleting, isSubmitting],
  );

  if (isError) {
    return (
      <p dir="rtl" className="text-destructive" role="alert">
        {error instanceof Error ? error.message : "حدث خطأ أثناء التحميل"}
      </p>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {/* <p className="text-sm text-slate-600">
        اختر <span className="font-medium text-slate-800">العام المالي</span> و
        <span className="font-medium text-slate-800"> الموظف</span> لعرض سجلات
        الإجازات وإدارتها.
      </p> */}
      <DataTable<VacationsWithRelations>
        data={rows}
        columns={columns}
        isLoading={tableLoading}
        loadingMessage="جاري تحميل الإجازات…"
        emptyMessage={
          fetchEnabled
            ? "لا توجد إجازات مطابقة. استخدم «إجازة جديدة» لإضافة سجل."
            : "يُرجى اختيار العام والموظف لبدء العرض."
        }
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          <div className="flex w-full min-w-0 flex-col gap-3">
            <div className="flex w-full min-w-0 flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-x-4 sm:gap-y-2">
              <div className="flex w-fit min-w-0 max-w-full flex-row flex-wrap items-end gap-x-5 gap-y-2">
                <div className="relative z-[25] w-fit max-w-full min-w-0 shrink-0">
                  <ActiveYearSelect
                    value={resolvedYearId}
                    onChange={setSelectedYearId}
                    disabled={selectedYearId == null && loadingCurrentYear}
                    labelPosition="above"
                    placeholder="العام المالي"
                    aria-label="تصفية الإجازات حسب العام المالي"
                  />
                </div>
                <div className="relative z-[24] w-fit max-w-full min-w-0 shrink-0">
                  <CurrentEmployeesSelect
                    value={employeeId}
                    onChange={setEmployeeId}
                    labelPosition="above"
                    placeholder="اسم الموظف"
                    aria-label="تصفية الإجازات حسب الموظف"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-end justify-end gap-3 sm:shrink-0 sm:ps-4">
                {!tableLoading && rows.length > 0 ? (
                  <ToolbarCount n={rows.length} />
                ) : (
                  <span className="hidden min-h-0 sm:block sm:min-w-0" />
                )}
                {canPrint ? (
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    disabled={rows.length === 0}
                    onClick={() =>
                      printRtlTable({
                        documentTitle: "طباعة الإجازات",
                        caption: "جدول الإجازات",
                        headers: ["#", ...EXPORT_HEADERS],
                        rows: rows.map((r, i) => [
                          String(i + 1),
                          formatDateYmdSlashes(r.from_date),
                          formatDateYmdSlashes(r.to_date),
                          vacationTypeRowLabel(
                            firstEmbed(r.vacation_type) as VacationTypeLabel | undefined,
                            r.vacation_type_id ?? null,
                          ),
                          r.days_count != null ? String(r.days_count) : "—",
                          formatOptionalText(r.notes),
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
                        filename: "vacations.xls",
                        sheetName: "vacations",
                        headers: [...EXPORT_HEADERS],
                        rows: rows.map((r) => [
                          formatDateYmdSlashes(r.from_date),
                          formatDateYmdSlashes(r.to_date),
                          vacationTypeRowLabel(
                            firstEmbed(r.vacation_type) as VacationTypeLabel | undefined,
                            r.vacation_type_id ?? null,
                          ),
                          r.days_count != null ? String(r.days_count) : "—",
                          formatOptionalText(r.notes),
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
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!fetchEnabled || isSubmitting}
                    title={!fetchEnabled ? "اختر العام والموظف أولاً" : undefined}
                    onClick={() => {
                      setEditing(null);
                      setDialogMode("create");
                      setDialogOpen(true);
                    }}
                  >
                    <Plus className="size-5 shrink-0" strokeWidth={1.75} />
                    إجازة جديدة
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        }
        caption="جدول الإجازات"
        density="comfortable"
        minTableWidth="min(100%, 1100px)"
      />

      {dialogOpen ? (
        <VacationFormDialog
          key={
            dialogMode === "edit" && editing
              ? `edit-${editing.id}`
              : `create-${resolvedYearId ?? "x"}-${employeeId ?? "y"}`
          }
          mode={dialogMode}
          initial={editing}
          contextYearId={resolvedYearId}
          contextEmployeeId={employeeId}
          isSubmitting={isSubmitting}
          onClose={() => {
            if (!isSubmitting) {
              setDialogOpen(false);
              setEditing(null);
            }
          }}
          onCreate={(input) => {
            createVacation(input, {
              onSuccess: () => {
                setDialogOpen(false);
              },
            });
          }}
          onUpdate={({ id, patch }) => {
            updateVacation(
              { id, ...patch },
              {
                onSuccess: () => {
                  setDialogOpen(false);
                  setEditing(null);
                },
              },
            );
          }}
        />
      ) : null}

      {pendingDelete ? (
        <DeleteVacationConfirmDialog
          open
          typeLabel={vacationTypeRowLabel(
            firstEmbed(pendingDelete.vacation_type) as
              | VacationTypeLabel
              | undefined,
            pendingDelete.vacation_type_id,
          )}
          fromLabel={formatDateYmdSlashes(pendingDelete.from_date)}
          toLabel={formatDateYmdSlashes(pendingDelete.to_date)}
          isDeleting={isDeleting}
          onCancel={() => {
            if (!isDeleting) setPendingDelete(null);
          }}
          onConfirm={() => {
            if (!pendingDelete) return;
            const id = pendingDelete.id;
            deleteVacation(id, {
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
