import { type ReactNode } from "react";
import type { ApprovedBudgetsWithRelations } from "../../../../api/apiApprovedBudgets";
import {
  DataTable,
  type DataTableColumn,
} from "../../../../components/ui/data-table";
import { downloadXlsxFromMatrix, printRtlTable } from "../../../../lib/tableExport";
import {
  firstRelation,
  formatNumeric,
  textOrDash,
  toNumberOrNull,
} from "../../../../lib/tableUtils";
import { useFetchApprovedBudgets } from "./useApprovedBudgets";

const APPROVED_BUDGETS_EXPORT_HEADERS = [
  "السنة",
  "الموازنة المعتمدة",
  "ملاحظات",
  "حالة السنة",
] as const;

function exportApprovedBudgetsToXlsx(
  rows: ApprovedBudgetsWithRelations[],
): void {
  downloadXlsxFromMatrix({
    filename: "approved_budgets.xlsx",
    sheetName: "الموازنات المعتمدة",
    headers: [...APPROVED_BUDGETS_EXPORT_HEADERS],
    rows: rows.map((row) => [
      textOrDash(firstRelation(row.years)?.year_num),
      formatNumeric(row.approved_budget_amount),
      textOrDash(row.notes),
      firstRelation(row.years)?.status ? "نشطة" : "غير نشطة",
    ]),
  });
}

function printApprovedBudgetsTable(rows: ApprovedBudgetsWithRelations[]): void {
  printRtlTable({
    documentTitle: "طباعة الموازنات المعتمدة",
    caption: "جدول الموازنات المعتمدة",
    headers: ["#", ...APPROVED_BUDGETS_EXPORT_HEADERS],
    rows: rows.map((row, idx) => [
      String(idx + 1),
      textOrDash(firstRelation(row.years)?.year_num),
      formatNumeric(row.approved_budget_amount),
      textOrDash(row.notes),
      firstRelation(row.years)?.status ? "نشطة" : "غير نشطة",
    ]),
  });
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
          onClick={() => exportApprovedBudgetsToXlsx(rows)}
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
