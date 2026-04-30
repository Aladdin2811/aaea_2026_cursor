import { useMemo, type ReactNode } from "react";
import type { AdditionalBudgetPaymentWithRelations } from "../../../api/apiAdditionalBudgetPayment";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import { useFetchAdditionalBudgetPayment } from "./useAdditionalBudgetPayment";

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

function exportAdditionalBudgetPaymentToExcelCsv(
  rows: AdditionalBudgetPaymentWithRelations[],
): void {
  const headers = [
    "الدولة العضو",
    "حساب المنظمة",
    "الحساب الموحد",
    "رقم المستند",
    "تاريخ المستند",
  ];
  const lines = rows.map((row) => [
    textOrDash(firstRelation(row.members)?.member_name),
    formatNumeric(row.organization_account),
    formatNumeric(row.consolidated_account),
    row.document_num == null ? "—" : String(row.document_num),
    textOrDash(row.document_date),
  ]);

  const esc = (v: string) => `"${v.replaceAll('"', '""')}"`;
  const csv = [headers, ...lines].map((r) => r.map(esc).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "additional_budget_payment.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function printAdditionalBudgetPaymentTable(
  rows: AdditionalBudgetPaymentWithRelations[],
): void {
  const popup = window.open("", "_blank");
  if (popup == null) return;
  const headers = [
    "#",
    "الدولة العضو",
    "حساب المنظمة",
    "الحساب الموحد",
    "رقم المستند",
    "تاريخ المستند",
  ];
  const rowsHtml = rows
    .map((row, idx) => {
      const cells = [
        String(idx + 1),
        textOrDash(firstRelation(row.members)?.member_name),
        formatNumeric(row.organization_account),
        formatNumeric(row.consolidated_account),
        row.document_num == null ? "—" : String(row.document_num),
        textOrDash(row.document_date),
      ];
      return `<tr>${cells.map((c) => `<td>${c}</td>`).join("")}</tr>`;
    })
    .join("");

  popup.document.open();
  popup.document.write(
    `<!doctype html><html dir="rtl"><head><meta charset="utf-8"/><title>طباعة المسدد من الموازنة الإضافية</title><style>body{font-family:Tahoma,Arial,sans-serif;padding:16px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #cbd5e1;padding:6px 8px;text-align:center}th{background:#f1f5f9}caption{font-weight:700;margin-bottom:8px}</style></head><body><table><caption>جدول المسدد من الموازنة الإضافية</caption><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`,
  );
  popup.document.close();
  popup.onload = () => {
    popup.focus();
    popup.print();
  };
}

const columns: DataTableColumn<AdditionalBudgetPaymentWithRelations>[] = [
  {
    id: "member",
    header: "الدولة العضو",
    cell: (row) => (
      <span className="font-medium text-slate-900">
        {firstRelation(row.members)?.member_name ?? "—"}
      </span>
    ),
    getSortValue: (row) => firstRelation(row.members)?.member_name ?? "",
  },
  {
    id: "organization_account",
    header: "حساب المنظمة",
    cell: (row) => (
      <span
        className="block w-full text-right tabular-nums font-semibold text-slate-900"
        dir="ltr"
      >
        {formatNumeric(row.organization_account)}
      </span>
    ),
    getSortValue: (row) => toNumberOrNull(row.organization_account) ?? -Infinity,
    contentAlign: "start",
  },
  {
    id: "consolidated_account",
    header: "الحساب الموحد",
    cell: (row) => (
      <span
        className="block w-full text-right tabular-nums font-semibold text-slate-900"
        dir="ltr"
      >
        {formatNumeric(row.consolidated_account)}
      </span>
    ),
    getSortValue: (row) => toNumberOrNull(row.consolidated_account) ?? -Infinity,
    contentAlign: "start",
  },
  {
    id: "document_num",
    header: "رقم المستند",
    cell: (row) => (
      <span className="tabular-nums text-slate-800">{row.document_num ?? "—"}</span>
    ),
    getSortValue: (row) => row.document_num ?? -Infinity,
    contentAlign: "center",
  },
  {
    id: "document_date",
    header: "تاريخ المستند",
    cell: (row) => <span className="text-slate-700">{row.document_date ?? "—"}</span>,
    getSortValue: (row) => row.document_date ?? "",
    contentAlign: "center",
  },
];

function ToolbarActions({
  n,
  rows,
}: {
  n: number;
  rows: AdditionalBudgetPaymentWithRelations[];
}): ReactNode {
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-2">
      <p className="text-sm text-slate-600">
        عدد السجلات: <span className="font-medium tabular-nums text-slate-800">{n}</span>
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => printAdditionalBudgetPaymentTable(rows)}
          disabled={rows.length === 0}
        >
          طباعة
        </button>
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => exportAdditionalBudgetPaymentToExcelCsv(rows)}
          disabled={rows.length === 0}
        >
          تصدير Excel
        </button>
      </div>
    </div>
  );
}

export default function AdditionalBudgetPaymentTable() {
  const { isLoading, data, error, isError } = useFetchAdditionalBudgetPayment();
  const rows = useMemo(() => data ?? [], [data]);

  if (isError) {
    return (
      <p dir="rtl" className="text-destructive" role="alert">
        {error instanceof Error
          ? error.message
          : "حدث خطأ أثناء تحميل بيانات المسدد من الموازنة الإضافية"}
      </p>
    );
  }

  return (
    <div className="space-y-2" dir="rtl">
      <DataTable<AdditionalBudgetPaymentWithRelations>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل بيانات المسدد من الموازنة الإضافية…"
        emptyMessage="لا توجد بيانات للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={<ToolbarActions n={rows.length} rows={rows} />}
        caption="جدول المسدد من الموازنة الإضافية"
        density="comfortable"
        minTableWidth="100%"
        maxHeight="70dvh"
        stickyHeader
      />
    </div>
  );
}
