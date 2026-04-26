import { X } from "lucide-react";
import { useMemo, useState } from "react";
import type {
  CreateVacationsInput,
  UpdateVacationsInput,
  VacationsWithRelations,
} from "../../../api/apiVacations";
import { VACATION_PENDING_NOTES } from "../../../api/apiInAppNotifications";
import ActiveYearSelect from "../../../components/select/ActiveYearSelect";
import CurrentEmployeesSelect from "../../../components/select/CurrentEmployeesSelect";
import { useFetchAllEmployees } from "../../employees/allEmployees/useEmployees";
import { useFetchActivYears } from "../../years/year/useYears";
import { useFetchVacationType } from "../vacationType/useVacationType";

type Props = {
  mode: "create" | "edit";
  initial: VacationsWithRelations | null;
  /** عند الإنشاء: مُثبّتة من شريط التصفية */
  contextYearId: number | null;
  contextEmployeeId: number | null;
  onClose: () => void;
  isSubmitting: boolean;
  onCreate: (input: CreateVacationsInput) => void;
  onUpdate: (args: { id: number; patch: UpdateVacationsInput }) => void;
};

type FormFields = {
  yearId: number | null;
  employeeId: number | null;
  vacationTypeId: string;
  fromDate: string;
  toDate: string;
  daysCount: string;
  notes: string;
};

function parseIntField(value: string, label: string): number {
  const t = value.trim();
  if (t === "") throw new Error(`حقل ${label} مطلوب`);
  const n = Number.parseInt(t, 10);
  if (!Number.isFinite(n)) throw new Error(`قيمة ${label} غير صالحة`);
  return n;
}

function toInputDate(iso: string | null | undefined): string {
  if (iso == null) return "";
  const s = String(iso);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function buildFormFields(
  mode: "create" | "edit",
  initial: VacationsWithRelations | null,
  contextYearId: number | null,
  contextEmployeeId: number | null,
): FormFields {
  if (mode === "edit" && initial) {
    return {
      yearId: initial.year_id ?? null,
      employeeId: initial.employee_id ?? null,
      vacationTypeId:
        initial.vacation_type_id != null
          ? String(initial.vacation_type_id)
          : "",
      fromDate: toInputDate(initial.from_date),
      toDate: toInputDate(initial.to_date),
      daysCount:
        initial.days_count != null && Number.isFinite(initial.days_count)
          ? String(initial.days_count)
          : "",
      notes: initial.notes?.trim() ?? "",
    };
  }
  const lockToFilter =
    mode === "create" &&
    contextYearId != null &&
    contextYearId > 0 &&
    contextEmployeeId != null;
  return {
    yearId: lockToFilter ? contextYearId : null,
    employeeId: lockToFilter ? contextEmployeeId : null,
    vacationTypeId: "",
    fromDate: "",
    toDate: "",
    daysCount: "",
    notes: "",
  };
}

export function VacationFormDialog({
  mode,
  initial,
  contextYearId,
  contextEmployeeId,
  onClose,
  isSubmitting,
  onCreate,
  onUpdate,
}: Props) {
  const { isLoading: typesLoading, data: vacationTypes } = useFetchVacationType(
    { activeOnly: true },
  );
  const { data: years } = useFetchActivYears();
  const { data: allEmployees } = useFetchAllEmployees();

  const [form, setForm] = useState<FormFields>(() =>
    buildFormFields(mode, initial, contextYearId, contextEmployeeId),
  );
  const [formError, setFormError] = useState<string | null>(null);

  const setField = <K extends keyof FormFields>(
    key: K,
    value: FormFields[K],
  ) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const typeRows = useMemo(
    () => (vacationTypes != null && vacationTypes.length > 0 ? vacationTypes : []),
    [vacationTypes],
  );

  const lockToFilter =
    mode === "create" &&
    contextYearId != null &&
    contextYearId > 0 &&
    contextEmployeeId != null;

  const contextYearLabel = useMemo(() => {
    if (contextYearId == null) return null;
    const y = years?.find((r) => r.id === contextYearId);
    if (y?.year_num != null && String(y.year_num).trim() !== "")
      return String(y.year_num);
    return `سنة #${contextYearId}`;
  }, [contextYearId, years]);

  const contextEmployeeName = useMemo(() => {
    if (contextEmployeeId == null) return null;
    return allEmployees?.find((e) => e.id === contextEmployeeId)?.employee_name
      ?.trim() || null;
  }, [allEmployees, contextEmployeeId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!form.fromDate.trim() || !form.toDate.trim()) {
      setFormError("يُرجى تحديد تاريخي البداية والنهاية.");
      return;
    }
    if (new Date(form.fromDate) > new Date(form.toDate)) {
      setFormError("تاريخ «من» يجب أن يكون قبل أو يساوي تاريخ «إلى».");
      return;
    }
    if (form.yearId == null || form.employeeId == null) {
      setFormError("يُرجى اختيار العام المالي والموظف.");
      return;
    }
    let vt: number;
    try {
      vt = parseIntField(form.vacationTypeId, "نوع الإجازة");
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "نوع الإجازة غير صالح",
      );
      return;
    }
    let dCount: number;
    try {
      dCount = parseIntField(form.daysCount, "عدد الأيام");
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "عدد الأيام غير صالح",
      );
      return;
    }
    if (dCount < 1) {
      setFormError("عدد الأيام يجب أن يكون 1 على الأقل.");
      return;
    }
    const base = {
      year_id: form.yearId,
      employee_id: form.employeeId,
      vacation_type_id: vt,
      from_date: form.fromDate.trim(),
      to_date: form.toDate.trim(),
      days_count: dCount,
      notes: form.notes.trim() || null,
    };
    if (mode === "create") {
      onCreate({
        ...base,
        administrative_approval: false,
        management_approval: false,
        notes: VACATION_PENDING_NOTES,
      });
      return;
    }
    if (initial) {
      onUpdate({
        id: initial.id,
        patch: base as UpdateVacationsInput,
      });
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vacation-form-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
        aria-label="إغلاق"
        onClick={() => !isSubmitting && onClose()}
      />
      <div className="relative z-10 flex max-h-[min(92vh,44rem)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-300/40">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5">
          <div>
            <h2
              id="vacation-form-title"
              className="text-base font-semibold text-slate-900"
            >
              {mode === "create" ? "إجازة جديدة" : "تعديل إجازة"}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {mode === "create" && lockToFilter && contextYearLabel
                ? `للعام ${contextYearLabel} — الموظف: ${
                    contextEmployeeName && contextEmployeeName.length > 0
                      ? contextEmployeeName
                      : `#${contextEmployeeId ?? ""}`
                  }`
                : "عدّل الحقول ثم احفظ."}
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
            disabled={isSubmitting}
            onClick={() => !isSubmitting && onClose()}
            aria-label="إغلاق"
          >
            <X className="size-5" strokeWidth={1.75} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
          dir="rtl"
        >
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-y-contain px-4 py-4 sm:px-5">
            {formError ? (
              <p className="text-sm text-red-600" role="alert">
                {formError}
              </p>
            ) : null}

            {lockToFilter ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-slate-700">
                <span className="block">
                  <span className="text-slate-500">العام المالي:</span>{" "}
                  {contextYearLabel ?? `#${contextYearId}`}
                </span>
                <span className="mt-0.5 block">
                  <span className="text-slate-500">الموظف:</span>{" "}
                  {contextEmployeeName && contextEmployeeName.length > 0
                    ? contextEmployeeName
                    : `معرّف #${contextEmployeeId}`}
                </span>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-1">
                <div className="space-y-1.5">
                  <ActiveYearSelect
                    value={form.yearId}
                    onChange={(id) => {
                      setField("yearId", id);
                    }}
                    disabled={isSubmitting}
                    labelPosition="above"
                    placeholder="السنة"
                  />
                </div>
                <div className="space-y-1.5">
                  <CurrentEmployeesSelect
                    value={form.employeeId}
                    onChange={(id) => {
                      setField("employeeId", id);
                    }}
                    disabled={isSubmitting}
                    labelPosition="above"
                    placeholder="الموظف"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="vacation-type"
                className="text-sm font-medium text-slate-700"
              >
                نوع الإجازة <span className="text-red-600">*</span>
              </label>
              <select
                id="vacation-type"
                value={form.vacationTypeId}
                onChange={(e) => setField("vacationTypeId", e.target.value)}
                disabled={isSubmitting || typesLoading || typeRows.length === 0}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none ring-emerald-500/20 focus:border-emerald-400 focus:bg-white focus:ring-2"
              >
                <option value="">— اختر —</option>
                {typeRows.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.vacation_type_name?.trim() || `نوع #${t.id}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="vacation-from"
                  className="text-sm font-medium text-slate-700"
                >
                  من <span className="text-red-600">*</span>
                </label>
                <input
                  id="vacation-from"
                  type="date"
                  value={form.fromDate}
                  onChange={(e) => setField("fromDate", e.target.value)}
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm tabular-nums outline-none focus:border-emerald-400 focus:bg-white focus:ring-2"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="vacation-to"
                  className="text-sm font-medium text-slate-700"
                >
                  إلى <span className="text-red-600">*</span>
                </label>
                <input
                  id="vacation-to"
                  type="date"
                  value={form.toDate}
                  onChange={(e) => setField("toDate", e.target.value)}
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm tabular-nums outline-none focus:border-emerald-400 focus:bg-white focus:ring-2"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="vacation-days"
                className="text-sm font-medium text-slate-700"
              >
                عدد الأيام <span className="text-red-600">*</span>
              </label>
              <input
                id="vacation-days"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                value={form.daysCount}
                onChange={(e) => setField("daysCount", e.target.value)}
                disabled={isSubmitting}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm tabular-nums outline-none focus:border-emerald-400 focus:bg-white focus:ring-2"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="vacation-notes"
                className="text-sm font-medium text-slate-700"
              >
                ملاحظات
              </label>
              <textarea
                id="vacation-notes"
                rows={3}
                value={form.notes}
                onChange={(e) => setField("notes", e.target.value)}
                disabled={isSubmitting}
                className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:bg-white focus:ring-2"
                placeholder="اختياري"
              />
            </div>
          </div>

          <div className="shrink-0 border-t border-slate-100 px-4 py-3 sm:px-5">
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
                disabled={isSubmitting}
                onClick={() => onClose()}
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "جاري الحفظ…"
                  : mode === "create"
                    ? "تسجيل"
                    : "حفظ التعديلات"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
