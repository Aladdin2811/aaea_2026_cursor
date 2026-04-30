import { type ReactNode } from "react";
import type { ApprovedBudgetsWithRelations } from "../../../../api/apiApprovedBudgets";
import {
  DataTable,
  type DataTableColumn,
} from "../../../../components/ui/data-table";
import { useFetchApprovedBudgets } from "./useApprovedBudgets";

function firstRelation<T>(value: T | T[] | null): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function toNumberOrNull(
  value: string | number | null | undefined,
): number | null {
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

function exportApprovedBudgetsToExcelCsv(
  rows: ApprovedBudgetsWithRelations[],
): void {
  const headers = ["السنة", "الموازنة المعتمدة", "ملاحظات", "حالة السنة"];
  const lines = rows.map((row) => [
    textOrDash(firstRelation(row.years)?.year_num),
    formatNumeric(row.approved_budget_amount),
    textOrDash(row.notes),
    firstRelation(row.years)?.status ? "نشطة" : "غير نشطة",
  ]);

  const esc = (v: string) => `"${v.replaceAll('"', '""')}"`;
  const csv = [headers, ...lines].map((r) => r.map(esc).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "approved_budgets.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function printApprovedBudgetsTable(rows: ApprovedBudgetsWithRelations[]): void {
  const popup = window.open("", "_blank");
  if (popup == null) return;
  const headers = ["#", "السنة", "الموازنة المعتمدة", "ملاحظات", "حالة السنة"];
  const rowsHtml = rows
    .map((row, idx) => {
      const cells = [
        String(idx + 1),
        textOrDash(firstRelation(row.years)?.year_num),
        formatNumeric(row.approved_budget_amount),
        textOrDash(row.notes),
        firstRelation(row.years)?.status ? "نشطة" : "غير نشطة",
      ];
      return `<tr>${cells.map((c) => `<td>${c}</td>`).join("")}</tr>`;
    })
    .join("");

  popup.document.open();
  popup.document.write(
    `<!doctype html><html dir="rtl"><head><meta charset="utf-8"/><title>طباعة الموازنات المعتمدة</title><style>body{font-family:Tahoma,Arial,sans-serif;padding:16px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #cbd5e1;padding:6px 8px;text-align:center}th{background:#f1f5f9}caption{font-weight:700;margin-bottom:8px}</style></head><body><table><caption>جدول الموازنات المعتمدة</caption><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`,
  );
  popup.document.close();
  popup.onload = () => {
    popup.focus();
    popup.print();
  };
}

const columns: DataTableColumn<ApprovedBudgetsWithRelations>[] = [
  {
    id: "year",
    header: "السنة",
    cell: (row) => (
      <span className="tabular-nums text-slate-800">
        {firstRelation(row.years)?.year_num ?? "—"}
      </span>
    ),
    getSortValue: (row) => firstRelation(row.years)?.year_num ?? "",
    contentAlign: "center",
  },
  {
    id: "amount",
    header: "الموازنة المعتمدة",
    cell: (row) => (
      <span
        className="block w-full text-right tabular-nums font-semibold text-slate-900"
        dir="ltr"
      >
        {formatNumeric(row.approved_budget_amount)}
      </span>
    ),
    getSortValue: (row) =>
      toNumberOrNull(row.approved_budget_amount) ?? -Infinity,
    contentAlign: "start",
  },
  {
    id: "notes",
    header: "ملاحظات",
    cell: (row) => <span className="text-slate-700">{row.notes || "—"}</span>,
    getSortValue: (row) => row.notes ?? "",
  },
  // {
  //   id: "year_status",
  //   header: "حالة السنة",
  //   cell: (row) => (
  //     <TableStatusBadge
  //       value={firstRelation(row.years)?.status ?? null}
  //       activeLabel="نشطة"
  //       inactiveLabel="غير نشطة"
  //     />
  //   ),
  //   getSortValue: (row) => (firstRelation(row.years)?.status ? 1 : 0),
  //   contentAlign: "center",
  // },
];

function Toolbar({
  n,
  rows,
}: {
  n: number;
  rows: ApprovedBudgetsWithRelations[];
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
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => printApprovedBudgetsTable(rows)}
          disabled={rows.length === 0}
        >
          طباعة
        </button>
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => exportApprovedBudgetsToExcelCsv(rows)}
          disabled={rows.length === 0}
        >
          تصدير Excel
        </button>
      </div>
    </div>
  );
}

export default function ApprovedBudgetsTable() {
  const { isLoading, data, error, isError } = useFetchApprovedBudgets();
  const rows = data ?? [];

  if (isError) {
    return (
      <p dir="rtl" className="text-destructive" role="alert">
        {error instanceof Error
          ? error.message
          : "حدث خطأ أثناء تحميل بيانات الموازنات المعتمدة"}
      </p>
    );
  }

  return (
    <div className="space-y-2" dir="rtl">
      <DataTable<ApprovedBudgetsWithRelations>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل بيانات الموازنات المعتمدة…"
        emptyMessage="لا توجد بيانات موازنات معتمدة للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={<Toolbar n={rows.length} rows={rows} />}
        caption="جدول الموازنات المعتمدة"
        density="comfortable"
        minTableWidth="100%"
        maxHeight="70dvh"
        stickyHeader
      />
    </div>
  );
}
