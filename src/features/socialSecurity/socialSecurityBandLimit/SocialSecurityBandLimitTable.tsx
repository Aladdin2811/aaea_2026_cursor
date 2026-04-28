import { useMemo, type ReactNode } from "react";
import { type SocialSecurityBandLimitWithRelations } from "../../../api/apiSocialSecurityBandLimit";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import DecimalConverter from "../../../utils/DecimalConverter";
import { useFetchSocialSecurityCurrencyRate } from "../socialSecurityCurrencyRate/useSocialSecurityCurrencyRate";
import { useFetchSocialSecurityBandLimit } from "./useSocialSecurityBandLimit";

function relationItem<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function amountDecimalPlacesByCurrencyName(
  currencyName: string | null | undefined,
): number {
  const normalized = (currencyName ?? "").trim();
  if (normalized.includes("دينار")) return 3;
  if (normalized.includes("جنيه")) return 2;
  return 2;
}

function parseNumericValue(
  value: string | number | null | undefined,
): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "string" ? Number.parseFloat(value) : value;
  return Number.isFinite(n) ? n : null;
}

function formatPercent(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${value}%`;
}

function tndLimitValue(
  row: SocialSecurityBandLimitWithRelations,
  currencyRate: number | null,
): number | null {
  const amount = parseNumericValue(row.social_security_band_limit);
  if (amount == null) return null;

  const currencyName =
    relationItem(row.social_security_currency)?.social_security_currency_name ??
    "";
  if (currencyName.includes("جنيه")) {
    if (currencyRate == null || currencyRate <= 0) return null;
    return amount / currencyRate;
  }
  if (currencyName.includes("دينار")) return amount;
  return amount;
}

function textOrDash(value: string | null | undefined): string {
  const v = (value ?? "").trim();
  return v === "" ? "—" : v;
}

function exportBandLimitToExcelCsv(
  rows: SocialSecurityBandLimitWithRelations[],
  currencyRate: number | null,
): void {
  const headers = [
    "البند",
    "الفئة",
    "الحالة الإجتماعية",
    "التصنيف",
    "نسبة التعويض",
    "سقف التعويض (د.ت)",
    "ملاحظات",
  ];

  const lines = rows.map((row) => {
    const classification = relationItem(row.social_security_classification);
    const classificationName = classification?.social_security_classification_name;
    const classificationLabel =
      classificationName != null && classificationName.trim() !== ""
        ? classificationName
        : row.social_security_classification_id != null
          ? `تصنيف #${row.social_security_classification_id}`
          : "—";

    const percent =
      row.social_security_band_percentage == null
        ? "—"
        : `${row.social_security_band_percentage}%`;

    const tnd = tndLimitValue(row, currencyRate);
    const tndLabel =
      tnd == null
        ? "—"
        : tnd.toLocaleString("en-US", {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
          });

    return [
      textOrDash(relationItem(row.social_security_band)?.social_security_band_name),
      textOrDash(
        relationItem(row.social_security_category)?.social_security_category_name,
      ),
      textOrDash(
        relationItem(row.social_security_situations)?.social_security_situation_name,
      ),
      classificationLabel,
      percent,
      tndLabel,
      textOrDash(row.social_security_notes),
    ];
  });

  const esc = (v: string) => `"${v.replaceAll('"', '""')}"`;
  const csv = [headers, ...lines].map((r) => r.map(esc).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "social_security_band_limit.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function printBandLimitTable(
  rows: SocialSecurityBandLimitWithRelations[],
  currencyRate: number | null,
): void {
  const popup = window.open("", "_blank");
  if (popup == null) return;

  const headers = [
    "#",
    "البند",
    "الفئة",
    "الحالة الإجتماعية",
    "التصنيف",
    "نسبة التعويض",
    "سقف التعويض (د.ت)",
    "ملاحظات",
  ];

  const rowsHtml = rows
    .map((row, idx) => {
      const classification = relationItem(row.social_security_classification);
      const classificationName = classification?.social_security_classification_name;
      const classificationLabel =
        classificationName != null && classificationName.trim() !== ""
          ? classificationName
          : row.social_security_classification_id != null
            ? `تصنيف #${row.social_security_classification_id}`
            : "—";
      const percent =
        row.social_security_band_percentage == null
          ? "—"
          : `${row.social_security_band_percentage}%`;
      const tnd = tndLimitValue(row, currencyRate);
      const tndLabel =
        tnd == null
          ? "—"
          : tnd.toLocaleString("en-US", {
              minimumFractionDigits: 3,
              maximumFractionDigits: 3,
            });
      const cells = [
        String(idx + 1),
        textOrDash(relationItem(row.social_security_band)?.social_security_band_name),
        textOrDash(
          relationItem(row.social_security_category)?.social_security_category_name,
        ),
        textOrDash(
          relationItem(row.social_security_situations)?.social_security_situation_name,
        ),
        classificationLabel,
        percent,
        tndLabel,
        textOrDash(row.social_security_notes),
      ];
      return `<tr>${cells.map((c) => `<td>${c}</td>`).join("")}</tr>`;
    })
    .join("");

  popup.document.open();
  popup.document.write(`<!doctype html><html dir="rtl"><head><meta charset="utf-8"/><title>طباعة أسقف بنود الضمان الاجتماعي</title><style>body{font-family:Tahoma,Arial,sans-serif;padding:16px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #cbd5e1;padding:6px 8px;text-align:center}th{background:#f1f5f9}caption{font-weight:700;margin-bottom:8px}</style></head><body><table><caption>جدول أسقف بنود الضمان الاجتماعي</caption><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`);
  popup.document.close();
  popup.onload = () => {
    popup.focus();
    popup.print();
  };
}

function buildColumns(
  currencyRate: number | null,
): DataTableColumn<SocialSecurityBandLimitWithRelations>[] {
  return [
    {
      id: "band",
      header: "البند",
      className: "min-w-60",
      thClassName: "!whitespace-normal",
      cell: (row) => (
        <span className="block min-w-0 font-medium text-slate-900">
          {formatOptionalText(
            relationItem(row.social_security_band)?.social_security_band_name,
          )}
        </span>
      ),
      getSortValue: (r) =>
        stringValue(
          relationItem(r.social_security_band)?.social_security_band_name,
        ),
    },
    {
      id: "category",
      header: "الفئة",
      className: "min-w-30",
      thClassName: "!whitespace-normal",
      cell: (row) => (
        <span className="block min-w-0 text-slate-700">
          {formatOptionalText(
            relationItem(row.social_security_category)
              ?.social_security_category_name,
          )}
        </span>
      ),
      getSortValue: (r) =>
        stringValue(
          relationItem(r.social_security_category)
            ?.social_security_category_name,
        ),
    },
    // {
    //   id: "currency",
    //   header: "العملة",
    //   className: "min-w-30",
    //   thClassName: "!whitespace-normal",
    //   cell: (row) => (
    //     <span className="block min-w-0 text-slate-700">
    //       {formatOptionalText(
    //         relationItem(row.social_security_currency)
    //           ?.social_security_currency_name,
    //       )}
    //     </span>
    //   ),
    //   getSortValue: (r) =>
    //     stringValue(
    //       relationItem(r.social_security_currency)
    //         ?.social_security_currency_name,
    //     ),
    // },
    {
      id: "situation",
      header: "الحالة الإجتماعية",
      className: "min-w-44",
      thClassName: "!whitespace-normal",
      cell: (row) => (
        <span className="block min-w-0 text-slate-700">
          {formatOptionalText(
            relationItem(row.social_security_situations)
              ?.social_security_situation_name,
          )}
        </span>
      ),
      getSortValue: (r) =>
        stringValue(
          relationItem(r.social_security_situations)
            ?.social_security_situation_name,
        ),
    },
    {
      id: "classification",
      header: "التصنيف",
      className: "min-w-30",
      thClassName: "!whitespace-normal",
      cell: (row) => {
        const classification = relationItem(row.social_security_classification);
        const classificationName =
          classification?.social_security_classification_name;
        const fallback =
          row.social_security_classification_id != null
            ? `تصنيف #${row.social_security_classification_id}`
            : "—";
        return (
          <span className="block min-w-0 text-slate-700">
            {classificationName != null &&
            String(classificationName).trim() !== ""
              ? classificationName
              : fallback}
          </span>
        );
      },
      getSortValue: (r) =>
        stringValue(
          relationItem(r.social_security_classification)
            ?.social_security_classification_name,
        ),
    },
    // {
    //   id: "limit",
    //   header: "سقف المبلغ",
    //   className: "min-w-36",
    //   thClassName: "!whitespace-normal text-center",
    //   cell: (row) => {
    //     const currencyName = relationItem(row.social_security_currency)
    //       ?.social_security_currency_name;
    //     const decimalPlaces = amountDecimalPlacesByCurrencyName(currencyName);
    //     return (
    //       <DecimalConverter
    //         number={row.social_security_band_limit}
    //         decimalPlaces={decimalPlaces}
    //         className="block text-center font-medium tabular-nums text-slate-900"
    //       />
    //     );
    //   },
    //   getSortValue: (r) => stringValue(r.social_security_band_limit),
    //   contentAlign: "center",
    // },
    {
      id: "band_percentage",
      header: "نسبة التعويض",
      className: "min-w-32",
      thClassName: "!whitespace-normal text-center",
      cell: (row) => (
        <span className="block text-center font-medium tabular-nums text-slate-900">
          {formatPercent(row.social_security_band_percentage)}
        </span>
      ),
      getSortValue: (r) => r.social_security_band_percentage ?? -Infinity,
      contentAlign: "center",
    },
    {
      id: "limit_tnd",
      header: "سقف التعويض (د.ت)",
      className: "min-w-40",
      thClassName: "!whitespace-normal text-center",
      cell: (row) => (
        <DecimalConverter
          number={tndLimitValue(row, currencyRate)}
          decimalPlaces={3}
          className="block text-center font-medium tabular-nums text-slate-900"
        />
      ),
      getSortValue: (r) => tndLimitValue(r, currencyRate) ?? -Infinity,
      contentAlign: "center",
    },
    {
      id: "notes",
      header: "ملاحظات",
      className: "min-w-56",
      thClassName: "!whitespace-normal",
      cell: (row) => (
        <span className="block min-w-0 text-slate-700">
          {formatOptionalText(row.social_security_notes)}
        </span>
      ),
      getSortValue: (r) => stringValue(r.social_security_notes),
    },
  ];
}

function ToolbarActions({
  n,
  rows,
  currencyRate,
}: {
  n: number;
  rows: SocialSecurityBandLimitWithRelations[];
  currencyRate: number | null;
}): ReactNode {
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-2">
      <p className="text-sm text-slate-600">
        عدد السجلات:{" "}
        <span className="font-medium tabular-nums text-slate-800">{n}</span>
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          onClick={() => printBandLimitTable(rows, currencyRate)}
        >
          طباعة
        </button>
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          onClick={() => exportBandLimitToExcelCsv(rows, currencyRate)}
        >
          تصدير Excel
        </button>
      </div>
    </div>
  );
}

export default function SocialSecurityBandLimitTable() {
  const { isLoading, data, error } = useFetchSocialSecurityBandLimit();
  const { data: currencyRates } = useFetchSocialSecurityCurrencyRate();
  const rows = useMemo(() => data ?? [], [data]);
  const currencyRate = useMemo(() => {
    const firstRate = currencyRates?.[0]?.currency_rate;
    const n = parseNumericValue(firstRate);
    return n != null && n > 0 ? n : null;
  }, [currencyRates]);
  const columns = useMemo(() => buildColumns(currencyRate), [currencyRate]);
  const isError = error != null;

  if (isError) {
    return (
      <p dir="rtl" className="text-destructive" role="alert">
        {error instanceof Error ? error.message : "حدث خطأ أثناء التحميل"}
      </p>
    );
  }

  return (
    <div className="space-y-2" dir="rtl">
      <DataTable<SocialSecurityBandLimitWithRelations>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل أسقف بنود الضمان الاجتماعي…"
        emptyMessage="لا توجد بيانات أسقف للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          !isLoading && rows.length > 0 ? (
            <ToolbarActions
              n={rows.length}
              rows={rows}
              currencyRate={currencyRate}
            />
          ) : null
        }
        caption="جدول أسقف بنود الضمان الاجتماعي"
        density="comfortable"
        minTableWidth="100%"
      />
    </div>
  );
}
