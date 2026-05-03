import { useMemo, useRef, useState, type ReactNode } from "react";
import type {
  ImportBudgetsAddOnlyRow,
  ModifiedBudgetRow,
} from "../../../../api/apiBudgets";
import {
  DataTable,
  type DataTableColumn,
} from "../../../../components/ui/data-table";
import { useBudgetBab } from "../../../accounts/bab/useBab";
import { useFetchCurrentYear } from "../../../years/currentYear/useCurrentYear";
import { useFetchActivYears } from "../../../years/year/useYears";
import { useFetchBudgets } from "./useBudgets";
import { useImportBudgetsAddOnly } from "./useBudgets";
import { downloadXlsxFromMatrix, printRtlTable } from "../../../../lib/tableExport";
import {
  formatNumeric,
  textOrDash,
  toNumberOrNull,
} from "../../../../lib/tableUtils";
import Select, {
  type GroupBase,
  type SingleValue,
  type StylesConfig,
} from "react-select";
import { useSessionPermissions } from "../../../permissions/useSessionPermissions";
import { toast } from "sonner";

function toNullableNumber(value: string | undefined): number | null {
  if (value == null) return null;
  const v = value.trim();
  if (v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return n;
}

function parseBudgetsCsv(text: string): ImportBudgetsAddOnlyRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length < 2) {
    throw new Error("ملف CSV لا يحتوي بيانات كافية.");
  }

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const idx = (name: string) => headers.indexOf(name);
  const yearIdx = idx("year_id");
  const accountIdx = idx("account_id");
  if (yearIdx < 0 || accountIdx < 0) {
    throw new Error("يجب أن يحتوي CSV على الأعمدة: year_id, account_id");
  }

  const rows: ImportBudgetsAddOnlyRow[] = [];
  for (let i = 1; i < lines.length; i += 1) {
    const cols = lines[i].split(",").map((c) => c.trim());
    const year = toNullableNumber(cols[yearIdx]);
    const account = toNullableNumber(cols[accountIdx]);
    if (year == null || account == null) {
      throw new Error(
        `فشل قراءة CSV: الصف ${i + 1} يجب أن يحتوي year_id و account_id صالحين`,
      );
    }
    rows.push({
      year_id: year,
      account_id: account,
      account_type_id: toNullableNumber(cols[idx("account_type_id")]) ?? null,
      general_account_id:
        toNullableNumber(cols[idx("general_account_id")]) ?? null,
      bab_id: toNullableNumber(cols[idx("bab_id")]) ?? null,
      band_id: toNullableNumber(cols[idx("band_id")]) ?? null,
      no3_id: toNullableNumber(cols[idx("no3_id")]) ?? null,
      detailed_id: toNullableNumber(cols[idx("detailed_id")]) ?? null,
      budget_amount: toNullableNumber(cols[idx("budget_amount")]) ?? null,
      funding_type_id: toNullableNumber(cols[idx("funding_type_id")]) ?? null,
      main_topic_id: toNullableNumber(cols[idx("main_topic_id")]) ?? null,
    });
  }
  if (rows.length === 0) {
    throw new Error("لا توجد صفوف صالحة للاستيراد.");
  }
  return rows;
}

const BUDGETS_EXPORT_HEADERS = [
  "رمز الحساب",
  "البند",
  "النوع",
  "الحساب التفصيلي",
  "الإعتماد المدرج",
  "منقول إليه",
  "منقول منه",
  "ترفيع الإعتمادات",
  "الإعتماد المعدل",
] as const;

function exportBudgetsToXlsx(rows: ModifiedBudgetRow[]): void {
  downloadXlsxFromMatrix({
    filename: "budgets.xlsx",
    sheetName: "الإعتمادات المعدّلة",
    headers: [...BUDGETS_EXPORT_HEADERS],
    rows: rows.map((row) => [
      textOrDash(row.code),
      textOrDash(row.band_name),
      textOrDash(row.no3_name),
      textOrDash(row.detailed_name),
      formatNumeric(row.budget_amount),
      formatNumeric(row.transfer_to),
      formatNumeric(row.transfer_from),
      formatNumeric(row.increase_budget),
      formatNumeric(row.modified_budget),
    ]),
  });
}

function printBudgetsTable(rows: ModifiedBudgetRow[]): void {
  printRtlTable({
    documentTitle: "طباعة الإعتمادات المدرجة",
    caption: "جدول الإعتمادات المعدّلة",
    headers: ["#", ...BUDGETS_EXPORT_HEADERS],
    rows: rows.map((row, idx) => [
      String(idx + 1),
      textOrDash(row.code),
      textOrDash(row.band_name),
      textOrDash(row.no3_name),
      textOrDash(row.detailed_name),
      formatNumeric(row.budget_amount),
      formatNumeric(row.transfer_to),
      formatNumeric(row.transfer_from),
      formatNumeric(row.increase_budget),
      formatNumeric(row.modified_budget),
    ]),
  });
}

/**
 * عرض الأعمدة: `minWidth` صغير لترك الجدول (`table-auto`) يوسّع العمود حسب المحتوى،
 * و`maxWidth` سقفاً — عند الوصول إليه يلتف النص إلى السطر التالي (مع `break-words` في الخلية).
 * عدّل `maxWidth` (واختيارياً `minWidth`) هنا للتحكم.
 */
const BUDGETS_COLUMN_WIDTHS: Record<
  string,
  { minWidth?: string; maxWidth?: string; width?: string }
> = {
  code: { minWidth: "9rem", maxWidth: "12rem" },
  band_name: { minWidth: "5rem", maxWidth: "14rem" },
  no3_name: { minWidth: "4rem", maxWidth: "12rem" },
  detailed_name: { minWidth: "6rem", maxWidth: "24rem" },
  budget_amount: { minWidth: "6rem", maxWidth: "6rem" },
  transfer_to: { minWidth: "6rem", maxWidth: "6rem" },
  transfer_from: { minWidth: "6rem", maxWidth: "6rem" },
  increase_budget: { minWidth: "6rem", maxWidth: "7rem" },
  modified_budget: { minWidth: "6rem", maxWidth: "6rem" },
};

const textWrapTd = "align-top align-text-top";
const textWrapCell =
  "block w-full min-w-0 whitespace-normal break-words text-pretty leading-snug";

const columns: DataTableColumn<ModifiedBudgetRow>[] = [
  {
    id: "code",
    ...BUDGETS_COLUMN_WIDTHS.code,
    header: "رمز الحساب",
    tdClassName: textWrapTd,
    cell: (row) => (
      <span
        className={`${textWrapCell} break-all font-mono text-xs text-slate-800`}
        dir="ltr"
      >
        {textOrDash(row.code)}
      </span>
    ),
    getSortValue: (row) => row.code ?? "",
  },
  {
    id: "band_name",
    ...BUDGETS_COLUMN_WIDTHS.band_name,
    header: "البند",
    tdClassName: textWrapTd,
    cell: (row) => (
      <span className={`${textWrapCell} text-slate-800`}>
        {textOrDash(row.band_name)}
      </span>
    ),
    getSortValue: (row) => row.band_name ?? "",
  },
  {
    id: "no3_name",
    ...BUDGETS_COLUMN_WIDTHS.no3_name,
    header: "النوع",
    tdClassName: textWrapTd,
    cell: (row) => (
      <span className={`${textWrapCell} text-slate-700`}>
        {textOrDash(row.no3_name)}
      </span>
    ),
    getSortValue: (row) => row.no3_name ?? "",
  },
  {
    id: "detailed_name",
    ...BUDGETS_COLUMN_WIDTHS.detailed_name,
    header: "الحساب التفصيلي",
    tdClassName: textWrapTd,
    cell: (row) => (
      <span className={`${textWrapCell} font-medium text-slate-900`}>
        {textOrDash(row.detailed_name)}
      </span>
    ),
    getSortValue: (row) => row.detailed_name ?? "",
  },
  {
    id: "budget_amount",
    ...BUDGETS_COLUMN_WIDTHS.budget_amount,
    header: "الإعتماد المدرج",
    tdClassName: "whitespace-nowrap",
    cell: (row) => (
      <span
        className="block w-full text-right tabular-nums font-semibold text-slate-900"
        dir="ltr"
      >
        {formatNumeric(row.budget_amount)}
      </span>
    ),
    getSortValue: (row) => toNumberOrNull(row.budget_amount) ?? -Infinity,
    contentAlign: "start",
  },
  {
    id: "transfer_to",
    ...BUDGETS_COLUMN_WIDTHS.transfer_to,
    header: "منقول إليه",
    tdClassName: "whitespace-nowrap",
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
  {
    id: "transfer_from",
    ...BUDGETS_COLUMN_WIDTHS.transfer_from,
    header: "منقول منه",
    tdClassName: "whitespace-nowrap",
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
    id: "increase_budget",
    ...BUDGETS_COLUMN_WIDTHS.increase_budget,
    header: "ترفيع الإعتمادات",
    tdClassName: "whitespace-nowrap",
    cell: (row) => (
      <span
        className="block w-full text-right tabular-nums text-slate-800"
        dir="ltr"
      >
        {formatNumeric(row.increase_budget)}
      </span>
    ),
    getSortValue: (row) => toNumberOrNull(row.increase_budget) ?? -Infinity,
    contentAlign: "start",
  },
  {
    id: "modified_budget",
    ...BUDGETS_COLUMN_WIDTHS.modified_budget,
    header: "الإعتماد المعدل",
    tdClassName: "whitespace-nowrap",
    cell: (row) => (
      <span
        className="block w-full text-right tabular-nums font-semibold text-emerald-900"
        dir="ltr"
      >
        {formatNumeric(row.modified_budget)}
      </span>
    ),
    getSortValue: (row) => toNumberOrNull(row.modified_budget) ?? -Infinity,
    contentAlign: "start",
  },
];

type BabOption = { value: number; label: string };

const babSelectStyles: StylesConfig<BabOption, false, GroupBase<BabOption>> = {
  container: (base) => ({ ...base, minWidth: "22rem" }),
  control: (base, state) => ({
    ...base,
    minHeight: 38,
    minWidth: "23rem",
    borderRadius: 8,
    borderColor: state.isFocused ? "#94a3b8" : "#cbd5e1",
    boxShadow: state.isFocused ? "0 0 0 1px #94a3b8" : "none",
  }),
  menu: (base) => ({ ...base, zIndex: 50 }),
  menuPortal: (base) => ({ ...base, zIndex: 50 }),
  indicatorSeparator: () => ({ display: "none" }),
};

function Toolbar({
  rows,
  n,
  selectedYearId,
  selectedBabId,
  onYearChange,
  onBabChange,
  canImport,
  onImportClick,
  isImporting,
}: {
  rows: ModifiedBudgetRow[];
  n: number;
  selectedYearId: number | null;
  selectedBabId: number | null;
  onYearChange: (id: number | null) => void;
  onBabChange: (id: number | null) => void;
  canImport: boolean;
  onImportClick: () => void;
  isImporting: boolean;
}): ReactNode {
  const { isLoading, data } = useFetchActivYears();
  const years = data ?? [];
  const { isLoading: babLoading, data: babData } = useBudgetBab();
  const babOptions = useMemo<BabOption[]>(
    () =>
      (babData ?? []).map((b) => ({
        value: b.id,
        label:
          b.bab_name && b.bab_name.trim() !== "" ? b.bab_name : `باب #${b.id}`,
      })),
    [babData],
  );
  const selectedBabOption = useMemo(
    () => babOptions.find((o) => o.value === selectedBabId) ?? null,
    [babOptions, selectedBabId],
  );

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <label htmlFor="budgets-year-filter" className="text-sm text-slate-700">
          السنة:
        </label>
        <select
          id="budgets-year-filter"
          className="min-w-60 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 focus:border-slate-400 focus:outline-none"
          value={selectedYearId ?? ""}
          onChange={(event) => {
            const v = event.target.value;
            onYearChange(v === "" ? null : Number(v));
          }}
          disabled={isLoading}
        >
          <option value="">كل السنوات المفعلة</option>
          {years.map((y) => (
            <option key={y.id} value={y.id}>
              {y.year_num && y.year_num.trim() !== ""
                ? y.year_num
                : `سنة #${y.id}`}
            </option>
          ))}
        </select>
        <label className="text-sm text-slate-700">الباب:</label>
        <Select<BabOption, false>
          inputId="budgets-bab-filter"
          instanceId="budgets-bab-filter"
          aria-label="الباب"
          isRtl
          isSearchable
          isClearable
          isLoading={babLoading}
          isDisabled={babLoading}
          options={babOptions}
          value={selectedBabOption}
          onChange={(option: SingleValue<BabOption>) =>
            onBabChange(option?.value ?? null)
          }
          placeholder="اختر الباب"
          noOptionsMessage={() => "لا توجد أبواب لها إعتماد"}
          loadingMessage={() => "جاري التحميل…"}
          menuPosition="fixed"
          menuPortalTarget={
            typeof document !== "undefined" ? document.body : null
          }
          styles={babSelectStyles}
        />
      </div>

      <p className="text-sm text-slate-600">
        عدد السجلات:{" "}
        <span className="font-medium tabular-nums text-slate-800">{n}</span>
      </p>

      <div className="flex items-center gap-2">
        {canImport ? (
          <button
            type="button"
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-800 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onImportClick}
            disabled={isImporting}
          >
            {isImporting ? "جاري الاستيراد..." : "استيراد CSV"}
          </button>
        ) : null}
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="طباعة جدول الإعتمادات المدرجة"
          onClick={() => printBudgetsTable(rows)}
          disabled={rows.length === 0}
        >
          طباعة
        </button>
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="تصدير جدول الإعتمادات المدرجة إلى ملف Excel"
          onClick={() => exportBudgetsToXlsx(rows)}
          disabled={rows.length === 0}
        >
          تصدير Excel
        </button>
      </div>
    </div>
  );
}

export default function BudgetsTable() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { codeSet } = useSessionPermissions();
  const canImport = codeSet.has("table.budgets.import");
  const importMutation = useImportBudgetsAddOnly();
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const [selectedBabId, setSelectedBabId] = useState<number | null>(null);
  const { data: currentYearData } = useFetchCurrentYear();
  const { data: babData } = useBudgetBab();
  const effectiveYearId = selectedYearId ?? currentYearData?.year_id ?? null;

  const filters = useMemo(
    () =>
      effectiveYearId == null || selectedBabId == null
        ? undefined
        : { year_id: effectiveYearId, bab_id: selectedBabId },
    [effectiveYearId, selectedBabId],
  );
  const readyToFetch = effectiveYearId != null && selectedBabId != null;
  const { isLoading, data, error, isError } = useFetchBudgets(filters, {
    enabled: readyToFetch,
  });
  const rows = useMemo(() => data ?? [], [data]);
  const totalModifiedBudget = useMemo(
    () =>
      rows.reduce((sum, row) => {
        const n = toNumberOrNull(row.modified_budget);
        return sum + (n ?? 0);
      }, 0),
    [rows],
  );
  const selectedBabName = useMemo(() => {
    if (selectedBabId == null) return "—";
    const bab = (babData ?? []).find((b) => b.id === selectedBabId);
    return bab?.bab_name && bab.bab_name.trim() !== ""
      ? bab.bab_name
      : `باب #${selectedBabId}`;
  }, [babData, selectedBabId]);

  if (isError) {
    return (
      <p dir="rtl" className="text-destructive" role="alert">
        {error instanceof Error
          ? error.message
          : "حدث خطأ أثناء تحميل بيانات الإعتمادات المعدّلة"}
      </p>
    );
  }

  return (
    <div className="space-y-2" dir="rtl">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={async (e) => {
          try {
            const file = e.target.files?.[0];
            e.currentTarget.value = "";
            if (!file) return;
            const text = await file.text();
            const parsedRows = parseBudgetsCsv(text);
            if (parsedRows.length === 0) {
              throw new Error("لا توجد صفوف صالحة للاستيراد.");
            }
            importMutation.mutate(parsedRows);
          } catch (err) {
            toast.error(
              err instanceof Error ? err.message : "تعذّر قراءة ملف CSV",
            );
          }
        }}
      />
      <DataTable<ModifiedBudgetRow>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل بيانات الإعتمادات المعدّلة…"
        emptyMessage={
          !readyToFetch
            ? "اختر السنة والباب أولاً لعرض بيانات الإعتمادات المعدّلة."
            : "لا توجد بيانات إعتمادات للعرض."
        }
        getRowId={(_row, index) => index}
        showIndex
        indexHeader="#"
        toolbar={
          <Toolbar
            rows={rows}
            n={rows.length}
            selectedYearId={effectiveYearId}
            selectedBabId={selectedBabId}
            onYearChange={setSelectedYearId}
            onBabChange={setSelectedBabId}
            canImport={canImport}
            onImportClick={() => fileInputRef.current?.click()}
            isImporting={importMutation.isPending}
          />
        }
        footer={
          <div className="flex items-center justify-end">
            <p className="text-sm font-semibold text-emerald-900">
              إجمالي الإعتماد المعدل — {selectedBabName}:{" "}
              <span className="tabular-nums" dir="ltr">
                {totalModifiedBudget.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </p>
          </div>
        }
        caption="جدول الإعتمادات المعدّلة"
        density="comfortable"
        minTableWidth="100%"
        maxHeight="70dvh"
        stickyHeader
      />
    </div>
  );
}
