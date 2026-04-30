import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { BudgetsWithRelations } from "../../../../api/apiBudgets";
import { DataTable, type DataTableColumn } from "../../../../components/ui/data-table";
import { useBudgetBab } from "../../../accounts/bab/useBab";
import { useFetchCurrentYear } from "../../../years/currentYear/useCurrentYear";
import { useFetchActivYears } from "../../../years/year/useYears";
import { useFetchBudgets } from "./useBudgets";
import Select, { type GroupBase, type SingleValue, type StylesConfig } from "react-select";

function firstRelation<T>(value: T | T[] | null): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function toNumberOrNull(value: string | number | null | undefined): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "string" ? Number.parseFloat(value) : value;
  return Number.isFinite(n) ? n : null;
}

function formatNumeric(value: string | number | null | undefined): string {
  const n = toNumberOrNull(value);
  if (n == null || n === 0) return "—";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function textOrDash(value: string | null | undefined): string {
  const v = (value ?? "").trim();
  return v === "" ? "—" : v;
}

function exportBudgetsToExcelCsv(rows: BudgetsWithRelations[]): void {
  const headers = ["البند", "النوع", "الحساب التفصيلي", "الإعتماد"];
  const lines = rows.map((row) => [
    textOrDash(firstRelation(row.band)?.band_name),
    textOrDash(firstRelation(row.no3)?.no3_name),
    textOrDash(firstRelation(row.detailed)?.detailed_name),
    formatNumeric(row.budget_amount),
  ]);

  const esc = (v: string) => `"${v.replaceAll('"', '""')}"`;
  const csv = [headers, ...lines].map((r) => r.map(esc).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "budgets.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function printBudgetsTable(rows: BudgetsWithRelations[]): void {
  const popup = window.open("", "_blank");
  if (popup == null) return;
  const headers = [
    "#",
    "البند",
    "النوع",
    "الحساب التفصيلي",
    "الإعتماد",
  ];
  const rowsHtml = rows
    .map((row, idx) => {
      const cells = [
        String(idx + 1),
        textOrDash(firstRelation(row.band)?.band_name),
        textOrDash(firstRelation(row.no3)?.no3_name),
        textOrDash(firstRelation(row.detailed)?.detailed_name),
        formatNumeric(row.budget_amount),
      ];
      return `<tr>${cells.map((c) => `<td>${c}</td>`).join("")}</tr>`;
    })
    .join("");

  popup.document.open();
  popup.document.write(
    `<!doctype html><html dir="rtl"><head><meta charset="utf-8"/><title>طباعة الإعتمادات المدرجة</title><style>body{font-family:Tahoma,Arial,sans-serif;padding:16px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #cbd5e1;padding:6px 8px;text-align:center}th{background:#f1f5f9}caption{font-weight:700;margin-bottom:8px}</style></head><body><table><caption>جدول الإعتمادات المدرجة</caption><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`,
  );
  popup.document.close();
  popup.onload = () => {
    popup.focus();
    popup.print();
  };
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
      <span className="block w-full text-right tabular-nums font-semibold text-slate-900" dir="ltr">
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
}: {
  rows: BudgetsWithRelations[];
  n: number;
  selectedYearId: number | null;
  selectedBabId: number | null;
  onYearChange: (id: number | null) => void;
  onBabChange: (id: number | null) => void;
}): ReactNode {
  const { isLoading, data } = useFetchActivYears();
  const years = data ?? [];
  const { isLoading: babLoading, data: babData } = useBudgetBab();
  const babs = babData ?? [];
  const babOptions = useMemo<BabOption[]>(
    () =>
      babs.map((b) => ({
        value: b.id,
        label: b.bab_name && b.bab_name.trim() !== "" ? b.bab_name : `باب #${b.id}`,
      })),
    [babs],
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
          className="min-w-44 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 focus:border-slate-400 focus:outline-none"
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
              {y.year_num && y.year_num.trim() !== "" ? y.year_num : `سنة #${y.id}`}
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
          menuPortalTarget={typeof document !== "undefined" ? document.body : null}
          styles={babSelectStyles}
        />
      </div>

      <p className="text-sm text-slate-600">
        عدد السجلات: <span className="font-medium tabular-nums text-slate-800">{n}</span>
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => printBudgetsTable(rows)}
          disabled={rows.length === 0}
        >
          طباعة
        </button>
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const [selectedBabId, setSelectedBabId] = useState<number | null>(null);
  const { data: currentYearData } = useFetchCurrentYear();
  const { data: babData } = useBudgetBab();

  useEffect(() => {
    if (selectedYearId != null) return;
    const currentYearId = currentYearData?.year_id ?? null;
    if (currentYearId != null) setSelectedYearId(currentYearId);
  }, [selectedYearId, currentYearData?.year_id]);

  const filters = useMemo(
    () =>
      selectedYearId == null || selectedBabId == null
        ? undefined
        : { year_id: selectedYearId, bab_id: selectedBabId },
    [selectedBabId, selectedYearId],
  );
  const readyToFetch = selectedYearId != null && selectedBabId != null;
  const { isLoading, data, error, isError } = useFetchBudgets(filters, {
    enabled: readyToFetch,
  });
  const rows = data ?? [];
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
        {error instanceof Error ? error.message : "حدث خطأ أثناء تحميل بيانات الإعتمادات المدرجة"}
      </p>
    );
  }

  return (
    <div className="space-y-2" dir="rtl">
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
            selectedYearId={selectedYearId}
            selectedBabId={selectedBabId}
            onYearChange={setSelectedYearId}
            onBabChange={setSelectedBabId}
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
