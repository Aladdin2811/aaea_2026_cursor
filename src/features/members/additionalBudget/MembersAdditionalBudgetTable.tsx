import { useMemo, type ReactNode } from "react";
import type { AdditionalBudgetWithRelations } from "../../../api/apiAdditionalBudget";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import { downloadUtf8Csv, printRtlTable } from "../../../lib/tableExport";
import {
  firstRelation,
  formatNumeric,
  textOrDash,
  toNumberOrNull,
} from "../../../lib/tableUtils";
import { useFetchAdditionalBudget } from "./useMembersAdditionalBudget";

const ADDITIONAL_BUDGET_EXPORT_HEADERS = [
  "الدولة العضو",
  "السنة",
  "الموازنة الإضافية",
  "حالة السنة",
] as const;

function exportAdditionalBudgetToExcelCsv(
  rows: AdditionalBudgetWithRelations[],
): void {
  downloadUtf8Csv(
    "members_additional_budget.csv",
    [...ADDITIONAL_BUDGET_EXPORT_HEADERS],
    rows.map((row) => [
      textOrDash(firstRelation(row.members)?.member_name),
      textOrDash(firstRelation(row.years)?.year_num),
      formatNumeric(row.additional_budget_amount),
      firstRelation(row.years)?.status ? "نشطة" : "غير نشطة",
    ]),
  );
}

function printAdditionalBudgetTable(
  rows: AdditionalBudgetWithRelations[],
): void {
  printRtlTable({
    documentTitle: "طباعة الموازنة الإضافية",
    caption: "جدول الموازنة الإضافية المعتمدة",
    headers: ["#", ...ADDITIONAL_BUDGET_EXPORT_HEADERS],
    rows: rows.map((row, idx) => [
      String(idx + 1),
      textOrDash(firstRelation(row.members)?.member_name),
      textOrDash(firstRelation(row.years)?.year_num),
      formatNumeric(row.additional_budget_amount),
      firstRelation(row.years)?.status ? "نشطة" : "غير نشطة",
    ]),
  });
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
