import { useMemo, type ReactNode } from "react";
import type { AdditionalBudgetWithRelations } from "../../../api/apiAdditionalBudget";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import { useFetchAdditionalBudget } from "./useMembersAdditionalBudget";

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

function exportAdditionalBudgetToExcelCsv(
  rows: AdditionalBudgetWithRelations[],
): void {
  const headers = ["الدولة العضو", "السنة", "الموازنة الإضافية", "حالة السنة"];
  const lines = rows.map((row) => [
    textOrDash(firstRelation(row.members)?.member_name),
    textOrDash(firstRelation(row.years)?.year_num),
    formatNumeric(row.additional_budget_amount),
    firstRelation(row.years)?.status ? "نشطة" : "غير نشطة",
  ]);

  const esc = (v: string) => `"${v.replaceAll('"', '""')}"`;
  const csv = [headers, ...lines].map((r) => r.map(esc).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "members_additional_budget.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function printAdditionalBudgetTable(
  rows: AdditionalBudgetWithRelations[],
): void {
  const popup = window.open("", "_blank");
  if (popup == null) return;
  const headers = [
    "#",
    "الدولة العضو",
    "السنة",
    "الموازنة الإضافية",
    "حالة السنة",
  ];
  const rowsHtml = rows
    .map((row, idx) => {
      const cells = [
        String(idx + 1),
        textOrDash(firstRelation(row.members)?.member_name),
        textOrDash(firstRelation(row.years)?.year_num),
        formatNumeric(row.additional_budget_amount),
        firstRelation(row.years)?.status ? "نشطة" : "غير نشطة",
      ];
      return `<tr>${cells.map((c) => `<td>${c}</td>`).join("")}</tr>`;
    })
    .join("");

  popup.document.open();
  popup.document.write(
    `<!doctype html><html dir="rtl"><head><meta charset="utf-8"/><title>طباعة الموازنة الإضافية</title><style>body{font-family:Tahoma,Arial,sans-serif;padding:16px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #cbd5e1;padding:6px 8px;text-align:center}th{background:#f1f5f9}caption{font-weight:700;margin-bottom:8px}</style></head><body><table><caption>جدول الموازنة الإضافية المعتمدة</caption><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`,
  );
  popup.document.close();
  popup.onload = () => {
    popup.focus();
    popup.print();
  };
}

const columns: DataTableColumn<AdditionalBudgetWithRelations>[] = [
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
  // {
  //   id: "year",
  //   header: "السنة",
  //   cell: (row) => (
  //     <span className="tabular-nums text-slate-800">
  //       {firstRelation(row.years)?.year_num ?? "—"}
  //     </span>
  //   ),
  //   getSortValue: (row) => firstRelation(row.years)?.year_num ?? "",
  //   contentAlign: "center",
  // },
  {
    id: "amount",
    header: "الموازنة الإضافية",
    cell: (row) => (
      <span
        className="block w-full text-right tabular-nums font-semibold text-slate-900"
        dir="ltr"
      >
        {formatNumeric(row.additional_budget_amount)}
      </span>
    ),
    getSortValue: (row) =>
      toNumberOrNull(row.additional_budget_amount) ?? -Infinity,
    contentAlign: "start",
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

function ToolbarActions({
  n,
  rows,
}: {
  n: number;
  rows: AdditionalBudgetWithRelations[];
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
          onClick={() => printAdditionalBudgetTable(rows)}
          disabled={rows.length === 0}
        >
          طباعة
        </button>
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => exportAdditionalBudgetToExcelCsv(rows)}
          disabled={rows.length === 0}
        >
          تصدير Excel
        </button>
      </div>
    </div>
  );
}

export default function MembersAdditionalBudgetTable() {
  const { isLoading, data, error, isError } = useFetchAdditionalBudget();
  const rows = useMemo(() => data ?? [], [data]);
  const totalAdditionalBudget = useMemo(
    () =>
      rows.reduce((sum, row) => {
        const n = toNumberOrNull(row.additional_budget_amount);
        return sum + (n ?? 0);
      }, 0),
    [rows],
  );

  if (isError) {
    return (
      <p dir="rtl" className="text-destructive" role="alert">
        {error instanceof Error
          ? error.message
          : "حدث خطأ أثناء تحميل بيانات الموازنة الإضافية"}
      </p>
    );
  }

  return (
    <div className="space-y-2" dir="rtl">
      <DataTable<AdditionalBudgetWithRelations>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل بيانات الموازنة الإضافية المعتمدة…"
        emptyMessage="لا توجد بيانات موازنة إضافية للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={<ToolbarActions n={rows.length} rows={rows} />}
        footer={
          <div className="flex items-center justify-end">
            <p className="text-sm font-semibold text-slate-800">
              إجمالي الموازنة الإضافية:{" "}
              <span className="tabular-nums" dir="ltr">
                {totalAdditionalBudget.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </p>
          </div>
        }
        caption="جدول الموازنة الإضافية المعتمدة"
        density="comfortable"
        minTableWidth="100%"
        maxHeight="70dvh"
        stickyHeader
      />
    </div>
  );
}
