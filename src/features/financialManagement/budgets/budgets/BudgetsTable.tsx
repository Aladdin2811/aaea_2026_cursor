import { useMemo, useRef, useState, type ReactNode } from "react";
import type {
  BudgetsWithRelations,
  ImportBudgetsAddOnlyRow,
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
import { downloadUtf8Csv, printRtlTable } from "../../../../lib/tableExport";
import {
  firstRelation,
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
  "البند",
  "النوع",
  "الحساب التفصيلي",
  "الإعتماد",
] as const;

function exportBudgetsToExcelCsv(rows: BudgetsWithRelations[]): void {
  downloadUtf8Csv(
    "budgets.csv",
    [...BUDGETS_EXPORT_HEADERS],
    rows.map((row) => [
      textOrDash(firstRelation(row.band)?.band_name),
      textOrDash(firstRelation(row.no3)?.no3_name),
      textOrDash(firstRelation(row.detailed)?.detailed_name),
      formatNumeric(row.budget_amount),
    ]),
  );
}

function printBudgetsTable(rows: BudgetsWithRelations[]): void {
  printRtlTable({
    documentTitle: "طباعة الإعتمادات المدرجة",
    caption: "جدول الإعتمادات المدرجة",
    headers: ["#", ...BUDGETS_EXPORT_HEADERS],
    rows: rows.map((row, idx) => [
      String(idx + 1),
      textOrDash(firstRelation(row.band)?.band_name),
      textOrDash(firstRelation(row.no3)?.no3_name),
      textOrDash(firstRelation(row.detailed)?.detailed_name),
      formatNumeric(row.budget_amount),
    ]),
  });
}

const columns: DataTableColumn<BudgetsWithRelations>[] = [
  {
    id: "band",
    header: "البند",
    cell: (row) => (
      <span className="text-slate-800">
        {firstRelation(row.band)?.band_name ?? "—"}
      </span>
    ),
    getSortValue: (row) => firstRelation(row.band)?.band_name ?? "",
  },
  {
    id: "no3",
    header: "النوع",
    cell: (row) => (
      <span className="text-slate-700">
        {firstRelation(row.no3)?.no3_name ?? "—"}
      </span>
    ),
    getSortValue: (row) => firstRelation(row.no3)?.no3_name ?? "",
  },
  {
    id: "detailed",
    header: "الحساب التفصيلي",
    cell: (row) => (
      <span className="font-medium text-slate-900">
        {firstRelation(row.detailed)?.detailed_name ?? "—"}
      </span>
    ),
    getSortValue: (row) => firstRelation(row.detailed)?.detailed_name ?? "",
  },
  {
    id: "budget_amount",
    header: "الإعتماد",
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
];

type BabOption = { value: number; label: string };

const babSelectStyles: StylesConfig<BabOption, false, GroupBase<BabOption>> = {
  container: (base) => ({ ...base, minWidth: "16rem" }),
  control: (base, state) => ({
    ...base,
    minHeight: 38,
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
  rows: BudgetsWithRelations[];
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
          onClick={() => exportBudgetsToExcelCsv(rows)}
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
  const effectiveYearId = selectedYearId ?? (currentYearData?.year_id ?? null);

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
  const totalBudgetByBab = useMemo(
    () =>
      rows.reduce((sum, row) => {
        const n = toNumberOrNull(row.budget_amount);
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
          : "حدث خطأ أثناء تحميل بيانات الإعتمادات المدرجة"}
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
      <DataTable<BudgetsWithRelations>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل بيانات الإعتمادات المدرجة…"
        emptyMessage={
          !readyToFetch
            ? "اختر السنة والباب أولاً لعرض بيانات الإعتمادات المدرجة."
            : "لا توجد بيانات إعتمادات للعرض."
        }
        getRowId={(row) => row.id}
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
            <p className="text-sm font-semibold text-slate-800">
              إجمالي إعتمادات الباب: {selectedBabName} —{" "}
              <span className="tabular-nums" dir="ltr">
                {totalBudgetByBab.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </p>
          </div>
        }
        caption="جدول الإعتمادات المدرجة"
        density="comfortable"
        minTableWidth="100%"
        maxHeight="70dvh"
        stickyHeader
      />
    </div>
  );
}
