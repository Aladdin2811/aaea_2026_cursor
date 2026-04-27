import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { SocialSecurityBandRow } from "../../../api/apiSocialSecurityBand";
import type { SocialSecurityClassificationRow } from "../../../api/apiSocialSecurityClassification";
import type {
  SocialSecurityExpensesWithRelations,
  UpdateSocialSecurityExpensesInput,
} from "../../../api/apiSocialSecurityExpenses";
import ActiveYearSelect from "../../../components/select/ActiveYearSelect";
import CurrentEmployeesSelect from "../../../components/select/CurrentEmployeesSelect";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import { HeaderIconTooltip } from "../../../components/ui/HeaderIconTooltip";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import {
  computeFinalReimbursementTnd,
  filterApplicableBandLimits,
  firstEmbed,
  inferLimitFrequencyFromNotes,
  isContractorEmployee,
  minCapTndFromLimits,
  parseAmount,
  pickBandPercentageRow,
  resolveTndAndEgpCurrencyIds,
  type BandLimitMatchRow,
  type BandPercentageMatchRow,
} from "../../../lib/socialSecurityHealthReimbursement";
import { useFetchAllEmployees } from "../../employees/allEmployees/useEmployees";
import { useFetchMonths } from "../../months/useMonths";
import { useFetchCurrentYear } from "../../years/currentYear/useCurrentYear";
import { useFetchSocialSecurityBand } from "../socialSecurityBand/useSocialSecurityBand";
import { useFetchSocialSecurityBandLimit } from "../socialSecurityBandLimit/useSocialSecurityBandLimit";
import { useFetchSocialSecurityBandPercentage } from "../socialSecurityBandPercentage/useSocialSecurityBandPercentage";
import { useFetchSocialSecurityCategory } from "../socialSecurityCategory/useSocialSecurityCategory";
import { useFetchSocialSecurityClassification } from "../socialSecurityClassification/useSocialSecurityClassification";
import { useFetchSocialSecuritySituations } from "../socialSecuritySituations/useSocialSecuritySituations";
import { useFetchSocialSecurityContractorsRepayment } from "../socialSecurityContractorsRepayment/useSocialSecurityContractorsRepayment";
import { useFetchSocialSecurityCurrency } from "../socialSecurityCurrency/useSocialSecurityCurrency";
import { useFetchSocialSecurityCurrencyRate } from "../socialSecurityCurrencyRate/useSocialSecurityCurrencyRate";
import {
  useCreateSocialSecurityExpenses,
  useDeleteSocialSecurityExpenses,
  useFetchSocialSecurityExpenses,
  useUpdateSocialSecurityExpenses,
} from "./useSocialSecurityExpenses";

type DraftRow = {
  key: string;
  bandId: number | null;
  classificationId: number | null;
  originalAmount: string;
  isNetAmount: boolean;
};

function newDraftRow(): DraftRow {
  return {
    key:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `r-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    bandId: null,
    classificationId: null,
    originalAmount: "",
    isNetAmount: false,
  };
}

function bandPctRows(
  rows: unknown[] | undefined,
): BandPercentageMatchRow[] {
  if (rows == null) return [];
  return rows as BandPercentageMatchRow[];
}

function bandLimitRows(rows: unknown[] | undefined): BandLimitMatchRow[] {
  if (rows == null) return [];
  return rows as BandLimitMatchRow[];
}

/** عرض مبلغ بدون لاحقة عملة وبدون ثلاثة أرقام عشرية (حد أقصى رقمان عشريان). */
function formatExpenseAmount(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("ar-TN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
}

function roundFinalAmountForDb(n: number): number {
  if (!Number.isFinite(n)) return NaN;
  return Number(n.toFixed(2));
}

export default function SocialSecurityExpensesWorkspace() {
  const { data: currentYearRow, isLoading: loadingCurrentYear } =
    useFetchCurrentYear();
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const resolvedYearId = useMemo((): number | null => {
    if (selectedYearId != null) return selectedYearId;
    const id = currentYearRow?.year_id;
    if (id != null && id > 0) return id;
    return null;
  }, [selectedYearId, currentYearRow?.year_id]);

  const [monthId, setMonthId] = useState<number | null>(null);
  const [employeeId, setEmployeeId] = useState<number | null>(null);

  const { data: allEmployees, isLoading: loadingEmployees } =
    useFetchAllEmployees();

  /** مصروفات الضمان: أي موظف `social_security_subscribe === true` (بغضّ عن `status`). */
  const selectedEmployee = useMemo(() => {
    if (employeeId == null || allEmployees == null) return null;
    const e = allEmployees.find((x) => x.id === employeeId) ?? null;
    if (e == null || e.social_security_subscribe !== true) return null;
    return e;
  }, [allEmployees, employeeId]);

  useEffect(() => {
    if (employeeId == null || allEmployees == null) return;
    const e = allEmployees.find((x) => x.id === employeeId);
    if (e != null && e.social_security_subscribe !== true) {
      setEmployeeId(null);
    }
  }, [employeeId, allEmployees]);

  const categoryId = selectedEmployee?.social_security_category_id ?? null;
  const situationId = selectedEmployee?.social_security_situation_id ?? null;

  const { data: ssCategories } = useFetchSocialSecurityCategory();
  const { data: ssSituations } = useFetchSocialSecuritySituations();

  const categoryLabel = useMemo(() => {
    if (categoryId == null) return "—";
    const row = (ssCategories ?? []).find((c) => c.id === categoryId);
    return (
      row?.social_security_category_name?.trim() ||
      `فئة #${categoryId}`
    );
  }, [categoryId, ssCategories]);

  const situationLabel = useMemo(() => {
    if (situationId == null) return "—";
    const fromEmployee = firstEmbed(
      selectedEmployee?.social_security_situations,
    );
    if (
      fromEmployee != null &&
      fromEmployee.id === situationId &&
      fromEmployee.social_security_situation_name != null &&
      String(fromEmployee.social_security_situation_name).trim() !== ""
    ) {
      return String(fromEmployee.social_security_situation_name).trim();
    }
    const row = (ssSituations ?? []).find((s) => s.id === situationId);
    return (
      row?.social_security_situation_name?.trim() || `وضع #${situationId}`
    );
  }, [situationId, ssSituations, selectedEmployee]);
  const jobNatureName = firstEmbed(selectedEmployee?.job_nature)?.job_nature_name;
  const isContractor = isContractorEmployee(jobNatureName);

  const { data: months, isLoading: loadingMonths } = useFetchMonths();
  const { data: bands } = useFetchSocialSecurityBand();
  const { data: classifications } = useFetchSocialSecurityClassification();
  const { data: bandPercentagesRaw } = useFetchSocialSecurityBandPercentage();
  const { data: bandLimitsRaw } = useFetchSocialSecurityBandLimit();
  const { data: currencies } = useFetchSocialSecurityCurrency();
  const { data: currencyRates } = useFetchSocialSecurityCurrencyRate();
  const { data: contractorsRepaymentRows } =
    useFetchSocialSecurityContractorsRepayment();
  const bandPercentages = bandPctRows(bandPercentagesRaw);
  const bandLimits = bandLimitRows(bandLimitsRaw);

  const { tndId, egpId } = useMemo(
    () => resolveTndAndEgpCurrencyIds(currencies ?? []),
    [currencies],
  );

  const egpToTndRate = useMemo(() => {
    const first = currencyRates?.[0];
    if (first == null) return null;
    const n = parseAmount(first.currency_rate);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [currencyRates]);

  const contractorRepaymentPercent = useMemo(() => {
    const r = contractorsRepaymentRows?.[0];
    if (r == null) return null;
    const n = parseAmount(r.contractors_repayment);
    return Number.isFinite(n) && n >= 0 ? n : null;
  }, [contractorsRepaymentRows]);

  const listEnabled =
    resolvedYearId != null && monthId != null && employeeId != null;

  const expenseFilters = listEnabled
    ? {
        year_id: resolvedYearId,
        month_id: monthId,
        employee_id: employeeId,
      }
    : undefined;

  const {
    isLoading: loadingSaved,
    data: savedRows,
    error: savedError,
  } = useFetchSocialSecurityExpenses(expenseFilters, {
    enabled: listEnabled,
  });

  const { createExpensesAsync, isCreating } = useCreateSocialSecurityExpenses();
  const { updateExpenses, isUpdating } = useUpdateSocialSecurityExpenses();
  const { deleteExpense, isDeleting } = useDeleteSocialSecurityExpenses();

  const [draftRows, setDraftRows] = useState<DraftRow[]>([]);

  const [editing, setEditing] = useState<SocialSecurityExpensesWithRelations | null>(
    null,
  );
  const [pendingDelete, setPendingDelete] =
    useState<SocialSecurityExpensesWithRelations | null>(null);

  const computePreview = useCallback(
    (row: DraftRow) => {
      const messages: string[] = [];
      if (row.bandId == null) {
        return { finalLabel: "—", messages: ["اختر البند"] };
      }
      const gross = parseAmount(row.originalAmount);
      if (!Number.isFinite(gross) || gross < 0) {
        return { finalLabel: "—", messages: ["أدخل مبلغاً صالحاً"] };
      }
      if (categoryId == null) {
        messages.push("الموظف بدون فئة ضمان في الملف الشخصي");
      }

      const pctPick = pickBandPercentageRow(
        bandPercentages,
        row.bandId,
        categoryId,
        row.classificationId,
      );
      if (pctPick.ambiguous) {
        messages.push("تعارض في نسب التعويض لهذا البند والفئة");
      }
      if (pctPick.needsClassificationChoice && row.classificationId == null) {
        messages.push("يُنصح باختيار التصنيف (عضو/مستفيد) لهذا البند");
      }
      if (!row.isNetAmount && pctPick.percent == null) {
        messages.push("لا توجد نسبة تعويض مطابقة — يُعامل المبلغ كما هو");
      }

      const applicable = filterApplicableBandLimits(
        bandLimits,
        row.bandId,
        categoryId,
        situationId,
        row.classificationId,
      );
      const capTnd = minCapTndFromLimits(
        applicable,
        tndId,
        egpId,
        egpToTndRate,
      );
      if (capTnd == null && applicable.length === 0) {
        messages.push("لا يوجد سقف مطابق في الإعدادات — دون حد أعلى من الجدول");
      }
      if (egpId != null && tndId != null && egpToTndRate == null) {
        messages.push("سعر الصرف غير مضبوط — تحقق من جدول أسعار صرف الضمان");
      }

      const { finalTnd } = computeFinalReimbursementTnd({
        grossAmount: gross,
        isNetAmount: row.isNetAmount,
        bandPercent: pctPick.percent,
        capTnd,
        contractorRepaymentPercent,
        isContractor,
      });

      return { finalLabel: formatExpenseAmount(finalTnd), messages };
    },
    [
      bandLimits,
      bandPercentages,
      categoryId,
      contractorRepaymentPercent,
      egpId,
      egpToTndRate,
      isContractor,
      situationId,
      tndId,
    ],
  );

  const handleAddDraftRow = () => {
    setDraftRows((r) => [...r, newDraftRow()]);
  };

  const handleRemoveDraftRow = (key: string) => {
    setDraftRows((r) => r.filter((x) => x.key !== key));
  };

  const updateDraft = (key: string, patch: Partial<DraftRow>) => {
    setDraftRows((rows) =>
      rows.map((x) => (x.key === key ? { ...x, ...patch } : x)),
    );
  };

  const needsClassificationUi = (bandId: number | null) => {
    if (bandId == null || categoryId == null) return false;
    return bandPercentages.some(
      (p) =>
        p.social_security_band_id === bandId &&
        p.social_security_category_id === categoryId &&
        p.social_security_classification_id != null,
    );
  };

  const duplicateSameYear = (
    bandId: number,
    excludeId?: number,
  ): boolean => {
    const list = savedRows ?? [];
    return list.some(
      (s) =>
        s.social_security_band_id === bandId &&
        (excludeId == null || s.id !== excludeId),
    );
  };

  const saveDraftRows = async () => {
    if (!listEnabled) {
      toast.error("اختر العام والشهر والموظف أولاً");
      return;
    }
    if (draftRows.length === 0) {
      toast.error("لا توجد صفوف للحفظ");
      return;
    }

    for (const row of draftRows) {
      if (row.bandId == null) {
        toast.error("أكمل اختيار البند لكل الصفوف");
        return;
      }
      const gross = parseAmount(row.originalAmount);
      if (!Number.isFinite(gross) || gross < 0) {
        toast.error("تأكد من المبالغ في كل الصفوف");
        return;
      }
      if (needsClassificationUi(row.bandId) && row.classificationId == null) {
        toast.error("اختر التصنيف (عضو/مستفيد) للصفوف التي تتطلب ذلك");
        return;
      }
    }

    let biennialWarned = false;
    for (const row of draftRows) {
      const bandId = row.bandId!;
      const applicable = filterApplicableBandLimits(
        bandLimits,
        bandId,
        categoryId,
        situationId,
        row.classificationId,
      );
      const freq = applicable
        .map((l) => inferLimitFrequencyFromNotes(l.social_security_notes))
        .find((f) => f !== "none");

      if (freq === "annual" && duplicateSameYear(bandId)) {
        const ok = window.confirm(
          "يوجد بالفعل مصروف لنفس البند ونفس السنة لهذا الموظف. هل تريد المتابعة؟",
        );
        if (!ok) return;
      }
      if (freq === "biennial" && !biennialWarned) {
        biennialWarned = true;
        const ok = window.confirm(
          "أحد البنود قد يكون له حدّ مرة كل سنتين (راجع ملاحظات السقف). هل تريد المتابعة؟",
        );
        if (!ok) return;
      }
    }

    try {
      for (const row of draftRows) {
        const gross = parseAmount(row.originalAmount)!;
        const pctPick = pickBandPercentageRow(
          bandPercentages,
          row.bandId!,
          categoryId,
          row.classificationId,
        );
        const applicable = filterApplicableBandLimits(
          bandLimits,
          row.bandId!,
          categoryId,
          situationId,
          row.classificationId,
        );
        const capTnd = minCapTndFromLimits(
          applicable,
          tndId,
          egpId,
          egpToTndRate,
        );
        const { finalTnd } = computeFinalReimbursementTnd({
          grossAmount: gross,
          isNetAmount: row.isNetAmount,
          bandPercent: pctPick.percent,
          capTnd,
          contractorRepaymentPercent,
          isContractor,
        });
        const noteParts: string[] = [];
        if (row.isNetAmount) noteParts.push("مبلغ صافي (بدون تطبيق نسبة البند)");
        noteParts.push(`تقدير تعويض: ${formatExpenseAmount(finalTnd)}`);
        if (isContractor) noteParts.push("متعاقد: تطبيق نسبة تعويض المتعاقدين");

        await createExpensesAsync({
          employee_id: employeeId!,
          year_id: resolvedYearId!,
          month_id: monthId!,
          social_security_band_id: row.bandId!,
          social_security_classification_id: row.classificationId,
          original_amount: gross,
          final_amount: roundFinalAmountForDb(finalTnd),
          notes: noteParts.join(" | "),
        });
      }

      toast.success("تم تسجيل المصروفات");
      setDraftRows([]);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "تعذّر تسجيل أحد المصروفات",
      );
    }
  };

  const columns = useMemo<DataTableColumn<SocialSecurityExpensesWithRelations>[]>(
    () => [
      {
        id: "actions",
        header: "إجراءات",
        className: "w-[6.5rem] min-w-[6.5rem]",
        thClassName: "!whitespace-normal text-center",
        cell: (r) => (
          <div className="flex items-center justify-center gap-1">
            <HeaderIconTooltip label="تعديل">
              <button
                type="button"
                className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/60 hover:text-emerald-800 disabled:opacity-50"
                aria-label="تعديل"
                disabled={isDeleting || isUpdating}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditing(r);
                }}
              >
                <Pencil className="size-4" strokeWidth={1.75} />
              </button>
            </HeaderIconTooltip>
            <HeaderIconTooltip label="حذف">
              <button
                type="button"
                className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-red-200 hover:bg-red-50/60 hover:text-red-800 disabled:opacity-50"
                aria-label="حذف"
                disabled={isDeleting || isUpdating}
                onClick={(e) => {
                  e.stopPropagation();
                  setPendingDelete(r);
                }}
              >
                <Trash2 className="size-4" strokeWidth={1.75} />
              </button>
            </HeaderIconTooltip>
          </div>
        ),
        getSortValue: () => 0,
        contentAlign: "center",
      },
      {
        id: "band",
        header: "البند",
        cell: (r) => (
          <span className="text-slate-800">
            {formatOptionalText(
              firstEmbed(r.social_security_band)?.social_security_band_name,
            )}
          </span>
        ),
        getSortValue: (r) =>
          stringValue(
            firstEmbed(r.social_security_band)?.social_security_band_name,
          ),
      },
      {
        id: "classification",
        header: "التصنيف",
        cell: (r) => (
          <span className="text-slate-700">
            {formatOptionalText(
              firstEmbed(r.social_security_classification)
                ?.social_security_classification_name,
            )}
          </span>
        ),
        getSortValue: (r) =>
          stringValue(
            firstEmbed(r.social_security_classification)
              ?.social_security_classification_name,
          ),
      },
      {
        id: "original",
        header: "المبلغ الأصلي",
        className: "tabular-nums",
        cell: (r) => (
          <span>{formatOptionalText(String(r.original_amount ?? ""))}</span>
        ),
        getSortValue: (r) => parseAmount(r.original_amount) || 0,
        contentAlign: "center",
      },
      {
        id: "final",
        header: "التعويض",
        className: "tabular-nums",
        cell: (r) => (
          <span className="font-medium text-slate-900">
            {formatOptionalText(String(r.final_amount ?? ""))}
          </span>
        ),
        getSortValue: (r) => parseAmount(r.final_amount) || 0,
        contentAlign: "center",
      },
      {
        id: "notes",
        header: "ملاحظات",
        cell: (r) => (
          <span className="line-clamp-2 max-w-md text-sm text-slate-600">
            {formatOptionalText(r.notes)}
          </span>
        ),
        getSortValue: (r) => stringValue(r.notes),
      },
    ],
    [isDeleting, isUpdating],
  );

  const monthOptions = useMemo(() => {
    const m = months ?? [];
    return [...m].sort((a, b) => {
      const na = parseAmount(a.month_num);
      const nb = parseAmount(b.month_num);
      if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
      return a.id - b.id;
    });
  }, [months]);

  const yearContextLoading = selectedYearId == null && loadingCurrentYear;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200/80 bg-slate-50/40 p-4">
        <ActiveYearSelect
          value={resolvedYearId}
          onChange={(id) => setSelectedYearId(id)}
          disabled={loadingCurrentYear}
          labelPosition="inline"
        />
        <div className="flex flex-col gap-1">
          <label htmlFor="ss-exp-month" className="text-sm font-medium text-slate-700">
            الشهر
          </label>
          <select
            id="ss-exp-month"
            className="min-h-10 min-w-[11rem] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm"
            value={monthId ?? ""}
            onChange={(e) =>
              setMonthId(e.target.value === "" ? null : Number(e.target.value))
            }
            disabled={loadingMonths}
          >
            <option value="">اختر الشهر</option>
            {monthOptions.map((mo) => (
              <option key={mo.id} value={mo.id}>
                {mo.month_name1?.trim() ||
                  (mo.month_num != null ? `شهر ${mo.month_num}` : `شهر #${mo.id}`)}
              </option>
            ))}
          </select>
        </div>
        <CurrentEmployeesSelect
          value={employeeId}
          onChange={setEmployeeId}
          disabled={loadingEmployees}
          labelPosition="inline"
          requireSocialSecuritySubscribe={true}
          placeholder="اختر موظفًا مشتركًا في الضمان"
        />
      </div>

      {selectedEmployee ? (
        <div className="rounded-lg border border-emerald-100 bg-emerald-50/30 px-4 py-3 text-sm text-slate-800">
          <span className="font-medium text-emerald-900">بيانات الضمان للموظف:</span>{" "}
          فئة الضمان:{" "}
          <span className="font-medium">{categoryLabel}</span>
          {" · "}
          الحالة الاجتماعية للضمان الاجتماعي:{" "}
          <span className="font-medium">{situationLabel}</span>
          {" · "}
          طبيعة العمل:{" "}
          <span className="font-medium">
            {formatOptionalText(jobNatureName)}
          </span>
          {isContractor ? (
            <span className="ms-2 rounded-md bg-amber-100 px-2 py-0.5 text-amber-900">
              متعاقد
            </span>
          ) : null}
          {contractorRepaymentPercent != null && isContractor ? (
            <span className="ms-2 text-slate-600">
              (نسبة تعويض المتعاقدين من الجدول:{" "}
              {contractorRepaymentPercent}% من تعويض الموظف)
            </span>
          ) : null}
        </div>
      ) : null}

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-slate-900">
            إدخال مصروفات جديدة (صفوف متعددة)
          </h2>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            onClick={handleAddDraftRow}
            disabled={!listEnabled || isCreating}
          >
            <Plus className="size-4" strokeWidth={1.75} />
            صف جديد
          </button>
        </div>

        {!listEnabled ? (
          <p className="text-sm text-slate-600">
            اختر العام المالي والشهر والموظف لتفعيل الجدول والحفظ.
          </p>
        ) : null}

        {draftRows.length === 0 && listEnabled ? (
          <p className="text-sm text-slate-500">
            لا توجد صفوف. استخدم «صف جديد» ثم اختر البند والمبلغ.
          </p>
        ) : null}

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-right font-medium text-slate-700">
                  البند
                </th>
                <th className="px-3 py-2 text-right font-medium text-slate-700">
                  التصنيف
                </th>
                <th className="px-3 py-2 text-right font-medium text-slate-700">
                  المبلغ
                </th>
                <th className="px-3 py-2 text-center font-medium text-slate-700">
                  صافي
                </th>
                <th className="px-3 py-2 text-right font-medium text-slate-700">
                  التعويض المقدَّر
                </th>
                <th className="px-3 py-2 text-right font-medium text-slate-700">
                  ملاحظات
                </th>
                <th className="w-12 px-2 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {draftRows.map((row) => {
                const prev = computePreview(row);
                const showClass = needsClassificationUi(row.bandId);
                return (
                  <tr key={row.key}>
                    <td className="px-3 py-2">
                      <select
                        className="w-full min-w-[10rem] max-w-xs rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm"
                        value={row.bandId ?? ""}
                        onChange={(e) =>
                          updateDraft(row.key, {
                            bandId:
                              e.target.value === "" ? null : Number(e.target.value),
                            classificationId: null,
                          })
                        }
                      >
                        <option value="">—</option>
                        {(bands ?? []).map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.social_security_band_name?.trim() || `بند #${b.id}`}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      {showClass ? (
                        <select
                          className="w-full min-w-[9rem] max-w-xs rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm"
                          value={row.classificationId ?? ""}
                          onChange={(e) =>
                            updateDraft(row.key, {
                              classificationId:
                                e.target.value === ""
                                  ? null
                                  : Number(e.target.value),
                            })
                          }
                        >
                          <option value="">—</option>
                          {(classifications ?? []).map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.social_security_classification_name?.trim() ||
                                `تصنيف #${c.id}`}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        className="w-full min-w-[6rem] max-w-[10rem] rounded-md border border-slate-200 px-2 py-1.5 text-sm tabular-nums"
                        value={row.originalAmount}
                        onChange={(e) =>
                          updateDraft(row.key, { originalAmount: e.target.value })
                        }
                        placeholder="0"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={row.isNetAmount}
                        onChange={(e) =>
                          updateDraft(row.key, { isNetAmount: e.target.checked })
                        }
                        aria-label="مبلغ صافي بدون تطبيق نسبة البند"
                      />
                    </td>
                    <td className="px-3 py-2 tabular-nums text-slate-900">
                      {prev.finalLabel}
                    </td>
                    <td className="max-w-xs px-3 py-2 text-xs text-amber-800">
                      {prev.messages.join(" · ")}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button
                        type="button"
                        className="inline-flex size-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-700"
                        aria-label="حذف الصف"
                        onClick={() => handleRemoveDraftRow(row.key)}
                      >
                        <Trash2 className="size-3.5" strokeWidth={1.75} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
            onClick={() => void saveDraftRows()}
            disabled={!listEnabled || isCreating || draftRows.length === 0}
          >
            {isCreating ? "جاري الحفظ…" : "حفظ المصروفات"}
          </button>
        </div>
      </section>

      {listEnabled ? (
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-900">
            المصروفات المسجّلة لهذا الشهر
          </h2>
          {savedError != null ? (
            <p dir="rtl" className="text-destructive text-sm" role="alert">
              {savedError instanceof Error
                ? savedError.message
                : "حدث خطأ أثناء تحميل المصروفات"}
            </p>
          ) : (
            <DataTable<SocialSecurityExpensesWithRelations>
              data={savedRows ?? []}
              columns={columns}
              getRowId={(row) => row.id}
              isLoading={yearContextLoading || loadingSaved}
              loadingMessage="جاري تحميل المصروفات…"
              emptyMessage="لا توجد مصروفات مسجّلة لهذا الشهر."
            />
          )}
        </section>
      ) : null}

      {editing ? (
        <EditExpenseOverlay
          row={editing}
          bands={bands ?? []}
          classifications={classifications ?? []}
          bandPercentages={bandPercentages}
          bandLimits={bandLimits}
          tndId={tndId}
          egpId={egpId}
          egpToTndRate={egpToTndRate}
          categoryId={categoryId}
          situationId={situationId}
          isContractor={isContractor}
          contractorRepaymentPercent={contractorRepaymentPercent}
          isUpdating={isUpdating}
          onClose={() => setEditing(null)}
          onSave={(patch) => {
            updateExpenses(
              { id: editing.id, ...patch },
              {
                onSuccess: () => setEditing(null),
              },
            );
          }}
        />
      ) : null}

      {pendingDelete ? (
        <DeleteConfirm
          title="حذف المصروف؟"
          body={`سيتم حذف سجل البند ${firstEmbed(pendingDelete.social_security_band)?.social_security_band_name ?? ""} بشكل نهائي.`}
          isBusy={isDeleting}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => {
            deleteExpense(pendingDelete.id, {
              onSuccess: () => setPendingDelete(null),
            });
          }}
        />
      ) : null}
    </div>
  );
}

function DeleteConfirm({
  title,
  body,
  isBusy,
  onCancel,
  onConfirm,
}: {
  title: string;
  body: string;
  isBusy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center"
      role="alertdialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
        aria-label="إلغاء"
        disabled={isBusy}
        onClick={onCancel}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl" dir="rtl">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{body}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 disabled:opacity-50"
            disabled={isBusy}
            onClick={onCancel}
          >
            إلغاء
          </button>
          <button
            type="button"
            className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            disabled={isBusy}
            onClick={onConfirm}
          >
            {isBusy ? "…" : "حذف"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditExpenseOverlay({
  row,
  bands,
  classifications,
  bandPercentages,
  bandLimits,
  tndId,
  egpId,
  egpToTndRate,
  categoryId,
  situationId,
  isContractor,
  contractorRepaymentPercent,
  isUpdating,
  onClose,
  onSave,
}: {
  row: SocialSecurityExpensesWithRelations;
  bands: SocialSecurityBandRow[];
  classifications: SocialSecurityClassificationRow[];
  bandPercentages: BandPercentageMatchRow[];
  bandLimits: BandLimitMatchRow[];
  tndId: number | null;
  egpId: number | null;
  egpToTndRate: number | null;
  categoryId: number | null;
  situationId: number | null;
  isContractor: boolean;
  contractorRepaymentPercent: number | null;
  isUpdating: boolean;
  onClose: () => void;
  onSave: (patch: UpdateSocialSecurityExpensesInput) => void;
}) {
  const [bandId, setBandId] = useState<number | null>(
    row.social_security_band_id,
  );
  const [classificationId, setClassificationId] = useState<number | null>(
    row.social_security_classification_id,
  );
  const [originalAmount, setOriginalAmount] = useState(
    String(row.original_amount ?? ""),
  );
  const [isNet, setIsNet] = useState(
    (row.notes ?? "").includes("مبلغ صافي"),
  );

  const showClass = useMemo(() => {
    if (bandId == null || categoryId == null) return false;
    return bandPercentages.some(
      (p) =>
        p.social_security_band_id === bandId &&
        p.social_security_category_id === categoryId &&
        p.social_security_classification_id != null,
    );
  }, [bandId, bandPercentages, categoryId]);

  const preview = useMemo(() => {
    if (bandId == null) return { label: "—", messages: [] as string[] };
    const gross = parseAmount(originalAmount);
    if (!Number.isFinite(gross)) return { label: "—", messages: ["مبلغ غير صالح"] };
    const pctPick = pickBandPercentageRow(
      bandPercentages,
      bandId,
      categoryId,
      classificationId,
    );
    const applicable = filterApplicableBandLimits(
      bandLimits,
      bandId,
      categoryId,
      situationId,
      classificationId,
    );
    const capTnd = minCapTndFromLimits(
      applicable,
      tndId,
      egpId,
      egpToTndRate,
    );
    const { finalTnd } = computeFinalReimbursementTnd({
      grossAmount: gross,
      isNetAmount: isNet,
      bandPercent: pctPick.percent,
      capTnd,
      contractorRepaymentPercent,
      isContractor,
    });
    const messages: string[] = [];
    if (pctPick.ambiguous) messages.push("تعارض في نسب التعويض");
    return { label: formatExpenseAmount(finalTnd), messages };
  }, [
    bandId,
    bandLimits,
    bandPercentages,
    classificationId,
    categoryId,
    contractorRepaymentPercent,
    egpId,
    egpToTndRate,
    isContractor,
    isNet,
    originalAmount,
    situationId,
    tndId,
  ]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
        aria-label="إغلاق"
        disabled={isUpdating}
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        dir="rtl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 className="text-base font-semibold text-slate-900">تعديل مصروف</h2>
          <button
            type="button"
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
            onClick={onClose}
            disabled={isUpdating}
            aria-label="إغلاق"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="space-y-3 px-4 py-4">
          <label className="block text-sm font-medium text-slate-700">البند</label>
          <select
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={bandId ?? ""}
            onChange={(e) =>
              setBandId(e.target.value === "" ? null : Number(e.target.value))
            }
          >
            <option value="">—</option>
            {bands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.social_security_band_name?.trim() || `بند #${b.id}`}
              </option>
            ))}
          </select>

          {showClass ? (
            <>
              <label className="block text-sm font-medium text-slate-700">
                التصنيف
              </label>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={classificationId ?? ""}
                onChange={(e) =>
                  setClassificationId(
                    e.target.value === "" ? null : Number(e.target.value),
                  )
                }
              >
                <option value="">—</option>
                {classifications.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.social_security_classification_name?.trim() ||
                      `تصنيف #${c.id}`}
                  </option>
                ))}
              </select>
            </>
          ) : null}

          <label className="block text-sm font-medium text-slate-700">المبلغ</label>
          <input
            type="text"
            inputMode="decimal"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm tabular-nums"
            value={originalAmount}
            onChange={(e) => setOriginalAmount(e.target.value)}
          />

          <label className="flex items-center gap-2 text-sm text-slate-800">
            <input
              type="checkbox"
              checked={isNet}
              onChange={(e) => setIsNet(e.target.checked)}
            />
            مبلغ صافي (بدون تطبيق نسبة البند)
          </label>

          <p className="text-sm text-slate-600">
            التعويض المقدَّر:{" "}
            <span className="font-semibold text-slate-900">{preview.label}</span>
          </p>
          {preview.messages.length > 0 ? (
            <p className="text-xs text-amber-800">{preview.messages.join(" · ")}</p>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              disabled={isUpdating}
              onClick={onClose}
            >
              إلغاء
            </button>
            <button
              type="button"
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
              disabled={isUpdating || bandId == null}
              onClick={() => {
                const gross = parseAmount(originalAmount);
                if (!Number.isFinite(gross)) {
                  toast.error("مبلغ غير صالح");
                  return;
                }
                const pctPick = pickBandPercentageRow(
                  bandPercentages,
                  bandId!,
                  categoryId,
                  classificationId,
                );
                const applicable = filterApplicableBandLimits(
                  bandLimits,
                  bandId!,
                  categoryId,
                  situationId,
                  classificationId,
                );
                const capTnd = minCapTndFromLimits(
                  applicable,
                  tndId,
                  egpId,
                  egpToTndRate,
                );
                const { finalTnd } = computeFinalReimbursementTnd({
                  grossAmount: gross,
                  isNetAmount: isNet,
                  bandPercent: pctPick.percent,
                  capTnd,
                  contractorRepaymentPercent,
                  isContractor,
                });
                const noteParts: string[] = [];
                if (isNet) noteParts.push("مبلغ صافي (بدون تطبيق نسبة البند)");
                noteParts.push(`تقدير تعويض: ${formatExpenseAmount(finalTnd)}`);
                if (isContractor) noteParts.push("متعاقد: تطبيق نسبة تعويض المتعاقدين");
                onSave({
                  social_security_band_id: bandId,
                  social_security_classification_id: classificationId,
                  original_amount: gross,
                  final_amount: roundFinalAmountForDb(finalTnd),
                  notes: noteParts.join(" | "),
                });
              }}
            >
              {isUpdating ? "…" : "حفظ"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
